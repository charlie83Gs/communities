import { describe, test, expect, mock, beforeEach } from 'bun:test';
import { forumController } from './forum.controller';
import { forumService } from '@/services/forum.service';
import {
  createMockAuthenticatedRequest,
  createMockResponse,
  createMockNext,
} from '../../../tests/helpers/testUtils';

// Mock the service
const mockForumService = {
  listCategories: mock(() => Promise.resolve([])),
  createCategory: mock(() => Promise.resolve({ id: 'cat-123', name: 'General' })),
  updateCategory: mock(() => Promise.resolve({ id: 'cat-123', name: 'Updated' })),
  deleteCategory: mock(() => Promise.resolve()),
  listThreads: mock(() => Promise.resolve({ threads: [], total: 0 })),
  createThread: mock(() => Promise.resolve({ id: 'thread-123', title: 'Test Thread' })),
  getThread: mock(() => Promise.resolve({ thread: {}, posts: [] })),
  deleteThread: mock(() => Promise.resolve()),
  pinThread: mock(() => Promise.resolve({ id: 'thread-123', isPinned: true })),
  lockThread: mock(() => Promise.resolve({ id: 'thread-123', isLocked: true })),
  setBestAnswer: mock(() => Promise.resolve({ id: 'thread-123' })),
  voteOnThread: mock(() => Promise.resolve()),
  createPost: mock(() => Promise.resolve({ id: 'post-123', content: 'Test post' })),
  updatePost: mock(() => Promise.resolve({ id: 'post-123', content: 'Updated post' })),
  deletePost: mock(() => Promise.resolve()),
  voteOnPost: mock(() => Promise.resolve()),
};

describe('ForumController', () => {
  beforeEach(() => {
    // Reset all mocks
    Object.values(mockForumService).forEach(m => m.mockReset());

    // Replace service methods with mocks
    Object.keys(mockForumService).forEach(key => {
      (forumService as any)[key] = (mockForumService as any)[key];
    });
  });

  describe('Category Management', () => {
    test('should list categories successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const categories = [{ id: 'cat-123', name: 'General' }];
      mockForumService.listCategories.mockResolvedValue(categories);

      await forumController.listCategories(req, res, next);

      expect(mockForumService.listCategories).toHaveBeenCalledWith('comm-123', 'user-123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: { categories },
      });
    });

    test('should create category successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123' },
        body: { name: 'General', description: 'General discussion' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const category = { id: 'cat-123', name: 'General' };
      mockForumService.createCategory.mockResolvedValue(category);

      await forumController.createCategory(req, res, next);

      expect(mockForumService.createCategory).toHaveBeenCalledWith(
        { communityId: 'comm-123', name: 'General', description: 'General discussion' },
        'user-123'
      );
      expect(res.status).toHaveBeenCalledWith(201);
    });

    test('should update category successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { categoryId: 'cat-123' },
        body: { name: 'Updated Name' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const category = { id: 'cat-123', name: 'Updated Name' };
      mockForumService.updateCategory.mockResolvedValue(category);

      await forumController.updateCategory(req, res, next);

      expect(mockForumService.updateCategory).toHaveBeenCalledWith('cat-123', { name: 'Updated Name' }, 'user-123');
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test('should delete category successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { categoryId: 'cat-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      mockForumService.deleteCategory.mockResolvedValue(undefined);

      await forumController.deleteCategory(req, res, next);

      expect(mockForumService.deleteCategory).toHaveBeenCalledWith('cat-123', 'user-123');
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('Thread Management', () => {
    test('should list threads successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123' },
        query: { categoryId: 'cat-123', page: '1', limit: '20' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const result = { threads: [], total: 0 };
      mockForumService.listThreads.mockResolvedValue(result);

      await forumController.listThreads(req, res, next);

      expect(mockForumService.listThreads).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test('should create thread successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123' },
        body: { categoryId: 'cat-123', title: 'Test Thread', content: 'Content' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const thread = { id: 'thread-123', title: 'Test Thread' };
      mockForumService.createThread.mockResolvedValue(thread);

      await forumController.createThread(req, res, next);

      expect(mockForumService.createThread).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });

    test('should get thread successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { threadId: 'thread-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const result = { thread: {}, posts: [] };
      mockForumService.getThread.mockResolvedValue(result);

      await forumController.getThread(req, res, next);

      expect(mockForumService.getThread).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test('should delete thread successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { threadId: 'thread-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      mockForumService.deleteThread.mockResolvedValue(undefined);

      await forumController.deleteThread(req, res, next);

      expect(mockForumService.deleteThread).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalled();
    });

    test('should pin thread successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { threadId: 'thread-123' },
        body: { isPinned: true },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const thread = { id: 'thread-123', isPinned: true };
      mockForumService.pinThread.mockResolvedValue(thread);

      await forumController.pinThread(req, res, next);

      expect(mockForumService.pinThread).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test('should lock thread successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { threadId: 'thread-123' },
        body: { isLocked: true },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const thread = { id: 'thread-123', isLocked: true };
      mockForumService.lockThread.mockResolvedValue(thread);

      await forumController.lockThread(req, res, next);

      expect(mockForumService.lockThread).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test('should set best answer successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { threadId: 'thread-123' },
        body: { postId: 'post-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const thread = { id: 'thread-123', bestAnswerId: 'post-123' };
      mockForumService.setBestAnswer.mockResolvedValue(thread);

      await forumController.setBestAnswer(req, res, next);

      expect(mockForumService.setBestAnswer).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test('should vote on thread successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { threadId: 'thread-123' },
        body: { voteType: 'up' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      mockForumService.voteOnThread.mockResolvedValue(undefined);

      await forumController.voteOnThread(req, res, next);

      expect(mockForumService.voteOnThread).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('Post Management', () => {
    test('should create post successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { threadId: 'thread-123' },
        body: { content: 'Test post' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const post = { id: 'post-123', content: 'Test post' };
      mockForumService.createPost.mockResolvedValue(post);

      await forumController.createPost(req, res, next);

      expect(mockForumService.createPost).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });

    test('should update post successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { postId: 'post-123' },
        body: { content: 'Updated post' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const post = { id: 'post-123', content: 'Updated post' };
      mockForumService.updatePost.mockResolvedValue(post);

      await forumController.updatePost(req, res, next);

      expect(mockForumService.updatePost).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test('should delete post successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { postId: 'post-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      mockForumService.deletePost.mockResolvedValue(undefined);

      await forumController.deletePost(req, res, next);

      expect(mockForumService.deletePost).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalled();
    });

    test('should vote on post successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { postId: 'post-123' },
        body: { voteType: 'up' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      mockForumService.voteOnPost.mockResolvedValue(undefined);

      await forumController.voteOnPost(req, res, next);

      expect(mockForumService.voteOnPost).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('Error Handling', () => {
    test('should handle category creation error', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123' },
        body: { name: 'General' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new Error('Forbidden');
      mockForumService.createCategory.mockRejectedValue(error);

      await forumController.createCategory(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });

    test('should handle thread creation error', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123' },
        body: { title: 'Test' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new Error('Validation error');
      mockForumService.createThread.mockRejectedValue(error);

      await forumController.createThread(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
