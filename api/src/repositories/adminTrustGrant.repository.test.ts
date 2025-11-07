import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { db } from '../db/index';
import { adminTrustGrantRepository } from './adminTrustGrant.repository';
import { createThenableMockDb, setupMockDbChains } from '../../tests/helpers/mockDb';

// Store original db methods to restore after each test
const originalDbMethods = {
  insert: db.insert,
  select: db.select,
  update: db.update,
  delete: (db as any).delete,
};

// Create mock database
const mockDb = createThenableMockDb();

describe('AdminTrustGrantRepository', () => {
  // Test data
  const testCommunityId = 'comm-123';
  const adminUserId = 'admin-123';
  const testUserId1 = 'user-123';
  const testUserId2 = 'user-456';
  const testUserId3 = 'user-789';

  beforeEach(() => {
    // Reset all mocks and setup default chains
    setupMockDbChains(mockDb);

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

  describe('upsertGrant', () => {
    it('should create a new grant when none exists', async () => {
      const mockGrant = {
        id: 'grant-123',
        communityId: testCommunityId,
        adminUserId: adminUserId,
        toUserId: testUserId1,
        trustAmount: 10,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      mockDb.returning.mockResolvedValue([mockGrant]);

      const grant = await adminTrustGrantRepository.upsertGrant(
        testCommunityId,
        adminUserId,
        testUserId1,
        10
      );

      expect(grant).toBeDefined();
      expect(grant.communityId).toBe(testCommunityId);
      expect(grant.adminUserId).toBe(adminUserId);
      expect(grant.toUserId).toBe(testUserId1);
      expect(grant.trustAmount).toBe(10);
      expect(grant.createdAt).toBeInstanceOf(Date);
      expect(grant.updatedAt).toBeInstanceOf(Date);
    });

    it('should update existing grant', async () => {
      const initialGrant = {
        id: 'grant-123',
        communityId: testCommunityId,
        adminUserId: adminUserId,
        toUserId: testUserId1,
        trustAmount: 10,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      const updatedGrant = {
        ...initialGrant,
        trustAmount: 25,
        updatedAt: new Date('2024-01-02'),
      };

      mockDb.returning.mockResolvedValueOnce([initialGrant]);
      mockDb.returning.mockResolvedValueOnce([updatedGrant]);

      const initial = await adminTrustGrantRepository.upsertGrant(
        testCommunityId,
        adminUserId,
        testUserId1,
        10
      );

      const updated = await adminTrustGrantRepository.upsertGrant(
        testCommunityId,
        adminUserId,
        testUserId1,
        25
      );

      expect(updated.trustAmount).toBe(25);
    });

    it('should allow different admin to update grant', async () => {
      const admin2Id = 'admin-456';
      const updatedGrant = {
        id: 'grant-123',
        communityId: testCommunityId,
        adminUserId: admin2Id,
        toUserId: testUserId1,
        trustAmount: 20,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      };

      mockDb.returning.mockResolvedValue([updatedGrant]);

      const updated = await adminTrustGrantRepository.upsertGrant(
        testCommunityId,
        admin2Id,
        testUserId1,
        20
      );

      expect(updated.adminUserId).toBe(admin2Id);
      expect(updated.trustAmount).toBe(20);
    });

    it('should create separate grants for different users', async () => {
      const grant1 = {
        id: 'grant-123',
        communityId: testCommunityId,
        adminUserId: adminUserId,
        toUserId: testUserId1,
        trustAmount: 10,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      const grant2 = {
        id: 'grant-456',
        communityId: testCommunityId,
        adminUserId: adminUserId,
        toUserId: testUserId2,
        trustAmount: 15,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      mockDb.returning.mockResolvedValueOnce([grant1]);
      mockDb.returning.mockResolvedValueOnce([grant2]);

      const result1 = await adminTrustGrantRepository.upsertGrant(
        testCommunityId,
        adminUserId,
        testUserId1,
        10
      );

      const result2 = await adminTrustGrantRepository.upsertGrant(
        testCommunityId,
        adminUserId,
        testUserId2,
        15
      );

      expect(result1.toUserId).toBe(testUserId1);
      expect(result2.toUserId).toBe(testUserId2);
    });

    it('should allow zero amount', async () => {
      const mockGrant = {
        id: 'grant-123',
        communityId: testCommunityId,
        adminUserId: adminUserId,
        toUserId: testUserId1,
        trustAmount: 0,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      mockDb.returning.mockResolvedValue([mockGrant]);

      const grant = await adminTrustGrantRepository.upsertGrant(
        testCommunityId,
        adminUserId,
        testUserId1,
        0
      );

      expect(grant.trustAmount).toBe(0);
    });

    it('should allow negative amount', async () => {
      const mockGrant = {
        id: 'grant-123',
        communityId: testCommunityId,
        adminUserId: adminUserId,
        toUserId: testUserId1,
        trustAmount: -5,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      mockDb.returning.mockResolvedValue([mockGrant]);

      const grant = await adminTrustGrantRepository.upsertGrant(
        testCommunityId,
        adminUserId,
        testUserId1,
        -5
      );

      expect(grant.trustAmount).toBe(-5);
    });

    it('should update grant amount to zero', async () => {
      const mockGrant = {
        id: 'grant-123',
        communityId: testCommunityId,
        adminUserId: adminUserId,
        toUserId: testUserId1,
        trustAmount: 0,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      };

      mockDb.returning.mockResolvedValue([mockGrant]);

      const updated = await adminTrustGrantRepository.upsertGrant(
        testCommunityId,
        adminUserId,
        testUserId1,
        0
      );

      expect(updated.trustAmount).toBe(0);
    });
  });

  describe('getGrant', () => {
    it('should return null when grant does not exist', async () => {
      mockDb.where.mockResolvedValue([]);

      const grant = await adminTrustGrantRepository.getGrant(testCommunityId, testUserId1);

      expect(grant).toBeNull();
    });

    it('should return grant when it exists', async () => {
      const mockGrant = {
        id: 'grant-123',
        communityId: testCommunityId,
        adminUserId: adminUserId,
        toUserId: testUserId1,
        trustAmount: 10,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      mockDb.where.mockResolvedValue([mockGrant]);

      const grant = await adminTrustGrantRepository.getGrant(testCommunityId, testUserId1);

      expect(grant).toBeDefined();
      expect(grant?.trustAmount).toBe(10);
    });

    it('should return grant for specific user only', async () => {
      const mockGrant = {
        id: 'grant-123',
        communityId: testCommunityId,
        adminUserId: adminUserId,
        toUserId: testUserId1,
        trustAmount: 10,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      mockDb.where.mockResolvedValue([mockGrant]);

      const grant = await adminTrustGrantRepository.getGrant(testCommunityId, testUserId1);

      expect(grant?.toUserId).toBe(testUserId1);
      expect(grant?.trustAmount).toBe(10);
    });

    it('should return null for wrong community', async () => {
      mockDb.where.mockResolvedValue([]);

      const wrongCommunityId = '660e8400-e29b-41d4-a716-446655440099';
      const grant = await adminTrustGrantRepository.getGrant(wrongCommunityId, testUserId1);

      expect(grant).toBeNull();
    });
  });

  describe('listAllGrants', () => {
    it('should return empty array when no grants exist', async () => {
      mockDb.where.mockResolvedValue([]);

      const grants = await adminTrustGrantRepository.listAllGrants(testCommunityId);

      expect(grants).toEqual([]);
    });

    it('should return all grants for a community', async () => {
      const mockGrants = [
        {
          id: 'grant-1',
          communityId: testCommunityId,
          adminUserId: adminUserId,
          toUserId: testUserId1,
          trustAmount: 10,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
        {
          id: 'grant-2',
          communityId: testCommunityId,
          adminUserId: adminUserId,
          toUserId: testUserId2,
          trustAmount: 15,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
        {
          id: 'grant-3',
          communityId: testCommunityId,
          adminUserId: adminUserId,
          toUserId: testUserId3,
          trustAmount: 20,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      ];

      mockDb.where.mockResolvedValue(mockGrants);

      const grants = await adminTrustGrantRepository.listAllGrants(testCommunityId);

      expect(grants).toHaveLength(3);
      expect(grants.every((g) => g.communityId === testCommunityId)).toBe(true);
    });

    it('should not return grants from other communities', async () => {
      const mockGrants = [
        {
          id: 'grant-1',
          communityId: testCommunityId,
          adminUserId: adminUserId,
          toUserId: testUserId1,
          trustAmount: 10,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      ];

      mockDb.where.mockResolvedValue(mockGrants);

      const grants = await adminTrustGrantRepository.listAllGrants(testCommunityId);

      expect(grants).toHaveLength(1);
      expect(grants[0].communityId).toBe(testCommunityId);
    });

    it('should include all grant information', async () => {
      const mockGrants = [
        {
          id: 'grant-1',
          communityId: testCommunityId,
          adminUserId: adminUserId,
          toUserId: testUserId1,
          trustAmount: 10,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
      ];

      mockDb.where.mockResolvedValue(mockGrants);

      const grants = await adminTrustGrantRepository.listAllGrants(testCommunityId);

      expect(grants[0]).toHaveProperty('id');
      expect(grants[0]).toHaveProperty('communityId');
      expect(grants[0]).toHaveProperty('adminUserId');
      expect(grants[0]).toHaveProperty('toUserId');
      expect(grants[0]).toHaveProperty('trustAmount');
      expect(grants[0]).toHaveProperty('createdAt');
      expect(grants[0]).toHaveProperty('updatedAt');
    });
  });

  describe('deleteGrant', () => {
    it('should delete existing grant', async () => {
      const mockGrant = {
        id: 'grant-123',
        communityId: testCommunityId,
        adminUserId: adminUserId,
        toUserId: testUserId1,
        trustAmount: 10,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      mockDb.returning.mockResolvedValue([mockGrant]);

      const deleted = await adminTrustGrantRepository.deleteGrant(testCommunityId, testUserId1);

      expect(deleted).toBeDefined();
      expect(deleted?.toUserId).toBe(testUserId1);
    });

    it('should return undefined when grant does not exist', async () => {
      mockDb.returning.mockResolvedValue([]);

      const deleted = await adminTrustGrantRepository.deleteGrant(testCommunityId, testUserId1);

      expect(deleted).toBeUndefined();
    });

    it('should not delete grants from other communities', async () => {
      mockDb.returning.mockResolvedValue([]);

      const wrongCommunityId = '660e8400-e29b-41d4-a716-446655440099';
      const deleted = await adminTrustGrantRepository.deleteGrant(wrongCommunityId, testUserId1);

      expect(deleted).toBeUndefined();
    });

    it('should delete only specific user grant', async () => {
      const mockGrant = {
        id: 'grant-123',
        communityId: testCommunityId,
        adminUserId: adminUserId,
        toUserId: testUserId1,
        trustAmount: 10,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      mockDb.returning.mockResolvedValue([mockGrant]);

      await adminTrustGrantRepository.deleteGrant(testCommunityId, testUserId1);

      expect(mockDb.delete).toHaveBeenCalled();
    });

    it('should allow re-creating grant after deletion', async () => {
      const mockGrant = {
        id: 'grant-123',
        communityId: testCommunityId,
        adminUserId: adminUserId,
        toUserId: testUserId1,
        trustAmount: 20,
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02'),
      };

      mockDb.returning.mockResolvedValue([mockGrant]);

      const recreated = await adminTrustGrantRepository.upsertGrant(
        testCommunityId,
        adminUserId,
        testUserId1,
        20
      );

      expect(recreated.trustAmount).toBe(20);
    });
  });

  describe('getGrantAmount', () => {
    it('should return 0 when grant does not exist', async () => {
      mockDb.where.mockResolvedValue([]);

      const amount = await adminTrustGrantRepository.getGrantAmount(testCommunityId, testUserId1);

      expect(amount).toBe(0);
    });

    it('should return grant amount when grant exists', async () => {
      const mockGrant = {
        id: 'grant-123',
        communityId: testCommunityId,
        adminUserId: adminUserId,
        toUserId: testUserId1,
        trustAmount: 25,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      mockDb.where.mockResolvedValue([mockGrant]);

      const amount = await adminTrustGrantRepository.getGrantAmount(testCommunityId, testUserId1);

      expect(amount).toBe(25);
    });

    it('should return 0 for grant with zero amount', async () => {
      const mockGrant = {
        id: 'grant-123',
        communityId: testCommunityId,
        adminUserId: adminUserId,
        toUserId: testUserId1,
        trustAmount: 0,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      mockDb.where.mockResolvedValue([mockGrant]);

      const amount = await adminTrustGrantRepository.getGrantAmount(testCommunityId, testUserId1);

      expect(amount).toBe(0);
    });

    it('should return negative amount', async () => {
      const mockGrant = {
        id: 'grant-123',
        communityId: testCommunityId,
        adminUserId: adminUserId,
        toUserId: testUserId1,
        trustAmount: -10,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      mockDb.where.mockResolvedValue([mockGrant]);

      const amount = await adminTrustGrantRepository.getGrantAmount(testCommunityId, testUserId1);

      expect(amount).toBe(-10);
    });

    it('should return updated amount after upsert', async () => {
      const mockGrant = {
        id: 'grant-123',
        communityId: testCommunityId,
        adminUserId: adminUserId,
        toUserId: testUserId1,
        trustAmount: 50,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      };

      mockDb.where.mockResolvedValue([mockGrant]);

      const amount = await adminTrustGrantRepository.getGrantAmount(testCommunityId, testUserId1);
      expect(amount).toBe(50);
    });

    it('should return 0 after grant deletion', async () => {
      mockDb.where.mockResolvedValue([]);

      const amount = await adminTrustGrantRepository.getGrantAmount(testCommunityId, testUserId1);

      expect(amount).toBe(0);
    });

    it('should return 0 for wrong community', async () => {
      mockDb.where.mockResolvedValue([]);

      const wrongCommunityId = '660e8400-e29b-41d4-a716-446655440099';
      const amount = await adminTrustGrantRepository.getGrantAmount(wrongCommunityId, testUserId1);

      expect(amount).toBe(0);
    });

    it('should handle multiple grants correctly', async () => {
      const mockGrant1 = {
        id: 'grant-123',
        communityId: testCommunityId,
        adminUserId: adminUserId,
        toUserId: testUserId1,
        trustAmount: 10,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      const mockGrant2 = {
        id: 'grant-456',
        communityId: testCommunityId,
        adminUserId: adminUserId,
        toUserId: testUserId2,
        trustAmount: 20,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      mockDb.where.mockResolvedValueOnce([mockGrant1]);
      mockDb.where.mockResolvedValueOnce([mockGrant2]);

      const amount1 = await adminTrustGrantRepository.getGrantAmount(testCommunityId, testUserId1);
      const amount2 = await adminTrustGrantRepository.getGrantAmount(testCommunityId, testUserId2);

      expect(amount1).toBe(10);
      expect(amount2).toBe(20);
    });
  });
});
