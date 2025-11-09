import { pgTable, uuid, varchar, text, pgEnum, integer, boolean, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { appUsers } from './app_users.schema';
import { communities } from './communities.schema';
import { councils } from './councils.schema';
import { items } from './items.schema';

/**
 * Need Priority Enum
 * Defines whether a need is essential or desired
 */
export const needPriorityEnum = pgEnum('need_priority', ['need', 'want']);

/**
 * Recurrence Frequency Enum
 * Defines how often a recurring need repeats
 */
export const needRecurrenceEnum = pgEnum('need_recurrence', ['daily', 'weekly', 'monthly']);

/**
 * Need Status Enum
 * Tracks the state of a need
 */
export const needStatusEnum = pgEnum('need_status', ['active', 'fulfilled', 'cancelled', 'expired']);

/**
 * Needs Table
 *
 * Tracks resource requirements published by community members.
 * Members express their needs to help with community resource planning.
 *
 * Authorization:
 * - Creating/editing/deleting needs requires `can_publish_needs` permission
 * - Viewing aggregated needs requires community membership
 * - Viewing individual member needs may have privacy controls
 *
 * Features:
 * - Links to standardized items (same as wealth system)
 * - Support for one-time and recurring needs
 * - Priority categorization (need vs want)
 * - Quantitative tracking (units needed)
 * - Soft delete support (deletedAt)
 */
export const needs = pgTable('needs', {
  id: uuid('id').defaultRandom().primaryKey(),

  createdBy: text('created_by').references(() => appUsers.id).notNull(),
  communityId: uuid('community_id').references(() => communities.id).notNull(),

  // Link to standardized item (e.g., "Carrots", "Mobility Assistance")
  itemId: uuid('item_id').references(() => items.id).notNull(),

  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),

  // Priority: is this essential or just desired?
  priority: needPriorityEnum('priority').notNull().default('need'),

  // Quantity needed
  unitsNeeded: integer('units_needed').notNull().default(1),

  // Recurrence configuration
  isRecurring: boolean('is_recurring').notNull().default(false),
  recurrence: needRecurrenceEnum('recurrence'), // required if isRecurring is true
  lastFulfilledAt: timestamp('last_fulfilled_at'),
  nextFulfillmentDate: timestamp('next_fulfillment_date'),

  // Status tracking
  status: needStatusEnum('status').default('active').notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),

  // Soft delete support
  deletedAt: timestamp('deleted_at'),
});

/**
 * Needs Relations
 */
export const needsRelations = relations(needs, ({ one }) => ({
  creator: one(appUsers, {
    fields: [needs.createdBy],
    references: [appUsers.id],
  }),
  community: one(communities, {
    fields: [needs.communityId],
    references: [communities.id],
  }),
  item: one(items, {
    fields: [needs.itemId],
    references: [items.id],
  }),
}));

/**
 * Council Needs Table
 *
 * Tracks resource requirements published by councils.
 * Councils can express needs on behalf of their domain or initiative.
 *
 * Authorization:
 * - Creating/editing/deleting council needs requires council manager permission
 * - Viewing council needs requires community membership
 *
 * Features:
 * - Same structure as member needs
 * - Attributed to a council rather than individual member
 * - Aggregated separately in community totals
 */
export const councilNeeds = pgTable('council_needs', {
  id: uuid('id').defaultRandom().primaryKey(),

  councilId: uuid('council_id').references(() => councils.id).notNull(),
  createdBy: text('created_by').references(() => appUsers.id).notNull(), // council manager who created
  communityId: uuid('community_id').references(() => communities.id).notNull(),

  // Link to standardized item
  itemId: uuid('item_id').references(() => items.id).notNull(),

  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),

  // Priority: is this essential or just desired?
  priority: needPriorityEnum('priority').notNull().default('need'),

  // Quantity needed
  unitsNeeded: integer('units_needed').notNull().default(1),

  // Recurrence configuration
  isRecurring: boolean('is_recurring').notNull().default(false),
  recurrence: needRecurrenceEnum('recurrence'), // required if isRecurring is true
  lastFulfilledAt: timestamp('last_fulfilled_at'),
  nextFulfillmentDate: timestamp('next_fulfillment_date'),

  // Status tracking
  status: needStatusEnum('status').default('active').notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),

  // Soft delete support
  deletedAt: timestamp('deleted_at'),
});

/**
 * Council Needs Relations
 */
export const councilNeedsRelations = relations(councilNeeds, ({ one }) => ({
  council: one(councils, {
    fields: [councilNeeds.councilId],
    references: [councils.id],
  }),
  creator: one(appUsers, {
    fields: [councilNeeds.createdBy],
    references: [appUsers.id],
  }),
  community: one(communities, {
    fields: [councilNeeds.communityId],
    references: [communities.id],
  }),
  item: one(items, {
    fields: [councilNeeds.itemId],
    references: [items.id],
  }),
}));

/**
 * Type exports for TypeScript
 */
export type Need = typeof needs.$inferSelect;
export type NewNeed = typeof needs.$inferInsert;
export type CouncilNeed = typeof councilNeeds.$inferSelect;
export type NewCouncilNeed = typeof councilNeeds.$inferInsert;
