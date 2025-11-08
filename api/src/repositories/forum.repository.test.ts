import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { ForumRepository } from '@/repositories/forum.repository';
import { createThenableMockDb, setupMockDbChains } from '../../tests/helpers/mockDb';

let forumRepository: ForumRepository;

// Create mock database
const mockDb = createThenableMockDb();

const testCategory = {
  id: 'category-123',
  communityId: 'comm-123',
  name: 'General Discussion',
  description: 'General community discussions',
  displayOrder: 0,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

const testThread = {
  id: 'thread-123',
  categoryId: 'category-123',
  title: 'Test Thread',
  content: 'Test thread content',
  authorId: 'user-123',
  isPinned: false,
  isLocked: false,
  bestAnswerPostId: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

const testPost = {
  id: 'post-123',
  threadId: 'thread-123',
  content: 'Test post content',
  authorId: 'user-456',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

const testVote = {
  id: 'vote-123',
  userId: 'user-789',
  threadId: 'thread-123',
  postId: null,
  voteType: 'up' as const,
  createdAt: new Date('2024-01-01'),
};

describe('ForumRepository', () => {
  beforeEach(() => {
    // Reset all mocks and setup default chains
    setupMockDbChains(mockDb);
    // Instantiate repository with the per-test mock DB
    forumRepository = new ForumRepository(mockDb as any);
  });

  afterEach(() => {
    // Nothing to clean up; a fresh ForumRepository is created per test
  });

  describe('Category Operations', () => {
    describe('createCategory', () => {
      it('should create a category', async () => {
        mockDb.returning.mockResolvedValue([testCategory]);

        const result = await forumRepository.createCategory({
          communityId: 'comm-123',
          name: 'General Discussion',
          description: 'General community discussions',
          displayOrder: 0,
        });

        expect(result).toEqual(testCategory);
        expect(mockDb.insert).toHaveBeenCalled();
        expect(mockDb.values).toHaveBeenCalled();
        expect(mockDb.returning).toHaveBeenCalled();
      });

      it('should create category without description', async () => {
        const categoryWithoutDesc = { ...testCategory, description: null };
        mockDb.returning.mockResolvedValue([categoryWithoutDesc]);

        const result = await forumRepository.createCategory({
          communityId: 'comm-123',
          name: 'General Discussion',
        });

        expect(result.description).toBeNull();
      });
    });

    describe('findCategoryById', () => {
      it('should find category by id', async () => {
        mockDb.where.mockReturnValueOnce(mockDb);
        mockDb.then.mockImplementationOnce((resolve) => resolve([testCategory]));

        const result = await forumRepository.findCategoryById('category-123');

        expect(result).toEqual(testCategory);
        expect(mockDb.select).toHaveBeenCalled();
        expect(mockDb.where).toHaveBeenCalled();
      });

      it('should return undefined if not found', async () => {
        mockDb.where.mockReturnValueOnce(mockDb);
        mockDb.then.mockImplementationOnce((resolve) => resolve([]));

        const result = await forumRepository.findCategoryById('nonexistent');

        expect(result).toBeUndefined();
      });
    });

    describe('findCategoriesByCommunity', () => {
      it('should find all categories for a community', async () => {
        mockDb.orderBy.mockReturnValueOnce(mockDb);
        mockDb.then.mockImplementationOnce((resolve) => resolve([testCategory]));

        const result = await forumRepository.findCategoriesByCommunity('comm-123');

        expect(result).toHaveLength(1);
        expect(result[0]).toEqual(testCategory);
        expect(mockDb.where).toHaveBeenCalled();
        expect(mockDb.orderBy).toHaveBeenCalled();
      });

      it('should return empty array if no categories', async () => {
        mockDb.orderBy.mockReturnValueOnce(mockDb);
        mockDb.then.mockImplementationOnce((resolve) => resolve([]));

        const result = await forumRepository.findCategoriesByCommunity('comm-123');

        expect(result).toHaveLength(0);
      });
    });

    describe('updateCategory', () => {
      it('should update category', async () => {
        const updatedCategory = {
          ...testCategory,
          name: 'Updated Name',
        };
        mockDb.returning.mockResolvedValue([updatedCategory]);

        const result = await forumRepository.updateCategory('category-123', {
          name: 'Updated Name',
        });

        expect(result?.name).toBe('Updated Name');
        expect(mockDb.update).toHaveBeenCalled();
        expect(mockDb.set).toHaveBeenCalled();
      });

      it('should return undefined if category not found', async () => {
        mockDb.returning.mockResolvedValue([]);

        const result = await forumRepository.updateCategory('nonexistent', {
          name: 'New Name',
        });

        expect(result).toBeUndefined();
      });
    });

    describe('deleteCategory', () => {
      it('should delete category', async () => {
        mockDb.returning.mockResolvedValue([testCategory]);

        const result = await forumRepository.deleteCategory('category-123');

        expect(result).toEqual(testCategory);
        expect(mockDb.delete).toHaveBeenCalled();
      });
    });
  });

  describe('Thread Operations', () => {
    describe('createThread', () => {
      it('should create thread without tags', async () => {
        mockDb.returning.mockResolvedValue([testThread]);

        const result = await forumRepository.createThread({
          categoryId: 'category-123',
          title: 'Test Thread',
          content: 'Test thread content',
          authorId: 'user-123',
        });

        expect(result).toEqual(testThread);
        expect(mockDb.insert).toHaveBeenCalledTimes(1);
      });

      it('should create thread with tags', async () => {
        mockDb.returning.mockResolvedValueOnce([testThread]);
        mockDb.values.mockReturnValueOnce(mockDb);
        mockDb.then.mockImplementationOnce((resolve) => resolve([]));

        const result = await forumRepository.createThread({
          categoryId: 'category-123',
          title: 'Test Thread',
          content: 'Test thread content',
          authorId: 'user-123',
          tags: ['question', 'help'],
        });

        expect(result).toEqual(testThread);
        expect(mockDb.insert).toHaveBeenCalledTimes(2); // thread + tags
      });
    });

    describe('findThreadById', () => {
      it('should find thread by id', async () => {
        mockDb.where.mockReturnValueOnce(mockDb);
        mockDb.then.mockImplementationOnce((resolve) => resolve([testThread]));

        const result = await forumRepository.findThreadById('thread-123');

        expect(result).toEqual(testThread);
      });

      it('should return undefined if not found', async () => {
        mockDb.where.mockReturnValueOnce(mockDb);
        mockDb.then.mockImplementationOnce((resolve) => resolve([]));

        const result = await forumRepository.findThreadById('nonexistent');

        expect(result).toBeUndefined();
      });
    });

    describe('findThreadsByCategory', () => {
      it('should find threads by category with defaults', async () => {
        mockDb.where.mockReturnValueOnce(mockDb);
        mockDb.then.mockImplementationOnce((resolve) => resolve([{ count: 1 }]));
        mockDb.offset.mockReturnValueOnce(mockDb);
        mockDb.then.mockImplementationOnce((resolve) =>
          resolve([
            {
              thread: testThread,
              postCount: 5,
              upvotes: 10,
            },
          ])
        );

        const result = await forumRepository.findThreadsByCategory('category-123');

        expect(result.threads).toHaveLength(1);
        expect(result.total).toBe(1);
        expect(mockDb.limit).toHaveBeenCalled();
        expect(mockDb.offset).toHaveBeenCalled();
      });

      it('should sort by newest', async () => {
        mockDb.where.mockReturnValueOnce(mockDb);
        mockDb.then.mockImplementationOnce((resolve) => resolve([{ count: 0 }]));
        mockDb.offset.mockReturnValueOnce(mockDb);
        mockDb.then.mockImplementationOnce((resolve) => resolve([]));

        const result = await forumRepository.findThreadsByCategory('category-123', {
          sort: 'newest',
        });

        expect(mockDb.orderBy).toHaveBeenCalled();
      });

      it('should sort by popular', async () => {
        mockDb.where.mockReturnValueOnce(mockDb);
        mockDb.then.mockImplementationOnce((resolve) => resolve([{ count: 0 }]));
        mockDb.offset.mockReturnValueOnce(mockDb);
        mockDb.then.mockImplementationOnce((resolve) => resolve([]));

        const result = await forumRepository.findThreadsByCategory('category-123', {
          sort: 'popular',
        });

        expect(mockDb.orderBy).toHaveBeenCalled();
      });

      it('should sort by most upvoted', async () => {
        mockDb.where.mockReturnValueOnce(mockDb);
        mockDb.then.mockImplementationOnce((resolve) => resolve([{ count: 0 }]));
        mockDb.offset.mockReturnValueOnce(mockDb);
        mockDb.then.mockImplementationOnce((resolve) => resolve([]));

        const result = await forumRepository.findThreadsByCategory('category-123', {
          sort: 'mostUpvoted',
        });

        expect(mockDb.orderBy).toHaveBeenCalled();
      });

      it('should handle pagination', async () => {
        mockDb.where.mockReturnValueOnce(mockDb);
        mockDb.then.mockImplementationOnce((resolve) => resolve([{ count: 50 }]));
        mockDb.offset.mockReturnValueOnce(mockDb);
        mockDb.then.mockImplementationOnce((resolve) => resolve([]));

        const result = await forumRepository.findThreadsByCategory('category-123', {
          limit: 10,
          offset: 20,
        });

        expect(result.total).toBe(50);
        expect(mockDb.limit).toHaveBeenCalled();
        expect(mockDb.offset).toHaveBeenCalled();
      });
    });

    describe('updateThread', () => {
      it('should update thread', async () => {
        const updatedThread = { ...testThread, title: 'Updated Title' };
        mockDb.returning.mockResolvedValue([updatedThread]);

        const result = await forumRepository.updateThread('thread-123', {
          title: 'Updated Title',
        });

        expect(result?.title).toBe('Updated Title');
        expect(mockDb.update).toHaveBeenCalled();
      });

      it('should pin thread', async () => {
        const pinnedThread = { ...testThread, isPinned: true };
        mockDb.returning.mockResolvedValue([pinnedThread]);

        const result = await forumRepository.updateThread('thread-123', {
          isPinned: true,
        });

        expect(result?.isPinned).toBe(true);
      });

      it('should lock thread', async () => {
        const lockedThread = { ...testThread, isLocked: true };
        mockDb.returning.mockResolvedValue([lockedThread]);

        const result = await forumRepository.updateThread('thread-123', {
          isLocked: true,
        });

        expect(result?.isLocked).toBe(true);
      });

      it('should set best answer', async () => {
        const threadWithAnswer = {
          ...testThread,
          bestAnswerPostId: 'post-456',
        };
        mockDb.returning.mockResolvedValue([threadWithAnswer]);

        const result = await forumRepository.updateThread('thread-123', {
          bestAnswerPostId: 'post-456',
        });

        expect(result?.bestAnswerPostId).toBe('post-456');
      });
    });

    describe('deleteThread', () => {
      it('should delete thread', async () => {
        mockDb.returning.mockResolvedValue([testThread]);

        const result = await forumRepository.deleteThread('thread-123');

        expect(result).toEqual(testThread);
        expect(mockDb.delete).toHaveBeenCalled();
      });
    });

    describe('getThreadTags', () => {
      it('should get tags for thread', async () => {
        mockDb.where.mockReturnValueOnce(mockDb);
        mockDb.then.mockImplementationOnce((resolve) =>
          resolve([
            { threadId: 'thread-123', tag: 'question' },
            { threadId: 'thread-123', tag: 'help' },
          ])
        );

        const result = await forumRepository.getThreadTags('thread-123');

        expect(result).toEqual(['question', 'help']);
      });

      it('should return empty array if no tags', async () => {
        mockDb.where.mockReturnValueOnce(mockDb);
        mockDb.then.mockImplementationOnce((resolve) => resolve([]));

        const result = await forumRepository.getThreadTags('thread-123');

        expect(result).toHaveLength(0);
      });
    });
  });

  describe('Post Operations', () => {
    describe('createPost', () => {
      it('should create a post', async () => {
        mockDb.returning.mockResolvedValue([testPost]);

        const result = await forumRepository.createPost({
          threadId: 'thread-123',
          content: 'Test post content',
          authorId: 'user-456',
        });

        expect(result).toEqual(testPost);
        expect(mockDb.insert).toHaveBeenCalled();
        expect(mockDb.values).toHaveBeenCalled();
      });
    });

    describe('findPostById', () => {
      it('should find post by id', async () => {
        mockDb.where.mockReturnValueOnce(mockDb);
        mockDb.then.mockImplementationOnce((resolve) => resolve([testPost]));

        const result = await forumRepository.findPostById('post-123');

        expect(result).toEqual(testPost);
      });

      it('should return undefined if not found', async () => {
        mockDb.where.mockReturnValueOnce(mockDb);
        mockDb.then.mockImplementationOnce((resolve) => resolve([]));

        const result = await forumRepository.findPostById('nonexistent');

        expect(result).toBeUndefined();
      });
    });

    describe('findPostsByThread', () => {
      it('should find posts by thread', async () => {
        mockDb.offset.mockReturnValueOnce(mockDb);
        mockDb.then.mockImplementationOnce((resolve) => resolve([testPost]));

        const result = await forumRepository.findPostsByThread('thread-123');

        expect(result).toHaveLength(1);
        expect(result[0]).toEqual(testPost);
        expect(mockDb.orderBy).toHaveBeenCalled();
      });

      it('should handle pagination', async () => {
        mockDb.offset.mockReturnValueOnce(mockDb);
        mockDb.then.mockImplementationOnce((resolve) => resolve([]));

        const result = await forumRepository.findPostsByThread('thread-123', {
          limit: 25,
          offset: 50,
        });

        expect(mockDb.limit).toHaveBeenCalled();
        expect(mockDb.offset).toHaveBeenCalled();
      });

      it('should return empty array if no posts', async () => {
        mockDb.offset.mockReturnValueOnce(mockDb);
        mockDb.then.mockImplementationOnce((resolve) => resolve([]));

        const result = await forumRepository.findPostsByThread('thread-123');

        expect(result).toHaveLength(0);
      });
    });

    describe('updatePost', () => {
      it('should update post', async () => {
        const updatedPost = { ...testPost, content: 'Updated content' };
        mockDb.returning.mockResolvedValue([updatedPost]);

        const result = await forumRepository.updatePost('post-123', {
          content: 'Updated content',
        });

        expect(result?.content).toBe('Updated content');
        expect(mockDb.update).toHaveBeenCalled();
      });

      it('should return undefined if post not found', async () => {
        mockDb.returning.mockResolvedValue([]);

        const result = await forumRepository.updatePost('nonexistent', {
          content: 'New content',
        });

        expect(result).toBeUndefined();
      });
    });

    describe('deletePost', () => {
      it('should delete post', async () => {
        mockDb.returning.mockResolvedValue([testPost]);

        const result = await forumRepository.deletePost('post-123');

        expect(result).toEqual(testPost);
        expect(mockDb.delete).toHaveBeenCalled();
      });
    });
  });

  describe('Vote Operations', () => {
    describe('createOrUpdateVote', () => {
      it('should create new vote for thread', async () => {
        mockDb.where.mockReturnValueOnce(mockDb);
        mockDb.then.mockImplementationOnce((resolve) => resolve([]));
        mockDb.returning.mockResolvedValue([testVote]);

        const result = await forumRepository.createOrUpdateVote({
          userId: 'user-789',
          threadId: 'thread-123',
          voteType: 'up',
        });

        expect(result).toEqual(testVote);
        expect(mockDb.insert).toHaveBeenCalled();
      });

      it('should create new vote for post', async () => {
        const postVote = { ...testVote, threadId: null, postId: 'post-123' };
        mockDb.where.mockReturnValueOnce(mockDb);
        mockDb.then.mockImplementationOnce((resolve) => resolve([]));
        mockDb.returning.mockResolvedValue([postVote]);

        const result = await forumRepository.createOrUpdateVote({
          userId: 'user-789',
          postId: 'post-123',
          voteType: 'up',
        });

        expect(result.postId).toBe('post-123');
      });

      it('should update existing vote', async () => {
        const existingVote = { ...testVote, id: 'vote-123' };
        const updatedVote = { ...existingVote, voteType: 'down' as const };

        mockDb.where.mockReturnValueOnce(mockDb);
        mockDb.then.mockImplementationOnce((resolve) => resolve([existingVote]));
        mockDb.returning.mockResolvedValue([updatedVote]);

        const result = await forumRepository.createOrUpdateVote({
          userId: 'user-789',
          threadId: 'thread-123',
          voteType: 'down',
        });

        expect(result.voteType).toBe('down');
        expect(mockDb.update).toHaveBeenCalled();
      });
    });

    describe('removeVote', () => {
      it('should remove vote from thread', async () => {
        mockDb.where.mockReturnValueOnce(mockDb);
        mockDb.then.mockImplementationOnce((resolve) => resolve(undefined));

        await forumRepository.removeVote('user-789', 'thread-123');

        expect(mockDb.delete).toHaveBeenCalled();
        expect(mockDb.where).toHaveBeenCalled();
      });

      it('should remove vote from post', async () => {
        mockDb.where.mockReturnValueOnce(mockDb);
        mockDb.then.mockImplementationOnce((resolve) => resolve(undefined));

        await forumRepository.removeVote('user-789', undefined, 'post-123');

        expect(mockDb.delete).toHaveBeenCalled();
        expect(mockDb.where).toHaveBeenCalled();
      });
    });

    describe('getVoteCounts', () => {
      it('should get vote counts for thread', async () => {
        mockDb.where.mockReturnValueOnce(mockDb);
        mockDb.then.mockImplementationOnce((resolve) => resolve([{ upvotes: 10, downvotes: 2 }]));

        const result = await forumRepository.getVoteCounts('thread-123');

        expect(result.upvotes).toBe(10);
        expect(result.downvotes).toBe(2);
      });

      it('should get vote counts for post', async () => {
        mockDb.where.mockReturnValueOnce(mockDb);
        mockDb.then.mockImplementationOnce((resolve) => resolve([{ upvotes: 5, downvotes: 1 }]));

        const result = await forumRepository.getVoteCounts(undefined, 'post-123');

        expect(result.upvotes).toBe(5);
        expect(result.downvotes).toBe(1);
      });

      it('should return zero counts if no votes', async () => {
        mockDb.where.mockReturnValueOnce(mockDb);
        mockDb.then.mockImplementationOnce((resolve) => resolve([]));

        const result = await forumRepository.getVoteCounts('thread-123');

        expect(result.upvotes).toBe(0);
        expect(result.downvotes).toBe(0);
      });
    });

    describe('getUserVote', () => {
      it('should get user vote for thread', async () => {
        mockDb.where.mockReturnValueOnce(mockDb);
        mockDb.then.mockImplementationOnce((resolve) => resolve([testVote]));

        const result = await forumRepository.getUserVote('user-789', 'thread-123');

        expect(result).toEqual(testVote);
      });

      it('should get user vote for post', async () => {
        const postVote = { ...testVote, threadId: null, postId: 'post-123' };
        mockDb.where.mockReturnValueOnce(mockDb);
        mockDb.then.mockImplementationOnce((resolve) => resolve([postVote]));

        const result = await forumRepository.getUserVote('user-789', undefined, 'post-123');

        expect(result).toEqual(postVote);
      });

      it('should return undefined if no vote', async () => {
        mockDb.where.mockReturnValueOnce(mockDb);
        mockDb.then.mockImplementationOnce((resolve) => resolve([]));

        const result = await forumRepository.getUserVote('user-789', 'thread-123');

        expect(result).toBeUndefined();
      });
    });
  });

  describe('Stats & Aggregations', () => {
    describe('getCategoryStats', () => {
      it('should get category statistics', async () => {
        mockDb.where.mockReturnValueOnce(mockDb);
        mockDb.then.mockImplementationOnce((resolve) =>
          resolve([
            {
              threadCount: 15,
              lastActivity: new Date('2024-01-15'),
            },
          ])
        );

        const result = await forumRepository.getCategoryStats('category-123');

        expect(result.threadCount).toBe(15);
        expect(result.lastActivity).toEqual(new Date('2024-01-15'));
      });

      it('should return zeros if no threads', async () => {
        mockDb.where.mockReturnValueOnce(mockDb);
        mockDb.then.mockImplementationOnce((resolve) => resolve([]));

        const result = await forumRepository.getCategoryStats('category-123');

        expect(result.threadCount).toBe(0);
        expect(result.lastActivity).toBeNull();
      });
    });

    describe('getThreadStats', () => {
      it('should get thread statistics', async () => {
        mockDb.where.mockReturnValueOnce(mockDb);
        mockDb.then.mockImplementationOnce((resolve) =>
          resolve([
            {
              postCount: 25,
              lastActivity: new Date('2024-01-10'),
            },
          ])
        );
        mockDb.where.mockReturnValueOnce(mockDb);
        mockDb.then.mockImplementationOnce((resolve) => resolve([{ upvotes: 12, downvotes: 3 }]));

        const result = await forumRepository.getThreadStats('thread-123');

        expect(result.postCount).toBe(25);
        expect(result.lastActivity).toEqual(new Date('2024-01-10'));
        expect(result.upvotes).toBe(12);
        expect(result.downvotes).toBe(3);
      });

      it('should return zeros if no posts or votes', async () => {
        mockDb.where.mockReturnValueOnce(mockDb);
        mockDb.then.mockImplementationOnce((resolve) => resolve([]));
        mockDb.where.mockReturnValueOnce(mockDb);
        mockDb.then.mockImplementationOnce((resolve) => resolve([]));

        const result = await forumRepository.getThreadStats('thread-123');

        expect(result.postCount).toBe(0);
        expect(result.lastActivity).toBeNull();
        expect(result.upvotes).toBe(0);
        expect(result.downvotes).toBe(0);
      });
    });
  });
});
