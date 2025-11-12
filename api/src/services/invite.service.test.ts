import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { inviteService } from '@/services/invite.service';
import { inviteRepository } from '@/repositories/invite.repository';
import { openFGAService } from './openfga.service';

import { appUserRepository } from '@/repositories/appUser.repository';

// Mock repositories and services
const mockInviteRepository = {
  createUserInvite: mock(() =>
    Promise.resolve({
      id: 'invite-123',
      communityId: 'comm-123',
      invitedUserId: 'user-456',
      createdBy: 'user-123',
      status: 'pending' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  ),
  createLinkInvite: mock(() =>
    Promise.resolve({
      id: 'invite-123',
      communityId: 'comm-123',
      title: 'Test Link Invite',
      secret: 'secret-123',
      expiresAt: new Date(Date.now() + 86400000),
      createdBy: 'user-123',
      status: 'pending' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  ),
  findInviteById: mock(() => Promise.resolve(null)),
  findUserInviteById: mock(() => Promise.resolve(null)),
  findBySecret: mock(() => Promise.resolve(null)),
  cancelInvite: mock(() =>
    Promise.resolve({
      id: 'invite-123',
      status: 'cancelled' as const,
    })
  ),
  findPendingUserInvitesByCommunity: mock(() => Promise.resolve([])),
  findPendingUserInvitesByUser: mock(() => Promise.resolve([])),
  findActiveLinkInvitesByCommunity: mock(() => Promise.resolve([])),
  markUserInviteRedeemed: mock(() =>
    Promise.resolve({
      id: 'invite-123',
      status: 'redeemed' as const,
    })
  ),
  markLinkInviteRedeemed: mock(() =>
    Promise.resolve({
      id: 'invite-123',
      status: 'redeemed' as const,
    })
  ),
};
const mockAppUserRepository = {
  // app_users.id IS the user ID now (no separate internal ID)
  findById: mock((id: string) => Promise.resolve({ id } as any)),
};

const mockOpenFGAService = {
  getUserBaseRole: mock(() => Promise.resolve('admin')),
  setInviteRoleMetadata: mock(() => Promise.resolve()),
  getInviteRoleMetadata: mock(() => Promise.resolve('member')),
  removeInviteRoleMetadata: mock(() => Promise.resolve()),
  createRelationship: mock(() => Promise.resolve()),
  assignBaseRole: mock(() => Promise.resolve()),
};

describe('InviteService', () => {
  beforeEach(() => {
    // Reset all mocks
    Object.values(mockInviteRepository).forEach((m) => m.mockReset());
    Object.values(mockOpenFGAService).forEach((m) => m.mockReset());

    // Re-seed app user repo mapper impl after reset
    (mockAppUserRepository.findById as any).mockReset?.();
    (mockAppUserRepository.findById as any).mockImplementation((id: string) =>
      Promise.resolve({ id } as any)
    );

    // Replace repository and service methods with mocks
    (inviteRepository.createUserInvite as any) = mockInviteRepository.createUserInvite;
    (inviteRepository.createLinkInvite as any) = mockInviteRepository.createLinkInvite;
    (inviteRepository.findInviteById as any) = mockInviteRepository.findInviteById;
    (inviteRepository.findUserInviteById as any) = mockInviteRepository.findUserInviteById;
    (inviteRepository.findBySecret as any) = mockInviteRepository.findBySecret;
    (inviteRepository.cancelInvite as any) = mockInviteRepository.cancelInvite;
    (inviteRepository.findPendingUserInvitesByCommunity as any) =
      mockInviteRepository.findPendingUserInvitesByCommunity;
    (inviteRepository.findPendingUserInvitesByUser as any) =
      mockInviteRepository.findPendingUserInvitesByUser;
    (inviteRepository.findActiveLinkInvitesByCommunity as any) =
      mockInviteRepository.findActiveLinkInvitesByCommunity;
    (inviteRepository.markUserInviteRedeemed as any) = mockInviteRepository.markUserInviteRedeemed;
    (inviteRepository.markLinkInviteRedeemed as any) = mockInviteRepository.markLinkInviteRedeemed;

    (openFGAService.getUserBaseRole as any) = mockOpenFGAService.getUserBaseRole;
    (openFGAService.setInviteRoleMetadata as any) = mockOpenFGAService.setInviteRoleMetadata;
    (openFGAService.getInviteRoleMetadata as any) = mockOpenFGAService.getInviteRoleMetadata;
    (openFGAService.removeInviteRoleMetadata as any) = mockOpenFGAService.removeInviteRoleMetadata;
    (openFGAService.createRelationship as any) = mockOpenFGAService.createRelationship;
    (openFGAService.assignBaseRole as any) = mockOpenFGAService.assignBaseRole;

    // Wire appUserRepository to mock
    (appUserRepository.findById as any) = mockAppUserRepository.findById;
  });

  describe('createUserInvite', () => {
    it('should throw error when role is missing', async () => {
      await expect(
        inviteService.createUserInvite(
          {
            communityId: 'comm-123',
            invitedUserId: 'user-456',
            role: undefined as any,
          },
          'user-123'
        )
      ).rejects.toThrow('Role is required');
    });

    it('should throw error when role is invalid', async () => {
      await expect(
        inviteService.createUserInvite(
          {
            communityId: 'comm-123',
            invitedUserId: 'user-456',
            role: 'invalid_role' as any,
          },
          'user-123'
        )
      ).rejects.toThrow('Invalid role. Must be one of: admin, member, reader');
    });

    it('should create user invite when requester is admin', async () => {
      mockOpenFGAService.getUserBaseRole.mockResolvedValue('admin');
      mockOpenFGAService.getUserBaseRole
        .mockResolvedValueOnce('admin')
        .mockResolvedValueOnce(undefined as any);
      mockInviteRepository.createUserInvite.mockResolvedValue({
        id: 'invite-123',
        communityId: 'comm-123',
        invitedUserId: 'user-456',
        createdBy: 'user-123',
        status: 'pending' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      const result = await inviteService.createUserInvite(
        {
          communityId: 'comm-123',
          invitedUserId: 'user-456',
          role: 'member',
        },
        'user-123'
      );

      expect(result.id).toBe('invite-123');
      // Response should expose SuperTokens IDs back to the client
      expect((result as any).invitedUserId).toBe('user-456');
      expect((result as any).createdBy).toBe('user-123');

      // Expect the repository to receive user IDs (no longer separate internal IDs)
      expect(mockInviteRepository.createUserInvite).toHaveBeenCalledWith({
        communityId: 'comm-123',
        invitedUserId: 'user-456',
        createdBy: 'user-123',
      });
      expect(mockOpenFGAService.setInviteRoleMetadata).toHaveBeenCalledWith('invite-123', 'member');
    });

    it('should throw forbidden error when requester is not admin', async () => {
      mockOpenFGAService.getUserBaseRole.mockResolvedValue('member');

      await expect(
        inviteService.createUserInvite(
          {
            communityId: 'comm-123',
            invitedUserId: 'user-456',
            role: 'member',
          },
          'user-123'
        )
      ).rejects.toThrow('Forbidden: only community admins can perform this action');
    });

    it('should throw error when user already has the role', async () => {
      mockOpenFGAService.getUserBaseRole
        .mockResolvedValueOnce('admin')
        .mockResolvedValueOnce('member');

      await expect(
        inviteService.createUserInvite(
          {
            communityId: 'comm-123',
            invitedUserId: 'user-456',
            role: 'member',
          },
          'user-123'
        )
      ).rejects.toThrow('User already has this role in the community');
    });

    it('should handle OpenFGA metadata failure', async () => {
      mockOpenFGAService.getUserBaseRole
        .mockResolvedValueOnce('admin')
        .mockResolvedValueOnce(undefined as any);
      mockInviteRepository.createUserInvite.mockResolvedValue({
        id: 'invite-123',
        communityId: 'comm-123',
        invitedUserId: 'user-456',
        createdBy: 'user-123',
        status: 'pending' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);
      mockOpenFGAService.setInviteRoleMetadata.mockRejectedValue(new Error('OpenFGA error'));

      await expect(
        inviteService.createUserInvite(
          {
            communityId: 'comm-123',
            invitedUserId: 'user-456',
            role: 'member',
          },
          'user-123'
        )
      ).rejects.toThrow('Failed to create invite with role metadata');
    });
  });

  describe('createLinkInvite', () => {
    it('should throw error when role is missing', async () => {
      await expect(
        inviteService.createLinkInvite(
          {
            communityId: 'comm-123',
            role: undefined as any,
            expiresAt: new Date(Date.now() + 86400000).toISOString(),
          },
          'user-123'
        )
      ).rejects.toThrow('Role is required');
    });

    it('should throw error when role is invalid', async () => {
      await expect(
        inviteService.createLinkInvite(
          {
            communityId: 'comm-123',
            role: 'superuser' as any,
            expiresAt: new Date(Date.now() + 86400000).toISOString(),
          },
          'user-123'
        )
      ).rejects.toThrow('Invalid role. Must be one of: admin, member, reader');
    });

    it('should create link invite when requester is admin', async () => {
      // Reconfigure mocks for this test
      mockOpenFGAService.getUserBaseRole.mockResolvedValue('admin');
      mockInviteRepository.createLinkInvite.mockResolvedValue({
        id: 'invite-123',
        communityId: 'comm-123',
        title: 'Test Link Invite',
        secret: 'secret-123',
        expiresAt: new Date(Date.now() + 86400000),
        createdBy: 'user-123',
        status: 'pending' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);
      mockOpenFGAService.setInviteRoleMetadata.mockResolvedValue(undefined);

      const expiresAt = new Date(Date.now() + 86400000).toISOString();

      const result = await inviteService.createLinkInvite(
        {
          communityId: 'comm-123',
          role: 'member',
          title: 'Test Link Invite',
          expiresAt,
        },
        'user-123'
      );

      expect(result.id).toBe('invite-123');
      expect(mockInviteRepository.createLinkInvite).toHaveBeenCalled();
      expect(mockOpenFGAService.setInviteRoleMetadata).toHaveBeenCalledWith('invite-123', 'member');
    });

    it('should throw error for invalid expiration date', async () => {
      mockOpenFGAService.getUserBaseRole.mockResolvedValue('admin');

      await expect(
        inviteService.createLinkInvite(
          {
            communityId: 'comm-123',
            role: 'member',
            expiresAt: 'invalid-date',
          },
          'user-123'
        )
      ).rejects.toThrow('expiresAt must be a valid ISO datetime string');
    });

    it('should throw error for past expiration date', async () => {
      mockOpenFGAService.getUserBaseRole.mockResolvedValue('admin');
      const pastDate = new Date(Date.now() - 86400000).toISOString();

      await expect(
        inviteService.createLinkInvite(
          {
            communityId: 'comm-123',
            role: 'member',
            expiresAt: pastDate,
          },
          'user-123'
        )
      ).rejects.toThrow('expiresAt must be in the future');
    });

    it('should throw forbidden error when requester is not admin', async () => {
      mockOpenFGAService.getUserBaseRole.mockResolvedValue('member');
      const expiresAt = new Date(Date.now() + 86400000).toISOString();

      await expect(
        inviteService.createLinkInvite(
          {
            communityId: 'comm-123',
            role: 'member',
            expiresAt,
          },
          'user-123'
        )
      ).rejects.toThrow('Forbidden: only community admins can perform this action');
    });
  });

  describe('cancelInvite', () => {
    it('should allow creator to cancel invite', async () => {
      // Reconfigure mocks for this test
      (mockInviteRepository.findInviteById as any).mockResolvedValue({
        id: 'invite-123',
        communityId: 'comm-123',
        status: 'pending' as const,
        createdBy: 'user-123',
      } as any);
      mockInviteRepository.cancelInvite.mockResolvedValue({
        id: 'invite-123',
        status: 'cancelled' as const,
      } as any);
      mockOpenFGAService.removeInviteRoleMetadata.mockResolvedValue(undefined);

      const result = await inviteService.cancelInvite('invite-123', 'user-123');

      expect(result!.status).toBe('cancelled');
      expect(mockInviteRepository.cancelInvite).toHaveBeenCalledWith('invite-123');
    });

    it('should allow admin to cancel invite created by others', async () => {
      // Reconfigure mocks for this test
      (mockInviteRepository.findInviteById as any).mockResolvedValue({
        id: 'invite-123',
        communityId: 'comm-123',
        status: 'pending' as const,
        createdBy: 'user-456',
      } as any);
      mockOpenFGAService.getUserBaseRole.mockResolvedValue('admin');
      mockInviteRepository.cancelInvite.mockResolvedValue({
        id: 'invite-123',
        status: 'cancelled' as const,
      } as any);
      mockOpenFGAService.removeInviteRoleMetadata.mockResolvedValue(undefined);

      const result = await inviteService.cancelInvite('invite-123', 'user-123');

      expect(result!.status).toBe('cancelled');
    });

    it('should throw error if invite not found', async () => {
      mockInviteRepository.findInviteById.mockResolvedValue(null);

      await expect(inviteService.cancelInvite('invite-123', 'user-123')).rejects.toThrow(
        'Invite not found'
      );
    });

    it('should throw error if invite is not pending', async () => {
      (mockInviteRepository.findInviteById as any).mockResolvedValue({
        id: 'invite-123',
        communityId: 'comm-123',
        status: 'redeemed' as const,
        createdBy: 'user-123',
      } as any);

      await expect(inviteService.cancelInvite('invite-123', 'user-123')).rejects.toThrow(
        'Invite is not pending'
      );
    });

    it('should throw forbidden if non-creator non-admin tries to cancel', async () => {
      (mockInviteRepository.findInviteById as any).mockResolvedValue({
        id: 'invite-123',
        communityId: 'comm-123',
        status: 'pending' as const,
        createdBy: 'user-456',
      } as any);
      mockOpenFGAService.getUserBaseRole.mockResolvedValue('member');

      await expect(inviteService.cancelInvite('invite-123', 'user-123')).rejects.toThrow(
        'Forbidden: only community admins can perform this action'
      );
    });
  });

  describe('getPendingUserInvites', () => {
    it('should return pending invites for community when admin', async () => {
      mockOpenFGAService.getUserBaseRole.mockResolvedValue('admin');
      (mockInviteRepository.findPendingUserInvitesByCommunity as any).mockResolvedValue([
        {
          id: 'invite-123',
          communityId: 'comm-123',
          invitedUserId: 'user-456',
          status: 'pending' as const,
        } as any,
      ]);
      mockOpenFGAService.getInviteRoleMetadata.mockResolvedValue('member');

      const result = await inviteService.getPendingUserInvites('comm-123', 'user-123');

      expect(result).toHaveLength(1);
      expect(result[0].role).toBe('member');
      // Response should expose SuperTokens user id for invitedUserId
      expect((result[0] as any).invitedUserId).toBe('user-456');
    });

    it('should throw forbidden if not admin', async () => {
      mockOpenFGAService.getUserBaseRole.mockResolvedValue('member');

      await expect(inviteService.getPendingUserInvites('comm-123', 'user-123')).rejects.toThrow(
        'Forbidden: only community admins can perform this action'
      );
    });
  });

  describe('getPendingInvitesForUser', () => {
    it('should return pending invites for user', async () => {
      (mockInviteRepository.findPendingUserInvitesByUser as any).mockResolvedValue([
        {
          id: 'invite-123',
          communityId: 'comm-123',
          invitedUserId: 'user-123',
          status: 'pending' as const,
        } as any,
      ]);
      mockOpenFGAService.getInviteRoleMetadata.mockResolvedValue('member');

      const result = await inviteService.getPendingInvitesForUser('user-123', 'user-123');

      expect(result).toHaveLength(1);
      expect(result[0].role).toBe('member');
    });

    it('should throw forbidden if requesting another user invites', async () => {
      await expect(inviteService.getPendingInvitesForUser('user-456', 'user-123')).rejects.toThrow(
        'Forbidden: can only view own invites'
      );
    });
  });

  describe('getActiveLinkInvites', () => {
    it('should return active link invites when admin', async () => {
      mockOpenFGAService.getUserBaseRole.mockResolvedValue('admin');
      (mockInviteRepository.findActiveLinkInvitesByCommunity as any).mockResolvedValue([
        {
          id: 'invite-123',
          communityId: 'comm-123',
          status: 'pending' as const,
        } as any,
      ]);
      mockOpenFGAService.getInviteRoleMetadata.mockResolvedValue('member');

      const result = await inviteService.getActiveLinkInvites('comm-123', 'user-123');

      expect(result).toHaveLength(1);
      expect(result[0].role).toBe('member');
    });

    it('should throw forbidden if not admin', async () => {
      mockOpenFGAService.getUserBaseRole.mockResolvedValue('member');

      await expect(inviteService.getActiveLinkInvites('comm-123', 'user-123')).rejects.toThrow(
        'Forbidden: only community admins can perform this action'
      );
    });
  });

  describe('redeemUserInvite', () => {
    it('should redeem user invite successfully', async () => {
      // Reconfigure mocks for this test
      (mockInviteRepository.findUserInviteById as any).mockResolvedValue({
        id: 'invite-123',
        communityId: 'comm-123',
        invitedUserId: 'user-456',
        status: 'pending' as const,
      } as any);
      mockOpenFGAService.getInviteRoleMetadata.mockResolvedValue('member');
      mockOpenFGAService.assignBaseRole.mockResolvedValue(undefined);
      mockInviteRepository.markUserInviteRedeemed.mockResolvedValue({
        id: 'invite-123',
        status: 'redeemed' as const,
      });
      mockOpenFGAService.removeInviteRoleMetadata.mockResolvedValue(undefined);

      const result = await inviteService.redeemUserInvite('invite-123', 'user-456');

      expect(result.status).toBe('redeemed');
      expect(mockOpenFGAService.assignBaseRole).toHaveBeenCalledWith(
        'user-456',
        'community',
        'comm-123',
        'member'
      );
      expect(mockOpenFGAService.removeInviteRoleMetadata).toHaveBeenCalledWith('invite-123');
    });

    it('should throw error if invite not found', async () => {
      mockInviteRepository.findUserInviteById.mockResolvedValue(null);

      await expect(inviteService.redeemUserInvite('invite-123', 'user-456')).rejects.toThrow(
        'Invite not found'
      );
    });

    it('should throw error if invite is not pending', async () => {
      (mockInviteRepository.findUserInviteById as any).mockResolvedValue({
        id: 'invite-123',
        communityId: 'comm-123',
        invitedUserId: 'user-456',
        status: 'redeemed' as const,
      } as any);

      await expect(inviteService.redeemUserInvite('invite-123', 'user-456')).rejects.toThrow(
        'Invite is not pending'
      );
    });

    it('should throw forbidden if invite not for this user', async () => {
      (mockInviteRepository.findUserInviteById as any).mockResolvedValue({
        id: 'invite-123',
        communityId: 'comm-123',
        invitedUserId: 'user-456',
        status: 'pending' as const,
      } as any);

      await expect(inviteService.redeemUserInvite('invite-123', 'user-789')).rejects.toThrow(
        'Forbidden: invite not meant for this user'
      );
    });

    it('should throw error if role metadata not found', async () => {
      (mockInviteRepository.findUserInviteById as any).mockResolvedValue({
        id: 'invite-123',
        communityId: 'comm-123',
        invitedUserId: 'user-456',
        status: 'pending' as const,
      } as any);
      mockOpenFGAService.getInviteRoleMetadata.mockResolvedValue(undefined as any);

      await expect(inviteService.redeemUserInvite('invite-123', 'user-456')).rejects.toThrow(
        'Invite role metadata not found'
      );
    });
  });

  describe('redeemLinkInviteBySecret', () => {
    it('should redeem link invite successfully', async () => {
      // Reconfigure mocks for this test
      const futureDate = new Date(Date.now() + 86400000);
      (mockInviteRepository.findBySecret as any).mockResolvedValue({
        id: 'invite-123',
        communityId: 'comm-123',
        secret: 'secret-123',
        status: 'pending' as const,
        expiresAt: futureDate,
      } as any);
      mockOpenFGAService.getInviteRoleMetadata.mockResolvedValue('member');
      mockOpenFGAService.assignBaseRole.mockResolvedValue(undefined);
      mockInviteRepository.markLinkInviteRedeemed.mockResolvedValue({
        id: 'invite-123',
        status: 'redeemed' as const,
      });

      const result = await inviteService.redeemLinkInviteBySecret('secret-123', 'user-456');

      expect(result.status).toBe('redeemed');
      expect(mockOpenFGAService.assignBaseRole).toHaveBeenCalledWith(
        'user-456',
        'community',
        'comm-123',
        'member'
      );
    });

    it('should throw error if invite not found', async () => {
      mockInviteRepository.findBySecret.mockResolvedValue(null);

      await expect(
        inviteService.redeemLinkInviteBySecret('secret-123', 'user-456')
      ).rejects.toThrow('Invite not found');
    });

    it('should throw error if invite has expired', async () => {
      const pastDate = new Date(Date.now() - 86400000);
      (mockInviteRepository.findBySecret as any).mockResolvedValue({
        id: 'invite-123',
        communityId: 'comm-123',
        secret: 'secret-123',
        status: 'pending' as const,
        expiresAt: pastDate,
      } as any);

      await expect(
        inviteService.redeemLinkInviteBySecret('secret-123', 'user-456')
      ).rejects.toThrow('Invite has expired');
    });

    it('should throw error if missing expiration', async () => {
      (mockInviteRepository.findBySecret as any).mockResolvedValue({
        id: 'invite-123',
        communityId: 'comm-123',
        secret: 'secret-123',
        status: 'pending' as const,
        expiresAt: null,
      } as any);

      await expect(
        inviteService.redeemLinkInviteBySecret('secret-123', 'user-456')
      ).rejects.toThrow('Invalid invite: missing expiration');
    });

    it('should throw error if role metadata not found', async () => {
      const futureDate = new Date(Date.now() + 86400000);
      (mockInviteRepository.findBySecret as any).mockResolvedValue({
        id: 'invite-123',
        communityId: 'comm-123',
        secret: 'secret-123',
        status: 'pending' as const,
        expiresAt: futureDate,
      } as any);
      mockOpenFGAService.getInviteRoleMetadata.mockResolvedValue(undefined as any);

      await expect(
        inviteService.redeemLinkInviteBySecret('secret-123', 'user-456')
      ).rejects.toThrow('Invite role metadata not found');
    });
  });
});
