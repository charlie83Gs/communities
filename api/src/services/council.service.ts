import {
  councilRepository,
  CreateCouncilDto,
  UpdateCouncilDto,
} from '../repositories/council.repository';
import { communityMemberRepository } from '../repositories/communityMember.repository';
import { appUserRepository } from '../repositories/appUser.repository';
import { AppError } from '../utils/errors';
import { openFGAService } from './openfga.service';
import logger from '../utils/logger';

export type CouncilWithDetails = {
  id: string;
  name: string;
  description: string;
  trustScore: number;
  memberCount: number;
  createdAt: Date | null;
  createdBy: string;
  managers?: Array<{
    userId: string;
    userName: string;
    addedAt: Date | null;
  }>;
};

export class CouncilService {
  /**
   * Create a new council
   */
  async createCouncil(data: CreateCouncilDto, userId: string): Promise<CouncilWithDetails> {
    logger.info(`[CouncilService createCouncil] Creating council for userId: ${userId}`);

    // Verify user is a member
    const userRole = await communityMemberRepository.getUserRole(data.communityId, userId);
    if (!userRole) {
      throw new AppError('Forbidden: not a member of this community', 403);
    }

    // Check permission using OpenFGA
    // This checks: admin OR council_creator OR trust_council_creator
    const canCreate = await openFGAService.checkAccess(
      userId,
      'community',
      data.communityId,
      'can_create_council'
    );
    if (!canCreate) {
      throw new AppError('Forbidden: insufficient permissions to create councils', 403);
    }

    // Validate name length (3-100 characters)
    if (data.name.length < 3 || data.name.length > 100) {
      throw new AppError('Council name must be between 3 and 100 characters', 400);
    }

    // Validate description length (10-1000 characters)
    if (data.description.length < 10 || data.description.length > 1000) {
      throw new AppError('Council description must be between 10 and 1000 characters', 400);
    }

    // Check for duplicate council name in community
    const existingCouncils = await councilRepository.findByCommunityId(data.communityId);
    const duplicateName = existingCouncils.councils.some(
      (c) => c.name.toLowerCase() === data.name.toLowerCase()
    );
    if (duplicateName) {
      throw new AppError('A council with this name already exists in this community', 400);
    }

    // Create council
    const council = await councilRepository.create({
      ...data,
      createdBy: userId,
    });

    logger.info(`[CouncilService createCouncil] Council created with id: ${council.id}`);

    // Create OpenFGA relationships for the council
    try {
      // Link council to parent community
      await openFGAService.createRelationship(
        'council',
        council.id,
        'parent_community',
        'community',
        data.communityId
      );
      logger.info(
        `[CouncilService createCouncil] OpenFGA parent_community relation created for council: ${council.id}`
      );
    } catch (err) {
      logger.error(
        `[CouncilService createCouncil] Failed to create OpenFGA parent_community relation:`,
        err
      );
      // Rollback: delete the council since permissions won't work
      await councilRepository.delete(council.id);
      throw new AppError('Failed to create council: authorization setup failed', 500);
    }

    // Auto-assign creator as council manager
    try {
      await councilRepository.addManager(council.id, userId);

      // Assign OpenFGA member relation for can_manage permission
      await openFGAService.assignRelation(userId, 'user', 'member', 'council', council.id);

      logger.info(
        `[CouncilService createCouncil] Creator auto-assigned as manager for council: ${council.id}`
      );
    } catch (err) {
      logger.error(`[CouncilService createCouncil] Failed to auto-assign creator as manager:`, err);
      // Non-critical: council is still usable, admin can add managers manually
    }

    return {
      id: council.id,
      name: council.name,
      description: council.description,
      trustScore: 0,
      memberCount: 1, // Creator is now a manager
      createdAt: council.createdAt,
      createdBy: council.createdBy,
    };
  }

  /**
   * Get council by ID with details
   */
  async getCouncil(councilId: string, userId: string): Promise<CouncilWithDetails> {
    const council = await councilRepository.findById(councilId);
    if (!council) {
      throw new AppError('Council not found', 404);
    }

    // Check user is member of the community
    const userRole = await communityMemberRepository.getUserRole(council.communityId, userId);
    if (!userRole) {
      throw new AppError('Forbidden: not a member of this community', 403);
    }

    // Get trust score
    const trustScore = await councilRepository.getTrustScore(councilId);

    // Get member count
    const memberCount = await councilRepository.getMemberCount(councilId);

    // Get managers with user details
    const managers = await councilRepository.getManagers(councilId);
    const managersWithDetails = await Promise.all(
      managers.map(async (m) => {
        const user = await appUserRepository.findById(m.userId);
        return {
          userId: m.userId,
          userName: user?.displayName || user?.email || 'Unknown',
          addedAt: m.addedAt,
        };
      })
    );

    return {
      id: council.id,
      name: council.name,
      description: council.description,
      trustScore,
      memberCount,
      createdAt: council.createdAt,
      createdBy: council.createdBy,
      managers: managersWithDetails,
    };
  }

