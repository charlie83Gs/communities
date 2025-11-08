import { communityRepository } from '../repositories/community.repository';
import { appUserRepository } from '../repositories/appUser.repository';
import { communityMemberRepository } from '../repositories/communityMember.repository';
import { trustLevelRepository } from '../repositories/trustLevel.repository';
import { trustViewRepository } from '../repositories/trustView.repository';
import { itemsService } from './items.service';
import { openFGAService } from './openfga.service';
import { resolveTrustRequirement } from '../utils/trustResolver';
import { AppError } from '../utils/errors';
import { CreateCommunityDto, UpdateCommunityDto, Community } from '../types/community.types';
import logger from '../utils/logger';

async function isCommunityAdmin(userId: string, communityId: string): Promise<boolean> {
  const isAdmin = await communityMemberRepository.isAdmin(communityId, userId);
  logger.debug(
    `[CommunityService isCommunityAdmin] Is admin for userId: ${userId}, communityId: ${communityId}: ${isAdmin}`
  );
  return isAdmin;
}

export type CommunityMember = {
  userId: string;
  roles: string[];
  displayName?: string | null;
  email?: string | null;
  profileImage?: string | null;
};

export class CommunityService {
  async createCommunity(data: CreateCommunityDto, userId: string): Promise<Community> {
    logger.info(`[CommunityService createCommunity] Creating community for userId: ${userId}`);

    // Verify user exists in app_users table
    const user = await appUserRepository.findById(userId);
    if (!user) {
      logger.error(
        `[CommunityService createCommunity] User not found in app_users for userId: ${userId}`
      );
      throw new AppError('User profile not found. Please try logging out and back in.', 404);
    }

    const community = await communityRepository.create({
      ...data,
      createdBy: userId, // User ID
    });

    logger.info(`[CommunityService createCommunity] Community created with id: ${community.id}`);

    // Assign creator as admin - THIS IS CRITICAL and must succeed
    try {
      logger.info(
        `[CommunityService createCommunity] Assigning admin role to creator userId: ${userId} for community: ${community.id}`
      );
      await communityMemberRepository.addMember(community.id, userId, 'admin');
      logger.info(`[CommunityService createCommunity] Successfully assigned admin role to creator`);
    } catch (err) {
      logger.error(
        `[CommunityService createCommunity] CRITICAL: Failed to assign admin role to creator userId: ${userId} for community: ${community.id}`,
        err
      );

      // This is a critical error - if the creator can't be assigned as admin,
      // the community is unusable. We should delete it and throw the error.
      try {
        await communityRepository.delete(community.id);
        logger.info(
          `[CommunityService createCommunity] Rolled back community creation due to role assignment failure`
        );
      } catch (deleteErr) {
        logger.error(
          `[CommunityService createCommunity] Failed to rollback community creation:`,
          deleteErr
        );
      }

      throw new AppError('Failed to create community: could not assign creator as admin', 500);
    }

    // Verify the role was actually assigned
    const verifyRole = await communityMemberRepository.getUserRole(community.id, userId);
    if (!verifyRole) {
      logger.error(
        `[CommunityService createCommunity] VERIFICATION FAILED: Creator role not found after assignment`
      );
      throw new AppError('Failed to create community: role assignment verification failed', 500);
    }

    logger.info(`[CommunityService createCommunity] Verified creator has role: ${verifyRole}`);

    // Initialize default trust levels for the community
    try {
      logger.info(
        `[CommunityService createCommunity] Initializing default trust levels for community: ${community.id}`
      );
      await trustLevelRepository.createDefaultLevels(community.id);
      logger.info(`[CommunityService createCommunity] Default trust levels initialized`);
    } catch (err) {
      logger.error(
        `[CommunityService createCommunity] Failed to initialize default trust levels:`,
        err
      );
      // Non-critical: community is still functional without trust levels
      // Trust levels can be created manually by admins if needed
    }

    // Create default "Other" item for the community
    try {
      logger.info(
        `[CommunityService createCommunity] Creating default item for community: ${community.id}`
      );
      await itemsService.ensureDefaultItem(community.id, userId);
      logger.info(`[CommunityService createCommunity] Default item created`);
    } catch (err) {
      logger.error(`[CommunityService createCommunity] Failed to create default item:`, err);
      // Non-critical: items can be created manually
    }

    return community;
  }

