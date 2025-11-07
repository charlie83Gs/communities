import { pgTable, uuid, varchar, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { communities } from './communities.schema';
import { appUsers } from './app_users.schema';

export const inviteStatusEnum = pgEnum('invite_status', ['pending', 'redeemed', 'cancelled', 'expired']);

export const communityLinkInvites = pgTable('community_link_invites', {
  id: uuid('id').defaultRandom().primaryKey(),

  // Target community
  communityId: uuid('community_id').references(() => communities.id).notNull(),

  // REMOVED: role column - roles are now stored in OpenFGA only
  // The role to grant is stored in OpenFGA as invite:id grants_X user:metadata tuple

  // Link specifics
  title: varchar('title', { length: 128 }),
  secret: varchar('secret', { length: 128 }).notNull(),
  expiresAt: timestamp('expires_at'),

  // Lifecycle / audit
  status: inviteStatusEnum('status').default('pending').notNull(),
  createdBy: text('created_by').references(() => appUsers.id).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  redeemedBy: text('redeemed_by').references(() => appUsers.id),
  redeemedAt: timestamp('redeemed_at'),
  cancelledAt: timestamp('cancelled_at'),
});

export const communityLinkInvitesRelations = relations(communityLinkInvites, ({ one }) => ({
  community: one(communities, {
    fields: [communityLinkInvites.communityId],
    references: [communities.id],
  }),
  creator: one(appUsers, {
    fields: [communityLinkInvites.createdBy],
    references: [appUsers.id],
  }),
  redeemer: one(appUsers, {
    fields: [communityLinkInvites.redeemedBy],
    references: [appUsers.id],
  }),
}));
