import { describe, test, expect, mock, beforeEach } from 'bun:test';
import { wealthController } from './wealth.controller';
import { wealthService } from '@/services/wealth.service';
import { wealthCommentService } from '@/services/wealthComment.service';
import {
  createMockAuthenticatedRequest,
  createMockResponse,
  createMockNext,
  testData,
} from '../../../tests/helpers/testUtils';

// Mock the services
const mockWealthService = {
  listCommunityWealth: mock(() => Promise.resolve([testData.wealth])),
  listMyCommunitiesWealth: mock(() => Promise.resolve([testData.wealth])),
  searchWealth: mock(() => Promise.resolve({ items: [testData.wealth], total: 1, page: 1, limit: 20, hasMore: false })),
  createWealth: mock(() => Promise.resolve(testData.wealth)),
  getWealth: mock(() => Promise.resolve(testData.wealth)),
  updateWealth: mock(() => Promise.resolve(testData.wealth)),
  cancelWealth: mock(() => Promise.resolve(testData.wealth)),
  fulfillWealth: mock(() => Promise.resolve(testData.wealth)),
  requestWealth: mock(() => Promise.resolve({ id: 'request-123', status: 'pending' })),
  listRequests: mock(() => Promise.resolve([])),
  acceptRequest: mock(() => Promise.resolve({ id: 'request-123', status: 'accepted' })),
  rejectRequest: mock(() => Promise.resolve({ id: 'request-123', status: 'rejected' })),
  cancelRequest: mock(() => Promise.resolve({ id: 'request-123', status: 'cancelled' })),
  listRequestsByUser: mock(() => Promise.resolve([])),
};

const mockWealthCommentService = {
  createComment: mock(() => Promise.resolve({ id: 'comment-123', content: 'Test comment' })),
  getCommentsByWealthId: mock(() => Promise.resolve([])),
  updateComment: mock(() => Promise.resolve({ id: 'comment-123', content: 'Updated comment' })),
  deleteComment: mock(() => Promise.resolve()),
};

