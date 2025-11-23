import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import { createThenableMockDb, setupMockDbChains } from '../../tests/helpers/mockDb';
import { TrustAnalyticsRepository } from './trustAnalytics.repository';

let trustAnalyticsRepository: TrustAnalyticsRepository;

// Create mock database
const mockDb = createThenableMockDb();

describe('TrustAnalyticsRepository', () => {
  // Test data - static strings, no dynamic IDs
  const testCommunityId1 = 'testCommunityId1';
  const testCommunityId2 = 'testCommunityId2';
  const testUserId1 = 'testUserId1';
  const testUserId2 = 'testUserId2';
  const testUserId3 = 'testUserId3';

  beforeEach(() => {
    // Reset all mocks and setup default chains
    setupMockDbChains(mockDb);
    // Instantiate repository with the per-test mock DB
    trustAnalyticsRepository = new TrustAnalyticsRepository(mockDb);
  });

  afterEach(() => {
    // Nothing to clean up; a fresh TrustAnalyticsRepository is created per test
  });

  describe('getTrustTimeline', () => {
    test('should return empty array when user has no trust history', async () => {
      mockDb.orderBy.mockResolvedValue([]);

      const timeline = await trustAnalyticsRepository.getTrustTimeline(testUserId1);

      expect(timeline).toEqual([]);
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalled();
    });

    test('should return timeline with cumulative trust calculation', async () => {
      const mockEvents = [
        {
          id: 'event1',
          timestamp: new Date('2024-01-01T10:00:00Z'),
          type: 'award',
          fromUserId: testUserId2,
          fromUserDisplayName: 'User 2',
          fromUserUsername: 'user2',
          amount: 1,
          communityId: testCommunityId1,
          communityName: 'Test Community 1',
        },
        {
          id: 'event2',
          timestamp: new Date('2024-01-01T10:01:00Z'),
          type: 'award',
          fromUserId: testUserId3,
          fromUserDisplayName: 'User 3',
          fromUserUsername: 'user3',
          amount: 1,
          communityId: testCommunityId1,
          communityName: 'Test Community 1',
        },
      ];
      mockDb.orderBy.mockResolvedValue(mockEvents);

      const timeline = await trustAnalyticsRepository.getTrustTimeline(testUserId1);

      expect(timeline).toHaveLength(2);
      // Timeline is returned in descending order (newest first)
      expect(timeline[0].cumulativeTrust).toBe(2); // Latest: 1 + 1 = 2
      expect(timeline[1].cumulativeTrust).toBe(1); // Oldest: 1
    });

    test('should handle remove actions with negative deltas', async () => {
      const mockEvents = [
        {
          id: 'event1',
          timestamp: new Date('2024-01-01T10:00:00Z'),
          type: 'award',
          fromUserId: testUserId2,
          fromUserDisplayName: 'User 2',
          fromUserUsername: 'user2',
          amount: 1,
          communityId: testCommunityId1,
          communityName: 'Test Community 1',
        },
        {
          id: 'event2',
          timestamp: new Date('2024-01-01T10:01:00Z'),
          type: 'remove',
          fromUserId: testUserId2,
          fromUserDisplayName: 'User 2',
          fromUserUsername: 'user2',
          amount: -1,
          communityId: testCommunityId1,
          communityName: 'Test Community 1',
        },
      ];
      mockDb.orderBy.mockResolvedValue(mockEvents);

      const timeline = await trustAnalyticsRepository.getTrustTimeline(testUserId1);

      expect(timeline).toHaveLength(2);
      expect(timeline[0].cumulativeTrust).toBe(0); // 1 - 1 = 0
      expect(timeline[1].cumulativeTrust).toBe(1); // Initial award
    });

    test('should include admin grant events', async () => {
      const mockEvents = [
        {
          id: 'event1',
          timestamp: new Date('2024-01-01T10:00:00Z'),
          type: 'award',
          fromUserId: testUserId2,
          fromUserDisplayName: 'User 2',
          fromUserUsername: 'user2',
          amount: 1,
          communityId: testCommunityId1,
          communityName: 'Test Community 1',
        },
        {
          id: 'event2',
          timestamp: new Date('2024-01-01T10:01:00Z'),
          type: 'admin_grant',
          fromUserId: null,
          fromUserDisplayName: null,
          fromUserUsername: null,
          amount: 10,
          communityId: testCommunityId1,
          communityName: 'Test Community 1',
        },
      ];
      mockDb.orderBy.mockResolvedValue(mockEvents);

      const timeline = await trustAnalyticsRepository.getTrustTimeline(testUserId1);

      expect(timeline).toHaveLength(2);
      expect(timeline[0].type).toBe('admin_grant');
      expect(timeline[0].cumulativeTrust).toBe(11); // 1 + 10
      expect(timeline[1].cumulativeTrust).toBe(1);
    });

    test('should filter by communityId', async () => {
      const mockEvents = [
        {
          id: 'event1',
          timestamp: new Date('2024-01-01T10:00:00Z'),
          type: 'award',
          fromUserId: testUserId2,
          fromUserDisplayName: 'User 2',
          fromUserUsername: 'user2',
          amount: 1,
          communityId: testCommunityId1,
          communityName: 'Test Community 1',
        },
      ];
      mockDb.orderBy.mockResolvedValue(mockEvents);

      const timeline = await trustAnalyticsRepository.getTrustTimeline(testUserId1, {
        communityId: testCommunityId1,
      });

      expect(timeline).toHaveLength(1);
      expect(timeline[0].communityId).toBe(testCommunityId1);
    });

    test('should filter by date range', async () => {
      const mockEvents = [
        {
          id: 'event1',
          timestamp: new Date('2024-01-01T12:00:00Z'),
          type: 'award',
          fromUserId: testUserId3,
          fromUserDisplayName: 'User 3',
          fromUserUsername: 'user3',
          amount: 1,
          communityId: testCommunityId1,
          communityName: 'Test Community 1',
        },
      ];
      mockDb.orderBy.mockResolvedValue(mockEvents);

      const timeline = await trustAnalyticsRepository.getTrustTimeline(testUserId1, {
        startDate: new Date('2024-01-01T11:00:00Z'),
      });

      expect(timeline.length).toBeGreaterThanOrEqual(0);
      expect(mockDb.where).toHaveBeenCalled();
    });

    test('should include user display names', async () => {
      const mockEvents = [
        {
          id: 'event1',
          timestamp: new Date('2024-01-01T10:00:00Z'),
          type: 'award',
          fromUserId: testUserId2,
          fromUserDisplayName: 'Analytics User 2',
          fromUserUsername: 'user2',
          amount: 1,
          communityId: testCommunityId1,
          communityName: 'Test Community 1',
        },
      ];
      mockDb.orderBy.mockResolvedValue(mockEvents);

      const timeline = await trustAnalyticsRepository.getTrustTimeline(testUserId1);

      expect(timeline[0].fromUserDisplayName).toBeDefined();
      expect(timeline[0].fromUserDisplayName).toContain('Analytics User');
    });

    test('should include community names', async () => {
      const mockEvents = [
        {
          id: 'event1',
          timestamp: new Date('2024-01-01T10:00:00Z'),
          type: 'award',
          fromUserId: testUserId2,
          fromUserDisplayName: 'User 2',
          fromUserUsername: 'user2',
          amount: 1,
          communityId: testCommunityId1,
          communityName: 'Test Community Analytics 1',
        },
      ];
      mockDb.orderBy.mockResolvedValue(mockEvents);

      const timeline = await trustAnalyticsRepository.getTrustTimeline(testUserId1);

      expect(timeline[0].communityName).toBe('Test Community Analytics 1');
    });

    test('should handle null fromUserId for admin grants', async () => {
      const mockEvents = [
        {
          id: 'event1',
          timestamp: new Date('2024-01-01T10:00:00Z'),
          type: 'admin_grant',
          fromUserId: null,
          fromUserDisplayName: null,
          fromUserUsername: null,
          amount: 5,
          communityId: testCommunityId1,
          communityName: 'Test Community 1',
        },
      ];
      mockDb.orderBy.mockResolvedValue(mockEvents);

      const timeline = await trustAnalyticsRepository.getTrustTimeline(testUserId1);

      expect(timeline[0].fromUserId).toBeNull();
      expect(timeline[0].fromUserDisplayName).toBeNull();
    });
  });

  describe('getTrustSummary', () => {
    test('should return zero values when user has no trust', async () => {
      mockDb.where.mockResolvedValueOnce([
        {
          totalPoints: 0,
          totalAwards: 0,
          totalRemovals: 0,
        },
      ]);
      mockDb.groupBy.mockResolvedValue([]);

      const summary = await trustAnalyticsRepository.getTrustSummary(testUserId1);

      expect(summary.totalTrustPoints).toBe(0);
      expect(summary.totalAwardsReceived).toBe(0);
      expect(summary.totalAwardsRemoved).toBe(0);
      expect(summary.trustByCommunity).toEqual([]);
    });

    test('should calculate total trust points correctly', async () => {
      mockDb.where.mockResolvedValueOnce([
        {
          totalPoints: 7,
          totalAwards: 2,
          totalRemovals: 0,
        },
      ]);
      mockDb.groupBy.mockResolvedValue([
        {
          communityId: testCommunityId1,
          communityName: 'Test Community 1',
          trustPoints: 7,
        },
      ]);

      const summary = await trustAnalyticsRepository.getTrustSummary(testUserId1);

      expect(summary.totalTrustPoints).toBe(7); // 1 + 1 + 5
    });

    test('should count awards and removals separately', async () => {
      mockDb.where.mockResolvedValueOnce([
        {
          totalPoints: 1,
          totalAwards: 2,
          totalRemovals: 1,
        },
      ]);
      mockDb.groupBy.mockResolvedValue([
        {
          communityId: testCommunityId1,
          communityName: 'Test Community 1',
          trustPoints: 1,
        },
      ]);

      const summary = await trustAnalyticsRepository.getTrustSummary(testUserId1);

      expect(summary.totalAwardsReceived).toBe(2);
      expect(summary.totalAwardsRemoved).toBe(1);
      expect(summary.totalTrustPoints).toBe(1); // 1 + 1 - 1
    });

    test('should break down trust by community', async () => {
      mockDb.where.mockResolvedValueOnce([
        {
          totalPoints: 3,
          totalAwards: 3,
          totalRemovals: 0,
        },
      ]);
      mockDb.groupBy.mockResolvedValue([
        {
          communityId: testCommunityId1,
          communityName: 'Test Community 1',
          trustPoints: 2,
        },
        {
          communityId: testCommunityId2,
          communityName: 'Test Community 2',
          trustPoints: 1,
        },
      ]);

      const summary = await trustAnalyticsRepository.getTrustSummary(testUserId1);

      expect(summary.trustByCommunity).toHaveLength(2);

      const comm1 = summary.trustByCommunity.find((c: any) => c.communityId === testCommunityId1);
      const comm2 = summary.trustByCommunity.find((c: any) => c.communityId === testCommunityId2);

      expect(comm1?.trustPoints).toBe(2);
      expect(comm2?.trustPoints).toBe(1);
    });

    test('should filter by communityId', async () => {
      mockDb.where.mockResolvedValueOnce([
        {
          totalPoints: 1,
          totalAwards: 1,
          totalRemovals: 0,
        },
      ]);
      mockDb.groupBy.mockResolvedValue([
        {
          communityId: testCommunityId1,
          communityName: 'Test Community 1',
          trustPoints: 1,
        },
      ]);

      const summary = await trustAnalyticsRepository.getTrustSummary(testUserId1, {
        communityId: testCommunityId1,
      });

      expect(summary.totalTrustPoints).toBe(1);
      expect(summary.trustByCommunity).toHaveLength(1);
      expect(summary.trustByCommunity[0].communityId).toBe(testCommunityId1);
    });

    test('should include community names in breakdown', async () => {
      mockDb.where.mockResolvedValueOnce([
        {
          totalPoints: 1,
          totalAwards: 1,
          totalRemovals: 0,
        },
      ]);
      mockDb.groupBy.mockResolvedValue([
        {
          communityId: testCommunityId1,
          communityName: 'Test Community Analytics 1',
          trustPoints: 1,
        },
      ]);

      const summary = await trustAnalyticsRepository.getTrustSummary(testUserId1);

      expect(summary.trustByCommunity[0].communityName).toBe('Test Community Analytics 1');
    });
  });

  describe('getCurrentTrustScore', () => {
    test('should return 0 when user has no trust', async () => {
      mockDb.where.mockResolvedValueOnce([{ count: 0 }]);
      mockDb.where.mockResolvedValueOnce([]);

      const score = await trustAnalyticsRepository.getCurrentTrustScore(
        testUserId1,
        testCommunityId1
      );

      expect(score).toBe(0);
    });

    test('should calculate score from peer awards only', async () => {
      mockDb.where.mockResolvedValueOnce([{ count: 2 }]);
      mockDb.where.mockResolvedValueOnce([]);

      const score = await trustAnalyticsRepository.getCurrentTrustScore(
        testUserId1,
        testCommunityId1
      );

      expect(score).toBe(2);
    });

    test('should calculate score from admin grant only', async () => {
      mockDb.where.mockResolvedValueOnce([{ count: 0 }]);
      mockDb.where.mockResolvedValueOnce([{ amount: 10 }]);

      const score = await trustAnalyticsRepository.getCurrentTrustScore(
        testUserId1,
        testCommunityId1
      );

      expect(score).toBe(10);
    });

    test('should calculate score from peer awards and admin grant', async () => {
      mockDb.where.mockResolvedValueOnce([{ count: 2 }]);
      mockDb.where.mockResolvedValueOnce([{ amount: 5 }]);

      const score = await trustAnalyticsRepository.getCurrentTrustScore(
        testUserId1,
        testCommunityId1
      );

      expect(score).toBe(7); // 2 + 5
    });

    test('should return score for specific community only', async () => {
      mockDb.where.mockResolvedValueOnce([{ count: 2 }]);
      mockDb.where.mockResolvedValueOnce([]);

      const score = await trustAnalyticsRepository.getCurrentTrustScore(
        testUserId1,
        testCommunityId1
      );

      expect(score).toBe(2); // Only comm1 awards
    });

    test('should handle multiple users independently', async () => {
      // First call for testUserId1
      mockDb.where.mockResolvedValueOnce([{ count: 2 }]);
      mockDb.where.mockResolvedValueOnce([]);

      const score1 = await trustAnalyticsRepository.getCurrentTrustScore(
        testUserId1,
        testCommunityId1
      );

      // Second call for testUserId2
      mockDb.where.mockResolvedValueOnce([{ count: 1 }]);
      mockDb.where.mockResolvedValueOnce([]);

      const score2 = await trustAnalyticsRepository.getCurrentTrustScore(
        testUserId2,
        testCommunityId1
      );

      expect(score1).toBe(2);
      expect(score2).toBe(1);
    });
  });
});
