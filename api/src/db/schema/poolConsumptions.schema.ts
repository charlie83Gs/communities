import { pgTable, uuid, text, integer, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { pools } from './pools.schema';
import { councils } from './councils.schema';
import { items } from './items.schema';
import { councilUsageReports } from './councilUsageReports.schema';
import { appUsers } from './app_users.schema';

/**
 * Pool Consumptions - Track when councils consume items from pools
 * Used for services (e.g., transportation) or materials (e.g., building supplies)
 * that are consumed directly by the council rather than distributed to members
 */
export const poolConsumptions = pgTable('pool_consumptions', {
  id: uuid('id').defaultRandom().primaryKey(),

  poolId: uuid('pool_id')
    .references(() => pools.id, { onDelete: 'cascade' })
    .notNull(),
  councilId: uuid('council_id')
    .references(() => councils.id, { onDelete: 'cascade' })
    .notNull(),
  itemId: uuid('item_id')
    .references(() => items.id, { onDelete: 'cascade' })
    .notNull(),

  units: integer('units').notNull(),
  description: text('description').notNull(),

  // Optional link to a usage report
  reportId: uuid('report_id').references(() => councilUsageReports.id, { onDelete: 'set null' }),

  consumedBy: text('consumed_by')
    .references(() => appUsers.id, { onDelete: 'set null' })
    .notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const poolConsumptionsRelations = relations(poolConsumptions, ({ one }) => ({
  pool: one(pools, {
    fields: [poolConsumptions.poolId],
    references: [pools.id],
  }),
  council: one(councils, {
    fields: [poolConsumptions.councilId],
    references: [councils.id],
  }),
  item: one(items, {
    fields: [poolConsumptions.itemId],
    references: [items.id],
  }),
  report: one(councilUsageReports, {
    fields: [poolConsumptions.reportId],
    references: [councilUsageReports.id],
  }),
  consumer: one(appUsers, {
    fields: [poolConsumptions.consumedBy],
    references: [appUsers.id],
  }),
}));
