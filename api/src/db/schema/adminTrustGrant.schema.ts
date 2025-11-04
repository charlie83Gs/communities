import { pgTable, uuid, text, integer, timestamp, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { communities } from './communities.schema';
import { appUsers } from './app_users.schema';

export const adminTrustGrants = pgTable(
  'admin_trust_grants',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    communityId: uuid('community_id')
      .references(() => communities.id)
      .notNull(),
    adminUserId: text('admin_user_id')
      .references(() => appUsers.id)
      .notNull(),
    toUserId: text('to_user_id')
      .references(() => appUsers.id)
      .notNull(),
    trustAmount: integer('trust_amount').notNull().default(0),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    // Unique constraint: only one admin grant per user per community
    uqCommunityToUser: unique('admin_trust_grants_community_to_user_unique').on(
      table.communityId,
      table.toUserId
    ),
  })
);

export const adminTrustGrantsRelations = relations(adminTrustGrants, ({ one }) => ({
  community: one(communities, {
    fields: [adminTrustGrants.communityId],
    references: [communities.id],
  }),
  adminUser: one(appUsers, {
    fields: [adminTrustGrants.adminUserId],
    references: [appUsers.id],
  }),
  toUser: one(appUsers, {
    fields: [adminTrustGrants.toUserId],
    references: [appUsers.id],
  }),
}));
