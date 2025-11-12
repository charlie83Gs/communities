import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { InviteRepository } from '@/repositories/invite.repository';
import { createThenableMockDb, setupMockDbChains } from '../../tests/helpers/mockDb';

let inviteRepository: InviteRepository;

// Create mock database
const mockDb = createThenableMockDb();

const testUserInvite = {
  id: 'invite-123',
  communityId: 'comm-123',
  invitedUserId: 'user-456',
  status: 'pending' as const,
  createdBy: 'user-123',
  redeemedBy: null,
  redeemedAt: null,
  cancelledAt: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

const testLinkInvite = {
  id: 'link-123',
  communityId: 'comm-123',
  title: 'Open Invite',
  secret: 'secret-token-123',
  expiresAt: new Date('2024-12-31'),
  status: 'pending' as const,
  createdBy: 'user-123',
  redeemedBy: null,
  redeemedAt: null,
  cancelledAt: null,
  usageCount: 0,
  usageLimit: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

describe('InviteRepository', () => {
  beforeEach(() => {
    // Reset all mocks and setup default chains
    setupMockDbChains(mockDb);
    // Instantiate repository with the per-test mock DB
    inviteRepository = new InviteRepository(mockDb);
  });

  afterEach(() => {
    // Nothing to clean up; a fresh InviteRepository is created per test
  });

  describe('User Invites', () => {
    describe('createUserInvite', () => {
      it('should create a user invite', async () => {
        mockDb.returning.mockResolvedValue([testUserInvite]);

        const result = await inviteRepository.createUserInvite({
          communityId: 'comm-123',
          invitedUserId: 'user-456',
          createdBy: 'user-123',
        });

        expect(result).toEqual(testUserInvite);
        expect(mockDb.insert).toHaveBeenCalled();
        expect(mockDb.values).toHaveBeenCalled();
        expect(mockDb.returning).toHaveBeenCalled();
      });
    });

    describe('findUserInviteById', () => {
      it('should find user invite by id', async () => {
        mockDb.where.mockResolvedValue([testUserInvite]);

        const result = await inviteRepository.findUserInviteById('invite-123');

        expect(result).toEqual(testUserInvite);
        expect(mockDb.select).toHaveBeenCalled();
        expect(mockDb.where).toHaveBeenCalled();
      });

      it('should return undefined if not found', async () => {
        mockDb.where.mockResolvedValue([]);

        const result = await inviteRepository.findUserInviteById('nonexistent');

        expect(result).toBeUndefined();
      });
    });

    describe('markUserInviteRedeemed', () => {
      it('should mark user invite as redeemed', async () => {
        const redeemedInvite = {
          ...testUserInvite,
          status: 'redeemed' as const,
          redeemedBy: 'user-456',
          redeemedAt: new Date(),
        };
        mockDb.returning.mockResolvedValue([redeemedInvite]);

        const result = await inviteRepository.markUserInviteRedeemed('invite-123', 'user-456');

        expect(result?.status).toBe('redeemed');
        expect(result?.redeemedBy).toBe('user-456');
        expect(result?.redeemedAt).not.toBeNull();
        expect(mockDb.update).toHaveBeenCalled();
        expect(mockDb.set).toHaveBeenCalled();
      });

      it('should return undefined if invite not found', async () => {
        mockDb.returning.mockResolvedValue([]);

        const result = await inviteRepository.markUserInviteRedeemed('nonexistent', 'user-456');

        expect(result).toBeUndefined();
      });
    });

    describe('cancelUserInvite', () => {
      it('should cancel user invite', async () => {
        const cancelledInvite = {
          ...testUserInvite,
          status: 'cancelled' as const,
          cancelledAt: new Date(),
        };
        mockDb.returning.mockResolvedValue([cancelledInvite]);

        const result = await inviteRepository.cancelUserInvite('invite-123');

        expect(result?.status).toBe('cancelled');
        expect(result?.cancelledAt).not.toBeNull();
        expect(mockDb.update).toHaveBeenCalled();
      });
    });
  });

  describe('Link Invites', () => {
    describe('createLinkInvite', () => {
      it('should create a link invite', async () => {
        mockDb.returning.mockResolvedValue([testLinkInvite]);

        const result = await inviteRepository.createLinkInvite({
          communityId: 'comm-123',
          title: 'Open Invite',
          secret: 'secret-token-123',
          expiresAt: new Date('2024-12-31'),
          createdBy: 'user-123',
        });

        expect(result).toEqual(testLinkInvite);
        expect(mockDb.insert).toHaveBeenCalled();
        expect(mockDb.values).toHaveBeenCalled();
      });

      it('should create link invite without title', async () => {
        const inviteWithoutTitle = { ...testLinkInvite, title: undefined };
        mockDb.returning.mockResolvedValue([inviteWithoutTitle]);

        const result = await inviteRepository.createLinkInvite({
          communityId: 'comm-123',
          secret: 'secret-token-123',
          expiresAt: new Date('2024-12-31'),
          createdBy: 'user-123',
        });

        expect(result.title).toBeUndefined();
      });
    });

    describe('findLinkInviteById', () => {
      it('should find link invite by id', async () => {
        mockDb.where.mockResolvedValue([testLinkInvite]);

        const result = await inviteRepository.findLinkInviteById('link-123');

        expect(result).toEqual(testLinkInvite);
        expect(mockDb.select).toHaveBeenCalled();
        expect(mockDb.where).toHaveBeenCalled();
      });

      it('should return undefined if not found', async () => {
        mockDb.where.mockResolvedValue([]);

        const result = await inviteRepository.findLinkInviteById('nonexistent');

        expect(result).toBeUndefined();
      });
    });

    describe('findBySecret', () => {
      it('should find link invite by secret', async () => {
        mockDb.where.mockResolvedValue([testLinkInvite]);

        const result = await inviteRepository.findBySecret('secret-token-123');

        expect(result).toEqual(testLinkInvite);
        expect(mockDb.where).toHaveBeenCalled();
      });

      it('should return undefined if secret not found', async () => {
        mockDb.where.mockResolvedValue([]);

        const result = await inviteRepository.findBySecret('invalid-secret');

        expect(result).toBeUndefined();
      });
    });

    describe('markLinkInviteRedeemed', () => {
      it('should mark link invite as redeemed', async () => {
        const redeemedInvite = {
          ...testLinkInvite,
          status: 'redeemed' as const,
          redeemedBy: 'user-789',
          redeemedAt: new Date(),
        };
        mockDb.returning.mockResolvedValue([redeemedInvite]);

        const result = await inviteRepository.markLinkInviteRedeemed('link-123', 'user-789');

        expect(result?.status).toBe('redeemed');
        expect(result?.redeemedBy).toBe('user-789');
        expect(mockDb.update).toHaveBeenCalled();
      });
    });

    describe('cancelLinkInvite', () => {
      it('should cancel link invite', async () => {
        const cancelledInvite = {
          ...testLinkInvite,
          status: 'cancelled' as const,
          cancelledAt: new Date(),
        };
        mockDb.returning.mockResolvedValue([cancelledInvite]);

        const result = await inviteRepository.cancelLinkInvite('link-123');

        expect(result?.status).toBe('cancelled');
        expect(result?.cancelledAt).not.toBeNull();
      });
    });
  });

  describe('Generic Invite Operations', () => {
    describe('findInviteById', () => {
      it('should find user invite first', async () => {
        mockDb.where.mockResolvedValueOnce([testUserInvite]);

        const result = await inviteRepository.findInviteById('invite-123');

        expect(result).toEqual(testUserInvite);
      });

      it('should fall back to link invite if user invite not found', async () => {
        mockDb.where.mockResolvedValueOnce([]);
        mockDb.where.mockResolvedValueOnce([testLinkInvite]);

        const result = await inviteRepository.findInviteById('link-123');

        expect(result).toEqual(testLinkInvite);
      });

      it('should return undefined if neither type found', async () => {
        mockDb.where.mockResolvedValue([]);

        const result = await inviteRepository.findInviteById('nonexistent');

        expect(result).toBeUndefined();
      });
    });

    describe('markInviteRedeemed', () => {
      it('should mark user invite as redeemed', async () => {
        const redeemedInvite = {
          ...testUserInvite,
          status: 'redeemed' as const,
          redeemedBy: 'user-456',
        };
        mockDb.where.mockResolvedValueOnce([testUserInvite]);
        mockDb.returning.mockResolvedValue([redeemedInvite]);

        const result = await inviteRepository.markInviteRedeemed('invite-123', 'user-456');

        expect(result?.status).toBe('redeemed');
      });

      it('should mark link invite as redeemed', async () => {
        const redeemedInvite = {
          ...testLinkInvite,
          status: 'redeemed' as const,
          redeemedBy: 'user-789',
        };
        mockDb.where.mockResolvedValueOnce([]);
        mockDb.where.mockResolvedValueOnce([testLinkInvite]);
        mockDb.returning.mockResolvedValue([redeemedInvite]);

        const result = await inviteRepository.markInviteRedeemed('link-123', 'user-789');

        expect(result?.status).toBe('redeemed');
      });

      it('should return undefined if invite not found', async () => {
        mockDb.where.mockResolvedValue([]);

        const result = await inviteRepository.markInviteRedeemed('nonexistent', 'user-123');

        expect(result).toBeUndefined();
      });
    });

    describe('cancelInvite', () => {
      it('should cancel user invite', async () => {
        const cancelledInvite = {
          ...testUserInvite,
          status: 'cancelled' as const,
        };
        mockDb.where.mockResolvedValueOnce([testUserInvite]);
        mockDb.returning.mockResolvedValue([cancelledInvite]);

        const result = await inviteRepository.cancelInvite('invite-123');

        expect(result?.status).toBe('cancelled');
      });

      it('should cancel link invite', async () => {
        const cancelledInvite = {
          ...testLinkInvite,
          status: 'cancelled' as const,
        };
        mockDb.where.mockResolvedValueOnce([]);
        mockDb.where.mockResolvedValueOnce([testLinkInvite]);
        mockDb.returning.mockResolvedValue([cancelledInvite]);

        const result = await inviteRepository.cancelInvite('link-123');

        expect(result?.status).toBe('cancelled');
      });

      it('should return undefined if invite not found', async () => {
        mockDb.where.mockResolvedValue([]);

        const result = await inviteRepository.cancelInvite('nonexistent');

        expect(result).toBeUndefined();
      });
    });
  });

  describe('Expiration Operations', () => {
    describe('expirePastDueLinkInvites', () => {
      it('should expire past due link invites', async () => {
        // Mock the update operation to return rowCount
        const mockResult = { rowCount: 5 };
        mockDb.where.mockResolvedValue(mockResult);

        const result = await inviteRepository.expirePastDueLinkInvites(new Date('2024-06-01'));

        expect(result).toBe(5);
        expect(mockDb.update).toHaveBeenCalled();
        expect(mockDb.set).toHaveBeenCalled();
        expect(mockDb.where).toHaveBeenCalled();
      });

      it('should return 0 if no invites to expire', async () => {
        const mockResult = { rowCount: 0 };
        mockDb.where.mockResolvedValue(mockResult);

        const result = await inviteRepository.expirePastDueLinkInvites();

        expect(result).toBe(0);
      });

      it('should use current date by default', async () => {
        const mockResult = { rowCount: 2 };
        mockDb.where.mockResolvedValue(mockResult);

        const _result = await inviteRepository.expirePastDueLinkInvites();

        expect(mockDb.update).toHaveBeenCalled();
      });
    });

    describe('expirePastDue', () => {
      it('should call expirePastDueLinkInvites', async () => {
        const mockResult = { rowCount: 3 };
        mockDb.where.mockResolvedValue(mockResult);

        const result = await inviteRepository.expirePastDue(new Date('2024-06-01'));

        expect(result).toBe(3);
        expect(mockDb.update).toHaveBeenCalled();
      });
    });
  });

  describe('Query Operations', () => {
    describe('findPendingUserInvitesByUser', () => {
      it('should list user invites for a user', async () => {
        mockDb.orderBy.mockResolvedValue([testUserInvite]);

        const result = await inviteRepository.findPendingUserInvitesByUser('user-456');

        expect(result).toHaveLength(1);
        expect(result[0]).toEqual(testUserInvite);
        expect(mockDb.where).toHaveBeenCalled();
        expect(mockDb.orderBy).toHaveBeenCalled();
      });

      it('should return empty array if no invites', async () => {
        mockDb.orderBy.mockResolvedValue([]);

        const result = await inviteRepository.findPendingUserInvitesByUser('user-999');

        expect(result).toHaveLength(0);
      });
    });

    describe('findActiveLinkInvitesByCommunity', () => {
      it('should list link invites for a community', async () => {
        mockDb.orderBy.mockResolvedValue([testLinkInvite]);

        const result = await inviteRepository.findActiveLinkInvitesByCommunity('comm-123');

        expect(result).toHaveLength(1);
        expect(result[0]).toEqual(testLinkInvite);
        expect(mockDb.where).toHaveBeenCalled();
      });

      it('should return empty array if no invites', async () => {
        mockDb.orderBy.mockResolvedValue([]);

        const result = await inviteRepository.findActiveLinkInvitesByCommunity('comm-999');

        expect(result).toHaveLength(0);
      });
    });

    describe('findPendingUserInvitesByCommunity', () => {
      it('should list user invites for a community', async () => {
        mockDb.orderBy.mockResolvedValue([testUserInvite]);

        const result = await inviteRepository.findPendingUserInvitesByCommunity('comm-123');

        expect(result).toHaveLength(1);
        expect(result[0]).toEqual(testUserInvite);
      });
    });
  });
});
