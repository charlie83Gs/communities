import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import { TrustHistoryRepository } from './trustHistory.repository';
import { createThenableMockDb, setupMockDbChains } from '../../tests/helpers/mockDb';

let trustHistoryRepository: TrustHistoryRepository;

// Create mock database
const mockDb = createThenableMockDb();

// Static test data
const testCommunityId = 'comm-123';
const testUserId1 = 'user-123';
const testUserId2 = 'user-456';
const testUserId3 = 'user-789';

const testAwardRecord = {
  id: 'history-1',
  communityId: testCommunityId,
  fromUserId: testUserId1,
  toUserId: testUserId2,
  action: 'award' as const,
  pointsDelta: 1,
  createdAt: new Date('2024-01-01T10:00:00Z'),
};

const testRemoveRecord = {
  id: 'history-2',
  communityId: testCommunityId,
  fromUserId: testUserId1,
  toUserId: testUserId2,
  action: 'remove' as const,
  pointsDelta: -1,
  createdAt: new Date('2024-01-01T11:00:00Z'),
};

const testAdminGrantRecord = {
  id: 'history-3',
  communityId: testCommunityId,
  fromUserId: null,
  toUserId: testUserId2,
  action: 'admin_grant' as const,
  pointsDelta: 10,
  createdAt: new Date('2024-01-01T12:00:00Z'),
};

