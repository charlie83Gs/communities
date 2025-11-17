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
import { openFGAService } from './openfga.service';

export type TrustMeResult = {
  trusted: boolean;
  points: number;
  roles: string[];
  // Trust permissions
  canViewTrust: boolean;
  canAwardTrust: boolean;
  // Wealth permissions
  canViewWealth: boolean;
  canCreateWealth: boolean;
  // Needs permissions
  canViewNeeds: boolean;
  canPublishNeeds: boolean;
  // Item permissions
  canViewItems: boolean;
  canManageItems: boolean;
  // Dispute permissions
  canViewDisputes: boolean;
  canHandleDisputes: boolean;
  // Poll permissions
  canViewPolls: boolean;
  canCreatePolls: boolean;
  // Pool permissions
  canViewPools: boolean;
  canCreatePools: boolean;
  // Council permissions
  canViewCouncils: boolean;
  canCreateCouncils: boolean;
  // Forum permissions
  canViewForum: boolean;
  canManageForum: boolean;
  canCreateThreads: boolean;
  canUploadAttachments: boolean;
  canFlagContent: boolean;
  canReviewFlags: boolean;
  // Analytics permissions
  canViewAnalytics: boolean;
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
  /**
   * Sync trust roles for a user in OpenFGA based on their trust score
   * This should be called whenever a user's trust score changes
   */
  private async syncTrustRoles(userId: string, communityId: string): Promise<void> {
    try {
      // Get user's current trust score
      const trustScore = await this.getUserPoints(communityId, userId);

      // Get community configuration
      const community = await communityRepository.findById(communityId);
      if (!community) {
        throw new AppError('Community not found', 404);
      }

      // Build thresholds map - extract .value from each config
      const thresholds = {
        trust_trust_viewer: (community.minTrustToViewTrust as any)?.value ?? 0,
        trust_trust_granter: (community.minTrustToAwardTrust as any)?.value ?? 15,
        trust_wealth_viewer: (community.minTrustToViewWealth as any)?.value ?? 0,
        trust_wealth_creator: (community.minTrustForWealth as any)?.value ?? 10,
        trust_needs_viewer: (community.minTrustToViewNeeds as any)?.value ?? 0,
        trust_needs_publisher: (community.minTrustForNeeds as any)?.value ?? 5,
        trust_poll_viewer: (community.minTrustToViewPolls as any)?.value ?? 0,
        trust_poll_creator: (community.minTrustForPolls as any)?.value ?? 15,
        trust_dispute_viewer: (community.minTrustForDisputeVisibility as any)?.value ?? 20,
        trust_dispute_handler: (community.minTrustForDisputeVisibility as any)?.value ?? 20,
        trust_pool_viewer: (community.minTrustToViewPools as any)?.value ?? 0,
        trust_pool_creator: (community.minTrustForPoolCreation as any)?.value ?? 20,
        trust_council_viewer: (community.minTrustToViewCouncils as any)?.value ?? 0,
        trust_council_creator: (community.minTrustForCouncilCreation as any)?.value ?? 25,
        trust_forum_viewer: (community.minTrustToViewForum as any)?.value ?? 0,
        trust_forum_manager: (community.minTrustForForumModeration as any)?.value ?? 30,
        trust_thread_creator: (community.minTrustForThreadCreation as any)?.value ?? 10,
        trust_attachment_uploader: (community.minTrustForAttachments as any)?.value ?? 15,
        trust_content_flagger: (community.minTrustForFlagging as any)?.value ?? 15,
        trust_flag_reviewer: (community.minTrustForFlagReview as any)?.value ?? 30,
        trust_item_viewer: (community.minTrustToViewItems as any)?.value ?? 0,
        trust_item_manager: (community.minTrustForItemManagement as any)?.value ?? 20,
        trust_analytics_viewer: (community.minTrustForHealthAnalytics as any)?.value ?? 20,
      };

      // Sync trust roles in OpenFGA
      await openFGAService.syncTrustRoles(userId, communityId, trustScore, thresholds);
    } catch (error) {
      logger.error('[TrustService] Failed to sync trust roles:', error);
      throw error;
    }
  }

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
  async getEventsForUser(
    communityId: string,
    requesterId: string,
    userId: string,
    page = 1,
    limit = 50
  ) {
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

    const merged = [...a, ...b].sort(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (x: any, y: any) => new Date(y.createdAt).getTime() - new Date(x.createdAt).getTime()
    );
    return merged.slice(0, limit);
  }

  // Trust view read-only
  async getTrustView(communityId: string, requesterId: string, userId: string) {
    const role = await this.getUserRole(communityId, requesterId);
    if (!role) {
      throw new AppError('Forbidden: not a member of this community', 403);
    }
    const view = await trustViewRepository.get(communityId, userId);
    return (
      view ?? {
        communityId,
        userId,
        points: 0,
        updatedAt: new Date(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        id: undefined as any,
      }
    );
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
    const [roles, points] = await Promise.all([
      this.getUserRoles(communityId, userId),
      this.getUserPoints(communityId, userId),
    ]);

    // User is trusted if they are an admin OR have any trust points
    const trusted = roles.includes('admin') || points > 0;

    // Check all permissions using OpenFGA
    const [
      canViewTrust,
      canAwardTrust,
      canViewWealth,
      canCreateWealth,
      canViewNeeds,
      canPublishNeeds,
      canViewItems,
      canManageItems,
      canViewDisputes,
      canHandleDisputes,
      canViewPolls,
      canCreatePolls,
      canViewPools,
      canCreatePools,
      canViewCouncils,
      canCreateCouncils,
      canViewForum,
      canManageForum,
      canCreateThreads,
      canUploadAttachments,
      canFlagContent,
      canReviewFlags,
      canViewAnalytics,
    ] = await Promise.all([
      openFGAService.checkAccess(userId, 'community', communityId, 'can_view_trust'),
      openFGAService.checkAccess(userId, 'community', communityId, 'can_award_trust'),
      openFGAService.checkAccess(userId, 'community', communityId, 'can_view_wealth'),
      openFGAService.checkAccess(userId, 'community', communityId, 'can_create_wealth'),
      openFGAService.checkAccess(userId, 'community', communityId, 'can_view_needs'),
      openFGAService.checkAccess(userId, 'community', communityId, 'can_publish_needs'),
      openFGAService.checkAccess(userId, 'community', communityId, 'can_view_item'),
      openFGAService.checkAccess(userId, 'community', communityId, 'can_manage_item'),
      openFGAService.checkAccess(userId, 'community', communityId, 'can_view_dispute'),
      openFGAService.checkAccess(userId, 'community', communityId, 'can_handle_dispute'),
      openFGAService.checkAccess(userId, 'community', communityId, 'can_view_poll'),
      openFGAService.checkAccess(userId, 'community', communityId, 'can_create_poll'),
      openFGAService.checkAccess(userId, 'community', communityId, 'can_view_pool'),
      openFGAService.checkAccess(userId, 'community', communityId, 'can_create_pool'),
      openFGAService.checkAccess(userId, 'community', communityId, 'can_view_council'),
      openFGAService.checkAccess(userId, 'community', communityId, 'can_create_council'),
      openFGAService.checkAccess(userId, 'community', communityId, 'can_view_forum'),
      openFGAService.checkAccess(userId, 'community', communityId, 'can_manage_forum'),
      openFGAService.checkAccess(userId, 'community', communityId, 'can_create_thread'),
      openFGAService.checkAccess(userId, 'community', communityId, 'can_upload_attachment'),
      openFGAService.checkAccess(userId, 'community', communityId, 'can_flag_content'),
      openFGAService.checkAccess(userId, 'community', communityId, 'can_review_flag'),
      openFGAService.checkAccess(userId, 'community', communityId, 'can_view_analytics'),
    ]);

    return {
      trusted,
      points,
      roles,
      canViewTrust,
      canAwardTrust,
      canViewWealth,
      canCreateWealth,
      canViewNeeds,
      canPublishNeeds,
      canViewItems,
      canManageItems,
      canViewDisputes,
      canHandleDisputes,
      canViewPolls,
      canCreatePolls,
      canViewPools,
      canCreatePools,
      canViewCouncils,
      canCreateCouncils,
      canViewForum,
      canManageForum,
      canCreateThreads,
      canUploadAttachments,
      canFlagContent,
      canReviewFlags,
      canViewAnalytics,
    };
  }

  // Share redeemed integration: award +1 to both if either participant is trusted (admin or points >= threshold)
  async recordShareRedeemed(params: {
    communityId: string;
    giverUserId: string;
    receiverUserId: string;
    actorUserId?: string | null;
    entityType?: string;
    entityId?: string;
  }) {
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
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
   * - User must have can_award_trust permission (admin OR trust_granter OR trust_trust_granter)
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

    // Check permission via OpenFGA (automatically handles admin OR trust_granter OR trust_trust_granter)
    const canAwardTrust = await openFGAService.checkAccess(
      fromUserId,
      'community',
      communityId,
      'can_award_trust'
    );

    if (!canAwardTrust) {
      throw new AppError('Unauthorized: You do not have permission to award trust', 401);
    }

    // Create award
    const award = await trustAwardRepository.createAward(communityId, fromUserId, toUserId);

    // Recalculate trust view for recipient
    await trustViewRepository.recalculatePoints(communityId, toUserId);

    // Sync trust roles in OpenFGA for recipient
    await this.syncTrustRoles(toUserId, communityId);

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

    // Sync trust roles in OpenFGA for recipient
    await this.syncTrustRoles(toUserId, communityId);

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

    // Sync trust roles in OpenFGA for recipient
    await this.syncTrustRoles(toUserId, communityId);

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

    // Sync trust roles in OpenFGA for recipient
    await this.syncTrustRoles(toUserId, communityId);

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
  async getTrustHistory(
    communityId: string,
    requesterId: string,
    userId: string,
    page = 1,
    limit = 50
  ) {
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
    const threshold = await resolveTrustRequirement(
      communityId,
      community.minTrustForDisputeVisibility
    );
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
      // Trust permissions
      minTrustToViewTrust,
      minTrustToAwardTrust,
      // Wealth permissions
      minTrustToViewWealth,
      minTrustForWealth,
      // Item permissions
      minTrustToViewItems,
      minTrustForItemManagement,
      // Dispute permissions
      minTrustToViewDisputes,
      minTrustForDisputes,
      // Poll permissions
      minTrustToViewPolls,
      minTrustForPolls,
      // Pool permissions
      minTrustToViewPools,
      minTrustForPoolCreation,
      // Council permissions
      minTrustToViewCouncils,
      minTrustForCouncilCreation,
      // Forum permissions
      minTrustToViewForum,
      minTrustForThreadCreation,
      minTrustForAttachments,
      minTrustForFlagging,
      minTrustForFlagReview,
      minTrustForForumModeration,
      // Analytics permissions
      minTrustForHealthAnalytics,
    ] = await Promise.all([
      // Trust permissions
      resolveTrustRequirement(communityId, community.minTrustToViewTrust),
      resolveTrustRequirement(communityId, community.minTrustToAwardTrust),
      // Wealth permissions
      resolveTrustRequirement(communityId, community.minTrustToViewWealth),
      resolveTrustRequirement(communityId, community.minTrustForWealth),
      // Item permissions
      resolveTrustRequirement(communityId, community.minTrustToViewItems),
      resolveTrustRequirement(communityId, community.minTrustForItemManagement),
      // Dispute permissions
      resolveTrustRequirement(communityId, community.minTrustForDisputeVisibility),
      resolveTrustRequirement(communityId, community.minTrustForDisputeVisibility),
      // Poll permissions
      resolveTrustRequirement(communityId, community.minTrustToViewPolls),
      resolveTrustRequirement(communityId, community.minTrustForPolls),
      // Pool permissions
      resolveTrustRequirement(communityId, community.minTrustToViewPools),
      resolveTrustRequirement(communityId, community.minTrustForPoolCreation),
      // Council permissions
      resolveTrustRequirement(communityId, community.minTrustToViewCouncils),
      resolveTrustRequirement(communityId, community.minTrustForCouncilCreation),
      // Forum permissions
      resolveTrustRequirement(communityId, community.minTrustToViewForum),
      resolveTrustRequirement(communityId, community.minTrustForThreadCreation),
      resolveTrustRequirement(communityId, community.minTrustForAttachments),
      resolveTrustRequirement(communityId, community.minTrustForFlagging),
      resolveTrustRequirement(communityId, community.minTrustForFlagReview),
      resolveTrustRequirement(communityId, community.minTrustForForumModeration),
      // Analytics permissions
      resolveTrustRequirement(communityId, community.minTrustForHealthAnalytics),
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
    // Trust permissions
    addPermission(minTrustToViewTrust, 'View trust scores');
    addPermission(minTrustToAwardTrust, 'Award trust to others');

    // Wealth permissions
    addPermission(minTrustToViewWealth, 'View wealth items');
    addPermission(minTrustForWealth, 'Create and publish wealth');

    // Item permissions
    addPermission(minTrustToViewItems, 'View community items');
    addPermission(minTrustForItemManagement, 'Manage items');

    // Dispute permissions
    addPermission(minTrustToViewDisputes, 'View disputes');
    addPermission(minTrustForDisputes, 'Handle disputes');

    // Poll permissions
    addPermission(minTrustToViewPolls, 'View polls');
    addPermission(minTrustForPolls, 'Create polls');

    // Pool permissions
    addPermission(minTrustToViewPools, 'View pools');
    addPermission(minTrustForPoolCreation, 'Create pools');

    // Council permissions
    addPermission(minTrustToViewCouncils, 'View councils');
    addPermission(minTrustForCouncilCreation, 'Create councils');

    // Forum permissions
    addPermission(minTrustToViewForum, 'View forum');
    addPermission(minTrustForThreadCreation, 'Create forum threads');
    addPermission(minTrustForAttachments, 'Upload attachments');
    addPermission(minTrustForFlagging, 'Flag content');
    addPermission(minTrustForFlagReview, 'Review flagged content');
    addPermission(minTrustForForumModeration, 'Moderate forum');

    // Analytics permissions
    addPermission(minTrustForHealthAnalytics, 'View health analytics');

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
