import { pgTable, uuid, varchar, text, decimal, boolean, integer, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { pools } from './pools.schema';
import { wealth } from './wealth.schema';
import { items } from './items.schema';
import { appUsers } from './app_users.schema';

/**
 * Pool Checkout Links - Permanent QR code links for pool distributions
 * Enables frictionless self-checkout from pools (e.g., farmer's markets)
 */
export const poolCheckoutLinks = pgTable('pool_checkout_links', {
  id: uuid('id').defaultRandom().primaryKey(),
  poolId: uuid('pool_id')
    .references(() => pools.id, { onDelete: 'cascade' })
    .notNull(),
  itemId: uuid('item_id')
    .references(() => items.id, { onDelete: 'cascade' })
    .notNull(),

  // Link configuration
  linkCode: varchar('link_code', { length: 32 }).unique().notNull(),
  maxUnitsPerCheckout: decimal('max_units_per_checkout', { precision: 10, scale: 2 }),

  // Status
  isActive: boolean('is_active').default(true).notNull(),
  revokedAt: timestamp('revoked_at'),
  revokedBy: text('revoked_by').references(() => appUsers.id),
  revokeReason: text('revoke_reason'),

  // Metadata
  createdAt: timestamp('created_at').defaultNow().notNull(),
  createdBy: text('created_by')
    .references(() => appUsers.id)
    .notNull(),

  // Stats (denormalized for performance)
  totalCheckouts: integer('total_checkouts').default(0).notNull(),
  totalUnitsDistributed: decimal('total_units_distributed', { precision: 10, scale: 2 }).default('0').notNull(),
  lastCheckoutAt: timestamp('last_checkout_at'),
});

/**
 * Share Checkout Links - Temporary QR code links for wealth shares
 * Enables frictionless self-checkout from individual shares (e.g., event leftovers)
 */
export const shareCheckoutLinks = pgTable('share_checkout_links', {
  id: uuid('id').defaultRandom().primaryKey(),
  shareId: uuid('share_id')
    .references(() => wealth.id, { onDelete: 'cascade' })
    .unique()
    .notNull(),

  // Link configuration
  linkCode: varchar('link_code', { length: 32 }).unique().notNull(),
  maxUnitsPerCheckout: decimal('max_units_per_checkout', { precision: 10, scale: 2 }),

  // Auto-managed status
  isActive: boolean('is_active').default(true).notNull(),
  deactivatedAt: timestamp('deactivated_at'),
  deactivationReason: varchar('deactivation_reason', { length: 50 }),

  // Metadata
  createdAt: timestamp('created_at').defaultNow().notNull(),

  // Stats
  totalCheckouts: integer('total_checkouts').default(0).notNull(),
  totalUnitsDistributed: decimal('total_units_distributed', { precision: 10, scale: 2 }).default('0').notNull(),
  lastCheckoutAt: timestamp('last_checkout_at'),
});

/**
 * Relations
 */
export const poolCheckoutLinksRelations = relations(poolCheckoutLinks, ({ one }) => ({
  pool: one(pools, {
    fields: [poolCheckoutLinks.poolId],
    references: [pools.id],
  }),
  item: one(items, {
    fields: [poolCheckoutLinks.itemId],
    references: [items.id],
  }),
  creator: one(appUsers, {
    fields: [poolCheckoutLinks.createdBy],
    references: [appUsers.id],
  }),
  revoker: one(appUsers, {
    fields: [poolCheckoutLinks.revokedBy],
    references: [appUsers.id],
  }),
}));

export const shareCheckoutLinksRelations = relations(shareCheckoutLinks, ({ one }) => ({
  share: one(wealth, {
    fields: [shareCheckoutLinks.shareId],
    references: [wealth.id],
  }),
}));