describe('TrustHistoryRepository', () => {
  beforeEach(() => {
    // Reset all mocks and setup default chains
    setupMockDbChains(mockDb);
    // Instantiate repository with the per-test mock DB
    trustHistoryRepository = new TrustHistoryRepository(mockDb);
  });

  afterEach(() => {
    // Nothing to clean up; a fresh TrustHistoryRepository is created per test
  });

  describe('logAction', () => {
    test('should log an award action with all fields', async () => {
      mockDb.returning.mockResolvedValue([testAwardRecord]);

      const record = await trustHistoryRepository.logAction({
        communityId: testCommunityId,
        fromUserId: testUserId1,
        toUserId: testUserId2,
        action: 'award',
        pointsDelta: 1,
      });

      expect(record).toEqual(testAwardRecord);
      expect(record.communityId).toBe(testCommunityId);
      expect(record.fromUserId).toBe(testUserId1);
      expect(record.toUserId).toBe(testUserId2);
      expect(record.action).toBe('award');
      expect(record.pointsDelta).toBe(1);
      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockDb.values).toHaveBeenCalled();
      expect(mockDb.returning).toHaveBeenCalled();
    });

    test('should log a remove action', async () => {
      mockDb.returning.mockResolvedValue([testRemoveRecord]);

      const record = await trustHistoryRepository.logAction({
        communityId: testCommunityId,
        fromUserId: testUserId1,
        toUserId: testUserId2,
        action: 'remove',
        pointsDelta: -1,
      });

      expect(record.action).toBe('remove');
      expect(record.pointsDelta).toBe(-1);
      expect(mockDb.insert).toHaveBeenCalled();
    });

    test('should log an admin_grant action with null fromUserId', async () => {
      mockDb.returning.mockResolvedValue([testAdminGrantRecord]);

      const record = await trustHistoryRepository.logAction({
        communityId: testCommunityId,
        fromUserId: null,
        toUserId: testUserId2,
        action: 'admin_grant',
        pointsDelta: 10,
      });

      expect(record.action).toBe('admin_grant');
      expect(record.fromUserId).toBeNull();
      expect(record.pointsDelta).toBe(10);
    });

    test('should log an admin_grant action without fromUserId', async () => {
      const adminGrantWithoutFrom = { ...testAdminGrantRecord, pointsDelta: 5 };
      mockDb.returning.mockResolvedValue([adminGrantWithoutFrom]);

      const record = await trustHistoryRepository.logAction({
        communityId: testCommunityId,
        toUserId: testUserId2,
        action: 'admin_grant',
        pointsDelta: 5,
      });

      expect(record.action).toBe('admin_grant');
      expect(record.fromUserId).toBeNull();
      expect(record.pointsDelta).toBe(5);
    });
  });

  describe('getHistoryForUser', () => {
    test('should return empty array when user has no history', async () => {
      mockDb.offset.mockResolvedValue([]);

      const history = await trustHistoryRepository.getHistoryForUser(testCommunityId, testUserId1);

      expect(history).toEqual([]);
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.from).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalled();
      expect(mockDb.orderBy).toHaveBeenCalled();
      expect(mockDb.limit).toHaveBeenCalled();
      expect(mockDb.offset).toHaveBeenCalled();
    });

    test('should return all history for a user in a community', async () => {
      const historyRecords = [testAwardRecord, testRemoveRecord];
      mockDb.offset.mockResolvedValue(historyRecords);

      const history = await trustHistoryRepository.getHistoryForUser(testCommunityId, testUserId2);

      expect(history).toHaveLength(2);
      expect(history[0]).toEqual(testAwardRecord);
      expect(history[1]).toEqual(testRemoveRecord);
      expect(history.every((h) => h.toUserId === testUserId2)).toBe(true);
      expect(history.every((h) => h.communityId === testCommunityId)).toBe(true);
    });

    test('should respect limit parameter', async () => {
      const historyRecords = [testAwardRecord, testRemoveRecord, testAdminGrantRecord];
      mockDb.offset.mockResolvedValue(historyRecords.slice(0, 3));

      const history = await trustHistoryRepository.getHistoryForUser(
        testCommunityId,
        testUserId2,
        3,
        0
      );

      expect(history).toHaveLength(3);
      expect(mockDb.limit).toHaveBeenCalled();
    });

    test('should respect offset parameter', async () => {
      const offsetRecords = [testRemoveRecord];
      mockDb.offset.mockResolvedValue(offsetRecords);

      const history = await trustHistoryRepository.getHistoryForUser(
        testCommunityId,
        testUserId2,
        50,
        2
      );

      expect(history).toHaveLength(1);
      expect(mockDb.offset).toHaveBeenCalled();
    });

    test('should not return history from other communities', async () => {
      mockDb.offset.mockResolvedValue([]);

      const history = await trustHistoryRepository.getHistoryForUser(
        'different-comm-456',
        testUserId2
      );

      expect(history).toEqual([]);
    });

    test('should return all action types', async () => {
      const allActions = [testAwardRecord, testRemoveRecord, testAdminGrantRecord];
      mockDb.offset.mockResolvedValue(allActions);

      const history = await trustHistoryRepository.getHistoryForUser(testCommunityId, testUserId2);

      expect(history).toHaveLength(3);
      expect(history.some((h) => h.action === 'award')).toBe(true);
      expect(history.some((h) => h.action === 'remove')).toBe(true);
      expect(history.some((h) => h.action === 'admin_grant')).toBe(true);
    });
  });

  describe('getHistoryForCommunity', () => {
    test('should return empty array when community has no history', async () => {
      mockDb.offset.mockResolvedValue([]);

      const history = await trustHistoryRepository.getHistoryForCommunity(testCommunityId);

      expect(history).toEqual([]);
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalled();
      expect(mockDb.orderBy).toHaveBeenCalled();
    });

    test('should return all history for a community', async () => {
      const record1 = { ...testAwardRecord, toUserId: testUserId2 };
      const record2 = { ...testRemoveRecord, fromUserId: testUserId2, toUserId: testUserId3 };
      const record3 = { ...testAdminGrantRecord, toUserId: testUserId1 };
      const historyRecords = [record1, record2, record3];
      mockDb.offset.mockResolvedValue(historyRecords);

      const history = await trustHistoryRepository.getHistoryForCommunity(testCommunityId);

      expect(history).toHaveLength(3);
      expect(history.every((h) => h.communityId === testCommunityId)).toBe(true);
    });

    test('should respect limit parameter', async () => {
      const historyRecords = [testAwardRecord, testRemoveRecord, testAdminGrantRecord];
      mockDb.offset.mockResolvedValue(historyRecords.slice(0, 3));

      const history = await trustHistoryRepository.getHistoryForCommunity(testCommunityId, 3, 0);

      expect(history).toHaveLength(3);
      expect(mockDb.limit).toHaveBeenCalled();
    });

    test('should respect offset parameter', async () => {
      const offsetRecords = [testAdminGrantRecord];
      mockDb.offset.mockResolvedValue(offsetRecords);

      const history = await trustHistoryRepository.getHistoryForCommunity(testCommunityId, 50, 2);

      expect(history).toHaveLength(1);
      expect(mockDb.offset).toHaveBeenCalled();
    });
  });

  describe('getHistoryForUserAllCommunities', () => {
    test('should return empty array when user has no history', async () => {
      mockDb.offset.mockResolvedValue([]);

      const history = await trustHistoryRepository.getHistoryForUserAllCommunities(testUserId1);

      expect(history).toEqual([]);
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalled();
    });

    test('should return all history for a user across all communities', async () => {
      const comm1Record = { ...testAwardRecord, communityId: 'comm-123' };
      const comm2Record = { ...testRemoveRecord, communityId: 'comm-456' };
      mockDb.offset.mockResolvedValue([comm1Record, comm2Record]);

      const history = await trustHistoryRepository.getHistoryForUserAllCommunities(testUserId2);

      expect(history).toHaveLength(2);
      expect(history.every((h) => h.toUserId === testUserId2)).toBe(true);
    });

    test('should respect limit parameter', async () => {
      const historyRecords = [testAwardRecord, testRemoveRecord, testAdminGrantRecord];
      mockDb.offset.mockResolvedValue(historyRecords.slice(0, 3));

      const history = await trustHistoryRepository.getHistoryForUserAllCommunities(
        testUserId2,
        3,
        0
      );

      expect(history).toHaveLength(3);
      expect(mockDb.limit).toHaveBeenCalled();
    });

    test('should respect offset parameter', async () => {
      const offsetRecords = [testAdminGrantRecord];
      mockDb.offset.mockResolvedValue(offsetRecords);

      const history = await trustHistoryRepository.getHistoryForUserAllCommunities(
        testUserId2,
        50,
        2
      );

      expect(history).toHaveLength(1);
      expect(mockDb.offset).toHaveBeenCalled();
    });

    test('should include all action types', async () => {
      const allActions = [testAwardRecord, testRemoveRecord, testAdminGrantRecord];
      mockDb.offset.mockResolvedValue(allActions);

      const history = await trustHistoryRepository.getHistoryForUserAllCommunities(testUserId2);

      expect(history).toHaveLength(3);
      expect(history.some((h) => h.action === 'award')).toBe(true);
      expect(history.some((h) => h.action === 'remove')).toBe(true);
      expect(history.some((h) => h.action === 'admin_grant')).toBe(true);
    });
  });
});
