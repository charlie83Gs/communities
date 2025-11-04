import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { communityController } from '@/api/controllers/community.controller';
import { communityService } from '@/services/community.service';
import { AppError } from '@/utils/errors';
import {
  createMockAuthenticatedRequest,
  createMockResponse,
  createMockNext,
  getNextError,
  testData,
} from '../../../tests/helpers/testUtils';

// Mock the service
const mockCommunityService = {
  createCommunity: mock(() => Promise.resolve(testData.community)),
  getCommunity: mock(() => Promise.resolve(testData.community)),
  listCommunities: mock(() => Promise.resolve({ data: [testData.community], total: 1, page: 1, limit: 10 })),
  searchCommunities: mock(() => Promise.resolve({ data: [testData.community], total: 1, page: 1, limit: 10 })),
  updateCommunity: mock(() => Promise.resolve(testData.community)),
  deleteCommunity: mock(() => Promise.resolve(testData.community)),
  getMembers: mock(() => Promise.resolve([{ userId: 'user-123', roles: ['admin'] }])),
  getUserRoleInCommunity: mock(() => Promise.resolve({ userId: 'user-123', roles: ['admin'] })),
  removeMember: mock(() => Promise.resolve()),
  updateMemberRole: mock(() => Promise.resolve()),
};

