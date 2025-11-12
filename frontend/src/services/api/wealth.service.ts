import { apiClient } from './client';
import type {
  Wealth,
  WealthListItem,
  WealthStatus,
  CreateWealthDto,
  UpdateWealthDto,
  WealthRequest,
  WealthRequestStatus,
  CreateWealthRequestDto,
  SearchWealthParams,
  SearchWealthResponse,
} from '@/types/wealth.types';

class WealthService {
  private readonly basePath = '/api/v1/wealth';

  /**
   * List wealth items
   * - If communityId provided: lists wealth for that community (requires membership)
   * - Otherwise: lists wealth across communities the current user belongs to
   */
  async listWealth(params?: { communityId?: string; status?: WealthStatus }): Promise<WealthListItem[]> {
    const search = new URLSearchParams();
    if (params?.communityId) search.set('communityId', params.communityId);
    if (params?.status) search.set('status', params.status);
    const qs = search.toString();
    return apiClient.get(`${this.basePath}${qs ? `?${qs}` : ''}`);
  }

  /**
   * Search wealth with filters and pagination
   * GET /api/v1/wealth/search
   */
  async searchWealth(params: SearchWealthParams): Promise<SearchWealthResponse> {
    const search = new URLSearchParams();
    // q is required by API, default to empty string if not provided to broaden search
    search.set('q', params.q ?? '');
    if (params.communityId) search.set('communityId', params.communityId);
    if (params.durationType) search.set('durationType', params.durationType);
    if (params.distributionType) search.set('distributionType', params.distributionType);
    if (params.status) search.set('status', params.status);
    if (params.endDateAfter) search.set('endDateAfter', params.endDateAfter);
    if (params.endDateBefore) search.set('endDateBefore', params.endDateBefore);
    if (params.page != null) search.set('page', String(params.page));
    if (params.limit != null) search.set('limit', String(params.limit));

    const qs = search.toString();
    return apiClient.get(`${this.basePath}/search?${qs}`);
  }

  /** Create a new wealth item */
  async createWealth(dto: CreateWealthDto): Promise<Wealth> {
    return apiClient.post(this.basePath, dto);
  }

  /** Get wealth by ID */
  async getWealth(id: string): Promise<Wealth> {
    return apiClient.get(`${this.basePath}/${id}`);
  }

  /** Update a wealth item (owner only) */
  async updateWealth(id: string, dto: UpdateWealthDto): Promise<Wealth> {
    return apiClient.put(`${this.basePath}/${id}`, dto);
  }

  /** Cancel a wealth item (owner only) */
  async cancelWealth(id: string): Promise<Wealth> {
    return apiClient.post(`${this.basePath}/${id}/cancel`, {});
  }

  /** Mark wealth as fulfilled (owner only) */
  async fulfillWealth(id: string): Promise<Wealth> {
    return apiClient.post(`${this.basePath}/${id}/fulfill`, {});
  }

  /** Create a request for a wealth item (members/admins) */
  async requestWealth(id: string, dto: CreateWealthRequestDto): Promise<WealthRequest> {
    return apiClient.post(`${this.basePath}/${id}/request`, dto);
  }

  /** List requests for a wealth item (owner/admin as per backend rules) */
  async getWealthRequests(id: string): Promise<WealthRequest[]> {
    return apiClient.get(`${this.basePath}/${id}/requests`);
  }

  /** Accept a specific request (owner only) */
  async acceptRequest(wealthId: string, requestId: string): Promise<WealthRequest> {
    return apiClient.post(`${this.basePath}/${wealthId}/requests/${requestId}/accept`, {});
  }

  /** Reject a specific request (owner only) */
  async rejectRequest(wealthId: string, requestId: string): Promise<WealthRequest> {
    return apiClient.post(`${this.basePath}/${wealthId}/requests/${requestId}/reject`, {});
  }

  /** Cancel a request (requester or owner) */
  async cancelRequest(wealthId: string, requestId: string): Promise<WealthRequest> {
    return apiClient.post(`${this.basePath}/${wealthId}/requests/${requestId}/cancel`, {});
  }

  /** Confirm a request as fulfilled (requester only) */
  async confirmRequest(wealthId: string, requestId: string): Promise<WealthRequest> {
    return apiClient.post(`${this.basePath}/${wealthId}/requests/${requestId}/confirm`, {});
  }

  /** Mark a request as failed (requester only) */
  async failRequest(wealthId: string, requestId: string): Promise<WealthRequest> {
    return apiClient.post(`${this.basePath}/${wealthId}/requests/${requestId}/fail`, {});
  }

  /** Get current user's own requests across all communities */
  async getUserRequests(statuses?: WealthRequestStatus | WealthRequestStatus[]): Promise<WealthRequest[]> {
    const search = new URLSearchParams();
    if (statuses) {
      if (Array.isArray(statuses)) {
        statuses.forEach(s => search.append('statuses', s));
      } else {
        search.set('statuses', statuses);
      }
    }
    const qs = search.toString();
    return apiClient.get(`${this.basePath}/requests/me${qs ? `?${qs}` : ''}`);
  }

  /** Get incoming requests to current user's wealth items */
  async getIncomingRequests(statuses?: WealthRequestStatus | WealthRequestStatus[]): Promise<(WealthRequest & { requesterDisplayName?: string; wealthTitle?: string })[]> {
    const search = new URLSearchParams();
    if (statuses) {
      if (Array.isArray(statuses)) {
        statuses.forEach(s => search.append('statuses', s));
      } else {
        search.set('statuses', statuses);
      }
    }
    const qs = search.toString();
    return apiClient.get(`${this.basePath}/requests/incoming${qs ? `?${qs}` : ''}`);
  }

  // Comments

  /** List comments for a wealth item */
  async getComments(
    wealthId: string,
    params?: { limit?: number; offset?: number }
  ): Promise<import('@/types/wealth.types').WealthComment[]> {
    const search = new URLSearchParams();
    if (params?.limit != null) search.set('limit', String(params.limit));
    if (params?.offset != null) search.set('offset', String(params.offset));
    const qs = search.toString();
    return apiClient.get(`${this.basePath}/${wealthId}/comments${qs ? `?${qs}` : ''}`);
  }

  /** Create a comment on a wealth item */
  async createComment(
    wealthId: string,
    dto: import('@/types/wealth.types').CreateWealthCommentDto
  ): Promise<import('@/types/wealth.types').WealthComment> {
    // API returns { data: WealthComment, message: string } according to OpenAPI, but client unwraps by default
    return apiClient.post(`${this.basePath}/${wealthId}/comments`, dto);
  }

  /** Update a comment (author only) */
  async updateComment(
    wealthId: string,
    commentId: string,
    dto: import('@/types/wealth.types').UpdateWealthCommentDto
  ): Promise<import('@/types/wealth.types').WealthComment> {
    return apiClient.put(`${this.basePath}/${wealthId}/comments/${commentId}`, dto);
  }

  /** Delete a comment (author or wealth owner only) */
  async deleteComment(wealthId: string, commentId: string): Promise<void> {
    return apiClient.delete(`${this.basePath}/${wealthId}/comments/${commentId}`);
  }
}

export const wealthService = new WealthService();
