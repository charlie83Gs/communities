import { pgTable, uuid, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { communities } from './communities.schema';
import { appUsers } from './app_users.schema';

export const trustViews = pgTable('trust_views', {
  id: uuid('id').defaultRandom().primaryKey(),
  communityId: uuid('community_id').references(() => communities.id).notNull(),
  userId: text('user_id').references(() => appUsers.id).notNull(),
  points: integer('points').notNull().default(0),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    uqCommunityUser: { columns: [table.communityId, table.userId], unique: true },
    idxCommunity: { columns: [table.communityId] },
    idxCommunityPoints: { columns: [table.communityId, table.points] },
  };
});

export const trustViewsRelations = relations(trustViews, ({ one }) => ({
  community: one(communities, {
    fields: [trustViews.communityId],
    references: [communities.id],
  }),
  user: one(appUsers, {
    fields: [trustViews.userId],
    references: [appUsers.id],
  }),
}));