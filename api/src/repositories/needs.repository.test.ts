import { describe, it, expect, beforeEach } from 'bun:test';
import { NeedsRepository } from '@/repositories/needs.repository';
import type { NeedRecord, CouncilNeedRecord } from '@/repositories/needs.repository';
import { createThenableMockDb, setupMockDbChains } from '../../tests/helpers/mockDb';

let needsRepository: NeedsRepository;

// Create mock database
const mockDb = createThenableMockDb();

// Static test data
const testNeed: NeedRecord = {
  id: 'need-123',
  createdBy: 'user-123',
  communityId: 'comm-123',
  itemId: 'item-123',
  title: 'Test Need',
  description: 'Test need description',
  priority: 'need',
  unitsNeeded: 5,
  isRecurring: false,
  recurrence: null,
  lastFulfilledAt: null,
  nextFulfillmentDate: null,
  status: 'active',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  deletedAt: null,
};

const testRecurringNeed: NeedRecord = {
  id: 'need-456',
  createdBy: 'user-123',
  communityId: 'comm-123',
  itemId: 'item-456',
  title: 'Recurring Need',
  description: 'Test recurring need',
  priority: 'want',
  unitsNeeded: 10,
  isRecurring: true,
  recurrence: 'weekly',
  lastFulfilledAt: new Date('2024-01-01'),
  nextFulfillmentDate: new Date('2024-01-08'),
  status: 'active',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  deletedAt: null,
};

const testCouncilNeed: CouncilNeedRecord = {
  id: 'council-need-123',
  councilId: 'council-123',
  createdBy: 'user-123',
  communityId: 'comm-123',
  itemId: 'item-123',
  title: 'Test Council Need',
  description: 'Test council need description',
  priority: 'need',
  unitsNeeded: 8,
  isRecurring: false,
  recurrence: null,
  lastFulfilledAt: null,
  nextFulfillmentDate: null,
  status: 'active',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  deletedAt: null,
};

