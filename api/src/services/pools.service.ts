import { poolsRepository } from '@repositories/pools.repository';
import { wealthRepository } from '@repositories/wealth.repository';
import { needsRepository } from '@repositories/needs.repository';
import { councilRepository } from '@repositories/council.repository';
import { itemsRepository } from '@repositories/items.repository';
import { appUserRepository } from '@repositories/appUser.repository';
import { openFGAService } from './openfga.service';
import { AppError } from '@utils/errors';
import type {
  CreatePoolRequest,
  UpdatePoolRequest,
  PoolResponse,
  ContributeToPoolRequest,
  DistributeFromPoolRequest,
  MassDistributeRequest,
  MassDistributePreviewResponse,
  PendingContributionResponse,
  PoolDistributionResponse,
} from '@/types/pools.types';

export class PoolsService {
  /**
   * Create a new pool (council managers only)
   */
  async createPool(
    communityId: string,
    councilId: string,
    data: CreatePoolRequest,
    userId: string
  ): Promise<PoolResponse> {
    // 1. Verify council exists
    const council = await councilRepository.findById(councilId);
    if (!council || council.deletedAt) {
      throw new AppError('Council not found', 404);
    }

    // 2. Verify council belongs to community
    if (council.communityId !== communityId) {
      throw new AppError('Council does not belong to this community', 400);
    }

    // 3. Check if user is a council manager
    const isManager = await councilRepository.isManager(councilId, userId);
    if (!isManager) {
      throw new AppError('Only council managers can create pools', 403);
    }

    // 4. Verify primary item exists if provided
    if (data.primaryItemId) {
      const item = await itemsRepository.findById(data.primaryItemId);
      if (!item || item.communityId !== communityId) {
        throw new AppError('Primary item not found or does not belong to this community', 400);
      }
    }

    // 5. Create pool
    const pool = await poolsRepository.create({
      communityId,
      councilId,
      name: data.name,
      description: data.description,
      primaryItemId: data.primaryItemId ?? null,
      distributionType: data.distributionType,
      maxUnitsPerUser: data.maxUnitsPerUser ?? null,
      minimumContribution: data.minimumContribution ?? null,
      createdBy: userId,
    });

    // 6. Create OpenFGA relationships
    try {
      // Pool-to-community relationship for hierarchical permissions
      await openFGAService.createRelationship(
        'pool',
        pool.id,
        'parent_community',
        'community',
        communityId
      );

      // Pool-to-council relationship
      await openFGAService.createRelationship(
        'pool',
        pool.id,
        'parent_council',
        'council',
        councilId
      );
    } catch (error) {
      console.error('Failed to create pool OpenFGA relationships:', error);
      // Non-fatal - pool still created
    }

    // 7. Return with details
    return await this.getPoolWithDetails(pool.id, userId);
  }

  /**
   * Get pool by ID with full details
   */
  async getPool(poolId: string, userId: string): Promise<PoolResponse> {
    const pool = await poolsRepository.findById(poolId);
    if (!pool || pool.deletedAt) {
      throw new AppError('Pool not found', 404);
    }

    // Check if user has permission to view pools in this community
    const canView = await openFGAService.checkAccess(
      userId,
      'community',
      pool.communityId,
      'can_view_wealth' // Pools are part of wealth system
    );

    if (!canView) {
      throw new AppError('You do not have permission to view pools in this community', 403);
    }

    return await this.getPoolWithDetails(poolId, userId);
  }

  /**
   * List all pools in a community
   */
  async listCommunityPools(communityId: string, userId: string): Promise<PoolResponse[]> {
    // Check if user has permission to view pools
    const canView = await openFGAService.checkAccess(
      userId,
      'community',
      communityId,
      'can_view_wealth'
    );

    if (!canView) {
      throw new AppError('You do not have permission to view pools in this community', 403);
    }

    const pools = await poolsRepository.listByCommunity(communityId);

    // Get details for each pool
    return await Promise.all(pools.map((pool) => this.getPoolWithDetails(pool.id, userId)));
  }

