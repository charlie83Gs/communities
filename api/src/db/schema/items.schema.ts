import { pgTable, uuid, text, pgEnum, boolean, timestamp, numeric, jsonb } from 'drizzle-orm/pg-core';
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
 * NOW ALSO USED FOR CONTRIBUTION TRACKING:
 * - Items serve dual purpose: wealth categories AND contribution categories
 * - wealthValue is used for BOTH wealth statistics AND contribution recognition
 * - contributionMetadata stores contribution-specific data
 *
 * Authorization:
 * - Creating/editing/deleting items requires `can_manage_items` permission
 * - Viewing items requires community membership
 * - Default items (isDefault: true) cannot be deleted
 *
 * Features:
 * - Soft delete support (deletedAt)
 * - Unique constraint on (communityId, name) - case insensitive
 * - Referenced by wealth items AND recognized_contributions (foreign keys)
 * - wealthValue: Numeric value for wealth statistics AND contribution value per unit
 */
export const items = pgTable('items', {
  id: uuid('id').defaultRandom().primaryKey(),

  communityId: uuid('community_id')
    .references(() => communities.id, { onDelete: 'cascade' })
    .notNull(),

  // Multi-language translations
  // Structure: { en: {name, description?}, es: {name, description?}, hi: {name, description?} }
  translations: jsonb('translations').notNull(),

  kind: itemKindEnum('kind').notNull(),

  // Value for aggregate wealth statistics AND contribution recognition
  // For wealth: monetary/barter value
  // For contributions: recognition value per unit (hours, sessions, items, etc.)
  wealthValue: numeric('wealth_value', { precision: 10, scale: 2 }).notNull().default('1.0'),

  // Contribution-specific metadata (optional, for contribution categories)
  // Structure: {
  //   categoryType: 'care' | 'community_building' | 'creative' | 'knowledge' | 'maintenance' | 'material' | 'invisible_labor',
  //   examples: ['Example activity 1', 'Example activity 2']
  // }
  contributionMetadata: jsonb('contribution_metadata'),

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
