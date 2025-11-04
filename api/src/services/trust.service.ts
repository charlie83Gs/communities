import { AppError } from '../utils/errors';
import logger from '../utils/logger';
import { communityRepository } from '../repositories/community.repository';
import { communityMemberRepository } from '../repositories/communityMember.repository';
import { trustEventRepository } from '../repositories/trustEvent.repository';
import { trustViewRepository } from '../repositories/trustView.repository';
import { trustAwardRepository } from '../repositories/trustAward.repository';
import { adminTrustGrantRepository } from '../repositories/adminTrustGrant.repository';
import { trustHistoryRepository } from '../repositories/trustHistory.repository';
import { trustLevelRepository } from '../repositories/trustLevel.repository';
import { resolveTrustRequirement } from '../utils/trustResolver';

export type TrustMeResult = {
  trusted: boolean;
  points: number;
  roles: string[];
  canAwardTrust: boolean;
  canAccessWealth: boolean;
  canHandleDisputes: boolean;
  canCreatePolls: boolean;
};

export type TrustTimelineItem = {
  threshold: number;
  trustLevel: { name: string; id: string } | null;
  permissions: string[];
  unlocked: boolean;
};

export type TrustTimelineResult = {
  userTrustScore: number;
  timeline: TrustTimelineItem[];
};

export class TrustService {
  private async getUserPoints(communityId: string, userId: string): Promise<number> {
    const row = await trustViewRepository.get(communityId, userId);
    return row?.points ?? 0;
  }

  private async getUserRole(communityId: string, userId: string) {
    return communityMemberRepository.getUserRole(communityId, userId);
  }

  private async getUserRoles(communityId: string, userId: string): Promise<string[]> {
    return communityMemberRepository.getUserRoles(communityId, userId);
  }

  private async isAdmin(communityId: string, userId: string) {
    return communityMemberRepository.isAdmin(communityId, userId);
  }

  async isTrusted(communityId: string, userId: string): Promise<boolean> {
    const [role, points] = await Promise.all([
      this.getUserRole(communityId, userId),
      this.getUserPoints(communityId, userId),
    ]);

    // User is trusted if they are an admin OR have any trust points
    if (role === 'admin') return true;
    return points > 0;
  }

  // Events: for audit
  async getEventsForUser(communityId: string, requesterId: string, userId: string, page = 1, limit = 50) {
    // Only members can read; allow reading own or others if member (trust model is not secret)
    const role = await this.getUserRole(communityId, requesterId);
    if (!role) {
      throw new AppError('Forbidden: not a member of this community', 403);
    }
    const offset = (Math.max(1, page) - 1) * Math.max(1, Math.min(limit, 100));
    const [a, b] = await Promise.all([
      trustEventRepository.listByUser(communityId, userId, limit, offset),
      trustEventRepository.listByUserB(communityId, userId, limit, offset),
    ]);
    // merge and sort desc by createdAt
    const merged = [...a, ...b].sort((x: any, y: any) => new Date(y.createdAt).getTime() - new Date(x.createdAt).getTime());
    return merged.slice(0, limit);
  }

  // Trust view read-only
  async getTrustView(communityId: string, requesterId: string, userId: string) {
    const role = await this.getUserRole(communityId, requesterId);
    if (!role) {
      throw new AppError('Forbidden: not a member of this community', 403);
    }
    const view = await trustViewRepository.get(communityId, userId);
    return view ?? { communityId, userId, points: 0, updatedAt: new Date(), id: undefined as any };
  }

  async listCommunityTrust(communityId: string, requesterId: string, page = 1, limit = 50) {
    const role = await this.getUserRole(communityId, requesterId);
    if (!role) {
      throw new AppError('Forbidden: not a member of this community', 403);
    }
    const offset = (Math.max(1, page) - 1) * Math.max(1, Math.min(limit, 100));
    return trustViewRepository.listByCommunity(communityId, limit, offset);
  }

