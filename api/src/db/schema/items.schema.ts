import { pgTable, uuid, varchar, text, pgEnum, boolean, timestamp, numeric } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { appUsers } from './app_users.schema';
import { communities } from './communities.schema';
import { wealth } from './wealth.schema';

/**
 * Item Kind Enum
 * Defines whether an item is a physical object or a service
 */
export const itemKindEnum = pgEnum('item_kind', ['object', 'service']);

/**
 * Items Table
 *
 * Standardized resource/service names used across the community.
 * When users share wealth, they select an Item (e.g., "Carrots", "Car Repair Service").
 * This allows aggregation like "10 users shared Carrots = total carrots available."
 *
 * Authorization:
 * - Creating/editing/deleting items requires `can_manage_items` permission
 * - Viewing items requires community membership
 * - Default items (isDefault: true) cannot be deleted
 *
 * Features:
 * - Soft delete support (deletedAt)
 * - Unique constraint on (communityId, name) - case insensitive
 * - Referenced by wealth items (foreign key)
 * - wealth_value: Numeric value for aggregate community wealth statistics
 */
export const items = pgTable('items', {
  id: uuid('id').defaultRandom().primaryKey(),

  communityId: uuid('community_id')
    .references(() => communities.id, { onDelete: 'cascade' })
    .notNull(),

  name: varchar('name', { length: 200 }).notNull(),
  description: text('description'),

  kind: itemKindEnum('kind').notNull(),

  // Value for aggregate wealth statistics
  wealthValue: numeric('wealth_value', { precision: 10, scale: 2 }).notNull().default('1.0'),

  // Default items (like "Other") cannot be deleted
  isDefault: boolean('is_default').default(false).notNull(),

  createdBy: text('created_by')
    .references(() => appUsers.id)
    .notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),

  // Soft delete support
  deletedAt: timestamp('deleted_at'),
});

/**
 * Items Relations
 */
export const itemsRelations = relations(items, ({ one, many }) => ({
  community: one(communities, {
    fields: [items.communityId],
    references: [communities.id],
  }),
  creator: one(appUsers, {
    fields: [items.createdBy],
    references: [appUsers.id],
  }),
  wealthEntries: many(wealth),
}));

/**
 * Type exports for TypeScript
 */
export type Item = typeof items.$inferSelect;
export type NewItem = typeof items.$inferInsert;