  /**
   * Update pool settings (council managers only)
   */
  async updatePool(poolId: string, data: UpdatePoolRequest, userId: string): Promise<PoolResponse> {
    // 1. Verify pool exists
    const pool = await poolsRepository.findById(poolId);
    if (!pool || pool.deletedAt) {
      throw new AppError('Pool not found', 404);
    }

    // 2. Check if user is a council manager
    const isManager = await councilRepository.isManager(pool.councilId, userId);
    if (!isManager) {
      throw new AppError('Only council managers can update pools', 403);
    }

    // 3. Verify primary item if provided
    if (data.primaryItemId) {
      const item = await itemsRepository.findById(data.primaryItemId);
      if (!item || item.communityId !== pool.communityId) {
        throw new AppError('Primary item not found or does not belong to this community', 400);
      }
    }

    // 4. Update pool
    await poolsRepository.update(poolId, {
      name: data.name,
      description: data.description,
      primaryItemId: data.primaryItemId,
      distributionType: data.distributionType,
      maxUnitsPerUser: data.maxUnitsPerUser,
      minimumContribution: data.minimumContribution,
    });

    return await this.getPoolWithDetails(poolId, userId);
  }

  /**
   * Delete pool (council managers only)
   */
  async deletePool(poolId: string, userId: string): Promise<void> {
    // 1. Verify pool exists
    const pool = await poolsRepository.findById(poolId);
    if (!pool || pool.deletedAt) {
      throw new AppError('Pool not found', 404);
    }

    // 2. Check if user is a council manager
    const isManager = await councilRepository.isManager(pool.councilId, userId);
    if (!isManager) {
      throw new AppError('Only council managers can delete pools', 403);
    }

    // 3. Soft delete pool
    await poolsRepository.delete(poolId);
  }

  /**
   * Contribute to pool (creates wealth share with targetPoolId)
   */
  async contributeToPool(
    poolId: string,
    data: ContributeToPoolRequest,
    userId: string
  ): Promise<any> {
    // 1. Verify pool exists
    const pool = await poolsRepository.findById(poolId);
    if (!pool || pool.deletedAt) {
      throw new AppError('Pool not found', 404);
    }

    // 2. Check if user has permission to create wealth
    const canCreate = await openFGAService.checkAccess(
      userId,
      'community',
      pool.communityId,
      'can_create_wealth'
    );

    if (!canCreate) {
      throw new AppError('You do not have permission to contribute to pools', 403);
    }

    // 3. Verify item exists
    const item = await itemsRepository.findById(data.itemId);
    if (!item || item.communityId !== pool.communityId) {
      throw new AppError('Item not found or does not belong to this community', 400);
    }

    // 4. Check minimum contribution
    if (pool.minimumContribution && data.unitsOffered < pool.minimumContribution) {
      throw new AppError(`Minimum contribution is ${pool.minimumContribution} units`, 400);
    }

    // 5. Create wealth entry with pool target
    // Pool contributions are tracked via wealth entries with targetPoolId, not via wealth_requests
    const wealth = await wealthRepository.createWealth({
      createdBy: userId,
      communityId: pool.communityId,
      itemId: data.itemId,
      title: data.title,
      description: data.description ?? null,
      durationType: 'unlimited',
      distributionType: 'unit_based',
      unitsAvailable: data.unitsOffered,
      sharingTarget: 'pool',
      targetPoolId: poolId,
      status: 'active',
    });

    return { wealth };
  }

  /**
   * List pending contributions to pool (council managers only)
   */
  async listPendingContributions(
    poolId: string,
    userId: string
  ): Promise<PendingContributionResponse[]> {
    // 1. Verify pool exists
    const pool = await poolsRepository.findById(poolId);
    if (!pool || pool.deletedAt) {
      throw new AppError('Pool not found', 404);
    }

    // 2. Check if user is a council manager
    const isManager = await councilRepository.isManager(pool.councilId, userId);
    if (!isManager) {
      throw new AppError('Only council managers can view pending contributions', 403);
    }

    // 3. Get pending contributions (wealth with targetPoolId and active status, includes item)
    const wealthRecords = await wealthRepository.getPendingContributionsByPoolId(poolId);

    // 4. Transform to response format with user names
    const contributions = await Promise.all(
      wealthRecords.map(async (wealth: any) => {
        // Get contributor info
        const contributor = await appUserRepository.findById(wealth.createdBy);
        const contributorName =
          contributor?.displayName || contributor?.username || contributor?.email || 'Unknown User';

        return {
          wealthId: wealth.id,
          contributorId: wealth.createdBy,
          contributorName,
          itemId: wealth.itemId,
          itemName: wealth.item?.name || 'Unknown Item',
          unitsOffered: wealth.unitsAvailable || 0,
          message: wealth.description,
          createdAt: wealth.createdAt,
        };
      })
    );

    return contributions;
  }