  async getTrustMe(communityId: string, userId: string): Promise<TrustMeResult> {
    const [roles, points, community] = await Promise.all([
      this.getUserRoles(communityId, userId),
      this.getUserPoints(communityId, userId),
      communityRepository.findById(communityId),
    ]);

    if (!community) {
      throw new AppError('Community not found', 404);
    }

    // User is trusted if they are an admin OR have any trust points
    const trusted = roles.includes('admin') || points > 0;
    const isAdmin = roles.includes('admin');

    // Resolve threshold settings from community config using trust resolver
    const [minTrustToAwardTrust, minTrustForWealth, minTrustForDisputes, minTrustForPolls] = await Promise.all([
      resolveTrustRequirement(communityId, community.minTrustToAwardTrust),
      resolveTrustRequirement(communityId, community.minTrustForWealth),
      resolveTrustRequirement(communityId, community.minTrustForDisputes),
      resolveTrustRequirement(communityId, community.minTrustForPolls),
    ]);

    // Calculate permission booleans
    const canAwardTrust = isAdmin || points >= minTrustToAwardTrust;
    const canAccessWealth = isAdmin || points >= minTrustForWealth;
    const canHandleDisputes = isAdmin || points >= minTrustForDisputes;
    const canCreatePolls = isAdmin || points >= minTrustForPolls;

    return {
      trusted,
      points,
      roles,
      canAwardTrust,
      canAccessWealth,
      canHandleDisputes,
      canCreatePolls,
    };
  }

  // Share redeemed integration: award +1 to both if either participant is trusted (admin or points >= threshold)
  async recordShareRedeemed(params: { communityId: string; giverUserId: string; receiverUserId: string; actorUserId?: string | null; entityType?: string; entityId?: string; }) {
    const { communityId, giverUserId, receiverUserId } = params;

    // ensure trust rows exist
    await Promise.all([
      trustViewRepository.upsertZero(communityId, giverUserId),
      trustViewRepository.upsertZero(communityId, receiverUserId),
    ]);

    const [giverTrusted, receiverTrusted] = await Promise.all([
      this.isTrusted(communityId, giverUserId),
      this.isTrusted(communityId, receiverUserId),
    ]);

    if (!(giverTrusted || receiverTrusted)) {
      logger.debug('[TrustService recordShareRedeemed] No trusted participant; no points awarded');
      return { awarded: false };
    }

    // +1 for both
    await Promise.all([
      trustViewRepository.adjustPoints(communityId, giverUserId, 1),
      trustViewRepository.adjustPoints(communityId, receiverUserId, 1),
    ]);

    await trustEventRepository.create({
      communityId,
      type: 'share_redeemed',
      entityType: params.entityType ?? 'share',
      entityId: (params.entityId as any) ?? null,
      actorUserId: params.actorUserId ?? null,
      subjectUserIdA: giverUserId,
      subjectUserIdB: receiverUserId,
      pointsDeltaA: 1,
      pointsDeltaB: 1,
    });

    return { awarded: true };
  }

  // Global (user-scoped) endpoints
  async getMyEventsAllCommunities(userId: string, page = 1, limit = 50) {
    const offset = (Math.max(1, page) - 1) * Math.max(1, Math.min(limit, 100));
    return trustEventRepository.listByUserAllCommunities(userId, limit, offset);
  }

  async listMyTrustAcrossCommunities(userId: string, page = 1, limit = 50) {
    const offset = (Math.max(1, page) - 1) * Math.max(1, Math.min(limit, 100));
    return trustViewRepository.listByUser(userId, limit, offset);
  }

  // ========== NEW TRUST AWARD METHODS ==========

  /**
   * Award trust to another user (1 point)
   * Requirements:
   * - User must be a member
   * - User must not have already awarded trust to this user
   * - User must meet trust threshold (15) OR be admin
   */
  async awardTrust(communityId: string, fromUserId: string, toUserId: string) {
    if (fromUserId === toUserId) {
      throw new AppError('Cannot award trust to yourself', 400);
    }

    // Check if user is a member
    const fromUserRole = await this.getUserRole(communityId, fromUserId);
    if (!fromUserRole) {
      throw new AppError('Forbidden: not a member of this community', 403);
    }

    // Check if already awarded
    const hasAwarded = await trustAwardRepository.hasAward(communityId, fromUserId, toUserId);
    if (hasAwarded) {
      throw new AppError('You have already awarded trust to this user', 400);
    }

    // Check threshold OR admin
    const [isAdmin, fromUserPoints, community] = await Promise.all([
      this.isAdmin(communityId, fromUserId),
      this.getUserPoints(communityId, fromUserId),
      communityRepository.findById(communityId),
    ]);

    if (!community) {
      throw new AppError('Community not found', 404);
    }

    // Resolve trust requirement (supports both numeric and level references)
    const threshold = await resolveTrustRequirement(communityId, community.minTrustToAwardTrust);

    if (!isAdmin && fromUserPoints < threshold) {
      throw new AppError(
        `Unauthorized: You need ${threshold} trust points to award trust (you have ${fromUserPoints})`,
        401
      );
    }

    // Create award
    const award = await trustAwardRepository.createAward(communityId, fromUserId, toUserId);

    // Recalculate trust view for recipient
    await trustViewRepository.recalculatePoints(communityId, toUserId);

    // Log to history
    await trustHistoryRepository.logAction({
      communityId,
      fromUserId,
      toUserId,
      action: 'award',
      pointsDelta: 1,
    });

    return award;
  }

