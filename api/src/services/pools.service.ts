import { poolsRepository as defaultPoolsRepository } from '@repositories/pools.repository';
import { wealthRepository as defaultWealthRepository } from '@repositories/wealth.repository';
import { needsRepository as defaultNeedsRepository } from '@repositories/needs.repository';
import { councilRepository as defaultCouncilRepository } from '@repositories/council.repository';
import { itemsRepository as defaultItemsRepository } from '@repositories/items.repository';
import { appUserRepository as defaultAppUserRepository } from '@repositories/appUser.repository';
import { recognizedContributionRepository as defaultRecognizedContributionRepository } from '@repositories/recognizedContribution.repository';
import { contributionSummaryRepository as defaultContributionSummaryRepository } from '@repositories/contributionSummary.repository';
import { openFGAService as defaultOpenFGAService } from './openfga.service';
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
  PoolNeedsResponse,
  PoolNeedsItemResponse,
  CouncilPoolsResponse,
  CouncilPoolSummary,
} from '@/types/pools.types';

export class PoolsService {
  private poolsRepository: typeof defaultPoolsRepository;
  private wealthRepository: typeof defaultWealthRepository;
  private needsRepository: typeof defaultNeedsRepository;
  private councilRepository: typeof defaultCouncilRepository;
  private itemsRepository: typeof defaultItemsRepository;
  private appUserRepository: typeof defaultAppUserRepository;
  private recognizedContributionRepository: typeof defaultRecognizedContributionRepository;
  private contributionSummaryRepository: typeof defaultContributionSummaryRepository;
  private openFGAService: typeof defaultOpenFGAService;

  constructor(
    poolsRepository = defaultPoolsRepository,
    wealthRepository = defaultWealthRepository,
    needsRepository = defaultNeedsRepository,
    councilRepository = defaultCouncilRepository,
    itemsRepository = defaultItemsRepository,
    appUserRepository = defaultAppUserRepository,
    recognizedContributionRepository = defaultRecognizedContributionRepository,
    contributionSummaryRepository = defaultContributionSummaryRepository,
    openFGAService = defaultOpenFGAService
  ) {
    this.poolsRepository = poolsRepository;
    this.wealthRepository = wealthRepository;
    this.needsRepository = needsRepository;
    this.councilRepository = councilRepository;
    this.itemsRepository = itemsRepository;
    this.appUserRepository = appUserRepository;
    this.recognizedContributionRepository = recognizedContributionRepository;
    this.contributionSummaryRepository = contributionSummaryRepository;
    this.openFGAService = openFGAService;
  }
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
    const council = await this.councilRepository.findById(councilId);
    if (!council || council.deletedAt) {
      throw new AppError('Council not found', 404);
    }

    // 2. Verify council belongs to community
    if (council.communityId !== communityId) {
      throw new AppError('Council does not belong to this community', 400);
    }

    // 3. Check if user is a council manager
    const isManager = await this.councilRepository.isManager(councilId, userId);
    if (!isManager) {
      throw new AppError('Only council managers can create pools', 403);
    }

    // 4. Create pool
    const pool = await this.poolsRepository.create({
      communityId,
      councilId,
      name: data.name,
      description: data.description,
      maxUnitsPerUser: data.maxUnitsPerUser ?? null,
      minimumContribution: data.minimumContribution ?? null,
      createdBy: userId,
    });

    // 5. Set allowed items if provided
    if (data.allowedItemIds && data.allowedItemIds.length > 0) {
      // Validate that all items exist in the community
      for (const itemId of data.allowedItemIds) {
        const item = await this.itemsRepository.findById(itemId);
        if (!item || item.communityId !== communityId) {
          throw new AppError(`Item ${itemId} not found or does not belong to this community`, 400);
        }
      }
      await this.poolsRepository.setAllowedItems(pool.id, data.allowedItemIds);
    }

