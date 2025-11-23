import { pgTable, uuid, varchar, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { communities } from './communities.schema';
import { councils } from './councils.schema';
import { items } from './items.schema';
import { appUsers } from './app_users.schema';

/**
 * Pools - Resource aggregation endpoints managed by councils
 * Pools serve as logistics hubs where producers contribute resources
 * and councils distribute to consumers, simplifying many-to-many sharing
 */
export const pools = pgTable('pools', {
  id: uuid('id').defaultRandom().primaryKey(),
  communityId: uuid('community_id')
    .references(() => communities.id, { onDelete: 'cascade' })
    .notNull(),
  councilId: uuid('council_id')
    .references(() => councils.id, { onDelete: 'cascade' })
    .notNull(),

  name: varchar('name', { length: 200 }).notNull(),
  description: text('description').notNull(),

  // Distribution settings
  maxUnitsPerUser: integer('max_units_per_user'),

  // Contribution settings
  minimumContribution: integer('minimum_contribution'),

  createdBy: text('created_by')
    .references(() => appUsers.id)
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});

/**
 * Pool Inventory - Current resources held by pools
 * Tracks available units per item in each pool
 */
export const poolInventory = pgTable('pool_inventory', {
  id: uuid('id').defaultRandom().primaryKey(),
  poolId: uuid('pool_id')
    .references(() => pools.id, { onDelete: 'cascade' })
    .notNull(),
  itemId: uuid('item_id')
    .references(() => items.id, { onDelete: 'cascade' })
    .notNull(),
  unitsAvailable: integer('units_available').notNull().default(0),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

/**
 * Pool Allowed Items - Junction table for pool item whitelist
 * Defines which items can be contributed to or distributed from a pool
 * If a pool has no entries here, any item is allowed
 */
export const poolAllowedItems = pgTable('pool_allowed_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  poolId: uuid('pool_id')
    .references(() => pools.id, { onDelete: 'cascade' })
    .notNull(),
  itemId: uuid('item_id')
    .references(() => items.id, { onDelete: 'cascade' })
    .notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

/**
 * Relations
 */
export const poolsRelations = relations(pools, ({ one, many }) => ({
  community: one(communities, {
    fields: [pools.communityId],
    references: [communities.id],
  }),
  council: one(councils, {
    fields: [pools.councilId],
    references: [councils.id],
  }),
  creator: one(appUsers, {
    fields: [pools.createdBy],
    references: [appUsers.id],
  }),
  inventory: many(poolInventory),
  allowedItems: many(poolAllowedItems),
}));

export const poolInventoryRelations = relations(poolInventory, ({ one }) => ({
  pool: one(pools, {
    fields: [poolInventory.poolId],
    references: [pools.id],
  }),
  item: one(items, {
    fields: [poolInventory.itemId],
    references: [items.id],
  }),
}));

export const poolAllowedItemsRelations = relations(poolAllowedItems, ({ one }) => ({
  pool: one(pools, {
    fields: [poolAllowedItems.poolId],
    references: [pools.id],
  }),
  item: one(items, {
    fields: [poolAllowedItems.itemId],
    references: [items.id],
  }),
}));
