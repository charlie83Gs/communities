import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { communityService } from '@/services/community.service';
import { communityRepository } from '@/repositories/community.repository';
import { communityMemberRepository } from '@/repositories/communityMember.repository';
import { appUserRepository } from '@repositories/appUser.repository';
import { trustViewRepository } from '@/repositories/trustView.repository';
import { openFGAService } from '@/services/openfga.service';

import { testData } from '../../tests/helpers/testUtils';

// Mock repositories
const mockCommunityRepository = {
  create: mock(() => Promise.resolve(testData.community as any)),
  findById: mock(() => Promise.resolve(testData.community as any)),
  update: mock(() => Promise.resolve(testData.community as any)),
  delete: mock(() => Promise.resolve(testData.community as any)),
  search: mock(() => Promise.resolve({ rows: [testData.community], total: 1 } as any)),
};

const mockCommunityMemberRepository = {
  addMember: mock(() => Promise.resolve() as any),
  getUserRole: mock(() => Promise.resolve('admin' as any)),
  getUserRoles: mock(() => Promise.resolve(['admin'] as any)),
  isAdmin: mock(() => Promise.resolve(true)),
  findByUser: mock(() => Promise.resolve([{ resourceId: 'comm-123', role: 'admin' }] as any)),
  findByCommunity: mock(() => Promise.resolve([{ userId: 'user-123', role: 'admin' }] as any)),
  removeMember: mock(() => Promise.resolve() as any),
  updateRole: mock(() => Promise.resolve() as any),
};

