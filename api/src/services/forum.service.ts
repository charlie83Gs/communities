import {
  forumRepository,
  ForumCategoryRecord,
  ForumThreadRecord,
  ForumPostRecord,
  CreateCategoryDto,
  UpdateCategoryDto,
  CreateThreadDto,
  UpdateThreadDto,
  CreatePostDto,
  UpdatePostDto,
} from '@repositories/forum.repository';
import { communityMemberRepository } from '@repositories/communityMember.repository';
import { appUserRepository } from '@repositories/appUser.repository';
import { openFGAService } from './openfga.service';
import { AppError } from '@utils/errors';

export type ForumCategoryWithStats = ForumCategoryRecord & {
  threadCount: number;
  lastActivity: Date | null;
};

export type ForumThreadWithDetails = ForumThreadRecord & {
  authorName?: string;
  postCount: number;
  lastActivity: Date | null;
  upvotes: number;
  downvotes: number;
  tags: string[];
};

export type ForumPostWithDetails = ForumPostRecord & {
  authorName?: string;
  upvotes: number;
  downvotes: number;
  isBestAnswer: boolean;
};

export class ForumService {
  // ===== AUTHORIZATION HELPERS =====

  /**
   * Ensure user is a member of the community
   */
  private async ensureMemberOrAdmin(communityId: string, userId: string): Promise<void> {
    const role = await communityMemberRepository.getUserRole(communityId, userId);
    if (!role || (role !== 'admin' && role !== 'member')) {
      throw new AppError('Forbidden: only community members can access the forum', 403);
    }
  }

  private async getCommunityIdFromCategory(categoryId: string): Promise<string> {
    const category = await forumRepository.findCategoryById(categoryId);
    if (!category) throw new AppError('Category not found', 404);
    return category.communityId;
  }

  private async getCommunityIdFromThread(threadId: string): Promise<string> {
    const thread = await forumRepository.findThreadById(threadId);
    if (!thread) throw new AppError('Thread not found', 404);
    return await this.getCommunityIdFromCategory(thread.categoryId);
  }

  private async getCommunityIdFromPost(postId: string): Promise<string> {
    const post = await forumRepository.findPostById(postId);
    if (!post) throw new AppError('Post not found', 404);
    return await this.getCommunityIdFromThread(post.threadId);
  }

  // ===== CATEGORIES =====

  async createCategory(data: CreateCategoryDto, userId: string): Promise<ForumCategoryRecord> {
    // Check if user has forum management permission
    const canManage = await openFGAService.checkAccess(
      userId,
      'community',
      data.communityId,
      'can_manage_forum'
    );
    if (!canManage) {
      throw new AppError('Forbidden: only admins or forum managers can create categories', 403);
    }

    const category = await forumRepository.createCategory(data);

    // Create OpenFGA relationship
    try {
      await openFGAService.createRelationship(
        'forum_category',
        category.id,
        'parent_community',
        'community',
        data.communityId
      );
    } catch (error) {
      console.error('Failed to create category->community relationship in OpenFGA:', error);
    }

    return category;
  }

  async listCategories(communityId: string, userId: string): Promise<ForumCategoryWithStats[]> {
    // Ensure user is a member
    await this.ensureMemberOrAdmin(communityId, userId);

    const categories = await forumRepository.findCategoriesByCommunity(communityId);

    // Enrich with stats
    const categoriesWithStats = await Promise.all(
      categories.map(async (category) => {
        const stats = await forumRepository.getCategoryStats(category.id);
        return {
          ...category,
          threadCount: stats.threadCount,
          lastActivity: stats.lastActivity,
        };
      })
    );

    return categoriesWithStats;
  }

  async getCategory(categoryId: string, userId: string): Promise<ForumCategoryWithStats> {
    const communityId = await this.getCommunityIdFromCategory(categoryId);
    await this.ensureMemberOrAdmin(communityId, userId);

    const category = await forumRepository.findCategoryById(categoryId);
    if (!category) throw new AppError('Category not found', 404);

    const stats = await forumRepository.getCategoryStats(categoryId);

    return {
      ...category,
      threadCount: stats.threadCount,
      lastActivity: stats.lastActivity,
    };
  }