  async getCommunity(id: string, userId?: string): Promise<Community> {
    logger.debug(
      `[CommunityService getCommunity] Fetching community ${id} for userId: ${userId || 'guest'}`
    );
    const community = await communityRepository.findById(id);

    if (!community) {
      logger.warn(`[CommunityService getCommunity] Community not found: ${id}`);
      throw new AppError('Community not found', 404);
    }

    // All communities are now private - authentication required
    if (!userId) {
      logger.warn(`[CommunityService getCommunity] No userId for community ${id}`);
      throw new AppError('Authentication required', 401);
    }

    // Check if user has any role for this community (implies read access)
    const role = await communityMemberRepository.getUserRole(id, userId);
    if (!role) {
      logger.warn(
        `[CommunityService getCommunity] No role for userId: ${userId} in community ${id}`
      );
      throw new AppError('Forbidden: no access to this community', 403);
    }

    logger.debug(
      `[CommunityService getCommunity] Access granted for userId: ${userId} to community ${id} with role ${role}`
    );
    return community;
  }

  async listCommunities(page = 1, limit = 10, userId?: string) {
    logger.debug(
      `[CommunityService listCommunities] Request - page: ${page}, limit: ${limit}, userId: ${userId || 'guest'}`
    );
    const offset = Math.max(0, (page - 1) * limit);

    // All communities are now private - authentication required
    if (!userId) {
      logger.debug(
        `[CommunityService listCommunities] Guest access - no communities available (all private)`
      );
      return {
        data: [],
        total: 0,
        page,
        limit,
      };
    }

    logger.debug(
      `[CommunityService listCommunities] Authenticated user ${userId} - fetching accessible communities`
    );

    // Get communities where user has membership (any role)
    const memberships = await communityMemberRepository.findByUser(userId);
    const accessibleIds = memberships.map((m) => m.resourceId);
    logger.debug(
      `[CommunityService listCommunities] Accessible community IDs: ${accessibleIds.length}`
    );

    const accessibleCommunities: Community[] = [];
    for (const id of accessibleIds) {
      const c = await communityRepository.findById(id);
      if (c) {
        accessibleCommunities.push(c);
      }
    }
    logger.debug(
      `[CommunityService listCommunities] Communities fetched: ${accessibleCommunities.length}`
    );

    const paged = accessibleCommunities.slice(offset, offset + limit);
    logger.debug(
      `[CommunityService listCommunities] Total: ${accessibleCommunities.length}, paged: ${paged.length}`
    );

    return {
      data: paged,
      total: accessibleCommunities.length,
      page,
      limit,
    };
  }