const mockAppUserRepository = {
  findById: mock(() =>
    Promise.resolve({
      id: 'user-123',
      email: 'test@example.com',
      username: 'testuser',
      displayName: 'Test User',
      country: null,
      stateProvince: null,
      city: null,
      description: null,
      profileImage: null,
      lastSeenAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any)
  ),
};

const mockTrustViewRepository = {
  getBatchForUser: mock(() => Promise.resolve(new Map([['comm-123', 25]]) as any)),
  get: mock(() => Promise.resolve({ points: 25 } as any)),
};

const mockOpenFGAService = {
  syncTrustRoles: mock(() => Promise.resolve() as any),
};

describe('CommunityService', () => {
  beforeEach(() => {
    // Reset all mocks
    Object.values(mockCommunityRepository).forEach((m) => m.mockReset());
    Object.values(mockCommunityMemberRepository).forEach((m) => m.mockReset());
    Object.values(mockAppUserRepository).forEach((m) => m.mockReset());
    Object.values(mockTrustViewRepository).forEach((m) => m.mockReset());
    Object.values(mockOpenFGAService).forEach((m) => m.mockReset());

    // Replace repository methods with mocks
    (communityRepository.create as any) = mockCommunityRepository.create;
    (communityRepository.findById as any) = mockCommunityRepository.findById;
    (communityRepository.update as any) = mockCommunityRepository.update;
    (communityRepository.delete as any) = mockCommunityRepository.delete;
    (communityRepository.search as any) = mockCommunityRepository.search;

    (communityMemberRepository.addMember as any) = mockCommunityMemberRepository.addMember;
    (communityMemberRepository.getUserRole as any) = mockCommunityMemberRepository.getUserRole;
    (communityMemberRepository.getUserRoles as any) = mockCommunityMemberRepository.getUserRoles;
    (communityMemberRepository.isAdmin as any) = mockCommunityMemberRepository.isAdmin;
    (communityMemberRepository.findByUser as any) = mockCommunityMemberRepository.findByUser;
    (communityMemberRepository.findByCommunity as any) =
      mockCommunityMemberRepository.findByCommunity;
    (communityMemberRepository.removeMember as any) = mockCommunityMemberRepository.removeMember;
    (communityMemberRepository.updateRole as any) = mockCommunityMemberRepository.updateRole;

    (appUserRepository.findById as any) = mockAppUserRepository.findById;

    (trustViewRepository.getBatchForUser as any) = mockTrustViewRepository.getBatchForUser;
    (trustViewRepository.get as any) = mockTrustViewRepository.get;

    (openFGAService.syncTrustRoles as any) = mockOpenFGAService.syncTrustRoles;
  });

  describe('createCommunity', () => {
    it('should create a community and assign creator as admin', async () => {
      mockAppUserRepository.findById.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        displayName: 'Test User',
        country: null,
        stateProvince: null,
        city: null,
        description: null,
        profileImage: null,
        lastSeenAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockCommunityRepository.create.mockResolvedValue(testData.community);
      mockCommunityMemberRepository.addMember.mockResolvedValue(undefined);
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('admin');

      const result = await communityService.createCommunity(
        { name: 'Test Community', description: 'Test' },
        'user-123'
      );

      expect(result).toEqual(testData.community as any);
      expect(mockCommunityRepository.create).toHaveBeenCalledWith({
        name: 'Test Community',
        description: 'Test',
        createdBy: 'user-123',
      } as any);
      expect(mockCommunityMemberRepository.addMember).toHaveBeenCalledWith(
        'comm-123',
        'user-123',
        'admin'
      );
      expect(mockCommunityMemberRepository.getUserRole).toHaveBeenCalledWith(
        'comm-123',
        'user-123'
      );
    });

    it('should rollback community creation if admin role assignment fails', async () => {
      mockAppUserRepository.findById.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        displayName: 'Test User',
        country: null,
        stateProvince: null,
        city: null,
        description: null,
        profileImage: null,
        lastSeenAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockCommunityRepository.create.mockResolvedValue(testData.community);
      mockCommunityMemberRepository.addMember.mockRejectedValue(
        new Error('Role assignment failed')
      );
      mockCommunityRepository.delete.mockResolvedValue(testData.community);

      await expect(
        communityService.createCommunity(
          { name: 'Test Community', description: 'Test' },
          'user-123'
        )
      ).rejects.toThrow('Failed to create community: could not assign creator as admin');

      expect(mockCommunityRepository.delete).toHaveBeenCalledWith('comm-123');
    });

    it('should throw error if role verification fails', async () => {
      mockAppUserRepository.findById.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        displayName: 'Test User',
        country: null,
        stateProvince: null,
        city: null,
        description: null,
        profileImage: null,
        lastSeenAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockCommunityRepository.create.mockResolvedValue(testData.community);
      mockCommunityMemberRepository.addMember.mockResolvedValue(undefined);
      mockCommunityMemberRepository.getUserRole.mockResolvedValue(null as any);

      await expect(
        communityService.createCommunity(
          { name: 'Test Community', description: 'Test' },
          'user-123'
        )
      ).rejects.toThrow('Failed to create community: role assignment verification failed');
    });
  });

  describe('getCommunity', () => {
    it('should return community if user has access', async () => {
      mockCommunityRepository.findById.mockResolvedValue(testData.community);
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');

      const result = await communityService.getCommunity('comm-123', 'user-123');

      expect(result).toEqual(testData.community as any);
      expect(mockCommunityRepository.findById).toHaveBeenCalledWith('comm-123');
      expect(mockCommunityMemberRepository.getUserRole).toHaveBeenCalledWith(
        'comm-123',
        'user-123'
      ) as any;
    });

    it('should throw 404 if community not found', async () => {
      mockCommunityRepository.findById.mockResolvedValue(null as any);

      await expect(communityService.getCommunity('comm-123', 'user-123')).rejects.toThrow(
        'Community not found'
      );
    });

    it('should throw 401 if no userId provided', async () => {
      mockCommunityRepository.findById.mockResolvedValue(testData.community);

      await expect(communityService.getCommunity('comm-123', undefined)).rejects.toThrow(
        'Authentication required'
      );
    });

    it('should throw 403 if user has no role in community', async () => {
      mockCommunityRepository.findById.mockResolvedValue(testData.community);
      mockCommunityMemberRepository.getUserRole.mockResolvedValue(null as any);

      await expect(communityService.getCommunity('comm-123', 'user-123')).rejects.toThrow(
        'Forbidden: no access to this community'
      );
    });
  });

  describe('listCommunities', () => {
    it('should return empty list for guest users', async () => {
      const result = await communityService.listCommunities(1, 10, undefined);

      expect(result).toEqual({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
      });
    });

    it('should return communities user is member of', async () => {
      mockCommunityMemberRepository.findByUser.mockResolvedValue([
        { resourceId: 'comm-123', role: 'admin' },
      ]);
      mockCommunityRepository.findById.mockResolvedValue(testData.community);

      const result = await communityService.listCommunities(1, 10, 'user-123');

      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toEqual(testData.community as any);
      expect(result.total).toBe(1);
    });

    it('should handle pagination correctly', async () => {
      mockCommunityMemberRepository.findByUser.mockResolvedValue([
        { resourceId: 'comm-123', role: 'admin' },
      ]);
      mockCommunityRepository.findById.mockResolvedValue(testData.community);

      const result = await communityService.listCommunities(2, 5, 'user-123');

      expect(result.page).toBe(2);
      expect(result.limit).toBe(5);
    });
  });

  describe('searchCommunities', () => {
    it('should search communities for authenticated user and include trust scores', async () => {
      mockCommunityMemberRepository.findByUser.mockResolvedValue([
        { resourceId: 'comm-123', role: 'admin' },
      ]);
      mockCommunityRepository.search.mockResolvedValue({
        rows: [testData.community],
        total: 1,
      });
      mockAppUserRepository.findById.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        displayName: 'Test User',
        country: null,
        stateProvince: null,
        city: null,
        description: null,
        profileImage: null,
        lastSeenAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockTrustViewRepository.getBatchForUser.mockResolvedValue(new Map([['comm-123', 25]]));

      const result = await communityService.searchCommunities('user-123', {
        q: 'test',
        page: 1,
        limit: 10,
      });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.data[0].userTrustScore).toBe(25);
      expect(mockCommunityRepository.search).toHaveBeenCalledWith({
        q: 'test',
        accessibleIds: ['comm-123'],
        limit: 10,
        offset: 0,
      });
      expect(mockTrustViewRepository.getBatchForUser).toHaveBeenCalledWith(
        ['comm-123'],
        'user-123'
      );
    });

    it('should set null trust score when user has no trust in community', async () => {
      mockCommunityMemberRepository.findByUser.mockResolvedValue([
        { resourceId: 'comm-123', role: 'admin' },
      ]);
      mockCommunityRepository.search.mockResolvedValue({
        rows: [testData.community],
        total: 1,
      });
      mockAppUserRepository.findById.mockResolvedValue({
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        displayName: 'Test User',
        country: null,
        stateProvince: null,
        city: null,
        description: null,
        profileImage: null,
        lastSeenAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockTrustViewRepository.getBatchForUser.mockResolvedValue(new Map()); // No trust score

      const result = await communityService.searchCommunities('user-123', {
        q: 'test',
        page: 1,
        limit: 10,
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0].userTrustScore).toBeNull();
    });

    it('should search without accessible IDs for guest users', async () => {
      mockCommunityRepository.search.mockResolvedValue({
        rows: [],
        total: 0,
      });

      const result = await communityService.searchCommunities(undefined, {
        q: 'test',
      });

      expect(mockCommunityRepository.search).toHaveBeenCalledWith({
        q: 'test',
        accessibleIds: undefined,
        limit: 20,
        offset: 0,
      });
      expect(result.data).toHaveLength(0);
      // Trust scores should not be fetched for unauthenticated users
      expect(mockTrustViewRepository.getBatchForUser).not.toHaveBeenCalled();
    });

    it('should handle empty search results', async () => {
      mockCommunityMemberRepository.findByUser.mockResolvedValue([
        { resourceId: 'comm-123', role: 'admin' },
      ]);
      mockCommunityRepository.search.mockResolvedValue({
        rows: [],
        total: 0,
      });

      const result = await communityService.searchCommunities('user-123', {
        q: 'nonexistent',
      });

      expect(result.data).toHaveLength(0);
      // Trust scores should not be fetched for empty results
      expect(mockTrustViewRepository.getBatchForUser).not.toHaveBeenCalled();
    });
  });

  describe('updateCommunity', () => {
    it('should update community if user is admin', async () => {
      mockCommunityMemberRepository.isAdmin.mockResolvedValue(true);
      mockCommunityRepository.findById.mockResolvedValue(testData.community);
      mockCommunityRepository.update.mockResolvedValue({
        ...testData.community,
        name: 'Updated Community',
      });

      const result = await communityService.updateCommunity(
        'comm-123',
        { name: 'Updated Community' },
        'user-123'
      );

      expect(result.name).toBe('Updated Community');
      expect(mockCommunityRepository.update).toHaveBeenCalledWith('comm-123', {
        name: 'Updated Community',
      });
    });

    it('should throw 403 if user is not admin', async () => {
      mockCommunityMemberRepository.isAdmin.mockResolvedValue(false);

      await expect(
        communityService.updateCommunity('comm-123', { name: 'Updated Community' }, 'user-123')
      ).rejects.toThrow('Forbidden: only community admins can update');
    });

    it('should throw 404 if community not found before update', async () => {
      mockCommunityMemberRepository.isAdmin.mockResolvedValue(true);
      mockCommunityRepository.findById.mockResolvedValue(null as any);

      await expect(
        communityService.updateCommunity('comm-123', { name: 'Updated Community' }, 'user-123')
      ).rejects.toThrow('Community not found');
    });

    it('should throw 404 if community not found after update', async () => {
      mockCommunityMemberRepository.isAdmin.mockResolvedValue(true);
      mockCommunityRepository.findById.mockResolvedValue(testData.community);
      mockCommunityRepository.update.mockResolvedValue(null as any);

      await expect(
        communityService.updateCommunity('comm-123', { name: 'Updated Community' }, 'user-123')
      ).rejects.toThrow('Community not found');
    });

    it('should recalculate trust roles when trust thresholds change', async () => {
      const currentCommunity = {
        ...testData.community,
        minTrustForWealth: { type: 'number', value: 10 },
      };
      const updatedCommunity = {
        ...testData.community,
        minTrustForWealth: { type: 'number', value: 15 },
      };

      mockCommunityMemberRepository.isAdmin.mockResolvedValue(true);
      mockCommunityRepository.findById
        .mockResolvedValueOnce(currentCommunity) // Before update
        .mockResolvedValueOnce(updatedCommunity); // For recalculation
      mockCommunityRepository.update.mockResolvedValue(updatedCommunity);
      mockCommunityMemberRepository.findByCommunity.mockResolvedValue([
        { userId: 'user-1', role: 'member' },
        { userId: 'user-2', role: 'member' },
      ]);
      mockTrustViewRepository.get
        .mockResolvedValueOnce({ points: 12 })
        .mockResolvedValueOnce({ points: 18 });
      mockOpenFGAService.syncTrustRoles.mockResolvedValue(undefined);

      const result = await communityService.updateCommunity(
        'comm-123',
        { minTrustForWealth: { type: 'number', value: 15 } },
        'user-123'
      );

      expect(result.minTrustForWealth).toEqual({ type: 'number', value: 15 });
      expect(mockCommunityMemberRepository.findByCommunity).toHaveBeenCalledWith('comm-123');
      expect(mockTrustViewRepository.get).toHaveBeenCalledTimes(2);
      expect(mockOpenFGAService.syncTrustRoles).toHaveBeenCalledTimes(2);
      expect(mockOpenFGAService.syncTrustRoles).toHaveBeenCalledWith(
        'user-1',
        'comm-123',
        12,
        expect.any(Object)
      );
      expect(mockOpenFGAService.syncTrustRoles).toHaveBeenCalledWith(
        'user-2',
        'comm-123',
        18,
        expect.any(Object)
      );
    });

    it('should not recalculate trust roles when non-trust fields change', async () => {
      mockCommunityMemberRepository.isAdmin.mockResolvedValue(true);
      mockCommunityRepository.findById.mockResolvedValue(testData.community);
      mockCommunityRepository.update.mockResolvedValue({
        ...testData.community,
        name: 'Updated Community',
      });

      await communityService.updateCommunity('comm-123', { name: 'Updated Community' }, 'user-123');

      expect(mockCommunityMemberRepository.findByCommunity).not.toHaveBeenCalled();
      expect(mockOpenFGAService.syncTrustRoles).not.toHaveBeenCalled();
    });

    it('should handle errors during trust role recalculation gracefully', async () => {
      const currentCommunity = {
        ...testData.community,
        minTrustForWealth: { type: 'number', value: 10 },
      };
      const updatedCommunity = {
        ...testData.community,
        minTrustForWealth: { type: 'number', value: 15 },
      };

      mockCommunityMemberRepository.isAdmin.mockResolvedValue(true);
      mockCommunityRepository.findById
        .mockResolvedValueOnce(currentCommunity)
        .mockResolvedValueOnce(updatedCommunity);
      mockCommunityRepository.update.mockResolvedValue(updatedCommunity);
      mockCommunityMemberRepository.findByCommunity.mockResolvedValue([
        { userId: 'user-1', role: 'member' },
      ]);
      mockTrustViewRepository.get.mockResolvedValue({ points: 12 });
      mockOpenFGAService.syncTrustRoles.mockRejectedValue(new Error('OpenFGA error'));

      // Should not throw - error should be caught and logged
      const result = await communityService.updateCommunity(
        'comm-123',
        { minTrustForWealth: { type: 'number', value: 15 } },
        'user-123'
      );

      expect(result).toBeDefined();
      expect(result.minTrustForWealth).toEqual({ type: 'number', value: 15 });
    });

    it('should recalculate for multiple trust threshold changes', async () => {
      const currentCommunity = {
        ...testData.community,
        minTrustForWealth: { type: 'number', value: 10 },
        minTrustForPolls: { type: 'number', value: 15 },
      };
      const updatedCommunity = {
        ...testData.community,
        minTrustForWealth: { type: 'number', value: 12 },
        minTrustForPolls: { type: 'number', value: 18 },
      };

      mockCommunityMemberRepository.isAdmin.mockResolvedValue(true);
      mockCommunityRepository.findById
        .mockResolvedValueOnce(currentCommunity)
        .mockResolvedValueOnce(updatedCommunity);
      mockCommunityRepository.update.mockResolvedValue(updatedCommunity);
      mockCommunityMemberRepository.findByCommunity.mockResolvedValue([
        { userId: 'user-1', role: 'member' },
      ]);
      mockTrustViewRepository.get.mockResolvedValue({ points: 14 });
      mockOpenFGAService.syncTrustRoles.mockResolvedValue(undefined);

      await communityService.updateCommunity(
        'comm-123',
        {
          minTrustForWealth: { type: 'number', value: 12 },
          minTrustForPolls: { type: 'number', value: 18 },
        },
        'user-123'
      );

      expect(mockOpenFGAService.syncTrustRoles).toHaveBeenCalledWith(
        'user-1',
        'comm-123',
        14,
        expect.any(Object)
      );
    });
  });

  describe('deleteCommunity', () => {
    it('should delete community if user is admin', async () => {
      mockCommunityMemberRepository.isAdmin.mockResolvedValue(true);
      mockCommunityRepository.delete.mockResolvedValue(testData.community);

      const result = await communityService.deleteCommunity('comm-123', 'user-123');

      expect(result).toEqual(testData.community as any);
      expect(mockCommunityRepository.delete).toHaveBeenCalledWith('comm-123');
    });

    it('should throw 403 if user is not admin', async () => {
      mockCommunityMemberRepository.isAdmin.mockResolvedValue(false);

      await expect(communityService.deleteCommunity('comm-123', 'user-123')).rejects.toThrow(
        'Forbidden: only community admins can delete'
      );
    });
  });

  describe('getMembers', () => {
    it('should return members if user is admin', async () => {
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('admin');
      mockCommunityMemberRepository.findByCommunity.mockResolvedValue([
        { userId: 'user-123', role: 'admin' },
        { userId: 'user-456', role: 'member' },
      ]);
      (mockCommunityMemberRepository.getUserRoles.mockImplementation as any)(
        async (_: any, userId: any) => {
          return userId === 'user-123' ? ['admin'] : ['member'];
        }
      );
      (mockAppUserRepository.findById.mockImplementation as any)(async (userId: any) => {
        return userId === 'user-123' ? testData.user : { ...testData.user, id: userId };
      });

      const result = await communityService.getMembers('comm-123', 'user-123');

      expect(result).toHaveLength(2);
      expect(result[0].roles).toContain('admin');
      expect(result[1].roles).toContain('member');
    });

    it('should return members if user is member', async () => {
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');
      mockCommunityMemberRepository.findByCommunity.mockResolvedValue([
        { userId: 'user-123', role: 'member' },
      ]);
      mockCommunityMemberRepository.getUserRoles.mockResolvedValue(['member']);
      mockAppUserRepository.findById.mockResolvedValue(testData.user);

      const result = await communityService.getMembers('comm-123', 'user-123');

      expect(result).toHaveLength(1);
    });

    it('should throw 403 if user is only reader', async () => {
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('reader');

      await expect(communityService.getMembers('comm-123', 'user-123')).rejects.toThrow(
        'Forbidden: only community admins and members can view members'
      );
    });

    it('should throw 403 if user has no role', async () => {
      mockCommunityMemberRepository.getUserRole.mockResolvedValue(null as any);

      await expect(communityService.getMembers('comm-123', 'user-123')).rejects.toThrow(
        'Forbidden: only community admins and members can view members'
      );
    });
  });

  describe('removeMember', () => {
    it('should allow admin to remove another member', async () => {
      mockCommunityMemberRepository.isAdmin.mockResolvedValue(true);
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');
      mockCommunityMemberRepository.removeMember.mockResolvedValue(undefined);
      mockCommunityMemberRepository.getUserRole
        .mockResolvedValueOnce('member')
        .mockResolvedValueOnce(null); // After removal

      await communityService.removeMember('comm-123', 'user-456', 'user-123');

      expect(mockCommunityMemberRepository.removeMember).toHaveBeenCalledWith(
        'comm-123',
        'user-456'
      );
    });

    it('should allow user to remove themselves', async () => {
      mockCommunityMemberRepository.isAdmin.mockResolvedValue(false);
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');
      mockCommunityMemberRepository.removeMember.mockResolvedValue(undefined);
      mockCommunityMemberRepository.getUserRole
        .mockResolvedValueOnce('member')
        .mockResolvedValueOnce(null);

      await communityService.removeMember('comm-123', 'user-123', 'user-123');

      expect(mockCommunityMemberRepository.removeMember).toHaveBeenCalledWith(
        'comm-123',
        'user-123'
      );
    });

    it('should throw 403 if non-admin tries to remove another member', async () => {
      mockCommunityMemberRepository.isAdmin.mockResolvedValue(false);

      await expect(
        communityService.removeMember('comm-123', 'user-456', 'user-123')
      ).rejects.toThrow('Forbidden: only community admins can remove other members');
    });

    it('should throw 404 if target user is not a member', async () => {
      mockCommunityMemberRepository.isAdmin.mockResolvedValue(true);
      mockCommunityMemberRepository.getUserRole.mockResolvedValue(null as any);

      await expect(
        communityService.removeMember('comm-123', 'user-456', 'user-123')
      ).rejects.toThrow('User is not a member of this community');
    });

    it('should throw 500 if removal fails', async () => {
      mockCommunityMemberRepository.isAdmin.mockResolvedValue(true);
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');
      mockCommunityMemberRepository.removeMember.mockResolvedValue(undefined);
      mockCommunityMemberRepository.getUserRole
        .mockResolvedValueOnce('member')
        .mockResolvedValueOnce('member'); // Still has role after removal

      await expect(
        communityService.removeMember('comm-123', 'user-456', 'user-123')
      ).rejects.toThrow('Failed to remove member');
    });
  });

  describe('updateMemberRole', () => {
    it('should allow admin to update member role', async () => {
      mockCommunityMemberRepository.isAdmin.mockResolvedValue(true);
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');
      mockCommunityMemberRepository.updateRole.mockResolvedValue(undefined);

      await communityService.updateMemberRole('comm-123', 'user-456', 'admin', 'user-123');

      expect(mockCommunityMemberRepository.updateRole).toHaveBeenCalledWith(
        'comm-123',
        'user-456',
        'admin'
      );
    });

    it('should throw 403 if non-admin tries to update role', async () => {
      mockCommunityMemberRepository.isAdmin.mockResolvedValue(false);

      await expect(
        communityService.updateMemberRole('comm-123', 'user-456', 'admin', 'user-123')
      ).rejects.toThrow('Forbidden: only community admins can update member roles');
    });

    it('should throw 404 if target user is not a member', async () => {
      mockCommunityMemberRepository.isAdmin.mockResolvedValue(true);
      mockCommunityMemberRepository.getUserRole.mockResolvedValue(null as any);

      await expect(
        communityService.updateMemberRole('comm-123', 'user-456', 'admin', 'user-123')
      ).rejects.toThrow('User is not a member of this community');
    });
  });

  describe('getUserRoleInCommunity', () => {
    it('should return user role for self', async () => {
      mockCommunityMemberRepository.getUserRoles.mockResolvedValue(['member']);
      mockAppUserRepository.findById.mockResolvedValue(testData.user);

      const result = await communityService.getUserRoleInCommunity(
        'comm-123',
        'user-123',
        'user-123'
      );

      expect(result).not.toBeNull();
      expect(result?.roles).toContain('member');
      expect(result?.userId).toBe('user-123');
    });

    it('should allow admin to view another user role', async () => {
      mockCommunityMemberRepository.isAdmin.mockResolvedValue(true);
      mockCommunityMemberRepository.getUserRoles.mockResolvedValue(['member']);
      mockAppUserRepository.findById.mockResolvedValue({
        ...testData.user,
        id: 'user-456',
      });

      const result = await communityService.getUserRoleInCommunity(
        'comm-123',
        'user-456',
        'user-123'
      );

      expect(result).not.toBeNull();
      expect(result?.userId).toBe('user-456');
    });

    it('should throw 403 if non-admin tries to view another user role', async () => {
      mockCommunityMemberRepository.isAdmin.mockResolvedValue(false);

      await expect(
        communityService.getUserRoleInCommunity('comm-123', 'user-456', 'user-123')
      ).rejects.toThrow('Forbidden: only admins can view other members roles');
    });

    it('should return null if user has no roles', async () => {
      mockCommunityMemberRepository.getUserRoles.mockResolvedValue([]);

      const result = await communityService.getUserRoleInCommunity(
        'comm-123',
        'user-123',
        'user-123'
      );

      expect(result).toBeNull();
    });
  });
});
