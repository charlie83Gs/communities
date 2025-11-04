import { pgTable, uuid, varchar, text, pgEnum, timestamp, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { appUsers } from './app_users.schema';
import { communities } from './communities.schema';

/**
 * Poll status enum
 */
export const pollStatusEnum = pgEnum('poll_status', ['active', 'closed']);

/**
 * Poll creator type enum
 */
export const pollCreatorTypeEnum = pgEnum('poll_creator_type', ['user', 'council', 'pool']);

/**
 * polls table
 * - Tracks community polls for voting
 * - Can be created by users, councils, or pools
 * - Authorization checked via OpenFGA (poll_creator role or trust threshold)
 */
export const polls = pgTable('polls', {
  id: uuid('id').defaultRandom().primaryKey(),

  communityId: uuid('community_id').references(() => communities.id).notNull(),

  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),

  // Creator information
  creatorType: pollCreatorTypeEnum('creator_type').notNull(),
  creatorId: uuid('creator_id'), // council ID or pool ID (null for user-created polls)
  createdBy: text('created_by').references(() => appUsers.id).notNull(), // actual user who created it

  status: pollStatusEnum('status').default('active').notNull(),

  endsAt: timestamp('ends_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const pollsRelations = relations(polls, ({ one, many }) => ({
  community: one(communities, {
    fields: [polls.communityId],
    references: [communities.id],
  }),
  creator: one(appUsers, {
    fields: [polls.createdBy],
    references: [appUsers.id],
  }),
  options: many(pollOptions),
  votes: many(pollVotes),
}));

/**
 * poll_options table
 * - Options for a poll
 * - Display order determines the order shown to users
 */
export const pollOptions = pgTable('poll_options', {
  id: uuid('id').defaultRandom().primaryKey(),

  pollId: uuid('poll_id').references(() => polls.id, { onDelete: 'cascade' }).notNull(),

  optionText: varchar('option_text', { length: 200 }).notNull(),
  displayOrder: integer('display_order').notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const pollOptionsRelations = relations(pollOptions, ({ one, many }) => ({
  poll: one(polls, {
    fields: [pollOptions.pollId],
    references: [polls.id],
  }),
  votes: many(pollVotes),
}));

/**
 * poll_votes table
 * - Tracks user votes on poll options
 * - One vote per user per poll (enforced at service layer)
 */
export const pollVotes = pgTable('poll_votes', {
  id: uuid('id').defaultRandom().primaryKey(),

  pollId: uuid('poll_id').references(() => polls.id, { onDelete: 'cascade' }).notNull(),
  optionId: uuid('option_id').references(() => pollOptions.id, { onDelete: 'cascade' }).notNull(),
  userId: text('user_id').references(() => appUsers.id).notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const pollVotesRelations = relations(pollVotes, ({ one }) => ({
  poll: one(polls, {
    fields: [pollVotes.pollId],
    references: [polls.id],
  }),
  option: one(pollOptions, {
    fields: [pollVotes.optionId],
    references: [pollOptions.id],
  }),
  user: one(appUsers, {
    fields: [pollVotes.userId],
    references: [appUsers.id],
  }),
}));
