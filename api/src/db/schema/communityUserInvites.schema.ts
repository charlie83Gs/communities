import { pgTable, uuid, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { communities } from './communities.schema';
import { appUsers } from './app_users.schema';

export const inviteStatusEnum = pgEnum('invite_status', ['pending', 'redeemed', 'cancelled', 'expired']);

export const communityUserInvites = pgTable('community_user_invites', {
  id: uuid('id').defaultRandom().primaryKey(),

  // Target community
  communityId: uuid('community_id').references(() => communities.id).notNull(),

  // REMOVED: role column - roles are now stored in OpenFGA only
  // The role to grant is stored in OpenFGA as invite:id grants_X user:metadata tuple

  // Specific invited user
  invitedUserId: text('invited_user_id').references(() => appUsers.id).notNull(),

  // Lifecycle / audit
  status: inviteStatusEnum('status').default('pending').notNull(),
  createdBy: text('created_by').references(() => appUsers.id).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  redeemedBy: text('redeemed_by').references(() => appUsers.id),
  redeemedAt: timestamp('redeemed_at'),
  cancelledAt: timestamp('cancelled_at'),
});

export const communityUserInvitesRelations = relations(communityUserInvites, ({ one }) => ({
  community: one(communities, {
    fields: [communityUserInvites.communityId],
    references: [communities.id],
  }),
  invitedUser: one(appUsers, {
    fields: [communityUserInvites.invitedUserId],
    references: [appUsers.id],
  }),
  creator: one(appUsers, {
    fields: [communityUserInvites.createdBy],
    references: [appUsers.id],
  }),
  redeemer: one(appUsers, {
    fields: [communityUserInvites.redeemedBy],
    references: [appUsers.id],
  }),
}));
