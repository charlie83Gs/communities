import { pgTable, uuid, varchar, text, timestamp, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { communities } from './communities.schema';
import { appUsers } from './app_users.schema';
import { items } from './items.schema';

/**
 * Councils - Community actors focused on specific domains
 */
export const councils = pgTable('councils', {
  id: uuid('id').defaultRandom().primaryKey(),
  communityId: uuid('community_id').references(() => communities.id).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description').notNull(),
  createdBy: text('created_by').references(() => appUsers.id).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

export const councilsRelations = relations(councils, ({ one, many }) => ({
  community: one(communities, {
    fields: [councils.communityId],
    references: [communities.id],
  }),
  creator: one(appUsers, {
    fields: [councils.createdBy],
    references: [appUsers.id],
  }),
  managers: many(councilManagers),
  trustAwards: many(councilTrustAwards),
  inventory: many(councilInventory),
  transactions: many(councilTransactions),
}));

/**
 * Council Managers - Users who can manage specific councils
 */
export const councilManagers = pgTable('council_managers', {
  id: uuid('id').defaultRandom().primaryKey(),
  councilId: uuid('council_id').references(() => councils.id).notNull(),
  userId: text('user_id').references(() => appUsers.id).notNull(),
  addedAt: timestamp('added_at').defaultNow(),
});

export const councilManagersRelations = relations(councilManagers, ({ one }) => ({
  council: one(councils, {
    fields: [councilManagers.councilId],
    references: [councils.id],
  }),
  user: one(appUsers, {
    fields: [councilManagers.userId],
    references: [appUsers.id],
  }),
}));

/**
 * Council Trust Scores - Trust level each council has from community members
 */
export const councilTrustScores = pgTable('council_trust_scores', {
  id: uuid('id').defaultRandom().primaryKey(),
  councilId: uuid('council_id').references(() => councils.id).notNull().unique(),
  trustScore: integer('trust_score').notNull().default(0),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const councilTrustScoresRelations = relations(councilTrustScores, ({ one }) => ({
  council: one(councils, {
    fields: [councilTrustScores.councilId],
    references: [councils.id],
  }),
}));

/**
 * Council Trust Awards - Members awarding trust to councils
 */
export const councilTrustAwards = pgTable('council_trust_awards', {
  id: uuid('id').defaultRandom().primaryKey(),
  councilId: uuid('council_id').references(() => councils.id).notNull(),
  userId: text('user_id').references(() => appUsers.id).notNull(),
  awardedAt: timestamp('awarded_at').defaultNow(),
  removedAt: timestamp('removed_at'),
});

export const councilTrustAwardsRelations = relations(councilTrustAwards, ({ one }) => ({
  council: one(councils, {
    fields: [councilTrustAwards.councilId],
    references: [councils.id],
  }),
  user: one(appUsers, {
    fields: [councilTrustAwards.userId],
    references: [appUsers.id],
  }),
}));

/**
 * Council Trust History - Audit log of all council trust changes
 */
export const councilTrustHistory = pgTable('council_trust_history', {
  id: uuid('id').defaultRandom().primaryKey(),
  councilId: uuid('council_id').references(() => councils.id).notNull(),
  userId: text('user_id').references(() => appUsers.id).notNull(),
  action: varchar('action', { length: 20 }).notNull(), // 'awarded' | 'removed'
  timestamp: timestamp('timestamp').defaultNow(),
});

export const councilTrustHistoryRelations = relations(councilTrustHistory, ({ one }) => ({
  council: one(councils, {
    fields: [councilTrustHistory.councilId],
    references: [councils.id],
  }),
  user: one(appUsers, {
    fields: [councilTrustHistory.userId],
    references: [appUsers.id],
  }),
}));

/**
 * Council Inventory - Current resources held by councils
 */
export const councilInventory = pgTable('council_inventory', {
  id: uuid('id').defaultRandom().primaryKey(),
  councilId: uuid('council_id').references(() => councils.id).notNull(),
  itemId: uuid('item_id').references(() => items.id).notNull(),
  quantity: integer('quantity').notNull().default(0),
  unit: varchar('unit', { length: 50 }),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const councilInventoryRelations = relations(councilInventory, ({ one }) => ({
  council: one(councils, {
    fields: [councilInventory.councilId],
    references: [councils.id],
  }),
  item: one(items, {
    fields: [councilInventory.itemId],
    references: [items.id],
  }),
}));

/**
 * Council Transactions - Auditable record of council resource movements
 */
export const councilTransactions = pgTable('council_transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  councilId: uuid('council_id').references(() => councils.id).notNull(),
  type: varchar('type', { length: 20 }).notNull(), // 'received' | 'used' | 'transferred'
  itemId: uuid('item_id').references(() => items.id).notNull(),
  quantity: integer('quantity').notNull(),
  description: text('description').notNull(),
  relatedUserId: text('related_user_id').references(() => appUsers.id),
  relatedPoolId: uuid('related_pool_id'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const councilTransactionsRelations = relations(councilTransactions, ({ one }) => ({
  council: one(councils, {
    fields: [councilTransactions.councilId],
    references: [councils.id],
  }),
  item: one(items, {
    fields: [councilTransactions.itemId],
    references: [items.id],
  }),
  relatedUser: one(appUsers, {
    fields: [councilTransactions.relatedUserId],
    references: [appUsers.id],
  }),
}));
