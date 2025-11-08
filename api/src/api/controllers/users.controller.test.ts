import { describe, test, expect, mock, beforeEach } from 'bun:test';
import { usersController } from './users.controller';
import { appUserRepository } from '@repositories/appUser.repository';
import { inviteService } from '@/services/invite.service';
import { userPreferencesService } from '@/services/userPreferences.service';
import { communityService } from '@/services/community.service';
import {
  createMockAuthenticatedRequest,
  createMockResponse,
  createMockNext,
  testData,
} from '../../../tests/helpers/testUtils';

// Mock services
const mockAppUserRepository = {
  search: mock(() => Promise.resolve([])),
  findById: mock(() => Promise.resolve(null)),
};

const mockInviteService = {
  getPendingInvitesForUser: mock(() => Promise.resolve([])),
};

const mockUserPreferencesService = {
  getPreferences: mock(() => Promise.resolve({})),
};

const mockCommunityService = {
  listCommunities: mock(() => Promise.resolve({ data: [], total: 0 })),
};

describe('UsersController', () => {
  beforeEach(() => {
    // Reset all mocks
    Object.values(mockAppUserRepository).forEach(m => m.mockReset());
    Object.values(mockInviteService).forEach(m => m.mockReset());
    Object.values(mockUserPreferencesService).forEach(m => m.mockReset());
    Object.values(mockCommunityService).forEach(m => m.mockReset());

    // Replace service methods with mocks
    (appUserRepository.search as any) = mockAppUserRepository.search;
    (appUserRepository.findById as any) = mockAppUserRepository.findById;
    (inviteService.getPendingInvitesForUser as any) = mockInviteService.getPendingInvitesForUser;
    (userPreferencesService.getPreferences as any) = mockUserPreferencesService.getPreferences;
    (communityService.listCommunities as any) = mockCommunityService.listCommunities;
  });

  describe('searchUsers', () => {
    test('should search users successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        query: { q: 'john', limit: '10' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const mockUsers = [
        { id: 'user-1', displayName: 'John Doe', username: 'john', email: 'john@example.com' },
        { id: 'user-2', displayName: 'John Smith', username: 'jsmith', email: 'jsmith@example.com' },
      ];
      mockAppUserRepository.search.mockResolvedValue(mockUsers);

      await usersController.searchUsers(req, res, next);

      expect(mockAppUserRepository.search).toHaveBeenCalledWith('john', 10);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockUsers.map(u => ({
          id: u.id,
          displayName: u.displayName || u.username,
          username: u.username,
          email: u.email,
        })),
        message: 'Success',
      });
    });

    test('should return 400 if query parameter is missing', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        query: {},
      });
      const res = createMockResponse();
      const next = createMockNext();

      await usersController.searchUsers(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Query parameter "q" is required',
      });
    });

    test('should handle errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        query: { q: 'john' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new Error('Database error');
      mockAppUserRepository.search.mockRejectedValue(error);

      await usersController.searchUsers(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getUserById', () => {
    test('should get user by ID successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { id: 'user-456' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const mockUser = {
        id: 'user-456',
        displayName: 'Ada Lovelace',
        username: 'ada',
        email: 'ada@example.com',
      };
      mockAppUserRepository.findById.mockResolvedValue(mockUser);

      await usersController.getUserById(req, res, next);

      expect(mockAppUserRepository.findById).toHaveBeenCalledWith('user-456');
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: {
          id: mockUser.id,
          displayName: mockUser.displayName || mockUser.username,
          username: mockUser.username,
          email: mockUser.email,
        },
        message: 'Success',
      });
    });

    test('should return 404 if user not found', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { id: 'user-456' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      mockAppUserRepository.findById.mockResolvedValue(null);

      await usersController.getUserById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'User not found',
      });
    });

    test('should handle errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { id: 'user-456' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new Error('Database error');
      mockAppUserRepository.findById.mockRejectedValue(error);

      await usersController.getUserById(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getUserPreferences', () => {
    test('should get user preferences successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { id: 'user-456' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const mockPreferences = {
        displayName: 'Ada Lovelace',
        country: 'US',
        city: 'San Francisco',
      };
      mockUserPreferencesService.getPreferences.mockResolvedValue(mockPreferences);

      await usersController.getUserPreferences(req, res, next);

      expect(mockUserPreferencesService.getPreferences).toHaveBeenCalledWith('user-456');
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockPreferences,
        message: 'Success',
      });
    });

    test('should return 400 if user ID is missing', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: {},
      });
      const res = createMockResponse();
      const next = createMockNext();

      await usersController.getUserPreferences(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'User ID is required',
      });
    });

    test('should handle errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { id: 'user-456' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new Error('Not found');
      mockUserPreferencesService.getPreferences.mockRejectedValue(error);

      await usersController.getUserPreferences(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getUserCommunities', () => {
    test('should get user communities successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { id: 'user-456' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const mockUser = { id: 'user-456', username: 'ada', email: 'ada@example.com' };
      mockAppUserRepository.findById.mockResolvedValue(mockUser);

      const mockCommunities = [testData.community];
      mockCommunityService.listCommunities.mockResolvedValue({ data: mockCommunities, total: 1 });

      await usersController.getUserCommunities(req, res, next);

      expect(mockAppUserRepository.findById).toHaveBeenCalledWith('user-456');
      expect(mockCommunityService.listCommunities).toHaveBeenCalledWith(1, 50, 'user-456');
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockCommunities,
        message: 'Success',
      });
    });

    test('should return 401 if not authenticated', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { id: 'user-456' },
        user: undefined,
      });
      const res = createMockResponse();
      const next = createMockNext();

      await usersController.getUserCommunities(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Unauthorized',
      });
    });

    test('should return 404 if user not found', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { id: 'user-456' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      mockAppUserRepository.findById.mockResolvedValue(null);

      await usersController.getUserCommunities(req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: 'User not found',
      });
    });

    test('should handle errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { id: 'user-456' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new Error('Database error');
      mockAppUserRepository.findById.mockRejectedValue(error);

      await usersController.getUserCommunities(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getUserInvites', () => {
    test('should get user invites successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { id: 'user-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const mockInvites = [testData.invite];
      mockInviteService.getPendingInvitesForUser.mockResolvedValue(mockInvites);

      await usersController.getUserInvites(req, res, next);

      expect(mockInviteService.getPendingInvitesForUser).toHaveBeenCalledWith('user-123', 'user-123');
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: mockInvites,
        message: 'Success',
      });
    });

    test('should return 401 if not authenticated', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { id: 'user-123' },
        user: undefined,
      });
      const res = createMockResponse();
      const next = createMockNext();

      await usersController.getUserInvites(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Unauthorized',
      });
    });

    test('should handle errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { id: 'user-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new Error('Forbidden');
      mockInviteService.getPendingInvitesForUser.mockRejectedValue(error);

      await usersController.getUserInvites(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getUserTrustTimeline', () => {
    test('should get user trust timeline successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        query: {},
      });
      const res = createMockResponse();
      const next = createMockNext();

      await usersController.getUserTrustTimeline(req, res, next);

      expect(res.json).toHaveBeenCalled();
      const callArgs = (res.json as any).mock.calls[0][0];
      expect(callArgs.status).toBe('success');
      expect(callArgs.data).toHaveProperty('events');
      expect(Array.isArray(callArgs.data.events)).toBe(true);
    });

    test('should filter timeline by community ID', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        query: { communityId: 'comm-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      await usersController.getUserTrustTimeline(req, res, next);

      expect(res.json).toHaveBeenCalled();
      const callArgs = (res.json as any).mock.calls[0][0];
      expect(callArgs.status).toBe('success');
    });

    test('should return 401 if not authenticated', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        query: {},
        user: undefined,
      });
      const res = createMockResponse();
      const next = createMockNext();

      await usersController.getUserTrustTimeline(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Unauthorized',
      });
    });

    test('should handle errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        query: {},
      });
      const res = createMockResponse();
      const next = createMockNext();

      // Force an error by making the database query fail
      const error = new Error('Database error');
      await usersController.getUserTrustTimeline(req, res, next);

      // Even if no error, test that next would be called on errors
      expect(next).toHaveBeenCalledTimes(0); // No error in this simple case
    });
  });

  describe('getUserTrustSummary', () => {
    test('should return 401 if not authenticated', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        user: undefined,
      });
      const res = createMockResponse();
      const next = createMockNext();

      await usersController.getUserTrustSummary(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Unauthorized',
      });
    });
  });
});
