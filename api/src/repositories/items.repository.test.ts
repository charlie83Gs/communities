import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { ItemsRepository } from '@/repositories/items.repository';
import { createThenableMockDb, setupMockDbChains } from '../../tests/helpers/mockDb';

let itemsRepository: ItemsRepository;

// Create mock database
const mockDb = createThenableMockDb();

const testItem = {
  id: 'item-123',
  communityId: 'comm-123',
  name: 'Hammer',
  description: 'A standard claw hammer',
  kind: 'object' as const,
  wealthValue: '10.50',
  isDefault: false,
  createdBy: 'user-123',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  deletedAt: null,
};

describe('ItemsRepository', () => {
  beforeEach(() => {
    // Reset all mocks and setup default chains
    setupMockDbChains(mockDb);
    // Instantiate repository with the per-test mock DB
    itemsRepository = new ItemsRepository(mockDb);
  });

  afterEach(() => {
    // Nothing to clean up; a fresh ItemsRepository is created per test
  });

  describe('create', () => {
    it('should create an item', async () => {
      mockDb.returning.mockResolvedValue([testItem]);

      const result = await itemsRepository.create({
        communityId: 'comm-123',
        name: 'Hammer',
        description: 'A standard claw hammer',
        kind: 'object',
        wealthValue: '10.50',
        createdBy: 'user-123',
      });

      expect(result).toEqual(testItem);
      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockDb.values).toHaveBeenCalled();
      expect(mockDb.returning).toHaveBeenCalled();
    });

    it('should create item with isDefault flag', async () => {
      const defaultItem = { ...testItem, isDefault: true };
      mockDb.returning.mockResolvedValue([defaultItem]);

      const result = await itemsRepository.create({
        communityId: 'comm-123',
        name: 'Hammer',
        description: 'A standard claw hammer',
        kind: 'object',
        wealthValue: '10.50',
        isDefault: true,
        createdBy: 'user-123',
      });

      expect(result.isDefault).toBe(true);
    });
  });

  describe('findById', () => {
    it('should find item by id', async () => {
      mockDb.where.mockResolvedValue([testItem]);

      const result = await itemsRepository.findById('item-123');

      expect(result).toEqual(testItem);
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalled();
    });

    it('should return undefined if item not found', async () => {
      mockDb.where.mockResolvedValue([]);

      const result = await itemsRepository.findById('nonexistent');

      expect(result).toBeUndefined();
    });
  });

  describe('findByName', () => {
    it('should find item by name (case-insensitive)', async () => {
      mockDb.where.mockResolvedValue([testItem]);

      const result = await itemsRepository.findByName('comm-123', 'hammer');

      expect(result).toEqual(testItem);
      expect(mockDb.where).toHaveBeenCalled();
    });

    it('should return undefined if item not found', async () => {
      mockDb.where.mockResolvedValue([]);

      const result = await itemsRepository.findByName('comm-123', 'nonexistent');

      expect(result).toBeUndefined();
    });

    it('should exclude deleted items', async () => {
      // @ts-ignore
      const _deletedItem = { ...testItem, deletedAt: new Date() };
      mockDb.where.mockResolvedValue([]);

      const result = await itemsRepository.findByName('comm-123', 'hammer');

      expect(result).toBeUndefined();
    });
  });

  describe('listByCommunity', () => {
    it('should list items with wealth count', async () => {
      const itemsWithCount = [
        {
          ...testItem,
          wealthCount: 5,
        },
      ];
      mockDb.orderBy.mockResolvedValue(itemsWithCount);

      const result = await itemsRepository.listByCommunity('comm-123');

      expect(result).toHaveLength(1);
      expect(result[0]._count.wealthEntries).toBe(5);
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.leftJoin).toHaveBeenCalled();
      expect(mockDb.groupBy).toHaveBeenCalled();
      expect(mockDb.orderBy).toHaveBeenCalled();
    });

    it('should exclude deleted items by default', async () => {
      mockDb.orderBy.mockResolvedValue([]);

      await itemsRepository.listByCommunity('comm-123');

      expect(mockDb.where).toHaveBeenCalled();
    });

    it('should include deleted items when requested', async () => {
      const deletedItem = { ...testItem, deletedAt: new Date(), wealthCount: 0 };
      mockDb.orderBy.mockResolvedValue([deletedItem]);

      // @ts-ignore
      const _result = await itemsRepository.listByCommunity('comm-123', true);

      expect(mockDb.where).toHaveBeenCalled();
    });

    it('should return empty array if no items', async () => {
      mockDb.orderBy.mockResolvedValue([]);

      const result = await itemsRepository.listByCommunity('comm-123');

      expect(result).toHaveLength(0);
    });
  });

  describe('search', () => {
    it('should search items by query', async () => {
      mockDb.limit.mockResolvedValue([testItem]);

      const result = await itemsRepository.search('comm-123', 'hammer');

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual(testItem);
      expect(mockDb.where).toHaveBeenCalled();
      expect(mockDb.limit).toHaveBeenCalledWith(50);
    });

    it('should filter by kind', async () => {
      mockDb.limit.mockResolvedValue([testItem]);

      const result = await itemsRepository.search('comm-123', undefined, 'object');

      expect(result).toHaveLength(1);
      expect(mockDb.where).toHaveBeenCalled();
    });

    it('should search with both query and kind', async () => {
      mockDb.limit.mockResolvedValue([testItem]);

      const result = await itemsRepository.search('comm-123', 'hammer', 'object');

      expect(result).toHaveLength(1);
    });

    it('should return empty array if no matches', async () => {
      mockDb.limit.mockResolvedValue([]);

      const result = await itemsRepository.search('comm-123', 'nonexistent');

      expect(result).toHaveLength(0);
    });
  });

  describe('update', () => {
    it('should update item', async () => {
      const updatedItem = {
        ...testItem,
        name: 'Updated Hammer',
      };
      mockDb.returning.mockResolvedValue([updatedItem]);

      const result = await itemsRepository.update('item-123', {
        name: 'Updated Hammer',
      });

      expect(result?.name).toBe('Updated Hammer');
      expect(mockDb.update).toHaveBeenCalled();
      expect(mockDb.set).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalled();
      expect(mockDb.returning).toHaveBeenCalled();
    });

    it('should update wealthValue', async () => {
      const updatedItem = {
        ...testItem,
        wealthValue: '15.75',
      };
      mockDb.returning.mockResolvedValue([updatedItem]);

      const result = await itemsRepository.update('item-123', {
        wealthValue: '15.75',
      });

      expect(result?.wealthValue).toBe('15.75');
    });

    it('should return undefined if item not found', async () => {
      mockDb.returning.mockResolvedValue([]);

      const result = await itemsRepository.update('nonexistent', {
        name: 'New Name',
      });

      expect(result).toBeUndefined();
    });
  });

  describe('softDelete', () => {
    it('should soft delete item', async () => {
      const deletedItem = {
        ...testItem,
        deletedAt: new Date('2024-01-15'),
      };
      mockDb.returning.mockResolvedValue([deletedItem]);

      const result = await itemsRepository.softDelete('item-123');

      expect(result?.deletedAt).not.toBeNull();
      expect(mockDb.update).toHaveBeenCalled();
      expect(mockDb.set).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalled();
    });

    it('should return undefined if item not found', async () => {
      mockDb.returning.mockResolvedValue([]);

      const result = await itemsRepository.softDelete('nonexistent');

      expect(result).toBeUndefined();
    });
  });

  describe('hasActiveWealthReferences', () => {
    it('should return true if item has active wealth references', async () => {
      mockDb.where.mockResolvedValue([{ count: 3 }] as any);

      const result = await itemsRepository.hasActiveWealthReferences('item-123');

      expect(result).toBe(true);
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalled();
    });

    it('should return false if no active wealth references', async () => {
      mockDb.where.mockResolvedValue([{ count: 0 }] as any);

      const result = await itemsRepository.hasActiveWealthReferences('item-123');

      expect(result).toBe(false);
    });
  });

  describe('getWealthCount', () => {
    it('should return wealth count for item', async () => {
      mockDb.where.mockResolvedValue([{ count: 10 }] as any);

      const result = await itemsRepository.getWealthCount('item-123');

      expect(result).toBe(10);
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalled();
    });

    it('should return 0 if no wealth entries', async () => {
      mockDb.where.mockResolvedValue([{ count: 0 }] as any);

      const result = await itemsRepository.getWealthCount('item-123');

      expect(result).toBe(0);
    });
  });
});
