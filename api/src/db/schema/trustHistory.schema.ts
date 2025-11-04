import { pgTable, uuid, text, integer, timestamp, pgEnum, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { communities } from './communities.schema';
import { appUsers } from './app_users.schema';

export const trustHistoryActionEnum = pgEnum('trust_history_action', [
  'award',
  'remove',
  'admin_grant',
]);

export const trustHistory = pgTable(
  'trust_history',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    communityId: uuid('community_id')
      .references(() => communities.id)
      .notNull(),
    fromUserId: text('from_user_id').references(() => appUsers.id),
    toUserId: text('to_user_id')
      .references(() => appUsers.id)
      .notNull(),
    action: trustHistoryActionEnum('action').notNull(),
    pointsDelta: integer('points_delta').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    // Index for querying history by community and user
    idxCommunityToUser: index('trust_history_community_to_user_idx').on(
      table.communityId,
      table.toUserId
    ),
    // Index for querying history by community and time
    idxCommunityCreatedAt: index('trust_history_community_created_at_idx').on(
      table.communityId,
      table.createdAt
    ),
  })
);

export const trustHistoryRelations = relations(trustHistory, ({ one }) => ({
  community: one(communities, {
    fields: [trustHistory.communityId],
    references: [communities.id],
  }),
  fromUser: one(appUsers, {
    fields: [trustHistory.fromUserId],
    references: [appUsers.id],
  }),
  toUser: one(appUsers, {
    fields: [trustHistory.toUserId],
    references: [appUsers.id],
  }),
}));
