import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { trustService } from '@/services/trust.service';
import { communityRepository } from '@/repositories/community.repository';
import { communityMemberRepository } from '@/repositories/communityMember.repository';
import { trustEventRepository } from '@/repositories/trustEvent.repository';
import { trustViewRepository } from '@/repositories/trustView.repository';
import { trustAwardRepository } from '@/repositories/trustAward.repository';
import { adminTrustGrantRepository } from '@/repositories/adminTrustGrant.repository';
import { trustHistoryRepository } from '@/repositories/trustHistory.repository';
import { trustLevelRepository } from '@/repositories/trustLevel.repository';
import { openFGAService } from '@/services/openfga.service';
import { AppError } from '@/utils/errors';

// Mock repositories
const mockCommunityRepository = {
  findById: mock(() =>
    Promise.resolve({
      id: 'comm-123',
      name: 'Test Community',
      minTrustToAwardTrust: { type: 'number', value: 15 },
      minTrustForWealth: { type: 'number', value: 10 },
      minTrustForDisputes: { type: 'number', value: 20 },
      minTrustForPolls: { type: 'number', value: 15 },
    })
  ),
};

const mockCommunityMemberRepository = {
  getUserRole: mock(() => Promise.resolve('member')),
  getUserRoles: mock(() => Promise.resolve(['member'])),
  isAdmin: mock(() => Promise.resolve(false)),
};

const mockTrustEventRepository = {
  listByUser: mock(() => Promise.resolve([])),
  listByUserB: mock(() => Promise.resolve([])),
  listByUserAllCommunities: mock(() => Promise.resolve([])),
  create: mock(() => Promise.resolve({ id: 'event-123' })),
};

const mockTrustViewRepository = {
  get: mock(() =>
    Promise.resolve({
      communityId: 'comm-123',
      userId: 'user-123',
      points: 10,
    })
  ),
  listByCommunity: mock(() => Promise.resolve([])),
  listByUser: mock(() => Promise.resolve([])),
  upsertZero: mock(() => Promise.resolve()),
  adjustPoints: mock(() => Promise.resolve()),
  recalculatePoints: mock(() => Promise.resolve()),
};

const mockTrustAwardRepository = {
  hasAward: mock(() => Promise.resolve(false)),
  createAward: mock(() => Promise.resolve({ id: 'award-123' })),
  deleteAward: mock(() => Promise.resolve({ id: 'award-123' })),
  listUserAwards: mock(() => Promise.resolve([])),
  listAwardsToUser: mock(() => Promise.resolve([])),
};

const mockAdminTrustGrantRepository = {
  getGrant: mock(() => Promise.resolve(null)),
  upsertGrant: mock(() => Promise.resolve({ id: 'grant-123' })),
  deleteGrant: mock(() => Promise.resolve({ id: 'grant-123' })),
  listAllGrants: mock(() => Promise.resolve([])),
};

const mockTrustHistoryRepository = {
  logAction: mock(() => Promise.resolve({ id: 'history-123' })),
  getHistoryForUser: mock(() => Promise.resolve([])),
};

const mockTrustLevelRepository = {
  findByCommunityId: mock(() => Promise.resolve([])),
};

const mockOpenFGAService = {
  checkAccess: mock(() => Promise.resolve(true)),
  syncTrustRoles: mock(() => Promise.resolve()),
};