    // 5. Create OpenFGA relationships
    try {
      // Pool-to-community relationship for hierarchical permissions
      await this.openFGAService.createRelationship(
        'pool',
        pool.id,
        'parent_community',
        'community',
        communityId
      );

      // Pool-to-council relationship
      await this.openFGAService.createRelationship(
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

    // 6. Return with details
    return await this.getPoolWithDetails(pool.id, userId);
  }

  /**
   * Get pool by ID with full details
   */
  async getPool(poolId: string, userId: string): Promise<PoolResponse> {
    const pool = await this.poolsRepository.findById(poolId);
    if (!pool || pool.deletedAt) {
      throw new AppError('Pool not found', 404);
    }

    // Check if user has permission to view pools in this community
    const canView = await this.openFGAService.checkAccess(
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
    const canView = await this.openFGAService.checkAccess(
      userId,
      'community',
      communityId,
      'can_view_wealth'
    );

    if (!canView) {
      throw new AppError('You do not have permission to view pools in this community', 403);
    }

    const pools = await this.poolsRepository.listByCommunity(communityId);

    // Get details for each pool
    return await Promise.all(pools.map((pool) => this.getPoolWithDetails(pool.id, userId)));
  }

  /**
   * Get pools by council ID with summary information
   */
  async getPoolsByCouncil(councilId: string, userId: string): Promise<CouncilPoolsResponse> {
    // 1. Verify council exists
    const council = await this.councilRepository.findById(councilId);
    if (!council || council.deletedAt) {
      throw new AppError('Council not found', 404);
    }

    // 2. Check if user has permission to view pools
    const canView = await this.openFGAService.checkAccess(
      userId,
      'community',
      council.communityId,
      'can_view_wealth'
    );

    if (!canView) {
      throw new AppError('You do not have permission to view pools in this community', 403);
    }

    // 3. Get pools for this council
    const pools = await this.poolsRepository.listByCouncil(councilId);

    // 4. Transform to summary format
    const poolSummaries: CouncilPoolSummary[] = await Promise.all(
      pools.map(async (pool) => {
        // Get inventory
        const inventory = await this.poolsRepository.getInventory(pool.id);

        // Get allowed items with names
        const allowedItems = await this.poolsRepository.getAllowedItems(pool.id);

        // Calculate inventory summary
        const totalItems = inventory.length;
        const totalQuantity = inventory.reduce((sum, item) => sum + item.unitsAvailable, 0);

        return {
          id: pool.id,
          name: pool.name,
          description: pool.description,
          allowedItems: allowedItems.map((item) => ({
            itemId: item.id,
            itemName: item.name,
          })),
          inventorySummary: {
            totalItems,
            totalQuantity,
          },
          createdAt: pool.createdAt.toISOString(),
        };
      })
    );

    return {
      pools: poolSummaries,
      total: poolSummaries.length,
    };
  }

  /**
   * Update pool settings (council managers only)
   */
  async updatePool(poolId: string, data: UpdatePoolRequest, userId: string): Promise<PoolResponse> {
    // 1. Verify pool exists
    const pool = await this.poolsRepository.findById(poolId);
    if (!pool || pool.deletedAt) {
      throw new AppError('Pool not found', 404);
    }

    // 2. Check if user is a council manager
    const isManager = await this.councilRepository.isManager(pool.councilId, userId);
    if (!isManager) {
      throw new AppError('Only council managers can update pools', 403);
    }

    // 3. Update pool
    await this.poolsRepository.update(poolId, {
      name: data.name,
      description: data.description,
      maxUnitsPerUser: data.maxUnitsPerUser,
      minimumContribution: data.minimumContribution,
    });

    // 4. Update allowed items if provided
    if (data.allowedItemIds !== undefined) {
      if (data.allowedItemIds.length > 0) {
        // Validate that all items exist in the community
        for (const itemId of data.allowedItemIds) {
          const item = await this.itemsRepository.findById(itemId);
          if (!item || item.communityId !== pool.communityId) {
            throw new AppError(
              `Item ${itemId} not found or does not belong to this community`,
              400
            );
          }
        }
      }
      await this.poolsRepository.setAllowedItems(poolId, data.allowedItemIds);
    }

    return await this.getPoolWithDetails(poolId, userId);
  }

  /**
   * Delete pool (council managers only)
   */
  async deletePool(poolId: string, userId: string): Promise<void> {
    // 1. Verify pool exists
    const pool = await this.poolsRepository.findById(poolId);
    if (!pool || pool.deletedAt) {
      throw new AppError('Pool not found', 404);
    }

    // 2. Check if user is a council manager
    const isManager = await this.councilRepository.isManager(pool.councilId, userId);
    if (!isManager) {
      throw new AppError('Only council managers can delete pools', 403);
    }

    // 3. Soft delete pool
    await this.poolsRepository.delete(poolId);
  }

  /**
   * Contribute to pool (creates wealth share with targetPoolId)
   */

  async contributeToPool(
    poolId: string,
    data: ContributeToPoolRequest,
    userId: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> {
    // 1. Verify pool exists
    const pool = await this.poolsRepository.findById(poolId);
    if (!pool || pool.deletedAt) {
      throw new AppError('Pool not found', 404);
    }

    // 2. Check if user has permission to contribute (unrestricted giving)
    const canContribute = await this.openFGAService.checkAccess(
      userId,
      'community',
      pool.communityId,
      'can_view_wealth'
    );

    if (!canContribute) {
      throw new AppError('You do not have permission to contribute to pools', 403);
    }

    // 3. Verify item exists
    const item = await this.itemsRepository.findById(data.itemId);
    if (!item || item.communityId !== pool.communityId) {
      throw new AppError('Item not found or does not belong to this community', 400);
    }

    // 4. Check if item is allowed in pool whitelist
    const isAllowed = await this.poolsRepository.isItemAllowed(poolId, data.itemId);
    if (!isAllowed) {
      throw new AppError('This item is not allowed in this pool', 400);
    }

    // 5. Check minimum contribution
    if (pool.minimumContribution && data.unitsOffered < pool.minimumContribution) {
      throw new AppError(`Minimum contribution is ${pool.minimumContribution} units`, 400);
    }

    // 5. Create wealth entry with pool target
    // Pool contributions are tracked via wealth entries with targetPoolId, not via wealth_requests
    const wealth = await this.wealthRepository.createWealth({
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

    // 6. Record contribution for value analytics
    // Capture value at contribution time (frozen snapshot)
    const valuePerUnit = item.wealthValue ? String(item.wealthValue) : '1';
    const totalValue = String(data.unitsOffered * Number(valuePerUnit));

    await this.recognizedContributionRepository.create({
      communityId: pool.communityId,
      contributorId: userId,
      itemId: data.itemId,
      units: String(data.unitsOffered),
      valuePerUnit,
      totalValue,
      description: `Pool contribution: ${data.title}`,
      verificationStatus: 'auto_verified',
      sourceType: 'pool_contribution',
      sourceId: wealth.id,
    });

    // 7. Invalidate contribution summary cache so profile reflects new contribution
    await this.contributionSummaryRepository.delete(userId, pool.communityId);

    return { wealth };
  }

  /**
   * List pending contributions to pool
   * Users can see their own contributions, council managers can see all
   */
  async listPendingContributions(
    poolId: string,
    userId: string
  ): Promise<PendingContributionResponse[]> {
    // 1. Verify pool exists
    const pool = await this.poolsRepository.findById(poolId);
    if (!pool || pool.deletedAt) {
      throw new AppError('Pool not found', 404);
    }

    // 2. Check if user is a council manager or has permission to view wealth
    const isManager = await this.councilRepository.isManager(pool.councilId, userId);
    const canView = await this.openFGAService.checkAccess(
      userId,
      'community',
      pool.communityId,
      'can_view_wealth'
    );

    if (!canView) {
      throw new AppError('You do not have permission to view contributions', 403);
    }

    // 3. Get pending contributions (wealth with targetPoolId and active status, includes item)
    const wealthRecords = await this.wealthRepository.getPendingContributionsByPoolId(poolId);

    // 4. Filter contributions: managers see all, others see only their own
    const filteredRecords = isManager
      ? wealthRecords
      : wealthRecords.filter((wealth: any) => wealth.createdBy === userId);

    // 5. Transform to response format with user names
    const contributions = await Promise.all(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      filteredRecords.map(async (wealth: any) => {
        // Get contributor info
        const contributor = await this.appUserRepository.findById(wealth.createdBy);
        const contributorName =
          contributor?.displayName || contributor?.username || contributor?.email || 'Unknown User';

        // Extract item name from translations (fallback to 'en' locale)
        const itemName =
          wealth.item?.translations?.en?.name ||
          wealth.item?.translations?.es?.name ||
          wealth.item?.translations?.hi?.name ||
          'Unknown Item';

        return {
          wealthId: wealth.id,
          contributorId: wealth.createdBy,
          contributorName,
          itemId: wealth.itemId,
          itemName,
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
    const pool = await this.poolsRepository.findById(poolId);
    if (!pool || pool.deletedAt) {
      throw new AppError('Pool not found', 404);
    }

    const wealth = await this.wealthRepository.findById(wealthId);
    if (!wealth || wealth.targetPoolId !== poolId) {
      throw new AppError('Wealth contribution not found for this pool', 404);
    }

    // 2. Check if user is a council manager
    const isManager = await this.councilRepository.isManager(pool.councilId, userId);
    if (!isManager) {
      throw new AppError('Only council managers can confirm contributions', 403);
    }

    // 3. Verify wealth is still active (not already confirmed/rejected)
    if (wealth.status !== 'active') {
      throw new AppError('Contribution has already been processed', 400);
    }

    // 4. Mark wealth as fulfilled
    await this.wealthRepository.markFulfilled(wealthId);

    // 5. Increment pool inventory
    await this.poolsRepository.incrementInventory(
      poolId,
      wealth.itemId,
      wealth.unitsAvailable ?? 1
    );
  }

  /**
   * Reject pool contribution (council managers only)
   */
  async rejectContribution(poolId: string, wealthId: string, userId: string): Promise<void> {
    // 1. Verify pool and wealth
    const pool = await this.poolsRepository.findById(poolId);
    if (!pool || pool.deletedAt) {
      throw new AppError('Pool not found', 404);
    }

    const wealth = await this.wealthRepository.findById(wealthId);
    if (!wealth || wealth.targetPoolId !== poolId) {
      throw new AppError('Wealth contribution not found for this pool', 404);
    }

    // 2. Check if user is a council manager
    const isManager = await this.councilRepository.isManager(pool.councilId, userId);
    if (!isManager) {
      throw new AppError('Only council managers can reject contributions', 403);
    }

    // 3. Verify wealth is still active (not already confirmed/rejected)
    if (wealth.status !== 'active') {
      throw new AppError('Contribution has already been processed', 400);
    }

    // 4. Cancel the wealth
    await this.wealthRepository.cancelWealth(wealthId);
  }

  /**
   * Distribute from pool manually (council managers only)
   */

  async distributeFromPool(
    poolId: string,
    data: DistributeFromPoolRequest,
    userId: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> {
    // 1. Verify pool exists
    const pool = await this.poolsRepository.findById(poolId);
    if (!pool || pool.deletedAt) {
      throw new AppError('Pool not found', 404);
    }

    // 2. Check if user is a council manager
    const isManager = await this.councilRepository.isManager(pool.councilId, userId);
    if (!isManager) {
      throw new AppError('Only council managers can distribute from pools', 403);
    }

    // 3. Verify recipient exists
    const recipient = await this.appUserRepository.findById(data.recipientId);
    if (!recipient) {
      throw new AppError('Recipient not found', 404);
    }

    // 4. Verify item exists
    const item = await this.itemsRepository.findById(data.itemId);
    if (!item) {
      throw new AppError('Item not found', 404);
    }

    // 5. Check if item is allowed in pool whitelist
    const isAllowed = await this.poolsRepository.isItemAllowed(poolId, data.itemId);
    if (!isAllowed) {
      throw new AppError('This item is not allowed in this pool', 400);
    }

    // 6. Check if pool has sufficient inventory
    const available = await this.poolsRepository.getInventoryForItem(poolId, data.itemId);
    if (available < data.unitsDistributed) {
      throw new AppError(
        `Insufficient inventory. Available: ${available}, Requested: ${data.unitsDistributed}`,
        400
      );
    }

    // 6. Decrement inventory first (atomic check)
    const decremented = await this.poolsRepository.decrementInventory(
      poolId,
      data.itemId,
      data.unitsDistributed
    );

    if (!decremented) {
      throw new AppError('Failed to decrement inventory (insufficient units)', 400);
    }

    // 7. Create wealth entry (from pool via user, with sourcePoolId)
    const wealth = await this.wealthRepository.createWealth({
      createdBy: userId, // User (council manager) creates the wealth on behalf of pool
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
    const request = await this.wealthRepository.createWealthRequest({
      wealthId: wealth.id,
      requesterId: data.recipientId,
      message: `Pool distribution from ${pool.name}`,
      unitsRequested: data.unitsDistributed,
    });

    await this.wealthRepository.acceptRequest(request.id);
    await this.wealthRepository.markRequestFulfilled(request.id);

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
    const pool = await this.poolsRepository.findById(poolId);
    if (!pool || pool.deletedAt) {
      throw new AppError('Pool not found', 404);
    }

    const isManager = await this.councilRepository.isManager(pool.councilId, userId);
    if (!isManager) {
      throw new AppError('Only council managers can preview distributions', 403);
    }

    // 2. Get available inventory for item
    const totalAvailable = await this.poolsRepository.getInventoryForItem(poolId, data.itemId);

    // 3. Get all active needs for this item in the community
    const allNeeds = await this.needsRepository.listNeeds({
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
    const users = await Promise.all(userIds.map((id) => this.appUserRepository.findById(id)));

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
    const decremented = await this.poolsRepository.batchDecrementInventory(
      poolId,
      data.itemId,
      totalUnitsDistributed
    );

    if (!decremented) {
      throw new AppError('Failed to decrement inventory (insufficient units)', 400);
    }

    // 5. Get pool for details
    const pool = await this.poolsRepository.findById(poolId);
    const item = await this.itemsRepository.findById(data.itemId);

    // 6. Create wealth entries for each recipient
    for (const recipient of actualRecipients) {
      // Create wealth
      const wealth = await this.wealthRepository.createWealth({
        createdBy: userId, // User (council manager) creates the wealth on behalf of pool
        communityId: pool!.communityId,
        itemId: data.itemId,
        title: `${(item!.translations as any)?.en?.name || 'Unknown'} from ${pool!.name}`,
        description: `Mass distribution from pool`,
        durationType: 'unlimited',
        distributionType: 'unit_based',
        unitsAvailable: recipient.unitsWillReceive,
        sharingTarget: 'community',
        sourcePoolId: poolId,
        status: 'fulfilled',
      });

      // Create auto-fulfilled request
      const request = await this.wealthRepository.createWealthRequest({
        wealthId: wealth.id,
        requesterId: recipient.userId,
        message: `Mass distribution from ${pool!.name}`,
        unitsRequested: recipient.unitsWillReceive,
      });

      await this.wealthRepository.acceptRequest(request.id);
      await this.wealthRepository.markRequestFulfilled(request.id);
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
    const pool = await this.poolsRepository.findById(poolId);
    if (!pool || pool.deletedAt) {
      throw new AppError('Pool not found', 404);
    }

    // 2. Check if user is a council manager
    const isManager = await this.councilRepository.isManager(pool.councilId, userId);
    if (!isManager) {
      throw new AppError('Only council managers can view distributions', 403);
    }

    // 3. Get distributions (wealth with sourcePoolId, includes item and request)
    const wealthRecords = await this.wealthRepository.getDistributionsByPoolId(poolId);

    // 4. Transform to response format with user names
    const distributions = await Promise.all(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      wealthRecords.map(async (wealth: any) => {
        // Get recipient info from wealth request
        const recipientId = wealth.wealthRequest?.requesterId;
        let recipientName = 'Unknown User';

        if (recipientId) {
          const recipient = await this.appUserRepository.findById(recipientId);
          recipientName =
            recipient?.displayName || recipient?.username || recipient?.email || 'Unknown User';
        }

        // Extract item name from translations (fallback to 'en' locale)
        const itemName =
          wealth.item?.translations?.en?.name ||
          wealth.item?.translations?.es?.name ||
          wealth.item?.translations?.hi?.name ||
          'Unknown Item';

        return {
          wealthId: wealth.id,
          recipientId: recipientId || '',
          recipientName,
          itemId: wealth.itemId,
          itemName,
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getPoolInventory(poolId: string, userId: string): Promise<any[]> {
    const pool = await this.poolsRepository.findById(poolId);
    if (!pool || pool.deletedAt) {
      throw new AppError('Pool not found', 404);
    }

    const canView = await this.openFGAService.checkAccess(
      userId,
      'community',
      pool.communityId,
      'can_view_wealth'
    );

    if (!canView) {
      throw new AppError('You do not have permission to view pool inventory', 403);
    }

    return await this.poolsRepository.getInventory(poolId);
  }

  /**
   * Get aggregated needs for pool's whitelisted items (or all items if no whitelist)
   * Only council managers can view pool needs
   */
  async getPoolNeeds(poolId: string, userId: string): Promise<PoolNeedsResponse> {
    // 1. Verify pool exists
    const pool = await this.poolsRepository.findById(poolId);
    if (!pool || pool.deletedAt) {
      throw new AppError('Pool not found', 404);
    }

    // 2. Check if user is a council manager
    const isManager = await this.councilRepository.isManager(pool.councilId, userId);
    if (!isManager) {
      throw new AppError('Only council managers can view pool needs', 403);
    }

    // 3. Get allowed item IDs (empty array means all items allowed)
    const allowedItemIds = await this.poolsRepository.getAllowedItemIds(poolId);

    // 4. Get all active needs for the community
    const allNeeds = await this.needsRepository.listNeeds({
      communityId: pool.communityId,
      status: 'active',
    });

    // 5. Filter needs by allowed items (if whitelist exists)
    const filteredNeeds =
      allowedItemIds.length > 0
        ? allNeeds.filter((need) => allowedItemIds.includes(need.itemId))
        : allNeeds;

    // 6. Aggregate needs by item
    const itemMap = new Map<string, PoolNeedsItemResponse>();

    for (const need of filteredNeeds) {
      const existing = itemMap.get(need.itemId);

      // Get item details if not already in map
      if (!existing) {
        const item = await this.itemsRepository.findById(need.itemId);
        const itemName = (item?.translations as any)?.en?.name || 'Unknown Item';
        const categoryName = item?.kind || 'object';

        // Get pool inventory for this item
        const poolInventoryUnits = await this.poolsRepository.getInventoryForItem(
          poolId,
          need.itemId
        );

        itemMap.set(need.itemId, {
          itemId: need.itemId,
          itemName,
          categoryName,
          totalNeedsCount: 0,
          totalWantsCount: 0,
          totalNeedsUnits: 0,
          totalWantsUnits: 0,
          poolInventoryUnits,
          recurrenceBreakdown: {
            oneTime: { needs: 0, wants: 0 },
            daily: { needs: 0, wants: 0 },
            weekly: { needs: 0, wants: 0 },
            monthly: { needs: 0, wants: 0 },
          },
        });
      }

      const itemData = itemMap.get(need.itemId)!;
      const isNeed = need.priority === 'need';
      const unitsNeeded = need.unitsNeeded || 1;

      // Update counts and units
      if (isNeed) {
        itemData.totalNeedsCount++;
        itemData.totalNeedsUnits += unitsNeeded;
      } else {
        itemData.totalWantsCount++;
        itemData.totalWantsUnits += unitsNeeded;
      }

      // Update recurrence breakdown
      const recurrence = need.isRecurring && need.recurrence ? need.recurrence : 'one-time';
      const recurrenceKey = recurrence === 'one-time' ? 'oneTime' : recurrence;

      if (isNeed) {
        itemData.recurrenceBreakdown[
          recurrenceKey as keyof typeof itemData.recurrenceBreakdown
        ].needs += unitsNeeded;
      } else {
        itemData.recurrenceBreakdown[
          recurrenceKey as keyof typeof itemData.recurrenceBreakdown
        ].wants += unitsNeeded;
      }
    }

    return {
      items: Array.from(itemMap.values()),
    };
  }

  /**
   * Helper: Get pool with full details
   */
  private async getPoolWithDetails(poolId: string, _userId: string): Promise<PoolResponse> {
    const poolWithDetails = await this.poolsRepository.findByIdWithDetails(poolId);
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
      maxUnitsPerUser: poolWithDetails.maxUnitsPerUser ?? undefined,
      minimumContribution: poolWithDetails.minimumContribution ?? undefined,
      inventory: poolWithDetails.inventory,
      allowedItems:
        poolWithDetails.allowedItems.length > 0 ? poolWithDetails.allowedItems : undefined,
      createdBy: poolWithDetails.createdBy,
      createdAt: poolWithDetails.createdAt.toISOString(),
      updatedAt: poolWithDetails.updatedAt.toISOString(),
    };
  }
}

export const poolsService = new PoolsService();