describe('CommunityController', () => {
  beforeEach(() => {
    // Reset all mocks
    Object.values(mockCommunityService).forEach(m => m.mockReset());

    // Replace service methods with mocks
    (communityService.createCommunity as any) = mockCommunityService.createCommunity;
    (communityService.getCommunity as any) = mockCommunityService.getCommunity;
    (communityService.listCommunities as any) = mockCommunityService.listCommunities;
    (communityService.searchCommunities as any) = mockCommunityService.searchCommunities;
    (communityService.updateCommunity as any) = mockCommunityService.updateCommunity;
    (communityService.deleteCommunity as any) = mockCommunityService.deleteCommunity;
    (communityService.getMembers as any) = mockCommunityService.getMembers;
    (communityService.getUserRoleInCommunity as any) = mockCommunityService.getUserRoleInCommunity;
    (communityService.removeMember as any) = mockCommunityService.removeMember;
    (communityService.updateMemberRole as any) = mockCommunityService.updateMemberRole;
  });

  describe('create', () => {
    it('should create a community successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        body: { name: 'Test Community', description: 'Test' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      mockCommunityService.createCommunity.mockResolvedValue(testData.community);

      await communityController.create(req, res, next);

      expect(mockCommunityService.createCommunity).toHaveBeenCalledWith(
        { name: 'Test Community', description: 'Test' },
        'user-123'
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Community created successfully',
        data: testData.community,
      });
    });

    it('should handle errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        body: { name: 'Test Community' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new AppError('Failed to create', 500);
      mockCommunityService.createCommunity.mockRejectedValue(error);

      await communityController.create(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getById', () => {
    it('should get community by id for authenticated user', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { id: 'comm-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      mockCommunityService.getCommunity.mockResolvedValue(testData.community);

      await communityController.getById(req, res, next);

      expect(mockCommunityService.getCommunity).toHaveBeenCalledWith('comm-123', 'user-123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Success',
        data: testData.community,
      });
    });

    it('should get community by id for guest user', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { id: 'comm-123' },
        user: undefined,
      });
      const res = createMockResponse();
      const next = createMockNext();

      mockCommunityService.getCommunity.mockResolvedValue(testData.community);

      await communityController.getById(req, res, next);

      expect(mockCommunityService.getCommunity).toHaveBeenCalledWith('comm-123', undefined);
    });

    it('should handle not found error', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { id: 'comm-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new AppError('Community not found', 404);
      mockCommunityService.getCommunity.mockRejectedValue(error);

      await communityController.getById(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('list', () => {
    it('should list communities with default pagination', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        query: {},
      });
      const res = createMockResponse();
      const next = createMockNext();

      const result = { data: [testData.community], total: 1, page: 1, limit: 10 };
      mockCommunityService.listCommunities.mockResolvedValue(result);

      await communityController.list(req, res, next);

      expect(mockCommunityService.listCommunities).toHaveBeenCalledWith(1, 10, 'user-123');
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Success',
        data: result,
      });
    });

    it('should list communities with custom pagination', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        query: { page: '2', limit: '20' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const result = { data: [testData.community], total: 1, page: 2, limit: 20 };
      mockCommunityService.listCommunities.mockResolvedValue(result);

      await communityController.list(req, res, next);

      expect(mockCommunityService.listCommunities).toHaveBeenCalledWith(2, 20, 'user-123');
    });

    it('should handle errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        query: {},
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new AppError('Database error', 500);
      mockCommunityService.listCommunities.mockRejectedValue(error);

      await communityController.list(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('search', () => {
    it('should search communities with query', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        query: { q: 'test', page: '1', limit: '20' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const result = { data: [testData.community], total: 1, page: 1, limit: 20 };
      mockCommunityService.searchCommunities.mockResolvedValue(result);

      await communityController.search(req, res, next);

      expect(mockCommunityService.searchCommunities).toHaveBeenCalledWith('user-123', {
        q: 'test',
        page: 1,
        limit: 20,
      });
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Success',
        data: result,
      });
    });

    it('should search with default parameters', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        query: {},
      });
      const res = createMockResponse();
      const next = createMockNext();

      const result = { data: [], total: 0, page: 1, limit: 20 };
      mockCommunityService.searchCommunities.mockResolvedValue(result);

      await communityController.search(req, res, next);

      expect(mockCommunityService.searchCommunities).toHaveBeenCalledWith('user-123', {
        q: undefined,
        page: 1,
        limit: 20,
      });
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Success',
        data: result,
      });
    });
  });

  describe('update', () => {
    it('should update community successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { id: 'comm-123' },
        body: { name: 'Updated Community' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      mockCommunityService.updateCommunity.mockResolvedValue({
        ...testData.community,
        name: 'Updated Community',
      });

      await communityController.update(req, res, next);

      expect(mockCommunityService.updateCommunity).toHaveBeenCalledWith(
        'comm-123',
        { name: 'Updated Community' },
        'user-123'
      );
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Community updated successfully',
        data: expect.objectContaining({ name: 'Updated Community' }),
      });
    });

    it('should handle forbidden error', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { id: 'comm-123' },
        body: { name: 'Updated Community' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new AppError('Forbidden', 403);
      mockCommunityService.updateCommunity.mockRejectedValue(error);

      await communityController.update(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('delete', () => {
    it('should delete community successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { id: 'comm-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      mockCommunityService.deleteCommunity.mockResolvedValue(testData.community);

      await communityController.delete(req, res, next);

      expect(mockCommunityService.deleteCommunity).toHaveBeenCalledWith('comm-123', 'user-123');
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Community deleted successfully',
        data: null,
      });
    });

    it('should handle forbidden error', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { id: 'comm-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new AppError('Forbidden', 403);
      mockCommunityService.deleteCommunity.mockRejectedValue(error);

      await communityController.delete(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getMembers', () => {
    it('should get community members', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { id: 'comm-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const members = [
        { userId: 'user-123', roles: ['admin'] },
        { userId: 'user-456', roles: ['member'] },
      ];
      mockCommunityService.getMembers.mockResolvedValue(members);

      await communityController.getMembers(req, res, next);

      expect(mockCommunityService.getMembers).toHaveBeenCalledWith('comm-123', 'user-123');
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Success',
        data: members,
      });
    });

    it('should handle forbidden error', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { id: 'comm-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new AppError('Forbidden', 403);
      mockCommunityService.getMembers.mockRejectedValue(error);

      await communityController.getMembers(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getMemberById', () => {
    it('should get member by id', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { id: 'comm-123', userId: 'user-456' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const member = { userId: 'user-456', roles: ['member'] };
      mockCommunityService.getUserRoleInCommunity.mockResolvedValue(member);

      await communityController.getMemberById(req, res, next);

      expect(mockCommunityService.getUserRoleInCommunity).toHaveBeenCalledWith(
        'comm-123',
        'user-456',
        'user-123'
      );
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        message: 'Success',
        data: member,
      });
    });

    it('should throw 404 if member not found', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { id: 'comm-123', userId: 'user-456' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      mockCommunityService.getUserRoleInCommunity.mockResolvedValue(null);

      await communityController.getMemberById(req, res, next);

      const error = getNextError(next);
      expect(error).toBeInstanceOf(AppError);
      expect(error?.message).toBe('Member not found');
      expect((error as AppError)?.statusCode).toBe(404);
    });
  });

  describe('removeMember', () => {
    it('should remove member successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { id: 'comm-123', userId: 'user-456' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      mockCommunityService.removeMember.mockResolvedValue(undefined);

      await communityController.removeMember(req, res, next);

      expect(mockCommunityService.removeMember).toHaveBeenCalledWith(
        'comm-123',
        'user-456',
        'user-123'
      );
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });

    it('should handle forbidden error', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { id: 'comm-123', userId: 'user-456' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new AppError('Forbidden', 403);
      mockCommunityService.removeMember.mockRejectedValue(error);

      await communityController.removeMember(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('updateMemberRole', () => {
    it('should update member role successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { id: 'comm-123', userId: 'user-456' },
        body: { role: 'admin' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      mockCommunityService.updateMemberRole.mockResolvedValue(undefined);

      await communityController.updateMemberRole(req, res, next);

      expect(mockCommunityService.updateMemberRole).toHaveBeenCalledWith(
        'comm-123',
        'user-456',
        'admin',
        'user-123'
      );
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalled();
    });

    it('should handle forbidden error', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { id: 'comm-123', userId: 'user-456' },
        body: { role: 'admin' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new AppError('Forbidden', 403);
      mockCommunityService.updateMemberRole.mockRejectedValue(error);

      await communityController.updateMemberRole(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
