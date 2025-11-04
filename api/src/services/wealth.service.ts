import { wealthRepository } from '@repositories/wealth.repository';
import { communityMemberRepository } from '@repositories/communityMember.repository';
import { appUserRepository } from '@repositories/appUser.repository';
import { AppError } from '@utils/errors';
import { openFGAService } from './openfga.service';
import { WealthRecord, WealthRequestRecord, WealthSearchFilters } from '@repositories/wealth.repository';

export type CreateWealthDto = {
  communityId: string;
  itemId: string;
  title: string;
  description?: string | null;
  image?: string | null;
  durationType: 'timebound' | 'unlimited';
  endDate?: string | Date | null;
  distributionType: 'request_based' | 'unit_based';
  unitsAvailable?: number | null;
  maxUnitsPerUser?: number | null;
  automationEnabled?: boolean;
};

export type UpdateWealthDto = Partial<Pick<CreateWealthDto, 'title' | 'description' | 'image' | 'endDate' | 'unitsAvailable' | 'maxUnitsPerUser' | 'automationEnabled'>> & {
  status?: 'active' | 'fulfilled' | 'expired' | 'cancelled';
};

export type WealthSearchParams = {
  q?: string;
  communityId?: string;
  durationType?: 'timebound' | 'unlimited';
  endDateAfter?: string | Date;
  endDateBefore?: string | Date;
  distributionType?: 'request_based' | 'unit_based';
  status?: 'active' | 'fulfilled' | 'expired' | 'cancelled';
  page?: number;
  limit?: number;
};

function escapeRegex(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlightMarkdown(text: string | null | undefined, query: string): string | null {
  if (!text) return text ?? null;
  const terms = query
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean);
  if (terms.length === 0) return text;
  const pattern = terms.map(escapeRegex).join('|');
  const regex = new RegExp(`(${pattern})`, 'gi');
  // Replace matches with **match**; avoid double-highlighting by not reprocessing inserted asterisks
  return text.replace(regex, (m) => `**${m}**`);
}

export class WealthService {
  private async ensureCommunityMemberOrAdmin(communityId: string, userId: string) {
    const role = await communityMemberRepository.getUserRole(communityId, userId);
    if (!role || (role !== 'admin' && role !== 'member')) {
      throw new AppError('Forbidden: only community members/admins can perform this action', 403);
    }
    return role;
  }

  private ensureOwner(wealth: WealthRecord, userId: string) {
    if (wealth.createdBy !== userId) {
      throw new AppError('Forbidden: only the wealth owner can perform this action', 403);
    }
  }

  async createWealth(dto: CreateWealthDto, userId: string): Promise<WealthRecord> {
    // Members/Admins of the community can create a wealth
    await this.ensureCommunityMemberOrAdmin(dto.communityId, userId);

    // Validation
    if (dto.durationType === 'timebound' && !dto.endDate) {
      throw new AppError('endDate is required for timebound wealth', 400);
    }
    if (dto.distributionType === 'unit_based') {
      if (dto.unitsAvailable == null || dto.unitsAvailable <= 0) {
        throw new AppError('unitsAvailable must be a positive integer for unit_based wealth', 400);
      }
    }

    const wealthItem = await wealthRepository.createWealth({
      createdBy: userId,
      communityId: dto.communityId,
      itemId: dto.itemId,
      title: dto.title,
      description: dto.description ?? null,
      image: dto.image ?? null,
      durationType: dto.durationType,
      endDate: dto.endDate ? new Date(dto.endDate) : null,
      distributionType: dto.distributionType,
      unitsAvailable: dto.unitsAvailable ?? null,
      maxUnitsPerUser: dto.maxUnitsPerUser ?? null,
      automationEnabled: dto.automationEnabled ?? false,
      status: 'active',
    });

    // Assign creator a per-resource role on this wealth (so we can use OpenFGA if needed)
    try {
      await openFGAService.assignRole(userId, 'wealth', wealthItem.id, 'admin');
    } catch {
      // non-fatal
    }

    // Create parent_community relationship in OpenFGA for hierarchical permissions
    try {
      await openFGAService.createRelationship('wealth', wealthItem.id, 'parent_community', 'communities', dto.communityId);
    } catch (error) {
      console.error('Failed to create wealth->community relationship in OpenFGA:', error);
      // non-fatal
    }

    return wealthItem;
  }

