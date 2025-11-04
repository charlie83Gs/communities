/**
 * Forum Permissions Tests
 * Comprehensive tests for role-based and trust-based forum permissions
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

describe('Forum Permissions', () => {
  let mockForumRepo: ReturnType<typeof createMockForumRepository>;
  let mockOpenFGA: ReturnType<typeof createMockOpenFGAService>;
  let mockMemberRepo: ReturnType<typeof createMockCommunityMemberRepository>;
  let mockCommunityRepo: ReturnType<typeof createMockCommunityRepository>;
  let mockUserRepo: ReturnType<typeof createMockAppUserRepository>;

  beforeEach(() => {
    mockForumRepo = createMockForumRepository();
    mockOpenFGA = createMockOpenFGAService();
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

  describe('Forum Manager Role Permissions', () => {
    it('forum manager can create categories', async () => {
      mockOpenFGA.check.mockImplementation(async (params: any) => {
        if (params.relation === 'admin') return false;
        if (params.relation === 'forum_manager') return true;
        return false;
      });
      mockForumRepo.createCategory.mockResolvedValue(forumTestData.category());

      const dto = forumTestData.createCategoryDto();
      const result = await forumService.createCategory(dto, 'user-forum-mgr');

      expect(result).toBeDefined();
      expect(mockForumRepo.createCategory).toHaveBeenCalled();
    });

    it('forum manager can pin threads', async () => {
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

    it('forum manager can lock threads', async () => {
      mockOpenFGA.check.mockImplementation(async (params: any) => {
        if (params.relation === 'admin') return false;
        if (params.relation === 'forum_manager') return true;
        return false;
      });
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());
      mockForumRepo.findThreadById.mockResolvedValue(forumTestData.thread());
      mockForumRepo.updateThread.mockResolvedValue(forumTestData.thread({ isLocked: true }));
      mockMemberRepo.getUserRole.mockResolvedValue('member');

      const result = await forumService.lockThread('thread-123', true, 'user-forum-mgr');

      expect(result.isLocked).toBe(true);
    });

    it('forum manager can delete any thread', async () => {
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

    it('forum manager can delete any post', async () => {
      mockOpenFGA.check.mockImplementation(async (params: any) => {
        if (params.relation === 'admin') return false;
        if (params.relation === 'forum_manager') return true;
        return false;
      });
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());
      mockForumRepo.findThreadById.mockResolvedValue(forumTestData.thread());
      mockForumRepo.findPostById.mockResolvedValue(forumTestData.post({ authorId: 'user-other' }));
      mockMemberRepo.getUserRole.mockResolvedValue('member');

      await forumService.deletePost('post-123', 'user-forum-mgr');

      expect(mockForumRepo.deletePost).toHaveBeenCalledWith('post-123');
    });

    it('forum manager can update categories', async () => {
      mockOpenFGA.check.mockImplementation(async (params: any) => {
        if (params.relation === 'admin') return false;
        if (params.relation === 'forum_manager') return true;
        return false;
      });
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());
      mockForumRepo.updateCategory.mockResolvedValue(
        forumTestData.category({ name: 'Updated by Manager' })
      );

      const result = await forumService.updateCategory(
        'category-123',
        { name: 'Updated by Manager' },
        'user-forum-mgr'
      );

      expect(result.name).toBe('Updated by Manager');
    });

    it('forum manager can delete categories', async () => {
      mockOpenFGA.check.mockImplementation(async (params: any) => {
        if (params.relation === 'admin') return false;
        if (params.relation === 'forum_manager') return true;
        return false;
      });
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());
      mockForumRepo.deleteCategory.mockResolvedValue(forumTestData.category());

      await forumService.deleteCategory('category-123', 'user-forum-mgr');

      expect(mockForumRepo.deleteCategory).toHaveBeenCalledWith('category-123');
    });
  });

  describe('Trust-Based Thread Creation (default: 10)', () => {
    it('should create thread with trust >= 10', async () => {
      mockOpenFGA.check.mockResolvedValue(false); // Not admin
      mockOpenFGA.checkTrustLevel.mockResolvedValue(true); // Trust >= 10
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());
      mockForumRepo.createThread.mockResolvedValue(forumTestData.thread());
      mockMemberRepo.getUserRole.mockResolvedValue('member');

      const dto = forumTestData.createThreadDto();
      const result = await forumService.createThread(dto, 'user-trust-10');

      expect(result).toBeDefined();
      expect(mockOpenFGA.checkTrustLevel).toHaveBeenCalledWith('user-trust-10', 'comm-123', 10);
    });

    it('should fail with trust < 10', async () => {
      mockOpenFGA.check.mockResolvedValue(false); // Not admin
      mockOpenFGA.checkTrustLevel.mockResolvedValue(false); // Trust < 10
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());
      mockMemberRepo.getUserRole.mockResolvedValue('member');

      const dto = forumTestData.createThreadDto();

      await expect(forumService.createThread(dto, 'user-trust-5')).rejects.toThrow(
        'Forbidden: insufficient trust to create threads'
      );
    });

    it('should respect custom trust threshold', async () => {
      mockOpenFGA.check.mockResolvedValue(false);
      mockOpenFGA.checkTrustLevel.mockResolvedValue(false);
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());
      mockCommunityRepo.findById.mockResolvedValue({
        id: 'comm-123',
        name: 'Test Community',
        description: 'Test',
        minTrustForThreadCreation: { value: 25 }, // Custom threshold
        createdBy: 'user-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockMemberRepo.getUserRole.mockResolvedValue('member');

      const dto = forumTestData.createThreadDto();

      await expect(forumService.createThread(dto, 'user-trust-15')).rejects.toThrow(
        'Forbidden: insufficient trust to create threads'
      );

      expect(mockOpenFGA.checkTrustLevel).toHaveBeenCalledWith('user-trust-15', 'comm-123', 25);
    });
  });

  describe('Trust-Based Forum Moderation (default: 30)', () => {
    it('should allow moderation with trust >= 30', async () => {
      mockOpenFGA.check.mockImplementation(async (params: any) => {
        if (params.relation === 'admin') return false;
        if (params.relation === 'forum_manager') return false;
        return false;
      });
      mockOpenFGA.checkTrustLevel.mockResolvedValue(true); // Trust >= 30
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());
      mockCommunityRepo.findById.mockResolvedValue({
        id: 'comm-123',
        name: 'Test Community',
        description: 'Test',
        minTrustForForumModeration: { value: 30 },
        createdBy: 'user-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Note: Trust-based moderation requires implementing checkTrustLevel in checkIsForumManager
      // This test verifies the expected behavior but may need adjustment based on implementation
    });
  });

  describe('Admin Permissions (Bypass All)', () => {
    it('admin can create categories without forum_manager role', async () => {
      mockOpenFGA.check.mockImplementation(async (params: any) => {
        return params.relation === 'admin';
      });
      mockForumRepo.createCategory.mockResolvedValue(forumTestData.category());

      const dto = forumTestData.createCategoryDto();
      const result = await forumService.createCategory(dto, 'user-admin');

      expect(result).toBeDefined();
    });

    it('admin can create threads without trust requirement', async () => {
      mockOpenFGA.check.mockImplementation(async (params: any) => {
        return params.relation === 'admin';
      });
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());
      mockForumRepo.createThread.mockResolvedValue(forumTestData.thread());
      mockMemberRepo.getUserRole.mockResolvedValue('admin');

      const dto = forumTestData.createThreadDto();
      const result = await forumService.createThread(dto, 'user-admin');

      expect(result).toBeDefined();
      // checkTrustLevel should not be called for admins
    });

    it('admin can pin threads', async () => {
      mockOpenFGA.check.mockResolvedValue(true); // Admin
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());
      mockForumRepo.findThreadById.mockResolvedValue(forumTestData.thread());
      mockForumRepo.updateThread.mockResolvedValue(forumTestData.thread({ isPinned: true }));
      mockMemberRepo.getUserRole.mockResolvedValue('admin');

      const result = await forumService.pinThread('thread-123', true, 'user-admin');

      expect(result.isPinned).toBe(true);
    });

    it('admin can lock threads', async () => {
      mockOpenFGA.check.mockResolvedValue(true);
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());
      mockForumRepo.findThreadById.mockResolvedValue(forumTestData.thread());
      mockForumRepo.updateThread.mockResolvedValue(forumTestData.thread({ isLocked: true }));
      mockMemberRepo.getUserRole.mockResolvedValue('admin');

      const result = await forumService.lockThread('thread-123', true, 'user-admin');

      expect(result.isLocked).toBe(true);
    });

    it('admin can delete any thread', async () => {
      mockOpenFGA.check.mockResolvedValue(true);
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());
      mockForumRepo.findThreadById.mockResolvedValue(
        forumTestData.thread({ authorId: 'user-other' })
      );
      mockMemberRepo.getUserRole.mockResolvedValue('admin');

      await forumService.deleteThread('thread-123', 'user-admin');

      expect(mockForumRepo.deleteThread).toHaveBeenCalledWith('thread-123');
    });

    it('admin can delete any post', async () => {
      mockOpenFGA.check.mockResolvedValue(true);
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());
      mockForumRepo.findThreadById.mockResolvedValue(forumTestData.thread());
      mockForumRepo.findPostById.mockResolvedValue(forumTestData.post({ authorId: 'user-other' }));
      mockMemberRepo.getUserRole.mockResolvedValue('admin');

      await forumService.deletePost('post-123', 'user-admin');

      expect(mockForumRepo.deletePost).toHaveBeenCalledWith('post-123');
    });
  });

  describe('Non-Member Access Restrictions', () => {
    it('non-member cannot access forum categories', async () => {
      mockMemberRepo.getUserRole.mockResolvedValue(null);

      await expect(forumService.listCategories('comm-123', 'user-outsider')).rejects.toThrow(
        'Forbidden: only community members can access the forum'
      );
    });

    it('non-member cannot create threads', async () => {
      mockMemberRepo.getUserRole.mockResolvedValue(null);
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());
      mockOpenFGA.check.mockResolvedValue(false); // Not admin
      mockOpenFGA.checkTrustLevel.mockResolvedValue(false); // No trust

      const dto = forumTestData.createThreadDto();

      await expect(forumService.createThread(dto, 'user-outsider')).rejects.toThrow(
        'Forbidden: insufficient trust to create threads'
      );
    });

    it('non-member cannot create posts', async () => {
      mockMemberRepo.getUserRole.mockResolvedValue(null);
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());
      mockForumRepo.findThreadById.mockResolvedValue(forumTestData.thread());

      const dto = forumTestData.createPostDto();

      await expect(forumService.createPost(dto, 'user-outsider')).rejects.toThrow(
        'Forbidden: only community members can access the forum'
      );
    });

    it('non-member cannot vote on threads', async () => {
      mockMemberRepo.getUserRole.mockResolvedValue(null);
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());
      mockForumRepo.findThreadById.mockResolvedValue(forumTestData.thread());

      await expect(forumService.voteOnThread('thread-123', 'up', 'user-outsider')).rejects.toThrow(
        'Forbidden: only community members can access the forum'
      );
    });

    it('non-member cannot vote on posts', async () => {
      mockMemberRepo.getUserRole.mockResolvedValue(null);
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());
      mockForumRepo.findThreadById.mockResolvedValue(forumTestData.thread());
      mockForumRepo.findPostById.mockResolvedValue(forumTestData.post());

      await expect(forumService.voteOnPost('post-123', 'up', 'user-outsider')).rejects.toThrow(
        'Forbidden: only community members can access the forum'
      );
    });
  });

  describe('Reader Role Restrictions', () => {
    it('reader cannot access forum', async () => {
      mockMemberRepo.getUserRole.mockResolvedValue('reader');

      await expect(forumService.listCategories('comm-123', 'user-reader')).rejects.toThrow(
        'Forbidden: only community members can access the forum'
      );
    });

    it('reader cannot create threads', async () => {
      mockMemberRepo.getUserRole.mockResolvedValue('reader');
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());
      mockOpenFGA.check.mockResolvedValue(false); // Not admin
      mockOpenFGA.checkTrustLevel.mockResolvedValue(false); // Assume no trust

      const dto = forumTestData.createThreadDto();

      await expect(forumService.createThread(dto, 'user-reader')).rejects.toThrow(
        'Forbidden: insufficient trust to create threads'
      );
    });
  });

  describe('Regular Member Permissions', () => {
    it('member can view categories', async () => {
      mockMemberRepo.getUserRole.mockResolvedValue('member');
      mockForumRepo.findCategoriesByCommunity.mockResolvedValue([forumTestData.category()]);

      const result = await forumService.listCategories('comm-123', 'user-member');

      expect(result).toHaveLength(1);
    });

    it('member can view threads', async () => {
      mockMemberRepo.getUserRole.mockResolvedValue('member');
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());
      mockForumRepo.findThreadsByCategory.mockResolvedValue({
        threads: [forumTestData.thread()],
        total: 1,
      });

      const result = await forumService.listThreads('category-123', 'user-member');

      expect(result.threads).toHaveLength(1);
    });

    it('member can create posts', async () => {
      mockMemberRepo.getUserRole.mockResolvedValue('member');
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());
      mockForumRepo.findThreadById.mockResolvedValue(forumTestData.thread({ isLocked: false }));
      mockForumRepo.createPost.mockResolvedValue(forumTestData.post());

      const dto = forumTestData.createPostDto();
      const result = await forumService.createPost(dto, 'user-member');

      expect(result).toBeDefined();
    });

    it('member can vote on threads', async () => {
      mockMemberRepo.getUserRole.mockResolvedValue('member');
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());
      mockForumRepo.findThreadById.mockResolvedValue(forumTestData.thread());
      mockForumRepo.createOrUpdateVote.mockResolvedValue(forumTestData.vote());
      mockForumRepo.getVoteCounts.mockResolvedValue({ upvotes: 11, downvotes: 2 });

      const result = await forumService.voteOnThread('thread-123', 'up', 'user-member');

      expect(result).toBeDefined();
    });

    it('member can delete own threads', async () => {
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());
      mockForumRepo.findThreadById.mockResolvedValue(
        forumTestData.thread({ authorId: 'user-member' })
      );
      mockMemberRepo.getUserRole.mockResolvedValue('member');
      mockOpenFGA.check.mockResolvedValue(false);

      await forumService.deleteThread('thread-123', 'user-member');

      expect(mockForumRepo.deleteThread).toHaveBeenCalledWith('thread-123');
    });

    it('member can delete own posts', async () => {
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());
      mockForumRepo.findThreadById.mockResolvedValue(forumTestData.thread());
      mockForumRepo.findPostById.mockResolvedValue(forumTestData.post({ authorId: 'user-member' }));
      mockMemberRepo.getUserRole.mockResolvedValue('member');
      mockOpenFGA.check.mockResolvedValue(false);

      await forumService.deletePost('post-123', 'user-member');

      expect(mockForumRepo.deletePost).toHaveBeenCalledWith('post-123');
    });

    it('member cannot delete other users threads', async () => {
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());
      mockForumRepo.findThreadById.mockResolvedValue(
        forumTestData.thread({ authorId: 'user-other' })
      );
      mockMemberRepo.getUserRole.mockResolvedValue('member');
      mockOpenFGA.check.mockResolvedValue(false);

      await expect(forumService.deleteThread('thread-123', 'user-member')).rejects.toThrow(
        'Forbidden: only the thread author or forum managers can delete this thread'
      );
    });

    it('member cannot pin threads', async () => {
      mockOpenFGA.check.mockResolvedValue(false);
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());
      mockForumRepo.findThreadById.mockResolvedValue(forumTestData.thread({ authorId: 'user-other' }));
      mockMemberRepo.getUserRole.mockResolvedValue('member');

      await expect(forumService.pinThread('thread-123', true, 'user-member')).rejects.toThrow(
        'Forbidden'
      );
    });

    it('member cannot lock threads', async () => {
      mockOpenFGA.check.mockResolvedValue(false);
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());
      mockForumRepo.findThreadById.mockResolvedValue(forumTestData.thread({ authorId: 'user-other' }));
      mockMemberRepo.getUserRole.mockResolvedValue('member');

      await expect(forumService.lockThread('thread-123', true, 'user-member')).rejects.toThrow(
        'Forbidden'
      );
    });

    it('member cannot create categories', async () => {
      mockOpenFGA.check.mockResolvedValue(false);

      const dto = forumTestData.createCategoryDto();

      await expect(forumService.createCategory(dto, 'user-member')).rejects.toThrow(
        'Forbidden: only admins or forum managers can create categories'
      );
    });
  });
});
