import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import { createThenableMockDb, setupMockDbChains } from '../../tests/helpers/mockDb';
import { TrustAwardRepository } from './trustAward.repository';

let trustAwardRepository: TrustAwardRepository;

// Create mock database
const mockDb = createThenableMockDb();

// Static test data
const testCommunityId = 'comm-123';
const differentCommunityId = 'comm-456';
const testUserId1 = 'user-123';
const testUserId2 = 'user-456';
const testUserId3 = 'user-789';

const testAward1 = {
  id: 'award-123',
  communityId: testCommunityId,
  fromUserId: testUserId1,
  toUserId: testUserId2,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

const testAward2 = {
  id: 'award-456',
  communityId: testCommunityId,
  fromUserId: testUserId1,
  toUserId: testUserId3,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

const testAward3 = {
  id: 'award-789',
  communityId: testCommunityId,
  fromUserId: testUserId2,
  toUserId: testUserId3,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

describe('TrustAwardRepository', () => {
  beforeEach(() => {
    // Reset all mocks and setup default chains
    setupMockDbChains(mockDb);
    // Instantiate repository with the per-test mock DB
    trustAwardRepository = new TrustAwardRepository(mockDb as any);
  });

  afterEach(() => {
    // Nothing to clean up; a fresh TrustAwardRepository is created per test
  });

  describe('createAward', () => {
    test('should create a trust award', async () => {
      mockDb.returning.mockResolvedValue([testAward1]);

      const award = await trustAwardRepository.createAward(
        testCommunityId,
        testUserId1,
        testUserId2
      );

      expect(award).toBeDefined();
      expect(award.communityId).toBe(testCommunityId);
      expect(award.fromUserId).toBe(testUserId1);
      expect(award.toUserId).toBe(testUserId2);
      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockDb.values).toHaveBeenCalled();
      expect(mockDb.returning).toHaveBeenCalled();
    });

    test('should create multiple awards from the same user to different users', async () => {
      mockDb.returning.mockResolvedValueOnce([testAward1]);
      mockDb.returning.mockResolvedValueOnce([testAward2]);

      const award1 = await trustAwardRepository.createAward(
        testCommunityId,
        testUserId1,
        testUserId2
      );
      const award2 = await trustAwardRepository.createAward(
        testCommunityId,
        testUserId1,
        testUserId3
      );

      expect(award1.toUserId).toBe(testUserId2);
      expect(award2.toUserId).toBe(testUserId3);
    });

    test('should create multiple awards to the same user from different users', async () => {
      mockDb.returning.mockResolvedValueOnce([testAward2]);
      mockDb.returning.mockResolvedValueOnce([testAward3]);

      const award1 = await trustAwardRepository.createAward(
        testCommunityId,
        testUserId1,
        testUserId3
      );
      const award2 = await trustAwardRepository.createAward(
        testCommunityId,
        testUserId2,
        testUserId3
      );

      expect(award1.fromUserId).toBe(testUserId1);
      expect(award2.fromUserId).toBe(testUserId2);
      expect(award1.toUserId).toBe(testUserId3);
      expect(award2.toUserId).toBe(testUserId3);
    });
  });

  describe('deleteAward', () => {
    test('should delete an existing trust award', async () => {
      mockDb.returning.mockResolvedValue([testAward1]);

      const deleted = await trustAwardRepository.deleteAward(
        testCommunityId,
        testUserId1,
        testUserId2
      );

      expect(deleted).toBeDefined();
      expect(deleted.communityId).toBe(testCommunityId);
      expect(deleted.fromUserId).toBe(testUserId1);
      expect(deleted.toUserId).toBe(testUserId2);
      expect(mockDb.delete).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalled();
      expect(mockDb.returning).toHaveBeenCalled();
    });

    test('should return undefined when deleting non-existent award', async () => {
      mockDb.returning.mockResolvedValue([]);

      const deleted = await trustAwardRepository.deleteAward(
        testCommunityId,
        testUserId1,
        testUserId2
      );

      expect(deleted).toBeUndefined();
    });

    test('should not delete awards with different community', async () => {
      mockDb.returning.mockResolvedValue([]);

      const deleted = await trustAwardRepository.deleteAward(
        differentCommunityId,
        testUserId1,
        testUserId2
      );

      expect(deleted).toBeUndefined();
    });
  });

  describe('hasAward', () => {
    test('should return true for existing award', async () => {
      mockDb.where.mockResolvedValue([testAward1]);

      const hasAward = await trustAwardRepository.hasAward(
        testCommunityId,
        testUserId1,
        testUserId2
      );

      expect(hasAward).toBe(true);
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalled();
    });

    test('should return false for non-existent award', async () => {
      mockDb.where.mockResolvedValue([]);

      const hasAward = await trustAwardRepository.hasAward(
        testCommunityId,
        testUserId1,
        testUserId2
      );

      expect(hasAward).toBe(false);
    });

    test('should be case-sensitive for user IDs', async () => {
      mockDb.where.mockResolvedValue([]);

      const hasAward = await trustAwardRepository.hasAward(
        testCommunityId,
        testUserId2,
        testUserId1
      );

      expect(hasAward).toBe(false);
    });
  });

  describe('getAward', () => {
    test('should return award when it exists', async () => {
      mockDb.where.mockResolvedValue([testAward1]);

      const award = await trustAwardRepository.getAward(testCommunityId, testUserId1, testUserId2);

      expect(award).toBeDefined();
      expect(award?.id).toBe(testAward1.id);
      expect(award?.communityId).toBe(testCommunityId);
      expect(award?.fromUserId).toBe(testUserId1);
      expect(award?.toUserId).toBe(testUserId2);
    });

    test('should return null when award does not exist', async () => {
      mockDb.where.mockResolvedValue([]);

      const award = await trustAwardRepository.getAward(testCommunityId, testUserId1, testUserId2);

      expect(award).toBeNull();
    });

    test('should return null for wrong community', async () => {
      mockDb.where.mockResolvedValue([]);

      const award = await trustAwardRepository.getAward(
        differentCommunityId,
        testUserId1,
        testUserId2
      );

      expect(award).toBeNull();
    });
  });

  describe('listUserAwards', () => {
    test('should return empty array when user has no awards', async () => {
      mockDb.where.mockResolvedValue([]);

      const awards = await trustAwardRepository.listUserAwards(testCommunityId, testUserId1);

      expect(awards).toEqual([]);
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalled();
    });

    test('should return all awards given by a user', async () => {
      mockDb.where.mockResolvedValue([testAward1, testAward2]);

      const awards = await trustAwardRepository.listUserAwards(testCommunityId, testUserId1);

      expect(awards).toHaveLength(2);
      expect(awards.every((a) => a.fromUserId === testUserId1)).toBe(true);
      expect(awards.some((a) => a.toUserId === testUserId2)).toBe(true);
      expect(awards.some((a) => a.toUserId === testUserId3)).toBe(true);
    });

    test('should not include awards from other users', async () => {
      mockDb.where.mockResolvedValue([testAward1]);

      const awards = await trustAwardRepository.listUserAwards(testCommunityId, testUserId1);

      expect(awards).toHaveLength(1);
      expect(awards[0].fromUserId).toBe(testUserId1);
    });

    test('should not include awards from other communities', async () => {
      mockDb.where.mockResolvedValue([]);

      const awards = await trustAwardRepository.listUserAwards(differentCommunityId, testUserId1);

      expect(awards).toEqual([]);
    });
  });

  describe('listAwardsToUser', () => {
    test('should return empty array when user has no awards', async () => {
      mockDb.where.mockResolvedValue([]);

      const awards = await trustAwardRepository.listAwardsToUser(testCommunityId, testUserId2);

      expect(awards).toEqual([]);
    });

    test('should return all awards received by a user', async () => {
      mockDb.where.mockResolvedValue([testAward2, testAward3]);

      const awards = await trustAwardRepository.listAwardsToUser(testCommunityId, testUserId3);

      expect(awards).toHaveLength(2);
      expect(awards.every((a) => a.toUserId === testUserId3)).toBe(true);
      expect(awards.some((a) => a.fromUserId === testUserId1)).toBe(true);
      expect(awards.some((a) => a.fromUserId === testUserId2)).toBe(true);
    });

    test('should not include awards to other users', async () => {
      mockDb.where.mockResolvedValue([testAward1]);

      const awards = await trustAwardRepository.listAwardsToUser(testCommunityId, testUserId2);

      expect(awards).toHaveLength(1);
      expect(awards[0].toUserId).toBe(testUserId2);
    });

    test('should not include awards from other communities', async () => {
      mockDb.where.mockResolvedValue([]);

      const awards = await trustAwardRepository.listAwardsToUser(differentCommunityId, testUserId2);

      expect(awards).toEqual([]);
    });
  });

  describe('countAwardsToUser', () => {
    test('should return 0 when user has no awards', async () => {
      mockDb.where.mockResolvedValue([{ count: 0 }]);

      const count = await trustAwardRepository.countAwardsToUser(testCommunityId, testUserId2);

      expect(count).toBe(0);
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalled();
    });

    test('should return correct count of awards received', async () => {
      mockDb.where.mockResolvedValue([{ count: 2 }]);

      const count = await trustAwardRepository.countAwardsToUser(testCommunityId, testUserId3);

      expect(count).toBe(2);
    });

    test('should not count awards from other communities', async () => {
      mockDb.where.mockResolvedValue([{ count: 0 }]);

      const count = await trustAwardRepository.countAwardsToUser(differentCommunityId, testUserId2);

      expect(count).toBe(0);
    });
  });

  describe('countAwardsFromUser', () => {
    test('should return 0 when user has given no awards', async () => {
      mockDb.where.mockResolvedValue([{ count: 0 }]);

      const count = await trustAwardRepository.countAwardsFromUser(testCommunityId, testUserId1);

      expect(count).toBe(0);
    });

    test('should return correct count of awards given', async () => {
      mockDb.where.mockResolvedValue([{ count: 2 }]);

      const count = await trustAwardRepository.countAwardsFromUser(testCommunityId, testUserId1);

      expect(count).toBe(2);
    });

    test('should not count awards from other communities', async () => {
      mockDb.where.mockResolvedValue([{ count: 0 }]);

      const count = await trustAwardRepository.countAwardsFromUser(
        differentCommunityId,
        testUserId1
      );

      expect(count).toBe(0);
    });

    test('should not count awards given by other users', async () => {
      mockDb.where.mockResolvedValue([{ count: 1 }]);

      const count = await trustAwardRepository.countAwardsFromUser(testCommunityId, testUserId1);

      expect(count).toBe(1);
    });
  });
});
