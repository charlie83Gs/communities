import { describe, test, expect, mock, beforeEach } from 'bun:test';
import { inviteController } from './invite.controller';
import { inviteService } from '@/services/invite.service';
import {
  createMockAuthenticatedRequest,
  createMockResponse,
  createMockNext,
  testData,
} from '../../../tests/helpers/testUtils';

// Mock the service
const mockInviteService = {
  createUserInvite: mock(() => Promise.resolve(testData.invite)),
  createLinkInvite: mock(() => Promise.resolve(testData.invite)),
  cancelInvite: mock(() => Promise.resolve(testData.invite)),
  redeemUserInvite: mock(() => Promise.resolve(testData.invite)),
  redeemLinkInviteBySecret: mock(() => Promise.resolve(testData.invite)),
  getPendingUserInvites: mock(() => Promise.resolve([testData.invite])),
  getActiveLinkInvites: mock(() => Promise.resolve([testData.invite])),
};

describe('InviteController', () => {
  beforeEach(() => {
    // Reset all mocks
    Object.values(mockInviteService).forEach(m => m.mockReset());

    // Replace service methods with mocks
    (inviteService.createUserInvite as any) = mockInviteService.createUserInvite;
    (inviteService.createLinkInvite as any) = mockInviteService.createLinkInvite;
    (inviteService.cancelInvite as any) = mockInviteService.cancelInvite;
    (inviteService.redeemUserInvite as any) = mockInviteService.redeemUserInvite;
    (inviteService.redeemLinkInviteBySecret as any) = mockInviteService.redeemLinkInviteBySecret;
    (inviteService.getPendingUserInvites as any) = mockInviteService.getPendingUserInvites;
    (inviteService.getActiveLinkInvites as any) = mockInviteService.getActiveLinkInvites;
  });

  describe('createUserInvite', () => {
    test('should create user invite successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123' },
        body: { invitedUserId: 'user-456', role: 'member' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      mockInviteService.createUserInvite.mockResolvedValue(testData.invite);

      await inviteController.createUserInvite(req, res, next);

      expect(mockInviteService.createUserInvite).toHaveBeenCalledWith(
        { communityId: 'comm-123', invitedUserId: 'user-456', role: 'member' },
        'user-123'
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: testData.invite,
        message: 'Invite created',
      });
    });

    test('should handle errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123' },
        body: { invitedUserId: 'user-456', role: 'member' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new Error('Service error');
      mockInviteService.createUserInvite.mockRejectedValue(error);

      await inviteController.createUserInvite(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('createLinkInvite', () => {
    test('should create link invite successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123' },
        body: { role: 'member', title: 'Test Invite', expiresAt: '2024-12-31T23:59:59Z' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      mockInviteService.createLinkInvite.mockResolvedValue(testData.invite);

      await inviteController.createLinkInvite(req, res, next);

      expect(mockInviteService.createLinkInvite).toHaveBeenCalledWith(
        { communityId: 'comm-123', role: 'member', title: 'Test Invite', expiresAt: '2024-12-31T23:59:59Z' },
        'user-123'
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: testData.invite,
        message: 'Link invite created',
      });
    });

    test('should handle errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123' },
        body: { role: 'member', expiresAt: '2024-12-31T23:59:59Z' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new Error('Service error');
      mockInviteService.createLinkInvite.mockRejectedValue(error);

      await inviteController.createLinkInvite(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('cancelInvite', () => {
    test('should cancel invite successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { id: 'invite-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      mockInviteService.cancelInvite.mockResolvedValue(testData.invite);

      await inviteController.cancelInvite(req, res, next);

      expect(mockInviteService.cancelInvite).toHaveBeenCalledWith('invite-123', 'user-123');
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: testData.invite,
        message: 'Invite cancelled',
      });
    });

    test('should handle errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { id: 'invite-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new Error('Not found');
      mockInviteService.cancelInvite.mockRejectedValue(error);

      await inviteController.cancelInvite(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('redeemUserInvite', () => {
    test('should redeem user invite successfully', async () => {
      const req = createMockAuthenticatedRequest('user-456', {
        params: { id: 'invite-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      mockInviteService.redeemUserInvite.mockResolvedValue(testData.invite);

      await inviteController.redeemUserInvite(req, res, next);

      expect(mockInviteService.redeemUserInvite).toHaveBeenCalledWith('invite-123', 'user-456');
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: testData.invite,
        message: 'Invite redeemed',
      });
    });

    test('should handle errors', async () => {
      const req = createMockAuthenticatedRequest('user-456', {
        params: { id: 'invite-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new Error('Invalid invite');
      mockInviteService.redeemUserInvite.mockRejectedValue(error);

      await inviteController.redeemUserInvite(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('redeemLinkInvite', () => {
    test('should redeem link invite successfully', async () => {
      const req = createMockAuthenticatedRequest('user-456', {
        body: { secret: 'test-secret-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      mockInviteService.redeemLinkInviteBySecret.mockResolvedValue(testData.invite);

      await inviteController.redeemLinkInvite(req, res, next);

      expect(mockInviteService.redeemLinkInviteBySecret).toHaveBeenCalledWith('test-secret-123', 'user-456');
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: testData.invite,
        message: 'Link invite redeemed',
      });
    });

    test('should handle errors', async () => {
      const req = createMockAuthenticatedRequest('user-456', {
        body: { secret: 'test-secret-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new Error('Invalid secret');
      mockInviteService.redeemLinkInviteBySecret.mockRejectedValue(error);

      await inviteController.redeemLinkInvite(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getUserInvites', () => {
    test('should get pending user invites successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      mockInviteService.getPendingUserInvites.mockResolvedValue([testData.invite]);

      await inviteController.getUserInvites(req, res, next);

      expect(mockInviteService.getPendingUserInvites).toHaveBeenCalledWith('comm-123', 'user-123');
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: [testData.invite],
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
      mockInviteService.getPendingUserInvites.mockRejectedValue(error);

      await inviteController.getUserInvites(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getLinkInvites', () => {
    test('should get active link invites successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      mockInviteService.getActiveLinkInvites.mockResolvedValue([testData.invite]);

      await inviteController.getLinkInvites(req, res, next);

      expect(mockInviteService.getActiveLinkInvites).toHaveBeenCalledWith('comm-123', 'user-123');
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: [testData.invite],
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
      mockInviteService.getActiveLinkInvites.mockRejectedValue(error);

      await inviteController.getLinkInvites(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('deleteLinkInvite', () => {
    test('should delete link invite successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { id: 'invite-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      mockInviteService.cancelInvite.mockResolvedValue(testData.invite);

      await inviteController.deleteLinkInvite(req, res, next);

      expect(mockInviteService.cancelInvite).toHaveBeenCalledWith('invite-123', 'user-123');
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: testData.invite,
        message: 'Link invite deleted',
      });
    });

    test('should handle errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { id: 'invite-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new Error('Not found');
      mockInviteService.cancelInvite.mockRejectedValue(error);

      await inviteController.deleteLinkInvite(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
