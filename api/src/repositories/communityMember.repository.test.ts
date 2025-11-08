import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { CommunityMemberRepository } from '@/repositories/communityMember.repository';

let communityMemberRepository: CommunityMemberRepository;

// Static test data
const testCommunityId = 'comm-123';
const testUserId = 'user-456';
const testAdminId = 'user-admin';
const testReaderId = 'user-reader';

// Mock openFGAService
const mockOpenFGAService = {
  assignRole: mock(() => Promise.resolve()),
  getRolesForResource: mock(() => Promise.resolve([])),
  getAccessibleResourceIds: mock(() => Promise.resolve([])),
  getUserRoleForResource: mock(() => Promise.resolve(null)),
  removeRole: mock(() => Promise.resolve()),
  getUserRolesForResource: mock(() => Promise.resolve([])),
};

describe('CommunityMemberRepository', () => {
  beforeEach(() => {
    // Reset all mocks
    Object.values(mockOpenFGAService).forEach((m) => m.mockReset());

    // Set default mock responses
    mockOpenFGAService.assignRole.mockResolvedValue(undefined);
    mockOpenFGAService.getRolesForResource.mockResolvedValue([]);
    mockOpenFGAService.getAccessibleResourceIds.mockResolvedValue([]);
    mockOpenFGAService.getUserRoleForResource.mockResolvedValue(null);
    mockOpenFGAService.removeRole.mockResolvedValue(undefined);
    mockOpenFGAService.getUserRolesForResource.mockResolvedValue([]);

    // Instantiate repository with the per-test mock openFGAService
    communityMemberRepository = new CommunityMemberRepository(mockOpenFGAService as any);
  });

  describe('Type Validation', () => {
    it('should have correct method signatures', () => {
      expect(typeof communityMemberRepository.addMember).toBe('function');
      expect(typeof communityMemberRepository.findByCommunity).toBe('function');
      expect(typeof communityMemberRepository.findByUser).toBe('function');
      expect(typeof communityMemberRepository.updateRole).toBe('function');
      expect(typeof communityMemberRepository.removeMember).toBe('function');
      expect(typeof communityMemberRepository.isMember).toBe('function');
      expect(typeof communityMemberRepository.getUserRole).toBe('function');
      expect(typeof communityMemberRepository.getUserRoles).toBe('function');
      expect(typeof communityMemberRepository.isAdmin).toBe('function');
    });
  });

  describe('addMember', () => {
    it('should add member with default role', async () => {
      const result = await communityMemberRepository.addMember(testCommunityId, testUserId);

      expect(result).toBeDefined();
      expect(result.userId).toBe(testUserId);
      expect(result.resourceType).toBe('communities');
      expect(result.resourceId).toBe(testCommunityId);
      expect(result.role).toBe('member');
      expect(mockOpenFGAService.assignRole).toHaveBeenCalledWith(
        testUserId,
        'communities',
        testCommunityId,
        'member'
      );
    });

    it('should add member with admin role', async () => {
      const result = await communityMemberRepository.addMember(
        testCommunityId,
        testAdminId,
        'admin'
      );

      expect(result).toBeDefined();
      expect(result.userId).toBe(testAdminId);
      expect(result.role).toBe('admin');
      expect(mockOpenFGAService.assignRole).toHaveBeenCalledWith(
        testAdminId,
        'communities',
        testCommunityId,
        'admin'
      );
    });

    it('should add member with reader role', async () => {
      const result = await communityMemberRepository.addMember(
        testCommunityId,
        testReaderId,
        'reader'
      );

      expect(result).toBeDefined();
      expect(result.userId).toBe(testReaderId);
      expect(result.role).toBe('reader');
      expect(mockOpenFGAService.assignRole).toHaveBeenCalledWith(
        testReaderId,
        'communities',
        testCommunityId,
        'reader'
      );
    });

    it('should return membership object', async () => {
      const result = await communityMemberRepository.addMember(testCommunityId, testUserId);

      expect(result).toHaveProperty('userId');
      expect(result).toHaveProperty('resourceType');
      expect(result).toHaveProperty('resourceId');
      expect(result).toHaveProperty('role');
    });
  });

  describe('findByCommunity', () => {
    it('should return array of members', async () => {
      mockOpenFGAService.getRolesForResource.mockResolvedValue([
        { userId: testUserId, role: 'member' },
        { userId: testAdminId, role: 'admin' },
      ]);

      const result = await communityMemberRepository.findByCommunity(testCommunityId);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
      expect(mockOpenFGAService.getRolesForResource).toHaveBeenCalledWith(
        'communities',
        testCommunityId
      );
    });

    it('should return members with roles', async () => {
      mockOpenFGAService.getRolesForResource.mockResolvedValue([
        { userId: testUserId, role: 'member' },
        { userId: testAdminId, role: 'admin' },
      ]);

      const result = await communityMemberRepository.findByCommunity(testCommunityId);

      expect(Array.isArray(result)).toBe(true);
      result.forEach((member) => {
        expect(member).toHaveProperty('userId');
        expect(member).toHaveProperty('resourceType');
        expect(member).toHaveProperty('resourceId');
        expect(member).toHaveProperty('role');
      });
    });

    it('should return empty array for community with no members', async () => {
      mockOpenFGAService.getRolesForResource.mockResolvedValue([]);

      const result = await communityMemberRepository.findByCommunity('comm-empty');

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    it('should return correct resourceType for all members', async () => {
      mockOpenFGAService.getRolesForResource.mockResolvedValue([
        { userId: testUserId, role: 'member' },
        { userId: testAdminId, role: 'admin' },
      ]);

      const result = await communityMemberRepository.findByCommunity(testCommunityId);

      result.forEach((member) => {
        expect(member.resourceType).toBe('communities');
        expect(member.resourceId).toBe(testCommunityId);
      });
    });
  });

  describe('findByUser', () => {
    it('should return array of communities', async () => {
      mockOpenFGAService.getAccessibleResourceIds.mockResolvedValue([testCommunityId, 'comm-456']);

      const result = await communityMemberRepository.findByUser(testUserId);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
      expect(mockOpenFGAService.getAccessibleResourceIds).toHaveBeenCalledWith(
        testUserId,
        'communities',
        'read'
      );
    });

    it('should return communities with membership info', async () => {
      mockOpenFGAService.getAccessibleResourceIds.mockResolvedValue([testCommunityId]);

      const result = await communityMemberRepository.findByUser(testUserId);

      expect(Array.isArray(result)).toBe(true);
      result.forEach((membership) => {
        expect(membership).toHaveProperty('userId');
        expect(membership).toHaveProperty('resourceType');
        expect(membership).toHaveProperty('resourceId');
        expect(membership).toHaveProperty('role');
      });
    });

    it('should return empty array for user with no memberships', async () => {
      mockOpenFGAService.getAccessibleResourceIds.mockResolvedValue([]);

      const result = await communityMemberRepository.findByUser('user-no-communities');

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    it('should return correct resourceType for all memberships', async () => {
      mockOpenFGAService.getAccessibleResourceIds.mockResolvedValue([testCommunityId, 'comm-456']);

      const result = await communityMemberRepository.findByUser(testUserId);

      result.forEach((membership) => {
        expect(membership.resourceType).toBe('communities');
        expect(membership.userId).toBe(testUserId);
      });
    });
  });

  describe('updateRole', () => {
    it('should update member role to admin', async () => {
      const result = await communityMemberRepository.updateRole(
        testCommunityId,
        testUserId,
        'admin'
      );

      expect(result).toBeDefined();
      expect(result.role).toBe('admin');
      expect(result.userId).toBe(testUserId);
      expect(result.resourceId).toBe(testCommunityId);
      expect(mockOpenFGAService.assignRole).toHaveBeenCalledWith(
        testUserId,
        'communities',
        testCommunityId,
        'admin'
      );
    });

    it('should update member role to reader', async () => {
      const result = await communityMemberRepository.updateRole(
        testCommunityId,
        testUserId,
        'reader'
      );

      expect(result).toBeDefined();
      expect(result.role).toBe('reader');
      expect(mockOpenFGAService.assignRole).toHaveBeenCalledWith(
        testUserId,
        'communities',
        testCommunityId,
        'reader'
      );
    });

    it('should update member role to member', async () => {
      const result = await communityMemberRepository.updateRole(
        testCommunityId,
        testUserId,
        'member'
      );

      expect(result).toBeDefined();
      expect(result.role).toBe('member');
      expect(mockOpenFGAService.assignRole).toHaveBeenCalledWith(
        testUserId,
        'communities',
        testCommunityId,
        'member'
      );
    });

    it('should return membership object after update', async () => {
      const result = await communityMemberRepository.updateRole(
        testCommunityId,
        testUserId,
        'admin'
      );

      expect(result).toHaveProperty('userId');
      expect(result).toHaveProperty('resourceType');
      expect(result).toHaveProperty('resourceId');
      expect(result).toHaveProperty('role');
    });
  });

  describe('removeMember', () => {
    it('should remove member from community', async () => {
      mockOpenFGAService.getUserRoleForResource.mockResolvedValue('member');

      const result = await communityMemberRepository.removeMember(testCommunityId, testUserId);

      expect(result).toBeDefined();
      expect(result.userId).toBe(testUserId);
      expect(result.resourceId).toBe(testCommunityId);
      expect(mockOpenFGAService.getUserRoleForResource).toHaveBeenCalledWith(
        testUserId,
        'communities',
        testCommunityId
      );
      expect(mockOpenFGAService.removeRole).toHaveBeenCalledWith(
        testUserId,
        'communities',
        testCommunityId
      );
    });

    it('should return membership info on removal', async () => {
      mockOpenFGAService.getUserRoleForResource.mockResolvedValue('admin');

      const result = await communityMemberRepository.removeMember(testCommunityId, testUserId);

      expect(result).toHaveProperty('userId');
      expect(result).toHaveProperty('resourceType');
      expect(result).toHaveProperty('resourceId');
      expect(result).toHaveProperty('role');
      expect(result.role).toBe('admin');
    });

    it('should handle removing nonexistent member gracefully', async () => {
      mockOpenFGAService.getUserRoleForResource.mockResolvedValue(null);

      const result = await communityMemberRepository.removeMember(
        testCommunityId,
        'user-nonexistent'
      );

      expect(result).toBeDefined();
      expect(result.role).toBeNull();
      expect(mockOpenFGAService.removeRole).toHaveBeenCalled();
    });
  });

  describe('isMember', () => {
    it('should return true for existing member', async () => {
      mockOpenFGAService.getUserRoleForResource.mockResolvedValue('member');

      const result = await communityMemberRepository.isMember(testCommunityId, testUserId);

      expect(result).toBe(true);
      expect(mockOpenFGAService.getUserRoleForResource).toHaveBeenCalledWith(
        testUserId,
        'communities',
        testCommunityId
      );
    });

    it('should return false for non-member', async () => {
      mockOpenFGAService.getUserRoleForResource.mockResolvedValue(null);

      const result = await communityMemberRepository.isMember(testCommunityId, 'user-not-member');

      expect(result).toBe(false);
    });

    it('should return true for admin', async () => {
      mockOpenFGAService.getUserRoleForResource.mockResolvedValue('admin');

      const result = await communityMemberRepository.isMember(testCommunityId, testAdminId);

      expect(result).toBe(true);
    });

    it('should return true for reader', async () => {
      mockOpenFGAService.getUserRoleForResource.mockResolvedValue('reader');

      const result = await communityMemberRepository.isMember(testCommunityId, testReaderId);

      expect(result).toBe(true);
    });

    it('should return boolean', async () => {
      mockOpenFGAService.getUserRoleForResource.mockResolvedValue(null);

      const result = await communityMemberRepository.isMember(testCommunityId, testUserId);

      expect(typeof result).toBe('boolean');
    });
  });

  describe('getUserRole', () => {
    it('should return admin role', async () => {
      mockOpenFGAService.getUserRoleForResource.mockResolvedValue('admin');

      const result = await communityMemberRepository.getUserRole(testCommunityId, testAdminId);

      expect(result).toBe('admin');
      expect(mockOpenFGAService.getUserRoleForResource).toHaveBeenCalledWith(
        testAdminId,
        'communities',
        testCommunityId
      );
    });

    it('should return member role', async () => {
      mockOpenFGAService.getUserRoleForResource.mockResolvedValue('member');

      const result = await communityMemberRepository.getUserRole(testCommunityId, testUserId);

      expect(result).toBe('member');
    });

    it('should return reader role', async () => {
      mockOpenFGAService.getUserRoleForResource.mockResolvedValue('reader');

      const result = await communityMemberRepository.getUserRole(testCommunityId, testReaderId);

      expect(result).toBe('reader');
    });

    it('should return null for non-member', async () => {
      mockOpenFGAService.getUserRoleForResource.mockResolvedValue(null);

      const result = await communityMemberRepository.getUserRole(testCommunityId, 'user-no-role');

      expect(result).toBeNull();
    });

    it('should return string or null', async () => {
      mockOpenFGAService.getUserRoleForResource.mockResolvedValue('member');

      const result = await communityMemberRepository.getUserRole(testCommunityId, testUserId);

      expect(result === null || typeof result === 'string').toBe(true);
    });
  });

  describe('getUserRoles', () => {
    it('should return array of roles', async () => {
      mockOpenFGAService.getUserRolesForResource.mockResolvedValue(['admin', 'member']);

      const result = await communityMemberRepository.getUserRoles(testCommunityId, testAdminId);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
      expect(mockOpenFGAService.getUserRolesForResource).toHaveBeenCalledWith(
        testAdminId,
        'communities',
        testCommunityId
      );
    });

    it('should return empty array for non-member', async () => {
      mockOpenFGAService.getUserRolesForResource.mockResolvedValue([]);

      const result = await communityMemberRepository.getUserRoles(testCommunityId, 'user-no-roles');

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    it('should include admin role', async () => {
      mockOpenFGAService.getUserRolesForResource.mockResolvedValue(['admin']);

      const result = await communityMemberRepository.getUserRoles(testCommunityId, testAdminId);

      expect(Array.isArray(result)).toBe(true);
      expect(result).toContain('admin');
    });

    it('should include member role', async () => {
      mockOpenFGAService.getUserRolesForResource.mockResolvedValue(['member']);

      const result = await communityMemberRepository.getUserRoles(testCommunityId, testUserId);

      expect(Array.isArray(result)).toBe(true);
      expect(result).toContain('member');
    });
  });

  describe('isAdmin', () => {
    it('should return true for admin', async () => {
      mockOpenFGAService.getUserRoleForResource.mockResolvedValue('admin');

      const result = await communityMemberRepository.isAdmin(testCommunityId, testAdminId);

      expect(result).toBe(true);
      expect(mockOpenFGAService.getUserRoleForResource).toHaveBeenCalledWith(
        testAdminId,
        'communities',
        testCommunityId
      );
    });

    it('should return false for member', async () => {
      mockOpenFGAService.getUserRoleForResource.mockResolvedValue('member');

      const result = await communityMemberRepository.isAdmin(testCommunityId, testUserId);

      expect(result).toBe(false);
    });

    it('should return false for reader', async () => {
      mockOpenFGAService.getUserRoleForResource.mockResolvedValue('reader');

      const result = await communityMemberRepository.isAdmin(testCommunityId, testReaderId);

      expect(result).toBe(false);
    });

    it('should return false for non-member', async () => {
      mockOpenFGAService.getUserRoleForResource.mockResolvedValue(null);

      const result = await communityMemberRepository.isAdmin(testCommunityId, 'user-no-admin');

      expect(result).toBe(false);
    });

    it('should return boolean', async () => {
      mockOpenFGAService.getUserRoleForResource.mockResolvedValue(null);

      const result = await communityMemberRepository.isAdmin(testCommunityId, testUserId);

      expect(typeof result).toBe('boolean');
    });
  });

  describe('Role validation', () => {
    it('should accept valid role types', () => {
      const roles: Array<'member' | 'admin' | 'reader'> = ['member', 'admin', 'reader'];

      roles.forEach((role) => {
        expect(['member', 'admin', 'reader']).toContain(role);
      });
    });

    it('should handle role as string literal', () => {
      const memberRole: 'member' = 'member';
      const adminRole: 'admin' = 'admin';
      const readerRole: 'reader' = 'reader';

      expect(memberRole).toBe('member');
      expect(adminRole).toBe('admin');
      expect(readerRole).toBe('reader');
    });
  });

  describe('Edge cases', () => {
    it('should handle UUID format community IDs', async () => {
      const communityId = '550e8400-e29b-41d4-a716-446655440000';

      const result = await communityMemberRepository.addMember(communityId, testUserId);

      expect(result.resourceId).toBe(communityId);
    });

    it('should handle UUID format user IDs', async () => {
      const userId = '660e8400-e29b-41d4-a716-446655440000';

      const result = await communityMemberRepository.addMember(testCommunityId, userId);

      expect(result.userId).toBe(userId);
    });

    it('should handle empty community members list', async () => {
      mockOpenFGAService.getRolesForResource.mockResolvedValue([]);

      const result = await communityMemberRepository.findByCommunity('comm-empty');

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    it('should handle user with no communities', async () => {
      mockOpenFGAService.getAccessibleResourceIds.mockResolvedValue([]);

      const result = await communityMemberRepository.findByUser('user-no-comm');

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });
  });

  describe('Integration scenarios', () => {
    it('should handle community with mixed roles', async () => {
      mockOpenFGAService.getRolesForResource.mockResolvedValue([
        { userId: testAdminId, role: 'admin' },
        { userId: testUserId, role: 'member' },
        { userId: testReaderId, role: 'reader' },
      ]);

      const members = await communityMemberRepository.findByCommunity(testCommunityId);

      expect(members.length).toBe(3);
      expect(members.find((m) => m.userId === testAdminId)?.role).toBe('admin');
      expect(members.find((m) => m.userId === testUserId)?.role).toBe('member');
      expect(members.find((m) => m.userId === testReaderId)?.role).toBe('reader');
    });

    it('should handle user in multiple communities', async () => {
      mockOpenFGAService.getAccessibleResourceIds.mockResolvedValue(['comm-1', 'comm-2', 'comm-3']);

      const communities = await communityMemberRepository.findByUser(testUserId);

      expect(communities.length).toBe(3);
      communities.forEach((c) => {
        expect(c.userId).toBe(testUserId);
        expect(c.resourceType).toBe('communities');
      });
    });
  });
});
