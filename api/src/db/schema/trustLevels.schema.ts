import { pgTable, uuid, varchar, integer, timestamp, index, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { communities } from './communities.schema';

export const trustLevels = pgTable('trust_levels', {
  id: uuid('id').defaultRandom().primaryKey(),
  communityId: uuid('community_id').references(() => communities.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  threshold: integer('threshold').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
}, (table) => ({
  communityIdIdx: index('trust_levels_community_id_idx').on(table.communityId),
  thresholdIdx: index('trust_levels_threshold_idx').on(table.threshold),
  communityThresholdIdx: index('trust_levels_community_threshold_idx').on(table.communityId, table.threshold),
  // Unique constraints to ensure no duplicate names or thresholds per community
  communityNameUnique: unique('trust_levels_community_name_unique').on(table.communityId, table.name),
  communityThresholdUnique: unique('trust_levels_community_threshold_unique').on(table.communityId, table.threshold),
}));

export const trustLevelsRelations = relations(trustLevels, ({ one }) => ({
  community: one(communities, {
    fields: [trustLevels.communityId],
    references: [communities.id],
  }),
}));