  async updateCategory(
    categoryId: string,
    data: UpdateCategoryDto,
    userId: string
  ): Promise<ForumCategoryRecord> {
    const communityId = await this.getCommunityIdFromCategory(categoryId);

    const canManage = await openFGAService.checkAccess(
      userId,
      'community',
      communityId,
      'can_manage_forum'
    );
    if (!canManage) {
      throw new AppError('Forbidden: only admins or forum managers can update categories', 403);
    }

    const updated = await forumRepository.updateCategory(categoryId, data);
    if (!updated) throw new AppError('Category not found', 404);

    return updated;
  }

  async deleteCategory(categoryId: string, userId: string): Promise<void> {
    const communityId = await this.getCommunityIdFromCategory(categoryId);

    const canManage = await openFGAService.checkAccess(
      userId,
      'community',
      communityId,
      'can_manage_forum'
    );
    if (!canManage) {
      throw new AppError('Forbidden: only admins or forum managers can delete categories', 403);
    }

    const deleted = await forumRepository.deleteCategory(categoryId);
    if (!deleted) throw new AppError('Category not found', 404);
  }

  // ===== THREADS =====

  async createThread(data: CreateThreadDto, userId: string): Promise<ForumThreadWithDetails> {
    const communityId = await this.getCommunityIdFromCategory(data.categoryId);

    // Check if user can create threads
    const canCreate = await openFGAService.checkAccess(
      userId,
      'community',
      communityId,
      'can_create_thread'
    );
    if (!canCreate) {
      throw new AppError('Forbidden: insufficient permission to create threads', 403);
    }

    const thread = await forumRepository.createThread({
      ...data,
      authorId: userId,
    });

    // Create OpenFGA relationships
    try {
      await openFGAService.createRelationship(
        'forum_thread',
        thread.id,
        'parent_community',
        'community',
        communityId
      );
      await openFGAService.createRelationship('forum_thread', thread.id, 'author', 'user', userId);
    } catch (error) {
      console.error('Failed to create thread relationships in OpenFGA:', error);
    }

    const stats = await forumRepository.getThreadStats(thread.id);
    const tags = await forumRepository.getThreadTags(thread.id);

    return {
      ...thread,
      authorName: await this.getUserDisplayName(userId),
      postCount: stats.postCount,
      lastActivity: stats.lastActivity,
      upvotes: stats.upvotes,
      downvotes: stats.downvotes,
      tags,
    };
  }

  async listThreads(
    categoryId: string,
    userId: string,
    options: {
      page?: number;
      limit?: number;
      sort?: 'newest' | 'popular' | 'mostUpvoted';
    } = {}
  ): Promise<{
    threads: ForumThreadWithDetails[];
    total: number;
    page: number;
    limit: number;
  }> {
    const communityId = await this.getCommunityIdFromCategory(categoryId);
    await this.ensureMemberOrAdmin(communityId, userId);

    const page = Math.max(1, options.page ?? 1);
    const limit = Math.max(1, Math.min(options.limit ?? 20, 100));
    const offset = (page - 1) * limit;

    const { threads, total } = await forumRepository.findThreadsByCategory(categoryId, {
      limit,
      offset,
      sort: options.sort,
    });

    // Enrich with details
    const threadsWithDetails = await Promise.all(
      threads.map(async (thread) => {
        const stats = await forumRepository.getThreadStats(thread.id);
        const tags = await forumRepository.getThreadTags(thread.id);
        const authorName = await this.getUserDisplayName(thread.authorId);

        return {
          ...thread,
          authorName,
          postCount: stats.postCount,
          lastActivity: stats.lastActivity,
          upvotes: stats.upvotes,
          downvotes: stats.downvotes,
          tags,
        };
      })
    );

    return {
      threads: threadsWithDetails,
      total,
      page,
      limit,
    };
  }

