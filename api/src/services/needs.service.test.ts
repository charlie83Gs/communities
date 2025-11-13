import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { NeedsService } from '@/services/needs.service';
import { needsRepository } from '@/repositories/needs.repository';
import { councilRepository } from '@/repositories/council.repository';
import { itemsRepository } from '@/repositories/items.repository';
import { openFGAService } from './openfga.service';

// Mock repositories and services
const mockNeedsRepository = {
  createNeed: mock(() => Promise.resolve(null)),
  findNeedById: mock(() => Promise.resolve(null)),
  listNeeds: mock(() => Promise.resolve([])),
  listNeedsByCommunity: mock(() => Promise.resolve([])),
  listNeedsByCreator: mock(() => Promise.resolve([])),
  updateNeed: mock(() => Promise.resolve(null)),
  deleteNeed: mock(() => Promise.resolve(null)),
  aggregateCommunityNeeds: mock(() => Promise.resolve([])),
  findNeedsDueForFulfillment: mock(() => Promise.resolve([])),
  findMemberNeedsDueForReplenishment: mock(() => Promise.resolve([])),
  updateNeedFulfillmentDates: mock(() => Promise.resolve(null)),
  createCouncilNeed: mock(() => Promise.resolve(null)),
  findCouncilNeedById: mock(() => Promise.resolve(null)),
  listCouncilNeeds: mock(() => Promise.resolve([])),
  listCouncilNeedsByCouncil: mock(() => Promise.resolve([])),
  listCouncilNeedsByCommunity: mock(() => Promise.resolve([])),
  updateCouncilNeed: mock(() => Promise.resolve(null)),
  deleteCouncilNeed: mock(() => Promise.resolve(null)),
  aggregateCouncilNeeds: mock(() => Promise.resolve([])),
  findCouncilNeedsDueForFulfillment: mock(() => Promise.resolve([])),
  findCouncilNeedsDueForReplenishment: mock(() => Promise.resolve([])),
  updateCouncilNeedFulfillmentDates: mock(() => Promise.resolve(null)),
};

const mockCouncilRepository = {
  findById: mock(() => Promise.resolve(null)),
};

const mockItemsRepository = {
  findById: mock(() => Promise.resolve(null)),
};

const mockOpenFGAService = {
  checkAccess: mock(() => Promise.resolve(true)),
  getAccessibleResourceIds: mock(() => Promise.resolve(['comm-123'])),
};

// Test data
const testNeed = {
  id: 'need-123',
  createdBy: 'user-123',
  communityId: 'comm-123',
  itemId: 'item-123',
  title: 'Test Need',
  description: 'Test description',
  priority: 'need' as const,
  unitsNeeded: 5,
  isRecurring: false,
  recurrence: null,
  lastFulfilledAt: null,
  nextFulfillmentDate: null,
  status: 'active' as const,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  deletedAt: null,
};

const testRecurringNeed = {
  id: 'need-456',
  createdBy: 'user-123',
  communityId: 'comm-123',
  itemId: 'item-456',
  title: 'Recurring Need',
  description: 'Test recurring',
  priority: 'want' as const,
  unitsNeeded: 10,
  isRecurring: true,
  recurrence: 'weekly' as const,
  lastFulfilledAt: new Date('2024-01-01'),
  nextFulfillmentDate: new Date('2024-01-08'),
  status: 'active' as const,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  deletedAt: null,
};

const testCouncilNeed = {
  id: 'council-need-123',
  councilId: 'council-123',
  createdBy: 'user-123',
  communityId: 'comm-123',
  itemId: 'item-123',
  title: 'Council Need',
  description: 'Test council need',
  priority: 'need' as const,
  unitsNeeded: 8,
  isRecurring: false,
  recurrence: null,
  lastFulfilledAt: null,
  nextFulfillmentDate: null,
  status: 'active' as const,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  deletedAt: null,
};

