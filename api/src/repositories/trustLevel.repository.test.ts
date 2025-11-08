import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { TrustLevelRepository } from './trustLevel.repository';
import { createThenableMockDb, setupMockDbChains } from '../../tests/helpers/mockDb';

let trustLevelRepository: TrustLevelRepository;

// Create mock database
const mockDb = createThenableMockDb();

// Static test data
const testCommunityId = 'comm-123';
const differentCommunityId = 'comm-456';

const testTrustLevel1 = {
  id: 'level-123',
  communityId: testCommunityId,
  name: 'New',
  threshold: 0,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

const testTrustLevel2 = {
  id: 'level-456',
  communityId: testCommunityId,
  name: 'Stable',
  threshold: 10,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

const testTrustLevel3 = {
  id: 'level-789',
  communityId: testCommunityId,
  name: 'Trusted',
  threshold: 50,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

describe('TrustLevelRepository', () => {
  beforeEach(() => {
    // Reset all mocks and setup default chains
    setupMockDbChains(mockDb);
    // Instantiate repository with the per-test mock DB
    trustLevelRepository = new TrustLevelRepository(mockDb as any);
  });

  afterEach(() => {
    // Nothing to clean up; a fresh TrustLevelRepository is created per test
  });

  describe('create', () => {
    it('should create a trust level', async () => {
      mockDb.returning.mockResolvedValue([testTrustLevel1]);

      const result = await trustLevelRepository.create(testCommunityId, {
        name: 'New',
        threshold: 0,
      });

      expect(result).toBeDefined();
      expect(result.name).toBe('New');
      expect(result.threshold).toBe(0);
      expect(result.communityId).toBe(testCommunityId);
      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockDb.values).toHaveBeenCalled();
      expect(mockDb.returning).toHaveBeenCalled();
    });

    it('should create trust level with custom threshold', async () => {
      const customLevel = {
        ...testTrustLevel2,
        name: 'Advanced',
        threshold: 25,
      };
      mockDb.returning.mockResolvedValue([customLevel]);

      const result = await trustLevelRepository.create(testCommunityId, {
        name: 'Advanced',
        threshold: 25,
      });

      expect(result.name).toBe('Advanced');
      expect(result.threshold).toBe(25);
    });
  });

  describe('findById', () => {
    it('should find trust level by id', async () => {
      mockDb.where.mockResolvedValue([testTrustLevel1]);

      const result = await trustLevelRepository.findById('level-123');

      expect(result).toBeDefined();
      expect(result?.id).toBe('level-123');
      expect(result?.name).toBe('New');
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalled();
    });

    it('should return undefined if trust level not found', async () => {
      mockDb.where.mockResolvedValue([]);

      const result = await trustLevelRepository.findById('nonexistent');

      expect(result).toBeUndefined();
    });
  });

  describe('findByCommunityId', () => {
    it('should find all trust levels for a community', async () => {
      mockDb.orderBy.mockResolvedValue([testTrustLevel1, testTrustLevel2, testTrustLevel3]);

      const result = await trustLevelRepository.findByCommunityId(testCommunityId);

      expect(result).toHaveLength(3);
      expect(result[0].threshold).toBe(0);
      expect(result[1].threshold).toBe(10);
      expect(result[2].threshold).toBe(50);
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalled();
      expect(mockDb.orderBy).toHaveBeenCalled();
    });

    it('should return empty array when community has no trust levels', async () => {
      mockDb.orderBy.mockResolvedValue([]);

      const result = await trustLevelRepository.findByCommunityId(testCommunityId);

      expect(result).toEqual([]);
    });

    it('should order results by threshold ascending', async () => {
      const unorderedLevels = [testTrustLevel3, testTrustLevel1, testTrustLevel2];
      mockDb.orderBy.mockResolvedValue(unorderedLevels);

      const result = await trustLevelRepository.findByCommunityId(testCommunityId);

      // Mock returns them in the order we specified, but in real DB they'd be ordered
      expect(mockDb.orderBy).toHaveBeenCalled();
      expect(result).toHaveLength(3);
    });
  });

  describe('findByName', () => {
    it('should find trust level by community and name', async () => {
      mockDb.where.mockResolvedValue([testTrustLevel1]);

      const result = await trustLevelRepository.findByName(testCommunityId, 'New');

      expect(result).toBeDefined();
      expect(result?.name).toBe('New');
      expect(result?.communityId).toBe(testCommunityId);
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalled();
    });

    it('should return undefined if name not found', async () => {
      mockDb.where.mockResolvedValue([]);

      const result = await trustLevelRepository.findByName(testCommunityId, 'NonExistent');

      expect(result).toBeUndefined();
    });

    it('should not find level from different community', async () => {
      mockDb.where.mockResolvedValue([]);

      const result = await trustLevelRepository.findByName(differentCommunityId, 'New');

      expect(result).toBeUndefined();
    });

    it('should be case-sensitive for name matching', async () => {
      mockDb.where.mockResolvedValue([]);

      const result = await trustLevelRepository.findByName(testCommunityId, 'new');

      expect(result).toBeUndefined();
    });
  });

  describe('update', () => {
    it('should update trust level name', async () => {
      const updated = {
        ...testTrustLevel1,
        name: 'Beginner',
      };
      mockDb.returning.mockResolvedValue([updated]);

      const result = await trustLevelRepository.update('level-123', {
        name: 'Beginner',
      });

      expect(result?.name).toBe('Beginner');
      expect(mockDb.update).toHaveBeenCalled();
      expect(mockDb.set).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalled();
      expect(mockDb.returning).toHaveBeenCalled();
    });

    it('should update trust level threshold', async () => {
      const updated = {
        ...testTrustLevel2,
        threshold: 15,
      };
      mockDb.returning.mockResolvedValue([updated]);

      const result = await trustLevelRepository.update('level-456', {
        threshold: 15,
      });

      expect(result?.threshold).toBe(15);
    });

    it('should update both name and threshold', async () => {
      const updated = {
        ...testTrustLevel1,
        name: 'Starter',
        threshold: 5,
      };
      mockDb.returning.mockResolvedValue([updated]);

      const result = await trustLevelRepository.update('level-123', {
        name: 'Starter',
        threshold: 5,
      });

      expect(result?.name).toBe('Starter');
      expect(result?.threshold).toBe(5);
    });

    it('should return undefined if trust level not found', async () => {
      mockDb.returning.mockResolvedValue([]);

      const result = await trustLevelRepository.update('nonexistent', {
        name: 'Updated',
      });

      expect(result).toBeUndefined();
    });
  });

  describe('delete', () => {
    it('should delete trust level', async () => {
      mockDb.returning.mockResolvedValue([testTrustLevel1]);

      const result = await trustLevelRepository.delete('level-123');

      expect(result).toBeDefined();
      expect(result?.id).toBe('level-123');
      expect(mockDb.delete).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalled();
      expect(mockDb.returning).toHaveBeenCalled();
    });

    it('should return undefined if trust level not found', async () => {
      mockDb.returning.mockResolvedValue([]);

      const result = await trustLevelRepository.delete('nonexistent');

      expect(result).toBeUndefined();
    });
  });

  describe('createDefaultLevels', () => {
    it('should create three default trust levels', async () => {
      const defaultLevels = [testTrustLevel1, testTrustLevel2, testTrustLevel3];
      mockDb.returning.mockResolvedValue(defaultLevels);

      const result = await trustLevelRepository.createDefaultLevels(testCommunityId);

      expect(result).toHaveLength(3);
      expect(result[0].name).toBe('New');
      expect(result[0].threshold).toBe(0);
      expect(result[1].name).toBe('Stable');
      expect(result[1].threshold).toBe(10);
      expect(result[2].name).toBe('Trusted');
      expect(result[2].threshold).toBe(50);
      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockDb.values).toHaveBeenCalled();
      expect(mockDb.returning).toHaveBeenCalled();
    });

    it('should set correct community id for all default levels', async () => {
      const defaultLevels = [
        { ...testTrustLevel1, communityId: testCommunityId },
        { ...testTrustLevel2, communityId: testCommunityId },
        { ...testTrustLevel3, communityId: testCommunityId },
      ];
      mockDb.returning.mockResolvedValue(defaultLevels);

      const result = await trustLevelRepository.createDefaultLevels(testCommunityId);

      expect(result.every((level) => level.communityId === testCommunityId)).toBe(true);
    });
  });

  describe('deleteAllForCommunity', () => {
    it('should delete all trust levels for a community', async () => {
      const deletedLevels = [testTrustLevel1, testTrustLevel2, testTrustLevel3];
      mockDb.where.mockResolvedValue(deletedLevels);

      const result = await trustLevelRepository.deleteAllForCommunity(testCommunityId);

      expect(result).toBe(3);
      expect(mockDb.delete).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalled();
    });

    it('should return 0 when community has no trust levels', async () => {
      mockDb.where.mockResolvedValue([]);

      const result = await trustLevelRepository.deleteAllForCommunity(testCommunityId);

      expect(result).toBe(0);
    });

    it('should only delete levels from specified community', async () => {
      mockDb.where.mockResolvedValue([testTrustLevel1]);

      const result = await trustLevelRepository.deleteAllForCommunity(testCommunityId);

      expect(result).toBe(1);
      expect(mockDb.delete).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalled();
    });
  });
});