  /**
   * List councils in a community
   */
  async listCouncils(
    communityId: string,
    userId: string,
    options: {
      page?: number;
      limit?: number;
      sortBy?: 'trustScore' | 'createdAt';
      order?: 'asc' | 'desc';
    } = {}
  ) {
    // Check user is member of the community
    const userRole = await communityMemberRepository.getUserRole(communityId, userId);
    if (!userRole) {
      throw new AppError('Forbidden: not a member of this community', 403);
    }

    const result = await councilRepository.findByCommunityId(communityId, options);

    // Get member count for each council
    const councilsWithDetails = await Promise.all(
      result.councils.map(async (council) => {
        const memberCount = await councilRepository.getMemberCount(council.id);
        return {
          id: council.id,
          name: council.name,
          description: council.description,
          trustScore: council.trustScore,
          memberCount,
          createdAt: council.createdAt,
          createdBy: council.createdBy,
        };
      })
    );

    return {
      councils: councilsWithDetails,
      total: result.total,
      page: options.page || 1,
      limit: options.limit || 20,
    };
  }

  /**
   * Update council details
   */
  async updateCouncil(councilId: string, data: UpdateCouncilDto, userId: string) {
    const council = await councilRepository.findById(councilId);
    if (!council) {
      throw new AppError('Council not found', 404);
    }

    // Check permission using OpenFGA
    // This checks: admin OR council manager
    const canUpdate = await openFGAService.checkAccess(userId, 'council', councilId, 'can_update');
    if (!canUpdate) {
      throw new AppError('Forbidden: insufficient permissions to update this council', 403);
    }

    // Validate name if provided
    if (data.name) {
      if (data.name.length < 3 || data.name.length > 100) {
        throw new AppError('Council name must be between 3 and 100 characters', 400);
      }

      // Check for duplicate name
      const existingCouncils = await councilRepository.findByCommunityId(council.communityId);
      const duplicateName = existingCouncils.councils.some(
        (c) => c.id !== councilId && c.name.toLowerCase() === data.name!.toLowerCase()
      );
      if (duplicateName) {
        throw new AppError('A council with this name already exists in this community', 400);
      }
    }

    // Validate description if provided
    if (data.description) {
      if (data.description.length < 10 || data.description.length > 1000) {
        throw new AppError('Council description must be between 10 and 1000 characters', 400);
      }
    }

    const updated = await councilRepository.update(councilId, data);
    if (!updated) {
      throw new AppError('Failed to update council', 500);
    }

    const trustScore = await councilRepository.getTrustScore(councilId);
    const memberCount = await councilRepository.getMemberCount(councilId);

    return {
      id: updated.id,
      name: updated.name,
      description: updated.description,
      trustScore,
      memberCount,
      createdAt: updated.createdAt,
      createdBy: updated.createdBy,
    };
  }

  /**
   * Delete a council
   */
  async deleteCouncil(councilId: string, userId: string) {
    const council = await councilRepository.findById(councilId);
    if (!council) {
      throw new AppError('Council not found', 404);
    }

    // Check permission using OpenFGA (admin only)
    const canDelete = await openFGAService.checkAccess(userId, 'council', councilId, 'can_delete');
    if (!canDelete) {
      throw new AppError('Forbidden: insufficient permissions to delete this council', 403);
    }

    await councilRepository.delete(councilId);

    return { success: true };
  }

  /**
   * Award trust to a council
   */
  async awardTrust(councilId: string, userId: string) {
    const council = await councilRepository.findById(councilId);
    if (!council) {
      throw new AppError('Council not found', 404);
    }

    // Check user is member of the community
    const userRole = await communityMemberRepository.getUserRole(council.communityId, userId);
    if (!userRole) {
      throw new AppError('Forbidden: not a member of this community', 403);
    }

    // Check if already awarded
    const hasAwarded = await councilRepository.hasAwardedTrust(councilId, userId);
    if (hasAwarded) {
      throw new AppError('You have already awarded trust to this council', 400);
    }

    await councilRepository.awardTrust(councilId, userId);
    const trustScore = await councilRepository.getTrustScore(councilId);

    return {
      trustScore,
      userHasTrusted: true,
    };
  }