  async searchCommunities(
    userId: string | undefined,
    params: {
      q?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<{
    data: Community[];
    total: number;
    page: number;
    limit: number;
  }> {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.max(1, Math.min(params.limit ?? 20, 100));
    const offset = (page - 1) * limit;

    // All communities are now private - only show communities user has access to
    let accessibleIds: string[] | undefined = undefined;
    if (userId) {
      const memberships = await communityMemberRepository.findByUser(userId);
      accessibleIds = memberships.map((m) => m.resourceId);
    }

    const result = await communityRepository.search({
      q: params.q,
      accessibleIds,
      limit,
      offset,
    });

    // Add user trust scores if authenticated
    let communitiesWithTrustScores: Community[] = result.rows;
    if (userId && result.rows.length > 0) {
      // Batch fetch trust scores for all communities
      const communityIds = result.rows.map((c) => c.id);
      const trustScoresMap = await trustViewRepository.getBatchForUser(communityIds, userId);

      // Add trust scores to each community
      communitiesWithTrustScores = result.rows.map((community) => ({
        ...community,
        userTrustScore: trustScoresMap.get(community.id) ?? null,
      }));
    }

    return {
      data: communitiesWithTrustScores,
      total: result.total,
      page,
      limit,
    };
  }

  async updateCommunity(id: string, data: UpdateCommunityDto, userId: string): Promise<Community> {
    const isAdmin = await isCommunityAdmin(userId, id);
    if (!isAdmin) {
      throw new AppError('Forbidden: only community admins can update', 403);
    }

    // Get current community config before update
    const currentCommunity = await communityRepository.findById(id);
    if (!currentCommunity) {
      throw new AppError('Community not found', 404);
    }

    // Update community
    const community = await communityRepository.update(id, data);
    if (!community) {
      throw new AppError('Community not found', 404);
    }

    // Check if any trust thresholds changed
    const trustThresholdsChanged = this.haveTrustThresholdsChanged(currentCommunity, data);

    if (trustThresholdsChanged) {
      logger.info(
        `[CommunityService updateCommunity] Trust thresholds changed for community ${id}, recalculating member trust roles`
      );

      // Recalculate trust roles for all members
      try {
        await this.recalculateAllMemberTrustRoles(id);
        logger.info(
          `[CommunityService updateCommunity] Successfully recalculated trust roles for all members in community ${id}`
        );
      } catch (error) {
        logger.error(
          `[CommunityService updateCommunity] Failed to recalculate trust roles for community ${id}:`,
          error
        );
        // Non-critical: community update succeeded, but trust role sync failed
        // Trust roles will be out of sync until next trust change or manual sync
      }
    }

    return community;
  }

  /**
   * Check if any trust threshold configuration changed
   */
  private haveTrustThresholdsChanged(
    currentCommunity: Community,
    updates: UpdateCommunityDto
  ): boolean {
    const trustFields = [
      'minTrustToAwardTrust',
      'minTrustToViewTrust',
      'minTrustForWealth',
      'minTrustToViewWealth',
      'minTrustForItemManagement',
      'minTrustToViewItems',
      'minTrustForDisputes',
      'minTrustToViewDisputes',
      'minTrustForPolls',
      'minTrustToViewPolls',
      'minTrustForPoolCreation',
      'minTrustToViewPools',
      'minTrustForCouncilCreation',
      'minTrustToViewCouncils',
      'minTrustForHealthAnalytics',
      'minTrustForThreadCreation',
      'minTrustForAttachments',
      'minTrustForFlagging',
      'minTrustForFlagReview',
      'minTrustForForumModeration',
      'minTrustToViewForum',
    ] as const;

    return trustFields.some((field) => {
      if (updates[field] !== undefined) {
        const currentValue = JSON.stringify(currentCommunity[field]);
        const newValue = JSON.stringify(updates[field]);
        return currentValue !== newValue;
      }
      return false;
    });
  }

  /**
   * Recalculate trust roles for all members when trust thresholds change
   */
  private async recalculateAllMemberTrustRoles(communityId: string): Promise<void> {
    logger.info(
      `[CommunityService recalculateAllMemberTrustRoles] Starting trust role recalculation for community ${communityId}`
    );

    // Get updated community configuration
    const community = await communityRepository.findById(communityId);
    if (!community) {
      throw new AppError('Community not found', 404);
    }

    // Build thresholds map from community configuration
    const thresholds = await this.buildTrustThresholdsMap(communityId, community);

    // Get all community members
    const memberships = await communityMemberRepository.findByCommunity(communityId);
    const uniqueUserIds = Array.from(new Set(memberships.map((m) => m.userId)));

    logger.info(
      `[CommunityService recalculateAllMemberTrustRoles] Found ${uniqueUserIds.length} unique members in community ${communityId}`
    );

    // Recalculate trust roles for each member
    let successCount = 0;
    let errorCount = 0;

    for (const userId of uniqueUserIds) {
      try {
        // Get user's current trust score
        const trustView = await trustViewRepository.get(communityId, userId);
        const trustScore = trustView?.points ?? 0;

        // Sync trust roles to OpenFGA
        await openFGAService.syncTrustRoles(userId, communityId, trustScore, thresholds);

        successCount++;
        logger.debug(
          `[CommunityService recalculateAllMemberTrustRoles] Synced trust roles for user ${userId} (trust: ${trustScore})`
        );
      } catch (error) {
        errorCount++;
        logger.error(
          `[CommunityService recalculateAllMemberTrustRoles] Failed to sync trust roles for user ${userId}:`,
          error
        );
        // Continue with other members even if one fails
      }
    }

    logger.info(
      `[CommunityService recalculateAllMemberTrustRoles] Completed trust role recalculation: ${successCount} succeeded, ${errorCount} failed`
    );

    if (errorCount > 0 && successCount === 0) {
      throw new AppError('Failed to recalculate trust roles for all members', 500);
    }
  }

  /**
   * Build trust thresholds map for OpenFGA sync
   */
  private async buildTrustThresholdsMap(
    communityId: string,
    community: Community
  ): Promise<Record<string, number>> {
    // Resolve all trust thresholds using the trust resolver
    const [
      minTrustToAwardTrust,
      minTrustToViewTrust,
      minTrustForWealth,
      minTrustToViewWealth,
      minTrustForItemManagement,
      minTrustToViewItems,
      minTrustForDisputes,
      minTrustToViewDisputes,
      minTrustForPolls,
      minTrustToViewPolls,
      minTrustForPoolCreation,
      minTrustToViewPools,
      minTrustForCouncilCreation,
      minTrustToViewCouncils,
      minTrustForHealthAnalytics,
      minTrustForThreadCreation,
      minTrustForAttachments,
      minTrustForFlagging,
      minTrustForFlagReview,
      minTrustForForumModeration,
      minTrustToViewForum,
    ] = await Promise.all([
      resolveTrustRequirement(communityId, community.minTrustToAwardTrust),
      resolveTrustRequirement(communityId, community.minTrustToViewTrust),
      resolveTrustRequirement(communityId, community.minTrustForWealth),
      resolveTrustRequirement(communityId, community.minTrustToViewWealth),
      resolveTrustRequirement(communityId, community.minTrustForItemManagement),
      resolveTrustRequirement(communityId, community.minTrustToViewItems),
      resolveTrustRequirement(communityId, community.minTrustForDisputes),
      resolveTrustRequirement(communityId, community.minTrustToViewDisputes),
      resolveTrustRequirement(communityId, community.minTrustForPolls),
      resolveTrustRequirement(communityId, community.minTrustToViewPolls),
      resolveTrustRequirement(communityId, community.minTrustForPoolCreation),
      resolveTrustRequirement(communityId, community.minTrustToViewPools),
      resolveTrustRequirement(communityId, community.minTrustForCouncilCreation),
      resolveTrustRequirement(communityId, community.minTrustToViewCouncils),
      resolveTrustRequirement(communityId, community.minTrustForHealthAnalytics),
      resolveTrustRequirement(communityId, community.minTrustForThreadCreation),
      resolveTrustRequirement(communityId, community.minTrustForAttachments),
      resolveTrustRequirement(communityId, community.minTrustForFlagging),
      resolveTrustRequirement(communityId, community.minTrustForFlagReview),
      resolveTrustRequirement(communityId, community.minTrustForForumModeration),
      resolveTrustRequirement(communityId, community.minTrustToViewForum),
    ]);

    // Map thresholds to trust role names (matching OpenFGA constants)
    return {
      trust_trust_viewer: minTrustToViewTrust,
      trust_trust_granter: minTrustToAwardTrust,
      trust_wealth_viewer: minTrustToViewWealth,
      trust_wealth_creator: minTrustForWealth,
      trust_poll_viewer: minTrustToViewPolls,
      trust_poll_creator: minTrustForPolls,
      trust_dispute_viewer: minTrustToViewDisputes,
      trust_dispute_handler: minTrustForDisputes,
      trust_pool_viewer: minTrustToViewPools,
      trust_pool_creator: minTrustForPoolCreation,
      trust_council_viewer: minTrustToViewCouncils,
      trust_council_creator: minTrustForCouncilCreation,
      trust_forum_viewer: minTrustToViewForum,
      trust_forum_manager: minTrustForForumModeration,
      trust_thread_creator: minTrustForThreadCreation,
      trust_attachment_uploader: minTrustForAttachments,
      trust_content_flagger: minTrustForFlagging,
      trust_flag_reviewer: minTrustForFlagReview,
      trust_item_viewer: minTrustToViewItems,
      trust_item_manager: minTrustForItemManagement,
      trust_analytics_viewer: minTrustForHealthAnalytics,
    };
  }

  async deleteCommunity(id: string, userId: string): Promise<Community> {
    const isAdmin = await isCommunityAdmin(userId, id);
    if (!isAdmin) {
      throw new AppError('Forbidden: only community admins can delete', 403);
    }

    const deleted = await communityRepository.delete(id);
    if (!deleted) {
      throw new AppError('Community not found', 404);
    }

    return deleted;
  }

  async getMembers(
    communityId: string,
    userId: string,
    search?: string
  ): Promise<CommunityMember[]> {
    logger.debug(
      `[CommunityService getMembers] Request for communityId: ${communityId}, userId: ${userId}, search: ${search || 'none'}`
    );
    // Verify caller has member or admin role
    const role = await communityMemberRepository.getUserRole(communityId, userId);
    if (!role || (role !== 'admin' && role !== 'member')) {
      logger.warn(
        `[CommunityService getMembers] User ${userId} lacks sufficient role (${role}) for community ${communityId}`
      );
      throw new AppError('Forbidden: only community admins and members can view members', 403);
    }

    logger.debug(
      `[CommunityService getMembers] User ${userId} has role ${role}; fetching memberships`
    );
    const memberships = await communityMemberRepository.findByCommunity(communityId);
    logger.debug(`[CommunityService getMembers] Memberships count: ${memberships.length}`);

    // Get unique member IDs (findByCommunity may return multiple entries per user)
    const uniqueUserIds = Array.from(new Set(memberships.map((m) => m.userId)));
    logger.debug(`[CommunityService getMembers] Unique member IDs: ${uniqueUserIds.join(', ')}`);

    // Fetch actual roles and user details for each unique user
    const members: CommunityMember[] = [];
    for (const memberId of uniqueUserIds) {
      // Use getUserRoles to get the correct roles (same as getMemberById)
      const roles = await communityMemberRepository.getUserRoles(communityId, memberId);

      // Fetch user details from app_users (memberId is the user ID)
      const user = await appUserRepository.findById(memberId);

      members.push({
        userId: memberId,
        roles,
        displayName: user?.displayName,
        email: user?.email,
        profileImage: user?.profileImage,
      });
    }

    // Apply search filter if provided
    let filteredMembers = members;
    if (search && search.trim()) {
      const searchLower = search.toLowerCase().trim();
      filteredMembers = members.filter((member) => {
        const displayNameMatch = member.displayName?.toLowerCase().includes(searchLower);
        const emailMatch = member.email?.toLowerCase().includes(searchLower);
        return displayNameMatch || emailMatch;
      });
      logger.debug(
        `[CommunityService getMembers] Search filtered ${members.length} to ${filteredMembers.length} members`
      );
    }

    logger.debug(
      `[CommunityService getMembers] Returning ${filteredMembers.length} unique members`
    );
    return filteredMembers;
  }

  async removeMember(
    communityId: string,
    targetUserId: string,
    requesterId: string
  ): Promise<void> {
    const isAdmin = await isCommunityAdmin(requesterId, communityId);
    if (!isAdmin && requesterId !== targetUserId) {
      throw new AppError('Forbidden: only community admins can remove other members', 403);
    }

    // Verify the target is a member (for self-removal, requester should have a role)
    const targetRole = await communityMemberRepository.getUserRole(communityId, targetUserId);
    if (!targetRole) {
      throw new AppError('User is not a member of this community', 404);
    }

    // Remove membership
    await communityMemberRepository.removeMember(communityId, targetUserId);

    // Check if removed
    const remainingRole = await communityMemberRepository.getUserRole(communityId, targetUserId);
    if (remainingRole) {
      throw new AppError('Failed to remove member', 500);
    }
  }

  async updateMemberRole(
    communityId: string,
    targetUserId: string,
    newRole: string,
    requesterId: string
  ): Promise<void> {
    const isAdmin = await isCommunityAdmin(requesterId, communityId);
    if (!isAdmin) {
      throw new AppError('Forbidden: only community admins can update member roles', 403);
    }

    // Check if user is member
    const existingRole = await communityMemberRepository.getUserRole(communityId, targetUserId);
    if (!existingRole) {
      throw new AppError('User is not a member of this community', 404);
    }

    // Update role (overwrites due to unique constraint)
    await communityMemberRepository.updateRole(
      communityId,
      targetUserId,
      newRole as 'member' | 'admin' | 'reader'
    );
  }

  async getUserRoleInCommunity(
    communityId: string,
    userId: string,
    requesterId: string
  ): Promise<CommunityMember | null> {
    // For /members/:userId, require requester is admin
    if (userId !== requesterId) {
      const isAdmin = await isCommunityAdmin(requesterId, communityId);
      if (!isAdmin) {
        throw new AppError('Forbidden: only admins can view other members roles', 403);
      }
    }
    // For /me, just check if requester is member (role exists)

    const roles = await communityMemberRepository.getUserRoles(communityId, userId);
    if (!roles || roles.length === 0) {
      return null;
    }

    // Fetch user details from app_users (userId is the user ID)
    const user = await appUserRepository.findById(userId);

    return {
      userId,
      roles,
      displayName: user?.displayName,
      email: user?.email,
      profileImage: user?.profileImage,
    };
  }
}

export const communityService = new CommunityService();
