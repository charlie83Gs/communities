/**
 * Forum Threads Tests
 * Tests for forum thread CRUD operations, permissions, and moderation actions
 */

import { describe, it, expect, beforeEach } from 'bun:test';
import { forumService } from '@/services/forum.service';
import { AppError } from '@/utils/errors';
import {
  forumTestData,
  createMockForumRepository,
  createMockOpenFGAService,
  createMockCommunityMemberRepository,
  createMockCommunityRepository,
  createMockAppUserRepository,
  setupForumServiceMocks,
  resetAllMocks,
} from './helpers';

describe('Forum Threads', () => {
  let mockForumRepo: ReturnType<typeof createMockForumRepository>;
  let mockOpenFGA: ReturnType<typeof createMockOpenFGAService>;
  let mockMemberRepo: ReturnType<typeof createMockCommunityMemberRepository>;
  let mockCommunityRepo: ReturnType<typeof createMockCommunityRepository>;
  let mockUserRepo: ReturnType<typeof createMockAppUserRepository>;

  beforeEach(() => {
    mockForumRepo = createMockForumRepository();
    mockOpenFGA = createMockOpenFGAService({ canCreateThreads: true });
    mockMemberRepo = createMockCommunityMemberRepository('member');
    mockCommunityRepo = createMockCommunityRepository();
    mockUserRepo = createMockAppUserRepository();

    setupForumServiceMocks(
      mockForumRepo,
      mockOpenFGA,
      mockMemberRepo,
      mockCommunityRepo,
      mockUserRepo
    );
  });

  describe('createThread', () => {
    it('should create thread with sufficient trust (default: 10)', async () => {
      mockOpenFGA.checkTrustLevel.mockResolvedValue(true); // Has trust >= 10
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());
      mockForumRepo.createThread.mockResolvedValue(forumTestData.thread());
      mockMemberRepo.getUserRole.mockResolvedValue('member');

      const dto = forumTestData.createThreadDto();
      const result = await forumService.createThread(dto, 'user-123');

      expect(result.id).toBe('thread-123');
      expect(result).toHaveProperty('postCount');
      expect(result).toHaveProperty('upvotes');
      expect(result).toHaveProperty('tags');
      expect(mockForumRepo.createThread).toHaveBeenCalledWith({
        ...dto,
        authorId: 'user-123',
      });
    });

    it('should create thread as admin (bypasses trust check)', async () => {
      mockOpenFGA.check.mockImplementation(async (params: any) => {
        return params.relation === 'admin';
      });
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());
      mockForumRepo.createThread.mockResolvedValue(forumTestData.thread());
      mockMemberRepo.getUserRole.mockResolvedValue('admin');

      const dto = forumTestData.createThreadDto();
      const result = await forumService.createThread(dto, 'user-admin');

      expect(result.id).toBe('thread-123');
      expect(mockForumRepo.createThread).toHaveBeenCalled();
    });

    it('should fail with insufficient trust', async () => {
      mockOpenFGA.check.mockResolvedValue(false); // Not admin
      mockOpenFGA.checkTrustLevel.mockResolvedValue(false); // Trust < 10
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());
      mockMemberRepo.getUserRole.mockResolvedValue('member');

      const dto = forumTestData.createThreadDto();

      await expect(forumService.createThread(dto, 'user-low-trust')).rejects.toThrow(
        'Forbidden: insufficient trust to create threads'
      );
    });

    it('should validate thread title length', async () => {
      mockOpenFGA.checkTrustLevel.mockResolvedValue(true);
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());
      mockMemberRepo.getUserRole.mockResolvedValue('member');

      const dto = forumTestData.createThreadDto({ title: '' });

      mockForumRepo.createThread.mockRejectedValue(new AppError('Title is required', 400));

      await expect(forumService.createThread(dto, 'user-123')).rejects.toThrow(
        'Title is required'
      );
    });

    it('should validate thread content length', async () => {
      mockOpenFGA.checkTrustLevel.mockResolvedValue(true);
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());
      mockMemberRepo.getUserRole.mockResolvedValue('member');

      const dto = forumTestData.createThreadDto({ content: '' });

      mockForumRepo.createThread.mockRejectedValue(new AppError('Content is required', 400));

      await expect(forumService.createThread(dto, 'user-123')).rejects.toThrow(
        'Content is required'
      );
    });

    it('should create OpenFGA relationships', async () => {
      mockOpenFGA.checkTrustLevel.mockResolvedValue(true);
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());
      mockForumRepo.createThread.mockResolvedValue(forumTestData.thread());
      mockMemberRepo.getUserRole.mockResolvedValue('member');

      const dto = forumTestData.createThreadDto();
      await forumService.createThread(dto, 'user-123');

      expect(mockOpenFGA.createRelationship).toHaveBeenCalledWith(
        'forum_thread',
        'thread-123',
        'parent_community',
        'community',
        'comm-123'
      );
      expect(mockOpenFGA.createRelationship).toHaveBeenCalledWith(
        'forum_thread',
        'thread-123',
        'author',
        'user',
        'user-123'
      );
    });
  });

  describe('listThreads', () => {
    it('should list threads in category with pagination', async () => {
      mockMemberRepo.getUserRole.mockResolvedValue('member');
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());
      mockForumRepo.findThreadsByCategory.mockResolvedValue({
        threads: [forumTestData.thread(), forumTestData.thread({ id: 'thread-456' })],
        total: 25,
      });

      const result = await forumService.listThreads('category-123', 'user-123', {
        page: 2,
        limit: 10,
      });

      expect(result.threads).toHaveLength(2);
      expect(result.total).toBe(25);
      expect(result.page).toBe(2);
      expect(result.limit).toBe(10);
      expect(mockForumRepo.findThreadsByCategory).toHaveBeenCalledWith('category-123', {
        limit: 10,
        offset: 10,
        sort: undefined,
      });
    });

    it('should list threads sorted by newest', async () => {
      mockMemberRepo.getUserRole.mockResolvedValue('member');
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());
      mockForumRepo.findThreadsByCategory.mockResolvedValue({
        threads: [forumTestData.thread()],
        total: 1,
      });

      await forumService.listThreads('category-123', 'user-123', { sort: 'newest' });

      expect(mockForumRepo.findThreadsByCategory).toHaveBeenCalledWith('category-123', {
        limit: 20,
        offset: 0,
        sort: 'newest',
      });
    });

    it('should list threads sorted by popular', async () => {
      mockMemberRepo.getUserRole.mockResolvedValue('member');
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());
      mockForumRepo.findThreadsByCategory.mockResolvedValue({
        threads: [forumTestData.thread()],
        total: 1,
      });

      await forumService.listThreads('category-123', 'user-123', { sort: 'popular' });

      expect(mockForumRepo.findThreadsByCategory).toHaveBeenCalledWith('category-123', {
        limit: 20,
        offset: 0,
        sort: 'popular',
      });
    });

    it('should list threads sorted by most upvoted', async () => {
      mockMemberRepo.getUserRole.mockResolvedValue('member');
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());
      mockForumRepo.findThreadsByCategory.mockResolvedValue({
        threads: [forumTestData.thread()],
        total: 1,
      });

      await forumService.listThreads('category-123', 'user-123', { sort: 'mostUpvoted' });

      expect(mockForumRepo.findThreadsByCategory).toHaveBeenCalledWith('category-123', {
        limit: 20,
        offset: 0,
        sort: 'mostUpvoted',
      });
    });

    it('should fail for non-member', async () => {
      mockMemberRepo.getUserRole.mockResolvedValue(null);
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());

      await expect(
        forumService.listThreads('category-123', 'user-outsider')
      ).rejects.toThrow('Forbidden: only community members can access the forum');
    });
  });

  describe('getThread', () => {
    it('should get thread detail with all posts', async () => {
      mockMemberRepo.getUserRole.mockResolvedValue('member');
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());
      mockForumRepo.findThreadById.mockResolvedValue(forumTestData.thread());
      mockForumRepo.findPostsByThread.mockResolvedValue([
        forumTestData.post(),
        forumTestData.post({ id: 'post-456' }),
      ]);

      const result = await forumService.getThread('thread-123', 'user-123');

      expect(result.thread.id).toBe('thread-123');
      expect(result.posts).toHaveLength(2);
      expect(result.posts[0]).toHaveProperty('upvotes');
      expect(result.posts[0]).toHaveProperty('isBestAnswer');
    });

    it('should throw 404 if thread not found', async () => {
      mockForumRepo.findThreadById.mockResolvedValue(null);

      await expect(forumService.getThread('thread-invalid', 'user-123')).rejects.toThrow(
        'Thread not found'
      );
    });

    it('should mark best answer post', async () => {
      mockMemberRepo.getUserRole.mockResolvedValue('member');
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());
      mockForumRepo.findThreadById.mockResolvedValue(
        forumTestData.thread({ bestAnswerPostId: 'post-456' })
      );
      mockForumRepo.findPostsByThread.mockResolvedValue([
        forumTestData.post({ id: 'post-123' }),
        forumTestData.post({ id: 'post-456' }),
      ]);

      const result = await forumService.getThread('thread-123', 'user-123');

      expect(result.posts[0].isBestAnswer).toBe(false);
      expect(result.posts[1].isBestAnswer).toBe(true);
    });
  });

  describe('deleteThread', () => {
    it('should delete own thread', async () => {
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());
      mockForumRepo.findThreadById.mockResolvedValue(
        forumTestData.thread({ authorId: 'user-123' })
      );
      mockMemberRepo.getUserRole.mockResolvedValue('member');

      await forumService.deleteThread('thread-123', 'user-123');

      expect(mockForumRepo.deleteThread).toHaveBeenCalledWith('thread-123');
    });

    it('should delete any thread as admin', async () => {
      mockOpenFGA.check.mockResolvedValue(true); // Admin
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());
      mockForumRepo.findThreadById.mockResolvedValue(
        forumTestData.thread({ authorId: 'user-other' })
      );
      mockMemberRepo.getUserRole.mockResolvedValue('admin');

      await forumService.deleteThread('thread-123', 'user-admin');

      expect(mockForumRepo.deleteThread).toHaveBeenCalledWith('thread-123');
    });

    it('should delete any thread as forum manager', async () => {
      mockOpenFGA.check.mockImplementation(async (params: any) => {
        if (params.relation === 'admin') return false;
        if (params.relation === 'forum_manager') return true;
        return false;
      });
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());
      mockForumRepo.findThreadById.mockResolvedValue(
        forumTestData.thread({ authorId: 'user-other' })
      );
      mockMemberRepo.getUserRole.mockResolvedValue('member');

      await forumService.deleteThread('thread-123', 'user-forum-mgr');

      expect(mockForumRepo.deleteThread).toHaveBeenCalledWith('thread-123');
    });

    it('should fail to delete other users thread without permissions', async () => {
      mockOpenFGA.check.mockResolvedValue(false);
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());
      mockForumRepo.findThreadById.mockResolvedValue(
        forumTestData.thread({ authorId: 'user-other' })
      );
      mockMemberRepo.getUserRole.mockResolvedValue('member');

      await expect(forumService.deleteThread('thread-123', 'user-123')).rejects.toThrow(
        'Forbidden: only the thread author or forum managers can delete this thread'
      );
    });
  });

  describe('pinThread', () => {
    it('should pin thread as admin', async () => {
      mockOpenFGA.check.mockResolvedValue(true); // Admin
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());
      mockForumRepo.findThreadById.mockResolvedValue(forumTestData.thread());
      mockForumRepo.updateThread.mockResolvedValue(
        forumTestData.thread({ isPinned: true })
      );
      mockMemberRepo.getUserRole.mockResolvedValue('admin');

      const result = await forumService.pinThread('thread-123', true, 'user-admin');

      expect(result.isPinned).toBe(true);
      expect(mockForumRepo.updateThread).toHaveBeenCalledWith('thread-123', { isPinned: true });
    });

    it('should unpin thread as admin', async () => {
      mockOpenFGA.check.mockResolvedValue(true); // Admin
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());
      mockForumRepo.findThreadById.mockResolvedValue(
        forumTestData.thread({ isPinned: true })
      );
      mockForumRepo.updateThread.mockResolvedValue(forumTestData.thread({ isPinned: false }));
      mockMemberRepo.getUserRole.mockResolvedValue('admin');

      const result = await forumService.pinThread('thread-123', false, 'user-admin');

      expect(result.isPinned).toBe(false);
    });

    it('should pin thread as forum manager', async () => {
      mockOpenFGA.check.mockImplementation(async (params: any) => {
        if (params.relation === 'admin') return false;
        if (params.relation === 'forum_manager') return true;
        return false;
      });
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());
      mockForumRepo.findThreadById.mockResolvedValue(forumTestData.thread());
      mockForumRepo.updateThread.mockResolvedValue(forumTestData.thread({ isPinned: true }));
      mockMemberRepo.getUserRole.mockResolvedValue('member');

      const result = await forumService.pinThread('thread-123', true, 'user-forum-mgr');

      expect(result.isPinned).toBe(true);
    });

    it('should fail without admin or forum manager permissions', async () => {
      mockOpenFGA.check.mockResolvedValue(false);
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());
      mockForumRepo.findThreadById.mockResolvedValue(forumTestData.thread());
      mockMemberRepo.getUserRole.mockResolvedValue('member');

      await expect(forumService.pinThread('thread-123', true, 'user-123')).rejects.toThrow(
        'Forbidden: only forum managers can pin/lock threads'
      );
    });
  });

  describe('lockThread', () => {
    it('should lock thread as admin', async () => {
      mockOpenFGA.check.mockResolvedValue(true); // Admin
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());
      mockForumRepo.findThreadById.mockResolvedValue(forumTestData.thread());
      mockForumRepo.updateThread.mockResolvedValue(forumTestData.thread({ isLocked: true }));
      mockMemberRepo.getUserRole.mockResolvedValue('admin');

      const result = await forumService.lockThread('thread-123', true, 'user-admin');

      expect(result.isLocked).toBe(true);
      expect(mockForumRepo.updateThread).toHaveBeenCalledWith('thread-123', { isLocked: true });
    });

    it('should unlock thread as forum manager', async () => {
      mockOpenFGA.check.mockImplementation(async (params: any) => {
        if (params.relation === 'admin') return false;
        if (params.relation === 'forum_manager') return true;
        return false;
      });
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());
      mockForumRepo.findThreadById.mockResolvedValue(forumTestData.thread({ isLocked: true }));
      mockForumRepo.updateThread.mockResolvedValue(forumTestData.thread({ isLocked: false }));
      mockMemberRepo.getUserRole.mockResolvedValue('member');

      const result = await forumService.lockThread('thread-123', false, 'user-forum-mgr');

      expect(result.isLocked).toBe(false);
    });

    it('should fail without admin or forum manager permissions', async () => {
      mockOpenFGA.check.mockResolvedValue(false);
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());
      mockForumRepo.findThreadById.mockResolvedValue(forumTestData.thread());
      mockMemberRepo.getUserRole.mockResolvedValue('member');

      await expect(forumService.lockThread('thread-123', true, 'user-123')).rejects.toThrow(
        'Forbidden: only forum managers can pin/lock threads'
      );
    });
  });

  describe('setBestAnswer', () => {
    it('should set best answer as thread author', async () => {
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());
      mockForumRepo.findThreadById.mockResolvedValue(
        forumTestData.thread({ authorId: 'user-123' })
      );
      mockForumRepo.updateThread.mockResolvedValue(
        forumTestData.thread({ bestAnswerPostId: 'post-456' })
      );
      mockMemberRepo.getUserRole.mockResolvedValue('member');
      mockOpenFGA.check.mockResolvedValue(false); // Not admin/manager

      const result = await forumService.setBestAnswer('thread-123', 'post-456', 'user-123');

      expect(result.bestAnswerPostId).toBe('post-456');
      expect(mockForumRepo.updateThread).toHaveBeenCalledWith('thread-123', {
        bestAnswerPostId: 'post-456',
      });
    });

    it('should fail for non-author', async () => {
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());
      mockForumRepo.findThreadById.mockResolvedValue(
        forumTestData.thread({ authorId: 'user-other' })
      );
      mockMemberRepo.getUserRole.mockResolvedValue('member');
      mockOpenFGA.check.mockResolvedValue(false);

      await expect(
        forumService.setBestAnswer('thread-123', 'post-456', 'user-123')
      ).rejects.toThrow('Forbidden');
    });
  });
});
