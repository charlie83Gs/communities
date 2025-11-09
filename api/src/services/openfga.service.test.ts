import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { OpenFGAService } from '@/services/openfga.service';
import { OpenFGARepository } from '@/repositories/openfga.repository';

// Mock OpenFGA repository
const mockRepository = {
  initialize: mock(() => Promise.resolve()),
  ensureInitialized: mock(() => Promise.resolve()),
  check: mock(() => Promise.resolve(true)),
  read: mock(() => Promise.resolve({ tuples: [] })),
  readTuples: mock(() => Promise.resolve([])),
  write: mock(() => Promise.resolve()),
  listObjects: mock(() => Promise.resolve([])),
} as unknown as OpenFGARepository;

describe('OpenFGAService', () => {
  let service: OpenFGAService;

  beforeEach(() => {
    // Reset all mocks
    Object.values(mockRepository).forEach((m) => {
      if (typeof m === 'function' && 'mockReset' in m) {
        (m as any).mockReset();
      }
    });

    // Set default mock responses
    mockRepository.check.mockResolvedValue(true);
    mockRepository.readTuples.mockResolvedValue([]);
    mockRepository.write.mockResolvedValue(undefined);
    mockRepository.listObjects.mockResolvedValue([]);

    // Create service instance with mock repository
    service = new OpenFGAService(mockRepository);
  });

  describe('checkAccess', () => {
    it('should check if user can perform action on resource', async () => {
      mockRepository.check.mockResolvedValue(true);

      const result = await service.checkAccess('user-123', 'communities', 'comm-123', 'read');

      expect(result).toBe(true);
      expect(mockRepository.check).toHaveBeenCalledWith({
        user: 'user:user-123',
        relation: 'can_read',
        object: 'community:comm-123',
      });
    });

    it('should map actions to permissions', async () => {
      mockRepository.check.mockResolvedValue(true);

      await service.checkAccess('user-123', 'communities', 'comm-123', 'update');

      expect(mockRepository.check).toHaveBeenCalledWith({
        user: 'user:user-123',
        relation: 'can_update',
        object: 'community:comm-123',
      });
    });

    it('should return false on error', async () => {
      mockRepository.check.mockRejectedValue(new Error('OpenFGA error'));

      const result = await service.checkAccess('user-123', 'communities', 'comm-123', 'read');

      expect(result).toBe(false);
    });
  });

  describe('getUserBaseRole', () => {
    it('should return highest privilege role', async () => {
      mockRepository.check
        .mockResolvedValueOnce(false) // admin
        .mockResolvedValueOnce(true); // member

      const result = await service.getUserBaseRole('user-123', 'communities', 'comm-123');

      expect(result).toBe('member');
    });

    it('should return null if no role found', async () => {
      mockRepository.check.mockResolvedValue(false);

      const result = await service.getUserBaseRole('user-123', 'communities', 'comm-123');

      expect(result).toBeNull();
    });

    it('should return all roles when returnAll is true', async () => {
      mockRepository.check
        .mockResolvedValueOnce(true) // admin
        .mockResolvedValueOnce(false); // member

      const result = await service.getUserBaseRole('user-123', 'communities', 'comm-123', {
        returnAll: true,
      });

      expect(result).toEqual(['admin']);
    });
  });

  describe('getBaseRolesForResource', () => {
    it('should return all users with base roles for a resource', async () => {
      // Mock responses for each base role check
      mockRepository.readTuples
        .mockResolvedValueOnce([
          // admin role
          {
            key: {
              user: 'user:user-123',
              relation: 'admin',
              object: 'community:comm-123',
            },
          },
          {
            key: {
              user: 'user:metadata',
              relation: 'admin',
              object: 'community:comm-123',
            },
          },
        ])
        .mockResolvedValueOnce([
          // member role
          {
            key: {
              user: 'user:user-456',
              relation: 'member',
              object: 'community:comm-123',
            },
          },
        ]);

      const result = await service.getBaseRolesForResource('communities', 'comm-123');

      expect(result).toHaveLength(2); // metadata user filtered out
      expect(result).toContainEqual({ userId: 'user-123', role: 'admin' });
      expect(result).toContainEqual({ userId: 'user-456', role: 'member' });
    });

    it('should return empty array if no roles', async () => {
      mockRepository.readTuples.mockResolvedValue([]);

      const result = await service.getBaseRolesForResource('communities', 'comm-123');

      expect(result).toHaveLength(0);
    });
  });

  describe('assignBaseRole', () => {
    it('should assign base role to user', async () => {
      // Mock reading existing tuples (none found)
      mockRepository.readTuples.mockResolvedValue([]);
      // Mock verification check
      mockRepository.check.mockResolvedValue(true);

      await service.assignBaseRole('user-123', 'communities', 'comm-123', 'member');

      expect(mockRepository.write).toHaveBeenCalled();
    });

    it('should be idempotent when role already exists', async () => {
      // Mock existing tuple with the same role
      mockRepository.readTuples.mockResolvedValue([
        {
          key: {
            user: 'user:user-123',
            relation: 'member',
            object: 'community:comm-123',
          },
        },
      ]);

      await service.assignBaseRole('user-123', 'communities', 'comm-123', 'member');

      // With new implementation: always write first, then no cleanup needed since no conflicts
      expect(mockRepository.write).toHaveBeenCalledTimes(1);
      expect(mockRepository.write).toHaveBeenCalledWith([
        {
          user: 'user:user-123',
          relation: 'member',
          object: 'community:comm-123',
        },
      ]);
    });

    it('should replace conflicting base roles', async () => {
      // User currently has admin role
      mockRepository.readTuples.mockResolvedValue([
        {
          key: {
            user: 'user:user-123',
            relation: 'admin',
            object: 'community:comm-123',
          },
        },
      ]);
      mockRepository.check.mockResolvedValue(true);

      await service.assignBaseRole('user-123', 'communities', 'comm-123', 'member');

      // With new implementation: two separate calls - first delete conflicts, then write
      expect(mockRepository.write).toHaveBeenCalledTimes(2);

      // First call: delete conflicting role
      expect(mockRepository.write).toHaveBeenNthCalledWith(1, undefined, [
        {
          user: 'user:user-123',
          relation: 'admin',
          object: 'community:comm-123',
        },
      ]);

      // Second call: write the desired role
      expect(mockRepository.write).toHaveBeenNthCalledWith(2, [
        {
          user: 'user:user-123',
          relation: 'member',
          object: 'community:comm-123',
        },
      ]);
    });

    it('should throw error for invalid role', async () => {
      await expect(
        service.assignBaseRole('user-123', 'communities', 'comm-123', 'invalid' as any)
      ).rejects.toThrow('Invalid base role');
    });
  });

  describe('removeBaseRole', () => {
    it('should remove only existing base role tuples for user', async () => {
      // Mock getUserBaseRole to return only 'member' role
      mockRepository.check.mockImplementation(async ({ relation }) => {
        return relation === 'member'; // User only has 'member' role
      });
      mockRepository.write.mockResolvedValue(undefined);

      await service.removeBaseRole('user-123', 'communities', 'comm-123');

      // Should only delete the 'member' role (not 'admin' since user doesn't have it)
      expect(mockRepository.write).toHaveBeenCalledWith(undefined, [
        {
          user: 'user:user-123',
          relation: 'member',
          object: 'community:comm-123',
        },
      ]);
    });

    it('should do nothing if user has no base roles', async () => {
      // Mock getUserBaseRole to return no roles
      mockRepository.check.mockResolvedValue(false);
      mockRepository.write.mockResolvedValue(undefined);

      await service.removeBaseRole('user-123', 'communities', 'comm-123');

      // Should not attempt to write anything
      expect(mockRepository.write).not.toHaveBeenCalled();
    });

    it('should remove multiple base roles if user has them', async () => {
      // Mock getUserBaseRole to return both roles (edge case, but possible)
      mockRepository.check.mockResolvedValue(true);
      mockRepository.write.mockResolvedValue(undefined);

      await service.removeBaseRole('user-123', 'communities', 'comm-123');

      // Should delete both roles
      expect(mockRepository.write).toHaveBeenCalledWith(undefined, [
        {
          user: 'user:user-123',
          relation: 'admin',
          object: 'community:comm-123',
        },
        {
          user: 'user:user-123',
          relation: 'member',
          object: 'community:comm-123',
        },
      ]);
    });
  });

  describe('assignFeatureRole', () => {
    it('should assign feature role to user', async () => {
      await service.assignFeatureRole('user-123', 'comm-123', 'forum_manager');

      expect(mockRepository.write).toHaveBeenCalledWith([
        {
          user: 'user:user-123',
          relation: 'forum_manager',
          object: 'community:comm-123',
        },
      ]);
    });

    it('should throw error for invalid feature role', async () => {
      await expect(
        service.assignFeatureRole('user-123', 'comm-123', 'invalid' as any)
      ).rejects.toThrow('Invalid feature role');
    });
  });

  describe('revokeFeatureRole', () => {
    it('should revoke feature role from user', async () => {
      await service.revokeFeatureRole('user-123', 'comm-123', 'forum_manager');

      expect(mockRepository.write).toHaveBeenCalledWith(undefined, [
        {
          user: 'user:user-123',
          relation: 'forum_manager',
          object: 'community:comm-123',
        },
      ]);
    });
  });

  describe('createRelationship', () => {
    it('should create relationship between resources', async () => {
      await service.createRelationship(
        'wealth',
        'wealth-123',
        'parent_community',
        'communities',
        'comm-123'
      );

      expect(mockRepository.write).toHaveBeenCalledWith([
        {
          user: 'community:comm-123',
          relation: 'parent_community',
          object: 'wealth:wealth-123',
        },
      ]);
    });
  });

  describe('setInviteRoleMetadata', () => {
    it('should set invite role metadata', async () => {
      await service.setInviteRoleMetadata('invite-123', 'member');

      expect(mockRepository.write).toHaveBeenCalledWith([
        {
          user: 'user:metadata',
          relation: 'grants_member',
          object: 'invite:invite-123',
        },
      ]);
    });
  });

  describe('getInviteRoleMetadata', () => {
    it('should retrieve invite role metadata', async () => {
      mockRepository.check
        .mockResolvedValueOnce(false) // admin
        .mockResolvedValueOnce(true); // member

      const result = await service.getInviteRoleMetadata('invite-123');

      expect(result).toBe('member');
    });

    it('should return null if no metadata found', async () => {
      mockRepository.check.mockResolvedValue(false);

      const result = await service.getInviteRoleMetadata('invite-123');

      expect(result).toBeNull();
    });
  });

  describe('batchWrite', () => {
    it('should write multiple tuples in batch', async () => {
      const writes = [
        {
          user: 'user:user-123',
          relation: 'member',
          object: 'community:comm-123',
        },
      ];
      const deletes = [
        {
          user: 'user:user-456',
          relation: 'member',
          object: 'community:comm-123',
        },
      ];

      await service.batchWrite(writes, deletes);

      expect(mockRepository.write).toHaveBeenCalledWith(writes, deletes);
    });
  });

  describe('syncTrustRoles', () => {
    it('should grant trust roles when trust score meets threshold', async () => {
      // User doesn't have the trust role yet
      mockRepository.check.mockResolvedValue(false);

      const thresholds = {
        trust_forum_manager: 30,
        trust_wealth_creator: 10,
      };

      await service.syncTrustRoles('user-123', 'comm-123', 30, thresholds);

      // Should grant both roles (trust >= 30 and trust >= 10)
      expect(mockRepository.write).toHaveBeenCalledWith(
        expect.arrayContaining([
          {
            user: 'user:user-123',
            relation: 'trust_forum_manager',
            object: 'community:comm-123',
          },
          {
            user: 'user:user-123',
            relation: 'trust_wealth_creator',
            object: 'community:comm-123',
          },
        ]),
        undefined
      );
    });

    it('should revoke trust roles when trust score falls below threshold', async () => {
      // User has the trust role
      mockRepository.check.mockResolvedValue(true);

      const thresholds = {
        trust_forum_manager: 30,
      };

      // User's trust is only 20, below threshold
      await service.syncTrustRoles('user-123', 'comm-123', 20, thresholds);

      // Should revoke the role
      expect(mockRepository.write).toHaveBeenCalledWith(
        undefined,
        expect.arrayContaining([
          {
            user: 'user:user-123',
            relation: 'trust_forum_manager',
            object: 'community:comm-123',
          },
        ])
      );
    });

    it('should skip non-trust roles in thresholds', async () => {
      const thresholds = {
        trust_forum_manager: 30,
        forum_manager: 30, // This should be skipped
      };

      await service.syncTrustRoles('user-123', 'comm-123', 30, thresholds);

      // Should only process trust_forum_manager
      expect(mockRepository.check).toHaveBeenCalledTimes(1);
    });

    it('should handle no changes needed', async () => {
      // User already has correct trust roles
      mockRepository.check.mockResolvedValue(true);

      const thresholds = {
        trust_forum_manager: 30,
      };

      await service.syncTrustRoles('user-123', 'comm-123', 30, thresholds);

      // No writes should be made since role already exists
      expect(mockRepository.write).not.toHaveBeenCalled();
    });
  });

  describe('getAccessibleResourceIds', () => {
    it('should return array of resource IDs user can access', async () => {
      mockRepository.listObjects.mockResolvedValue(['comm-123', 'comm-456']);

      const result = await service.getAccessibleResourceIds('user-123', 'communities', 'read');

      expect(result).toEqual(['comm-123', 'comm-456']);
      expect(mockRepository.listObjects).toHaveBeenCalledWith({
        user: 'user:user-123',
        relation: 'can_read',
        type: 'community',
      });
    });

    it('should return empty array on error', async () => {
      mockRepository.listObjects.mockRejectedValue(new Error('OpenFGA error'));

      const result = await service.getAccessibleResourceIds('user-123', 'communities', 'read');

      expect(result).toEqual([]);
    });
  });
});
