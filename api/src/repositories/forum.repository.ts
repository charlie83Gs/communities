import { db } from '@db/index';
import {
  forumCategories,
  forumThreads,
  forumPosts,
  forumVotes,
  forumThreadTags,
} from '@db/schema';
import { eq, and, desc, sql, inArray } from 'drizzle-orm';

export type ForumCategoryRecord = typeof forumCategories.$inferSelect;
export type ForumThreadRecord = typeof forumThreads.$inferSelect;
export type ForumPostRecord = typeof forumPosts.$inferSelect;
export type ForumVoteRecord = typeof forumVotes.$inferSelect;
export type ForumThreadTagRecord = typeof forumThreadTags.$inferSelect;

export type CreateCategoryDto = {
  communityId: string;
  name: string;
  description?: string | null;
  displayOrder?: number;
};

export type UpdateCategoryDto = Partial<Pick<CreateCategoryDto, 'name' | 'description' | 'displayOrder'>>;

export type CreateThreadDto = {
  categoryId: string;
  title: string;
  content: string;
  authorId: string;
  tags?: string[];
};

export type UpdateThreadDto = Partial<Pick<CreateThreadDto, 'title' | 'content'>> & {
  isPinned?: boolean;
  isLocked?: boolean;
  bestAnswerPostId?: string | null;
};

export type CreatePostDto = {
  threadId: string;
  content: string;
  authorId: string;
};

export type UpdatePostDto = Partial<Pick<CreatePostDto, 'content'>>;

export type CreateVoteDto = {
  userId: string;
  threadId?: string | null;
  postId?: string | null;
  voteType: 'up' | 'down';
};

export class ForumRepository {
  // ===== CATEGORIES =====

  async createCategory(data: CreateCategoryDto): Promise<ForumCategoryRecord> {
    const [category] = await db
      .insert(forumCategories)
      .values({
        communityId: data.communityId,
        name: data.name,
        description: data.description ?? null,
        displayOrder: data.displayOrder ?? 0,
      })
      .returning();
    return category;
  }

  async findCategoryById(id: string): Promise<ForumCategoryRecord | undefined> {
    const [category] = await db
      .select()
      .from(forumCategories)
      .where(eq(forumCategories.id, id));
    return category;
  }

  async findCategoriesByCommunity(communityId: string): Promise<ForumCategoryRecord[]> {
    return await db
      .select()
      .from(forumCategories)
      .where(eq(forumCategories.communityId, communityId))
      .orderBy(forumCategories.displayOrder, forumCategories.name);
  }

