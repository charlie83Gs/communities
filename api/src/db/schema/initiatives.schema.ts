import { pgTable, uuid, text, pgEnum, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { councils } from './councils.schema';
import { communities } from './communities.schema';
import { appUsers } from './app_users.schema';

/**
 * Initiative status enum
 */
export const initiativeStatusEnum = pgEnum('initiative_status', ['active', 'completed', 'cancelled']);

/**
 * Vote type enum
 */
export const voteTypeEnum = pgEnum('vote_type', ['upvote', 'downvote']);

/**
 * Initiatives - Council proposals for community action
 * - Created by council managers
 * - Support rich text content (markdown)
 * - Members can upvote/downvote
 * - Support comments
 */
export const initiatives = pgTable('initiatives', {
  id: uuid('id').defaultRandom().primaryKey(),

  councilId: uuid('council_id').references(() => councils.id, { onDelete: 'cascade' }).notNull(),
  communityId: uuid('community_id').references(() => communities.id, { onDelete: 'cascade' }).notNull(),

  title: text('title').notNull(),
  description: text('description').notNull(), // Rich markdown content

  createdBy: text('created_by').references(() => appUsers.id, { onDelete: 'set null' }),
  status: initiativeStatusEnum('status').default('active').notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const initiativesRelations = relations(initiatives, ({ one, many }) => ({
  council: one(councils, {
    fields: [initiatives.councilId],
    references: [councils.id],
  }),
  community: one(communities, {
    fields: [initiatives.communityId],
    references: [communities.id],
  }),
  creator: one(appUsers, {
    fields: [initiatives.createdBy],
    references: [appUsers.id],
  }),
  reports: many(initiativeReports),
  votes: many(initiativeVotes),
  comments: many(initiativeComments),
}));

/**
 * Initiative Reports - Council progress reports on initiatives
 * - Created by council managers
 * - Support rich text content (markdown)
 * - Support comments
 */
export const initiativeReports = pgTable('initiative_reports', {
  id: uuid('id').defaultRandom().primaryKey(),

  initiativeId: uuid('initiative_id').references(() => initiatives.id, { onDelete: 'cascade' }).notNull(),

  title: text('title').notNull(),
  content: text('content').notNull(), // Rich markdown content

  createdBy: text('created_by').references(() => appUsers.id, { onDelete: 'set null' }),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const initiativeReportsRelations = relations(initiativeReports, ({ one, many }) => ({
  initiative: one(initiatives, {
    fields: [initiativeReports.initiativeId],
    references: [initiatives.id],
  }),
  creator: one(appUsers, {
    fields: [initiativeReports.createdBy],
    references: [appUsers.id],
  }),
  comments: many(initiativeReportComments),
}));

/**
 * Initiative Votes - Member upvotes/downvotes on initiatives
 * - One vote per user per initiative
 * - Users can change their vote
 */
export const initiativeVotes = pgTable('initiative_votes', {
  id: uuid('id').defaultRandom().primaryKey(),

  initiativeId: uuid('initiative_id').references(() => initiatives.id, { onDelete: 'cascade' }).notNull(),
  userId: text('user_id').references(() => appUsers.id, { onDelete: 'cascade' }).notNull(),

  voteType: voteTypeEnum('vote_type').notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const initiativeVotesRelations = relations(initiativeVotes, ({ one }) => ({
  initiative: one(initiatives, {
    fields: [initiativeVotes.initiativeId],
    references: [initiatives.id],
  }),
  user: one(appUsers, {
    fields: [initiativeVotes.userId],
    references: [appUsers.id],
  }),
}));

/**
 * Initiative Comments - Member comments on initiatives
 */
export const initiativeComments = pgTable('initiative_comments', {
  id: uuid('id').defaultRandom().primaryKey(),

  initiativeId: uuid('initiative_id').references(() => initiatives.id, { onDelete: 'cascade' }).notNull(),
  authorId: text('author_id').references(() => appUsers.id, { onDelete: 'cascade' }).notNull(),

  content: text('content').notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const initiativeCommentsRelations = relations(initiativeComments, ({ one }) => ({
  initiative: one(initiatives, {
    fields: [initiativeComments.initiativeId],
    references: [initiatives.id],
  }),
  author: one(appUsers, {
    fields: [initiativeComments.authorId],
    references: [appUsers.id],
  }),
}));

/**
 * Initiative Report Comments - Member comments on initiative reports
 */
export const initiativeReportComments = pgTable('initiative_report_comments', {
  id: uuid('id').defaultRandom().primaryKey(),

  reportId: uuid('report_id').references(() => initiativeReports.id, { onDelete: 'cascade' }).notNull(),
  authorId: text('author_id').references(() => appUsers.id, { onDelete: 'cascade' }).notNull(),

  content: text('content').notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const initiativeReportCommentsRelations = relations(initiativeReportComments, ({ one }) => ({
  report: one(initiativeReports, {
    fields: [initiativeReportComments.reportId],
    references: [initiativeReports.id],
  }),
  author: one(appUsers, {
    fields: [initiativeReportComments.authorId],
    references: [appUsers.id],
  }),
}));
