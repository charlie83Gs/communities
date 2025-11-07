import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { wealthService } from '@/services/wealth.service';
import { wealthRepository } from '@/repositories/wealth.repository';
import { communityMemberRepository } from '@/repositories/communityMember.repository';
import { appUserRepository } from '@/repositories/appUser.repository';
import { openFGAService } from './openfga.service';
import { AppError } from '@/utils/errors';
import { testData } from '../../tests/helpers/testUtils';

// Mock repositories
const mockWealthRepository = {
  createWealth: mock(() => Promise.resolve(testData.wealth)),
  findById: mock(() => Promise.resolve(testData.wealth)),
  listByCommunity: mock(() => Promise.resolve([testData.wealth])),
  listByCommunities: mock(() => Promise.resolve([testData.wealth])),
  search: mock(() => Promise.resolve({ rows: [testData.wealth], total: 1 })),
  updateWealth: mock(() => Promise.resolve(testData.wealth)),
  cancelWealth: mock(() => Promise.resolve({ ...testData.wealth, status: 'cancelled' as const })),
  markFulfilled: mock(() => Promise.resolve({ ...testData.wealth, status: 'fulfilled' as const })),
  createWealthRequest: mock(() =>
    Promise.resolve({
      id: 'req-123',
      wealthId: 'wealth-123',
      requesterId: 'user-123',
      status: 'pending' as const,
    })
  ),
  findRequestById: mock(() => Promise.resolve(null)),
  listRequestsForWealth: mock(() => Promise.resolve([])),
  listRequestsForWealthByRequester: mock(() => Promise.resolve([])),
  listRequestsByUser: mock(() => Promise.resolve([])),
  listIncomingRequestsByOwner: mock(() => Promise.resolve([])),
  acceptRequest: mock(() => Promise.resolve({ id: 'req-123', status: 'accepted' as const })),
  markRequestFulfilled: mock(() =>
    Promise.resolve({ id: 'req-123', status: 'fulfilled' as const })
  ),
  rejectRequest: mock(() => Promise.resolve({ id: 'req-123', status: 'rejected' as const })),
  cancelRequest: mock(() => Promise.resolve({ id: 'req-123', status: 'cancelled' as const })),
  decrementUnits: mock(() => Promise.resolve(testData.wealth)),
  confirmRequest: mock(() => Promise.resolve({ id: 'req-123', status: 'fulfilled' as const })),
  failRequest: mock(() => Promise.resolve({ id: 'req-123', status: 'failed' as const })),
};

const mockCommunityMemberRepository = {
  getUserRole: mock(() => Promise.resolve('member')),
  findByUser: mock(() => Promise.resolve([{ resourceId: 'comm-123', role: 'member' }])),
};

const mockAppUserRepository = {
  findById: mock(() =>
    Promise.resolve({
      id: 'user-456',
      displayName: 'Test User',
      username: 'testuser',
    })
  ),
};

const mockOpenFGAService = {
  assignRole: mock(() => Promise.resolve()),
  createRelationship: mock(() => Promise.resolve()),
};