  /**
   * Remove trust award from another user
   */
  async removeTrust(communityId: string, fromUserId: string, toUserId: string) {
    // Check if user is a member
    const fromUserRole = await this.getUserRole(communityId, fromUserId);
    if (!fromUserRole) {
      throw new AppError('Forbidden: not a member of this community', 403);
    }

    // Check if award exists
    const hasAwarded = await trustAwardRepository.hasAward(communityId, fromUserId, toUserId);
    if (!hasAwarded) {
      throw new AppError('You have not awarded trust to this user', 400);
    }

    // Delete award
    const deleted = await trustAwardRepository.deleteAward(communityId, fromUserId, toUserId);

    // Recalculate trust view for recipient
    await trustViewRepository.recalculatePoints(communityId, toUserId);

    // Log to history
    await trustHistoryRepository.logAction({
      communityId,
      fromUserId,
      toUserId,
      action: 'remove',
      pointsDelta: -1,
    });

    return deleted;
  }

  /**
   * Check if user has awarded trust to another user
   */
  async hasAwardedTrust(communityId: string, fromUserId: string, toUserId: string) {
    return trustAwardRepository.hasAward(communityId, fromUserId, toUserId);
  }

  /**
   * List all trust awards given by a user
   */
  async listMyAwards(communityId: string, fromUserId: string) {
    const role = await this.getUserRole(communityId, fromUserId);
    if (!role) {
      throw new AppError('Forbidden: not a member of this community', 403);
    }

    return trustAwardRepository.listUserAwards(communityId, fromUserId);
  }

  /**
   * List all trust awards received by a user
   */
  async listAwardsToUser(communityId: string, requesterId: string, toUserId: string) {
    const role = await this.getUserRole(communityId, requesterId);
    if (!role) {
      throw new AppError('Forbidden: not a member of this community', 403);
    }

    return trustAwardRepository.listAwardsToUser(communityId, toUserId);
  }

  // ========== ADMIN GRANT METHODS ==========

  /**
   * Set admin trust grant for a user
   * Only admins can set admin grants
   */
  async setAdminGrant(communityId: string, adminUserId: string, toUserId: string, amount: number) {
    // Check if admin
    const isAdminUser = await this.isAdmin(communityId, adminUserId);
    if (!isAdminUser) {
      throw new AppError('Forbidden: only admins can set admin grants', 403);
    }

    // Validate amount
    if (amount < 0) {
      throw new AppError('Admin grant amount cannot be negative', 400);
    }

    // Get existing grant (if any) to calculate delta
    const existingGrant = await adminTrustGrantRepository.getGrant(communityId, toUserId);
    const oldAmount = existingGrant?.trustAmount ?? 0;
    const delta = amount - oldAmount;

    // Upsert grant
    const grant = await adminTrustGrantRepository.upsertGrant(
      communityId,
      adminUserId,
      toUserId,
      amount
    );

    // Recalculate trust view
    await trustViewRepository.recalculatePoints(communityId, toUserId);

    // Log to history
    await trustHistoryRepository.logAction({
      communityId,
      fromUserId: adminUserId,
      toUserId,
      action: 'admin_grant',
      pointsDelta: delta,
    });

    return grant;
  }

  /**
   * Get all admin grants for a community
   * Only admins can view all grants
   */
  async getAdminGrants(communityId: string, requesterId: string) {
    const isAdminUser = await this.isAdmin(communityId, requesterId);
    if (!isAdminUser) {
      throw new AppError('Forbidden: only admins can view admin grants', 403);
    }

    return adminTrustGrantRepository.listAllGrants(communityId);
  }