describe('WealthController', () => {
  beforeEach(() => {
    // Reset all mocks
    Object.values(mockWealthService).forEach(m => m.mockReset());
    Object.values(mockWealthCommentService).forEach(m => m.mockReset());

    // Replace service methods with mocks
    Object.keys(mockWealthService).forEach(key => {
      (wealthService as any)[key] = (mockWealthService as any)[key];
    });
    Object.keys(mockWealthCommentService).forEach(key => {
      (wealthCommentService as any)[key] = (mockWealthCommentService as any)[key];
    });
  });

  describe('list', () => {
    test('should list wealth for specific community', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        query: { communityId: 'comm-123', status: 'active' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      mockWealthService.listCommunityWealth.mockResolvedValue([testData.wealth]);

      await wealthController.list(req, res, next);

      expect(mockWealthService.listCommunityWealth).toHaveBeenCalledWith('comm-123', 'user-123', 'active');
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: [testData.wealth],
        message: 'Success',
      });
    });

    test('should list wealth for all my communities', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        query: {},
      });
      const res = createMockResponse();
      const next = createMockNext();

      mockWealthService.listMyCommunitiesWealth.mockResolvedValue([testData.wealth]);

      await wealthController.list(req, res, next);

      expect(mockWealthService.listMyCommunitiesWealth).toHaveBeenCalledWith('user-123', undefined);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: [testData.wealth],
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
      mockWealthService.listMyCommunitiesWealth.mockRejectedValue(error);

      await wealthController.list(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('search', () => {
    test('should search wealth successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        query: { q: 'test', communityId: 'comm-123', page: '1', limit: '20' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const result = { items: [testData.wealth], total: 1, page: 1, limit: 20, hasMore: false };
      mockWealthService.searchWealth.mockResolvedValue(result);

      await wealthController.search(req, res, next);

      expect(mockWealthService.searchWealth).toHaveBeenCalledWith('user-123', expect.objectContaining({
        q: 'test',
        communityId: 'comm-123',
        page: 1,
        limit: 20,
      }));
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          items: [testData.wealth],
          pagination: { total: 1, page: 1, limit: 20, hasMore: false },
        },
        message: 'Success',
      });
    });

    test('should handle errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        query: {},
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new Error('Search error');
      mockWealthService.searchWealth.mockRejectedValue(error);

      await wealthController.search(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('create', () => {
    test('should create wealth successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        body: {
          communityId: 'comm-123',
          itemId: 'item-123',
          title: 'Test Wealth',
          durationType: 'unlimited',
          distributionType: 'request_based',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      mockWealthService.createWealth.mockResolvedValue(testData.wealth);

      await wealthController.create(req, res, next);

      expect(mockWealthService.createWealth).toHaveBeenCalledWith(req.body, 'user-123');
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: testData.wealth,
        message: 'Wealth created successfully',
      });
    });

    test('should handle errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        body: {},
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new Error('Validation error');
      mockWealthService.createWealth.mockRejectedValue(error);

      await wealthController.create(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getById', () => {
    test('should get wealth by ID successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { id: 'wealth-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      mockWealthService.getWealth.mockResolvedValue(testData.wealth);

      await wealthController.getById(req, res, next);

      expect(mockWealthService.getWealth).toHaveBeenCalledWith('wealth-123', 'user-123');
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: testData.wealth,
        message: 'Success',
      });
    });

    test('should handle errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { id: 'wealth-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new Error('Not found');
      mockWealthService.getWealth.mockRejectedValue(error);

      await wealthController.getById(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('update', () => {
    test('should update wealth successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { id: 'wealth-123' },
        body: { title: 'Updated Wealth' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      mockWealthService.updateWealth.mockResolvedValue({ ...testData.wealth, title: 'Updated Wealth' });

      await wealthController.update(req, res, next);

      expect(mockWealthService.updateWealth).toHaveBeenCalledWith('wealth-123', { title: 'Updated Wealth' }, 'user-123');
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: expect.objectContaining({ title: 'Updated Wealth' }),
        message: 'Wealth updated successfully',
      });
    });

    test('should handle errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { id: 'wealth-123' },
        body: {},
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new Error('Forbidden');
      mockWealthService.updateWealth.mockRejectedValue(error);

      await wealthController.update(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('cancel', () => {
    test('should cancel wealth successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { id: 'wealth-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      mockWealthService.cancelWealth.mockResolvedValue(testData.wealth);

      await wealthController.cancel(req, res, next);

      expect(mockWealthService.cancelWealth).toHaveBeenCalledWith('wealth-123', 'user-123');
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: testData.wealth,
        message: 'Wealth cancelled',
      });
    });

    test('should handle errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { id: 'wealth-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new Error('Not found');
      mockWealthService.cancelWealth.mockRejectedValue(error);

      await wealthController.cancel(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('fulfill', () => {
    test('should fulfill wealth successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { id: 'wealth-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      mockWealthService.fulfillWealth.mockResolvedValue(testData.wealth);

      await wealthController.fulfill(req, res, next);

      expect(mockWealthService.fulfillWealth).toHaveBeenCalledWith('wealth-123', 'user-123');
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: testData.wealth,
        message: 'Wealth fulfilled',
      });
    });

    test('should handle errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { id: 'wealth-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new Error('Forbidden');
      mockWealthService.fulfillWealth.mockRejectedValue(error);

      await wealthController.fulfill(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('requestWealth', () => {
    test('should request wealth successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { id: 'wealth-123' },
        body: { message: 'Can I have this?', unitsRequested: 1 },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const request = { id: 'request-123', status: 'pending' };
      mockWealthService.requestWealth.mockResolvedValue(request);

      await wealthController.requestWealth(req, res, next);

      expect(mockWealthService.requestWealth).toHaveBeenCalledWith('wealth-123', 'user-123', 'Can I have this?', 1);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: request,
        message: 'Request created',
      });
    });

    test('should handle errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { id: 'wealth-123' },
        body: {},
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new Error('Already requested');
      mockWealthService.requestWealth.mockRejectedValue(error);

      await wealthController.requestWealth(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('listRequests', () => {
    test('should list requests successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { id: 'wealth-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const requests = [{ id: 'request-123', status: 'pending' }];
      mockWealthService.listRequests.mockResolvedValue(requests);

      await wealthController.listRequests(req, res, next);

      expect(mockWealthService.listRequests).toHaveBeenCalledWith('wealth-123', 'user-123');
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: requests,
        message: 'Success',
      });
    });

    test('should handle errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { id: 'wealth-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new Error('Forbidden');
      mockWealthService.listRequests.mockRejectedValue(error);

      await wealthController.listRequests(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('acceptRequest', () => {
    test('should accept request successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { id: 'wealth-123', requestId: 'request-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const result = { id: 'request-123', status: 'accepted' };
      mockWealthService.acceptRequest.mockResolvedValue(result);

      await wealthController.acceptRequest(req, res, next);

      expect(mockWealthService.acceptRequest).toHaveBeenCalledWith('wealth-123', 'request-123', 'user-123');
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: result,
        message: 'Request accepted',
      });
    });

    test('should handle errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { id: 'wealth-123', requestId: 'request-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new Error('Forbidden');
      mockWealthService.acceptRequest.mockRejectedValue(error);

      await wealthController.acceptRequest(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('rejectRequest', () => {
    test('should reject request successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { id: 'wealth-123', requestId: 'request-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const result = { id: 'request-123', status: 'rejected' };
      mockWealthService.rejectRequest.mockResolvedValue(result);

      await wealthController.rejectRequest(req, res, next);

      expect(mockWealthService.rejectRequest).toHaveBeenCalledWith('wealth-123', 'request-123', 'user-123');
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: result,
        message: 'Request rejected',
      });
    });

    test('should handle errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { id: 'wealth-123', requestId: 'request-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new Error('Forbidden');
      mockWealthService.rejectRequest.mockRejectedValue(error);

      await wealthController.rejectRequest(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('cancelRequest', () => {
    test('should cancel request successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { id: 'wealth-123', requestId: 'request-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const result = { id: 'request-123', status: 'cancelled' };
      mockWealthService.cancelRequest.mockResolvedValue(result);

      await wealthController.cancelRequest(req, res, next);

      expect(mockWealthService.cancelRequest).toHaveBeenCalledWith('wealth-123', 'request-123', 'user-123');
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: result,
        message: 'Request cancelled',
      });
    });

    test('should handle errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { id: 'wealth-123', requestId: 'request-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new Error('Forbidden');
      mockWealthService.cancelRequest.mockRejectedValue(error);

      await wealthController.cancelRequest(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('listMyRequests', () => {
    test('should list my requests successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {});
      (req as any).parsedStatuses = ['pending', 'accepted'];
      const res = createMockResponse();
      const next = createMockNext();

      const requests = [{ id: 'request-123', status: 'pending' }];
      mockWealthService.listRequestsByUser.mockResolvedValue(requests);

      await wealthController.listMyRequests(req, res, next);

      expect(mockWealthService.listRequestsByUser).toHaveBeenCalledWith('user-123', ['pending', 'accepted']);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: requests,
        message: 'Success',
      });
    });

    test('should handle errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {});
      const res = createMockResponse();
      const next = createMockNext();

      const error = new Error('Database error');
      mockWealthService.listRequestsByUser.mockRejectedValue(error);

      await wealthController.listMyRequests(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('createComment', () => {
    test('should create comment successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { wealthId: 'wealth-123' },
        body: { content: 'Great wealth!' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const comment = { id: 'comment-123', content: 'Great wealth!' };
      mockWealthCommentService.createComment.mockResolvedValue(comment);

      await wealthController.createComment(req, res, next);

      expect(mockWealthCommentService.createComment).toHaveBeenCalledWith(
        { wealthId: 'wealth-123', content: 'Great wealth!' },
        'user-123'
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: comment,
        message: 'Comment created successfully',
      });
    });

    test('should handle errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { wealthId: 'wealth-123' },
        body: {},
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new Error('Validation error');
      mockWealthCommentService.createComment.mockRejectedValue(error);

      await wealthController.createComment(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('listComments', () => {
    test('should list comments successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { wealthId: 'wealth-123' },
        query: { limit: '50', offset: '0' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const comments = [{ id: 'comment-123', content: 'Great wealth!' }];
      mockWealthCommentService.getCommentsByWealthId.mockResolvedValue(comments);

      await wealthController.listComments(req, res, next);

      expect(mockWealthCommentService.getCommentsByWealthId).toHaveBeenCalledWith('wealth-123', 'user-123', 50, 0);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: comments,
        message: 'Success',
      });
    });

    test('should handle errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { wealthId: 'wealth-123' },
        query: {},
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new Error('Forbidden');
      mockWealthCommentService.getCommentsByWealthId.mockRejectedValue(error);

      await wealthController.listComments(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('updateComment', () => {
    test('should update comment successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { wealthId: 'wealth-123', commentId: 'comment-123' },
        body: { content: 'Updated comment' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const updated = { id: 'comment-123', content: 'Updated comment' };
      mockWealthCommentService.updateComment.mockResolvedValue(updated);

      await wealthController.updateComment(req, res, next);

      expect(mockWealthCommentService.updateComment).toHaveBeenCalledWith('comment-123', { content: 'Updated comment' }, 'user-123');
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: updated,
        message: 'Comment updated successfully',
      });
    });

    test('should handle errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { wealthId: 'wealth-123', commentId: 'comment-123' },
        body: {},
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new Error('Forbidden');
      mockWealthCommentService.updateComment.mockRejectedValue(error);

      await wealthController.updateComment(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('deleteComment', () => {
    test('should delete comment successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { wealthId: 'wealth-123', commentId: 'comment-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      mockWealthCommentService.deleteComment.mockResolvedValue(undefined);

      await wealthController.deleteComment(req, res, next);

      expect(mockWealthCommentService.deleteComment).toHaveBeenCalledWith('comment-123', 'user-123');
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: null,
        message: 'Comment deleted successfully',
      });
    });

    test('should handle errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { wealthId: 'wealth-123', commentId: 'comment-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new Error('Forbidden');
      mockWealthCommentService.deleteComment.mockRejectedValue(error);

      await wealthController.deleteComment(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
