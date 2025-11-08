import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { CouncilRepository } from '@/repositories/council.repository';
import { createThenableMockDb, setupMockDbChains } from '../../tests/helpers/mockDb';

let councilRepository: CouncilRepository;

// Create mock database
const mockDb = createThenableMockDb();

const testCouncil = {
  id: 'council-123',
  communityId: 'comm-123',
  name: 'Test Council',
  description: 'Test council description',
  createdBy: 'user-123',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  deletedAt: null,
};

const testManager = {
  councilId: 'council-123',
  userId: 'user-123',
  createdAt: new Date('2024-01-01'),
};

const testTrustScore = {
  councilId: 'council-123',
  trustScore: 25,
  updatedAt: new Date('2024-01-01'),
};

const testTrustAward = {
  councilId: 'council-123',
  userId: 'user-456',
  awardedAt: new Date('2024-01-01'),
  removedAt: null,
};

describe('CouncilRepository', () => {
  beforeEach(() => {
    // Reset all mocks and setup default chains
    setupMockDbChains(mockDb);
    // Instantiate repository with the per-test mock DB
    councilRepository = new CouncilRepository(mockDb as any);
  });

  afterEach(() => {
    // Nothing to clean up; a fresh CouncilRepository is created per test
  });

  describe('create', () => {
    it('should create a council and initialize trust score', async () => {
      // First insert: council creation with .returning()
      mockDb.returning.mockResolvedValueOnce([testCouncil]);
      // Second insert: trust score initialization without .returning() - uses .then()
      mockDb.then.mockImplementationOnce((resolve: Function) => {
        resolve([testTrustScore]);
        return Promise.resolve([testTrustScore]);
      });

      const result = await councilRepository.create({
        communityId: 'comm-123',
        name: 'Test Council',
        description: 'Test description',
        createdBy: 'user-123',
      });

      expect(result).toEqual(testCouncil);
      expect(mockDb.insert).toHaveBeenCalledTimes(2); // council + trust score
      expect(mockDb.values).toHaveBeenCalledTimes(2);
      expect(mockDb.returning).toHaveBeenCalledTimes(1); // Only first insert has .returning()
    });
  });

  describe('findById', () => {
    it('should find council by id', async () => {
      mockDb.where.mockResolvedValue([testCouncil]);

      const result = await councilRepository.findById('council-123');

      expect(result).toEqual(testCouncil);
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalled();
    });

    it('should return undefined if council not found', async () => {
      mockDb.where.mockResolvedValue([]);

      const result = await councilRepository.findById('nonexistent');

      expect(result).toBeUndefined();
    });

    it('should return undefined if council is deleted', async () => {
      mockDb.where.mockResolvedValue([]);

      const result = await councilRepository.findById('deleted-council');

      expect(result).toBeUndefined();
    });
  });

  describe('findByCommunityId', () => {
    it('should find councils by community id with default options', async () => {
      // First .where() call - main query, continues chain
      mockDb.where.mockReturnValueOnce(mockDb);
      // Main query is awaited via .then()
      mockDb.then.mockImplementationOnce((resolve: Function) => {
        resolve([{ council: testCouncil, trustScore: 25 }]);
        return Promise.resolve([{ council: testCouncil, trustScore: 25 }]);
      });
      // Second .where() call - count query, resolves
      mockDb.where.mockResolvedValueOnce([{ count: 1 }]);

      const result = await councilRepository.findByCommunityId('comm-123');

      expect(result.councils).toHaveLength(1);
      expect(result.councils[0]).toMatchObject(testCouncil);
      expect(result.councils[0].trustScore).toBe(25);
      expect(result.total).toBe(1);
      expect(mockDb.leftJoin).toHaveBeenCalled();
    });

    it('should handle pagination', async () => {
      // First .where() - main query, continues chain
      mockDb.where.mockReturnValueOnce(mockDb);
      // Main query awaited
      mockDb.then.mockImplementationOnce((resolve: Function) => {
        resolve([]);
        return Promise.resolve([]);
      });
      // Second .where() - count query, resolves
      mockDb.where.mockResolvedValueOnce([{ count: 0 }]);

      const result = await councilRepository.findByCommunityId('comm-123', {
        page: 2,
        limit: 10,
      });

      expect(mockDb.limit).toHaveBeenCalled();
      expect(mockDb.offset).toHaveBeenCalled();
    });

    it('should sort by trust score descending', async () => {
      // First .where() - main query, continues chain
      mockDb.where.mockReturnValueOnce(mockDb);
      // Main query awaited
      mockDb.then.mockImplementationOnce((resolve: Function) => {
        resolve([{ council: testCouncil, trustScore: 25 }]);
        return Promise.resolve([{ council: testCouncil, trustScore: 25 }]);
      });
      // Second .where() - count query, resolves
      mockDb.where.mockResolvedValueOnce([{ count: 1 }]);

      const result = await councilRepository.findByCommunityId('comm-123', {
        sortBy: 'trustScore',
        order: 'desc',
      });

      expect(mockDb.orderBy).toHaveBeenCalled();
      expect(result.councils).toHaveLength(1);
    });

    it('should sort by created date ascending', async () => {
      // First .where() - main query, continues chain
      mockDb.where.mockReturnValueOnce(mockDb);
      // Main query awaited
      mockDb.then.mockImplementationOnce((resolve: Function) => {
        resolve([{ council: testCouncil, trustScore: 25 }]);
        return Promise.resolve([{ council: testCouncil, trustScore: 25 }]);
      });
      // Second .where() - count query, resolves
      mockDb.where.mockResolvedValueOnce([{ count: 1 }]);

      const result = await councilRepository.findByCommunityId('comm-123', {
        sortBy: 'createdAt',
        order: 'asc',
      });

      expect(mockDb.orderBy).toHaveBeenCalled();
      expect(result.councils).toHaveLength(1);
    });
  });

  describe('update', () => {
    it('should update council details', async () => {
      const updatedCouncil = {
        ...testCouncil,
        name: 'Updated Council',
      };
      mockDb.returning.mockResolvedValue([updatedCouncil]);

      const result = await councilRepository.update('council-123', {
        name: 'Updated Council',
      });

      expect(result?.name).toBe('Updated Council');
      expect(mockDb.update).toHaveBeenCalled();
      expect(mockDb.set).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalled();
    });

    it('should return undefined if council not found', async () => {
      mockDb.returning.mockResolvedValue([]);

      const result = await councilRepository.update('nonexistent', {
        name: 'New Name',
      });

      expect(result).toBeUndefined();
    });
  });

  describe('delete', () => {
    it('should soft delete a council', async () => {
      const deletedCouncil = {
        ...testCouncil,
        deletedAt: new Date(),
      };
      mockDb.returning.mockResolvedValue([deletedCouncil]);

      const result = await councilRepository.delete('council-123');

      expect(result?.deletedAt).not.toBeNull();
      expect(mockDb.update).toHaveBeenCalled();
      expect(mockDb.set).toHaveBeenCalled();
    });
  });

  describe('Manager Operations', () => {
    describe('addManager', () => {
      it('should add a manager to council', async () => {
        mockDb.returning.mockResolvedValue([testManager]);

        const result = await councilRepository.addManager('council-123', 'user-123');

        expect(result).toEqual(testManager);
        expect(mockDb.insert).toHaveBeenCalled();
        expect(mockDb.values).toHaveBeenCalled();
      });
    });

    describe('removeManager', () => {
      it('should remove a manager from council', async () => {
        mockDb.returning.mockResolvedValue([testManager]);

        const result = await councilRepository.removeManager('council-123', 'user-123');

        expect(result).toEqual(testManager);
        expect(mockDb.delete).toHaveBeenCalled();
        expect(mockDb.where).toHaveBeenCalled();
      });
    });

    describe('getManagers', () => {
      it('should get all managers for a council', async () => {
        mockDb.where.mockResolvedValue([testManager]);

        const result = await councilRepository.getManagers('council-123');

        expect(result).toHaveLength(1);
        expect(result[0]).toEqual(testManager);
      });

      it('should return empty array if no managers', async () => {
        mockDb.where.mockResolvedValue([]);

        const result = await councilRepository.getManagers('council-123');

        expect(result).toHaveLength(0);
      });
    });

    describe('isManager', () => {
      it('should return true if user is manager', async () => {
        mockDb.where.mockResolvedValue([testManager]);

        const result = await councilRepository.isManager('council-123', 'user-123');

        expect(result).toBe(true);
      });

      it('should return false if user is not manager', async () => {
        mockDb.where.mockResolvedValue([]);

        const result = await councilRepository.isManager('council-123', 'user-456');

        expect(result).toBe(false);
      });
    });

    describe('getMemberCount', () => {
      it('should return member count', async () => {
        mockDb.where.mockResolvedValue([{ count: 5 }]);

        const result = await councilRepository.getMemberCount('council-123');

        expect(result).toBe(5);
      });
    });
  });

  describe('Trust Operations', () => {
    describe('getTrustScore', () => {
      it('should get trust score for council', async () => {
        mockDb.where.mockResolvedValue([testTrustScore]);

        const result = await councilRepository.getTrustScore('council-123');

        expect(result).toBe(25);
      });

      it('should return 0 if no trust score found', async () => {
        mockDb.where.mockResolvedValue([]);

        const result = await councilRepository.getTrustScore('council-123');

        expect(result).toBe(0);
      });
    });

    describe('hasAwardedTrust', () => {
      it('should return true if user has awarded trust', async () => {
        mockDb.where.mockResolvedValue([testTrustAward]);

        const result = await councilRepository.hasAwardedTrust('council-123', 'user-456');

        expect(result).toBe(true);
      });

      it('should return false if trust was removed', async () => {
        mockDb.where.mockResolvedValue([]);

        const result = await councilRepository.hasAwardedTrust('council-123', 'user-456');

        expect(result).toBe(false);
      });
    });

    describe('awardTrust', () => {
      it('should award trust to council', async () => {
        // No existing award
        mockDb.where.mockReturnValueOnce(mockDb);
        mockDb.then.mockImplementationOnce((resolve) => resolve([]));
        mockDb.returning.mockResolvedValueOnce([testTrustAward]);

        // Recalculate trust score
        mockDb.where.mockReturnValueOnce(mockDb);
        mockDb.then.mockImplementationOnce((resolve) => resolve([{ count: 1 }]));
        mockDb.where.mockReturnValueOnce(mockDb);
        mockDb.then.mockImplementationOnce((resolve) => resolve(undefined));

        // Insert history
        mockDb.returning.mockResolvedValueOnce([]);

        const result = await councilRepository.awardTrust('council-123', 'user-456');

        expect(result).toEqual(testTrustAward);
        expect(mockDb.insert).toHaveBeenCalledTimes(2); // trust award + history
      });

      it('should restore trust if previously removed', async () => {
        const removedAward = { ...testTrustAward, removedAt: new Date() };
        mockDb.where.mockReturnValueOnce(mockDb);
        mockDb.then.mockImplementationOnce((resolve) => resolve([removedAward]));
        mockDb.where.mockReturnValueOnce(mockDb);
        mockDb.returning.mockResolvedValueOnce([testTrustAward]);

        // Recalculate trust score
        mockDb.where.mockReturnValueOnce(mockDb);
        mockDb.then.mockImplementationOnce((resolve) => resolve([{ count: 1 }]));
        mockDb.where.mockReturnValueOnce(mockDb);
        mockDb.then.mockImplementationOnce((resolve) => resolve(undefined));

        // Insert history
        mockDb.returning.mockResolvedValueOnce([]);

        const result = await councilRepository.awardTrust('council-123', 'user-456');

        expect(mockDb.update).toHaveBeenCalled();
        expect(result).toEqual(testTrustAward);
      });
    });

    describe('removeTrust', () => {
      it('should remove trust from council', async () => {
        const removedAward = { ...testTrustAward, removedAt: new Date() };
        mockDb.where.mockReturnValueOnce(mockDb);
        mockDb.returning.mockResolvedValueOnce([removedAward]);

        // Recalculate trust score
        mockDb.where.mockReturnValueOnce(mockDb);
        mockDb.then.mockImplementationOnce((resolve) => resolve([{ count: 0 }]));
        mockDb.where.mockReturnValueOnce(mockDb);
        mockDb.then.mockImplementationOnce((resolve) => resolve(undefined));

        // Insert history
        mockDb.returning.mockResolvedValueOnce([]);

        const result = await councilRepository.removeTrust('council-123', 'user-456');

        expect(result).toEqual(removedAward);
        expect(mockDb.update).toHaveBeenCalled();
      });
    });

    describe('recalculateTrustScore', () => {
      it('should recalculate trust score', async () => {
        mockDb.where.mockResolvedValueOnce([{ count: 15 }]);
        mockDb.where.mockResolvedValue(undefined);

        const result = await councilRepository.recalculateTrustScore('council-123');

        expect(result).toBe(15);
        expect(mockDb.update).toHaveBeenCalled();
        expect(mockDb.set).toHaveBeenCalled();
      });

      it('should handle zero trust score', async () => {
        mockDb.where.mockResolvedValueOnce([{ count: 0 }]);
        mockDb.where.mockResolvedValue(undefined);

        const result = await councilRepository.recalculateTrustScore('council-123');

        expect(result).toBe(0);
      });
    });
  });

  describe('Inventory and Transactions', () => {
    describe('getInventory', () => {
      it('should get council inventory', async () => {
        const inventory = [
          {
            id: 'inv-1',
            councilId: 'council-123',
            itemName: 'Carrots',
            quantity: 10,
            createdAt: new Date(),
          },
        ];
        mockDb.where.mockResolvedValue(inventory);

        const result = await councilRepository.getInventory('council-123');

        expect(result).toEqual(inventory);
        expect(mockDb.select).toHaveBeenCalled();
        expect(mockDb.where).toHaveBeenCalled();
      });

      it('should return empty array if no inventory', async () => {
        mockDb.where.mockResolvedValue([]);

        const result = await councilRepository.getInventory('council-123');

        expect(result).toHaveLength(0);
      });
    });

    describe('getTransactions', () => {
      it('should get council transactions with pagination', async () => {
        const transactions = [
          {
            id: 'tx-1',
            councilId: 'council-123',
            type: 'received',
            quantity: 10,
            createdAt: new Date(),
          },
        ];
        mockDb.orderBy.mockReturnValueOnce(mockDb);
        mockDb.offset.mockReturnValueOnce(mockDb);
        mockDb.then.mockImplementationOnce((resolve) => resolve(transactions));
        mockDb.where.mockReturnValueOnce(mockDb);
        mockDb.then.mockImplementationOnce((resolve) => resolve([{ count: 1 }]));

        const result = await councilRepository.getTransactions('council-123');

        expect(result.transactions).toEqual(transactions);
        expect(result.total).toBe(1);
        expect(mockDb.orderBy).toHaveBeenCalled();
      });

      it('should handle custom pagination options', async () => {
        mockDb.orderBy.mockReturnValueOnce(mockDb);
        mockDb.offset.mockReturnValueOnce(mockDb);
        mockDb.then.mockImplementationOnce((resolve) => resolve([]));
        mockDb.where.mockReturnValueOnce(mockDb);
        mockDb.then.mockImplementationOnce((resolve) => resolve([{ count: 0 }]));

        const result = await councilRepository.getTransactions('council-123', {
          page: 2,
          limit: 10,
        });

        expect(mockDb.limit).toHaveBeenCalled();
        expect(mockDb.offset).toHaveBeenCalled();
      });

      it('should return empty results if no transactions', async () => {
        mockDb.orderBy.mockReturnValueOnce(mockDb);
        mockDb.offset.mockReturnValueOnce(mockDb);
        mockDb.then.mockImplementationOnce((resolve) => resolve([]));
        mockDb.where.mockReturnValueOnce(mockDb);
        mockDb.then.mockImplementationOnce((resolve) => resolve([{ count: 0 }]));

        const result = await councilRepository.getTransactions('council-123');

        expect(result.transactions).toHaveLength(0);
        expect(result.total).toBe(0);
      });
    });
  });
});