  /**
   * Confirm pool contribution (council managers only)
   * Updates wealth_request status and increments pool inventory
   */
  async confirmContribution(poolId: string, wealthId: string, userId: string): Promise<void> {
    // 1. Verify pool and wealth
    const pool = await poolsRepository.findById(poolId);
    if (!pool || pool.deletedAt) {
      throw new AppError('Pool not found', 404);
    }

    const wealth = await wealthRepository.findById(wealthId);
    if (!wealth || wealth.targetPoolId !== poolId) {
      throw new AppError('Wealth contribution not found for this pool', 404);
    }

    // 2. Check if user is a council manager
    const isManager = await councilRepository.isManager(pool.councilId, userId);
    if (!isManager) {
      throw new AppError('Only council managers can confirm contributions', 403);
    }

    // 3. Verify wealth is still active (not already confirmed/rejected)
    if (wealth.status !== 'active') {
      throw new AppError('Contribution has already been processed', 400);
    }

    // 4. Mark wealth as fulfilled
    await wealthRepository.markFulfilled(wealthId);

    // 5. Increment pool inventory
    await poolsRepository.incrementInventory(poolId, wealth.itemId, wealth.unitsAvailable ?? 1);
  }

  /**
   * Reject pool contribution (council managers only)
   */
  async rejectContribution(poolId: string, wealthId: string, userId: string): Promise<void> {
    // 1. Verify pool and wealth
    const pool = await poolsRepository.findById(poolId);
    if (!pool || pool.deletedAt) {
      throw new AppError('Pool not found', 404);
    }

    const wealth = await wealthRepository.findById(wealthId);
    if (!wealth || wealth.targetPoolId !== poolId) {
      throw new AppError('Wealth contribution not found for this pool', 404);
    }

    // 2. Check if user is a council manager
    const isManager = await councilRepository.isManager(pool.councilId, userId);
    if (!isManager) {
      throw new AppError('Only council managers can reject contributions', 403);
    }

    // 3. Verify wealth is still active (not already confirmed/rejected)
    if (wealth.status !== 'active') {
      throw new AppError('Contribution has already been processed', 400);
    }

    // 4. Cancel the wealth
    await wealthRepository.cancelWealth(wealthId);
  }

  /**
   * Distribute from pool manually (council managers only)
   */
  async distributeFromPool(
    poolId: string,
    data: DistributeFromPoolRequest,
    userId: string
  ): Promise<any> {
    // 1. Verify pool exists
    const pool = await poolsRepository.findById(poolId);
    if (!pool || pool.deletedAt) {
      throw new AppError('Pool not found', 404);
    }

    // 2. Check if user is a council manager
    const isManager = await councilRepository.isManager(pool.councilId, userId);
    if (!isManager) {
      throw new AppError('Only council managers can distribute from pools', 403);
    }

    // 3. Verify recipient exists
    const recipient = await appUserRepository.findById(data.recipientId);
    if (!recipient) {
      throw new AppError('Recipient not found', 404);
    }

    // 4. Verify item exists
    const item = await itemsRepository.findById(data.itemId);
    if (!item) {
      throw new AppError('Item not found', 404);
    }

    // 5. Check if pool has sufficient inventory
    const available = await poolsRepository.getInventoryForItem(poolId, data.itemId);
    if (available < data.unitsDistributed) {
      throw new AppError(
        `Insufficient inventory. Available: ${available}, Requested: ${data.unitsDistributed}`,
        400
      );
    }

    // 6. Decrement inventory first (atomic check)
    const decremented = await poolsRepository.decrementInventory(
      poolId,
      data.itemId,
      data.unitsDistributed
    );

    if (!decremented) {
      throw new AppError('Failed to decrement inventory (insufficient units)', 400);
    }

    // 7. Create wealth entry (from council, with sourcePoolId)
    const wealth = await wealthRepository.createWealth({
      createdBy: pool.councilId, // Council creates the wealth
      communityId: pool.communityId,
      itemId: data.itemId,
      title: data.title,
      description: data.description ?? null,
      durationType: 'unlimited',
      distributionType: 'unit_based',
      unitsAvailable: data.unitsDistributed,
      sharingTarget: 'community',
      sourcePoolId: poolId,
      status: 'fulfilled', // Auto-fulfilled
    });

    // 8. Create auto-fulfilled request for recipient
    const request = await wealthRepository.createWealthRequest({
      wealthId: wealth.id,
      requesterId: data.recipientId,
      message: `Pool distribution from ${pool.name}`,
      unitsRequested: data.unitsDistributed,
    });

    await wealthRepository.acceptRequest(request.id);
    await wealthRepository.markRequestFulfilled(request.id);

    return { wealth, request };
  }

