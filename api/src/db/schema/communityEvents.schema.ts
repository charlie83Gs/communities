import { pgTable, uuid, text, pgEnum, jsonb, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { appUsers } from './app_users.schema';
import { communities } from './communities.schema';

/**
 * Event Type Enum
 * Defines the type of action that occurred
 */
export const communityEventTypeEnum = pgEnum('community_event_type', [
  // Needs events
  'need_created',
  'need_updated',
  'need_fulfilled',
  'need_deleted',
  // Wealth events
  'wealth_created',
  'wealth_updated',
  'wealth_fulfilled',
  'wealth_deleted',
  // Poll events
  'poll_created',
  'poll_completed',
  'poll_deleted',
  // Forum events
  'forum_thread_created',
  'forum_post_created',
  'forum_thread_deleted',
  'forum_post_deleted',
  // Council events
  'council_created',
  'council_updated',
  'council_deleted',
  // Trust events
  'trust_awarded',
  'trust_removed',
]);

/**
 * Entity Type Enum
 * Defines what kind of entity was acted upon
 */
export const communityEntityTypeEnum = pgEnum('community_entity_type', [
  'need',
  'wealth',
  'poll',
  'forum_thread',
  'forum_post',
  'council',
  'trust_award',
]);

/**
 * Community Events Table
 *
 * Tracks all significant activities within a community for:
 * - Activity feeds
 * - Analytics
 * - Audit trails
 * - User notifications
 *
 * Authorization:
 * - Viewing events requires community membership
 * - Events are read-only (never updated, only created)
 *
 * Features:
 * - Links to user who performed action
 * - Links to entity that was acted upon
 * - Stores relevant metadata in JSONB
 * - Automatically timestamped
 */
export const communityEvents = pgTable('community_events', {
  id: uuid('id').defaultRandom().primaryKey(),

  // Which community this event belongs to
  communityId: uuid('community_id')
    .references(() => communities.id)
    .notNull(),

  // Who performed the action
  userId: text('user_id')
    .references(() => appUsers.id)
    .notNull(),

  // What type of action was performed
  eventType: communityEventTypeEnum('event_type').notNull(),

  // What kind of entity was acted upon
  entityType: communityEntityTypeEnum('entity_type').notNull(),

  // ID of the entity that was acted upon
  entityId: uuid('entity_id').notNull(),

  // Additional context-specific data
  // Examples:
  // - For need_created: { itemName, itemKind, priority, unitsNeeded, isRecurring }
  // - For wealth_created: { itemName, itemKind, unitsAvailable }
  // - For poll_created: { pollTitle, pollType }
  metadata: jsonb('metadata').$type<Record<string, any>>(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
});

/**
 * Community Events Relations
 */
export const communityEventsRelations = relations(communityEvents, ({ one }) => ({
  user: one(appUsers, {
    fields: [communityEvents.userId],
    references: [appUsers.id],
  }),
  community: one(communities, {
    fields: [communityEvents.communityId],
    references: [communities.id],
  }),
}));

/**
 * Type exports for TypeScript
 */
export type CommunityEvent = typeof communityEvents.$inferSelect;
export type NewCommunityEvent = typeof communityEvents.$inferInsert;