  async getWealth(id: string, userId: string): Promise<WealthRecord> {
    const wealthItem = await wealthRepository.findById(id);
    if (!wealthItem) throw new AppError('Wealth not found', 404);

    // Only community members/admins can view wealth
    await this.ensureCommunityMemberOrAdmin(wealthItem.communityId, userId);

    return wealthItem;
  }

  async listCommunityWealth(communityId: string, userId: string, status?: 'active' | 'fulfilled' | 'expired' | 'cancelled'): Promise<WealthRecord[]> {
    await this.ensureCommunityMemberOrAdmin(communityId, userId);
    return await wealthRepository.listByCommunity(communityId, status);
  }

  async listMyCommunitiesWealth(userId: string, status?: 'active' | 'fulfilled' | 'expired' | 'cancelled'): Promise<WealthRecord[]> {
    const memberships = await communityMemberRepository.findByUser(userId);
    const communityIds = memberships.map((m) => m.resourceId);
    if (communityIds.length === 0) return [];
    return await wealthRepository.listByCommunities(communityIds, status);
  }

  async searchWealth(
    userId: string,
    params: WealthSearchParams
  ): Promise<{
    items: (WealthRecord & { highlightedTitle?: string; highlightedDescription?: string })[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  }> {
    // Determine scope: either a specific community (require membership) or all my communities
    let scopedCommunityIds: string[] = [];
    if (params.communityId) {
      await this.ensureCommunityMemberOrAdmin(params.communityId, userId);
      scopedCommunityIds = [params.communityId];
    } else {
      const memberships = await communityMemberRepository.findByUser(userId);
      scopedCommunityIds = memberships.map((m) => m.resourceId);
      if (scopedCommunityIds.length === 0) {
        return { items: [], total: 0, page: params.page ?? 1, limit: params.limit ?? 20, hasMore: false };
      }
    }

    const page = Math.max(1, params.page ?? 1);
    const limit = Math.max(1, Math.min(params.limit ?? 20, 100));
    const offset = (page - 1) * limit;

    const filters: WealthSearchFilters = {
      communityIds: scopedCommunityIds,
      communityId: params.communityId,
      q: params.q,
      durationType: params.durationType,
      distributionType: params.distributionType,
      status: params.status ?? 'active',
      endDateAfter: params.endDateAfter ? new Date(params.endDateAfter) : undefined,
      endDateBefore: params.endDateBefore ? new Date(params.endDateBefore) : undefined,
      limit,
      offset,
    };

    const result = await wealthRepository.search(filters);

    // Add markdown highlighting for query terms in title/description
    let items: (WealthRecord & { highlightedTitle?: string; highlightedDescription?: string })[];
    if (params.q && params.q.trim()) {
      const q = params.q as string;
      items = result.rows.map((r) => ({
        ...r,
        highlightedTitle: highlightMarkdown(r.title, q) || r.title,
        highlightedDescription: r.description ? highlightMarkdown(r.description, q) ?? r.description : undefined,
      }));
    } else {
      items = result.rows;
    }

    const hasMore = offset + items.length < result.total;

    return {
      items,
      total: result.total,
      page,
      limit,
      hasMore,
    };
  }

  async updateWealth(id: string, patch: UpdateWealthDto, userId: string): Promise<WealthRecord> {
    const wealthItem = await wealthRepository.findById(id);
    if (!wealthItem) throw new AppError('Wealth not found', 404);

    // Only owner can update
    this.ensureOwner(wealthItem, userId);

    if (patch.status && !['active', 'fulfilled', 'expired', 'cancelled'].includes(patch.status)) {
      throw new AppError('Invalid wealth status', 400);
    }
    if (patch.endDate) {
      const endDate = new Date(patch.endDate);
      if (Number.isNaN(endDate.getTime())) {
        throw new AppError('Invalid endDate', 400);
      }
    }

    const updated = await wealthRepository.updateWealth(id, {
      title: patch.title,
      description: patch.description,
      image: patch.image,
      endDate: patch.endDate ? new Date(patch.endDate) : undefined,
      unitsAvailable: patch.unitsAvailable,
      maxUnitsPerUser: patch.maxUnitsPerUser,
      automationEnabled: patch.automationEnabled,
      status: patch.status as any,
    });

    if (!updated) throw new AppError('Wealth not found', 404);
    return updated;
  }

  async cancelWealth(id: string, userId: string): Promise<WealthRecord> {
    const wealthItem = await wealthRepository.findById(id);
    if (!wealthItem) throw new AppError('Wealth not found', 404);

    // Only owner can cancel/delete
    this.ensureOwner(wealthItem, userId);

    const updated = await wealthRepository.cancelWealth(id);
    if (!updated) throw new AppError('Wealth not found', 404);
    return updated;
  }

  async fulfillWealth(id: string, userId: string): Promise<WealthRecord> {
    const wealthItem = await wealthRepository.findById(id);
    if (!wealthItem) throw new AppError('Wealth not found', 404);

    // Only owner can mark fulfilled
    this.ensureOwner(wealthItem, userId);

    const updated = await wealthRepository.markFulfilled(id);
    if (!updated) throw new AppError('Wealth not found', 404);
    return updated;
  }

  // Requests
  async requestWealth(wealthId: string, userId: string, message?: string | null, unitsRequested?: number | null): Promise<WealthRequestRecord> {
    const wealthItem = await wealthRepository.findById(wealthId);
    if (!wealthItem) throw new AppError('Wealth not found', 404);

    // Only members/admins can request
    await this.ensureCommunityMemberOrAdmin(wealthItem.communityId, userId);

    if (wealthItem.status !== 'active') {
      throw new AppError('Wealth is not active', 400);
    }

    if (wealthItem.distributionType === 'unit_based') {
      if (unitsRequested == null || unitsRequested <= 0) {
        throw new AppError('unitsRequested must be a positive integer for unit_based wealth', 400);
      }
      if ((wealthItem.unitsAvailable ?? 0) < unitsRequested) {
        throw new AppError('Not enough units available', 400);
      }
    }

    return await wealthRepository.createWealthRequest({
      wealthId,
      requesterId: userId,
      message: message ?? null,
      unitsRequested: unitsRequested ?? null,
    });
  }

  async listRequests(wealthId: string, userId: string): Promise<(WealthRequestRecord & { requesterDisplayName?: string })[]> {
    const wealthItem = await wealthRepository.findById(wealthId);
    if (!wealthItem) throw new AppError('Wealth not found', 404);

    // Only members/admins can view requests list
    await this.ensureCommunityMemberOrAdmin(wealthItem.communityId, userId);

    let requests: WealthRequestRecord[];
    // If owner, return all requests. Otherwise, return only the requests created by the requester.
    if (wealthItem.createdBy === userId) {
      requests = await wealthRepository.listRequestsForWealth(wealthId);
    } else {
      requests = await wealthRepository.listRequestsForWealthByRequester(wealthId, userId);
    }

    // Fetch requester details for each request
    const requesterIds = [...new Set(requests.map(r => r.requesterId))];
    const userDetailsMap = new Map<string, { displayName?: string }>();
    for (const id of requesterIds) {
      const user = await appUserRepository.findById(id);
      if (user) {
        const displayName: string | undefined = user.displayName ?? user.username ?? undefined;
        userDetailsMap.set(id, { displayName });
      }
    }

    return requests.map(r => ({
      ...r,
      shareId: r.wealthId,  // Map wealthId to shareId for frontend compatibility
      requesterDisplayName: userDetailsMap.get(r.requesterId)?.displayName,
    }));
  }

  async acceptRequest(wealthId: string, requestId: string, userId: string): Promise<{ wealth: WealthRecord; request: WealthRequestRecord }> {
    const wealthItem = await wealthRepository.findById(wealthId);
    if (!wealthItem) throw new AppError('Wealth not found', 404);

    // Only owner can accept
    this.ensureOwner(wealthItem, userId);

    const req = await wealthRepository.findRequestById(requestId);
    if (!req || req.wealthId !== wealthId) {
      throw new AppError('Request not found for this wealth', 404);
    }
    if (req.status !== 'pending') {
      throw new AppError('Only pending requests can be accepted', 400);
    }

    let updatedWealth = wealthItem;
    // If unit-based, decrement units using requested value or 1
    if (wealthItem.distributionType === 'unit_based') {
      const units = req.unitsRequested ?? 1;
      const dec = await wealthRepository.decrementUnits(wealthItem.id, units);
      if (!dec) throw new AppError('Failed to update wealth units', 500);
      updatedWealth = dec;
    }

    const updatedReq = await wealthRepository.acceptRequest(requestId);
    if (!updatedReq) throw new AppError('Failed to accept request', 500);

    return {
      wealth: updatedWealth,
      request: {
        ...updatedReq,
      }
    };
  }

  async fulfillRequest(wealthId: string, requestId: string, userId: string): Promise<WealthRequestRecord> {
    const wealthItem = await wealthRepository.findById(wealthId);
    if (!wealthItem) throw new AppError('Wealth not found', 404);

    // Only owner can mark a specific request fulfilled
    this.ensureOwner(wealthItem, userId);

    const req = await wealthRepository.findRequestById(requestId);
    if (!req || req.wealthId !== wealthId) {
      throw new AppError('Request not found for this wealth', 404);
    }

    if (req.status !== 'accepted' && req.status !== 'pending') {
      throw new AppError('Only pending or accepted requests can be marked fulfilled', 400);
    }

    const updatedReq = await wealthRepository.markRequestFulfilled(requestId);
    if (!updatedReq) throw new AppError('Failed to update request', 500);

    return {
      ...updatedReq,
    };
  }

  async rejectRequest(wealthId: string, requestId: string, userId: string): Promise<WealthRequestRecord> {
    const wealthItem = await wealthRepository.findById(wealthId);
    if (!wealthItem) throw new AppError('Wealth not found', 404);

    // Only owner can reject
    this.ensureOwner(wealthItem, userId);

    const req = await wealthRepository.findRequestById(requestId);
    if (!req || req.wealthId !== wealthId) {
      throw new AppError('Request not found for this wealth', 404);
    }
    if (req.status !== 'pending') {
      throw new AppError('Only pending requests can be rejected', 400);
    }

    const updatedReq = await wealthRepository.rejectRequest(requestId);
    if (!updatedReq) throw new AppError('Failed to reject request', 500);
    return {
      ...updatedReq,
    };
  }

  async listRequestsByUser(
    userId: string,
    statuses?: Array<'pending' | 'accepted' | 'rejected' | 'cancelled' | 'fulfilled'>
  ): Promise<WealthRequestRecord[]> {
    // A user can view their own requests across all wealth; no further checks needed
    const requests = await wealthRepository.listRequestsByUser(userId, statuses as any);
    return requests.map(r => ({
      ...r,
    }));
  }

  async listIncomingRequests(
    userId: string,
    statuses?: Array<'pending' | 'accepted' | 'rejected' | 'cancelled' | 'fulfilled'>
  ): Promise<(WealthRequestRecord & { requesterDisplayName?: string; wealthTitle?: string })[]> {
    // Get all requests for wealth items owned by this user
    const requests = await wealthRepository.listIncomingRequestsByOwner(userId, statuses as any);

    // Fetch requester details and wealth details for each request
    const requesterIds = [...new Set(requests.map(r => r.requesterId))];
    const wealthIds = [...new Set(requests.map(r => r.wealthId))];

    const userDetailsMap = new Map<string, { displayName?: string }>();
    for (const id of requesterIds) {
      const user = await appUserRepository.findById(id);
      if (user) {
        const displayName: string | undefined = user.displayName ?? user.username ?? undefined;
        userDetailsMap.set(id, { displayName });
      }
    }

    const wealthDetailsMap = new Map<string, { title: string }>();
    for (const id of wealthIds) {
      const wealthItem = await wealthRepository.findById(id);
      if (wealthItem) {
        wealthDetailsMap.set(id, { title: wealthItem.title });
      }
    }

    return requests.map(r => ({
      ...r,
      requesterDisplayName: userDetailsMap.get(r.requesterId)?.displayName,
      wealthTitle: wealthDetailsMap.get(r.wealthId)?.title,
    }));
  }

  async cancelRequest(wealthId: string, requestId: string, userId: string): Promise<WealthRequestRecord> {
    const wealthItem = await wealthRepository.findById(wealthId);
    if (!wealthItem) throw new AppError('Wealth not found', 404);

    const req = await wealthRepository.findRequestById(requestId);
    if (!req || req.wealthId !== wealthId) {
      throw new AppError('Request not found for this wealth', 404);
    }
    // Requester can cancel their own request; owner can also cancel requests
    if (req.requesterId !== userId && wealthItem.createdBy !== userId) {
      throw new AppError('Forbidden: only requester or owner can cancel this request', 403);
    }
    if (req.status !== 'pending' && req.status !== 'accepted') {
      throw new AppError('Only pending or accepted requests can be cancelled', 400);
    }

    const updatedReq = await wealthRepository.cancelRequest(requestId);
    if (!updatedReq) throw new AppError('Failed to cancel request', 500);
    return {
      ...updatedReq,
    };
  }
}

export const wealthService = new WealthService();
