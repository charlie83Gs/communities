import { pgTable, uuid, varchar, text, timestamp, integer, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { appUsers } from './app_users.schema';
import { communities } from './communities.schema';

/**
 * Forum Categories
 * Top-level organizational units for threads
 */
export const forumCategories = pgTable('forum_categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  communityId: uuid('community_id').references(() => communities.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  displayOrder: integer('display_order').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const forumCategoriesRelations = relations(forumCategories, ({ one, many }) => ({
  community: one(communities, {
    fields: [forumCategories.communityId],
    references: [communities.id],
  }),
  threads: many(forumThreads),
}));

/**
 * Forum Threads
 * Discussion topics within categories
 */
export const forumThreads = pgTable('forum_threads', {
  id: uuid('id').defaultRandom().primaryKey(),
  categoryId: uuid('category_id').references(() => forumCategories.id, { onDelete: 'cascade' }).notNull(),
  title: varchar('title', { length: 200 }).notNull(),
  content: text('content').notNull(),
  authorId: text('author_id').references(() => appUsers.id, { onDelete: 'cascade' }).notNull(),
  isPinned: boolean('is_pinned').default(false).notNull(),
  isLocked: boolean('is_locked').default(false).notNull(),
  isPinnedToHomepage: boolean('is_pinned_to_homepage').default(false).notNull(),
  homepagePinPriority: integer('homepage_pin_priority').default(0).notNull(),
  bestAnswerPostId: uuid('best_answer_post_id'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const forumThreadsRelations = relations(forumThreads, ({ one, many }) => ({
  category: one(forumCategories, {
    fields: [forumThreads.categoryId],
    references: [forumCategories.id],
  }),
  author: one(appUsers, {
    fields: [forumThreads.authorId],
    references: [appUsers.id],
  }),
  posts: many(forumPosts),
  votes: many(forumVotes),
  tags: many(forumThreadTags),
}));

/**
 * Forum Posts
 * Individual messages within threads (replies)
 */
export const forumPosts = pgTable('forum_posts', {
  id: uuid('id').defaultRandom().primaryKey(),
  threadId: uuid('thread_id').references(() => forumThreads.id, { onDelete: 'cascade' }).notNull(),
  content: text('content').notNull(),
  authorId: text('author_id').references(() => appUsers.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const forumPostsRelations = relations(forumPosts, ({ one, many }) => ({
  thread: one(forumThreads, {
    fields: [forumPosts.threadId],
    references: [forumThreads.id],
  }),
  author: one(appUsers, {
    fields: [forumPosts.authorId],
    references: [appUsers.id],
  }),
  votes: many(forumVotes),
}));

/**
 * Forum Votes
 * Upvotes and downvotes on threads and posts
 */
export const forumVotes = pgTable('forum_votes', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').references(() => appUsers.id, { onDelete: 'cascade' }).notNull(),
  threadId: uuid('thread_id').references(() => forumThreads.id, { onDelete: 'cascade' }),
  postId: uuid('post_id').references(() => forumPosts.id, { onDelete: 'cascade' }),
  voteType: varchar('vote_type', { length: 10 }).notNull(), // 'up' or 'down'
  createdAt: timestamp('created_at').defaultNow(),
});

export const forumVotesRelations = relations(forumVotes, ({ one }) => ({
  user: one(appUsers, {
    fields: [forumVotes.userId],
    references: [appUsers.id],
  }),
  thread: one(forumThreads, {
    fields: [forumVotes.threadId],
    references: [forumThreads.id],
  }),
  post: one(forumPosts, {
    fields: [forumVotes.postId],
    references: [forumPosts.id],
  }),
}));

/**
 * Forum Thread Tags
 * Optional labels for threads (Question, Announcement, Resolved, etc.)
 */
export const forumThreadTags = pgTable('forum_thread_tags', {
  id: uuid('id').defaultRandom().primaryKey(),
  threadId: uuid('thread_id').references(() => forumThreads.id, { onDelete: 'cascade' }).notNull(),
  tag: varchar('tag', { length: 50 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const forumThreadTagsRelations = relations(forumThreadTags, ({ one }) => ({
  thread: one(forumThreads, {
    fields: [forumThreadTags.threadId],
    references: [forumThreads.id],
  }),
}));