const testItem = {
  id: 'item-123',
  name: 'Carrots',
  kind: 'object' as const,
  category: 'food',
  isStandard: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

const testCouncil = {
  id: 'council-123',
  communityId: 'comm-123',
  name: 'Test Council',
  description: 'Test',
  createdBy: 'user-123',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

describe('NeedsService', () => {
  let needsService: NeedsService;

  beforeEach(() => {
    // Reset all mocks
    Object.values(mockNeedsRepository).forEach((m) => m.mockReset());
    Object.values(mockCouncilRepository).forEach((m) => m.mockReset());
    Object.values(mockItemsRepository).forEach((m) => m.mockReset());
    Object.values(mockOpenFGAService).forEach((m) => m.mockReset());

    // Assign mocks to actual imports
    (needsRepository.createNeed as any) = mockNeedsRepository.createNeed;
    (needsRepository.findNeedById as any) = mockNeedsRepository.findNeedById;
    (needsRepository.listNeeds as any) = mockNeedsRepository.listNeeds;
    (needsRepository.listNeedsByCommunity as any) = mockNeedsRepository.listNeedsByCommunity;
    (needsRepository.listNeedsByCreator as any) = mockNeedsRepository.listNeedsByCreator;
    (needsRepository.updateNeed as any) = mockNeedsRepository.updateNeed;
    (needsRepository.deleteNeed as any) = mockNeedsRepository.deleteNeed;
    (needsRepository.aggregateCommunityNeeds as any) = mockNeedsRepository.aggregateCommunityNeeds;
    (needsRepository.findNeedsDueForFulfillment as any) =
      mockNeedsRepository.findNeedsDueForFulfillment;
    (needsRepository.findMemberNeedsDueForReplenishment as any) =
      mockNeedsRepository.findMemberNeedsDueForReplenishment;
    (needsRepository.updateNeedFulfillmentDates as any) =
      mockNeedsRepository.updateNeedFulfillmentDates;
    (needsRepository.createCouncilNeed as any) = mockNeedsRepository.createCouncilNeed;
    (needsRepository.findCouncilNeedById as any) = mockNeedsRepository.findCouncilNeedById;
    (needsRepository.listCouncilNeeds as any) = mockNeedsRepository.listCouncilNeeds;
    (needsRepository.listCouncilNeedsByCouncil as any) =
      mockNeedsRepository.listCouncilNeedsByCouncil;
    (needsRepository.listCouncilNeedsByCommunity as any) =
      mockNeedsRepository.listCouncilNeedsByCommunity;
    (needsRepository.updateCouncilNeed as any) = mockNeedsRepository.updateCouncilNeed;
    (needsRepository.deleteCouncilNeed as any) = mockNeedsRepository.deleteCouncilNeed;
    (needsRepository.aggregateCouncilNeeds as any) = mockNeedsRepository.aggregateCouncilNeeds;
    (needsRepository.findCouncilNeedsDueForFulfillment as any) =
      mockNeedsRepository.findCouncilNeedsDueForFulfillment;
    (needsRepository.findCouncilNeedsDueForReplenishment as any) =
      mockNeedsRepository.findCouncilNeedsDueForReplenishment;
    (needsRepository.updateCouncilNeedFulfillmentDates as any) =
      mockNeedsRepository.updateCouncilNeedFulfillmentDates;

    (councilRepository.findById as any) = mockCouncilRepository.findById;
    (itemsRepository.findById as any) = mockItemsRepository.findById;
    (openFGAService.checkAccess as any) = mockOpenFGAService.checkAccess;
    (openFGAService.getAccessibleResourceIds as any) = mockOpenFGAService.getAccessibleResourceIds;

    // Create service instance
    needsService = new NeedsService(needsRepository as any);
  });

  // ========================================
  // MEMBER NEEDS TESTS
  // ========================================

  describe('Member Needs', () => {
    describe('createNeed', () => {
      it('should create a need with valid permissions', async () => {
        mockOpenFGAService.checkAccess.mockResolvedValue(true);
        mockItemsRepository.findById.mockResolvedValue(testItem as any);
        mockNeedsRepository.createNeed.mockResolvedValue(testNeed as any);

        const result = await needsService.createNeed(
          {
            communityId: 'comm-123',
            itemId: 'item-123',
            title: 'Test Need',
            priority: 'need',
            unitsNeeded: 5,
            isRecurring: false,
          },
          'user-123'
        );

        expect(result).toEqual(testNeed);
        expect(mockOpenFGAService.checkAccess).toHaveBeenCalledWith(
          'user-123',
          'community',
          'comm-123',
          'can_publish_needs'
        );
        expect(mockNeedsRepository.createNeed).toHaveBeenCalled();
      });

      it('should throw error without can_publish_needs permission', async () => {
        mockOpenFGAService.checkAccess.mockResolvedValue(false);

        await expect(
          needsService.createNeed(
            {
              communityId: 'comm-123',
              itemId: 'item-123',
              title: 'Test',
              priority: 'need',
              unitsNeeded: 1,
              isRecurring: false,
            },
            'user-123'
          )
        ).rejects.toThrow('Forbidden: you do not have permission to publish needs');
      });

      it('should throw error if item not found', async () => {
        mockOpenFGAService.checkAccess.mockResolvedValue(true);
        mockItemsRepository.findById.mockResolvedValue(null as any);

        await expect(
          needsService.createNeed(
            {
              communityId: 'comm-123',
              itemId: 'nonexistent',
              title: 'Test',
              priority: 'need',
              unitsNeeded: 1,
              isRecurring: false,
            },
            'user-123'
          )
        ).rejects.toThrow('Item not found');
      });

      it('should throw error if recurring without recurrence frequency', async () => {
        mockOpenFGAService.checkAccess.mockResolvedValue(true);
        mockItemsRepository.findById.mockResolvedValue(testItem as any);

        await expect(
          needsService.createNeed(
            {
              communityId: 'comm-123',
              itemId: 'item-123',
              title: 'Test',
              priority: 'need',
              unitsNeeded: 1,
              isRecurring: true,
            },
            'user-123'
          )
        ).rejects.toThrow('Recurrence frequency is required when isRecurring is true');
      });

      it('should create recurring need with nextFulfillmentDate', async () => {
        mockOpenFGAService.checkAccess.mockResolvedValue(true);
        mockItemsRepository.findById.mockResolvedValue(testItem as any);
        mockNeedsRepository.createNeed.mockResolvedValue(testRecurringNeed as any);

        const result = await needsService.createNeed(
          {
            communityId: 'comm-123',
            itemId: 'item-456',
            title: 'Recurring Need',
            priority: 'want',
            unitsNeeded: 10,
            isRecurring: true,
            recurrence: 'weekly',
          },
          'user-123'
        );

        expect(result.isRecurring).toBe(true);
        expect(result.recurrence).toBe('weekly');
        expect(mockNeedsRepository.createNeed).toHaveBeenCalledWith(
          expect.objectContaining({
            nextFulfillmentDate: expect.any(Date),
          })
        );
      });

      it('should create need with description', async () => {
        mockOpenFGAService.checkAccess.mockResolvedValue(true);
        mockItemsRepository.findById.mockResolvedValue(testItem as any);
        mockNeedsRepository.createNeed.mockResolvedValue({
          ...testNeed,
          description: 'Detailed description',
        } as any);

        const result = await needsService.createNeed(
          {
            communityId: 'comm-123',
            itemId: 'item-123',
            title: 'Test Need',
            description: 'Detailed description',
            priority: 'need',
            unitsNeeded: 5,
            isRecurring: false,
          },
          'user-123'
        );

        expect(result.description).toBe('Detailed description');
      });
    });

    describe('getNeed', () => {
      it('should return need with can_view_needs permission', async () => {
        mockNeedsRepository.findNeedById.mockResolvedValue(testNeed as any);
        mockOpenFGAService.checkAccess.mockResolvedValue(true);

        const result = await needsService.getNeed('need-123', 'user-123');

        expect(result).toEqual(testNeed);
        expect(mockOpenFGAService.checkAccess).toHaveBeenCalledWith(
          'user-123',
          'community',
          'comm-123',
          'can_view_needs'
        );
      });

      it('should throw error if need not found', async () => {
        mockNeedsRepository.findNeedById.mockResolvedValue(null as any);

        await expect(needsService.getNeed('nonexistent', 'user-123')).rejects.toThrow(
          'Need not found'
        );
      });

      it('should throw error without can_view_needs permission', async () => {
        mockNeedsRepository.findNeedById.mockResolvedValue(testNeed as any);
        mockOpenFGAService.checkAccess.mockResolvedValue(false);

        await expect(needsService.getNeed('need-123', 'user-123')).rejects.toThrow(
          'Forbidden: you do not have permission to view needs'
        );
      });
    });

    describe('listNeeds', () => {
      it('should list needs for specific community with permission', async () => {
        mockOpenFGAService.checkAccess.mockResolvedValue(true);
        mockNeedsRepository.listNeeds.mockResolvedValue([testNeed, testRecurringNeed] as any);

        const result = await needsService.listNeeds({ communityId: 'comm-123' }, 'user-123');

        expect(result).toHaveLength(2);
        expect(mockOpenFGAService.checkAccess).toHaveBeenCalledWith(
          'user-123',
          'community',
          'comm-123',
          'can_view_needs'
        );
      });

      it('should throw error without permission for specific community', async () => {
        mockOpenFGAService.checkAccess.mockResolvedValue(false);

        await expect(
          needsService.listNeeds({ communityId: 'comm-123' }, 'user-123')
        ).rejects.toThrow('Forbidden: you do not have permission to view needs');
      });

      it('should list needs from all accessible communities', async () => {
        mockOpenFGAService.getAccessibleResourceIds.mockResolvedValue(['comm-1', 'comm-2'] as any);
        mockNeedsRepository.listNeeds
          .mockResolvedValueOnce([testNeed] as any)
          .mockResolvedValueOnce([testRecurringNeed] as any);

        const result = await needsService.listNeeds({}, 'user-123');

        expect(result).toHaveLength(2);
        expect(mockOpenFGAService.getAccessibleResourceIds).toHaveBeenCalledWith(
          'user-123',
          'community',
          'can_view_needs'
        );
      });

      it('should return empty array if no accessible communities', async () => {
        mockOpenFGAService.getAccessibleResourceIds.mockResolvedValue([] as any);

        const result = await needsService.listNeeds({}, 'user-123');

        expect(result).toHaveLength(0);
      });

      it('should filter by priority', async () => {
        mockOpenFGAService.checkAccess.mockResolvedValue(true);
        mockNeedsRepository.listNeeds.mockResolvedValue([testNeed] as any);

        const result = await needsService.listNeeds(
          { communityId: 'comm-123', priority: 'need' },
          'user-123'
        );

        expect(result).toHaveLength(1);
        expect(mockNeedsRepository.listNeeds).toHaveBeenCalledWith(
          expect.objectContaining({ priority: 'need' })
        );
      });

      it('should filter by status', async () => {
        mockOpenFGAService.checkAccess.mockResolvedValue(true);
        mockNeedsRepository.listNeeds.mockResolvedValue([testNeed] as any);

        const result = await needsService.listNeeds(
          { communityId: 'comm-123', status: 'active' },
          'user-123'
        );

        expect(result).toHaveLength(1);
      });
    });

    describe('updateNeed', () => {
      it('should update need as creator', async () => {
        mockNeedsRepository.findNeedById.mockResolvedValue(testNeed as any);
        mockNeedsRepository.updateNeed.mockResolvedValue({
          ...testNeed,
          title: 'Updated Title',
        } as any);

        const result = await needsService.updateNeed(
          'need-123',
          { title: 'Updated Title' },
          'user-123'
        );

        expect(result.title).toBe('Updated Title');
        expect(mockNeedsRepository.updateNeed).toHaveBeenCalled();
      });

      it('should throw error if need not found', async () => {
        mockNeedsRepository.findNeedById.mockResolvedValue(null as any);

        await expect(
          needsService.updateNeed('nonexistent', { title: 'Updated' }, 'user-123')
        ).rejects.toThrow('Need not found');
      });

      it('should throw error if not creator', async () => {
        mockNeedsRepository.findNeedById.mockResolvedValue({
          ...testNeed,
          createdBy: 'user-456',
        } as any);

        await expect(
          needsService.updateNeed('need-123', { title: 'Updated' }, 'user-123')
        ).rejects.toThrow('Forbidden: you can only update your own needs');
      });

      it('should throw error if setting isRecurring true without recurrence', async () => {
        mockNeedsRepository.findNeedById.mockResolvedValue({
          ...testNeed,
          recurrence: null,
        } as any);

        await expect(
          needsService.updateNeed('need-123', { isRecurring: true }, 'user-123')
        ).rejects.toThrow('Recurrence frequency is required when isRecurring is true');
      });

      it('should recalculate nextFulfillmentDate when changing recurrence', async () => {
        mockNeedsRepository.findNeedById.mockResolvedValue(testNeed as any);
        mockNeedsRepository.updateNeed.mockResolvedValue({
          ...testNeed,
          isRecurring: true,
          recurrence: 'daily',
          nextFulfillmentDate: expect.any(Date),
        } as any);

        await needsService.updateNeed(
          'need-123',
          { isRecurring: true, recurrence: 'daily' },
          'user-123'
        );

        expect(mockNeedsRepository.updateNeed).toHaveBeenCalledWith(
          'need-123',
          expect.objectContaining({
            nextFulfillmentDate: expect.any(Date),
          })
        );
      });

      it('should clear nextFulfillmentDate when disabling recurring', async () => {
        mockNeedsRepository.findNeedById.mockResolvedValue(testRecurringNeed as any);
        mockNeedsRepository.updateNeed.mockResolvedValue({
          ...testRecurringNeed,
          isRecurring: false,
          nextFulfillmentDate: null,
        } as any);

        await needsService.updateNeed('need-456', { isRecurring: false }, 'user-123');

        expect(mockNeedsRepository.updateNeed).toHaveBeenCalledWith(
          'need-456',
          expect.objectContaining({
            nextFulfillmentDate: null,
          })
        );
      });
    });

    describe('deleteNeed', () => {
      it('should delete need as creator', async () => {
        mockNeedsRepository.findNeedById.mockResolvedValue(testNeed as any);
        mockNeedsRepository.deleteNeed.mockResolvedValue({
          ...testNeed,
          deletedAt: new Date(),
        } as any);

        await needsService.deleteNeed('need-123', 'user-123');

        expect(mockNeedsRepository.deleteNeed).toHaveBeenCalledWith('need-123');
      });

      it('should throw error if need not found', async () => {
        mockNeedsRepository.findNeedById.mockResolvedValue(null as any);

        await expect(needsService.deleteNeed('nonexistent', 'user-123')).rejects.toThrow(
          'Need not found'
        );
      });

      it('should throw error if not creator', async () => {
        mockNeedsRepository.findNeedById.mockResolvedValue({
          ...testNeed,
          createdBy: 'user-456',
        } as any);

        await expect(needsService.deleteNeed('need-123', 'user-123')).rejects.toThrow(
          'Forbidden: you can only delete your own needs'
        );
      });
    });

    describe('getAggregatedNeeds', () => {
      it('should return aggregated needs and wants', async () => {
        mockOpenFGAService.checkAccess.mockResolvedValue(true);
        mockNeedsRepository.aggregateCommunityNeeds.mockResolvedValue([
          {
            itemId: 'item-1',
            itemName: 'Item 1',
            itemKind: 'object',
            priority: 'need',
            recurrence: 'daily',
            totalUnitsNeeded: 20,
            memberCount: 5,
          },
          {
            itemId: 'item-2',
            itemName: 'Item 2',
            itemKind: 'service',
            priority: 'want',
            recurrence: 'one-time',
            totalUnitsNeeded: 3,
            memberCount: 2,
          },
        ] as any);
        mockNeedsRepository.aggregateCouncilNeeds.mockResolvedValue([
          {
            itemId: 'item-3',
            itemName: 'Item 3',
            itemKind: 'object',
            priority: 'need',
            recurrence: 'weekly',
            totalUnitsNeeded: 10,
            memberCount: 1,
          },
        ] as any);

        const result = await needsService.getAggregatedNeeds('comm-123', 'user-123');

        expect(result.needs).toHaveLength(2);
        expect(result.wants).toHaveLength(1);
        expect(mockOpenFGAService.checkAccess).toHaveBeenCalledWith(
          'user-123',
          'community',
          'comm-123',
          'can_view_needs'
        );
      });

      it('should throw error without can_view_needs permission', async () => {
        mockOpenFGAService.checkAccess.mockResolvedValue(false);

        await expect(needsService.getAggregatedNeeds('comm-123', 'user-123')).rejects.toThrow(
          'Forbidden: you do not have permission to view needs'
        );
      });
    });
  });

  // ========================================
  // COUNCIL NEEDS TESTS
  // ========================================

  describe('Council Needs', () => {
    describe('createCouncilNeed', () => {
      it('should create council need with can_manage permission', async () => {
        mockOpenFGAService.checkAccess.mockResolvedValue(true);
        mockCouncilRepository.findById.mockResolvedValue(testCouncil as any);
        mockItemsRepository.findById.mockResolvedValue(testItem as any);
        mockNeedsRepository.createCouncilNeed.mockResolvedValue(testCouncilNeed as any);

        const result = await needsService.createCouncilNeed(
          {
            councilId: 'council-123',
            communityId: 'comm-123',
            itemId: 'item-123',
            title: 'Council Need',
            priority: 'need',
            unitsNeeded: 8,
            isRecurring: false,
          },
          'user-123'
        );

        expect(result).toEqual(testCouncilNeed);
        expect(mockOpenFGAService.checkAccess).toHaveBeenCalledWith(
          'user-123',
          'council',
          'council-123',
          'can_manage'
        );
      });

      it('should throw error without can_manage permission', async () => {
        mockOpenFGAService.checkAccess.mockResolvedValue(false);

        await expect(
          needsService.createCouncilNeed(
            {
              councilId: 'council-123',
              communityId: 'comm-123',
              itemId: 'item-123',
              title: 'Council Need',
              priority: 'need',
              unitsNeeded: 8,
              isRecurring: false,
            },
            'user-123'
          )
        ).rejects.toThrow('Forbidden: you do not have permission to manage this council');
      });

      it('should throw error if council not found', async () => {
        mockOpenFGAService.checkAccess.mockResolvedValue(true);
        mockCouncilRepository.findById.mockResolvedValue(null as any);

        await expect(
          needsService.createCouncilNeed(
            {
              councilId: 'nonexistent',
              communityId: 'comm-123',
              itemId: 'item-123',
              title: 'Council Need',
              priority: 'need',
              unitsNeeded: 8,
              isRecurring: false,
            },
            'user-123'
          )
        ).rejects.toThrow('Council not found');
      });

      it('should throw error if council community mismatch', async () => {
        mockOpenFGAService.checkAccess.mockResolvedValue(true);
        mockCouncilRepository.findById.mockResolvedValue({
          ...testCouncil,
          communityId: 'comm-456',
        } as any);

        await expect(
          needsService.createCouncilNeed(
            {
              councilId: 'council-123',
              communityId: 'comm-123',
              itemId: 'item-123',
              title: 'Council Need',
              priority: 'need',
              unitsNeeded: 8,
              isRecurring: false,
            },
            'user-123'
          )
        ).rejects.toThrow('Council does not belong to the specified community');
      });

      it('should throw error if recurring without recurrence frequency', async () => {
        mockOpenFGAService.checkAccess.mockResolvedValue(true);
        mockCouncilRepository.findById.mockResolvedValue(testCouncil as any);
        mockItemsRepository.findById.mockResolvedValue(testItem as any);

        await expect(
          needsService.createCouncilNeed(
            {
              councilId: 'council-123',
              communityId: 'comm-123',
              itemId: 'item-123',
              title: 'Council Need',
              priority: 'need',
              unitsNeeded: 8,
              isRecurring: true,
            },
            'user-123'
          )
        ).rejects.toThrow('Recurrence frequency is required when isRecurring is true');
      });

      it('should create recurring council need with nextFulfillmentDate', async () => {
        mockOpenFGAService.checkAccess.mockResolvedValue(true);
        mockCouncilRepository.findById.mockResolvedValue(testCouncil as any);
        mockItemsRepository.findById.mockResolvedValue(testItem as any);
        mockNeedsRepository.createCouncilNeed.mockResolvedValue({
          ...testCouncilNeed,
          isRecurring: true,
          recurrence: 'monthly',
        } as any);

        await needsService.createCouncilNeed(
          {
            councilId: 'council-123',
            communityId: 'comm-123',
            itemId: 'item-123',
            title: 'Council Need',
            priority: 'need',
            unitsNeeded: 8,
            isRecurring: true,
            recurrence: 'monthly',
          },
          'user-123'
        );

        expect(mockNeedsRepository.createCouncilNeed).toHaveBeenCalledWith(
          expect.objectContaining({
            nextFulfillmentDate: expect.any(Date),
          })
        );
      });
    });

    describe('getCouncilNeed', () => {
      it('should return council need with can_view_needs permission', async () => {
        mockNeedsRepository.findCouncilNeedById.mockResolvedValue(testCouncilNeed as any);
        mockOpenFGAService.checkAccess.mockResolvedValue(true);

        const result = await needsService.getCouncilNeed('council-need-123', 'user-123');

        expect(result).toEqual(testCouncilNeed);
        expect(mockOpenFGAService.checkAccess).toHaveBeenCalledWith(
          'user-123',
          'community',
          'comm-123',
          'can_view_needs'
        );
      });

      it('should throw error if council need not found', async () => {
        mockNeedsRepository.findCouncilNeedById.mockResolvedValue(null as any);

        await expect(needsService.getCouncilNeed('nonexistent', 'user-123')).rejects.toThrow(
          'Council need not found'
        );
      });

      it('should throw error without can_view_needs permission', async () => {
        mockNeedsRepository.findCouncilNeedById.mockResolvedValue(testCouncilNeed as any);
        mockOpenFGAService.checkAccess.mockResolvedValue(false);

        await expect(needsService.getCouncilNeed('council-need-123', 'user-123')).rejects.toThrow(
          'Forbidden: you do not have permission to view needs'
        );
      });
    });

    describe('listCouncilNeeds', () => {
      it('should list council needs for specific community', async () => {
        mockOpenFGAService.checkAccess.mockResolvedValue(true);
        mockNeedsRepository.listCouncilNeeds.mockResolvedValue([testCouncilNeed] as any);

        const result = await needsService.listCouncilNeeds({ communityId: 'comm-123' }, 'user-123');

        expect(result).toHaveLength(1);
        expect(mockOpenFGAService.checkAccess).toHaveBeenCalledWith(
          'user-123',
          'community',
          'comm-123',
          'can_view_needs'
        );
      });

      it('should list council needs for specific council', async () => {
        mockCouncilRepository.findById.mockResolvedValue(testCouncil as any);
        mockOpenFGAService.checkAccess.mockResolvedValue(true);
        mockNeedsRepository.listCouncilNeeds.mockResolvedValue([testCouncilNeed] as any);

        const result = await needsService.listCouncilNeeds(
          { councilId: 'council-123' },
          'user-123'
        );

        expect(result).toHaveLength(1);
      });

      it('should throw error if council not found', async () => {
        mockCouncilRepository.findById.mockResolvedValue(null as any);

        await expect(
          needsService.listCouncilNeeds({ councilId: 'nonexistent' }, 'user-123')
        ).rejects.toThrow('Council not found');
      });

      it('should list council needs from all accessible communities', async () => {
        mockOpenFGAService.getAccessibleResourceIds.mockResolvedValue(['comm-1', 'comm-2'] as any);
        mockNeedsRepository.listCouncilNeeds
          .mockResolvedValueOnce([testCouncilNeed] as any)
          .mockResolvedValueOnce([] as any);

        const result = await needsService.listCouncilNeeds({}, 'user-123');

        expect(result).toHaveLength(1);
        expect(mockOpenFGAService.getAccessibleResourceIds).toHaveBeenCalledWith(
          'user-123',
          'community',
          'can_view_needs'
        );
      });

      it('should return empty array if no accessible communities', async () => {
        mockOpenFGAService.getAccessibleResourceIds.mockResolvedValue([] as any);

        const result = await needsService.listCouncilNeeds({}, 'user-123');

        expect(result).toHaveLength(0);
      });
    });

    describe('updateCouncilNeed', () => {
      it('should update council need with can_manage permission', async () => {
        mockNeedsRepository.findCouncilNeedById.mockResolvedValue(testCouncilNeed as any);
        mockOpenFGAService.checkAccess.mockResolvedValue(true);
        mockNeedsRepository.updateCouncilNeed.mockResolvedValue({
          ...testCouncilNeed,
          title: 'Updated Council Need',
        } as any);

        const result = await needsService.updateCouncilNeed(
          'council-need-123',
          { title: 'Updated Council Need' },
          'user-123'
        );

        expect(result.title).toBe('Updated Council Need');
        expect(mockOpenFGAService.checkAccess).toHaveBeenCalledWith(
          'user-123',
          'council',
          'council-123',
          'can_manage'
        );
      });

      it('should throw error if council need not found', async () => {
        mockNeedsRepository.findCouncilNeedById.mockResolvedValue(null as any);

        await expect(
          needsService.updateCouncilNeed('nonexistent', { title: 'Updated' }, 'user-123')
        ).rejects.toThrow('Council need not found');
      });

      it('should throw error without can_manage permission', async () => {
        mockNeedsRepository.findCouncilNeedById.mockResolvedValue(testCouncilNeed as any);
        mockOpenFGAService.checkAccess.mockResolvedValue(false);

        await expect(
          needsService.updateCouncilNeed('council-need-123', { title: 'Updated' }, 'user-123')
        ).rejects.toThrow('Forbidden: you do not have permission to manage this council');
      });

      it('should recalculate nextFulfillmentDate when changing recurrence', async () => {
        mockNeedsRepository.findCouncilNeedById.mockResolvedValue(testCouncilNeed as any);
        mockOpenFGAService.checkAccess.mockResolvedValue(true);
        mockNeedsRepository.updateCouncilNeed.mockResolvedValue({
          ...testCouncilNeed,
          isRecurring: true,
          recurrence: 'weekly',
        } as any);

        await needsService.updateCouncilNeed(
          'council-need-123',
          { isRecurring: true, recurrence: 'weekly' },
          'user-123'
        );

        expect(mockNeedsRepository.updateCouncilNeed).toHaveBeenCalledWith(
          'council-need-123',
          expect.objectContaining({
            nextFulfillmentDate: expect.any(Date),
          })
        );
      });
    });

    describe('deleteCouncilNeed', () => {
      it('should delete council need with can_manage permission', async () => {
        mockNeedsRepository.findCouncilNeedById.mockResolvedValue(testCouncilNeed as any);
        mockOpenFGAService.checkAccess.mockResolvedValue(true);
        mockNeedsRepository.deleteCouncilNeed.mockResolvedValue({
          ...testCouncilNeed,
          deletedAt: new Date(),
        } as any);

        await needsService.deleteCouncilNeed('council-need-123', 'user-123');

        expect(mockNeedsRepository.deleteCouncilNeed).toHaveBeenCalledWith('council-need-123');
      });

      it('should throw error if council need not found', async () => {
        mockNeedsRepository.findCouncilNeedById.mockResolvedValue(null as any);

        await expect(needsService.deleteCouncilNeed('nonexistent', 'user-123')).rejects.toThrow(
          'Council need not found'
        );
      });

      it('should throw error without can_manage permission', async () => {
        mockNeedsRepository.findCouncilNeedById.mockResolvedValue(testCouncilNeed as any);
        mockOpenFGAService.checkAccess.mockResolvedValue(false);

        await expect(
          needsService.deleteCouncilNeed('council-need-123', 'user-123')
        ).rejects.toThrow('Forbidden: you do not have permission to manage this council');
      });
    });
  });

  // ========================================
  // REPLENISHMENT TESTS
  // ========================================

  describe('replenishDueNeeds', () => {
    it('should replenish due member and council needs', async () => {
      const dueNeed = {
        ...testRecurringNeed,
        nextFulfillmentDate: new Date('2024-01-08'),
      };
      const dueCouncilNeed = {
        ...testCouncilNeed,
        isRecurring: true,
        recurrence: 'monthly' as const,
        nextFulfillmentDate: new Date('2024-01-31'),
      };

      mockNeedsRepository.findMemberNeedsDueForReplenishment.mockResolvedValue([dueNeed] as any);
      mockNeedsRepository.findCouncilNeedsDueForReplenishment.mockResolvedValue([
        dueCouncilNeed,
      ] as any);
      mockNeedsRepository.updateNeedFulfillmentDates.mockResolvedValue(dueNeed as any);
      mockNeedsRepository.updateCouncilNeedFulfillmentDates.mockResolvedValue(
        dueCouncilNeed as any
      );

      const result = await needsService.replenishDueNeeds();

      expect(result.total).toBe(2);
      expect(result.succeeded).toBe(2);
      expect(result.failed).toBe(0);
      expect(result.errors).toHaveLength(0);
      expect(mockNeedsRepository.updateNeedFulfillmentDates).toHaveBeenCalled();
      expect(mockNeedsRepository.updateCouncilNeedFulfillmentDates).toHaveBeenCalled();
    });

    it('should handle needs with missing recurrence configuration', async () => {
      const invalidNeed = {
        ...testRecurringNeed,
        recurrence: null,
      };

      mockNeedsRepository.findMemberNeedsDueForReplenishment.mockResolvedValue([
        invalidNeed,
      ] as any);
      mockNeedsRepository.findCouncilNeedsDueForReplenishment.mockResolvedValue([] as any);

      const result = await needsService.replenishDueNeeds();

      expect(result.total).toBe(1);
      expect(result.succeeded).toBe(0);
      expect(result.failed).toBe(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].error).toBe('Missing recurrence configuration');
    });

    it('should handle repository errors gracefully', async () => {
      const dueNeed = {
        ...testRecurringNeed,
        nextFulfillmentDate: new Date('2024-01-08'),
      };

      mockNeedsRepository.findMemberNeedsDueForReplenishment.mockResolvedValue([dueNeed] as any);
      mockNeedsRepository.findCouncilNeedsDueForReplenishment.mockResolvedValue([] as any);
      mockNeedsRepository.updateNeedFulfillmentDates.mockRejectedValue(new Error('Database error'));

      const result = await needsService.replenishDueNeeds();

      expect(result.total).toBe(1);
      expect(result.succeeded).toBe(0);
      expect(result.failed).toBe(1);
      expect(result.errors[0].error).toBe('Database error');
    });

    it('should calculate correct next fulfillment dates', async () => {
      const dailyNeed = { ...testRecurringNeed, recurrence: 'daily' as const };
      const weeklyNeed = { ...testRecurringNeed, recurrence: 'weekly' as const };
      const monthlyNeed = { ...testRecurringNeed, recurrence: 'monthly' as const };

      mockNeedsRepository.findMemberNeedsDueForReplenishment.mockResolvedValue([
        dailyNeed,
        weeklyNeed,
        monthlyNeed,
      ] as any);
      mockNeedsRepository.findCouncilNeedsDueForReplenishment.mockResolvedValue([] as any);
      mockNeedsRepository.updateNeedFulfillmentDates.mockResolvedValue(dailyNeed as any);

      await needsService.replenishDueNeeds();

      const calls = mockNeedsRepository.updateNeedFulfillmentDates.mock.calls;
      expect(calls).toHaveLength(3);
    });

    it('should return empty results if no needs due', async () => {
      mockNeedsRepository.findMemberNeedsDueForReplenishment.mockResolvedValue([] as any);
      mockNeedsRepository.findCouncilNeedsDueForReplenishment.mockResolvedValue([] as any);

      const result = await needsService.replenishDueNeeds();

      expect(result.total).toBe(0);
      expect(result.succeeded).toBe(0);
      expect(result.failed).toBe(0);
      expect(result.errors).toHaveLength(0);
    });
  });
});