  /**
   * Preview needs-based mass distribution
   */
  async previewMassDistribution(
    poolId: string,
    data: MassDistributeRequest,
    userId: string
  ): Promise<MassDistributePreviewResponse> {
    // 1. Verify pool and permissions
    const pool = await poolsRepository.findById(poolId);
    if (!pool || pool.deletedAt) {
      throw new AppError('Pool not found', 404);
    }

    const isManager = await councilRepository.isManager(pool.councilId, userId);
    if (!isManager) {
      throw new AppError('Only council managers can preview distributions', 403);
    }

    // 2. Get available inventory for item
    const totalAvailable = await poolsRepository.getInventoryForItem(poolId, data.itemId);

    // 3. Get all active needs for this item in the community
    const allNeeds = await needsRepository.listNeeds({
      communityId: pool.communityId,
      status: 'active',
    });

    const itemNeeds = allNeeds.filter((need) => need.itemId === data.itemId);

    // 4. Filter by selected users if provided
    const filteredNeeds = data.selectedUserIds
      ? itemNeeds.filter((need) => data.selectedUserIds!.includes(need.createdBy))
      : itemNeeds;

    // 5. Calculate distribution amounts based on strategy
    const maxPerUser = data.maxUnitsPerUser ?? pool.maxUnitsPerUser ?? Infinity;
    let remainingUnits = totalAvailable;
    const totalNeeded = filteredNeeds.reduce((sum, need) => sum + need.unitsNeeded, 0);

    const potentialRecipients = filteredNeeds.map((need) => {
      let unitsWillReceive = 0;

      if (data.fulfillmentStrategy === 'full') {
        // Try to fulfill complete need, up to max per user
        unitsWillReceive = Math.min(need.unitsNeeded, maxPerUser, remainingUnits);
      } else if (data.fulfillmentStrategy === 'equal') {
        // Equal distribution
        const equalShare = Math.floor(totalAvailable / filteredNeeds.length);
        unitsWillReceive = Math.min(equalShare, need.unitsNeeded, maxPerUser);
      } else {
        // Partial - proportional distribution
        const proportion = need.unitsNeeded / totalNeeded;
        const proportionalAmount = Math.floor(totalAvailable * proportion);
        unitsWillReceive = Math.min(proportionalAmount, need.unitsNeeded, maxPerUser);
      }

      remainingUnits -= unitsWillReceive;

      return {
        userId: need.createdBy,
        userName: 'Unknown', // Will be filled below
        unitsNeeded: need.unitsNeeded,
        unitsWillReceive,
        priority: need.priority,
      };
    });

    // 6. Fetch user names
    const userIds = potentialRecipients.map((r) => r.userId);
    const users = await Promise.all(userIds.map((id) => appUserRepository.findById(id)));

    const enrichedRecipients = potentialRecipients.map((recipient, index) => ({
      ...recipient,
      userName: users[index]?.displayName ?? users[index]?.username ?? 'Unknown',
    }));

    return {
      totalAvailable,
      totalNeeded,
      potentialRecipients: enrichedRecipients,
    };
  }

  /**
   * Execute needs-based mass distribution (council managers only)
   */
  async executeMassDistribution(
    poolId: string,
    data: MassDistributeRequest,
    userId: string
  ): Promise<{ distributionsCreated: number; totalUnitsDistributed: number }> {
    // 1. Get preview first
    const preview = await this.previewMassDistribution(poolId, data, userId);

    // 2. Filter out recipients who will receive 0 units
    const actualRecipients = preview.potentialRecipients.filter((r) => r.unitsWillReceive > 0);

    if (actualRecipients.length === 0) {
      throw new AppError('No distributions to create (all recipients would receive 0 units)', 400);
    }

    // 3. Calculate total units to distribute
    const totalUnitsDistributed = actualRecipients.reduce((sum, r) => sum + r.unitsWillReceive, 0);

    // 4. Decrement inventory (atomic check)
    const decremented = await poolsRepository.batchDecrementInventory(
      poolId,
      data.itemId,
      totalUnitsDistributed
    );

    if (!decremented) {
      throw new AppError('Failed to decrement inventory (insufficient units)', 400);
    }

    // 5. Get pool for details
    const pool = await poolsRepository.findById(poolId);
    const item = await itemsRepository.findById(data.itemId);

    // 6. Create wealth entries for each recipient
    for (const recipient of actualRecipients) {
      // Create wealth
      const wealth = await wealthRepository.createWealth({
        createdBy: pool!.councilId,
        communityId: pool!.communityId,
        itemId: data.itemId,
        title: `${item!.name} from ${pool!.name}`,
        description: `Mass distribution from pool`,
        durationType: 'unlimited',
        distributionType: 'unit_based',
        unitsAvailable: recipient.unitsWillReceive,
        sharingTarget: 'community',
        sourcePoolId: poolId,
        status: 'fulfilled',
      });

      // Create auto-fulfilled request
      const request = await wealthRepository.createWealthRequest({
        wealthId: wealth.id,
        requesterId: recipient.userId,
        message: `Mass distribution from ${pool!.name}`,
        unitsRequested: recipient.unitsWillReceive,
      });

      await wealthRepository.acceptRequest(request.id);
      await wealthRepository.markRequestFulfilled(request.id);
    }

    return {
      distributionsCreated: actualRecipients.length,
      totalUnitsDistributed,
    };
  }