  /**
   * Delete an admin grant
   * Only admins can delete grants
   */
  async deleteAdminGrant(communityId: string, adminUserId: string, toUserId: string) {
    const isAdminUser = await this.isAdmin(communityId, adminUserId);
    if (!isAdminUser) {
      throw new AppError('Forbidden: only admins can delete admin grants', 403);
    }

    const existingGrant = await adminTrustGrantRepository.getGrant(communityId, toUserId);
    if (!existingGrant) {
      throw new AppError('Admin grant not found', 404);
    }

    const deleted = await adminTrustGrantRepository.deleteGrant(communityId, toUserId);

    // Recalculate trust view
    await trustViewRepository.recalculatePoints(communityId, toUserId);

    // Log to history
    await trustHistoryRepository.logAction({
      communityId,
      fromUserId: adminUserId,
      toUserId,
      action: 'admin_grant',
      pointsDelta: -existingGrant.trustAmount,
    });

    return deleted;
  }

  /**
   * Get trust history for a user
   */
  async getTrustHistory(communityId: string, requesterId: string, userId: string, page = 1, limit = 50) {
    const role = await this.getUserRole(communityId, requesterId);
    if (!role) {
      throw new AppError('Forbidden: not a member of this community', 403);
    }

    const offset = (Math.max(1, page) - 1) * Math.max(1, Math.min(limit, 100));
    return trustHistoryRepository.getHistoryForUser(communityId, userId, limit, offset);
  }

  // ========== TRUST REQUIREMENT VALIDATION METHODS ==========

  /**
   * Check if a user can award trust to others
   * Requirements:
   * - User must be a member
   * - User must meet the minTrustToAwardTrust threshold OR be an admin
   */
  async canAwardTrust(userId: string, communityId: string): Promise<boolean> {
    const [roles, points, community] = await Promise.all([
      this.getUserRoles(communityId, userId),
      this.getUserPoints(communityId, userId),
      communityRepository.findById(communityId),
    ]);

    if (!community) {
      throw new AppError('Community not found', 404);
    }

    // Not a member
    if (roles.length === 0) {
      return false;
    }

    // Admins can always award trust
    if (roles.includes('admin')) {
      return true;
    }

    // Check trust threshold
    const threshold = await resolveTrustRequirement(communityId, community.minTrustToAwardTrust);
    return points >= threshold;
  }

  /**
   * Check if a user can access wealth
   * Requirements:
   * - User must be a member
   * - User must meet the minTrustForWealth threshold OR be an admin
   */
  async canAccessWealth(userId: string, communityId: string): Promise<boolean> {
    const [roles, points, community] = await Promise.all([
      this.getUserRoles(communityId, userId),
      this.getUserPoints(communityId, userId),
      communityRepository.findById(communityId),
    ]);

    if (!community) {
      throw new AppError('Community not found', 404);
    }

    // Not a member
    if (roles.length === 0) {
      return false;
    }

    // Admins can always access wealth
    if (roles.includes('admin')) {
      return true;
    }

    // Check trust threshold
    const threshold = await resolveTrustRequirement(communityId, community.minTrustForWealth);
    return points >= threshold;
  }

  /**
   * Check if a user can handle disputes
   * Requirements:
   * - User must be a member
   * - User must meet the minTrustForDisputes threshold OR be an admin
   */
  async canHandleDisputes(userId: string, communityId: string): Promise<boolean> {
    const [roles, points, community] = await Promise.all([
      this.getUserRoles(communityId, userId),
      this.getUserPoints(communityId, userId),
      communityRepository.findById(communityId),
    ]);

    if (!community) {
      throw new AppError('Community not found', 404);
    }

    // Not a member
    if (roles.length === 0) {
      return false;
    }

    // Admins can always handle disputes
    if (roles.includes('admin')) {
      return true;
    }

    // Check trust threshold
    const threshold = await resolveTrustRequirement(communityId, community.minTrustForDisputes);
    return points >= threshold;
  }

  /**
   * Check if a user can create polls
   * Requirements:
   * - User must be a member
   * - User must meet the minTrustForPolls threshold OR be an admin
   */
  async canCreatePolls(userId: string, communityId: string): Promise<boolean> {
    const [roles, points, community] = await Promise.all([
      this.getUserRoles(communityId, userId),
      this.getUserPoints(communityId, userId),
      communityRepository.findById(communityId),
    ]);

    if (!community) {
      throw new AppError('Community not found', 404);
    }

    // Not a member
    if (roles.length === 0) {
      return false;
    }

    // Admins can always create polls
    if (roles.includes('admin')) {
      return true;
    }

    // Check trust threshold
    const threshold = await resolveTrustRequirement(communityId, community.minTrustForPolls);
    return points >= threshold;
  }

