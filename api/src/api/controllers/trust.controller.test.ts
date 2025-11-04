import { describe, test, expect, mock, beforeEach } from 'bun:test';
import { trustController } from './trust.controller';
import { trustService } from '@/services/trust.service';
import {
  createMockAuthenticatedRequest,
  createMockResponse,
  createMockNext,
} from '../../../tests/helpers/testUtils';

// Mock the service
const mockTrustService = {
  getEventsForUser: mock(() => Promise.resolve({ events: [], total: 0, page: 1, limit: 50 })),
  getTrustView: mock(() => Promise.resolve({ userId: 'user-123', communityId: 'comm-123', points: 10 })),
  listCommunityTrust: mock(() => Promise.resolve({ data: [], total: 0, page: 1, limit: 50 })),
  getTrustMe: mock(() => Promise.resolve({ trusted: true, points: 10, roles: ['member'], canAwardTrust: true })),
  getMyEventsAllCommunities: mock(() => Promise.resolve({ events: [], total: 0, page: 1, limit: 50 })),
  listMyTrustAcrossCommunities: mock(() => Promise.resolve({ data: [], total: 0, page: 1, limit: 50 })),
  awardTrust: mock(() => Promise.resolve({ success: true })),
  removeTrust: mock(() => Promise.resolve({ success: true })),
  listMyAwards: mock(() => Promise.resolve([])),
  listAwardsToUser: mock(() => Promise.resolve([])),
  getTrustHistory: mock(() => Promise.resolve({ history: [], total: 0, page: 1, limit: 50 })),
  getAdminGrants: mock(() => Promise.resolve([])),
  setAdminGrant: mock(() => Promise.resolve({ success: true })),
  deleteAdminGrant: mock(() => Promise.resolve({ success: true })),
};