  async updateCategory(id: string, data: UpdateCategoryDto): Promise<ForumCategoryRecord | undefined> {
    const [updated] = await db
      .update(forumCategories)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(forumCategories.id, id))
      .returning();
    return updated;
  }

  async deleteCategory(id: string): Promise<ForumCategoryRecord | undefined> {
    const [deleted] = await db
      .delete(forumCategories)
      .where(eq(forumCategories.id, id))
      .returning();
    return deleted;
  }

  // ===== THREADS =====

  async createThread(data: CreateThreadDto): Promise<ForumThreadRecord> {
    const [thread] = await db
      .insert(forumThreads)
      .values({
        categoryId: data.categoryId,
        title: data.title,
        content: data.content,
        authorId: data.authorId,
      })
      .returning();

    // Add tags if provided
    if (data.tags && data.tags.length > 0) {
      await db.insert(forumThreadTags).values(
        data.tags.map((tag) => ({
          threadId: thread.id,
          tag,
        }))
      );
    }

    return thread;
  }

  async findThreadById(id: string): Promise<ForumThreadRecord | undefined> {
    const [thread] = await db
      .select()
      .from(forumThreads)
      .where(eq(forumThreads.id, id));
    return thread;
  }

  async findThreadsByCategory(
    categoryId: string,
    options: {
      limit?: number;
      offset?: number;
      sort?: 'newest' | 'popular' | 'mostUpvoted';
    } = {}
  ): Promise<{ threads: ForumThreadRecord[]; total: number }> {
    const { limit = 20, offset = 0, sort = 'newest' } = options;

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(forumThreads)
      .where(eq(forumThreads.categoryId, categoryId));

    // Build query based on sort option
    let query = db
      .select({
        thread: forumThreads,
        postCount: sql<number>`(SELECT COUNT(*)::int FROM ${forumPosts} WHERE ${forumPosts.threadId} = ${forumThreads.id})`.as('post_count'),
        upvotes: sql<number>`(SELECT COUNT(*)::int FROM ${forumVotes} WHERE ${forumVotes.threadId} = ${forumThreads.id} AND ${forumVotes.voteType} = 'up')`.as('upvotes'),
      })
      .from(forumThreads)
      .where(eq(forumThreads.categoryId, categoryId))
      .limit(limit)
      .offset(offset);

    // Apply sorting
    if (sort === 'newest') {
      query = query.orderBy(desc(forumThreads.createdAt)) as any;
    } else if (sort === 'popular') {
      query = query.orderBy(sql`post_count DESC, ${forumThreads.createdAt} DESC`) as any;
    } else if (sort === 'mostUpvoted') {
      query = query.orderBy(sql`upvotes DESC, ${forumThreads.createdAt} DESC`) as any;
    }

    const results = await query;
    const threads = results.map((r) => r.thread);

    return { threads, total: count };
  }

  async updateThread(id: string, data: UpdateThreadDto): Promise<ForumThreadRecord | undefined> {
    const [updated] = await db
      .update(forumThreads)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(forumThreads.id, id))
      .returning();
    return updated;
  }

  async deleteThread(id: string): Promise<ForumThreadRecord | undefined> {
    const [deleted] = await db
      .delete(forumThreads)
      .where(eq(forumThreads.id, id))
      .returning();
    return deleted;
  }

  async getThreadTags(threadId: string): Promise<string[]> {
    const tags = await db
      .select()
      .from(forumThreadTags)
      .where(eq(forumThreadTags.threadId, threadId));
    return tags.map((t) => t.tag);
  }

  // ===== POSTS =====

  async createPost(data: CreatePostDto): Promise<ForumPostRecord> {
    const [post] = await db
      .insert(forumPosts)
      .values({
        threadId: data.threadId,
        content: data.content,
        authorId: data.authorId,
      })
      .returning();
    return post;
  }

  async findPostById(id: string): Promise<ForumPostRecord | undefined> {
    const [post] = await db
      .select()
      .from(forumPosts)
      .where(eq(forumPosts.id, id));
    return post;
  }

  async findPostsByThread(
    threadId: string,
    options: { limit?: number; offset?: number } = {}
  ): Promise<ForumPostRecord[]> {
    const { limit = 50, offset = 0 } = options;

    return await db
      .select()
      .from(forumPosts)
      .where(eq(forumPosts.threadId, threadId))
      .orderBy(forumPosts.createdAt)
      .limit(limit)
      .offset(offset);
  }

  async updatePost(id: string, data: UpdatePostDto): Promise<ForumPostRecord | undefined> {
    const [updated] = await db
      .update(forumPosts)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(forumPosts.id, id))
      .returning();
    return updated;
  }

  async deletePost(id: string): Promise<ForumPostRecord | undefined> {
    const [deleted] = await db
      .delete(forumPosts)
      .where(eq(forumPosts.id, id))
      .returning();
    return deleted;
  }

  // ===== VOTES =====

  async createOrUpdateVote(data: CreateVoteDto): Promise<ForumVoteRecord> {
    // Check if vote already exists
    const conditions = [];
    conditions.push(eq(forumVotes.userId, data.userId));

    if (data.threadId) {
      conditions.push(eq(forumVotes.threadId, data.threadId));
      conditions.push(sql`${forumVotes.postId} IS NULL`);
    } else if (data.postId) {
      conditions.push(eq(forumVotes.postId, data.postId));
      conditions.push(sql`${forumVotes.threadId} IS NULL`);
    }

    const [existingVote] = await db
      .select()
      .from(forumVotes)
      .where(and(...conditions));

    if (existingVote) {
      // Update existing vote
      const [updated] = await db
        .update(forumVotes)
        .set({ voteType: data.voteType })
        .where(eq(forumVotes.id, existingVote.id))
        .returning();
      return updated;
    } else {
      // Create new vote
      const [vote] = await db
        .insert(forumVotes)
        .values({
          userId: data.userId,
          threadId: data.threadId ?? null,
          postId: data.postId ?? null,
          voteType: data.voteType,
        })
        .returning();
      return vote;
    }
  }

  async removeVote(userId: string, threadId?: string, postId?: string): Promise<void> {
    const conditions = [eq(forumVotes.userId, userId)];

    if (threadId) {
      conditions.push(eq(forumVotes.threadId, threadId));
    } else if (postId) {
      conditions.push(eq(forumVotes.postId, postId));
    }

    await db.delete(forumVotes).where(and(...conditions));
  }

  async getVoteCounts(threadId?: string, postId?: string): Promise<{ upvotes: number; downvotes: number }> {
    const conditions = [];

    if (threadId) {
      conditions.push(eq(forumVotes.threadId, threadId));
    } else if (postId) {
      conditions.push(eq(forumVotes.postId, postId));
    }

    const [result] = await db
      .select({
        upvotes: sql<number>`COUNT(*) FILTER (WHERE ${forumVotes.voteType} = 'up')::int`,
        downvotes: sql<number>`COUNT(*) FILTER (WHERE ${forumVotes.voteType} = 'down')::int`,
      })
      .from(forumVotes)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return result || { upvotes: 0, downvotes: 0 };
  }

  async getUserVote(
    userId: string,
    threadId?: string,
    postId?: string
  ): Promise<ForumVoteRecord | undefined> {
    const conditions = [eq(forumVotes.userId, userId)];

    if (threadId) {
      conditions.push(eq(forumVotes.threadId, threadId));
    } else if (postId) {
      conditions.push(eq(forumVotes.postId, postId));
    }

    const [vote] = await db
      .select()
      .from(forumVotes)
      .where(and(...conditions));

    return vote;
  }

  // ===== STATS & AGGREGATIONS =====

  async getCategoryStats(categoryId: string): Promise<{ threadCount: number; lastActivity: Date | null }> {
    const [result] = await db
      .select({
        threadCount: sql<number>`COUNT(*)::int`,
        lastActivity: sql<Date | null>`MAX(${forumThreads.updatedAt})`,
      })
      .from(forumThreads)
      .where(eq(forumThreads.categoryId, categoryId));

    return result || { threadCount: 0, lastActivity: null };
  }

  async getThreadStats(threadId: string): Promise<{
    postCount: number;
    lastActivity: Date | null;
    upvotes: number;
    downvotes: number;
  }> {
    const [postStats] = await db
      .select({
        postCount: sql<number>`COUNT(*)::int`,
        lastActivity: sql<Date | null>`MAX(${forumPosts.createdAt})`,
      })
      .from(forumPosts)
      .where(eq(forumPosts.threadId, threadId));

    const voteCounts = await this.getVoteCounts(threadId);

    return {
      postCount: postStats?.postCount || 0,
      lastActivity: postStats?.lastActivity || null,
      upvotes: voteCounts.upvotes,
      downvotes: voteCounts.downvotes,
    };
  }
}

export const forumRepository = new ForumRepository();
