import { pgTable, uuid, text, timestamp, index, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { communities } from './communities.schema';
import { appUsers } from './app_users.schema';

export const trustAwards = pgTable(
  'trust_awards',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    communityId: uuid('community_id')
      .references(() => communities.id)
      .notNull(),
    fromUserId: text('from_user_id')
      .references(() => appUsers.id)
      .notNull(),
    toUserId: text('to_user_id')
      .references(() => appUsers.id)
      .notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    // Unique constraint: each user can award trust to another user only once per community
    uqCommunityFromTo: unique('trust_awards_community_from_to_unique').on(
      table.communityId,
      table.fromUserId,
      table.toUserId
    ),
    // Index for finding awards TO a user in a community
    idxCommunityTo: index('trust_awards_community_to_idx').on(
      table.communityId,
      table.toUserId
    ),
    // Index for finding awards FROM a user in a community
    idxCommunityFrom: index('trust_awards_community_from_idx').on(
      table.communityId,
      table.fromUserId
    ),
  })
);

export const trustAwardsRelations = relations(trustAwards, ({ one }) => ({
  community: one(communities, {
    fields: [trustAwards.communityId],
    references: [communities.id],
  }),
  fromUser: one(appUsers, {
    fields: [trustAwards.fromUserId],
    references: [appUsers.id],
  }),
  toUser: one(appUsers, {
    fields: [trustAwards.toUserId],
    references: [appUsers.id],
  }),
}));
