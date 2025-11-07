/**
 * Forum Service Unit Tests
 *
 * Test Coverage:
 * - Permission checks for forum operations
 * - Category CRUD operations
 * - Thread management (create, pin, lock, delete)
 * - Post management
 * - Vote operations
 * - Error handling
 */

import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { forumService } from './forum.service';
import { forumRepository } from '@/repositories/forum.repository';
import { communityMemberRepository } from '@/repositories/communityMember.repository';
import { communityRepository } from '@/repositories/community.repository';
import { appUserRepository } from '@/repositories/appUser.repository';
import { openFGAService } from './openfga.service';

// Mock repositories
const mockForumRepository = {
  createCategory: mock(),
  findCategoriesByCommunity: mock(),
  getCategoryStats: mock(),
  findCategoryById: mock(),
  updateCategory: mock(),
  deleteCategory: mock(),
  createThread: mock(),
  findThreadsByCategory: mock(),
  getThreadStats: mock(),
  getThreadTags: mock(),
  findThreadById: mock(),
  updateThread: mock(),
  deleteThread: mock(),
  createPost: mock(),
  findPostsByThread: mock(),
  getVoteCounts: mock(),
  findPostById: mock(),
  updatePost: mock(),
  deletePost: mock(),
  createOrUpdateVote: mock(),
  removeVote: mock(),
};

const mockCommunityMemberRepository = {
  getUserRole: mock(),
};

const mockCommunityRepository = {
  findById: mock(),
};

const mockAppUserRepository = {
  findById: mock(),
};

const mockOpenFGAService = {
  check: mock(),
  createRelationship: mock(),
  checkTrustLevel: mock(),
};

