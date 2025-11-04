import { councilRepository, CreateCouncilDto, UpdateCouncilDto } from '../repositories/council.repository';
import { communityMemberRepository } from '../repositories/communityMember.repository';
import { communityRepository } from '../repositories/community.repository';
import { appUserRepository } from '../repositories/appUser.repository';
import { itemsRepository } from '../repositories/items.repository';
import { AppError } from '../utils/errors';
import { resolveTrustRequirement } from '../utils/trustResolver';
import { trustViewRepository } from '../repositories/trustView.repository';
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
  inventory?: Array<{
    itemId: string;
    itemName: string;
    quantity: number;
    unit: string | null;
  }>;
};

export class CouncilService {
  /**
   * Check if user is admin of the community
   */
  private async isAdmin(communityId: string, userId: string): Promise<boolean> {
    return await communityMemberRepository.isAdmin(communityId, userId);
  }

  /**
   * Check if user can create councils (admin OR trust threshold)
   */
  private async canCreateCouncil(communityId: string, userId: string): Promise<boolean> {
    const isAdmin = await this.isAdmin(communityId, userId);
    if (isAdmin) return true;

    // Check trust threshold (default: 25)
    const community = await communityRepository.findById(communityId);
    if (!community) {
      throw new AppError('Community not found', 404);
    }

    // Get minTrustForCouncilCreation from community config (not in schema yet, using default)
    const minTrustForCouncilCreation = 25; // TODO: Add to community schema

    const userTrust = await trustViewRepository.get(communityId, userId);
    const userTrustScore = userTrust?.points ?? 0;

    return userTrustScore >= minTrustForCouncilCreation;
  }

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

