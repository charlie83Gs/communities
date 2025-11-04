import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { appUsers } from './app_users.schema';
import { wealth } from './wealth.schema';

export const wealthComments = pgTable('wealth_comments', {
  id: uuid('id').defaultRandom().primaryKey(),
  wealthId: uuid('wealth_id')
    .notNull()
    .references(() => wealth.id, { onDelete: 'cascade' }),
  authorId: text('author_id')
    .notNull()
    .references(() => appUsers.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const wealthCommentsRelations = relations(wealthComments, ({ one, many }) => ({
  wealth: one(wealth, {
    fields: [wealthComments.wealthId],
    references: [wealth.id],
  }),
  author: one(appUsers, {
    fields: [wealthComments.authorId],
    references: [appUsers.id],
  }),
}));
