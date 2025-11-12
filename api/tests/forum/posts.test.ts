/**
 * Forum Posts Tests
 * Tests for forum post CRUD operations and permissions
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

describe('Forum Posts', () => {
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

  describe('createPost', () => {
    it('should create post (reply to thread)', async () => {
      mockMemberRepo.getUserRole.mockResolvedValue('member');
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());
      mockForumRepo.findThreadById.mockResolvedValue(forumTestData.thread({ isLocked: false }));
      mockForumRepo.createPost.mockResolvedValue(forumTestData.post());

      const dto = forumTestData.createPostDto();
      const result = await forumService.createPost(dto, 'user-123');

      expect(result.id).toBe('post-123');
      expect(result).toHaveProperty('upvotes');
      expect(result).toHaveProperty('downvotes');
      expect(result).toHaveProperty('isBestAnswer');
      expect(mockForumRepo.createPost).toHaveBeenCalledWith({
        ...dto,
        authorId: 'user-123',
      });
    });

    it('should fail to post in locked thread', async () => {
      mockMemberRepo.getUserRole.mockResolvedValue('member');
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());
      mockForumRepo.findThreadById.mockResolvedValue(forumTestData.thread({ isLocked: true }));

      const dto = forumTestData.createPostDto();

      await expect(forumService.createPost(dto, 'user-123')).rejects.toThrow(
        'Cannot post in locked thread'
      );
    });

    it('should fail for non-member', async () => {
      mockMemberRepo.getUserRole.mockResolvedValue(null);
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());
      mockForumRepo.findThreadById.mockResolvedValue(forumTestData.thread());

      const dto = forumTestData.createPostDto();

      await expect(forumService.createPost(dto, 'user-outsider')).rejects.toThrow(
        'Forbidden: only community members can access the forum'
      );
    });

    it('should validate post content length', async () => {
      mockMemberRepo.getUserRole.mockResolvedValue('member');
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());
      mockForumRepo.findThreadById.mockResolvedValue(forumTestData.thread());

      const dto = forumTestData.createPostDto({ content: '' });

      mockForumRepo.createPost.mockRejectedValue(new AppError('Content is required', 400));

      await expect(forumService.createPost(dto, 'user-123')).rejects.toThrow(
        'Content is required'
      );
    });

    it('should throw 404 if thread not found', async () => {
      mockMemberRepo.getUserRole.mockResolvedValue('member');
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());
      mockForumRepo.findThreadById.mockResolvedValue(null);

      const dto = forumTestData.createPostDto({ threadId: 'thread-invalid' });

      await expect(forumService.createPost(dto, 'user-123')).rejects.toThrow('Thread not found');
    });

    it('should create OpenFGA relationships', async () => {
      mockMemberRepo.getUserRole.mockResolvedValue('member');
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());
      mockForumRepo.findThreadById.mockResolvedValue(forumTestData.thread());
      mockForumRepo.createPost.mockResolvedValue(forumTestData.post());

      const dto = forumTestData.createPostDto();
      await forumService.createPost(dto, 'user-123');

      expect(mockOpenFGA.createRelationship).toHaveBeenCalledWith(
        'forum_post',
        'post-123',
        'parent_community',
        'community',
        'comm-123'
      );
      expect(mockOpenFGA.createRelationship).toHaveBeenCalledWith(
        'forum_post',
        'post-123',
        'author',
        'user',
        'user-123'
      );
      expect(mockOpenFGA.createRelationship).toHaveBeenCalledWith(
        'forum_post',
        'post-123',
        'parent_thread',
        'forum_thread',
        'thread-123'
      );
    });
  });

  describe('updatePost', () => {
    it('should update own post', async () => {
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());
      mockForumRepo.findThreadById.mockResolvedValue(forumTestData.thread());
      mockForumRepo.findPostById.mockResolvedValue(forumTestData.post({ authorId: 'user-123' }));
      mockForumRepo.updatePost.mockResolvedValue(
        forumTestData.post({ content: 'Updated content' })
      );
      mockMemberRepo.getUserRole.mockResolvedValue('member');
      mockOpenFGA.checkAccess.mockResolvedValue(false); // Not admin/manager

      const result = await forumService.updatePost('post-123', { content: 'Updated content' }, 'user-123');

      expect(result.content).toBe('Updated content');
      expect(mockForumRepo.updatePost).toHaveBeenCalledWith('post-123', {
        content: 'Updated content',
      });
    });

    it('should update any post as admin', async () => {
      mockOpenFGA.checkAccess.mockResolvedValue(true); // Admin
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());
      mockForumRepo.findThreadById.mockResolvedValue(forumTestData.thread());
      mockForumRepo.findPostById.mockResolvedValue(forumTestData.post({ authorId: 'user-other' }));
      mockForumRepo.updatePost.mockResolvedValue(
        forumTestData.post({ content: 'Admin edited' })
      );
      mockMemberRepo.getUserRole.mockResolvedValue('admin');

      const result = await forumService.updatePost('post-123', { content: 'Admin edited' }, 'user-admin');

      expect(result.content).toBe('Admin edited');
    });

    it('should update any post as forum manager', async () => {
      mockOpenFGA.checkAccess.mockResolvedValue(true);
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());
      mockForumRepo.findThreadById.mockResolvedValue(forumTestData.thread());
      mockForumRepo.findPostById.mockResolvedValue(forumTestData.post({ authorId: 'user-other' }));
      mockForumRepo.updatePost.mockResolvedValue(
        forumTestData.post({ content: 'Manager edited' })
      );
      mockMemberRepo.getUserRole.mockResolvedValue('member');

      const result = await forumService.updatePost('post-123', { content: 'Manager edited' }, 'user-forum-mgr');

      expect(result.content).toBe('Manager edited');
    });

    it('should fail to update other users post without permissions', async () => {
      mockOpenFGA.checkAccess.mockResolvedValue(false);
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());
      mockForumRepo.findThreadById.mockResolvedValue(forumTestData.thread());
      mockForumRepo.findPostById.mockResolvedValue(forumTestData.post({ authorId: 'user-other' }));
      mockMemberRepo.getUserRole.mockResolvedValue('member');

      await expect(
        forumService.updatePost('post-123', { content: 'Hacked' }, 'user-123')
      ).rejects.toThrow('Forbidden: only the post author or forum managers can edit this post');
    });

    it('should throw 404 if post not found', async () => {
      mockForumRepo.findPostById.mockResolvedValue(null);

      await expect(
        forumService.updatePost('post-invalid', { content: 'Updated' }, 'user-123')
      ).rejects.toThrow('Post not found');
    });

    it('should throw 404 if update returns null', async () => {
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());
      mockForumRepo.findThreadById.mockResolvedValue(forumTestData.thread());
      mockForumRepo.findPostById.mockResolvedValue(forumTestData.post({ authorId: 'user-123' }));
      mockForumRepo.updatePost.mockResolvedValue(null);
      mockMemberRepo.getUserRole.mockResolvedValue('member');

      await expect(
        forumService.updatePost('post-123', { content: 'Updated' }, 'user-123')
      ).rejects.toThrow('Post not found');
    });
  });

  describe('deletePost', () => {
    it('should delete own post', async () => {
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());
      mockForumRepo.findThreadById.mockResolvedValue(forumTestData.thread());
      mockForumRepo.findPostById.mockResolvedValue(forumTestData.post({ authorId: 'user-123' }));
      mockMemberRepo.getUserRole.mockResolvedValue('member');
      mockOpenFGA.checkAccess.mockResolvedValue(false);

      await forumService.deletePost('post-123', 'user-123');

      expect(mockForumRepo.deletePost).toHaveBeenCalledWith('post-123');
    });

    it('should delete any post as admin', async () => {
      mockOpenFGA.checkAccess.mockResolvedValue(true); // Admin
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());
      mockForumRepo.findThreadById.mockResolvedValue(forumTestData.thread());
      mockForumRepo.findPostById.mockResolvedValue(forumTestData.post({ authorId: 'user-other' }));
      mockMemberRepo.getUserRole.mockResolvedValue('admin');

      await forumService.deletePost('post-123', 'user-admin');

      expect(mockForumRepo.deletePost).toHaveBeenCalledWith('post-123');
    });

    it('should delete any post as forum manager', async () => {
      mockOpenFGA.checkAccess.mockResolvedValue(true);
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());
      mockForumRepo.findThreadById.mockResolvedValue(forumTestData.thread());
      mockForumRepo.findPostById.mockResolvedValue(forumTestData.post({ authorId: 'user-other' }));
      mockMemberRepo.getUserRole.mockResolvedValue('member');

      await forumService.deletePost('post-123', 'user-forum-mgr');

      expect(mockForumRepo.deletePost).toHaveBeenCalledWith('post-123');
    });

    it('should fail to delete other users post without permissions', async () => {
      mockOpenFGA.checkAccess.mockResolvedValue(false);
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());
      mockForumRepo.findThreadById.mockResolvedValue(forumTestData.thread());
      mockForumRepo.findPostById.mockResolvedValue(forumTestData.post({ authorId: 'user-other' }));
      mockMemberRepo.getUserRole.mockResolvedValue('member');

      await expect(forumService.deletePost('post-123', 'user-123')).rejects.toThrow(
        'Forbidden: only the post author or forum managers can delete this post'
      );
    });

    it('should throw 404 if post not found', async () => {
      mockForumRepo.findPostById.mockResolvedValue(null);

      await expect(forumService.deletePost('post-invalid', 'user-123')).rejects.toThrow(
        'Post not found'
      );
    });
  });
});
