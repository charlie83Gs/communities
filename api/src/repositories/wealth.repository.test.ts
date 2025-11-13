import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { WealthRepository } from '@/repositories/wealth.repository';
import type { WealthRecord, WealthRequestRecord } from '@/repositories/wealth.repository';
import { createThenableMockDb, setupMockDbChains } from '../../tests/helpers/mockDb';

let wealthRepository: WealthRepository;

// Create mock database
const mockDb = createThenableMockDb();

// Static test data
const testWealth: WealthRecord = {
  id: 'wealth-123',
  createdBy: 'user-123',
  communityId: 'comm-123',
  itemId: 'item-123',
  title: 'Test Wealth',
  description: 'Test description',
  image: null as any,
  durationType: 'unlimited',
  endDate: null as any,
  distributionType: 'unit_based' as any,
  unitsAvailable: null as any,
  maxUnitsPerUser: null as any,
  automationEnabled: false,
  status: 'active',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
} as any;

const testWealthUnitBased: WealthRecord = {
  id: 'wealth-456',
  createdBy: 'user-123',
  communityId: 'comm-123',
  itemId: 'item-456',
  title: 'Unit Based Wealth',
  description: 'Test description',
  image: null as any,
  durationType: 'unlimited',
  endDate: null as any,
  distributionType: 'unit_based',
  unitsAvailable: 10,
  maxUnitsPerUser: 2,
  automationEnabled: false,
  status: 'active',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
} as any;

