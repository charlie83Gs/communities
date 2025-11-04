import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { wealthService } from '@/services/wealth.service';
import { wealthRepository } from '@/repositories/wealth.repository';
import { communityMemberRepository } from '@/repositories/communityMember.repository';
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
  createWealthRequest: mock(() => Promise.resolve({ id: 'req-123', wealthId: 'wealth-123', requesterId: 'user-123', status: 'pending' as const })),
  findRequestById: mock(() => Promise.resolve(null)),
  listRequestsForWealth: mock(() => Promise.resolve([])),
  listRequestsForWealthByRequester: mock(() => Promise.resolve([])),
  listRequestsByUser: mock(() => Promise.resolve([])),
  acceptRequest: mock(() => Promise.resolve({ id: 'req-123', status: 'accepted' as const })),
  markRequestFulfilled: mock(() => Promise.resolve({ id: 'req-123', status: 'fulfilled' as const })),
  rejectRequest: mock(() => Promise.resolve({ id: 'req-123', status: 'rejected' as const })),
  cancelRequest: mock(() => Promise.resolve({ id: 'req-123', status: 'cancelled' as const })),
  decrementUnits: mock(() => Promise.resolve(testData.wealth)),
};

const mockCommunityMemberRepository = {
  getUserRole: mock(() => Promise.resolve('member')),
  findByUser: mock(() => Promise.resolve([{ resourceId: 'comm-123', role: 'member' }])),
};

const mockOpenFGAService = {
  assignRole: mock(() => Promise.resolve()),
  createRelationship: mock(() => Promise.resolve()),
};

describe('WealthService', () => {
  beforeEach(() => {
    Object.values(mockWealthRepository).forEach(m => m.mockReset());
    Object.values(mockCommunityMemberRepository).forEach(m => m.mockReset());
    Object.values(mockOpenFGAService).forEach(m => m.mockReset());

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
    (wealthRepository.listRequestsForWealthByRequester as any) = mockWealthRepository.listRequestsForWealthByRequester;
    (wealthRepository.listRequestsByUser as any) = mockWealthRepository.listRequestsByUser;
    (wealthRepository.acceptRequest as any) = mockWealthRepository.acceptRequest;
    (wealthRepository.markRequestFulfilled as any) = mockWealthRepository.markRequestFulfilled;
    (wealthRepository.rejectRequest as any) = mockWealthRepository.rejectRequest;
    (wealthRepository.cancelRequest as any) = mockWealthRepository.cancelRequest;
    (wealthRepository.decrementUnits as any) = mockWealthRepository.decrementUnits;
    (communityMemberRepository.getUserRole as any) = mockCommunityMemberRepository.getUserRole;
    (communityMemberRepository.findByUser as any) = mockCommunityMemberRepository.findByUser;
    (openFGAService.assignRole as any) = mockOpenFGAService.assignRole;
    (openFGAService.createRelationship as any) = mockOpenFGAService.createRelationship;
  });

  describe('createWealth', () => {
    it('should create wealth for community member', async () => {
      // Reconfigure mocks for this test
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');
      mockWealthRepository.createWealth.mockResolvedValue(testData.wealth);
      mockOpenFGAService.assignRole.mockResolvedValue(undefined);

      const result = await wealthService.createWealth({
        communityId: 'comm-123',
        itemId: 'item-123',
        title: 'Test Wealth',
        durationType: 'unlimited',
        distributionType: 'request_based',
      }, 'user-123');

      expect(result.id).toBe('wealth-123');
      expect(mockWealthRepository.createWealth).toHaveBeenCalled();
      expect(mockOpenFGAService.assignRole).toHaveBeenCalled();
    });

    it('should throw error for non-member', async () => {
      mockCommunityMemberRepository.getUserRole.mockResolvedValue(null);

      await expect(
        wealthService.createWealth({
          communityId: 'comm-123',
          itemId: 'item-123',
          title: 'Test',
          durationType: 'unlimited',
          distributionType: 'request_based',
        }, 'user-123')
      ).rejects.toThrow('Forbidden');
    });

    it('should throw error for timebound without endDate', async () => {
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');

      await expect(
        wealthService.createWealth({
          communityId: 'comm-123',
          itemId: 'item-123',
          title: 'Test',
          durationType: 'timebound',
          distributionType: 'request_based',
        }, 'user-123')
      ).rejects.toThrow('endDate is required for timebound wealth');
    });

    it('should throw error for unit_based without units', async () => {
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');

      await expect(
        wealthService.createWealth({
          communityId: 'comm-123',
          itemId: 'item-123',
          title: 'Test',
          durationType: 'unlimited',
          distributionType: 'unit_based',
        }, 'user-123')
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

      await expect(
        wealthService.getWealth('wealth-123', 'user-123')
      ).rejects.toThrow('Wealth not found');
    });

    it('should throw forbidden for non-member', async () => {
      // Reconfigure mocks for this test
      mockWealthRepository.findById.mockResolvedValue(testData.wealth);
      mockCommunityMemberRepository.getUserRole.mockResolvedValue(null);

      await expect(
        wealthService.getWealth('wealth-123', 'user-123')
      ).rejects.toThrow('Forbidden');
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

      const result = await wealthService.updateWealth('wealth-123', { title: 'Updated' }, 'user-123');

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

      await expect(
        wealthService.requestWealth('wealth-123', 'user-456')
      ).rejects.toThrow('Wealth is not active');
    });
  });

  describe('acceptRequest', () => {
    it('should accept request when owner', async () => {
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
});