describe('WealthService', () => {
  beforeEach(() => {
    Object.values(mockWealthRepository).forEach((m) => m.mockReset());
    Object.values(mockCommunityMemberRepository).forEach((m) => m.mockReset());
    Object.values(mockAppUserRepository).forEach((m) => m.mockReset());
    Object.values(mockOpenFGAService).forEach((m) => m.mockReset());

    (wealthRepository.createWealth as any) = mockWealthRepository.createWealth;
    (wealthRepository.findById as any) = mockWealthRepository.findById;
    (wealthRepository.listByCommunity as any) = mockWealthRepository.listByCommunity;
    (wealthRepository.listByCommunities as any) = mockWealthRepository.listByCommunities;
    (wealthRepository.search as any) = mockWealthRepository.search;
    (wealthRepository.updateWealth as any) = mockWealthRepository.updateWealth;
    (wealthRepository.cancelWealth as any) = mockWealthRepository.cancelWealth;
    (wealthRepository.markFulfilled as any) = mockWealthRepository.markFulfilled;
    (wealthRepository.createWealthRequest as any) = mockWealthRepository.createWealthRequest;
    (wealthRepository.findRequestById as any) = mockWealthRepository.findRequestById;
    (wealthRepository.listRequestsForWealth as any) = mockWealthRepository.listRequestsForWealth;
    (wealthRepository.listRequestsForWealthByRequester as any) =
      mockWealthRepository.listRequestsForWealthByRequester;
    (wealthRepository.listRequestsByUser as any) = mockWealthRepository.listRequestsByUser;
    (wealthRepository.acceptRequest as any) = mockWealthRepository.acceptRequest;
    (wealthRepository.markRequestFulfilled as any) = mockWealthRepository.markRequestFulfilled;
    (wealthRepository.rejectRequest as any) = mockWealthRepository.rejectRequest;
    (wealthRepository.cancelRequest as any) = mockWealthRepository.cancelRequest;
    (wealthRepository.decrementUnits as any) = mockWealthRepository.decrementUnits;
    (wealthRepository.confirmRequest as any) = mockWealthRepository.confirmRequest;
    (wealthRepository.failRequest as any) = mockWealthRepository.failRequest;
    (wealthRepository.listIncomingRequestsByOwner as any) =
      mockWealthRepository.listIncomingRequestsByOwner;
    (communityMemberRepository.getUserRole as any) = mockCommunityMemberRepository.getUserRole;
    (communityMemberRepository.findByUser as any) = mockCommunityMemberRepository.findByUser;
    (appUserRepository.findById as any) = mockAppUserRepository.findById;
    (openFGAService.assignRole as any) = mockOpenFGAService.assignRole;
    (openFGAService.createRelationship as any) = mockOpenFGAService.createRelationship;
  });

  describe('createWealth', () => {
    it('should create wealth for community member', async () => {
      // Reconfigure mocks for this test
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');
      mockWealthRepository.createWealth.mockResolvedValue(testData.wealth);
      mockOpenFGAService.assignRole.mockResolvedValue(undefined);

      const result = await wealthService.createWealth(
        {
          communityId: 'comm-123',
          itemId: 'item-123',
          title: 'Test Wealth',
          durationType: 'unlimited',
          distributionType: 'request_based',
        },
        'user-123'
      );

      expect(result.id).toBe('wealth-123');
      expect(mockWealthRepository.createWealth).toHaveBeenCalled();
      expect(mockOpenFGAService.assignRole).toHaveBeenCalled();
    });

    it('should throw error for non-member', async () => {
      mockCommunityMemberRepository.getUserRole.mockResolvedValue(null);

      await expect(
        wealthService.createWealth(
          {
            communityId: 'comm-123',
            itemId: 'item-123',
            title: 'Test',
            durationType: 'unlimited',
            distributionType: 'request_based',
          },
          'user-123'
        )
      ).rejects.toThrow('Forbidden');
    });

    it('should throw error for timebound without endDate', async () => {
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');

      await expect(
        wealthService.createWealth(
          {
            communityId: 'comm-123',
            itemId: 'item-123',
            title: 'Test',
            durationType: 'timebound',
            distributionType: 'request_based',
          },
          'user-123'
        )
      ).rejects.toThrow('endDate is required for timebound wealth');
    });

    it('should throw error for unit_based without units', async () => {
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');

      await expect(
        wealthService.createWealth(
          {
            communityId: 'comm-123',
            itemId: 'item-123',
            title: 'Test',
            durationType: 'unlimited',
            distributionType: 'unit_based',
          },
          'user-123'
        )
      ).rejects.toThrow('unitsAvailable must be a positive integer');
    });
  });

  describe('getWealth', () => {
    it('should return wealth for community member', async () => {
      // Reconfigure mocks for this test
      mockWealthRepository.findById.mockResolvedValue(testData.wealth);
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');

      const result = await wealthService.getWealth('wealth-123', 'user-123');

      expect(result.id).toBe('wealth-123');
    });

    it('should throw not found if wealth does not exist', async () => {
      mockWealthRepository.findById.mockResolvedValue(null);

      await expect(wealthService.getWealth('wealth-123', 'user-123')).rejects.toThrow(
        'Wealth not found'
      );
    });

    it('should throw forbidden for non-member', async () => {
      // Reconfigure mocks for this test
      mockWealthRepository.findById.mockResolvedValue(testData.wealth);
      mockCommunityMemberRepository.getUserRole.mockResolvedValue(null);

      await expect(wealthService.getWealth('wealth-123', 'user-123')).rejects.toThrow('Forbidden');
    });
  });

  describe('listCommunityWealth', () => {
    it('should return wealth list for member', async () => {
      // Reconfigure mocks for this test
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');
      mockWealthRepository.listByCommunity.mockResolvedValue([testData.wealth]);

      const result = await wealthService.listCommunityWealth('comm-123', 'user-123');

      expect(result).toHaveLength(1);
    });
  });

  describe('updateWealth', () => {
    it('should update wealth when owner', async () => {
      // Reconfigure mocks for this test
      mockWealthRepository.findById.mockResolvedValue({
        ...testData.wealth,
        createdBy: 'user-123',
      });
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');
      mockWealthRepository.updateWealth.mockResolvedValue({
        ...testData.wealth,
        title: 'Updated',
      });

      const result = await wealthService.updateWealth(
        'wealth-123',
        { title: 'Updated' },
        'user-123'
      );

      expect(mockWealthRepository.updateWealth).toHaveBeenCalled();
    });

    it('should throw forbidden when not owner', async () => {
      mockWealthRepository.findById.mockResolvedValue({
        ...testData.wealth,
        createdBy: 'user-456',
      });

      await expect(
        wealthService.updateWealth('wealth-123', { title: 'Updated' }, 'user-123')
      ).rejects.toThrow('Forbidden: only the wealth owner can perform this action');
    });
  });

  describe('requestWealth', () => {
    it('should create wealth request', async () => {
      // Reconfigure mocks for this test
      mockWealthRepository.findById.mockResolvedValue({
        ...testData.wealth,
        status: 'active' as const,
        distributionType: 'request_based',
      });
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');
      mockWealthRepository.createWealthRequest.mockResolvedValue({
        id: 'req-123',
        wealthId: 'wealth-123',
        requesterId: 'user-456',
        status: 'pending' as const,
      });

      const result = await wealthService.requestWealth('wealth-123', 'user-456');

      expect(result.id).toBe('req-123');
    });

    it('should throw error if wealth not active', async () => {
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');
      mockWealthRepository.findById.mockResolvedValue({
        ...testData.wealth,
        status: 'fulfilled' as const,
      });

      await expect(wealthService.requestWealth('wealth-123', 'user-456')).rejects.toThrow(
        'Wealth is not active'
      );
    });
  });

  describe('acceptRequest', () => {
    it('should accept request when owner without decrementing units', async () => {
      // Reconfigure mocks for this test
      mockWealthRepository.findById.mockResolvedValue({
        ...testData.wealth,
        createdBy: 'user-123',
        distributionType: 'request_based',
      });
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');
      mockWealthRepository.findRequestById.mockResolvedValue({
        id: 'req-123',
        wealthId: 'wealth-123',
        status: 'pending' as const,
      });
      mockWealthRepository.acceptRequest.mockResolvedValue({
        id: 'req-123',
        status: 'accepted' as const,
      });

      const result = await wealthService.acceptRequest('wealth-123', 'req-123', 'user-123');

      expect(result.request.status).toBe('accepted');
      // Verify decrementUnits is NOT called
      expect(mockWealthRepository.decrementUnits).not.toHaveBeenCalled();
    });

    it('should throw forbidden when not owner', async () => {
      mockWealthRepository.findById.mockResolvedValue({
        ...testData.wealth,
        createdBy: 'user-456',
      });
      mockWealthRepository.findRequestById.mockResolvedValue({
        id: 'req-123',
        wealthId: 'wealth-123',
        status: 'pending' as const,
      });

      await expect(
        wealthService.acceptRequest('wealth-123', 'req-123', 'user-123')
      ).rejects.toThrow('Forbidden');
    });
  });

  describe('confirmRequest', () => {
    it('should confirm request and decrement units when requester', async () => {
      // Reconfigure mocks for this test
      mockWealthRepository.findById.mockResolvedValue({
        ...testData.wealth,
        distributionType: 'unit_based',
        unitsAvailable: 10,
      });
      mockWealthRepository.findRequestById.mockResolvedValue({
        id: 'req-123',
        wealthId: 'wealth-123',
        requesterId: 'user-456',
        status: 'accepted' as const,
        unitsRequested: 2,
      });
      mockWealthRepository.decrementUnits.mockResolvedValue({
        ...testData.wealth,
        unitsAvailable: 8,
      });
      mockWealthRepository.confirmRequest.mockResolvedValue({
        id: 'req-123',
        status: 'fulfilled' as const,
      });

      const result = await wealthService.confirmRequest('wealth-123', 'req-123', 'user-456');

      expect(result.request.status).toBe('fulfilled');
      expect(mockWealthRepository.decrementUnits).toHaveBeenCalledWith('wealth-123', 2);
      expect(mockWealthRepository.confirmRequest).toHaveBeenCalledWith('req-123');
    });

    it('should confirm request without decrementing units for request_based', async () => {
      mockWealthRepository.findById.mockResolvedValue({
        ...testData.wealth,
        distributionType: 'request_based',
      });
      mockWealthRepository.findRequestById.mockResolvedValue({
        id: 'req-123',
        wealthId: 'wealth-123',
        requesterId: 'user-456',
        status: 'accepted' as const,
      });
      mockWealthRepository.confirmRequest.mockResolvedValue({
        id: 'req-123',
        status: 'fulfilled' as const,
      });

      const result = await wealthService.confirmRequest('wealth-123', 'req-123', 'user-456');

      expect(result.request.status).toBe('fulfilled');
      expect(mockWealthRepository.decrementUnits).not.toHaveBeenCalled();
    });

    it('should throw forbidden when not requester', async () => {
      mockWealthRepository.findById.mockResolvedValue(testData.wealth);
      mockWealthRepository.findRequestById.mockResolvedValue({
        id: 'req-123',
        wealthId: 'wealth-123',
        requesterId: 'user-456',
        status: 'accepted' as const,
      });

      await expect(
        wealthService.confirmRequest('wealth-123', 'req-123', 'user-789')
      ).rejects.toThrow('Forbidden: only the requester can confirm receipt');
    });

    it('should throw error if request is not accepted', async () => {
      mockWealthRepository.findById.mockResolvedValue(testData.wealth);
      mockWealthRepository.findRequestById.mockResolvedValue({
        id: 'req-123',
        wealthId: 'wealth-123',
        requesterId: 'user-456',
        status: 'pending' as const,
      });

      await expect(
        wealthService.confirmRequest('wealth-123', 'req-123', 'user-456')
      ).rejects.toThrow('Only accepted requests can be confirmed');
    });
  });

  describe('failRequest', () => {
    it('should mark request as failed when requester', async () => {
      mockWealthRepository.findById.mockResolvedValue(testData.wealth);
      mockWealthRepository.findRequestById.mockResolvedValue({
        id: 'req-123',
        wealthId: 'wealth-123',
        requesterId: 'user-456',
        status: 'accepted' as const,
      });
      mockWealthRepository.failRequest.mockResolvedValue({
        id: 'req-123',
        status: 'failed' as const,
      });

      const result = await wealthService.failRequest('wealth-123', 'req-123', 'user-456');

      expect(result.status).toBe('failed');
      expect(mockWealthRepository.failRequest).toHaveBeenCalledWith('req-123');
      // Verify units are NOT decremented when failing
      expect(mockWealthRepository.decrementUnits).not.toHaveBeenCalled();
    });

    it('should throw forbidden when not requester', async () => {
      mockWealthRepository.findById.mockResolvedValue(testData.wealth);
      mockWealthRepository.findRequestById.mockResolvedValue({
        id: 'req-123',
        wealthId: 'wealth-123',
        requesterId: 'user-456',
        status: 'accepted' as const,
      });

      await expect(wealthService.failRequest('wealth-123', 'req-123', 'user-789')).rejects.toThrow(
        'Forbidden: only the requester can mark request as failed'
      );
    });

    it('should throw error if request is not accepted', async () => {
      mockWealthRepository.findById.mockResolvedValue(testData.wealth);
      mockWealthRepository.findRequestById.mockResolvedValue({
        id: 'req-123',
        wealthId: 'wealth-123',
        requesterId: 'user-456',
        status: 'pending' as const,
      });

      await expect(wealthService.failRequest('wealth-123', 'req-123', 'user-456')).rejects.toThrow(
        'Only accepted requests can be marked as failed'
      );
    });
  });

  describe('searchWealth', () => {
    it('should search wealth in specific community', async () => {
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');
      mockWealthRepository.search.mockResolvedValue({
        rows: [testData.wealth],
        total: 1,
      });

      const result = await wealthService.searchWealth('user-123', {
        communityId: 'comm-123',
        q: 'test',
        page: 1,
        limit: 20,
      });

      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(result.hasMore).toBe(false);
    });

    it('should return empty results for user with no communities', async () => {
      mockCommunityMemberRepository.findByUser.mockResolvedValue([]);

      const result = await wealthService.searchWealth('user-123', {});

      expect(result.items).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(result.hasMore).toBe(false);
    });

    it('should add highlighted text when query is provided', async () => {
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');
      mockWealthRepository.search.mockResolvedValue({
        rows: [
          {
            ...testData.wealth,
            title: 'Test Item',
            description: 'A test description',
          },
        ],
        total: 1,
      });

      const result = await wealthService.searchWealth('user-123', {
        communityId: 'comm-123',
        q: 'test',
      });

      expect(result.items[0].highlightedTitle).toContain('**Test**');
      expect(result.items[0].highlightedDescription).toContain('**test**');
    });

    it('should handle pagination correctly', async () => {
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');
      mockWealthRepository.search.mockResolvedValue({
        rows: Array(20).fill(testData.wealth),
        total: 50,
      });

      const result = await wealthService.searchWealth('user-123', {
        communityId: 'comm-123',
        page: 2,
        limit: 20,
      });

      expect(result.page).toBe(2);
      expect(result.limit).toBe(20);
      expect(result.hasMore).toBe(true); // 40 items shown out of 50
    });

    it('should clamp page to minimum 1', async () => {
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');
      mockWealthRepository.search.mockResolvedValue({
        rows: [testData.wealth],
        total: 1,
      });

      const result = await wealthService.searchWealth('user-123', {
        communityId: 'comm-123',
        page: 0,
      });

      expect(result.page).toBe(1);
    });

    it('should clamp limit to maximum 100', async () => {
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');
      mockWealthRepository.search.mockResolvedValue({
        rows: [testData.wealth],
        total: 1,
      });

      const result = await wealthService.searchWealth('user-123', {
        communityId: 'comm-123',
        limit: 200,
      });

      expect(result.limit).toBe(100);
    });

    it('should search across all user communities when no communityId', async () => {
      mockCommunityMemberRepository.findByUser.mockResolvedValue([
        { resourceId: 'comm-1', role: 'member' },
        { resourceId: 'comm-2', role: 'member' },
      ]);
      mockWealthRepository.search.mockResolvedValue({
        rows: [testData.wealth],
        total: 1,
      });

      const result = await wealthService.searchWealth('user-123', {});

      expect(mockCommunityMemberRepository.findByUser).toHaveBeenCalledWith('user-123');
      expect(result.items).toHaveLength(1);
    });

    it('should handle search with filters', async () => {
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');
      mockWealthRepository.search.mockResolvedValue({
        rows: [testData.wealth],
        total: 1,
      });

      const result = await wealthService.searchWealth('user-123', {
        communityId: 'comm-123',
        durationType: 'timebound',
        distributionType: 'unit_based',
        status: 'active',
        endDateAfter: '2024-01-01',
      });

      expect(mockWealthRepository.search).toHaveBeenCalledWith(
        expect.objectContaining({
          durationType: 'timebound',
          distributionType: 'unit_based',
          status: 'active',
        })
      );
    });
  });

  describe('listMyCommunitiesWealth', () => {
    it('should list wealth from all user communities', async () => {
      mockCommunityMemberRepository.findByUser.mockResolvedValue([
        { resourceId: 'comm-1', role: 'member' },
        { resourceId: 'comm-2', role: 'member' },
      ]);
      mockWealthRepository.listByCommunities.mockResolvedValue([testData.wealth]);

      const result = await wealthService.listMyCommunitiesWealth('user-123');

      expect(result).toHaveLength(1);
      expect(mockWealthRepository.listByCommunities).toHaveBeenCalledWith(
        ['comm-1', 'comm-2'],
        undefined
      );
    });

    it('should return empty array if user has no communities', async () => {
      mockCommunityMemberRepository.findByUser.mockResolvedValue([]);

      const result = await wealthService.listMyCommunitiesWealth('user-123');

      expect(result).toHaveLength(0);
    });

    it('should filter by status', async () => {
      mockCommunityMemberRepository.findByUser.mockResolvedValue([
        { resourceId: 'comm-1', role: 'member' },
      ]);
      mockWealthRepository.listByCommunities.mockResolvedValue([testData.wealth]);

      await wealthService.listMyCommunitiesWealth('user-123', 'active');

      expect(mockWealthRepository.listByCommunities).toHaveBeenCalledWith(['comm-1'], 'active');
    });
  });

  describe('cancelWealth', () => {
    it('should cancel wealth when owner', async () => {
      mockWealthRepository.findById.mockResolvedValue({
        ...testData.wealth,
        createdBy: 'user-123',
      });
      mockWealthRepository.cancelWealth.mockResolvedValue({
        ...testData.wealth,
        status: 'cancelled' as const,
      });

      const result = await wealthService.cancelWealth('wealth-123', 'user-123');

      expect(result.status).toBe('cancelled');
      expect(mockWealthRepository.cancelWealth).toHaveBeenCalledWith('wealth-123');
    });

    it('should throw not found if wealth does not exist', async () => {
      mockWealthRepository.findById.mockResolvedValue(null);

      await expect(wealthService.cancelWealth('wealth-123', 'user-123')).rejects.toThrow(
        'Wealth not found'
      );
    });

    it('should throw error if cancelWealth returns null', async () => {
      mockWealthRepository.findById.mockResolvedValue({
        ...testData.wealth,
        createdBy: 'user-123',
      });
      mockWealthRepository.cancelWealth.mockResolvedValue(null);

      await expect(wealthService.cancelWealth('wealth-123', 'user-123')).rejects.toThrow(
        'Wealth not found'
      );
    });
  });

  describe('fulfillWealth', () => {
    it('should mark wealth as fulfilled when owner', async () => {
      mockWealthRepository.findById.mockResolvedValue({
        ...testData.wealth,
        createdBy: 'user-123',
      });
      mockWealthRepository.markFulfilled.mockResolvedValue({
        ...testData.wealth,
        status: 'fulfilled' as const,
      });

      const result = await wealthService.fulfillWealth('wealth-123', 'user-123');

      expect(result.status).toBe('fulfilled');
      expect(mockWealthRepository.markFulfilled).toHaveBeenCalledWith('wealth-123');
    });

    it('should throw error if markFulfilled returns null', async () => {
      mockWealthRepository.findById.mockResolvedValue({
        ...testData.wealth,
        createdBy: 'user-123',
      });
      mockWealthRepository.markFulfilled.mockResolvedValue(null);

      await expect(wealthService.fulfillWealth('wealth-123', 'user-123')).rejects.toThrow(
        'Wealth not found'
      );
    });
  });

  describe('updateWealth - validation', () => {
    it('should throw error for invalid status', async () => {
      mockWealthRepository.findById.mockResolvedValue({
        ...testData.wealth,
        createdBy: 'user-123',
      });

      await expect(
        wealthService.updateWealth('wealth-123', { status: 'invalid' as any }, 'user-123')
      ).rejects.toThrow('Invalid wealth status');
    });

    it('should throw error for invalid endDate', async () => {
      mockWealthRepository.findById.mockResolvedValue({
        ...testData.wealth,
        createdBy: 'user-123',
      });

      await expect(
        wealthService.updateWealth('wealth-123', { endDate: 'not-a-date' }, 'user-123')
      ).rejects.toThrow('Invalid endDate');
    });

    it('should throw error if updateWealth returns null', async () => {
      mockWealthRepository.findById.mockResolvedValue({
        ...testData.wealth,
        createdBy: 'user-123',
      });
      mockWealthRepository.updateWealth.mockResolvedValue(null);

      await expect(
        wealthService.updateWealth('wealth-123', { title: 'Updated' }, 'user-123')
      ).rejects.toThrow('Wealth not found');
    });
  });

  describe('listRequests', () => {
    it('should list all requests for wealth owner', async () => {
      mockWealthRepository.findById.mockResolvedValue({
        ...testData.wealth,
        createdBy: 'user-123',
      });
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');
      mockWealthRepository.listRequestsForWealth.mockResolvedValue([
        {
          id: 'req-1',
          wealthId: 'wealth-123',
          requesterId: 'user-456',
          status: 'pending' as const,
        },
      ]);

      const result = await wealthService.listRequests('wealth-123', 'user-123');

      expect(result).toHaveLength(1);
      expect(mockWealthRepository.listRequestsForWealth).toHaveBeenCalledWith('wealth-123');
    });

    it("should list only requester's requests for non-owner", async () => {
      mockWealthRepository.findById.mockResolvedValue({
        ...testData.wealth,
        createdBy: 'user-owner',
      });
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');
      mockWealthRepository.listRequestsForWealthByRequester.mockResolvedValue([
        {
          id: 'req-1',
          wealthId: 'wealth-123',
          requesterId: 'user-456',
          status: 'pending' as const,
        },
      ]);

      const result = await wealthService.listRequests('wealth-123', 'user-456');

      expect(result).toHaveLength(1);
      expect(mockWealthRepository.listRequestsForWealthByRequester).toHaveBeenCalledWith(
        'wealth-123',
        'user-456'
      );
    });
  });

  describe('fulfillRequest', () => {
    it('should fulfill request when owner', async () => {
      mockWealthRepository.findById.mockResolvedValue({
        ...testData.wealth,
        createdBy: 'user-123',
      });
      mockWealthRepository.findRequestById.mockResolvedValue({
        id: 'req-123',
        wealthId: 'wealth-123',
        status: 'accepted' as const,
      });
      mockWealthRepository.markRequestFulfilled.mockResolvedValue({
        id: 'req-123',
        status: 'fulfilled' as const,
      });

      const result = await wealthService.fulfillRequest('wealth-123', 'req-123', 'user-123');

      expect(result.status).toBe('fulfilled');
    });

    it('should allow fulfilling pending request', async () => {
      mockWealthRepository.findById.mockResolvedValue({
        ...testData.wealth,
        createdBy: 'user-123',
      });
      mockWealthRepository.findRequestById.mockResolvedValue({
        id: 'req-123',
        wealthId: 'wealth-123',
        status: 'pending' as const,
      });
      mockWealthRepository.markRequestFulfilled.mockResolvedValue({
        id: 'req-123',
        status: 'fulfilled' as const,
      });

      const result = await wealthService.fulfillRequest('wealth-123', 'req-123', 'user-123');

      expect(result.status).toBe('fulfilled');
    });

    it('should throw error for invalid request status', async () => {
      mockWealthRepository.findById.mockResolvedValue({
        ...testData.wealth,
        createdBy: 'user-123',
      });
      mockWealthRepository.findRequestById.mockResolvedValue({
        id: 'req-123',
        wealthId: 'wealth-123',
        status: 'rejected' as const,
      });

      await expect(
        wealthService.fulfillRequest('wealth-123', 'req-123', 'user-123')
      ).rejects.toThrow('Only pending or accepted requests can be marked fulfilled');
    });

    it('should throw error if markRequestFulfilled returns null', async () => {
      mockWealthRepository.findById.mockResolvedValue({
        ...testData.wealth,
        createdBy: 'user-123',
      });
      mockWealthRepository.findRequestById.mockResolvedValue({
        id: 'req-123',
        wealthId: 'wealth-123',
        status: 'accepted' as const,
      });
      mockWealthRepository.markRequestFulfilled.mockResolvedValue(null);

      await expect(
        wealthService.fulfillRequest('wealth-123', 'req-123', 'user-123')
      ).rejects.toThrow('Failed to update request');
    });
  });

  describe('rejectRequest', () => {
    it('should reject pending request', async () => {
      mockWealthRepository.findById.mockResolvedValue({
        ...testData.wealth,
        createdBy: 'user-123',
      });
      mockWealthRepository.findRequestById.mockResolvedValue({
        id: 'req-123',
        wealthId: 'wealth-123',
        status: 'pending' as const,
      });
      mockWealthRepository.rejectRequest.mockResolvedValue({
        id: 'req-123',
        status: 'rejected' as const,
      });

      const result = await wealthService.rejectRequest('wealth-123', 'req-123', 'user-123');

      expect(result.status).toBe('rejected');
    });

    it('should throw error if rejectRequest returns null', async () => {
      mockWealthRepository.findById.mockResolvedValue({
        ...testData.wealth,
        createdBy: 'user-123',
      });
      mockWealthRepository.findRequestById.mockResolvedValue({
        id: 'req-123',
        wealthId: 'wealth-123',
        status: 'pending' as const,
      });
      mockWealthRepository.rejectRequest.mockResolvedValue(null);

      await expect(
        wealthService.rejectRequest('wealth-123', 'req-123', 'user-123')
      ).rejects.toThrow('Failed to reject request');
    });
  });

  describe('listRequestsByUser', () => {
    it('should list all requests by user', async () => {
      mockWealthRepository.listRequestsByUser.mockResolvedValue([
        {
          id: 'req-1',
          wealthId: 'wealth-123',
          requesterId: 'user-123',
          status: 'pending' as const,
        },
      ]);

      const result = await wealthService.listRequestsByUser('user-123');

      expect(result).toHaveLength(1);
      expect(mockWealthRepository.listRequestsByUser).toHaveBeenCalledWith('user-123', undefined);
    });

    it('should filter by status', async () => {
      mockWealthRepository.listRequestsByUser.mockResolvedValue([
        {
          id: 'req-1',
          wealthId: 'wealth-123',
          requesterId: 'user-123',
          status: 'accepted' as const,
        },
      ]);

      const result = await wealthService.listRequestsByUser('user-123', ['accepted']);

      expect(mockWealthRepository.listRequestsByUser).toHaveBeenCalledWith('user-123', [
        'accepted',
      ]);
    });
  });

  describe('listIncomingRequests', () => {
    it("should list all incoming requests for user's wealth", async () => {
      mockWealthRepository.listIncomingRequestsByOwner.mockResolvedValue([
        {
          id: 'req-1',
          wealthId: 'wealth-123',
          requesterId: 'user-456',
          status: 'pending' as const,
        },
      ]);

      const result = await wealthService.listIncomingRequests('user-123');

      expect(result).toHaveLength(1);
    });

    it('should include requester display names', async () => {
      mockWealthRepository.listIncomingRequestsByOwner.mockResolvedValue([
        {
          id: 'req-1',
          wealthId: 'wealth-123',
          requesterId: 'user-456',
          status: 'pending' as const,
        },
      ]);
      mockAppUserRepository.findById.mockResolvedValue({
        id: 'user-456',
        displayName: 'Test User',
        username: 'testuser',
      });

      const result = await wealthService.listIncomingRequests('user-123');

      expect(result[0].requesterDisplayName).toBeDefined();
      expect(result[0].requesterDisplayName).toBe('Test User');
    });
  });

  describe('cancelRequest - advanced scenarios', () => {
    it('should allow owner to cancel request', async () => {
      mockWealthRepository.findById.mockResolvedValue({
        ...testData.wealth,
        createdBy: 'user-owner',
      });
      mockWealthRepository.findRequestById.mockResolvedValue({
        id: 'req-123',
        wealthId: 'wealth-123',
        requesterId: 'user-456',
        status: 'pending' as const,
      });
      mockWealthRepository.cancelRequest.mockResolvedValue({
        id: 'req-123',
        status: 'cancelled' as const,
      });

      const result = await wealthService.cancelRequest('wealth-123', 'req-123', 'user-owner');

      expect(result.status).toBe('cancelled');
    });

    it('should allow requester to cancel their own request', async () => {
      mockWealthRepository.findById.mockResolvedValue({
        ...testData.wealth,
        createdBy: 'user-owner',
      });
      mockWealthRepository.findRequestById.mockResolvedValue({
        id: 'req-123',
        wealthId: 'wealth-123',
        requesterId: 'user-456',
        status: 'pending' as const,
      });
      mockWealthRepository.cancelRequest.mockResolvedValue({
        id: 'req-123',
        status: 'cancelled' as const,
      });

      const result = await wealthService.cancelRequest('wealth-123', 'req-123', 'user-456');

      expect(result.status).toBe('cancelled');
    });

    it('should allow cancelling accepted request', async () => {
      mockWealthRepository.findById.mockResolvedValue({
        ...testData.wealth,
        createdBy: 'user-123',
      });
      mockWealthRepository.findRequestById.mockResolvedValue({
        id: 'req-123',
        wealthId: 'wealth-123',
        requesterId: 'user-456',
        status: 'accepted' as const,
      });
      mockWealthRepository.cancelRequest.mockResolvedValue({
        id: 'req-123',
        status: 'cancelled' as const,
      });

      const result = await wealthService.cancelRequest('wealth-123', 'req-123', 'user-123');

      expect(result.status).toBe('cancelled');
    });

    it('should throw error for invalid request status', async () => {
      mockWealthRepository.findById.mockResolvedValue(testData.wealth);
      mockWealthRepository.findRequestById.mockResolvedValue({
        id: 'req-123',
        wealthId: 'wealth-123',
        requesterId: 'user-456',
        status: 'fulfilled' as const,
      });

      await expect(
        wealthService.cancelRequest('wealth-123', 'req-123', 'user-456')
      ).rejects.toThrow('Only pending or accepted requests can be cancelled');
    });

    it('should throw error if neither owner nor requester', async () => {
      mockWealthRepository.findById.mockResolvedValue({
        ...testData.wealth,
        createdBy: 'user-owner',
      });
      mockWealthRepository.findRequestById.mockResolvedValue({
        id: 'req-123',
        wealthId: 'wealth-123',
        requesterId: 'user-requester',
        status: 'pending' as const,
      });

      await expect(
        wealthService.cancelRequest('wealth-123', 'req-123', 'user-other')
      ).rejects.toThrow('Forbidden: only requester or owner can cancel this request');
    });

    it('should throw error if cancelRequest returns null', async () => {
      mockWealthRepository.findById.mockResolvedValue({
        ...testData.wealth,
        createdBy: 'user-123',
      });
      mockWealthRepository.findRequestById.mockResolvedValue({
        id: 'req-123',
        wealthId: 'wealth-123',
        requesterId: 'user-456',
        status: 'pending' as const,
      });
      mockWealthRepository.cancelRequest.mockResolvedValue(null);

      await expect(
        wealthService.cancelRequest('wealth-123', 'req-123', 'user-123')
      ).rejects.toThrow('Failed to cancel request');
    });
  });

  describe('acceptRequest - unit decrement', () => {
    it('should accept request for unit_based and decrement units', async () => {
      mockWealthRepository.findById.mockResolvedValue({
        ...testData.wealth,
        createdBy: 'user-123',
        distributionType: 'unit_based',
        unitsAvailable: 10,
      });
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');
      mockWealthRepository.findRequestById.mockResolvedValue({
        id: 'req-123',
        wealthId: 'wealth-123',
        status: 'pending' as const,
        unitsRequested: 2,
      });
      mockWealthRepository.acceptRequest.mockResolvedValue({
        id: 'req-123',
        status: 'accepted' as const,
      });
      mockWealthRepository.decrementUnits.mockResolvedValue({
        ...testData.wealth,
        unitsAvailable: 8,
      });

      const result = await wealthService.acceptRequest('wealth-123', 'req-123', 'user-123');

      expect(result.request.status).toBe('accepted');
      // NOTE: Units should NOT be decremented at accept time anymore
      // They are decremented when requester confirms via confirmRequest()
      expect(mockWealthRepository.decrementUnits).not.toHaveBeenCalled();
    });

    it('should throw error if acceptRequest returns null', async () => {
      mockWealthRepository.findById.mockResolvedValue({
        ...testData.wealth,
        createdBy: 'user-123',
      });
      mockWealthRepository.findRequestById.mockResolvedValue({
        id: 'req-123',
        wealthId: 'wealth-123',
        status: 'pending' as const,
      });
      mockWealthRepository.acceptRequest.mockResolvedValue(null);

      await expect(
        wealthService.acceptRequest('wealth-123', 'req-123', 'user-123')
      ).rejects.toThrow('Failed to accept request');
    });
  });

  describe('confirmRequest - edge cases', () => {
    it('should throw error if decrementUnits returns null', async () => {
      mockWealthRepository.findById.mockResolvedValue({
        ...testData.wealth,
        distributionType: 'unit_based',
        unitsAvailable: 10,
      });
      mockWealthRepository.findRequestById.mockResolvedValue({
        id: 'req-123',
        wealthId: 'wealth-123',
        requesterId: 'user-456',
        status: 'accepted' as const,
        unitsRequested: 2,
      });
      mockWealthRepository.decrementUnits.mockResolvedValue(null);

      await expect(
        wealthService.confirmRequest('wealth-123', 'req-123', 'user-456')
      ).rejects.toThrow('Failed to update wealth units');
    });

    it('should throw error if confirmRequest returns null', async () => {
      mockWealthRepository.findById.mockResolvedValue({
        ...testData.wealth,
        distributionType: 'request_based',
      });
      mockWealthRepository.findRequestById.mockResolvedValue({
        id: 'req-123',
        wealthId: 'wealth-123',
        requesterId: 'user-456',
        status: 'accepted' as const,
      });
      mockWealthRepository.confirmRequest.mockResolvedValue(null);

      await expect(
        wealthService.confirmRequest('wealth-123', 'req-123', 'user-456')
      ).rejects.toThrow('Failed to confirm request');
    });
  });

  describe('requestWealth - unit_based validation', () => {
    it('should throw error if unitsRequested is missing for unit_based', async () => {
      mockWealthRepository.findById.mockResolvedValue({
        ...testData.wealth,
        status: 'active' as const,
        distributionType: 'unit_based',
        unitsAvailable: 10,
      });
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');

      await expect(wealthService.requestWealth('wealth-123', 'user-456')).rejects.toThrow(
        'unitsRequested must be a positive integer for unit_based wealth'
      );
    });

    it('should throw error if unitsRequested exceeds available units', async () => {
      mockWealthRepository.findById.mockResolvedValue({
        ...testData.wealth,
        status: 'active' as const,
        distributionType: 'unit_based',
        unitsAvailable: 5,
      });
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');

      await expect(wealthService.requestWealth('wealth-123', 'user-456', null, 10)).rejects.toThrow(
        'Not enough units available'
      );
    });
  });
});