  /**
   * Resolve the effective trust threshold for a feature
   * This is a utility method that returns the numeric threshold
   */
  async getEffectiveTrustThreshold(
    communityId: string,
    featureConfig: { type: 'number' | 'level'; value: number | string }
  ): Promise<number> {
    const community = await communityRepository.findById(communityId);
    if (!community) {
      throw new AppError('Community not found', 404);
    }

    return await resolveTrustRequirement(communityId, featureConfig);
  }

  /**
   * Get trust timeline/roadmap for a community
   * Shows all trust levels, permission thresholds, and user's current position
   */
  async getTrustTimeline(communityId: string, userId: string): Promise<TrustTimelineResult> {
    // Check if user is a member
    const role = await this.getUserRole(communityId, userId);
    if (!role) {
      throw new AppError('Forbidden: not a member of this community', 403);
    }

    // Get community configuration
    const community = await communityRepository.findById(communityId);
    if (!community) {
      throw new AppError('Community not found', 404);
    }

    // Get user's trust score
    const userTrustScore = await this.getUserPoints(communityId, userId);

    // Get all trust levels for this community
    const trustLevels = await trustLevelRepository.findByCommunityId(communityId);

    // Resolve all trust thresholds
    const [
      minTrustToAwardTrust,
      minTrustForWealth,
      minTrustForItemManagement,
      minTrustForDisputes,
      minTrustForPolls,
      minTrustForThreadCreation,
      minTrustForAttachments,
      minTrustForFlagging,
      minTrustForFlagReview,
      minTrustForForumModeration,
    ] = await Promise.all([
      resolveTrustRequirement(communityId, community.minTrustToAwardTrust),
      resolveTrustRequirement(communityId, community.minTrustForWealth),
      resolveTrustRequirement(communityId, community.minTrustForItemManagement),
      resolveTrustRequirement(communityId, community.minTrustForDisputes),
      resolveTrustRequirement(communityId, community.minTrustForPolls),
      resolveTrustRequirement(communityId, community.minTrustForThreadCreation),
      resolveTrustRequirement(communityId, community.minTrustForAttachments),
      resolveTrustRequirement(communityId, community.minTrustForFlagging),
      resolveTrustRequirement(communityId, community.minTrustForFlagReview),
      resolveTrustRequirement(communityId, community.minTrustForForumModeration),
    ]);

    // Build threshold map: threshold -> permissions[]
    const thresholdMap = new Map<number, string[]>();

    // Helper to add permission to threshold
    const addPermission = (threshold: number, permission: string) => {
      if (!thresholdMap.has(threshold)) {
        thresholdMap.set(threshold, []);
      }
      thresholdMap.get(threshold)!.push(permission);
    };

    // Map permissions to their thresholds
    addPermission(minTrustToAwardTrust, 'Award trust to others');
    addPermission(minTrustForWealth, 'Publish wealth');
    addPermission(minTrustForItemManagement, 'Manage items');
    addPermission(minTrustForDisputes, 'Handle disputes');
    addPermission(minTrustForPolls, 'Create polls');
    addPermission(minTrustForThreadCreation, 'Create forum threads');
    addPermission(minTrustForAttachments, 'Upload attachments');
    addPermission(minTrustForFlagging, 'Flag content');
    addPermission(minTrustForFlagReview, 'Review flagged content');
    addPermission(minTrustForForumModeration, 'Moderate forum');

    // Get all unique thresholds (from levels and permissions)
    const allThresholds = new Set<number>();
    trustLevels.forEach((level) => allThresholds.add(level.threshold));
    thresholdMap.forEach((_, threshold) => allThresholds.add(threshold));

    // Build timeline
    const timeline: TrustTimelineItem[] = Array.from(allThresholds)
      .sort((a, b) => a - b)
      .map((threshold) => {
        const trustLevel = trustLevels.find((level) => level.threshold === threshold);
        const permissions = thresholdMap.get(threshold) || [];

        return {
          threshold,
          trustLevel: trustLevel ? { name: trustLevel.name, id: trustLevel.id } : null,
          permissions,
          unlocked: userTrustScore >= threshold,
        };
      });

    return {
      userTrustScore,
      timeline,
    };
  }
}

export const trustService = new TrustService();