const testRequest: WealthRequestRecord = {
  id: 'request-123',
  wealthId: 'wealth-123',
  requesterId: 'user-456',
  message: 'I need this',
  unitsRequested: 2,
  status: 'pending',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

describe('WealthRepository', () => {
  beforeEach(() => {
    // Reset all mocks and setup default chains
    setupMockDbChains(mockDb);
    // Instantiate repository with the per-test mock DB
    wealthRepository = new WealthRepository(mockDb);
  });

  afterEach(() => {
    // Nothing to clean up; a fresh WealthRepository is created per test
  });

  describe('Wealth Operations', () => {
    describe('createWealth', () => {
      it('should create a wealth item', async () => {
        mockDb.returning.mockResolvedValue([testWealth]);

        const result = await wealthRepository.createWealth({
          createdBy: 'user-123',
          communityId: 'comm-123',
          itemId: 'item-123',
          title: 'Test Wealth',
          durationType: 'unlimited',
          distributionType: 'unit_based' as any,
          status: 'active',
        });

        expect(result).toEqual(testWealth);
        expect(mockDb.insert).toHaveBeenCalled();
        expect(mockDb.values).toHaveBeenCalled();
        expect(mockDb.returning).toHaveBeenCalled();
      });

      it('should create timebound wealth', async () => {
        const timeboundWealth = {
          ...testWealth,
          durationType: 'timebound' as const,
          endDate: new Date('2024-12-31'),
        };
        mockDb.returning.mockResolvedValue([timeboundWealth]);

        const result = await wealthRepository.createWealth({
          createdBy: 'user-123',
          communityId: 'comm-123',
          itemId: 'item-123',
          title: 'Test Wealth',
          durationType: 'timebound',
          endDate: new Date('2024-12-31'),
          distributionType: 'unit_based' as any,
          status: 'active',
        });

        expect(result.durationType).toBe('timebound');
        expect(result.endDate).toEqual(new Date('2024-12-31'));
      });

      it('should create unit-based wealth', async () => {
        mockDb.returning.mockResolvedValue([testWealthUnitBased]);

        const result = await wealthRepository.createWealth({
          createdBy: 'user-123',
          communityId: 'comm-123',
          itemId: 'item-456',
          title: 'Unit Based Wealth',
          durationType: 'unlimited',
          distributionType: 'unit_based',
          unitsAvailable: 10,
          maxUnitsPerUser: 2,
          status: 'active',
        });

        expect(result.distributionType).toBe('unit_based');
        expect(result.unitsAvailable).toBe(10);
        expect(result.maxUnitsPerUser).toBe(2);
      });
    });

    describe('findById', () => {
      it('should find wealth by id', async () => {
        mockDb.where.mockResolvedValue([testWealth]);

        const result = await wealthRepository.findById('wealth-123');

        expect(result).toEqual(testWealth);
        expect(mockDb.select).toHaveBeenCalled();
        expect(mockDb.where).toHaveBeenCalled();
      });

      it('should return undefined if not found', async () => {
        mockDb.where.mockResolvedValue([]);

        const result = await wealthRepository.findById('nonexistent');

        expect(result).toBeUndefined();
      });
    });

    describe('listByCommunities', () => {
      it('should return empty array for empty community list', async () => {
        const result = await wealthRepository.listByCommunities([]);
        expect(result).toEqual([]);
      });

      it('should list wealth items by communities', async () => {
        mockDb.orderBy.mockResolvedValue([testWealth]);

        const result = await wealthRepository.listByCommunities(['comm-123']);

        expect(result).toHaveLength(1);
        expect(result[0]).toEqual(testWealth);
        expect(mockDb.where).toHaveBeenCalled();
        expect(mockDb.orderBy).toHaveBeenCalled();
      });

      it('should filter by status', async () => {
        mockDb.orderBy.mockResolvedValue([testWealth]);

        const result = await wealthRepository.listByCommunities(['comm-123'], 'active');

        expect(result).toHaveLength(1);
        expect(mockDb.where).toHaveBeenCalled();
      });
    });

    describe('listByCommunity', () => {
      it('should list wealth items by community', async () => {
        mockDb.orderBy.mockResolvedValue([testWealth]);

        const result = await wealthRepository.listByCommunity('comm-123');

        expect(result).toHaveLength(1);
        expect(result[0]).toEqual(testWealth);
      });

      it('should filter by status', async () => {
        mockDb.orderBy.mockResolvedValue([testWealth]);

        const result = await wealthRepository.listByCommunity('comm-123', 'active');

        expect(result).toHaveLength(1);
      });
    });

    describe('updateWealth', () => {
      it('should update wealth item', async () => {
        const updatedWealth = {
          ...testWealth,
          title: 'Updated Title',
          updatedAt: new Date('2024-01-02'),
        };
        mockDb.returning.mockResolvedValue([updatedWealth]);

        const result = await wealthRepository.updateWealth('wealth-123', {
          title: 'Updated Title',
        });

        expect(result?.title).toBe('Updated Title');
        expect(mockDb.update).toHaveBeenCalled();
        expect(mockDb.set).toHaveBeenCalled();
        expect(mockDb.returning).toHaveBeenCalled();
      });

      it('should return undefined if wealth not found', async () => {
        mockDb.returning.mockResolvedValue([]);

        const result = await wealthRepository.updateWealth('nonexistent', {
          title: 'Updated',
        });

        expect(result).toBeUndefined();
      });
    });

    describe('cancelWealth', () => {
      it('should cancel wealth item', async () => {
        const cancelledWealth = {
          ...testWealth,
          status: 'cancelled' as const,
          updatedAt: new Date('2024-01-02'),
        };
        mockDb.returning.mockResolvedValue([cancelledWealth]);

        const result = await wealthRepository.cancelWealth('wealth-123');

        expect(result?.status).toBe('cancelled');
        expect(mockDb.update).toHaveBeenCalled();
      });
    });

    describe('markFulfilled', () => {
      it('should mark wealth as fulfilled', async () => {
        const fulfilledWealth = {
          ...testWealth,
          status: 'fulfilled' as const,
          updatedAt: new Date('2024-01-02'),
        };
        mockDb.returning.mockResolvedValue([fulfilledWealth]);

        const result = await wealthRepository.markFulfilled('wealth-123');

        expect(result?.status).toBe('fulfilled');
        expect(mockDb.update).toHaveBeenCalled();
      });
    });

    describe('decrementUnits', () => {
      it('should decrement units for unit-based wealth', async () => {
        // First call for findById
        mockDb.where.mockResolvedValueOnce([testWealthUnitBased]);

        const decrementedWealth = {
          ...testWealthUnitBased,
          unitsAvailable: 5,
        };
        mockDb.returning.mockResolvedValue([decrementedWealth]);

        const result = await wealthRepository.decrementUnits('wealth-456', 5);

        expect(result?.unitsAvailable).toBe(5);
        expect(mockDb.update).toHaveBeenCalled();
      });

      it('should mark as fulfilled when units reach zero', async () => {
        // First call for findById
        mockDb.where.mockResolvedValueOnce([testWealthUnitBased]);

        const fulfilledWealth = {
          ...testWealthUnitBased,
          unitsAvailable: 0,
          status: 'fulfilled' as const,
        };
        mockDb.returning.mockResolvedValue([fulfilledWealth]);

        const result = await wealthRepository.decrementUnits('wealth-456', 10);

        expect(result?.unitsAvailable).toBe(0);
        expect(result?.status).toBe('fulfilled');
      });

      it('should return undefined for nonexistent wealth', async () => {
        mockDb.where.mockResolvedValue([]);

        const result = await wealthRepository.decrementUnits('nonexistent', 5);

        expect(result).toBeUndefined();
      });
    });

    describe('search', () => {
      it('should return empty results for empty community list', async () => {
        const result = await wealthRepository.search({
          communityIds: [],
        });

        expect(result.rows).toEqual([]);
        expect(result.total).toBe(0);
      });

      it('should search wealth items', async () => {
        // First query for count
        mockDb.where.mockResolvedValueOnce([{ count: 1 }]);
        // Second query for rows
        mockDb.offset.mockResolvedValue([testWealth]);

        const result = await wealthRepository.search({
          communityIds: ['comm-123'],
        });

        expect(result.rows).toHaveLength(1);
        expect(result.total).toBe(1);
      });

      it('should filter by search query', async () => {
        mockDb.where.mockResolvedValueOnce([{ count: 1 }]);
        mockDb.offset.mockResolvedValue([testWealth]);

        const result = await wealthRepository.search({
          communityIds: ['comm-123'],
          q: 'test',
        });

        expect(result.rows).toHaveLength(1);
      });

      it('should filter by status', async () => {
        mockDb.where.mockResolvedValueOnce([{ count: 1 }]);
        mockDb.offset.mockResolvedValue([testWealth]);

        const result = await wealthRepository.search({
          communityIds: ['comm-123'],
          status: 'active',
        });

        expect(result.rows).toHaveLength(1);
      });

      it('should filter by duration type', async () => {
        mockDb.where.mockResolvedValueOnce([{ count: 1 }]);
        mockDb.offset.mockResolvedValue([testWealth]);

        const result = await wealthRepository.search({
          communityIds: ['comm-123'],
          durationType: 'unlimited',
        });

        expect(result.rows).toHaveLength(1);
      });

      it('should filter by distribution type', async () => {
        mockDb.where.mockResolvedValueOnce([{ count: 1 }]);
        mockDb.offset.mockResolvedValue([testWealth]);

        const result = await wealthRepository.search({
          communityIds: ['comm-123'],
          distributionType: 'unit_based' as any,
        });

        expect(result.rows).toHaveLength(1);
      });

      it('should filter by date range', async () => {
        mockDb.where.mockResolvedValueOnce([{ count: 1 }]);
        mockDb.offset.mockResolvedValue([testWealth]);

        const result = await wealthRepository.search({
          communityIds: ['comm-123'],
          endDateAfter: new Date('2024-01-01'),
          endDateBefore: new Date('2024-12-31'),
        });

        expect(result.rows).toHaveLength(1);
      });

      it('should handle pagination', async () => {
        mockDb.where.mockResolvedValueOnce([{ count: 10 }]);
        mockDb.offset.mockResolvedValue([testWealth]);

        const result = await wealthRepository.search({
          communityIds: ['comm-123'],
          limit: 5,
          offset: 5,
        });

        expect(result.total).toBe(10);
        expect(mockDb.limit).toHaveBeenCalled();
        expect(mockDb.offset).toHaveBeenCalled();
      });
    });
  });

  describe('Wealth Request Operations', () => {
    describe('createWealthRequest', () => {
      it('should create a wealth request', async () => {
        mockDb.returning.mockResolvedValue([testRequest]);

        const result = await wealthRepository.createWealthRequest({
          wealthId: 'wealth-123',
          requesterId: 'user-456',
          message: 'I need this',
          unitsRequested: 2,
        });

        expect(result).toEqual(testRequest);
        expect(mockDb.insert).toHaveBeenCalled();
        expect(mockDb.values).toHaveBeenCalled();
      });
    });

    describe('listRequestsForWealth', () => {
      it('should list requests for a wealth item', async () => {
        mockDb.orderBy.mockResolvedValue([testRequest]);

        const result = await wealthRepository.listRequestsForWealth('wealth-123');

        expect(result).toHaveLength(1);
        expect(result[0]).toEqual(testRequest);
      });
    });

    describe('listRequestsForWealthByRequester', () => {
      it('should list requests for a wealth item by requester', async () => {
        mockDb.orderBy.mockResolvedValue([testRequest]);

        const result = await wealthRepository.listRequestsForWealthByRequester(
          'wealth-123',
          'user-456'
        );

        expect(result).toHaveLength(1);
        expect(result[0]).toEqual(testRequest);
      });
    });

    describe('listRequestsByUser', () => {
      it('should list requests by user without status filter', async () => {
        mockDb.orderBy.mockResolvedValue([testRequest]);

        const result = await wealthRepository.listRequestsByUser('user-456');

        expect(result).toHaveLength(1);
        expect(result[0]).toEqual(testRequest);
      });

      it('should list requests by user with status filter', async () => {
        mockDb.orderBy.mockResolvedValue([testRequest]);

        const result = await wealthRepository.listRequestsByUser('user-456', [
          'pending',
          'accepted',
        ]);

        expect(result).toHaveLength(1);
      });

      it('should handle empty status array', async () => {
        mockDb.orderBy.mockResolvedValue([testRequest]);

        const result = await wealthRepository.listRequestsByUser('user-456', []);

        expect(result).toHaveLength(1);
      });
    });

    describe('listIncomingRequestsByOwner', () => {
      it('should list incoming requests for owner without status filter', async () => {
        mockDb.orderBy.mockResolvedValue([testRequest]);

        const result = await wealthRepository.listIncomingRequestsByOwner('user-123');

        expect(result).toHaveLength(1);
        expect(mockDb.innerJoin).toHaveBeenCalled();
      });

      it('should list incoming requests with status filter', async () => {
        mockDb.orderBy.mockResolvedValue([testRequest]);

        const result = await wealthRepository.listIncomingRequestsByOwner('user-123', ['pending']);

        expect(result).toHaveLength(1);
      });
    });

    describe('findRequestById', () => {
      it('should find request by id', async () => {
        mockDb.where.mockResolvedValue([testRequest]);

        const result = await wealthRepository.findRequestById('request-123');

        expect(result).toEqual(testRequest);
      });

      it('should return undefined if not found', async () => {
        mockDb.where.mockResolvedValue([]);

        const result = await wealthRepository.findRequestById('nonexistent');

        expect(result).toBeUndefined();
      });
    });

    describe('acceptRequest', () => {
      it('should accept a request', async () => {
        const acceptedRequest = {
          ...testRequest,
          status: 'accepted' as const,
        };
        mockDb.returning.mockResolvedValue([acceptedRequest]);

        const result = await wealthRepository.acceptRequest('request-123');

        expect(result?.status).toBe('accepted');
        expect(mockDb.update).toHaveBeenCalled();
      });
    });

    describe('rejectRequest', () => {
      it('should reject a request', async () => {
        const rejectedRequest = {
          ...testRequest,
          status: 'rejected' as const,
        };
        mockDb.returning.mockResolvedValue([rejectedRequest]);

        const result = await wealthRepository.rejectRequest('request-123');

        expect(result?.status).toBe('rejected');
      });
    });

    describe('cancelRequest', () => {
      it('should cancel a request', async () => {
        const cancelledRequest = {
          ...testRequest,
          status: 'cancelled' as const,
        };
        mockDb.returning.mockResolvedValue([cancelledRequest]);

        const result = await wealthRepository.cancelRequest('request-123');

        expect(result?.status).toBe('cancelled');
      });
    });

    describe('markRequestFulfilled', () => {
      it('should mark request as fulfilled', async () => {
        const fulfilledRequest = {
          ...testRequest,
          status: 'fulfilled' as const,
        };
        mockDb.returning.mockResolvedValue([fulfilledRequest]);

        const result = await wealthRepository.markRequestFulfilled('request-123');

        expect(result?.status).toBe('fulfilled');
      });
    });

    describe('confirmRequest', () => {
      it('should confirm request', async () => {
        const confirmedRequest = {
          ...testRequest,
          status: 'fulfilled' as const,
        };
        mockDb.returning.mockResolvedValue([confirmedRequest]);

        const result = await wealthRepository.confirmRequest('request-123');

        expect(result?.status).toBe('fulfilled');
      });
    });

    describe('failRequest', () => {
      it('should fail a request', async () => {
        const failedRequest = {
          ...testRequest,
          status: 'failed' as const,
        };
        mockDb.returning.mockResolvedValue([failedRequest]);

        const result = await wealthRepository.failRequest('request-123');

        expect(result?.status).toBe('failed');
      });
    });
  });
});