describe('TrustController', () => {
  beforeEach(() => {
    // Reset all mocks
    Object.values(mockTrustService).forEach(m => m.mockReset());

    // Replace service methods with mocks
    Object.keys(mockTrustService).forEach(key => {
      (trustService as any)[key] = (mockTrustService as any)[key];
    });
  });

  describe('getEventsForUser', () => {
    test('should get events for user successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123' },
        query: { userId: 'user-456', page: '1', limit: '50' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const result = { events: [], total: 0, page: 1, limit: 50 };
      mockTrustService.getEventsForUser.mockResolvedValue(result);

      await trustController.getEventsForUser(req, res, next);

      expect(mockTrustService.getEventsForUser).toHaveBeenCalledWith('comm-123', 'user-123', 'user-456', 1, 50);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: result,
        message: 'Success',
      });
    });

    test('should handle errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123' },
        query: { userId: 'user-456' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new Error('Forbidden');
      mockTrustService.getEventsForUser.mockRejectedValue(error);

      await trustController.getEventsForUser(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getTrustView', () => {
    test('should get trust view successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123', userId: 'user-456' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const result = { userId: 'user-456', communityId: 'comm-123', points: 15 };
      mockTrustService.getTrustView.mockResolvedValue(result);

      await trustController.getTrustView(req, res, next);

      expect(mockTrustService.getTrustView).toHaveBeenCalledWith('comm-123', 'user-123', 'user-456');
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: result,
        message: 'Success',
      });
    });

    test('should handle errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123', userId: 'user-456' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new Error('Not found');
      mockTrustService.getTrustView.mockRejectedValue(error);

      await trustController.getTrustView(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('listCommunityTrust', () => {
    test('should list community trust successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123' },
        query: { page: '1', limit: '50' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const result = { data: [], total: 0, page: 1, limit: 50 };
      mockTrustService.listCommunityTrust.mockResolvedValue(result);

      await trustController.listCommunityTrust(req, res, next);

      expect(mockTrustService.listCommunityTrust).toHaveBeenCalledWith('comm-123', 'user-123', 1, 50);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: result,
        message: 'Success',
      });
    });

    test('should handle errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123' },
        query: {},
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new Error('Forbidden');
      mockTrustService.listCommunityTrust.mockRejectedValue(error);

      await trustController.listCommunityTrust(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getTrustMe', () => {
    test('should get my trust summary successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const result = { trusted: true, points: 10, roles: ['member'], canAwardTrust: true };
      mockTrustService.getTrustMe.mockResolvedValue(result);

      await trustController.getTrustMe(req, res, next);

      expect(mockTrustService.getTrustMe).toHaveBeenCalledWith('comm-123', 'user-123');
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: result,
        message: 'Success',
      });
    });

    test('should handle errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new Error('Not found');
      mockTrustService.getTrustMe.mockRejectedValue(error);

      await trustController.getTrustMe(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('listMyEventsAllCommunities', () => {
    test('should list my events across all communities successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        query: { page: '1', limit: '50' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const result = { events: [], total: 0, page: 1, limit: 50 };
      mockTrustService.getMyEventsAllCommunities.mockResolvedValue(result);

      await trustController.listMyEventsAllCommunities(req, res, next);

      expect(mockTrustService.getMyEventsAllCommunities).toHaveBeenCalledWith('user-123', 1, 50);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: result,
        message: 'Success',
      });
    });

    test('should handle errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        query: {},
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new Error('Database error');
      mockTrustService.getMyEventsAllCommunities.mockRejectedValue(error);

      await trustController.listMyEventsAllCommunities(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('listMyTrustAcrossCommunities', () => {
    test('should list my trust across communities successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        query: { page: '1', limit: '50' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const result = { data: [], total: 0, page: 1, limit: 50 };
      mockTrustService.listMyTrustAcrossCommunities.mockResolvedValue(result);

      await trustController.listMyTrustAcrossCommunities(req, res, next);

      expect(mockTrustService.listMyTrustAcrossCommunities).toHaveBeenCalledWith('user-123', 1, 50);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: result,
        message: 'Success',
      });
    });

    test('should handle errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        query: {},
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new Error('Database error');
      mockTrustService.listMyTrustAcrossCommunities.mockRejectedValue(error);

      await trustController.listMyTrustAcrossCommunities(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('awardTrust', () => {
    test('should award trust successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123', toUserId: 'user-456' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const result = { success: true };
      mockTrustService.awardTrust.mockResolvedValue(result);

      await trustController.awardTrust(req, res, next);

      expect(mockTrustService.awardTrust).toHaveBeenCalledWith('comm-123', 'user-123', 'user-456');
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: result,
        message: 'Trust awarded successfully',
      });
    });

    test('should handle errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123', toUserId: 'user-456' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new Error('Already awarded');
      mockTrustService.awardTrust.mockRejectedValue(error);

      await trustController.awardTrust(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('removeTrust', () => {
    test('should remove trust successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123', toUserId: 'user-456' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const result = { success: true };
      mockTrustService.removeTrust.mockResolvedValue(result);

      await trustController.removeTrust(req, res, next);

      expect(mockTrustService.removeTrust).toHaveBeenCalledWith('comm-123', 'user-123', 'user-456');
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: result,
        message: 'Trust removed successfully',
      });
    });

    test('should handle errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123', toUserId: 'user-456' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new Error('No award to remove');
      mockTrustService.removeTrust.mockRejectedValue(error);

      await trustController.removeTrust(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('listMyAwards', () => {
    test('should list my awards successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const result = [{ toUserId: 'user-456', createdAt: new Date() }];
      mockTrustService.listMyAwards.mockResolvedValue(result);

      await trustController.listMyAwards(req, res, next);

      expect(mockTrustService.listMyAwards).toHaveBeenCalledWith('comm-123', 'user-123');
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: result,
        message: 'Success',
      });
    });

    test('should handle errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new Error('Forbidden');
      mockTrustService.listMyAwards.mockRejectedValue(error);

      await trustController.listMyAwards(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('listAwardsToUser', () => {
    test('should list awards to user successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123', userId: 'user-456' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const result = [{ fromUserId: 'user-789', createdAt: new Date() }];
      mockTrustService.listAwardsToUser.mockResolvedValue(result);

      await trustController.listAwardsToUser(req, res, next);

      expect(mockTrustService.listAwardsToUser).toHaveBeenCalledWith('comm-123', 'user-123', 'user-456');
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: result,
        message: 'Success',
      });
    });

    test('should handle errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123', userId: 'user-456' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new Error('Forbidden');
      mockTrustService.listAwardsToUser.mockRejectedValue(error);

      await trustController.listAwardsToUser(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getTrustHistory', () => {
    test('should get trust history successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123', userId: 'user-456' },
        query: { page: '1', limit: '50' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const result = { history: [], total: 0, page: 1, limit: 50 };
      mockTrustService.getTrustHistory.mockResolvedValue(result);

      await trustController.getTrustHistory(req, res, next);

      expect(mockTrustService.getTrustHistory).toHaveBeenCalledWith('comm-123', 'user-123', 'user-456', 1, 50);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: result,
        message: 'Success',
      });
    });

    test('should handle errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123', userId: 'user-456' },
        query: {},
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new Error('Forbidden');
      mockTrustService.getTrustHistory.mockRejectedValue(error);

      await trustController.getTrustHistory(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getAdminGrants', () => {
    test('should get admin grants successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const result = [{ userId: 'user-456', amount: 10 }];
      mockTrustService.getAdminGrants.mockResolvedValue(result);

      await trustController.getAdminGrants(req, res, next);

      expect(mockTrustService.getAdminGrants).toHaveBeenCalledWith('comm-123', 'user-123');
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: result,
        message: 'Success',
      });
    });

    test('should handle errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new Error('Not an admin');
      mockTrustService.getAdminGrants.mockRejectedValue(error);

      await trustController.getAdminGrants(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('setAdminGrant', () => {
    test('should set admin grant successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123', toUserId: 'user-456' },
        body: { amount: 10 },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const result = { success: true };
      mockTrustService.setAdminGrant.mockResolvedValue(result);

      await trustController.setAdminGrant(req, res, next);

      expect(mockTrustService.setAdminGrant).toHaveBeenCalledWith('comm-123', 'user-123', 'user-456', 10);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: result,
        message: 'Admin grant set successfully',
      });
    });

    test('should handle errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123', toUserId: 'user-456' },
        body: { amount: 10 },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new Error('Not an admin');
      mockTrustService.setAdminGrant.mockRejectedValue(error);

      await trustController.setAdminGrant(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('updateAdminGrant', () => {
    test('should update admin grant successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123', toUserId: 'user-456' },
        body: { amount: 15 },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const result = { success: true };
      mockTrustService.setAdminGrant.mockResolvedValue(result);

      await trustController.updateAdminGrant(req, res, next);

      expect(mockTrustService.setAdminGrant).toHaveBeenCalledWith('comm-123', 'user-123', 'user-456', 15);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: result,
        message: 'Admin grant updated successfully',
      });
    });

    test('should handle errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123', toUserId: 'user-456' },
        body: { amount: 15 },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new Error('Not an admin');
      mockTrustService.setAdminGrant.mockRejectedValue(error);

      await trustController.updateAdminGrant(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('deleteAdminGrant', () => {
    test('should delete admin grant successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123', toUserId: 'user-456' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const result = { success: true };
      mockTrustService.deleteAdminGrant.mockResolvedValue(result);

      await trustController.deleteAdminGrant(req, res, next);

      expect(mockTrustService.deleteAdminGrant).toHaveBeenCalledWith('comm-123', 'user-123', 'user-456');
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: result,
        message: 'Admin grant deleted successfully',
      });
    });

    test('should handle errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123', toUserId: 'user-456' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new Error('Not found');
      mockTrustService.deleteAdminGrant.mockRejectedValue(error);

      await trustController.deleteAdminGrant(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
