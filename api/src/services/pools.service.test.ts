import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { PoolsService } from './pools.service';

// Mock repositories
const mockPoolsRepository = {
  create: mock(() => Promise.resolve(testPool)),
  findById: mock(() => Promise.resolve(testPool)),
  findByIdWithDetails: mock(() => Promise.resolve(testPoolWithDetails)),
  listByCommunity: mock(() => Promise.resolve([testPool])),
  update: mock(() => Promise.resolve(testPool)),
  delete: mock(() => Promise.resolve(testPool)),
  getInventory: mock(() => Promise.resolve(testInventory)),
  getInventoryForItem: mock(() => Promise.resolve(50)),
  incrementInventory: mock(() => Promise.resolve()),
  decrementInventory: mock(() => Promise.resolve(true)),
  batchDecrementInventory: mock(() => Promise.resolve(true)),
  getAllowedItems: mock(() => Promise.resolve([])),
  getAllowedItemIds: mock(() => Promise.resolve([] as string[])),
  setAllowedItems: mock(() => Promise.resolve()),
  isItemAllowed: mock(() => Promise.resolve(true)),
};

const mockCouncilRepository = {
  findById: mock(() => Promise.resolve(testCouncil)),
  isManager: mock(() => Promise.resolve(true)),
};

const mockItemsRepository = {
  findById: mock(() => Promise.resolve(testItem)),
};

const mockWealthRepository = {
  createWealth: mock(() => Promise.resolve(testWealth)),
  createWealthRequest: mock(() => Promise.resolve(testWealthRequest)),
  findById: mock(() => Promise.resolve(testWealth)),
  listRequestsForWealth: mock(() => Promise.resolve([testWealthRequest])),
  acceptRequest: mock(() => Promise.resolve(testWealthRequest)),
  markRequestFulfilled: mock(() => Promise.resolve(testWealthRequest)),
  markFulfilled: mock(() => Promise.resolve(testWealth)),
  rejectRequest: mock(() => Promise.resolve(testWealthRequest)),
  cancelWealth: mock(() => Promise.resolve(testWealth)),
  getPendingContributionsByPoolId: mock(() => Promise.resolve([])),
  getDistributionsByPoolId: mock(() => Promise.resolve([])),
};

const mockNeedsRepository = {
  listNeeds: mock(() => Promise.resolve(testNeeds)),
};

const mockAppUserRepository = {
  findById: mock(() => Promise.resolve(testUser)),
};

const mockOpenFGAService = {
  checkAccess: mock(() => Promise.resolve(true)),
  createRelationship: mock(() => Promise.resolve()),
};

const mockRecognizedContributionRepository = {
  create: mock(() => Promise.resolve({ id: 'contribution-123' })),
};

const mockContributionSummaryRepository = {
  delete: mock(() => Promise.resolve()),
};

let poolsService: PoolsService;

// Test data
const testPool = {
  id: 'pool-123',
  communityId: 'comm-123',
  councilId: 'council-123',
  name: 'Tomato Pool',
  description: 'Community tomato aggregation',
  maxUnitsPerUser: 5,
  minimumContribution: 1,
  createdBy: 'user-123',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  deletedAt: null,
};

const testPoolWithDetails = {
  ...testPool,
  councilName: 'Food Council',
  inventory: [{ itemId: 'item-tomato', itemName: 'Tomatoes', unitsAvailable: 50 }],
  allowedItems: [],
};

