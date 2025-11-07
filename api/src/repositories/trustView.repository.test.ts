import { describe, test, expect, beforeEach, afterEach, mock } from 'bun:test';
import { db } from '../db/index';
import { createThenableMockDb, setupMockDbChains } from '../../tests/helpers/mockDb';
import { TrustViewRepository } from './trustView.repository';
import { trustAwardRepository } from './trustAward.repository';
import { adminTrustGrantRepository } from './adminTrustGrant.repository';

// Store original db methods to restore after each test
const originalDbMethods = {
  insert: db.insert,
  select: db.select,
  update: db.update,
  delete: (db as any).delete,
};

// Create mock database
const mockDb = createThenableMockDb();

// Mock the external repository methods
const mockCountAwardsToUser = mock(() => Promise.resolve(0));
const mockGetGrantAmount = mock(() => Promise.resolve(0));

// Override the repository methods before tests
(trustAwardRepository as any).countAwardsToUser = mockCountAwardsToUser;
(adminTrustGrantRepository as any).getGrantAmount = mockGetGrantAmount;

describe('TrustViewRepository', () => {
  const repository = new TrustViewRepository();

  // Test data - static IDs
  const testCommunityId1 = 'comm-123';
  const testCommunityId2 = 'comm-456';
  const testUserId1 = 'user-123';
  const testUserId2 = 'user-456';
  const testUserId3 = 'user-789';

  const testTrustView1 = {
    id: 'view-123',
    communityId: testCommunityId1,
    userId: testUserId1,
    points: 0,
    updatedAt: new Date('2024-01-01'),
  };

  const testTrustView2 = {
    id: 'view-456',
    communityId: testCommunityId1,
    userId: testUserId2,
    points: 5,
    updatedAt: new Date('2024-01-01'),
  };

  beforeEach(() => {
    // Reset all mocks and setup default chains
    setupMockDbChains(mockDb);

    // Reset repository mocks
    mockCountAwardsToUser.mockReset();
    mockGetGrantAmount.mockReset();
    mockCountAwardsToUser.mockResolvedValue(0);
    mockGetGrantAmount.mockResolvedValue(0);

    // Replace db methods with mocks
    (db.insert as any) = mockDb.insert;
    (db.select as any) = mockDb.select;
    (db.update as any) = mockDb.update;
    (db as any).delete = mockDb.delete;
  });

  afterEach(() => {
    // Restore original db methods to prevent pollution of other tests
    (db.insert as any) = originalDbMethods.insert;
    (db.select as any) = originalDbMethods.select;
    (db.update as any) = originalDbMethods.update;
    (db as any).delete = originalDbMethods.delete;
  });

  describe('get', () => {
    test('should return null when trust view does not exist', async () => {
      mockDb.where.mockResolvedValue([]);

      const view = await repository.get(testCommunityId1, testUserId1);

      expect(view).toBeNull();
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.from).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalled();
    });

    test('should return trust view when it exists', async () => {
      mockDb.where.mockResolvedValue([testTrustView1]);

      const view = await repository.get(testCommunityId1, testUserId1);

      expect(view).toBeDefined();
      expect(view?.communityId).toBe(testCommunityId1);
      expect(view?.userId).toBe(testUserId1);
      expect(view?.points).toBe(0);
    });
  });

  describe('upsertZero', () => {
    test('should create trust view with zero points', async () => {
      // First get returns nothing (doesn't exist)
      mockDb.where.mockResolvedValueOnce([]);
      // Insert returns the created view
      mockDb.returning.mockResolvedValue([testTrustView1]);

      const view = await repository.upsertZero(testCommunityId1, testUserId1);

      expect(view).toBeDefined();
      expect(view.communityId).toBe(testCommunityId1);
      expect(view.userId).toBe(testUserId1);
      expect(view.points).toBe(0);
      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockDb.values).toHaveBeenCalled();
    });

    test('should return existing view if already exists', async () => {
      // First call - get returns existing
      mockDb.where.mockResolvedValueOnce([testTrustView1]);
      // Second call - get returns existing again
      mockDb.where.mockResolvedValueOnce([testTrustView1]);

      const first = await repository.upsertZero(testCommunityId1, testUserId1);
      const second = await repository.upsertZero(testCommunityId1, testUserId1);

      expect(first.id).toBe(second.id);
      expect(second.points).toBe(0);
    });

    test('should create separate views for different communities', async () => {
      const view2 = { ...testTrustView1, id: 'view-diff', communityId: testCommunityId2 };

      // First upsert - doesn't exist, then create
      mockDb.where.mockResolvedValueOnce([]);
      mockDb.returning.mockResolvedValueOnce([testTrustView1]);

      // Second upsert - doesn't exist, then create
      mockDb.where.mockResolvedValueOnce([]);
      mockDb.returning.mockResolvedValueOnce([view2]);

      const view1 = await repository.upsertZero(testCommunityId1, testUserId1);
      const view2Result = await repository.upsertZero(testCommunityId2, testUserId1);

      expect(view1.communityId).toBe(testCommunityId1);
      expect(view2Result.communityId).toBe(testCommunityId2);
      expect(view1.id).not.toBe(view2Result.id);
    });
  });

  describe('recalculatePoints', () => {
    test('should calculate points from peer awards only', async () => {
      mockCountAwardsToUser.mockResolvedValue(2);
      mockGetGrantAmount.mockResolvedValue(0);

      // upsertZero call - get returns nothing, insert creates
      mockDb.where.mockResolvedValueOnce([]);
      mockDb.returning.mockResolvedValueOnce([testTrustView1]);

      // Update call
      const updatedView = { ...testTrustView1, points: 2 };
      mockDb.returning.mockResolvedValueOnce([updatedView]);

      const view = await repository.recalculatePoints(testCommunityId1, testUserId2);

      expect(view.points).toBe(2);
      expect(mockCountAwardsToUser).toHaveBeenCalledWith(testCommunityId1, testUserId2);
      expect(mockGetGrantAmount).toHaveBeenCalledWith(testCommunityId1, testUserId2);
    });

    test('should calculate points from admin grant only', async () => {
      mockCountAwardsToUser.mockResolvedValue(0);
      mockGetGrantAmount.mockResolvedValue(10);

      // upsertZero call
      mockDb.where.mockResolvedValueOnce([]);
      mockDb.returning.mockResolvedValueOnce([testTrustView1]);

      // Update call
      const updatedView = { ...testTrustView1, points: 10 };
      mockDb.returning.mockResolvedValueOnce([updatedView]);

      const view = await repository.recalculatePoints(testCommunityId1, testUserId1);

      expect(view.points).toBe(10);
    });

    test('should calculate points from peer awards and admin grant', async () => {
      mockCountAwardsToUser.mockResolvedValue(2);
      mockGetGrantAmount.mockResolvedValue(5);

      // upsertZero call
      mockDb.where.mockResolvedValueOnce([]);
      mockDb.returning.mockResolvedValueOnce([testTrustView1]);

      // Update call
      const updatedView = { ...testTrustView1, points: 7 };
      mockDb.returning.mockResolvedValueOnce([updatedView]);

      const view = await repository.recalculatePoints(testCommunityId1, testUserId2);

      expect(view.points).toBe(7); // 2 peer awards + 5 admin grant
    });

    test('should update existing view', async () => {
      mockCountAwardsToUser.mockResolvedValue(1);
      mockGetGrantAmount.mockResolvedValue(0);

      // upsertZero finds existing view
      mockDb.where.mockResolvedValueOnce([{ ...testTrustView1, points: 100 }]);

      // Update call
      const updatedView = { ...testTrustView1, points: 1 };
      mockDb.returning.mockResolvedValueOnce([updatedView]);

      const view = await repository.recalculatePoints(testCommunityId1, testUserId1);

      expect(view.points).toBe(1); // Corrected from 100 to 1
    });

    test('should return zero when no awards or grants exist', async () => {
      mockCountAwardsToUser.mockResolvedValue(0);
      mockGetGrantAmount.mockResolvedValue(0);

      // upsertZero call
      mockDb.where.mockResolvedValueOnce([]);
      mockDb.returning.mockResolvedValueOnce([testTrustView1]);

      // Update call
      mockDb.returning.mockResolvedValueOnce([testTrustView1]);

      const view = await repository.recalculatePoints(testCommunityId1, testUserId1);

      expect(view.points).toBe(0);
    });
  });

  describe('adjustPoints', () => {
    test('should increase points by delta', async () => {
      const initialView = { ...testTrustView1, points: 10 };
      const updatedView = { ...testTrustView1, points: 15 };

      // upsertZero finds existing
      mockDb.where.mockResolvedValueOnce([initialView]);
      // get call for adjustPoints
      mockDb.where.mockResolvedValueOnce([initialView]);
      // Update call
      mockDb.returning.mockResolvedValue([updatedView]);

      const view = await repository.adjustPoints(testCommunityId1, testUserId1, 5);

      expect(view.points).toBe(15);
      expect(mockDb.update).toHaveBeenCalled();
      expect(mockDb.set).toHaveBeenCalled();
    });

    test('should decrease points by negative delta', async () => {
      const initialView = { ...testTrustView1, points: 10 };
      const updatedView = { ...testTrustView1, points: 7 };

      mockDb.where.mockResolvedValueOnce([initialView]);
      mockDb.where.mockResolvedValueOnce([initialView]);
      mockDb.returning.mockResolvedValue([updatedView]);

      const view = await repository.adjustPoints(testCommunityId1, testUserId1, -3);

      expect(view.points).toBe(7);
    });

    test('should create view if it does not exist', async () => {
      const newView = { ...testTrustView1, points: 5 };

      // upsertZero - doesn't exist
      mockDb.where.mockResolvedValueOnce([]);
      mockDb.returning.mockResolvedValueOnce([testTrustView1]);
      // get call for adjustPoints
      mockDb.where.mockResolvedValueOnce([testTrustView1]);
      // Update call
      mockDb.returning.mockResolvedValueOnce([newView]);

      const view = await repository.adjustPoints(testCommunityId1, testUserId1, 5);

      expect(view.points).toBe(5);
    });

    test('should allow points to go negative', async () => {
      const negativeView = { ...testTrustView1, points: -5 };

      mockDb.where.mockResolvedValueOnce([testTrustView1]);
      mockDb.where.mockResolvedValueOnce([testTrustView1]);
      mockDb.returning.mockResolvedValue([negativeView]);

      const view = await repository.adjustPoints(testCommunityId1, testUserId1, -5);

      expect(view.points).toBe(-5);
    });
  });

  describe('setPoints', () => {
    test('should set points to specific value', async () => {
      const updatedView = { ...testTrustView1, points: 25 };

      // upsertZero finds existing
      mockDb.where.mockResolvedValueOnce([testTrustView1]);
      // Update call
      mockDb.returning.mockResolvedValue([updatedView]);

      const view = await repository.setPoints(testCommunityId1, testUserId1, 25);

      expect(view.points).toBe(25);
    });

    test('should override existing points', async () => {
      const updatedView = { ...testTrustView1, points: 50 };

      mockDb.where.mockResolvedValueOnce([{ ...testTrustView1, points: 10 }]);
      mockDb.returning.mockResolvedValue([updatedView]);

      const view = await repository.setPoints(testCommunityId1, testUserId1, 50);

      expect(view.points).toBe(50);
    });

    test('should create view if it does not exist', async () => {
      const newView = { ...testTrustView1, points: 30 };

      // upsertZero creates new
      mockDb.where.mockResolvedValueOnce([]);
      mockDb.returning.mockResolvedValueOnce([testTrustView1]);
      // Update call
      mockDb.returning.mockResolvedValueOnce([newView]);

      const view = await repository.setPoints(testCommunityId1, testUserId1, 30);

      expect(view.points).toBe(30);
    });

    test('should allow setting to zero', async () => {
      const zeroView = { ...testTrustView1, points: 0 };

      mockDb.where.mockResolvedValueOnce([{ ...testTrustView1, points: 100 }]);
      mockDb.returning.mockResolvedValue([zeroView]);

      const view = await repository.setPoints(testCommunityId1, testUserId1, 0);

      expect(view.points).toBe(0);
    });
  });

  describe('listByCommunity', () => {
    test('should return empty array when community has no views', async () => {
      mockDb.offset.mockResolvedValue([]);

      const views = await repository.listByCommunity(testCommunityId1);

      expect(views).toEqual([]);
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.from).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalled();
      expect(mockDb.limit).toHaveBeenCalled();
      expect(mockDb.offset).toHaveBeenCalled();
    });

    test('should return all views for a community with breakdown', async () => {
      const view1 = {
        ...testTrustView1,
        points: 2,
        peerAwards: 2,
        adminGrant: 0,
      };
      const view2 = {
        ...testTrustView2,
        points: 6,
        peerAwards: 1,
        adminGrant: 5,
      };

      mockDb.offset.mockResolvedValue([view1, view2]);

      const views = await repository.listByCommunity(testCommunityId1);

      expect(views).toHaveLength(2);

      const user1View = views.find((v) => v.userId === testUserId1);
      const user2View = views.find((v) => v.userId === testUserId2);

      expect(user1View?.points).toBe(2);
      expect(Number(user1View?.peerAwards)).toBe(2);
      expect(Number(user1View?.adminGrant)).toBe(0);

      expect(user2View?.points).toBe(6);
      expect(Number(user2View?.peerAwards)).toBe(1);
      expect(Number(user2View?.adminGrant)).toBe(5);
    });

    test('should respect limit parameter', async () => {
      const views = [testTrustView1, testTrustView2, { ...testTrustView1, id: 'view-789' }];
      mockDb.offset.mockResolvedValue(views.slice(0, 3));

      const result = await repository.listByCommunity(testCommunityId1, 3, 0);

      expect(result.length).toBeLessThanOrEqual(3);
      expect(mockDb.limit).toHaveBeenCalled();
    });

    test('should respect offset parameter', async () => {
      mockDb.offset.mockResolvedValue([testTrustView2]);

      const offsetViews = await repository.listByCommunity(testCommunityId1, 50, 2);

      expect(mockDb.offset).toHaveBeenCalled();
      expect(offsetViews).toBeDefined();
    });
  });

  describe('listByUser', () => {
    test('should return empty array when user has no views', async () => {
      mockDb.offset.mockResolvedValue([]);

      const views = await repository.listByUser(testUserId1);

      expect(views).toEqual([]);
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalled();
    });

    test('should return all views for a user across communities', async () => {
      const view1 = testTrustView1;
      const view2 = { ...testTrustView1, id: 'view-diff', communityId: testCommunityId2 };

      mockDb.offset.mockResolvedValue([view1, view2]);

      const views = await repository.listByUser(testUserId1);

      expect(views).toHaveLength(2);
      expect(views.every((v) => v.userId === testUserId1)).toBe(true);
      expect(views.some((v) => v.communityId === testCommunityId1)).toBe(true);
      expect(views.some((v) => v.communityId === testCommunityId2)).toBe(true);
    });

    test('should respect limit parameter', async () => {
      const views = [
        testTrustView1,
        { ...testTrustView1, id: 'view-2' },
        { ...testTrustView1, id: 'view-3' },
      ];
      mockDb.offset.mockResolvedValue(views.slice(0, 3));

      const result = await repository.listByUser(testUserId1, 3, 0);

      expect(result.length).toBeLessThanOrEqual(3);
      expect(mockDb.limit).toHaveBeenCalled();
    });
  });

  describe('getAllForCommunity', () => {
    test('should return empty array when community has no views', async () => {
      mockDb.where.mockResolvedValue([]);

      const views = await repository.getAllForCommunity(testCommunityId1);

      expect(views).toEqual([]);
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalled();
    });

    test('should return all views without limit', async () => {
      const views = [
        testTrustView1,
        testTrustView2,
        { ...testTrustView1, id: 'view-789', userId: testUserId3 },
      ];
      mockDb.where.mockResolvedValue(views);

      const result = await repository.getAllForCommunity(testCommunityId1);

      expect(result).toHaveLength(3);
      expect(result.every((v) => v.communityId === testCommunityId1)).toBe(true);
    });
  });

  describe('getBatchForUser', () => {
    test('should return empty map when no community IDs provided', async () => {
      const map = await repository.getBatchForUser([], testUserId1);

      expect(map.size).toBe(0);
    });

    test('should return trust scores for multiple communities', async () => {
      const rows = [
        { communityId: testCommunityId1, points: 15 },
        { communityId: testCommunityId2, points: 25 },
      ];
      mockDb.where.mockResolvedValue(rows);

      const map = await repository.getBatchForUser(
        [testCommunityId1, testCommunityId2],
        testUserId1
      );

      expect(map.size).toBe(2);
      expect(map.get(testCommunityId1)).toBe(15);
      expect(map.get(testCommunityId2)).toBe(25);
    });

    test('should return only existing communities in map', async () => {
      const rows = [{ communityId: testCommunityId1, points: 10 }];
      mockDb.where.mockResolvedValue(rows);

      const nonExistentCommunityId = 'comm-nonexistent';
      const map = await repository.getBatchForUser(
        [testCommunityId1, nonExistentCommunityId],
        testUserId1
      );

      expect(map.size).toBe(1);
      expect(map.get(testCommunityId1)).toBe(10);
      expect(map.has(nonExistentCommunityId)).toBe(false);
    });

    test('should handle user with no trust views', async () => {
      mockDb.where.mockResolvedValue([]);

      const map = await repository.getBatchForUser(
        [testCommunityId1, testCommunityId2],
        testUserId1
      );

      expect(map.size).toBe(0);
    });

    test('should return correct points for each community', async () => {
      const rows = [
        { communityId: testCommunityId1, points: 5 },
        { communityId: testCommunityId2, points: 50 },
      ];
      mockDb.where.mockResolvedValue(rows);

      const map = await repository.getBatchForUser(
        [testCommunityId1, testCommunityId2],
        testUserId1
      );

      expect(map.get(testCommunityId1)).not.toBe(map.get(testCommunityId2));
      expect(map.get(testCommunityId1)).toBe(5);
      expect(map.get(testCommunityId2)).toBe(50);
    });
  });
});