  /**
   * List distributions from pool (council managers only)
   */
  async listDistributions(poolId: string, userId: string): Promise<PoolDistributionResponse[]> {
    // 1. Verify pool exists
    const pool = await poolsRepository.findById(poolId);
    if (!pool || pool.deletedAt) {
      throw new AppError('Pool not found', 404);
    }

    // 2. Check if user is a council manager
    const isManager = await councilRepository.isManager(pool.councilId, userId);
    if (!isManager) {
      throw new AppError('Only council managers can view distributions', 403);
    }

    // 3. Get distributions (wealth with sourcePoolId, includes item and request)
    const wealthRecords = await wealthRepository.getDistributionsByPoolId(poolId);

    // 4. Transform to response format with user names
    const distributions = await Promise.all(
      wealthRecords.map(async (wealth: any) => {
        // Get recipient info from wealth request
        const recipientId = wealth.wealthRequest?.requesterId;
        let recipientName = 'Unknown User';

        if (recipientId) {
          const recipient = await appUserRepository.findById(recipientId);
          recipientName =
            recipient?.displayName || recipient?.username || recipient?.email || 'Unknown User';
        }

        return {
          wealthId: wealth.id,
          recipientId: recipientId || '',
          recipientName,
          itemId: wealth.itemId,
          itemName: wealth.item?.name || 'Unknown Item',
          unitsDistributed: wealth.unitsAvailable || 0,
          createdAt: wealth.createdAt.toISOString(),
          isMassDistribution: false, // Can be enhanced later with additional metadata
        };
      })
    );

    return distributions;
  }

  /**
   * Get pool inventory
   */
  async getPoolInventory(poolId: string, userId: string): Promise<any[]> {
    const pool = await poolsRepository.findById(poolId);
    if (!pool || pool.deletedAt) {
      throw new AppError('Pool not found', 404);
    }

    const canView = await openFGAService.checkAccess(
      userId,
      'community',
      pool.communityId,
      'can_view_wealth'
    );

    if (!canView) {
      throw new AppError('You do not have permission to view pool inventory', 403);
    }

    return await poolsRepository.getInventory(poolId);
  }

  /**
   * Helper: Get pool with full details
   */
  private async getPoolWithDetails(poolId: string, userId: string): Promise<PoolResponse> {
    const poolWithDetails = await poolsRepository.findByIdWithDetails(poolId);
    if (!poolWithDetails) {
      throw new AppError('Pool not found', 404);
    }

    return {
      id: poolWithDetails.id,
      communityId: poolWithDetails.communityId,
      councilId: poolWithDetails.councilId,
      councilName: poolWithDetails.councilName,
      name: poolWithDetails.name,
      description: poolWithDetails.description,
      primaryItem:
        poolWithDetails.primaryItemId && poolWithDetails.primaryItemName
          ? { id: poolWithDetails.primaryItemId, name: poolWithDetails.primaryItemName }
          : undefined,
      distributionType: poolWithDetails.distributionType,
      maxUnitsPerUser: poolWithDetails.maxUnitsPerUser ?? undefined,
      minimumContribution: poolWithDetails.minimumContribution ?? undefined,
      inventory: poolWithDetails.inventory,
      createdBy: poolWithDetails.createdBy,
      createdAt: poolWithDetails.createdAt.toISOString(),
      updatedAt: poolWithDetails.updatedAt.toISOString(),
    };
  }
}

export const poolsService = new PoolsService();