describe('TrustService', () => {
  beforeEach(() => {
    // Reset all mocks
    Object.values(mockCommunityRepository).forEach((m) => m.mockReset());
    Object.values(mockCommunityMemberRepository).forEach((m) => m.mockReset());
    Object.values(mockTrustEventRepository).forEach((m) => m.mockReset());
    Object.values(mockTrustViewRepository).forEach((m) => m.mockReset());
    Object.values(mockTrustAwardRepository).forEach((m) => m.mockReset());
    Object.values(mockAdminTrustGrantRepository).forEach((m) => m.mockReset());
    Object.values(mockTrustHistoryRepository).forEach((m) => m.mockReset());
    Object.values(mockTrustLevelRepository).forEach((m) => m.mockReset());
    Object.values(mockOpenFGAService).forEach((m) => m.mockReset());

    // Replace repository methods with mocks
    (communityRepository.findById as any) = mockCommunityRepository.findById;
    (communityMemberRepository.getUserRole as any) = mockCommunityMemberRepository.getUserRole;
    (communityMemberRepository.getUserRoles as any) = mockCommunityMemberRepository.getUserRoles;
    (communityMemberRepository.isAdmin as any) = mockCommunityMemberRepository.isAdmin;
    (trustEventRepository.listByUser as any) = mockTrustEventRepository.listByUser;
    (trustEventRepository.listByUserB as any) = mockTrustEventRepository.listByUserB;
    (trustEventRepository.listByUserAllCommunities as any) =
      mockTrustEventRepository.listByUserAllCommunities;
    (trustEventRepository.create as any) = mockTrustEventRepository.create;
    (trustViewRepository.get as any) = mockTrustViewRepository.get;
    (trustViewRepository.listByCommunity as any) = mockTrustViewRepository.listByCommunity;
    (trustViewRepository.listByUser as any) = mockTrustViewRepository.listByUser;
    (trustViewRepository.upsertZero as any) = mockTrustViewRepository.upsertZero;
    (trustViewRepository.adjustPoints as any) = mockTrustViewRepository.adjustPoints;
    (trustViewRepository.recalculatePoints as any) = mockTrustViewRepository.recalculatePoints;
    (trustAwardRepository.hasAward as any) = mockTrustAwardRepository.hasAward;
    (trustAwardRepository.createAward as any) = mockTrustAwardRepository.createAward;
    (trustAwardRepository.deleteAward as any) = mockTrustAwardRepository.deleteAward;
    (trustAwardRepository.listUserAwards as any) = mockTrustAwardRepository.listUserAwards;
    (trustAwardRepository.listAwardsToUser as any) = mockTrustAwardRepository.listAwardsToUser;
    (adminTrustGrantRepository.getGrant as any) = mockAdminTrustGrantRepository.getGrant;
    (adminTrustGrantRepository.upsertGrant as any) = mockAdminTrustGrantRepository.upsertGrant;
    (adminTrustGrantRepository.deleteGrant as any) = mockAdminTrustGrantRepository.deleteGrant;
    (adminTrustGrantRepository.listAllGrants as any) = mockAdminTrustGrantRepository.listAllGrants;
    (trustHistoryRepository.logAction as any) = mockTrustHistoryRepository.logAction;
    (trustHistoryRepository.getHistoryForUser as any) =
      mockTrustHistoryRepository.getHistoryForUser;
    (trustLevelRepository.findByCommunityId as any) = mockTrustLevelRepository.findByCommunityId;
    (openFGAService.checkAccess as any) = mockOpenFGAService.checkAccess;
    (openFGAService.syncTrustRoles as any) = mockOpenFGAService.syncTrustRoles;
  });

  describe('isTrusted', () => {
    it('should return true for admin', async () => {
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('admin');
      mockTrustViewRepository.get.mockResolvedValue({ points: 0 });

      const result = await trustService.isTrusted('comm-123', 'user-123');

      expect(result).toBe(true);
    });

    it('should return true for user with trust points', async () => {
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');
      mockTrustViewRepository.get.mockResolvedValue({ points: 10 });

      const result = await trustService.isTrusted('comm-123', 'user-123');

      expect(result).toBe(true);
    });

    it('should return false for user without trust points', async () => {
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');
      mockTrustViewRepository.get.mockResolvedValue({ points: 0 });

      const result = await trustService.isTrusted('comm-123', 'user-123');

      expect(result).toBe(false);
    });
  });

  describe('getEventsForUser', () => {
    it('should return events for member', async () => {
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');
      mockTrustEventRepository.listByUser.mockResolvedValue([
        { id: 'event-1', createdAt: new Date() },
      ]);
      mockTrustEventRepository.listByUserB.mockResolvedValue([
        { id: 'event-2', createdAt: new Date() },
      ]);

      const result = await trustService.getEventsForUser('comm-123', 'user-123', 'user-456', 1, 10);

      expect(result.length).toBeGreaterThan(0);
    });

    it('should throw forbidden for non-member', async () => {
      mockCommunityMemberRepository.getUserRole.mockResolvedValue(null);

      await expect(
        trustService.getEventsForUser('comm-123', 'user-123', 'user-456')
      ).rejects.toThrow('Forbidden: not a member of this community');
    });
  });

  describe('getTrustView', () => {
    it('should return trust view for member', async () => {
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');
      mockTrustViewRepository.get.mockResolvedValue({
        communityId: 'comm-123',
        userId: 'user-123',
        points: 15,
        updatedAt: new Date(),
      });

      const result = await trustService.getTrustView('comm-123', 'user-123', 'user-456');

      expect(result.points).toBe(15);
    });

    it('should return zero points if no view exists', async () => {
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');
      mockTrustViewRepository.get.mockResolvedValue(null);

      const result = await trustService.getTrustView('comm-123', 'user-123', 'user-456');

      expect(result.points).toBe(0);
    });

    it('should throw forbidden for non-member', async () => {
      mockCommunityMemberRepository.getUserRole.mockResolvedValue(null);

      await expect(trustService.getTrustView('comm-123', 'user-123', 'user-456')).rejects.toThrow(
        'Forbidden: not a member of this community'
      );
    });
  });

  describe('listCommunityTrust', () => {
    it('should return community trust list for member', async () => {
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');
      mockTrustViewRepository.listByCommunity.mockResolvedValue([
        { communityId: 'comm-123', userId: 'user-123', points: 10 },
      ]);

      const result = await trustService.listCommunityTrust('comm-123', 'user-123', 1, 10);

      expect(result).toHaveLength(1);
    });

    it('should throw forbidden for non-member', async () => {
      mockCommunityMemberRepository.getUserRole.mockResolvedValue(null);

      await expect(trustService.listCommunityTrust('comm-123', 'user-123')).rejects.toThrow(
        'Forbidden: not a member of this community'
      );
    });
  });

  describe('getTrustMe', () => {
    it('should return trust info for user with points', async () => {
      mockCommunityMemberRepository.getUserRoles.mockResolvedValue(['member']);
      mockTrustViewRepository.get.mockResolvedValue({ points: 20 });
      mockCommunityRepository.findById.mockResolvedValue({
        id: 'comm-123',
        minTrustToAwardTrust: { type: 'number', value: 15 },
        minTrustForWealth: { type: 'number', value: 10 },
        minTrustForDisputes: { type: 'number', value: 20 },
        minTrustForPolls: { type: 'number', value: 15 },
      });
      mockOpenFGAService.checkAccess.mockResolvedValue(true);

      const result = await trustService.getTrustMe('comm-123', 'user-123');

      expect(result.trusted).toBe(true);
      expect(result.points).toBe(20);
      expect(result.canAwardTrust).toBe(true);
      expect(result.canCreateWealth).toBe(true);
      expect(result.canHandleDisputes).toBe(true);
      expect(result.canCreatePolls).toBe(true);
    });

    it('should return admin permissions for admin', async () => {
      mockCommunityMemberRepository.getUserRoles.mockResolvedValue(['admin']);
      mockTrustViewRepository.get.mockResolvedValue({ points: 0 });
      mockCommunityRepository.findById.mockResolvedValue({
        id: 'comm-123',
        minTrustToAwardTrust: { type: 'number', value: 15 },
      });
      mockOpenFGAService.checkAccess.mockResolvedValue(true);

      const result = await trustService.getTrustMe('comm-123', 'user-123');

      expect(result.trusted).toBe(true);
      expect(result.canAwardTrust).toBe(true);
    });
  });

  describe('recordShareRedeemed', () => {
    it('should award points when giver is trusted', async () => {
      mockTrustViewRepository.get.mockResolvedValue({ points: 10 });
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('admin');

      const result = await trustService.recordShareRedeemed({
        communityId: 'comm-123',
        giverUserId: 'user-123',
        receiverUserId: 'user-456',
      });

      expect(result.awarded).toBe(true);
      expect(mockTrustViewRepository.adjustPoints).toHaveBeenCalledTimes(2);
      expect(mockTrustEventRepository.create).toHaveBeenCalled();
    });

    it('should award points when receiver is trusted', async () => {
      mockTrustViewRepository.get
        .mockResolvedValueOnce({ points: 0 })
        .mockResolvedValueOnce({ points: 15 });
      mockCommunityMemberRepository.getUserRole
        .mockResolvedValueOnce('member')
        .mockResolvedValueOnce('admin');

      const result = await trustService.recordShareRedeemed({
        communityId: 'comm-123',
        giverUserId: 'user-123',
        receiverUserId: 'user-456',
      });

      expect(result.awarded).toBe(true);
    });

    it('should not award points when neither is trusted', async () => {
      mockTrustViewRepository.get.mockResolvedValue({ points: 0 });
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');

      const result = await trustService.recordShareRedeemed({
        communityId: 'comm-123',
        giverUserId: 'user-123',
        receiverUserId: 'user-456',
      });

      expect(result.awarded).toBe(false);
    });
  });

  describe('awardTrust', () => {
    it('should award trust when user has permission', async () => {
      // Reconfigure mocks for this test
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');
      mockTrustAwardRepository.hasAward.mockResolvedValue(false);
      mockOpenFGAService.checkAccess.mockResolvedValue(true);
      mockTrustAwardRepository.createAward.mockResolvedValue({
        id: 'award-123',
      });
      mockTrustViewRepository.recalculatePoints.mockResolvedValue(undefined);
      mockTrustViewRepository.get.mockResolvedValue({ points: 20 });
      mockCommunityRepository.findById.mockResolvedValue({
        id: 'comm-123',
        minTrustToAwardTrust: { type: 'number', value: 15 },
        minTrustForWealth: { type: 'number', value: 10 },
        minTrustForNeeds: { type: 'number', value: 5 },
        minTrustForPolls: { type: 'number', value: 15 },
        minTrustForDisputes: { type: 'number', value: 20 },
        minTrustForPoolCreation: { type: 'number', value: 20 },
        minTrustForCouncilCreation: { type: 'number', value: 25 },
        minTrustForForumModeration: { type: 'number', value: 30 },
        minTrustForThreadCreation: { type: 'number', value: 10 },
        minTrustForAttachments: { type: 'number', value: 15 },
        minTrustForFlagging: { type: 'number', value: 15 },
        minTrustForFlagReview: { type: 'number', value: 30 },
        minTrustForItemManagement: { type: 'number', value: 20 },
        minTrustForHealthAnalytics: { type: 'number', value: 20 },
      });
      mockOpenFGAService.syncTrustRoles.mockResolvedValue(undefined);
      mockTrustHistoryRepository.logAction.mockResolvedValue({
        id: 'history-123',
      });

      const result = await trustService.awardTrust('comm-123', 'user-123', 'user-456');

      expect(result.id).toBe('award-123');
      expect(mockTrustAwardRepository.createAward).toHaveBeenCalled();
      expect(mockTrustViewRepository.recalculatePoints).toHaveBeenCalled();
      expect(mockOpenFGAService.syncTrustRoles).toHaveBeenCalledWith('user-456', 'comm-123', 20, {
        trust_trust_viewer: 0,
        trust_trust_granter: 15,
        trust_wealth_viewer: 0,
        trust_wealth_creator: 10,
        trust_needs_viewer: 0,
        trust_needs_publisher: 5,
        trust_poll_viewer: 0,
        trust_poll_creator: 15,
        trust_dispute_viewer: 0,
        trust_dispute_handler: 20,
        trust_pool_viewer: 0,
        trust_pool_creator: 20,
        trust_council_viewer: 0,
        trust_council_creator: 25,
        trust_forum_viewer: 0,
        trust_forum_manager: 30,
        trust_thread_creator: 10,
        trust_attachment_uploader: 15,
        trust_content_flagger: 15,
        trust_flag_reviewer: 30,
        trust_item_viewer: 0,
        trust_item_manager: 20,
        trust_analytics_viewer: 20,
      });
      expect(mockTrustHistoryRepository.logAction).toHaveBeenCalled();
    });

    it('should throw error when awarding to self', async () => {
      await expect(trustService.awardTrust('comm-123', 'user-123', 'user-123')).rejects.toThrow(
        'Cannot award trust to yourself'
      );
    });

    it('should throw forbidden for non-member', async () => {
      mockCommunityMemberRepository.getUserRole.mockResolvedValue(null);

      await expect(trustService.awardTrust('comm-123', 'user-123', 'user-456')).rejects.toThrow(
        'Forbidden: not a member of this community'
      );
    });

    it('should throw error when already awarded', async () => {
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');
      mockTrustAwardRepository.hasAward.mockResolvedValue(true);

      await expect(trustService.awardTrust('comm-123', 'user-123', 'user-456')).rejects.toThrow(
        'You have already awarded trust to this user'
      );
    });

    it('should throw error when user lacks permission', async () => {
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');
      mockTrustAwardRepository.hasAward.mockResolvedValue(false);
      mockOpenFGAService.checkAccess.mockResolvedValue(false);

      await expect(trustService.awardTrust('comm-123', 'user-123', 'user-456')).rejects.toThrow(
        'Unauthorized: You do not have permission to award trust'
      );
    });
  });

  describe('removeTrust', () => {
    it('should remove trust award', async () => {
      // Reconfigure mocks for this test
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');
      mockTrustAwardRepository.hasAward.mockResolvedValue(true);
      mockTrustAwardRepository.deleteAward.mockResolvedValue({
        id: 'award-123',
      });
      mockTrustViewRepository.recalculatePoints.mockResolvedValue(undefined);
      mockTrustViewRepository.get.mockResolvedValue({ points: 15 });
      mockCommunityRepository.findById.mockResolvedValue({
        id: 'comm-123',
        minTrustToAwardTrust: { type: 'number', value: 15 },
        minTrustForWealth: { type: 'number', value: 10 },
        minTrustForNeeds: { type: 'number', value: 5 },
        minTrustForPolls: { type: 'number', value: 15 },
        minTrustForDisputes: { type: 'number', value: 20 },
        minTrustForPoolCreation: { type: 'number', value: 20 },
        minTrustForCouncilCreation: { type: 'number', value: 25 },
        minTrustForForumModeration: { type: 'number', value: 30 },
        minTrustForThreadCreation: { type: 'number', value: 10 },
        minTrustForAttachments: { type: 'number', value: 15 },
        minTrustForFlagging: { type: 'number', value: 15 },
        minTrustForFlagReview: { type: 'number', value: 30 },
        minTrustForItemManagement: { type: 'number', value: 20 },
        minTrustForHealthAnalytics: { type: 'number', value: 20 },
      });
      mockOpenFGAService.syncTrustRoles.mockResolvedValue(undefined);
      mockTrustHistoryRepository.logAction.mockResolvedValue({
        id: 'history-123',
      });

      const result = await trustService.removeTrust('comm-123', 'user-123', 'user-456');

      expect(result.id).toBe('award-123');
      expect(mockTrustAwardRepository.deleteAward).toHaveBeenCalled();
      expect(mockTrustViewRepository.recalculatePoints).toHaveBeenCalled();
      expect(mockOpenFGAService.syncTrustRoles).toHaveBeenCalledWith('user-456', 'comm-123', 15, {
        trust_trust_viewer: 0,
        trust_trust_granter: 15,
        trust_wealth_viewer: 0,
        trust_wealth_creator: 10,
        trust_needs_viewer: 0,
        trust_needs_publisher: 5,
        trust_poll_viewer: 0,
        trust_poll_creator: 15,
        trust_dispute_viewer: 0,
        trust_dispute_handler: 20,
        trust_pool_viewer: 0,
        trust_pool_creator: 20,
        trust_council_viewer: 0,
        trust_council_creator: 25,
        trust_forum_viewer: 0,
        trust_forum_manager: 30,
        trust_thread_creator: 10,
        trust_attachment_uploader: 15,
        trust_content_flagger: 15,
        trust_flag_reviewer: 30,
        trust_item_viewer: 0,
        trust_item_manager: 20,
        trust_analytics_viewer: 20,
      });
      expect(mockTrustHistoryRepository.logAction).toHaveBeenCalled();
    });

    it('should throw forbidden for non-member', async () => {
      mockCommunityMemberRepository.getUserRole.mockResolvedValue(null);

      await expect(trustService.removeTrust('comm-123', 'user-123', 'user-456')).rejects.toThrow(
        'Forbidden: not a member of this community'
      );
    });

    it('should throw error when award does not exist', async () => {
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');
      mockTrustAwardRepository.hasAward.mockResolvedValue(false);

      await expect(trustService.removeTrust('comm-123', 'user-123', 'user-456')).rejects.toThrow(
        'You have not awarded trust to this user'
      );
    });
  });

  describe('hasAwardedTrust', () => {
    it('should return true when award exists', async () => {
      mockTrustAwardRepository.hasAward.mockResolvedValue(true);

      const result = await trustService.hasAwardedTrust('comm-123', 'user-123', 'user-456');

      expect(result).toBe(true);
    });

    it('should return false when award does not exist', async () => {
      mockTrustAwardRepository.hasAward.mockResolvedValue(false);

      const result = await trustService.hasAwardedTrust('comm-123', 'user-123', 'user-456');

      expect(result).toBe(false);
    });
  });

  describe('listMyAwards', () => {
    it('should return awards for member', async () => {
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');
      mockTrustAwardRepository.listUserAwards.mockResolvedValue([
        { id: 'award-123', fromUserId: 'user-123', toUserId: 'user-456' },
      ]);

      const result = await trustService.listMyAwards('comm-123', 'user-123');

      expect(result).toHaveLength(1);
    });

    it('should throw forbidden for non-member', async () => {
      mockCommunityMemberRepository.getUserRole.mockResolvedValue(null);

      await expect(trustService.listMyAwards('comm-123', 'user-123')).rejects.toThrow(
        'Forbidden: not a member of this community'
      );
    });
  });

  describe('listAwardsToUser', () => {
    it('should return awards to user for member', async () => {
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');
      mockTrustAwardRepository.listAwardsToUser.mockResolvedValue([
        { id: 'award-123', fromUserId: 'user-123', toUserId: 'user-456' },
      ]);

      const result = await trustService.listAwardsToUser('comm-123', 'user-123', 'user-456');

      expect(result).toHaveLength(1);
    });

    it('should throw forbidden for non-member', async () => {
      mockCommunityMemberRepository.getUserRole.mockResolvedValue(null);

      await expect(
        trustService.listAwardsToUser('comm-123', 'user-123', 'user-456')
      ).rejects.toThrow('Forbidden: not a member of this community');
    });
  });

  describe('setAdminGrant', () => {
    it('should set admin grant when user is admin', async () => {
      // Reconfigure mocks for this test
      mockCommunityMemberRepository.isAdmin.mockResolvedValue(true);
      mockAdminTrustGrantRepository.getGrant.mockResolvedValue(null);
      mockAdminTrustGrantRepository.upsertGrant.mockResolvedValue({
        id: 'grant-123',
      });
      mockTrustViewRepository.recalculatePoints.mockResolvedValue(undefined);
      mockTrustViewRepository.get.mockResolvedValue({ points: 50 });
      mockCommunityRepository.findById.mockResolvedValue({
        id: 'comm-123',
        minTrustToAwardTrust: { type: 'number', value: 15 },
        minTrustForWealth: { type: 'number', value: 10 },
        minTrustForNeeds: { type: 'number', value: 5 },
        minTrustForPolls: { type: 'number', value: 15 },
        minTrustForDisputes: { type: 'number', value: 20 },
        minTrustForPoolCreation: { type: 'number', value: 20 },
        minTrustForCouncilCreation: { type: 'number', value: 25 },
        minTrustForForumModeration: { type: 'number', value: 30 },
        minTrustForThreadCreation: { type: 'number', value: 10 },
        minTrustForAttachments: { type: 'number', value: 15 },
        minTrustForFlagging: { type: 'number', value: 15 },
        minTrustForFlagReview: { type: 'number', value: 30 },
        minTrustForItemManagement: { type: 'number', value: 20 },
        minTrustForHealthAnalytics: { type: 'number', value: 20 },
      });
      mockOpenFGAService.syncTrustRoles.mockResolvedValue(undefined);
      mockTrustHistoryRepository.logAction.mockResolvedValue({
        id: 'history-123',
      });

      const result = await trustService.setAdminGrant('comm-123', 'user-123', 'user-456', 50);

      expect(result.id).toBe('grant-123');
      expect(mockAdminTrustGrantRepository.upsertGrant).toHaveBeenCalledWith(
        'comm-123',
        'user-123',
        'user-456',
        50
      );
      expect(mockTrustViewRepository.recalculatePoints).toHaveBeenCalled();
      expect(mockOpenFGAService.syncTrustRoles).toHaveBeenCalledWith('user-456', 'comm-123', 50, {
        trust_trust_viewer: 0,
        trust_trust_granter: 15,
        trust_wealth_viewer: 0,
        trust_wealth_creator: 10,
        trust_needs_viewer: 0,
        trust_needs_publisher: 5,
        trust_poll_viewer: 0,
        trust_poll_creator: 15,
        trust_dispute_viewer: 0,
        trust_dispute_handler: 20,
        trust_pool_viewer: 0,
        trust_pool_creator: 20,
        trust_council_viewer: 0,
        trust_council_creator: 25,
        trust_forum_viewer: 0,
        trust_forum_manager: 30,
        trust_thread_creator: 10,
        trust_attachment_uploader: 15,
        trust_content_flagger: 15,
        trust_flag_reviewer: 30,
        trust_item_viewer: 0,
        trust_item_manager: 20,
        trust_analytics_viewer: 20,
      });
      expect(mockTrustHistoryRepository.logAction).toHaveBeenCalled();
    });

    it('should update existing grant', async () => {
      // Reconfigure mocks for this test
      mockCommunityMemberRepository.isAdmin.mockResolvedValue(true);
      mockAdminTrustGrantRepository.getGrant.mockResolvedValue({
        trustAmount: 30,
      });
      mockAdminTrustGrantRepository.upsertGrant.mockResolvedValue({
        id: 'grant-123',
      });
      mockTrustViewRepository.recalculatePoints.mockResolvedValue(undefined);
      mockTrustViewRepository.get.mockResolvedValue({ points: 50 });
      mockCommunityRepository.findById.mockResolvedValue({
        id: 'comm-123',
        minTrustToAwardTrust: { type: 'number', value: 15 },
        minTrustForWealth: { type: 'number', value: 10 },
        minTrustForNeeds: { type: 'number', value: 5 },
        minTrustForPolls: { type: 'number', value: 15 },
        minTrustForDisputes: { type: 'number', value: 20 },
        minTrustForPoolCreation: { type: 'number', value: 20 },
        minTrustForCouncilCreation: { type: 'number', value: 25 },
        minTrustForForumModeration: { type: 'number', value: 30 },
        minTrustForThreadCreation: { type: 'number', value: 10 },
        minTrustForAttachments: { type: 'number', value: 15 },
        minTrustForFlagging: { type: 'number', value: 15 },
        minTrustForFlagReview: { type: 'number', value: 30 },
        minTrustForItemManagement: { type: 'number', value: 20 },
        minTrustForHealthAnalytics: { type: 'number', value: 20 },
      });
      mockOpenFGAService.syncTrustRoles.mockResolvedValue(undefined);
      mockTrustHistoryRepository.logAction.mockResolvedValue({
        id: 'history-123',
      });

      const result = await trustService.setAdminGrant('comm-123', 'user-123', 'user-456', 50);

      expect(result.id).toBe('grant-123');
      expect(mockOpenFGAService.syncTrustRoles).toHaveBeenCalled();
    });

    it('should throw forbidden for non-admin', async () => {
      mockCommunityMemberRepository.isAdmin.mockResolvedValue(false);

      await expect(
        trustService.setAdminGrant('comm-123', 'user-123', 'user-456', 50)
      ).rejects.toThrow('Forbidden: only admins can set admin grants');
    });

    it('should throw error for negative amount', async () => {
      mockCommunityMemberRepository.isAdmin.mockResolvedValue(true);

      await expect(
        trustService.setAdminGrant('comm-123', 'user-123', 'user-456', -10)
      ).rejects.toThrow('Admin grant amount cannot be negative');
    });
  });

  describe('getAdminGrants', () => {
    it('should return grants for admin', async () => {
      mockCommunityMemberRepository.isAdmin.mockResolvedValue(true);
      mockAdminTrustGrantRepository.listAllGrants.mockResolvedValue([
        { id: 'grant-123', userId: 'user-456', trustAmount: 50 },
      ]);

      const result = await trustService.getAdminGrants('comm-123', 'user-123');

      expect(result).toHaveLength(1);
    });

    it('should throw forbidden for non-admin', async () => {
      mockCommunityMemberRepository.isAdmin.mockResolvedValue(false);

      await expect(trustService.getAdminGrants('comm-123', 'user-123')).rejects.toThrow(
        'Forbidden: only admins can view admin grants'
      );
    });
  });

  describe('deleteAdminGrant', () => {
    it('should delete grant when user is admin', async () => {
      // Reconfigure mocks for this test
      mockCommunityMemberRepository.isAdmin.mockResolvedValue(true);
      mockAdminTrustGrantRepository.getGrant.mockResolvedValue({
        id: 'grant-123',
        trustAmount: 50,
      });
      mockAdminTrustGrantRepository.deleteGrant.mockResolvedValue({
        id: 'grant-123',
      });
      mockTrustViewRepository.recalculatePoints.mockResolvedValue(undefined);
      mockTrustViewRepository.get.mockResolvedValue({ points: 0 });
      mockCommunityRepository.findById.mockResolvedValue({
        id: 'comm-123',
        minTrustToAwardTrust: { type: 'number', value: 15 },
        minTrustForWealth: { type: 'number', value: 10 },
        minTrustForNeeds: { type: 'number', value: 5 },
        minTrustForPolls: { type: 'number', value: 15 },
        minTrustForDisputes: { type: 'number', value: 20 },
        minTrustForPoolCreation: { type: 'number', value: 20 },
        minTrustForCouncilCreation: { type: 'number', value: 25 },
        minTrustForForumModeration: { type: 'number', value: 30 },
        minTrustForThreadCreation: { type: 'number', value: 10 },
        minTrustForAttachments: { type: 'number', value: 15 },
        minTrustForFlagging: { type: 'number', value: 15 },
        minTrustForFlagReview: { type: 'number', value: 30 },
        minTrustForItemManagement: { type: 'number', value: 20 },
        minTrustForHealthAnalytics: { type: 'number', value: 20 },
      });
      mockOpenFGAService.syncTrustRoles.mockResolvedValue(undefined);
      mockTrustHistoryRepository.logAction.mockResolvedValue({
        id: 'history-123',
      });

      const result = await trustService.deleteAdminGrant('comm-123', 'user-123', 'user-456');

      expect(result.id).toBe('grant-123');
      expect(mockAdminTrustGrantRepository.deleteGrant).toHaveBeenCalled();
      expect(mockTrustViewRepository.recalculatePoints).toHaveBeenCalled();
      expect(mockOpenFGAService.syncTrustRoles).toHaveBeenCalledWith('user-456', 'comm-123', 0, {
        trust_trust_viewer: 0,
        trust_trust_granter: 15,
        trust_wealth_viewer: 0,
        trust_wealth_creator: 10,
        trust_needs_viewer: 0,
        trust_needs_publisher: 5,
        trust_poll_viewer: 0,
        trust_poll_creator: 15,
        trust_dispute_viewer: 0,
        trust_dispute_handler: 20,
        trust_pool_viewer: 0,
        trust_pool_creator: 20,
        trust_council_viewer: 0,
        trust_council_creator: 25,
        trust_forum_viewer: 0,
        trust_forum_manager: 30,
        trust_thread_creator: 10,
        trust_attachment_uploader: 15,
        trust_content_flagger: 15,
        trust_flag_reviewer: 30,
        trust_item_viewer: 0,
        trust_item_manager: 20,
        trust_analytics_viewer: 20,
      });
      expect(mockTrustHistoryRepository.logAction).toHaveBeenCalled();
    });

    it('should throw forbidden for non-admin', async () => {
      mockCommunityMemberRepository.isAdmin.mockResolvedValue(false);

      await expect(
        trustService.deleteAdminGrant('comm-123', 'user-123', 'user-456')
      ).rejects.toThrow('Forbidden: only admins can delete admin grants');
    });

    it('should throw error if grant not found', async () => {
      mockCommunityMemberRepository.isAdmin.mockResolvedValue(true);
      mockAdminTrustGrantRepository.getGrant.mockResolvedValue(null);

      await expect(
        trustService.deleteAdminGrant('comm-123', 'user-123', 'user-456')
      ).rejects.toThrow('Admin grant not found');
    });
  });

  describe('getTrustHistory', () => {
    it('should return trust history for member', async () => {
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');
      mockTrustHistoryRepository.getHistoryForUser.mockResolvedValue([
        { id: 'history-123', action: 'award', pointsDelta: 1 },
      ]);

      const result = await trustService.getTrustHistory('comm-123', 'user-123', 'user-456', 1, 10);

      expect(result).toHaveLength(1);
    });

    it('should throw forbidden for non-member', async () => {
      mockCommunityMemberRepository.getUserRole.mockResolvedValue(null);

      await expect(
        trustService.getTrustHistory('comm-123', 'user-123', 'user-456')
      ).rejects.toThrow('Forbidden: not a member of this community');
    });
  });

  describe('getMyEventsAllCommunities', () => {
    it('should return events across all communities', async () => {
      mockTrustEventRepository.listByUserAllCommunities.mockResolvedValue([
        { id: 'event-123', communityId: 'comm-123' },
      ]);

      const result = await trustService.getMyEventsAllCommunities('user-123', 1, 10);

      expect(result).toHaveLength(1);
    });
  });

  describe('listMyTrustAcrossCommunities', () => {
    it('should return trust across all communities', async () => {
      mockTrustViewRepository.listByUser.mockResolvedValue([
        { communityId: 'comm-123', userId: 'user-123', points: 10 },
      ]);

      const result = await trustService.listMyTrustAcrossCommunities('user-123', 1, 10);

      expect(result).toHaveLength(1);
    });
  });

  describe('canAwardTrust', () => {
    it('should return true for admin', async () => {
      mockCommunityMemberRepository.getUserRoles.mockResolvedValue(['admin']);
      mockTrustViewRepository.get.mockResolvedValue({ points: 0 });
      mockCommunityRepository.findById.mockResolvedValue({
        id: 'comm-123',
        minTrustToAwardTrust: { type: 'number', value: 15 },
      });

      const result = await trustService.canAwardTrust('user-123', 'comm-123');

      expect(result).toBe(true);
    });

    it('should return true when user meets numeric threshold', async () => {
      mockCommunityMemberRepository.getUserRoles.mockResolvedValue(['member']);
      mockTrustViewRepository.get.mockResolvedValue({ points: 20 });
      mockCommunityRepository.findById.mockResolvedValue({
        id: 'comm-123',
        minTrustToAwardTrust: { type: 'number', value: 15 },
      });

      const result = await trustService.canAwardTrust('user-123', 'comm-123');

      expect(result).toBe(true);
    });

    it('should return false when user below numeric threshold', async () => {
      mockCommunityMemberRepository.getUserRoles.mockResolvedValue(['member']);
      mockTrustViewRepository.get.mockResolvedValue({ points: 10 });
      mockCommunityRepository.findById.mockResolvedValue({
        id: 'comm-123',
        minTrustToAwardTrust: { type: 'number', value: 15 },
      });

      const result = await trustService.canAwardTrust('user-123', 'comm-123');

      expect(result).toBe(false);
    });

    it('should return false for non-member', async () => {
      mockCommunityMemberRepository.getUserRoles.mockResolvedValue([]);
      mockTrustViewRepository.get.mockResolvedValue({ points: 20 });
      mockCommunityRepository.findById.mockResolvedValue({
        id: 'comm-123',
        minTrustToAwardTrust: { type: 'number', value: 15 },
      });

      const result = await trustService.canAwardTrust('user-123', 'comm-123');

      expect(result).toBe(false);
    });

    it('should throw error if community not found', async () => {
      mockCommunityMemberRepository.getUserRoles.mockResolvedValue(['member']);
      mockTrustViewRepository.get.mockResolvedValue({ points: 10 });
      mockCommunityRepository.findById.mockResolvedValue(null);

      await expect(trustService.canAwardTrust('user-123', 'comm-123')).rejects.toThrow(
        'Community not found'
      );
    });
  });

  describe('canAccessWealth', () => {
    it('should return true for admin', async () => {
      mockCommunityMemberRepository.getUserRoles.mockResolvedValue(['admin']);
      mockTrustViewRepository.get.mockResolvedValue({ points: 0 });
      mockCommunityRepository.findById.mockResolvedValue({
        id: 'comm-123',
        minTrustForWealth: { type: 'number', value: 10 },
      });

      const result = await trustService.canAccessWealth('user-123', 'comm-123');

      expect(result).toBe(true);
    });

    it('should return true when user meets threshold', async () => {
      mockCommunityMemberRepository.getUserRoles.mockResolvedValue(['member']);
      mockTrustViewRepository.get.mockResolvedValue({ points: 15 });
      mockCommunityRepository.findById.mockResolvedValue({
        id: 'comm-123',
        minTrustForWealth: { type: 'number', value: 10 },
      });

      const result = await trustService.canAccessWealth('user-123', 'comm-123');

      expect(result).toBe(true);
    });

    it('should return false when user below threshold', async () => {
      mockCommunityMemberRepository.getUserRoles.mockResolvedValue(['member']);
      mockTrustViewRepository.get.mockResolvedValue({ points: 5 });
      mockCommunityRepository.findById.mockResolvedValue({
        id: 'comm-123',
        minTrustForWealth: { type: 'number', value: 10 },
      });

      const result = await trustService.canAccessWealth('user-123', 'comm-123');

      expect(result).toBe(false);
    });
  });

  describe('canHandleDisputes', () => {
    it('should return true for admin', async () => {
      mockCommunityMemberRepository.getUserRoles.mockResolvedValue(['admin']);
      mockTrustViewRepository.get.mockResolvedValue({ points: 0 });
      mockCommunityRepository.findById.mockResolvedValue({
        id: 'comm-123',
        minTrustForDisputes: { type: 'number', value: 20 },
      });

      const result = await trustService.canHandleDisputes('user-123', 'comm-123');

      expect(result).toBe(true);
    });

    it('should return true when user meets threshold', async () => {
      mockCommunityMemberRepository.getUserRoles.mockResolvedValue(['member']);
      mockTrustViewRepository.get.mockResolvedValue({ points: 25 });
      mockCommunityRepository.findById.mockResolvedValue({
        id: 'comm-123',
        minTrustForDisputes: { type: 'number', value: 20 },
      });

      const result = await trustService.canHandleDisputes('user-123', 'comm-123');

      expect(result).toBe(true);
    });

    it('should return false when user below threshold', async () => {
      mockCommunityMemberRepository.getUserRoles.mockResolvedValue(['member']);
      mockTrustViewRepository.get.mockResolvedValue({ points: 15 });
      mockCommunityRepository.findById.mockResolvedValue({
        id: 'comm-123',
        minTrustForDisputes: { type: 'number', value: 20 },
      });

      const result = await trustService.canHandleDisputes('user-123', 'comm-123');

      expect(result).toBe(false);
    });
  });

  describe('canCreatePolls', () => {
    it('should return true for admin', async () => {
      mockCommunityMemberRepository.getUserRoles.mockResolvedValue(['admin']);
      mockTrustViewRepository.get.mockResolvedValue({ points: 0 });
      mockCommunityRepository.findById.mockResolvedValue({
        id: 'comm-123',
        minTrustForPolls: { type: 'number', value: 15 },
      });

      const result = await trustService.canCreatePolls('user-123', 'comm-123');

      expect(result).toBe(true);
    });

    it('should return true when user meets threshold', async () => {
      mockCommunityMemberRepository.getUserRoles.mockResolvedValue(['member']);
      mockTrustViewRepository.get.mockResolvedValue({ points: 20 });
      mockCommunityRepository.findById.mockResolvedValue({
        id: 'comm-123',
        minTrustForPolls: { type: 'number', value: 15 },
      });

      const result = await trustService.canCreatePolls('user-123', 'comm-123');

      expect(result).toBe(true);
    });

    it('should return false when user below threshold', async () => {
      mockCommunityMemberRepository.getUserRoles.mockResolvedValue(['member']);
      mockTrustViewRepository.get.mockResolvedValue({ points: 10 });
      mockCommunityRepository.findById.mockResolvedValue({
        id: 'comm-123',
        minTrustForPolls: { type: 'number', value: 15 },
      });

      const result = await trustService.canCreatePolls('user-123', 'comm-123');

      expect(result).toBe(false);
    });
  });

  describe('getEffectiveTrustThreshold', () => {
    it('should return numeric value for number type', async () => {
      mockCommunityRepository.findById.mockResolvedValue({
        id: 'comm-123',
      });

      const result = await trustService.getEffectiveTrustThreshold('comm-123', {
        type: 'number',
        value: 25,
      });

      expect(result).toBe(25);
    });

    it('should throw error if community not found', async () => {
      mockCommunityRepository.findById.mockResolvedValue(null);

      await expect(
        trustService.getEffectiveTrustThreshold('comm-123', {
          type: 'number',
          value: 25,
        })
      ).rejects.toThrow('Community not found');
    });
  });

  describe('getTrustTimeline', () => {
    it('should return trust timeline with user trust score and sorted thresholds', async () => {
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');
      mockTrustViewRepository.get.mockResolvedValue({ points: 15 });
      mockCommunityRepository.findById.mockResolvedValue({
        id: 'comm-123',
        name: 'Test Community',
        minTrustToAwardTrust: { type: 'number', value: 15 },
        minTrustForWealth: { type: 'number', value: 10 },
        minTrustForItemManagement: { type: 'number', value: 20 },
        minTrustForDisputes: { type: 'number', value: 20 },
        minTrustForPolls: { type: 'number', value: 15 },
        minTrustForThreadCreation: { type: 'number', value: 10 },
        minTrustForAttachments: { type: 'number', value: 15 },
        minTrustForFlagging: { type: 'number', value: 15 },
        minTrustForFlagReview: { type: 'number', value: 30 },
        minTrustForForumModeration: { type: 'number', value: 30 },
      });
      mockTrustLevelRepository.findByCommunityId.mockResolvedValue([
        { id: 'level-1', name: 'New', threshold: 0, communityId: 'comm-123' },
        {
          id: 'level-2',
          name: 'Stable',
          threshold: 10,
          communityId: 'comm-123',
        },
        {
          id: 'level-3',
          name: 'Trusted',
          threshold: 50,
          communityId: 'comm-123',
        },
      ]);

      const result = await trustService.getTrustTimeline('comm-123', 'user-123');

      expect(result.userTrustScore).toBe(15);
      expect(result.timeline).toHaveLength(6); // 0, 10, 15, 20, 30, 50

      // Check first threshold (0)
      expect(result.timeline[0].threshold).toBe(0);
      expect(result.timeline[0].unlocked).toBe(true);
      expect(result.timeline[0].trustLevel).toEqual({
        name: 'New',
        id: 'level-1',
      });

      // Check threshold at 10
      const threshold10 = result.timeline.find((t) => t.threshold === 10);
      expect(threshold10).toBeDefined();
      expect(threshold10?.unlocked).toBe(true);
      expect(threshold10?.permissions).toContain('Create forum threads');
      expect(threshold10?.permissions).toContain('Create and publish wealth');

      // Check threshold at 15
      const threshold15 = result.timeline.find((t) => t.threshold === 15);
      expect(threshold15).toBeDefined();
      expect(threshold15?.unlocked).toBe(true);
      expect(threshold15?.permissions).toContain('Award trust to others');
      expect(threshold15?.permissions).toContain('Create polls');

      // Check threshold at 20 (not unlocked)
      const threshold20 = result.timeline.find((t) => t.threshold === 20);
      expect(threshold20).toBeDefined();
      expect(threshold20?.unlocked).toBe(false);

      // Check threshold at 30 (not unlocked)
      const threshold30 = result.timeline.find((t) => t.threshold === 30);
      expect(threshold30).toBeDefined();
      expect(threshold30?.unlocked).toBe(false);
    });

    it('should throw forbidden for non-member', async () => {
      mockCommunityMemberRepository.getUserRole.mockResolvedValue(null);

      await expect(trustService.getTrustTimeline('comm-123', 'user-123')).rejects.toThrow(
        'Forbidden: not a member of this community'
      );
    });

    it('should throw error if community not found', async () => {
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');
      mockCommunityRepository.findById.mockResolvedValue(null);

      await expect(trustService.getTrustTimeline('comm-123', 'user-123')).rejects.toThrow(
        'Community not found'
      );
    });
  });
});
