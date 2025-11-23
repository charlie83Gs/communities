import { pgTable, uuid, varchar, text, boolean, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { appUsers } from './app_users.schema';
import { communities } from './communities.schema';

/**
 * Notification types for different activity categories
 */
export const notificationTypeEnum = pgEnum('notification_type', [
  'wealth_request_message',    // New message in wealth request thread
  'wealth_request_status',     // Request status changed
  'wealth_request_new',        // New request for your wealth
  'pool_activity',             // Pool distributions, contributions
  'council_activity',          // Council updates
  'dispute_update',            // Dispute status changes
  'trust_change',              // Trust awarded/removed
  'poll_activity',             // Poll created, results available
]);

/**
 * notifications
 * - tracks activity that requires user attention
 * - supports in-app indicators and notification feed
 */
export const notifications = pgTable('notifications', {
  id: uuid('id').defaultRandom().primaryKey(),

  userId: text('user_id').references(() => appUsers.id, { onDelete: 'cascade' }).notNull(),
  communityId: uuid('community_id').references(() => communities.id, { onDelete: 'cascade' }).notNull(),

  type: notificationTypeEnum('type').notNull(),
  title: varchar('title', { length: 200 }).notNull(),
  message: text('message'), // Optional detailed message

  // Resource reference for navigation
  resourceType: varchar('resource_type', { length: 50 }).notNull(), // 'wealth_request', 'wealth', 'pool', etc.
  resourceId: uuid('resource_id').notNull(),

  // Who triggered this notification (optional)
  actorId: text('actor_id').references(() => appUsers.id),

  isRead: boolean('is_read').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  readAt: timestamp('read_at'),
});

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(appUsers, {
    fields: [notifications.userId],
    references: [appUsers.id],
  }),
  community: one(communities, {
    fields: [notifications.communityId],
    references: [communities.id],
  }),
  actor: one(appUsers, {
    fields: [notifications.actorId],
    references: [appUsers.id],
  }),
}));