describe('ForumService - Permission Checks', () => {
  const validCommunityId = '550e8400-e29b-41d4-a716-446655440001';
  const validUserId = '550e8400-e29b-41d4-a716-446655440002';
  const validCategoryId = '550e8400-e29b-41d4-a716-446655440003';
  const validThreadId = '550e8400-e29b-41d4-a716-446655440004';
  const validPostId = '550e8400-e29b-41d4-a716-446655440005';

  beforeEach(() => {
    // Reset all mocks
    Object.values(mockForumRepository).forEach((m) => m.mockReset());
    Object.values(mockCommunityMemberRepository).forEach((m) => m.mockReset());
    Object.values(mockCommunityRepository).forEach((m) => m.mockReset());
    Object.values(mockAppUserRepository).forEach((m) => m.mockReset());
    Object.values(mockOpenFGAService).forEach((m) => m.mockReset());

    // Replace dependencies with mocks
    (forumRepository.createCategory as any) = mockForumRepository.createCategory;
    (forumRepository.findCategoriesByCommunity as any) =
      mockForumRepository.findCategoriesByCommunity;
    (forumRepository.getCategoryStats as any) = mockForumRepository.getCategoryStats;
    (forumRepository.findCategoryById as any) = mockForumRepository.findCategoryById;
    (forumRepository.updateCategory as any) = mockForumRepository.updateCategory;
    (forumRepository.deleteCategory as any) = mockForumRepository.deleteCategory;
    (forumRepository.createThread as any) = mockForumRepository.createThread;
    (forumRepository.findThreadsByCategory as any) = mockForumRepository.findThreadsByCategory;
    (forumRepository.getThreadStats as any) = mockForumRepository.getThreadStats;
    (forumRepository.getThreadTags as any) = mockForumRepository.getThreadTags;
    (forumRepository.findThreadById as any) = mockForumRepository.findThreadById;
    (forumRepository.updateThread as any) = mockForumRepository.updateThread;
    (forumRepository.deleteThread as any) = mockForumRepository.deleteThread;
    (forumRepository.createPost as any) = mockForumRepository.createPost;
    (forumRepository.findPostsByThread as any) = mockForumRepository.findPostsByThread;
    (forumRepository.getVoteCounts as any) = mockForumRepository.getVoteCounts;
    (forumRepository.findPostById as any) = mockForumRepository.findPostById;
    (forumRepository.updatePost as any) = mockForumRepository.updatePost;
    (forumRepository.deletePost as any) = mockForumRepository.deletePost;
    (forumRepository.createOrUpdateVote as any) = mockForumRepository.createOrUpdateVote;
    (forumRepository.removeVote as any) = mockForumRepository.removeVote;
    (communityMemberRepository.getUserRole as any) = mockCommunityMemberRepository.getUserRole;
    (communityRepository.findById as any) = mockCommunityRepository.findById;
    (appUserRepository.findById as any) = mockAppUserRepository.findById;
    (openFGAService.check as any) = mockOpenFGAService.check;
    (openFGAService.createRelationship as any) = mockOpenFGAService.createRelationship;
    (openFGAService.checkTrustLevel as any) = mockOpenFGAService.checkTrustLevel;

    // Default mock behaviors
    mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');
    mockCommunityRepository.findById.mockResolvedValue({
      id: validCommunityId,
      name: 'Test Community',
      minTrustForThreadCreation: { value: 10 },
    });
    mockOpenFGAService.check.mockResolvedValue(false);
    mockOpenFGAService.checkTrustLevel.mockResolvedValue(false);
    mockOpenFGAService.createRelationship.mockResolvedValue(undefined);
    mockAppUserRepository.findById.mockResolvedValue({
      id: validUserId,
      displayName: 'Test User',
      username: 'testuser',
    });
  });

  describe('createCategory', () => {
    it('should allow forum manager to create category', async () => {
      mockOpenFGAService.check.mockResolvedValue(true); // isForumManager returns true
      mockForumRepository.createCategory.mockResolvedValue({
        id: validCategoryId,
        communityId: validCommunityId,
        name: 'General',
        description: 'General discussion',
        createdAt: new Date(),
      });

      const result = await forumService.createCategory(
        {
          communityId: validCommunityId,
          name: 'General',
          description: 'General discussion',
        },
        validUserId
      );

      expect(result).toBeDefined();
      expect(result.id).toBe(validCategoryId);
    });

    it('should reject non-manager from creating category', async () => {
      mockOpenFGAService.check.mockResolvedValue(false);

      await expect(
        forumService.createCategory({ communityId: validCommunityId, name: 'General' }, validUserId)
      ).rejects.toThrow('Forbidden');
    });
  });

  describe('listCategories', () => {
    it('should allow member to list categories', async () => {
      mockCommunityMemberRepository.getUserRole.mockResolvedValue('member');
      mockForumRepository.findCategoriesByCommunity.mockResolvedValue([
        {
          id: validCategoryId,
          communityId: validCommunityId,
          name: 'General',
          createdAt: new Date(),
        },
      ]);
      mockForumRepository.getCategoryStats.mockResolvedValue({
        threadCount: 5,
        lastActivity: new Date(),
      });

      const result = await forumService.listCategories(validCommunityId, validUserId);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
    });

    it('should reject non-member from listing categories', async () => {
      mockCommunityMemberRepository.getUserRole.mockResolvedValue(null);

      await expect(forumService.listCategories(validCommunityId, validUserId)).rejects.toThrow(
        'Forbidden'
      );
    });
  });

  describe('updateCategory', () => {
    it('should allow forum manager to update category', async () => {
      mockForumRepository.findCategoryById.mockResolvedValue({
        id: validCategoryId,
        communityId: validCommunityId,
        name: 'General',
      });
      mockOpenFGAService.check.mockResolvedValue(true);
      mockForumRepository.updateCategory.mockResolvedValue({
        id: validCategoryId,
        communityId: validCommunityId,
        name: 'Updated General',
        createdAt: new Date(),
      });

      const result = await forumService.updateCategory(
        validCategoryId,
        { name: 'Updated General' },
        validUserId
      );

      expect(result).toBeDefined();
      expect(result.name).toBe('Updated General');
    });

    it('should reject non-manager from updating category', async () => {
      mockForumRepository.findCategoryById.mockResolvedValue({
        id: validCategoryId,
        communityId: validCommunityId,
        name: 'General',
      });
      mockOpenFGAService.check.mockResolvedValue(false);

      await expect(
        forumService.updateCategory(validCategoryId, { name: 'Updated' }, validUserId)
      ).rejects.toThrow('Forbidden');
    });
  });

  describe('deleteCategory', () => {
    it('should allow forum manager to delete category', async () => {
      mockForumRepository.findCategoryById.mockResolvedValue({
        id: validCategoryId,
        communityId: validCommunityId,
        name: 'General',
      });
      mockOpenFGAService.check.mockResolvedValue(true);
      mockForumRepository.deleteCategory.mockResolvedValue(true);

      await forumService.deleteCategory(validCategoryId, validUserId);

      expect(mockForumRepository.deleteCategory).toHaveBeenCalledWith(validCategoryId);
    });

    it('should reject non-manager from deleting category', async () => {
      mockForumRepository.findCategoryById.mockResolvedValue({
        id: validCategoryId,
        communityId: validCommunityId,
        name: 'General',
      });
      mockOpenFGAService.check.mockResolvedValue(false);

      await expect(forumService.deleteCategory(validCategoryId, validUserId)).rejects.toThrow(
        'Forbidden'
      );
    });
  });

  describe('createThread', () => {
    it('should allow user with sufficient trust to create thread', async () => {
      mockForumRepository.findCategoryById.mockResolvedValue({
        id: validCategoryId,
        communityId: validCommunityId,
        name: 'General',
      });
      mockOpenFGAService.checkTrustLevel.mockResolvedValue(true);
      mockForumRepository.createThread.mockResolvedValue({
        id: validThreadId,
        categoryId: validCategoryId,
        authorId: validUserId,
        title: 'Test Thread',
        content: 'Test content',
        createdAt: new Date(),
      });
      mockForumRepository.getThreadStats.mockResolvedValue({
        postCount: 0,
        lastActivity: new Date(),
        upvotes: 0,
        downvotes: 0,
      });
      mockForumRepository.getThreadTags.mockResolvedValue([]);

      const result = await forumService.createThread(
        {
          categoryId: validCategoryId,
          title: 'Test Thread',
          content: 'Test content',
        },
        validUserId
      );

      expect(result).toBeDefined();
      expect(result.id).toBe(validThreadId);
    });

    it('should reject user with insufficient trust from creating thread', async () => {
      mockForumRepository.findCategoryById.mockResolvedValue({
        id: validCategoryId,
        communityId: validCommunityId,
        name: 'General',
      });
      mockOpenFGAService.checkTrustLevel.mockResolvedValue(false);

      await expect(
        forumService.createThread(
          {
            categoryId: validCategoryId,
            title: 'Test',
            content: 'Content',
          },
          validUserId
        )
      ).rejects.toThrow('Forbidden');
    });
  });

  describe('pinThread', () => {
    it('should allow forum manager to pin thread', async () => {
      mockForumRepository.findThreadById.mockResolvedValue({
        id: validThreadId,
        categoryId: validCategoryId,
        authorId: validUserId,
        title: 'Test Thread',
        isPinned: false,
      });
      mockForumRepository.findCategoryById.mockResolvedValue({
        id: validCategoryId,
        communityId: validCommunityId,
        name: 'General',
      });
      mockOpenFGAService.check.mockResolvedValue(true);
      mockForumRepository.updateThread.mockResolvedValue({
        id: validThreadId,
        categoryId: validCategoryId,
        authorId: validUserId,
        title: 'Test Thread',
        isPinned: true,
        createdAt: new Date(),
      });

      const result = await forumService.pinThread(validThreadId, true, validUserId);

      expect(result).toBeDefined();
      expect(result.isPinned).toBe(true);
    });

    it('should reject non-manager from pinning thread', async () => {
      mockForumRepository.findThreadById.mockResolvedValue({
        id: validThreadId,
        categoryId: validCategoryId,
        authorId: 'other-user',
        title: 'Test Thread',
      });
      mockForumRepository.findCategoryById.mockResolvedValue({
        id: validCategoryId,
        communityId: validCommunityId,
        name: 'General',
      });
      mockOpenFGAService.check.mockResolvedValue(false);

      await expect(forumService.pinThread(validThreadId, true, validUserId)).rejects.toThrow(
        'Forbidden'
      );
    });
  });

  describe('lockThread', () => {
    it('should allow forum manager to lock thread', async () => {
      mockForumRepository.findThreadById.mockResolvedValue({
        id: validThreadId,
        categoryId: validCategoryId,
        authorId: validUserId,
        title: 'Test Thread',
        isLocked: false,
      });
      mockForumRepository.findCategoryById.mockResolvedValue({
        id: validCategoryId,
        communityId: validCommunityId,
        name: 'General',
      });
      mockOpenFGAService.check.mockResolvedValue(true);
      mockForumRepository.updateThread.mockResolvedValue({
        id: validThreadId,
        categoryId: validCategoryId,
        authorId: validUserId,
        title: 'Test Thread',
        isLocked: true,
        createdAt: new Date(),
      });

      const result = await forumService.lockThread(validThreadId, true, validUserId);

      expect(result).toBeDefined();
      expect(result.isLocked).toBe(true);
    });

    it('should reject non-manager from locking thread', async () => {
      mockForumRepository.findThreadById.mockResolvedValue({
        id: validThreadId,
        categoryId: validCategoryId,
        authorId: 'other-user',
        title: 'Test Thread',
      });
      mockForumRepository.findCategoryById.mockResolvedValue({
        id: validCategoryId,
        communityId: validCommunityId,
        name: 'General',
      });
      mockOpenFGAService.check.mockResolvedValue(false);

      await expect(forumService.lockThread(validThreadId, true, validUserId)).rejects.toThrow(
        'Forbidden'
      );
    });
  });
});
