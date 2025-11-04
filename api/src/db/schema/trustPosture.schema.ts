/**
 * DEPRECATED: This schema is no longer used by the application.
 *
 * The trust system has been migrated from a posture-based model to an award-based model.
 * This table is kept for historical data only and should not be used in new code.
 *
 * See trustAward.schema.ts and adminTrustGrant.schema.ts for the new trust system.
 * See trustHistory.schema.ts for trust event history.
 */

import { pgTable, uuid, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { communities } from './communities.schema';
import { appUsers } from './app_users.schema';

export const trustPostureEnum = pgEnum('trust_posture', ['trust', 'neutral', 'untrust']);

export const trustPostures = pgTable('trust_postures', {
  id: uuid('id').defaultRandom().primaryKey(),
  communityId: uuid('community_id').references(() => communities.id).notNull(),
  fromUserId: text('from_user_id').references(() => appUsers.id).notNull(),
  toUserId: text('to_user_id').references(() => appUsers.id).notNull(),
  posture: trustPostureEnum('posture').notNull().default('neutral'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    uqCommunityFromTo: {
      columns: [table.communityId, table.fromUserId, table.toUserId],
      unique: true,
    },
    idxCommunityTo: {
      columns: [table.communityId, table.toUserId],
    },
    idxCommunityFrom: {
      columns: [table.communityId, table.fromUserId],
    },
  };
});

export const trustPostureRelations = relations(trustPostures, ({ one }) => ({
  community: one(communities, {
    fields: [trustPostures.communityId],
    references: [communities.id],
  }),
  fromUser: one(appUsers, {
    fields: [trustPostures.fromUserId],
    references: [appUsers.id],
  }),
  toUser: one(appUsers, {
    fields: [trustPostures.toUserId],
    references: [appUsers.id],
  }),
}));