/**
 * Forum Categories Tests
 * Tests for forum category CRUD operations and permissions
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

describe('Forum Categories', () => {
  let mockForumRepo: ReturnType<typeof createMockForumRepository>;
  let mockOpenFGA: ReturnType<typeof createMockOpenFGAService>;
  let mockMemberRepo: ReturnType<typeof createMockCommunityMemberRepository>;
  let mockCommunityRepo: ReturnType<typeof createMockCommunityRepository>;
  let mockUserRepo: ReturnType<typeof createMockAppUserRepository>;

  beforeEach(() => {
    // Create fresh mocks
    mockForumRepo = createMockForumRepository();
    mockOpenFGA = createMockOpenFGAService({ isAdmin: false, isForumManager: false });
    mockMemberRepo = createMockCommunityMemberRepository('member');
    mockCommunityRepo = createMockCommunityRepository();
    mockUserRepo = createMockAppUserRepository();

    // Setup service mocks
    setupForumServiceMocks(
      mockForumRepo,
      mockOpenFGA,
      mockMemberRepo,
      mockCommunityRepo,
      mockUserRepo
    );
  });

  describe('createCategory', () => {
    it('should create category as admin', async () => {
      // Setup: Make user admin
      mockOpenFGA.checkAccess.mockResolvedValue(true);
      mockForumRepo.createCategory.mockResolvedValue(forumTestData.category());

      const dto = forumTestData.createCategoryDto();
      const result = await forumService.createCategory(dto, 'user-admin');

      expect(result).toEqual(forumTestData.category());
      expect(mockForumRepo.createCategory).toHaveBeenCalledWith(dto);
      expect(mockOpenFGA.createRelationship).toHaveBeenCalled();
    });

    it('should create category as forum manager', async () => {
      // Setup: Make user forum manager (not admin)
      mockOpenFGA.checkAccess.mockResolvedValue(true);
      mockForumRepo.createCategory.mockResolvedValue(forumTestData.category());

      const dto = forumTestData.createCategoryDto();
      const result = await forumService.createCategory(dto, 'user-forum-mgr');

      expect(result).toEqual(forumTestData.category());
      expect(mockForumRepo.createCategory).toHaveBeenCalledWith(dto);
    });

    it('should fail without admin or forum manager permissions', async () => {
      // Setup: Regular member (no admin, no forum_manager)
      mockOpenFGA.checkAccess.mockResolvedValue(false);

      const dto = forumTestData.createCategoryDto();

      await expect(forumService.createCategory(dto, 'user-123')).rejects.toThrow(
        'Forbidden: only admins or forum managers can create categories'
      );
    });

    it('should validate category name length', async () => {
      mockOpenFGA.checkAccess.mockResolvedValue(true); // Admin

      const dto = forumTestData.createCategoryDto({ name: '' });

      // Note: Validation happens at repository or validator level
      // This test assumes repository throws on invalid data
      mockForumRepo.createCategory.mockRejectedValue(
        new AppError('Category name is required', 400)
      );

      await expect(forumService.createCategory(dto, 'user-admin')).rejects.toThrow(
        'Category name is required'
      );
    });
  });

  describe('listCategories', () => {
    it('should list all categories for community member', async () => {
      mockMemberRepo.getUserRole.mockResolvedValue('member');
      mockForumRepo.findCategoriesByCommunity.mockResolvedValue([
        forumTestData.category(),
        forumTestData.category({ id: 'category-456', name: 'Second Category' }),
      ]);

      const result = await forumService.listCategories('comm-123', 'user-123');

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('threadCount');
      expect(result[0]).toHaveProperty('lastActivity');
      expect(mockForumRepo.findCategoriesByCommunity).toHaveBeenCalledWith('comm-123');
    });

    it('should fail for non-member', async () => {
      mockMemberRepo.getUserRole.mockResolvedValue(null);

      await expect(forumService.listCategories('comm-123', 'user-outsider')).rejects.toThrow(
        'Forbidden: only community members can access the forum'
      );
    });

    it('should fail for reader role', async () => {
      mockMemberRepo.getUserRole.mockResolvedValue('reader');

      await expect(forumService.listCategories('comm-123', 'user-reader')).rejects.toThrow(
        'Forbidden: only community members can access the forum'
      );
    });

    it('should enrich categories with stats', async () => {
      mockMemberRepo.getUserRole.mockResolvedValue('member');
      mockForumRepo.findCategoriesByCommunity.mockResolvedValue([forumTestData.category()]);
      mockForumRepo.getCategoryStats.mockResolvedValue({
        threadCount: 15,
        lastActivity: new Date('2024-06-15'),
      });

      const result = await forumService.listCategories('comm-123', 'user-123');

      expect(result[0].threadCount).toBe(15);
      expect(result[0].lastActivity).toEqual(new Date('2024-06-15'));
    });
  });

  describe('getCategory', () => {
    it('should get category by id for community member', async () => {
      mockMemberRepo.getUserRole.mockResolvedValue('member');
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());

      const result = await forumService.getCategory('category-123', 'user-123');

      expect(result.id).toBe('category-123');
      expect(result).toHaveProperty('threadCount');
      expect(result).toHaveProperty('lastActivity');
    });

    it('should throw 404 if category not found', async () => {
      mockForumRepo.findCategoryById.mockResolvedValue(null);

      await expect(forumService.getCategory('category-invalid', 'user-123')).rejects.toThrow(
        'Category not found'
      );
    });

    it('should fail for non-member', async () => {
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());
      mockMemberRepo.getUserRole.mockResolvedValue(null);

      await expect(forumService.getCategory('category-123', 'user-outsider')).rejects.toThrow(
        'Forbidden: only community members can access the forum'
      );
    });
  });

  describe('updateCategory', () => {
    it('should update category as admin', async () => {
      mockOpenFGA.checkAccess.mockResolvedValue(true);
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());
      mockForumRepo.updateCategory.mockResolvedValue(
        forumTestData.category({ name: 'Updated Category' })
      );

      const result = await forumService.updateCategory(
        'category-123',
        { name: 'Updated Category' },
        'user-admin'
      );

      expect(result.name).toBe('Updated Category');
      expect(mockForumRepo.updateCategory).toHaveBeenCalledWith('category-123', {
        name: 'Updated Category',
      });
    });

    it('should update category as forum manager', async () => {
      mockOpenFGA.checkAccess.mockResolvedValue(true);
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());
      mockForumRepo.updateCategory.mockResolvedValue(forumTestData.category({ displayOrder: 5 }));

      const result = await forumService.updateCategory(
        'category-123',
        { displayOrder: 5 },
        'user-forum-mgr'
      );

      expect(result.displayOrder).toBe(5);
    });

    it('should fail without admin or forum manager permissions', async () => {
      mockOpenFGA.checkAccess.mockResolvedValue(false);
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());

      await expect(
        forumService.updateCategory('category-123', { name: 'Updated' }, 'user-123')
      ).rejects.toThrow('Forbidden: only admins or forum managers can update categories');
    });

    it('should throw 404 if category not found', async () => {
      mockOpenFGA.checkAccess.mockResolvedValue(true); // Admin
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());
      mockForumRepo.updateCategory.mockResolvedValue(null);

      await expect(
        forumService.updateCategory('category-invalid', { name: 'Updated' }, 'user-admin')
      ).rejects.toThrow('Category not found');
    });
  });

  describe('deleteCategory', () => {
    it('should delete category as admin', async () => {
      mockOpenFGA.checkAccess.mockResolvedValue(true); // Admin
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());
      mockForumRepo.deleteCategory.mockResolvedValue(forumTestData.category());

      await forumService.deleteCategory('category-123', 'user-admin');

      expect(mockForumRepo.deleteCategory).toHaveBeenCalledWith('category-123');
    });

    it('should delete category as forum manager', async () => {
      mockOpenFGA.checkAccess.mockResolvedValue(true);
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());
      mockForumRepo.deleteCategory.mockResolvedValue(forumTestData.category());

      await forumService.deleteCategory('category-123', 'user-forum-mgr');

      expect(mockForumRepo.deleteCategory).toHaveBeenCalledWith('category-123');
    });

    it('should fail without admin or forum manager permissions', async () => {
      mockOpenFGA.checkAccess.mockResolvedValue(false);
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());

      await expect(forumService.deleteCategory('category-123', 'user-123')).rejects.toThrow(
        'Forbidden: only admins or forum managers can delete categories'
      );
    });

    it('should throw 404 if category not found', async () => {
      mockOpenFGA.checkAccess.mockResolvedValue(true); // Admin
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());
      mockForumRepo.deleteCategory.mockResolvedValue(null);

      await expect(forumService.deleteCategory('category-invalid', 'user-admin')).rejects.toThrow(
        'Category not found'
      );
    });

    it('should fail if category has threads', async () => {
      mockOpenFGA.checkAccess.mockResolvedValue(true); // Admin
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());
      // Simulate foreign key constraint error
      mockForumRepo.deleteCategory.mockRejectedValue(
        new AppError('Cannot delete category with existing threads', 400)
      );

      await expect(forumService.deleteCategory('category-123', 'user-admin')).rejects.toThrow(
        'Cannot delete category with existing threads'
      );
    });
  });
});
