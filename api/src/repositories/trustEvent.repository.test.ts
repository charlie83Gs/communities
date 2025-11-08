import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import { createThenableMockDb, setupMockDbChains } from '../../tests/helpers/mockDb';
import { TrustEventRepository } from './trustEvent.repository';

let trustEventRepository: TrustEventRepository;

// Create mock database
const mockDb = createThenableMockDb();

describe('TrustEventRepository', () => {
  // Test data - all const, no reassignment
  const testCommunityId = 'test-community-123';
  const testUserId1 = 'test-user-1';
  const testUserId2 = 'test-user-2';
  const testUserId3 = 'test-user-3';
  const testEntityId = '550e8400-e29b-41d4-a716-446655440000';
  const differentCommunityId = '660e8400-e29b-41d4-a716-446655440099';

  beforeEach(() => {
    // Reset all mocks and setup default chains
    setupMockDbChains(mockDb);
    // Instantiate repository with the per-test mock DB
    trustEventRepository = new TrustEventRepository(mockDb as any);
  });

  afterEach(() => {
    // Nothing to clean up; a fresh TrustEventRepository is created per test
  });

  describe('create', () => {
    test('should create a trust event with all fields', async () => {
      const mockEvent = {
        id: 'event-1',
        communityId: testCommunityId,
        type: 'share_redeemed',
        entityType: 'share',
        entityId: testEntityId,
        actorUserId: testUserId1,
        subjectUserIdA: testUserId2,
        subjectUserIdB: testUserId3,
        pointsDeltaA: 5,
        pointsDeltaB: -2,
        createdAt: new Date('2024-01-01'),
      };

      mockDb.returning.mockResolvedValue([mockEvent]);

      const event = await trustEventRepository.create({
        communityId: testCommunityId,
        type: 'share_redeemed',
        entityType: 'share',
        entityId: testEntityId,
        actorUserId: testUserId1,
        subjectUserIdA: testUserId2,
        subjectUserIdB: testUserId3,
        pointsDeltaA: 5,
        pointsDeltaB: -2,
      });

      expect(event).toBeDefined();
      expect(event.communityId).toBe(testCommunityId);
      expect(event.type).toBe('share_redeemed');
      expect(event.entityType).toBe('share');
      expect(event.entityId).toBe(testEntityId);
      expect(event.actorUserId).toBe(testUserId1);
      expect(event.subjectUserIdA).toBe(testUserId2);
      expect(event.subjectUserIdB).toBe(testUserId3);
      expect(event.pointsDeltaA).toBe(5);
      expect(event.pointsDeltaB).toBe(-2);
      expect(event.createdAt).toBeInstanceOf(Date);
      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockDb.values).toHaveBeenCalled();
      expect(mockDb.returning).toHaveBeenCalled();
    });

    test('should create event with minimal required fields', async () => {
      const mockEvent = {
        id: 'event-2',
        communityId: testCommunityId,
        type: 'posture_adjustment',
        entityType: null,
        entityId: null,
        actorUserId: null,
        subjectUserIdA: null,
        subjectUserIdB: null,
        pointsDeltaA: 0,
        pointsDeltaB: 0,
        createdAt: new Date('2024-01-01'),
      };

      mockDb.returning.mockResolvedValue([mockEvent]);

      const event = await trustEventRepository.create({
        communityId: testCommunityId,
        type: 'posture_adjustment',
      });

      expect(event).toBeDefined();
      expect(event.communityId).toBe(testCommunityId);
      expect(event.type).toBe('posture_adjustment');
      expect(event.entityType).toBeNull();
      expect(event.entityId).toBeNull();
      expect(event.actorUserId).toBeNull();
      expect(event.subjectUserIdA).toBeNull();
      expect(event.subjectUserIdB).toBeNull();
      expect(event.pointsDeltaA).toBe(0);
      expect(event.pointsDeltaB).toBe(0);
    });

    test('should create event with only subjectUserIdA', async () => {
      const mockEvent = {
        id: 'event-3',
        communityId: testCommunityId,
        type: 'share_redeemed',
        entityType: null,
        entityId: null,
        actorUserId: null,
        subjectUserIdA: testUserId1,
        subjectUserIdB: null,
        pointsDeltaA: 10,
        pointsDeltaB: 0,
        createdAt: new Date('2024-01-01'),
      };

      mockDb.returning.mockResolvedValue([mockEvent]);

      const event = await trustEventRepository.create({
        communityId: testCommunityId,
        type: 'share_redeemed',
        subjectUserIdA: testUserId1,
        pointsDeltaA: 10,
      });

      expect(event.subjectUserIdA).toBe(testUserId1);
      expect(event.subjectUserIdB).toBeNull();
      expect(event.pointsDeltaA).toBe(10);
      expect(event.pointsDeltaB).toBe(0);
    });

    test('should create event with custom type string', async () => {
      const mockEvent = {
        id: 'event-4',
        communityId: testCommunityId,
        type: 'custom_event_type',
        entityType: null,
        entityId: null,
        actorUserId: testUserId1,
        subjectUserIdA: null,
        subjectUserIdB: null,
        pointsDeltaA: 0,
        pointsDeltaB: 0,
        createdAt: new Date('2024-01-01'),
      };

      mockDb.returning.mockResolvedValue([mockEvent]);

      const event = await trustEventRepository.create({
        communityId: testCommunityId,
        type: 'custom_event_type',
        actorUserId: testUserId1,
      });

      expect(event.type).toBe('custom_event_type');
    });
  });

  describe('listByUser', () => {
    test('should return empty array when user has no events', async () => {
      mockDb.offset.mockResolvedValue([]);

      const events = await trustEventRepository.listByUser(testCommunityId, testUserId1, 50, 0);

      expect(events).toEqual([]);
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalled();
      expect(mockDb.orderBy).toHaveBeenCalled();
      expect(mockDb.limit).toHaveBeenCalled();
      expect(mockDb.offset).toHaveBeenCalled();
    });

    test('should return events where user is subjectUserIdA', async () => {
      const mockEvents = [
        {
          id: 'event-5',
          communityId: testCommunityId,
          type: 'share_redeemed',
          subjectUserIdA: testUserId1,
          subjectUserIdB: null,
          pointsDeltaA: 5,
          pointsDeltaB: 0,
          createdAt: new Date('2024-01-01'),
        },
      ];

      mockDb.offset.mockResolvedValue(mockEvents);

      const events = await trustEventRepository.listByUser(testCommunityId, testUserId1, 50, 0);

      expect(events).toHaveLength(1);
      expect(events[0].subjectUserIdA).toBe(testUserId1);
    });

    test('should return events where user is subjectUserIdB', async () => {
      const mockEvents = [
        {
          id: 'event-6',
          communityId: testCommunityId,
          type: 'share_redeemed',
          subjectUserIdA: testUserId1,
          subjectUserIdB: testUserId2,
          pointsDeltaA: 0,
          pointsDeltaB: 3,
          createdAt: new Date('2024-01-01'),
        },
      ];

      mockDb.offset.mockResolvedValue(mockEvents);

      const events = await trustEventRepository.listByUser(testCommunityId, testUserId2, 50, 0);

      expect(events).toHaveLength(1);
      expect(events[0].subjectUserIdB).toBe(testUserId2);
    });

    test('should return events where user is either A or B', async () => {
      const mockEvents = [
        {
          id: 'event-7',
          communityId: testCommunityId,
          type: 'share_redeemed',
          subjectUserIdA: testUserId1,
          subjectUserIdB: testUserId2,
          createdAt: new Date('2024-01-02'),
        },
        {
          id: 'event-8',
          communityId: testCommunityId,
          type: 'share_redeemed',
          subjectUserIdA: testUserId2,
          subjectUserIdB: testUserId1,
          createdAt: new Date('2024-01-01'),
        },
      ];

      mockDb.offset.mockResolvedValue(mockEvents);

      const events = await trustEventRepository.listByUser(testCommunityId, testUserId1, 50, 0);

      expect(events).toHaveLength(2);
    });

    test('should respect limit parameter', async () => {
      const mockEvents = [
        { id: 'event-9', createdAt: new Date('2024-01-03') },
        { id: 'event-10', createdAt: new Date('2024-01-02') },
        { id: 'event-11', createdAt: new Date('2024-01-01') },
      ];

      mockDb.offset.mockResolvedValue(mockEvents);

      const events = await trustEventRepository.listByUser(testCommunityId, testUserId1, 3, 0);

      expect(events).toHaveLength(3);
      expect(mockDb.limit).toHaveBeenCalled();
    });

    test('should respect offset parameter', async () => {
      const mockEvents = [
        { id: 'event-12', createdAt: new Date('2024-01-01') },
        { id: 'event-13', createdAt: new Date('2024-01-02') },
        { id: 'event-14', createdAt: new Date('2024-01-03') },
      ];

      mockDb.offset.mockResolvedValue(mockEvents);

      const offsetEvents = await trustEventRepository.listByUser(
        testCommunityId,
        testUserId1,
        50,
        2
      );

      expect(offsetEvents).toHaveLength(3);
      expect(mockDb.offset).toHaveBeenCalled();
    });

    test('should order by createdAt descending', async () => {
      const mockEvents = [
        { id: 'event-16', createdAt: new Date('2024-01-02') },
        { id: 'event-15', createdAt: new Date('2024-01-01') },
      ];

      mockDb.offset.mockResolvedValue(mockEvents);

      const events = await trustEventRepository.listByUser(testCommunityId, testUserId1, 50, 0);

      expect(events[0].id).toBe('event-16');
      expect(events[1].id).toBe('event-15');
      expect(mockDb.orderBy).toHaveBeenCalled();
    });

    test('should not return events from other communities', async () => {
      mockDb.offset.mockResolvedValue([]);

      const events = await trustEventRepository.listByUser(
        differentCommunityId,
        testUserId1,
        50,
        0
      );

      expect(events).toEqual([]);
    });
  });

  describe('listByUserB', () => {
    test('should return empty array when user has no B events', async () => {
      mockDb.offset.mockResolvedValue([]);

      const events = await trustEventRepository.listByUserB(testCommunityId, testUserId1, 50, 0);

      expect(events).toEqual([]);
    });

    test('should return only events where user is subjectUserIdB', async () => {
      const mockEvents = [
        {
          id: 'event-17',
          communityId: testCommunityId,
          type: 'share_redeemed',
          subjectUserIdA: testUserId2,
          subjectUserIdB: testUserId1,
          createdAt: new Date('2024-01-01'),
        },
      ];

      mockDb.offset.mockResolvedValue(mockEvents);

      const events = await trustEventRepository.listByUserB(testCommunityId, testUserId1, 50, 0);

      expect(events).toHaveLength(1);
      expect(events[0].subjectUserIdB).toBe(testUserId1);
    });

    test('should respect limit and offset', async () => {
      const mockEvents = [
        { id: 'event-18', subjectUserIdB: testUserId1 },
        { id: 'event-19', subjectUserIdB: testUserId1 },
      ];

      mockDb.offset.mockResolvedValue(mockEvents);

      const events = await trustEventRepository.listByUserB(testCommunityId, testUserId1, 2, 1);

      expect(events).toHaveLength(2);
    });
  });

  describe('listByCommunity', () => {
    test('should return empty array when community has no events', async () => {
      mockDb.offset.mockResolvedValue([]);

      const events = await trustEventRepository.listByCommunity(testCommunityId, 100, 0);

      expect(events).toEqual([]);
    });

    test('should return all events for a community', async () => {
      const mockEvents = [
        {
          id: 'event-20',
          communityId: testCommunityId,
          type: 'share_redeemed',
          subjectUserIdA: testUserId1,
          createdAt: new Date('2024-01-03'),
        },
        {
          id: 'event-21',
          communityId: testCommunityId,
          type: 'posture_adjustment',
          subjectUserIdA: testUserId2,
          createdAt: new Date('2024-01-02'),
        },
        {
          id: 'event-22',
          communityId: testCommunityId,
          type: 'share_redeemed',
          subjectUserIdB: testUserId3,
          createdAt: new Date('2024-01-01'),
        },
      ];

      mockDb.offset.mockResolvedValue(mockEvents);

      const events = await trustEventRepository.listByCommunity(testCommunityId, 100, 0);

      expect(events).toHaveLength(3);
      expect(events.every((e) => e.communityId === testCommunityId)).toBe(true);
    });

    test('should respect limit parameter', async () => {
      const mockEvents = [{ id: 'event-23' }, { id: 'event-24' }, { id: 'event-25' }];

      mockDb.offset.mockResolvedValue(mockEvents);

      const events = await trustEventRepository.listByCommunity(testCommunityId, 3, 0);

      expect(events).toHaveLength(3);
    });

    test('should respect offset parameter', async () => {
      const mockEvents = [{ id: 'event-26' }, { id: 'event-27' }, { id: 'event-28' }];

      mockDb.offset.mockResolvedValue(mockEvents);

      const offsetEvents = await trustEventRepository.listByCommunity(testCommunityId, 100, 2);

      expect(offsetEvents).toHaveLength(3);
    });

    test('should order by createdAt descending', async () => {
      const mockEvents = [
        { id: 'event-30', createdAt: new Date('2024-01-02') },
        { id: 'event-29', createdAt: new Date('2024-01-01') },
      ];

      mockDb.offset.mockResolvedValue(mockEvents);

      const events = await trustEventRepository.listByCommunity(testCommunityId, 100, 0);

      expect(events[0].id).toBe('event-30');
      expect(events[1].id).toBe('event-29');
    });
  });

  describe('listByUserAllCommunities', () => {
    test('should return empty array when user has no events', async () => {
      mockDb.offset.mockResolvedValue([]);

      const events = await trustEventRepository.listByUserAllCommunities(testUserId1, 50, 0);

      expect(events).toEqual([]);
    });

    test('should return events from all communities', async () => {
      const mockEvents = [
        {
          id: 'event-31',
          communityId: testCommunityId,
          type: 'share_redeemed',
          subjectUserIdA: testUserId1,
          createdAt: new Date('2024-01-01'),
        },
      ];

      mockDb.offset.mockResolvedValue(mockEvents);

      const events = await trustEventRepository.listByUserAllCommunities(testUserId1, 50, 0);

      expect(events.length).toBeGreaterThanOrEqual(1);
      expect(events.some((e) => e.communityId === testCommunityId)).toBe(true);
    });

    test('should return events where user is A or B', async () => {
      const mockEvents = [
        {
          id: 'event-32',
          communityId: testCommunityId,
          type: 'share_redeemed',
          subjectUserIdA: testUserId1,
          createdAt: new Date('2024-01-02'),
        },
        {
          id: 'event-33',
          communityId: testCommunityId,
          type: 'posture_adjustment',
          subjectUserIdB: testUserId1,
          createdAt: new Date('2024-01-01'),
        },
      ];

      mockDb.offset.mockResolvedValue(mockEvents);

      const events = await trustEventRepository.listByUserAllCommunities(testUserId1, 50, 0);

      expect(events.length).toBeGreaterThanOrEqual(2);
    });

    test('should respect limit parameter', async () => {
      const mockEvents = [{ id: 'event-34' }, { id: 'event-35' }, { id: 'event-36' }];

      mockDb.offset.mockResolvedValue(mockEvents);

      const events = await trustEventRepository.listByUserAllCommunities(testUserId1, 3, 0);

      expect(events).toHaveLength(3);
    });

    test('should respect offset parameter', async () => {
      const mockEvents = [{ id: 'event-37' }, { id: 'event-38' }, { id: 'event-39' }];

      mockDb.offset.mockResolvedValue(mockEvents);

      const offsetEvents = await trustEventRepository.listByUserAllCommunities(testUserId1, 50, 2);

      expect(offsetEvents.length).toBeGreaterThanOrEqual(1);
    });

    test('should order by createdAt descending', async () => {
      const mockEvents = [
        {
          id: 'event-41',
          communityId: testCommunityId,
          type: 'posture_adjustment',
          subjectUserIdA: testUserId1,
          createdAt: new Date('2024-01-02'),
        },
        {
          id: 'event-40',
          communityId: testCommunityId,
          type: 'share_redeemed',
          subjectUserIdA: testUserId1,
          createdAt: new Date('2024-01-01'),
        },
      ];

      mockDb.offset.mockResolvedValue(mockEvents);

      const events = await trustEventRepository.listByUserAllCommunities(testUserId1, 50, 0);

      expect(events[0].id).toBe('event-41');
      expect(events[1].id).toBe('event-40');
    });
  });
});