  /**
   * Remove trust from a council
   */
  async removeTrust(councilId: string, userId: string) {
    const council = await councilRepository.findById(councilId);
    if (!council) {
      throw new AppError('Council not found', 404);
    }

    // Check user is member of the community
    const userRole = await communityMemberRepository.getUserRole(council.communityId, userId);
    if (!userRole) {
      throw new AppError('Forbidden: not a member of this community', 403);
    }

    // Check if actually awarded
    const hasAwarded = await councilRepository.hasAwardedTrust(councilId, userId);
    if (!hasAwarded) {
      throw new AppError('You have not awarded trust to this council', 400);
    }

    await councilRepository.removeTrust(councilId, userId);
    const trustScore = await councilRepository.getTrustScore(councilId);

    return {
      trustScore,
      userHasTrusted: false,
    };
  }

  /**
   * Get trust status for current user
   */
  async getTrustStatus(councilId: string, userId: string) {
    const council = await councilRepository.findById(councilId);
    if (!council) {
      throw new AppError('Council not found', 404);
    }

    // Check user is member of the community
    const userRole = await communityMemberRepository.getUserRole(council.communityId, userId);
    if (!userRole) {
      throw new AppError('Forbidden: not a member of this community', 403);
    }

    const userHasTrusted = await councilRepository.hasAwardedTrust(councilId, userId);
    const trustScore = await councilRepository.getTrustScore(councilId);

    // Check if user can award trust (same permission as awarding trust to users)
    const canAwardTrust = await openFGAService.checkAccess(
      userId,
      'community',
      council.communityId,
      'can_award_trust'
    );

    return {
      userHasTrusted,
      trustScore,
      canAwardTrust,
    };
  }

  /**
   * Add a manager to a council
   */
  async addManager(councilId: string, targetUserId: string, requesterId: string) {
    const council = await councilRepository.findById(councilId);
    if (!council) {
      throw new AppError('Council not found', 404);
    }

    // Check permission using OpenFGA (admin OR council manager)
    const canUpdate = await openFGAService.checkAccess(
      requesterId,
      'council',
      councilId,
      'can_update'
    );
    if (!canUpdate) {
      throw new AppError('Forbidden: insufficient permissions to manage council managers', 403);
    }

    // Check if target user is a member of the community
    const targetUserRole = await communityMemberRepository.getUserRole(
      council.communityId,
      targetUserId
    );
    if (!targetUserRole) {
      throw new AppError('User is not a member of this community', 400);
    }

    // Check if already a manager
    const isTargetManager = await councilRepository.isManager(councilId, targetUserId);
    if (isTargetManager) {
      throw new AppError('User is already a manager of this council', 400);
    }

    await councilRepository.addManager(councilId, targetUserId);

    // Assign OpenFGA member relation for can_manage permission
    try {
      await openFGAService.assignRelation(targetUserId, 'user', 'member', 'council', councilId);
      logger.info(
        `[CouncilService addManager] OpenFGA member relation assigned for user: ${targetUserId} on council: ${councilId}`
      );
    } catch (err) {
      logger.error(`[CouncilService addManager] Failed to assign OpenFGA member relation:`, err);
      // Rollback the database change
      await councilRepository.removeManager(councilId, targetUserId);
      throw new AppError('Failed to add manager: authorization setup failed', 500);
    }

    // Get updated managers list
    const managers = await councilRepository.getManagers(councilId);
    const managersWithDetails = await Promise.all(
      managers.map(async (m) => {
        const user = await appUserRepository.findById(m.userId);
        return {
          userId: m.userId,
          userName: user?.displayName || user?.email || 'Unknown',
          userEmail: user?.email || 'Unknown',
          addedAt: m.addedAt,
        };
      })
    );

    return {
      success: true,
      managers: managersWithDetails,
    };
  }

  /**
   * Remove a manager from a council
   */
  async removeManager(councilId: string, targetUserId: string, requesterId: string) {
    const council = await councilRepository.findById(councilId);
    if (!council) {
      throw new AppError('Council not found', 404);
    }

    // Check permission using OpenFGA (admin only)
    const canDelete = await openFGAService.checkAccess(
      requesterId,
      'council',
      councilId,
      'can_delete'
    );
    if (!canDelete) {
      throw new AppError('Forbidden: insufficient permissions to remove council managers', 403);
    }

    // Check if actually a manager
    const isManager = await councilRepository.isManager(councilId, targetUserId);
    if (!isManager) {
      throw new AppError('User is not a manager of this council', 400);
    }

    await councilRepository.removeManager(councilId, targetUserId);

    // Revoke OpenFGA member relation
    try {
      await openFGAService.revokeRelation(targetUserId, 'user', 'member', 'council', councilId);
      logger.info(
        `[CouncilService removeManager] OpenFGA member relation revoked for user: ${targetUserId} on council: ${councilId}`
      );
    } catch (err) {
      logger.error(`[CouncilService removeManager] Failed to revoke OpenFGA member relation:`, err);
      // Non-critical: the DB change is done, log the error but don't fail
    }

    return { success: true };
  }
}

export const councilService = new CouncilService();