  async getThread(
    threadId: string,
    userId: string
  ): Promise<{
    thread: ForumThreadWithDetails;
    posts: ForumPostWithDetails[];
  }> {
    const communityId = await this.getCommunityIdFromThread(threadId);
    await this.ensureMemberOrAdmin(communityId, userId);

    const thread = await forumRepository.findThreadById(threadId);
    if (!thread) throw new AppError('Thread not found', 404);

    const stats = await forumRepository.getThreadStats(threadId);
    const tags = await forumRepository.getThreadTags(threadId);
    const authorName = await this.getUserDisplayName(thread.authorId);

    const posts = await forumRepository.findPostsByThread(threadId);

    // Enrich posts with details
    const postsWithDetails = await Promise.all(
      posts.map(async (post) => {
        const voteCounts = await forumRepository.getVoteCounts(undefined, post.id);
        const postAuthorName = await this.getUserDisplayName(post.authorId);

        return {
          ...post,
          authorName: postAuthorName,
          upvotes: voteCounts.upvotes,
          downvotes: voteCounts.downvotes,
          isBestAnswer: thread.bestAnswerPostId === post.id,
        };
      })
    );

    return {
      thread: {
        ...thread,
        authorName,
        postCount: stats.postCount,
        lastActivity: stats.lastActivity,
        upvotes: stats.upvotes,
        downvotes: stats.downvotes,
        tags,
      },
      posts: postsWithDetails,
    };
  }

  async updateThread(
    threadId: string,
    data: UpdateThreadDto,
    userId: string
  ): Promise<ForumThreadRecord> {
    const communityId = await this.getCommunityIdFromThread(threadId);
    const thread = await forumRepository.findThreadById(threadId);
    if (!thread) throw new AppError('Thread not found', 404);

    // Check if user is author or has forum management permission
    const isAuthor = thread.authorId === userId;
    const canManage = await openFGAService.checkAccess(
      userId,
      'community',
      communityId,
      'can_manage_forum'
    );

    if (!isAuthor && !canManage) {
      throw new AppError(
        'Forbidden: only the thread author or forum managers can edit this thread',
        403
      );
    }

    // Only forum managers can update isPinned, isLocked
    if ((data.isPinned !== undefined || data.isLocked !== undefined) && !canManage) {
      throw new AppError('Forbidden: only forum managers can pin/lock threads', 403);
    }

    // Only thread author can set best answer
    if (data.bestAnswerPostId !== undefined && !isAuthor) {
      throw new AppError('Forbidden: only the thread author can mark best answer', 403);
    }

    const updated = await forumRepository.updateThread(threadId, data);
    if (!updated) throw new AppError('Thread not found', 404);

    return updated;
  }

  async deleteThread(threadId: string, userId: string): Promise<void> {
    const communityId = await this.getCommunityIdFromThread(threadId);
    const thread = await forumRepository.findThreadById(threadId);
    if (!thread) throw new AppError('Thread not found', 404);

    // Check if user is author or has forum management permission
    const isAuthor = thread.authorId === userId;
    const canManage = await openFGAService.checkAccess(
      userId,
      'community',
      communityId,
      'can_manage_forum'
    );

    if (!isAuthor && !canManage) {
      throw new AppError(
        'Forbidden: only the thread author or forum managers can delete this thread',
        403
      );
    }

    await forumRepository.deleteThread(threadId);
  }

  async pinThread(threadId: string, isPinned: boolean, userId: string): Promise<ForumThreadRecord> {
    return await this.updateThread(threadId, { isPinned }, userId);
  }

  async lockThread(
    threadId: string,
    isLocked: boolean,
    userId: string
  ): Promise<ForumThreadRecord> {
    return await this.updateThread(threadId, { isLocked }, userId);
  }

  async setBestAnswer(
    threadId: string,
    postId: string,
    userId: string
  ): Promise<ForumThreadRecord> {
    return await this.updateThread(threadId, { bestAnswerPostId: postId }, userId);
  }

  // ===== POSTS =====