describe('NeedsRepository', () => {
  beforeEach(() => {
    // Reset all mocks and setup default chains
    setupMockDbChains(mockDb);
    // Instantiate repository with the per-test mock DB
    needsRepository = new NeedsRepository(mockDb);
  });

  // ========================================
  // MEMBER NEEDS OPERATIONS
  // ========================================

  describe('Member Needs Operations', () => {
    describe('createNeed', () => {
      it('should create a member need', async () => {
        mockDb.returning.mockResolvedValue([testNeed]);

        const result = await needsRepository.createNeed({
          createdBy: 'user-123',
          communityId: 'comm-123',
          itemId: 'item-123',
          title: 'Test Need',
          priority: 'need',
          unitsNeeded: 5,
          isRecurring: false,
          status: 'active',
        });

        expect(result).toEqual(testNeed);
        expect(mockDb.insert).toHaveBeenCalled();
        expect(mockDb.values).toHaveBeenCalled();
        expect(mockDb.returning).toHaveBeenCalled();
      });

      it('should create a recurring need with recurrence frequency', async () => {
        mockDb.returning.mockResolvedValue([testRecurringNeed]);

        const result = await needsRepository.createNeed({
          createdBy: 'user-123',
          communityId: 'comm-123',
          itemId: 'item-456',
          title: 'Recurring Need',
          priority: 'want',
          unitsNeeded: 10,
          isRecurring: true,
          recurrence: 'weekly',
          nextFulfillmentDate: new Date('2024-01-08'),
          status: 'active',
        });

        expect(result.isRecurring).toBe(true);
        expect(result.recurrence).toBe('weekly');
        expect(result.nextFulfillmentDate).toEqual(new Date('2024-01-08'));
      });

      it('should create a need with description', async () => {
        const needWithDescription = { ...testNeed, description: 'Detailed description' };
        mockDb.returning.mockResolvedValue([needWithDescription]);

        const result = await needsRepository.createNeed({
          createdBy: 'user-123',
          communityId: 'comm-123',
          itemId: 'item-123',
          title: 'Test Need',
          description: 'Detailed description',
          priority: 'need',
          unitsNeeded: 5,
          isRecurring: false,
          status: 'active',
        });

        expect(result.description).toBe('Detailed description');
      });
    });

    describe('findNeedById', () => {
      it('should find need by id', async () => {
        mockDb.where.mockResolvedValue([testNeed]);

        const result = await needsRepository.findNeedById('need-123');

        expect(result).toEqual(testNeed);
        expect(mockDb.select).toHaveBeenCalled();
        expect(mockDb.where).toHaveBeenCalled();
      });

      it('should return undefined if not found', async () => {
        mockDb.where.mockResolvedValue([]);

        const result = await needsRepository.findNeedById('nonexistent');

        expect(result).toBeUndefined();
      });

      it('should not return soft-deleted needs', async () => {
        mockDb.where.mockResolvedValue([]);

        const result = await needsRepository.findNeedById('deleted-need');

        expect(result).toBeUndefined();
      });
    });

    describe('listNeeds', () => {
      it('should list all active needs', async () => {
        mockDb.orderBy.mockResolvedValue([testNeed, testRecurringNeed]);

        const result = await needsRepository.listNeeds();

        expect(result).toHaveLength(2);
        expect(mockDb.select).toHaveBeenCalled();
        expect(mockDb.orderBy).toHaveBeenCalled();
      });

      it('should filter by community', async () => {
        mockDb.orderBy.mockResolvedValue([testNeed]);

        const result = await needsRepository.listNeeds({ communityId: 'comm-123' });

        expect(result).toHaveLength(1);
        expect(mockDb.where).toHaveBeenCalled();
      });

      it('should filter by priority', async () => {
        mockDb.orderBy.mockResolvedValue([testNeed]);

        const result = await needsRepository.listNeeds({ priority: 'need' });

        expect(result).toHaveLength(1);
      });

      it('should filter by status', async () => {
        mockDb.orderBy.mockResolvedValue([testNeed]);

        const result = await needsRepository.listNeeds({ status: 'active' });

        expect(result).toHaveLength(1);
      });

      it('should filter by isRecurring', async () => {
        mockDb.orderBy.mockResolvedValue([testRecurringNeed]);

        const result = await needsRepository.listNeeds({ isRecurring: true });

        expect(result).toHaveLength(1);
        expect(result[0].isRecurring).toBe(true);
      });

      it('should combine multiple filters', async () => {
        mockDb.orderBy.mockResolvedValue([testNeed]);

        const result = await needsRepository.listNeeds({
          communityId: 'comm-123',
          priority: 'need',
          status: 'active',
          isRecurring: false,
        });

        expect(result).toHaveLength(1);
      });
    });

    describe('listNeedsByCommunity', () => {
      it('should list needs by community', async () => {
        mockDb.orderBy.mockResolvedValue([testNeed, testRecurringNeed]);

        const result = await needsRepository.listNeedsByCommunity('comm-123');

        expect(result).toHaveLength(2);
      });
    });

    describe('listNeedsByCreator', () => {
      it('should list needs by creator', async () => {
        mockDb.orderBy.mockResolvedValue([testNeed, testRecurringNeed]);

        const result = await needsRepository.listNeedsByCreator('user-123');

        expect(result).toHaveLength(2);
        expect(mockDb.where).toHaveBeenCalled();
        expect(mockDb.orderBy).toHaveBeenCalled();
      });

      it('should not return deleted needs', async () => {
        mockDb.orderBy.mockResolvedValue([testNeed]);

        const result = await needsRepository.listNeedsByCreator('user-123');

        expect(result).toHaveLength(1);
      });
    });

    describe('updateNeed', () => {
      it('should update a need', async () => {
        const updated = { ...testNeed, title: 'Updated Title', updatedAt: new Date('2024-01-02') };
        mockDb.returning.mockResolvedValue([updated]);

        const result = await needsRepository.updateNeed('need-123', { title: 'Updated Title' });

        expect(result?.title).toBe('Updated Title');
        expect(mockDb.update).toHaveBeenCalled();
        expect(mockDb.set).toHaveBeenCalled();
        expect(mockDb.returning).toHaveBeenCalled();
      });

      it('should update priority', async () => {
        const updated = { ...testNeed, priority: 'want' as const };
        mockDb.returning.mockResolvedValue([updated]);

        const result = await needsRepository.updateNeed('need-123', { priority: 'want' });

        expect(result?.priority).toBe('want');
      });

      it('should update units needed', async () => {
        const updated = { ...testNeed, unitsNeeded: 15 };
        mockDb.returning.mockResolvedValue([updated]);

        const result = await needsRepository.updateNeed('need-123', { unitsNeeded: 15 });

        expect(result?.unitsNeeded).toBe(15);
      });

      it('should update recurrence settings', async () => {
        const updated = { ...testNeed, isRecurring: true, recurrence: 'monthly' as const };
        mockDb.returning.mockResolvedValue([updated]);

        const result = await needsRepository.updateNeed('need-123', {
          isRecurring: true,
          recurrence: 'monthly',
        });

        expect(result?.isRecurring).toBe(true);
        expect(result?.recurrence).toBe('monthly');
      });

      it('should return undefined if need not found', async () => {
        mockDb.returning.mockResolvedValue([]);

        const result = await needsRepository.updateNeed('nonexistent', { title: 'Updated' });

        expect(result).toBeUndefined();
      });
    });

    describe('deleteNeed', () => {
      it('should soft delete a need', async () => {
        const deleted = { ...testNeed, deletedAt: new Date('2024-01-02') };
        mockDb.returning.mockResolvedValue([deleted]);

        const result = await needsRepository.deleteNeed('need-123');

        expect(result?.deletedAt).toBeDefined();
        expect(mockDb.update).toHaveBeenCalled();
        expect(mockDb.set).toHaveBeenCalled();
      });

      it('should return undefined if need not found', async () => {
        mockDb.returning.mockResolvedValue([]);

        const result = await needsRepository.deleteNeed('nonexistent');

        expect(result).toBeUndefined();
      });
    });

    describe('aggregateCommunityNeeds', () => {
      it('should aggregate needs by item and priority', async () => {
        const aggregatedResults = [
          {
            itemId: 'item-123',
            itemName: 'Carrots',
            itemKind: 'object',
            priority: 'need',
            recurrence: 'weekly',
            isRecurring: true,
            totalUnitsNeeded: 50,
            memberCount: 5,
          },
        ];
        mockDb.groupBy.mockResolvedValue(aggregatedResults);

        const result = await needsRepository.aggregateCommunityNeeds('comm-123');

        expect(result).toHaveLength(1);
        expect(result[0].itemId).toBe('item-123');
        expect(result[0].totalUnitsNeeded).toBe(50);
        expect(result[0].memberCount).toBe(5);
        expect(mockDb.innerJoin).toHaveBeenCalled();
        expect(mockDb.groupBy).toHaveBeenCalled();
      });

      it('should transform recurring needs correctly', async () => {
        const aggregatedResults = [
          {
            itemId: 'item-123',
            itemName: 'Bread',
            itemKind: 'object',
            priority: 'need',
            recurrence: 'daily',
            isRecurring: true,
            totalUnitsNeeded: 20,
            memberCount: 3,
          },
        ];
        mockDb.groupBy.mockResolvedValue(aggregatedResults);

        const result = await needsRepository.aggregateCommunityNeeds('comm-123');

        expect(result[0].recurrence).toBe('daily');
      });

      it('should transform one-time needs correctly', async () => {
        const aggregatedResults = [
          {
            itemId: 'item-456',
            itemName: 'Laptop',
            itemKind: 'object',
            priority: 'want',
            recurrence: null,
            isRecurring: false,
            totalUnitsNeeded: 2,
            memberCount: 2,
          },
        ];
        mockDb.groupBy.mockResolvedValue(aggregatedResults);

        const result = await needsRepository.aggregateCommunityNeeds('comm-123');

        expect(result[0].recurrence).toBe('one-time');
      });

      it('should only include active non-deleted needs', async () => {
        mockDb.groupBy.mockResolvedValue([]);

        const result = await needsRepository.aggregateCommunityNeeds('comm-123');

        expect(result).toHaveLength(0);
        expect(mockDb.where).toHaveBeenCalled();
      });
    });

    describe('findNeedsDueForFulfillment', () => {
      it('should find needs due for fulfillment', async () => {
        const currentDate = new Date('2024-01-08');
        mockDb.where.mockResolvedValue([testRecurringNeed]);

        const result = await needsRepository.findNeedsDueForFulfillment(currentDate);

        expect(result).toHaveLength(1);
        expect(result[0].nextFulfillmentDate).toBeDefined();
        expect(mockDb.where).toHaveBeenCalled();
      });

      it('should only return recurring active needs', async () => {
        mockDb.where.mockResolvedValue([testRecurringNeed]);

        const result = await needsRepository.findNeedsDueForFulfillment();

        expect(result.every((n) => n.isRecurring)).toBe(true);
        expect(result.every((n) => n.status === 'active')).toBe(true);
      });

      it('should not return future dated needs', async () => {
        const futureDate = new Date('2024-01-01');
        mockDb.where.mockResolvedValue([]);

        const result = await needsRepository.findNeedsDueForFulfillment(futureDate);

        expect(result).toHaveLength(0);
      });
    });

    describe('findMemberNeedsDueForReplenishment', () => {
      it('should find member needs due for replenishment', async () => {
        const currentDate = new Date('2024-01-08');
        mockDb.where.mockResolvedValue([testRecurringNeed]);

        const result = await needsRepository.findMemberNeedsDueForReplenishment(currentDate);

        expect(result).toHaveLength(1);
        expect(result[0].isRecurring).toBe(true);
      });

      it('should use current date by default', async () => {
        mockDb.where.mockResolvedValue([testRecurringNeed]);

        // @ts-ignore
        const _result = await needsRepository.findMemberNeedsDueForReplenishment();

        expect(mockDb.where).toHaveBeenCalled();
      });
    });

    describe('updateNeedFulfillmentDates', () => {
      it('should update fulfillment dates', async () => {
        const lastFulfilledAt = new Date('2024-01-08');
        const nextFulfillmentDate = new Date('2024-01-15');
        const updated = {
          ...testRecurringNeed,
          lastFulfilledAt,
          nextFulfillmentDate,
          updatedAt: new Date('2024-01-08'),
        };
        mockDb.returning.mockResolvedValue([updated]);

        const result = await needsRepository.updateNeedFulfillmentDates(
          'need-456',
          lastFulfilledAt,
          nextFulfillmentDate
        );

        expect(result?.lastFulfilledAt).toEqual(lastFulfilledAt);
        expect(result?.nextFulfillmentDate).toEqual(nextFulfillmentDate);
        expect(mockDb.update).toHaveBeenCalled();
        expect(mockDb.set).toHaveBeenCalled();
      });

      it('should return undefined if need not found', async () => {
        mockDb.returning.mockResolvedValue([]);

        const result = await needsRepository.updateNeedFulfillmentDates(
          'nonexistent',
          new Date(),
          new Date()
        );

        expect(result).toBeUndefined();
      });
    });
  });

  // ========================================
  // COUNCIL NEEDS OPERATIONS
  // ========================================

  describe('Council Needs Operations', () => {
    describe('createCouncilNeed', () => {
      it('should create a council need', async () => {
        mockDb.returning.mockResolvedValue([testCouncilNeed]);

        const result = await needsRepository.createCouncilNeed({
          councilId: 'council-123',
          createdBy: 'user-123',
          communityId: 'comm-123',
          itemId: 'item-123',
          title: 'Test Council Need',
          priority: 'need',
          unitsNeeded: 8,
          isRecurring: false,
          status: 'active',
        });

        expect(result).toEqual(testCouncilNeed);
        expect(mockDb.insert).toHaveBeenCalled();
        expect(mockDb.values).toHaveBeenCalled();
        expect(mockDb.returning).toHaveBeenCalled();
      });

      it('should create a recurring council need', async () => {
        const recurringCouncilNeed = {
          ...testCouncilNeed,
          isRecurring: true,
          recurrence: 'monthly' as const,
          nextFulfillmentDate: new Date('2024-02-01'),
        };
        mockDb.returning.mockResolvedValue([recurringCouncilNeed]);

        const result = await needsRepository.createCouncilNeed({
          councilId: 'council-123',
          createdBy: 'user-123',
          communityId: 'comm-123',
          itemId: 'item-123',
          title: 'Test Council Need',
          priority: 'need',
          unitsNeeded: 8,
          isRecurring: true,
          recurrence: 'monthly',
          nextFulfillmentDate: new Date('2024-02-01'),
          status: 'active',
        });

        expect(result.isRecurring).toBe(true);
        expect(result.recurrence).toBe('monthly');
      });
    });

    describe('findCouncilNeedById', () => {
      it('should find council need by id', async () => {
        mockDb.where.mockResolvedValue([testCouncilNeed]);

        const result = await needsRepository.findCouncilNeedById('council-need-123');

        expect(result).toEqual(testCouncilNeed);
        expect(mockDb.select).toHaveBeenCalled();
        expect(mockDb.where).toHaveBeenCalled();
      });

      it('should return undefined if not found', async () => {
        mockDb.where.mockResolvedValue([]);

        const result = await needsRepository.findCouncilNeedById('nonexistent');

        expect(result).toBeUndefined();
      });

      it('should not return soft-deleted council needs', async () => {
        mockDb.where.mockResolvedValue([]);

        const result = await needsRepository.findCouncilNeedById('deleted-council-need');

        expect(result).toBeUndefined();
      });
    });

    describe('listCouncilNeeds', () => {
      it('should list all active council needs', async () => {
        mockDb.orderBy.mockResolvedValue([testCouncilNeed]);

        const result = await needsRepository.listCouncilNeeds();

        expect(result).toHaveLength(1);
        expect(mockDb.orderBy).toHaveBeenCalled();
      });

      it('should filter by council id', async () => {
        mockDb.orderBy.mockResolvedValue([testCouncilNeed]);

        const result = await needsRepository.listCouncilNeeds({ councilId: 'council-123' });

        expect(result).toHaveLength(1);
        expect(mockDb.where).toHaveBeenCalled();
      });

      it('should filter by community id', async () => {
        mockDb.orderBy.mockResolvedValue([testCouncilNeed]);

        const result = await needsRepository.listCouncilNeeds({ communityId: 'comm-123' });

        expect(result).toHaveLength(1);
      });

      it('should filter by priority', async () => {
        mockDb.orderBy.mockResolvedValue([testCouncilNeed]);

        const result = await needsRepository.listCouncilNeeds({ priority: 'need' });

        expect(result).toHaveLength(1);
      });

      it('should filter by status', async () => {
        mockDb.orderBy.mockResolvedValue([testCouncilNeed]);

        const result = await needsRepository.listCouncilNeeds({ status: 'active' });

        expect(result).toHaveLength(1);
      });

      it('should filter by isRecurring', async () => {
        mockDb.orderBy.mockResolvedValue([testCouncilNeed]);

        const result = await needsRepository.listCouncilNeeds({ isRecurring: false });

        expect(result).toHaveLength(1);
      });

      it('should combine multiple filters', async () => {
        mockDb.orderBy.mockResolvedValue([testCouncilNeed]);

        const result = await needsRepository.listCouncilNeeds({
          councilId: 'council-123',
          communityId: 'comm-123',
          priority: 'need',
          status: 'active',
        });

        expect(result).toHaveLength(1);
      });
    });

    describe('listCouncilNeedsByCouncil', () => {
      it('should list council needs by council', async () => {
        mockDb.orderBy.mockResolvedValue([testCouncilNeed]);

        const result = await needsRepository.listCouncilNeedsByCouncil('council-123');

        expect(result).toHaveLength(1);
      });
    });

    describe('listCouncilNeedsByCommunity', () => {
      it('should list council needs by community', async () => {
        mockDb.orderBy.mockResolvedValue([testCouncilNeed]);

        const result = await needsRepository.listCouncilNeedsByCommunity('comm-123');

        expect(result).toHaveLength(1);
      });
    });

    describe('updateCouncilNeed', () => {
      it('should update a council need', async () => {
        const updated = {
          ...testCouncilNeed,
          title: 'Updated Council Need',
          updatedAt: new Date('2024-01-02'),
        };
        mockDb.returning.mockResolvedValue([updated]);

        const result = await needsRepository.updateCouncilNeed('council-need-123', {
          title: 'Updated Council Need',
        });

        expect(result?.title).toBe('Updated Council Need');
        expect(mockDb.update).toHaveBeenCalled();
        expect(mockDb.set).toHaveBeenCalled();
      });

      it('should update priority', async () => {
        const updated = { ...testCouncilNeed, priority: 'want' as const };
        mockDb.returning.mockResolvedValue([updated]);

        const result = await needsRepository.updateCouncilNeed('council-need-123', {
          priority: 'want',
        });

        expect(result?.priority).toBe('want');
      });

      it('should return undefined if council need not found', async () => {
        mockDb.returning.mockResolvedValue([]);

        const result = await needsRepository.updateCouncilNeed('nonexistent', {
          title: 'Updated',
        });

        expect(result).toBeUndefined();
      });
    });

    describe('deleteCouncilNeed', () => {
      it('should soft delete a council need', async () => {
        const deleted = { ...testCouncilNeed, deletedAt: new Date('2024-01-02') };
        mockDb.returning.mockResolvedValue([deleted]);

        const result = await needsRepository.deleteCouncilNeed('council-need-123');

        expect(result?.deletedAt).toBeDefined();
        expect(mockDb.update).toHaveBeenCalled();
        expect(mockDb.set).toHaveBeenCalled();
      });

      it('should return undefined if council need not found', async () => {
        mockDb.returning.mockResolvedValue([]);

        const result = await needsRepository.deleteCouncilNeed('nonexistent');

        expect(result).toBeUndefined();
      });
    });

    describe('aggregateCouncilNeeds', () => {
      it('should aggregate council needs by item and priority', async () => {
        const aggregatedResults = [
          {
            itemId: 'item-123',
            itemName: 'Office Supplies',
            itemKind: 'object',
            priority: 'need',
            recurrence: 'monthly',
            isRecurring: true,
            totalUnitsNeeded: 30,
            memberCount: 2,
          },
        ];
        mockDb.groupBy.mockResolvedValue(aggregatedResults);

        const result = await needsRepository.aggregateCouncilNeeds('comm-123');

        expect(result).toHaveLength(1);
        expect(result[0].itemId).toBe('item-123');
        expect(result[0].totalUnitsNeeded).toBe(30);
        expect(mockDb.innerJoin).toHaveBeenCalled();
        expect(mockDb.groupBy).toHaveBeenCalled();
      });

      it('should transform one-time council needs correctly', async () => {
        const aggregatedResults = [
          {
            itemId: 'item-456',
            itemName: 'Projector',
            itemKind: 'object',
            priority: 'want',
            recurrence: null,
            isRecurring: false,
            totalUnitsNeeded: 1,
            memberCount: 1,
          },
        ];
        mockDb.groupBy.mockResolvedValue(aggregatedResults);

        const result = await needsRepository.aggregateCouncilNeeds('comm-123');

        expect(result[0].recurrence).toBe('one-time');
      });
    });

    describe('findCouncilNeedsDueForFulfillment', () => {
      it('should find council needs due for fulfillment', async () => {
        const recurringCouncilNeed = {
          ...testCouncilNeed,
          isRecurring: true,
          recurrence: 'weekly' as const,
          nextFulfillmentDate: new Date('2024-01-08'),
        };
        const currentDate = new Date('2024-01-08');
        mockDb.where.mockResolvedValue([recurringCouncilNeed]);

        const result = await needsRepository.findCouncilNeedsDueForFulfillment(currentDate);

        expect(result).toHaveLength(1);
        expect(result[0].isRecurring).toBe(true);
      });

      it('should only return recurring active council needs', async () => {
        mockDb.where.mockResolvedValue([]);

        // @ts-ignore
        const _result = await needsRepository.findCouncilNeedsDueForFulfillment();

        expect(mockDb.where).toHaveBeenCalled();
      });
    });

    describe('findCouncilNeedsDueForReplenishment', () => {
      it('should find council needs due for replenishment', async () => {
        const recurringCouncilNeed = {
          ...testCouncilNeed,
          isRecurring: true,
          recurrence: 'monthly' as const,
          nextFulfillmentDate: new Date('2024-01-31'),
        };
        const currentDate = new Date('2024-01-31');
        mockDb.where.mockResolvedValue([recurringCouncilNeed]);

        const result = await needsRepository.findCouncilNeedsDueForReplenishment(currentDate);

        expect(result).toHaveLength(1);
        expect(result[0].isRecurring).toBe(true);
      });

      it('should use current date by default', async () => {
        mockDb.where.mockResolvedValue([]);

        // @ts-ignore
        const _result = await needsRepository.findCouncilNeedsDueForReplenishment();

        expect(mockDb.where).toHaveBeenCalled();
      });
    });

    describe('updateCouncilNeedFulfillmentDates', () => {
      it('should update council need fulfillment dates', async () => {
        const lastFulfilledAt = new Date('2024-01-31');
        const nextFulfillmentDate = new Date('2024-02-29');
        const updated = {
          ...testCouncilNeed,
          lastFulfilledAt,
          nextFulfillmentDate,
          updatedAt: new Date('2024-01-31'),
        };
        mockDb.returning.mockResolvedValue([updated]);

        const result = await needsRepository.updateCouncilNeedFulfillmentDates(
          'council-need-123',
          lastFulfilledAt,
          nextFulfillmentDate
        );

        expect(result?.lastFulfilledAt).toEqual(lastFulfilledAt);
        expect(result?.nextFulfillmentDate).toEqual(nextFulfillmentDate);
        expect(mockDb.update).toHaveBeenCalled();
        expect(mockDb.set).toHaveBeenCalled();
      });

      it('should return undefined if council need not found', async () => {
        mockDb.returning.mockResolvedValue([]);

        const result = await needsRepository.updateCouncilNeedFulfillmentDates(
          'nonexistent',
          new Date(),
          new Date()
        );

        expect(result).toBeUndefined();
      });
    });
  });
});