const testCouncil = {
  id: 'council-123',
  communityId: 'comm-123',
  name: 'Food Council',
  description: 'Food coordination',
  createdBy: 'user-123',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

const testItem = {
  id: 'item-tomato',
  communityId: 'comm-123',
  translations: {
    en: { name: 'Tomatoes', description: 'Fresh tomatoes' },
  },
  kind: 'object' as const,
  wealthValue: '1.0',
  contributionMetadata: null,
  isDefault: false,
  createdBy: 'user-123',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

const testWealth = {
  id: 'wealth-123',
  communityId: 'comm-123',
  createdBy: 'user-123',
  itemId: 'item-tomato',
  title: 'Pool contribution',
  description: null,
  durationType: 'unlimited' as const,
  endDate: null,
  distributionType: 'unit_based' as const,
  unitsAvailable: 10,
  maxUnitsPerUser: null,
  sharingTarget: 'pool' as const,
  targetCouncilId: null,
  targetPoolId: 'pool-123',
  sourcePoolId: null,
  isRecurrent: false,
  recurrentFrequency: null,
  recurrentReplenishValue: null,
  lastReplenishedAt: null,
  nextReplenishmentDate: null,
  automationEnabled: false,
  status: 'active' as const,
  image: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const testWealthRequest = {
  id: 'request-123',
  wealthId: 'wealth-123',
  requesterId: 'council-123',
  message: 'Pool contribution',
  unitsRequested: 10,
  status: 'pending' as const,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const testInventory = [{ itemId: 'item-tomato', itemName: 'Tomatoes', unitsAvailable: 50 }];

const testNeeds = [
  {
    id: 'need-1',
    communityId: 'comm-123',
    createdBy: 'user-456',
    itemId: 'item-tomato',
    priority: 'need' as const,
    unitsNeeded: 10,
    status: 'active' as const,
    isRecurring: false,
    recurrence: 'one-time' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  },
];

const testUser = {
  id: 'user-456',
  username: 'testuser',
  displayName: 'Test User',
  email: 'test@example.com',
};

describe('PoolsService', () => {
  beforeEach(() => {
    // Reset all mocks
    Object.values(mockPoolsRepository).forEach((m) => m.mockReset());
    Object.values(mockCouncilRepository).forEach((m) => m.mockReset());
    Object.values(mockItemsRepository).forEach((m) => m.mockReset());
    Object.values(mockWealthRepository).forEach((m) => m.mockReset());
    Object.values(mockNeedsRepository).forEach((m) => m.mockReset());
    Object.values(mockAppUserRepository).forEach((m) => m.mockReset());
    Object.values(mockOpenFGAService).forEach((m) => m.mockReset());
    Object.values(mockRecognizedContributionRepository).forEach((m) => m.mockReset());
    Object.values(mockContributionSummaryRepository).forEach((m) => m.mockReset());

    // Set up default mock implementations
    mockPoolsRepository.findById.mockResolvedValue(testPool);
    mockPoolsRepository.findByIdWithDetails.mockResolvedValue(testPoolWithDetails);
    mockPoolsRepository.isItemAllowed.mockResolvedValue(true);
    mockPoolsRepository.getAllowedItemIds.mockResolvedValue([]);
    mockCouncilRepository.findById.mockResolvedValue(testCouncil);
    mockCouncilRepository.isManager.mockResolvedValue(true);
    mockItemsRepository.findById.mockResolvedValue(testItem);
    mockOpenFGAService.checkAccess.mockResolvedValue(true);

    // Create service instance with mock dependencies
    poolsService = new PoolsService(
      mockPoolsRepository as any,
      mockWealthRepository as any,
      mockNeedsRepository as any,
      mockCouncilRepository as any,
      mockItemsRepository as any,
      mockAppUserRepository as any,
      mockRecognizedContributionRepository as any,
      mockContributionSummaryRepository as any,
      mockOpenFGAService as any
    );
  });

  describe('createPool', () => {
    it('should create a pool when user is council manager', async () => {
      mockPoolsRepository.create.mockResolvedValue(testPool);

      const result = await poolsService.createPool(
        'comm-123',
        'council-123',
        {
          name: 'Tomato Pool',
          description: 'Community tomato aggregation',
        },
        'user-123'
      );

      expect(result).toBeDefined();
      expect(result.name).toBe('Tomato Pool');
      expect(mockPoolsRepository.create).toHaveBeenCalled();
    });

    it('should throw error if user is not council manager', async () => {
      mockCouncilRepository.isManager.mockResolvedValue(false);

      await expect(
        poolsService.createPool(
          'comm-123',
          'council-123',
          { name: 'Pool', description: 'Test' },
          'user-456'
        )
      ).rejects.toThrow('Only council managers can create pools');
    });

    it('should throw error if council does not exist', async () => {
      mockCouncilRepository.findById.mockResolvedValue(null as any);

      await expect(
        poolsService.createPool(
          'comm-123',
          'invalid-council',
          { name: 'Pool', description: 'Test' },
          'user-123'
        )
      ).rejects.toThrow('Council not found');
    });

    it('should throw error if council does not belong to community', async () => {
      mockCouncilRepository.findById.mockResolvedValue({
        ...testCouncil,
        communityId: 'other-comm',
      });

      await expect(
        poolsService.createPool(
          'comm-123',
          'council-123',
          { name: 'Pool', description: 'Test' },
          'user-123'
        )
      ).rejects.toThrow('Council does not belong to this community');
    });
  });

  describe('contributeToPool', () => {
    it('should create wealth contribution to pool', async () => {
      mockWealthRepository.createWealth.mockResolvedValue(testWealth);

      const result = await poolsService.contributeToPool(
        'pool-123',
        {
          itemId: 'item-tomato',
          unitsOffered: 10,
          title: 'My tomatoes',
        },
        'user-123'
      );

      expect(result).toBeDefined();
      expect(result.wealth).toBeDefined();
      expect(result.wealth.id).toBe('wealth-123');
      expect(mockWealthRepository.createWealth).toHaveBeenCalled();
      // Should NOT create wealth_request
      expect(mockWealthRepository.createWealthRequest).not.toHaveBeenCalled();
    });

    it('should create recognized contribution for value analytics', async () => {
      mockWealthRepository.createWealth.mockResolvedValue(testWealth);

      await poolsService.contributeToPool(
        'pool-123',
        {
          itemId: 'item-tomato',
          unitsOffered: 10,
          title: 'My tomatoes',
        },
        'user-123'
      );

      expect(mockRecognizedContributionRepository.create).toHaveBeenCalledWith({
        communityId: 'comm-123',
        contributorId: 'user-123',
        itemId: 'item-tomato',
        units: '10',
        valuePerUnit: '1.0',
        totalValue: '10',
        description: 'Pool contribution: My tomatoes',
        verificationStatus: 'auto_verified',
        sourceType: 'pool_contribution',
        sourceId: 'wealth-123',
      });
    });

    it('should enforce minimum contribution', async () => {
      await expect(
        poolsService.contributeToPool(
          'pool-123',
          {
            itemId: 'item-tomato',
            unitsOffered: 0, // Less than minimum of 1
            title: 'My tomatoes',
          },
          'user-123'
        )
      ).rejects.toThrow('Minimum contribution is 1 units');
    });
  });

  describe('confirmContribution', () => {
    it('should confirm contribution and increment inventory', async () => {
      mockWealthRepository.findById.mockResolvedValue(testWealth);

      await poolsService.confirmContribution('pool-123', 'wealth-123', 'user-123');

      // Should NOT use wealth_request methods
      expect(mockWealthRepository.listRequestsForWealth).not.toHaveBeenCalled();
      expect(mockWealthRepository.acceptRequest).not.toHaveBeenCalled();
      expect(mockWealthRepository.markRequestFulfilled).not.toHaveBeenCalled();

      // Should directly mark wealth as fulfilled and increment inventory
      expect(mockWealthRepository.markFulfilled).toHaveBeenCalledWith('wealth-123');
      expect(mockPoolsRepository.incrementInventory).toHaveBeenCalledWith(
        'pool-123',
        'item-tomato',
        10
      );
    });

    it('should throw error if contribution already processed', async () => {
      mockWealthRepository.findById.mockResolvedValue({
        ...testWealth,
        status: 'fulfilled' as any,
      });

      await expect(
        poolsService.confirmContribution('pool-123', 'wealth-123', 'user-123')
      ).rejects.toThrow('Contribution has already been processed');
    });
  });

  describe('rejectContribution', () => {
    it('should reject contribution and cancel wealth', async () => {
      mockWealthRepository.findById.mockResolvedValue(testWealth);

      await poolsService.rejectContribution('pool-123', 'wealth-123', 'user-123');

      // Should NOT use wealth_request methods
      expect(mockWealthRepository.listRequestsForWealth).not.toHaveBeenCalled();
      expect(mockWealthRepository.rejectRequest).not.toHaveBeenCalled();

      // Should directly cancel wealth
      expect(mockWealthRepository.cancelWealth).toHaveBeenCalledWith('wealth-123');
    });

    it('should throw error if contribution already processed', async () => {
      mockWealthRepository.findById.mockResolvedValue({
        ...testWealth,
        status: 'cancelled' as any,
      });

      await expect(
        poolsService.rejectContribution('pool-123', 'wealth-123', 'user-123')
      ).rejects.toThrow('Contribution has already been processed');
    });

    it('should throw error if user is not council manager', async () => {
      mockWealthRepository.findById.mockResolvedValue(testWealth);
      mockCouncilRepository.isManager.mockResolvedValue(false);

      await expect(
        poolsService.rejectContribution('pool-123', 'wealth-123', 'user-456')
      ).rejects.toThrow('Only council managers can reject contributions');
    });
  });

  describe('distributeFromPool', () => {
    it('should distribute from pool to recipient', async () => {
      mockPoolsRepository.getInventoryForItem.mockResolvedValue(50);
      mockPoolsRepository.decrementInventory.mockResolvedValue(true);
      mockWealthRepository.createWealth.mockResolvedValue(testWealth);
      mockWealthRepository.createWealthRequest.mockResolvedValue(testWealthRequest);
      mockAppUserRepository.findById.mockResolvedValue(testUser);

      const result = await poolsService.distributeFromPool(
        'pool-123',
        {
          recipientId: 'user-456',
          itemId: 'item-tomato',
          unitsDistributed: 5,
          title: 'Tomato distribution',
        },
        'user-123'
      );

      expect(result).toBeDefined();
      expect(mockPoolsRepository.decrementInventory).toHaveBeenCalledWith(
        'pool-123',
        'item-tomato',
        5
      );
      expect(mockWealthRepository.createWealth).toHaveBeenCalled();
    });

    it('should throw error if insufficient inventory', async () => {
      mockPoolsRepository.getInventoryForItem.mockResolvedValue(2);
      mockAppUserRepository.findById.mockResolvedValue(testUser);

      await expect(
        poolsService.distributeFromPool(
          'pool-123',
          {
            recipientId: 'user-456',
            itemId: 'item-tomato',
            unitsDistributed: 10,
            title: 'Tomato distribution',
          },
          'user-123'
        )
      ).rejects.toThrow('Insufficient inventory');
    });
  });

  describe('previewMassDistribution', () => {
    it('should preview mass distribution based on needs', async () => {
      mockNeedsRepository.listNeeds.mockResolvedValue(testNeeds);
      mockPoolsRepository.getInventoryForItem.mockResolvedValue(50);
      mockAppUserRepository.findById.mockResolvedValue(testUser);

      const result = await poolsService.previewMassDistribution(
        'pool-123',
        {
          itemId: 'item-tomato',
          fulfillmentStrategy: 'full',
        },
        'user-123'
      );

      expect(result).toBeDefined();
      expect(result.totalAvailable).toBe(50);
      expect(result.potentialRecipients.length).toBeGreaterThan(0);
    });
  });

  describe('listPendingContributions', () => {
    it('should return formatted pending contributions with user and item names', async () => {
      const wealthWithItem = {
        ...testWealth,
        item: testItem,
      };
      mockWealthRepository.getPendingContributionsByPoolId.mockResolvedValue([
        wealthWithItem as any,
      ] as any);
      mockAppUserRepository.findById.mockResolvedValue(testUser);

      const result = await poolsService.listPendingContributions('pool-123', 'user-123');

      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      expect(result[0].wealthId).toBe('wealth-123');
      expect(result[0].contributorName).toBe('Test User');
      expect(result[0].itemName).toBe('Tomatoes');
      expect(result[0].unitsOffered).toBe(10);
    });

    it('should filter contributions for non-managers to show only their own', async () => {
      // Non-manager user
      mockCouncilRepository.isManager.mockResolvedValue(false);

      const contributionsByOther = {
        ...testWealth,
        createdBy: 'other-user',
        item: testItem,
      };
      const contributionsByUser = {
        ...testWealth,
        id: 'wealth-456',
        createdBy: 'user-456',
        item: testItem,
      };

      mockWealthRepository.getPendingContributionsByPoolId.mockResolvedValue([
        contributionsByOther,
        contributionsByUser,
      ] as any);

      mockAppUserRepository.findById.mockResolvedValue(testUser);

      const result = await poolsService.listPendingContributions('pool-123', 'user-456');

      // Should only see their own contribution
      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      expect(result[0].wealthId).toBe('wealth-456');
      expect(result[0].contributorId).toBe('user-456');
    });

    it('should throw error if user does not have can_view_wealth permission', async () => {
      mockCouncilRepository.isManager.mockResolvedValue(false);
      mockOpenFGAService.checkAccess.mockResolvedValue(false);

      await expect(poolsService.listPendingContributions('pool-123', 'user-456')).rejects.toThrow(
        'You do not have permission to view contributions'
      );
    });
  });

  describe('listDistributions', () => {
    it('should return formatted distributions with recipient and item names', async () => {
      const wealthWithItemAndRequest = {
        ...testWealth,
        sourcePoolId: 'pool-123',
        item: testItem,
        wealthRequest: testWealthRequest,
      };
      mockWealthRepository.getDistributionsByPoolId.mockResolvedValue([
        wealthWithItemAndRequest as any,
      ] as any);
      mockAppUserRepository.findById.mockResolvedValue(testUser);

      const result = await poolsService.listDistributions('pool-123', 'user-123');

      expect(result).toBeDefined();
      expect(result.length).toBe(1);
      expect(result[0].wealthId).toBe('wealth-123');
      expect(result[0].recipientName).toBe('Test User');
      expect(result[0].itemName).toBe('Tomatoes');
      expect(result[0].unitsDistributed).toBe(10);
      expect(result[0].recipientId).toBeDefined();
      expect(result[0].itemId).toBeDefined();
    });

    it('should throw error if user is not council manager', async () => {
      mockCouncilRepository.isManager.mockResolvedValue(false);

      await expect(poolsService.listDistributions('pool-123', 'user-456')).rejects.toThrow(
        'Only council managers can view distributions'
      );
    });
  });

  describe('createPool with allowedItemIds', () => {
    it('should create pool with allowed items', async () => {
      mockPoolsRepository.create.mockResolvedValue(testPool);
      mockItemsRepository.findById.mockResolvedValue(testItem);

      const result = await poolsService.createPool(
        'comm-123',
        'council-123',
        {
          name: 'Tomato Pool',
          description: 'Community tomato aggregation',
          allowedItemIds: ['item-tomato'],
        },
        'user-123'
      );

      expect(result).toBeDefined();
      expect(mockPoolsRepository.setAllowedItems).toHaveBeenCalledWith('pool-123', ['item-tomato']);
    });

    it('should throw error if allowed item does not belong to community', async () => {
      mockPoolsRepository.create.mockResolvedValue(testPool);
      mockItemsRepository.findById.mockResolvedValue({
        ...testItem,
        communityId: 'other-community',
      });

      await expect(
        poolsService.createPool(
          'comm-123',
          'council-123',
          {
            name: 'Pool',
            description: 'Test',
            allowedItemIds: ['item-tomato'],
          },
          'user-123'
        )
      ).rejects.toThrow('does not belong to this community');
    });
  });

  describe('contributeToPool with whitelist', () => {
    it('should reject contribution if item is not in whitelist', async () => {
      mockWealthRepository.createWealth.mockResolvedValue(testWealth);
      mockPoolsRepository.isItemAllowed.mockResolvedValue(false);

      await expect(
        poolsService.contributeToPool(
          'pool-123',
          {
            itemId: 'item-tomato',
            unitsOffered: 10,
            title: 'My tomatoes',
          },
          'user-123'
        )
      ).rejects.toThrow('This item is not allowed in this pool');
    });
  });

  describe('distributeFromPool with whitelist', () => {
    it('should reject distribution if item is not in whitelist', async () => {
      mockPoolsRepository.getInventoryForItem.mockResolvedValue(50);
      mockAppUserRepository.findById.mockResolvedValue(testUser);
      mockPoolsRepository.isItemAllowed.mockResolvedValue(false);

      await expect(
        poolsService.distributeFromPool(
          'pool-123',
          {
            recipientId: 'user-456',
            itemId: 'item-tomato',
            unitsDistributed: 5,
            title: 'Tomato distribution',
          },
          'user-123'
        )
      ).rejects.toThrow('This item is not allowed in this pool');
    });
  });

  describe('getPoolNeeds', () => {
    it('should return aggregated needs for pool', async () => {
      mockNeedsRepository.listNeeds.mockResolvedValue(testNeeds);
      mockPoolsRepository.getAllowedItemIds.mockResolvedValue([]);
      mockPoolsRepository.getInventoryForItem.mockResolvedValue(50);

      const result = await poolsService.getPoolNeeds('pool-123', 'user-123');

      expect(result).toBeDefined();
      expect(result.items).toBeDefined();
      expect(mockNeedsRepository.listNeeds).toHaveBeenCalledWith({
        communityId: 'comm-123',
        status: 'active',
      });
    });

    it('should filter needs by whitelist if pool has allowed items', async () => {
      mockNeedsRepository.listNeeds.mockResolvedValue(testNeeds);
      mockPoolsRepository.getAllowedItemIds.mockResolvedValue(['item-tomato']);
      mockPoolsRepository.getInventoryForItem.mockResolvedValue(50);

      const result = await poolsService.getPoolNeeds('pool-123', 'user-123');

      expect(result).toBeDefined();
      expect(result.items.length).toBe(1);
    });

    it('should throw error if user is not council manager', async () => {
      mockCouncilRepository.isManager.mockResolvedValue(false);

      await expect(poolsService.getPoolNeeds('pool-123', 'user-456')).rejects.toThrow(
        'Only council managers can view pool needs'
      );
    });
  });
});