  async createPost(data: CreatePostDto, userId: string): Promise<ForumPostWithDetails> {
    const communityId = await this.getCommunityIdFromThread(data.threadId);
    await this.ensureMemberOrAdmin(communityId, userId);

    // Check if thread is locked
    const thread = await forumRepository.findThreadById(data.threadId);
    if (!thread) throw new AppError('Thread not found', 404);
    if (thread.isLocked) {
      throw new AppError('Cannot post in locked thread', 400);
    }

    const post = await forumRepository.createPost({
      ...data,
      authorId: userId,
    });

    // Create OpenFGA relationships
    try {
      await openFGAService.createRelationship(
        'forum_post',
        post.id,
        'parent_community',
        'community',
        communityId
      );
      await openFGAService.createRelationship('forum_post', post.id, 'author', 'user', userId);
      await openFGAService.createRelationship(
        'forum_post',
        post.id,
        'parent_thread',
        'forum_thread',
        data.threadId
      );
    } catch (error) {
      console.error('Failed to create post relationships in OpenFGA:', error);
    }

    const voteCounts = await forumRepository.getVoteCounts(undefined, post.id);
    const authorName = await this.getUserDisplayName(userId);

    return {
      ...post,
      authorName,
      upvotes: voteCounts.upvotes,
      downvotes: voteCounts.downvotes,
      isBestAnswer: false,
    };
  }

  async updatePost(postId: string, data: UpdatePostDto, userId: string): Promise<ForumPostRecord> {
    const communityId = await this.getCommunityIdFromPost(postId);
    const post = await forumRepository.findPostById(postId);
    if (!post) throw new AppError('Post not found', 404);

    // Check if user is author or has forum management permission
    const isAuthor = post.authorId === userId;
    const canManage = await openFGAService.checkAccess(
      userId,
      'community',
      communityId,
      'can_manage_forum'
    );

    if (!isAuthor && !canManage) {
      throw new AppError(
        'Forbidden: only the post author or forum managers can edit this post',
        403
      );
    }

    const updated = await forumRepository.updatePost(postId, data);
    if (!updated) throw new AppError('Post not found', 404);

    return updated;
  }

  async deletePost(postId: string, userId: string): Promise<void> {
    const communityId = await this.getCommunityIdFromPost(postId);
    const post = await forumRepository.findPostById(postId);
    if (!post) throw new AppError('Post not found', 404);

    // Check if user is author or has forum management permission
    const isAuthor = post.authorId === userId;
    const canManage = await openFGAService.checkAccess(
      userId,
      'community',
      communityId,
      'can_manage_forum'
    );

    if (!isAuthor && !canManage) {
      throw new AppError(
        'Forbidden: only the post author or forum managers can delete this post',
        403
      );
    }

    await forumRepository.deletePost(postId);
  }

  // ===== VOTES =====

  async voteOnThread(
    threadId: string,
    voteType: 'up' | 'down' | 'remove',
    userId: string
  ): Promise<{ upvotes: number; downvotes: number }> {
    const communityId = await this.getCommunityIdFromThread(threadId);
    await this.ensureMemberOrAdmin(communityId, userId);

    if (voteType === 'remove') {
      await forumRepository.removeVote(userId, threadId);
    } else {
      await forumRepository.createOrUpdateVote({
        userId,
        threadId,
        postId: null,
        voteType,
      });
    }

    return await forumRepository.getVoteCounts(threadId);
  }

  async voteOnPost(
    postId: string,
    voteType: 'up' | 'down' | 'remove',
    userId: string
  ): Promise<{ upvotes: number; downvotes: number }> {
    const communityId = await this.getCommunityIdFromPost(postId);
    await this.ensureMemberOrAdmin(communityId, userId);

    if (voteType === 'remove') {
      await forumRepository.removeVote(userId, undefined, postId);
    } else {
      await forumRepository.createOrUpdateVote({
        userId,
        threadId: null,
        postId,
        voteType,
      });
    }

    return await forumRepository.getVoteCounts(undefined, postId);
  }

  // ===== HELPERS =====

  private async getUserDisplayName(userId: string): Promise<string | undefined> {
    const user = await appUserRepository.findById(userId);
    if (!user) return undefined;
    return user.displayName ?? user.username ?? undefined;
  }
}

export const forumService = new ForumService();