    // Check permission
    const canCreate = await this.canCreateCouncil(data.communityId, userId);
    if (!canCreate) {
      throw new AppError('Forbidden: insufficient trust to create councils', 403);
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
      c => c.name.toLowerCase() === data.name.toLowerCase()
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

    // Auto-assign creator as council manager
    try {
      await councilRepository.addManager(council.id, userId);
      logger.info(`[CouncilService createCouncil] Creator auto-assigned as manager for council: ${council.id}`);
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

    // Get inventory with item details
    const inventory = await councilRepository.getInventory(councilId);
    const inventoryWithDetails = await Promise.all(
      inventory.map(async (inv) => {
        const item = await itemsRepository.findById(inv.itemId);
        return {
          itemId: inv.itemId,
          itemName: item?.name || 'Unknown',
          quantity: inv.quantity,
          unit: inv.unit,
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
      inventory: inventoryWithDetails,
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
  async updateCouncil(
    councilId: string,
    data: UpdateCouncilDto,
    userId: string
  ) {
    const council = await councilRepository.findById(councilId);
    if (!council) {
      throw new AppError('Council not found', 404);
    }

    // Check if user is admin OR council manager
    const isAdmin = await this.isAdmin(council.communityId, userId);
    const isManager = await councilRepository.isManager(councilId, userId);

    if (!isAdmin && !isManager) {
      throw new AppError('Forbidden: only admins or council managers can update', 403);
    }

    // Validate name if provided
    if (data.name) {
      if (data.name.length < 3 || data.name.length > 100) {
        throw new AppError('Council name must be between 3 and 100 characters', 400);
      }

      // Check for duplicate name
      const existingCouncils = await councilRepository.findByCommunityId(council.communityId);
      const duplicateName = existingCouncils.councils.some(
        c => c.id !== councilId && c.name.toLowerCase() === data.name!.toLowerCase()
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
   * Delete a council (admin only)
   */
  async deleteCouncil(councilId: string, userId: string) {
    const council = await councilRepository.findById(councilId);
    if (!council) {
      throw new AppError('Council not found', 404);
    }

    // Only admins can delete councils
    const isAdmin = await this.isAdmin(council.communityId, userId);
    if (!isAdmin) {
      throw new AppError('Forbidden: only admins can delete councils', 403);
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

    return {
      userHasTrusted,
      trustScore,
    };
  }

  /**
   * Add a manager to a council (admin OR existing council manager)
   */
  async addManager(councilId: string, targetUserId: string, requesterId: string) {
    const council = await councilRepository.findById(councilId);
    if (!council) {
      throw new AppError('Council not found', 404);
    }

    // Check if requester is admin OR existing council manager
    const isAdmin = await this.isAdmin(council.communityId, requesterId);
    const isManager = await councilRepository.isManager(councilId, requesterId);

    if (!isAdmin && !isManager) {
      throw new AppError('Forbidden: only admins or council managers can add managers', 403);
    }

    // Check if target user is a member of the community
    const targetUserRole = await communityMemberRepository.getUserRole(council.communityId, targetUserId);
    if (!targetUserRole) {
      throw new AppError('User is not a member of this community', 400);
    }

    // Check if already a manager
    const isTargetManager = await councilRepository.isManager(councilId, targetUserId);
    if (isTargetManager) {
      throw new AppError('User is already a manager of this council', 400);
    }

    await councilRepository.addManager(councilId, targetUserId);

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
   * Remove a manager from a council (admin only)
   */
  async removeManager(councilId: string, targetUserId: string, requesterId: string) {
    const council = await councilRepository.findById(councilId);
    if (!council) {
      throw new AppError('Council not found', 404);
    }

    // Only admins can remove managers
    const isAdmin = await this.isAdmin(council.communityId, requesterId);
    if (!isAdmin) {
      throw new AppError('Forbidden: only admins can remove council managers', 403);
    }

    // Check if actually a manager
    const isManager = await councilRepository.isManager(councilId, targetUserId);
    if (!isManager) {
      throw new AppError('User is not a manager of this council', 400);
    }

    await councilRepository.removeManager(councilId, targetUserId);

    return { success: true };
  }

  /**
   * Get council inventory
   */
  async getInventory(councilId: string, userId: string) {
    const council = await councilRepository.findById(councilId);
    if (!council) {
      throw new AppError('Council not found', 404);
    }

    // Check user is member of the community
    const userRole = await communityMemberRepository.getUserRole(council.communityId, userId);
    if (!userRole) {
      throw new AppError('Forbidden: not a member of this community', 403);
    }

    const inventory = await councilRepository.getInventory(councilId);

    // Add item details
    const inventoryWithDetails = await Promise.all(
      inventory.map(async (inv) => {
        const item = await itemsRepository.findById(inv.itemId);
        return {
          itemId: inv.itemId,
          itemName: item?.name || 'Unknown',
          quantity: inv.quantity,
          unit: inv.unit,
        };
      })
    );

    return { inventory: inventoryWithDetails };
  }

  /**
   * Get council transactions
   */
  async getTransactions(
    councilId: string,
    userId: string,
    options: { page?: number; limit?: number } = {}
  ) {
    const council = await councilRepository.findById(councilId);
    if (!council) {
      throw new AppError('Council not found', 404);
    }

    // Check user is member of the community
    const userRole = await communityMemberRepository.getUserRole(council.communityId, userId);
    if (!userRole) {
      throw new AppError('Forbidden: not a member of this community', 403);
    }

    const result = await councilRepository.getTransactions(councilId, options);

    // Add item and user details
    const transactionsWithDetails = await Promise.all(
      result.transactions.map(async (tx) => {
        const item = await itemsRepository.findById(tx.itemId);
        let fromUser = undefined;
        if (tx.relatedUserId) {
          const user = await appUserRepository.findById(tx.relatedUserId);
          fromUser = user?.displayName || user?.email || 'Unknown';
        }

        return {
          id: tx.id,
          type: tx.type,
          itemId: tx.itemId,
          itemName: item?.name || 'Unknown',
          quantity: tx.quantity,
          description: tx.description,
          fromUser,
          toPool: tx.relatedPoolId,
          createdAt: tx.createdAt,
        };
      })
    );

    return {
      transactions: transactionsWithDetails,
      total: result.total,
    };
  }
}

export const councilService = new CouncilService();
