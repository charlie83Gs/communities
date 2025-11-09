import { describe, it, expect, beforeEach } from 'bun:test';
import { PoolsRepository } from './pools.repository';
import { createThenableMockDb, setupMockDbChains } from '../../tests/helpers/mockDb';

const mockDb = createThenableMockDb();
let poolsRepository: PoolsRepository;

const testPool = {
  id: 'pool-123',
  communityId: 'comm-123',
  councilId: 'council-123',
  name: 'Tomato Pool',
  description: 'Community tomato aggregation pool',
  primaryItemId: 'item-tomato',
  distributionLocation: 'Community Center',
  distributionType: 'manual' as const,
  maxUnitsPerUser: 5,
  minimumContribution: 1,
  createdBy: 'user-123',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  deletedAt: null,
};

const testInventory = [
  {
    itemId: 'item-tomato',
    itemName: 'Tomatoes',
    unitsAvailable: 50,
  },
];

describe('PoolsRepository', () => {
  beforeEach(() => {
    setupMockDbChains(mockDb);
    poolsRepository = new PoolsRepository(mockDb as any);
  });

  describe('create', () => {
    it('should create a pool', async () => {
      mockDb.returning.mockResolvedValue([testPool]);

      const result = await poolsRepository.create({
        communityId: 'comm-123',
        councilId: 'council-123',
        name: 'Tomato Pool',
        description: 'Community tomato aggregation pool',
        distributionType: 'manual',
        createdBy: 'user-123',
      });

      expect(result).toEqual(testPool);
      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockDb.values).toHaveBeenCalled();
      expect(mockDb.returning).toHaveBeenCalled();
    });
  });

  describe('findById', () => {
    it('should find pool by id', async () => {
      mockDb.where.mockResolvedValue([testPool]);

      const result = await poolsRepository.findById('pool-123');

      expect(result).toEqual(testPool);
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalled();
    });

    it('should return undefined if not found', async () => {
      mockDb.where.mockResolvedValue([]);

      const result = await poolsRepository.findById('nonexistent');

      expect(result).toBeUndefined();
    });
  });

  describe('listByCommunity', () => {
    it('should list all pools for a community', async () => {
      mockDb.orderBy.mockResolvedValue([testPool]);

      const result = await poolsRepository.listByCommunity('comm-123');

      expect(result).toEqual([testPool]);
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalled();
      expect(mockDb.orderBy).toHaveBeenCalled();
    });
  });

  describe('listByCouncil', () => {
    it('should list all pools for a council', async () => {
      mockDb.orderBy.mockResolvedValue([testPool]);

      const result = await poolsRepository.listByCouncil('council-123');

      expect(result).toEqual([testPool]);
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalled();
      expect(mockDb.orderBy).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update pool', async () => {
      const updatedPool = { ...testPool, name: 'Updated Pool' };
      mockDb.returning.mockResolvedValue([updatedPool]);

      const result = await poolsRepository.update('pool-123', {
        name: 'Updated Pool',
      });

      expect(result?.name).toBe('Updated Pool');
      expect(mockDb.update).toHaveBeenCalled();
      expect(mockDb.set).toHaveBeenCalled();
      expect(mockDb.returning).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should soft delete pool', async () => {
      const deletedPool = { ...testPool, deletedAt: new Date() };
      mockDb.returning.mockResolvedValue([deletedPool]);

      const result = await poolsRepository.delete('pool-123');

      expect(result?.deletedAt).toBeTruthy();
      expect(mockDb.update).toHaveBeenCalled();
      expect(mockDb.set).toHaveBeenCalled();
      expect(mockDb.returning).toHaveBeenCalled();
    });
  });

  describe('getInventory', () => {
    it('should get pool inventory', async () => {
      mockDb.where.mockResolvedValue(testInventory);

      const result = await poolsRepository.getInventory('pool-123');

      expect(result).toEqual(testInventory);
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.innerJoin).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalled();
    });
  });

  describe('getInventoryForItem', () => {
    it('should get inventory for specific item', async () => {
      mockDb.where.mockResolvedValue([{ unitsAvailable: 50 }]);

      const result = await poolsRepository.getInventoryForItem('pool-123', 'item-tomato');

      expect(result).toBe(50);
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalled();
    });

    it('should return 0 if item not in inventory', async () => {
      mockDb.where.mockResolvedValue([]);

      const result = await poolsRepository.getInventoryForItem('pool-123', 'item-unknown');

      expect(result).toBe(0);
    });
  });

  describe('incrementInventory', () => {
    it('should increment existing inventory', async () => {
      mockDb.where.mockResolvedValue([{ id: 'inv-123', unitsAvailable: 50 }]);

      await poolsRepository.incrementInventory('pool-123', 'item-tomato', 10);

      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.update).toHaveBeenCalled();
      expect(mockDb.set).toHaveBeenCalled();
    });

    it('should create new inventory record if not exists', async () => {
      mockDb.where.mockResolvedValue([]);

      await poolsRepository.incrementInventory('pool-123', 'item-tomato', 10);

      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockDb.values).toHaveBeenCalled();
    });
  });

  describe('decrementInventory', () => {
    it('should decrement inventory if sufficient units', async () => {
      mockDb.where.mockResolvedValueOnce([{ unitsAvailable: 50 }]);

      const result = await poolsRepository.decrementInventory('pool-123', 'item-tomato', 10);

      expect(result).toBe(true);
      expect(mockDb.update).toHaveBeenCalled();
      expect(mockDb.set).toHaveBeenCalled();
    });

    it('should return false if insufficient units', async () => {
      mockDb.where.mockResolvedValueOnce([{ unitsAvailable: 5 }]);

      const result = await poolsRepository.decrementInventory('pool-123', 'item-tomato', 10);

      expect(result).toBe(false);
    });
  });
});
