import { pgTable, uuid, varchar, text, timestamp, numeric, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { communities } from './communities.schema';
import { appUsers } from './app_users.schema';
import { items } from './items.schema';

// Verification status enum
export const verificationStatusEnum = pgEnum('verification_status', [
  'auto_verified',
  'pending',
  'verified',
  'disputed'
]);

// Source type enum
export const sourceTypeEnum = pgEnum('source_type', [
  'system_logged',
  'peer_grant',
  'self_reported'
]);

/**
 * Recognized Contributions
 *
 * Links to items table instead of separate categories table.
 * Uses items.wealthValue as the value per unit for contributions.
 *
 * Integration with items:
 * - itemId references items.id (the contribution category)
 * - valuePerUnit is snapshot from items.wealthValue at time of contribution
 * - Item name/translations used for display
 *
 * Authorization:
 * - Logging contributions requires can_log_contributions permission
 * - Verifying requires can_verify_contributions permission
 * - Viewing requires can_view_contributions permission
 */
export const recognizedContributions = pgTable('recognized_contributions', {
  id: uuid('id').defaultRandom().primaryKey(),
  communityId: uuid('community_id').references(() => communities.id, { onDelete: 'cascade' }).notNull(),
  contributorId: text('contributor_id').references(() => appUsers.id, { onDelete: 'cascade' }).notNull(),

  // Link to items table (which serves as contribution categories)
  itemId: uuid('item_id').references(() => items.id, { onDelete: 'cascade' }).notNull(),

  units: numeric('units').notNull(),
  valuePerUnit: numeric('value_per_unit').notNull(), // Snapshot from items.wealthValue at time of contribution
  totalValue: numeric('total_value').notNull(), // Calculated as units * valuePerUnit

  description: text('description').notNull(),

  // Verification
  verificationStatus: verificationStatusEnum('verification_status').default('pending').notNull(),
  verifiedBy: text('verified_by').references(() => appUsers.id),
  verifiedAt: timestamp('verified_at'),

  // Related parties (stored as text arrays of user IDs)
  beneficiaryIds: text('beneficiary_ids').array(),
  witnessIds: text('witness_ids').array(),

  testimonial: text('testimonial'),

  // Source tracking
  sourceType: sourceTypeEnum('source_type').notNull(),
  sourceId: uuid('source_id'), // Reference to wealth, initiative, council, etc.

  createdAt: timestamp('created_at').defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

export const recognizedContributionsRelations = relations(recognizedContributions, ({ one }) => ({
  community: one(communities, {
    fields: [recognizedContributions.communityId],
    references: [communities.id],
  }),
  contributor: one(appUsers, {
    fields: [recognizedContributions.contributorId],
    references: [appUsers.id],
  }),
  item: one(items, {
    fields: [recognizedContributions.itemId],
    references: [items.id],
  }),
  verifier: one(appUsers, {
    fields: [recognizedContributions.verifiedBy],
    references: [appUsers.id],
  }),
}));

// Contribution Summary (Aggregated per user)
export const contributionSummary = pgTable('contribution_summary', {
  id: uuid('id').defaultRandom().primaryKey(),
  communityId: uuid('community_id').references(() => communities.id, { onDelete: 'cascade' }).notNull(),
  userId: text('user_id').references(() => appUsers.id, { onDelete: 'cascade' }).notNull(),

  totalValue6Months: numeric('total_value_6months').default('0').notNull(),
  totalValueLifetime: numeric('total_value_lifetime').default('0').notNull(),

  // Category breakdowns stored as JSONB { "care_work": 180, "material_sharing": 90, ... }
  categoryBreakdown: text('category_breakdown'), // Will store JSON string

  lastContributionAt: timestamp('last_contribution_at'),
  lastCalculatedAt: timestamp('last_calculated_at').defaultNow(),
});

export const contributionSummaryRelations = relations(contributionSummary, ({ one }) => ({
  community: one(communities, {
    fields: [contributionSummary.communityId],
    references: [communities.id],
  }),
  user: one(appUsers, {
    fields: [contributionSummary.userId],
    references: [appUsers.id],
  }),
}));

// Peer Recognition Grants
export const peerRecognitionGrants = pgTable('peer_recognition_grants', {
  id: uuid('id').defaultRandom().primaryKey(),
  communityId: uuid('community_id').references(() => communities.id, { onDelete: 'cascade' }).notNull(),
  fromUserId: text('from_user_id').references(() => appUsers.id, { onDelete: 'cascade' }).notNull(),
  toUserId: text('to_user_id').references(() => appUsers.id, { onDelete: 'cascade' }).notNull(),

  valueUnits: numeric('value_units').notNull(),
  description: text('description').notNull(),

  createdAt: timestamp('created_at').defaultNow(),
  monthYear: varchar('month_year', { length: 7 }), // 'YYYY-MM' for monthly limit tracking
});

export const peerRecognitionGrantsRelations = relations(peerRecognitionGrants, ({ one }) => ({
  community: one(communities, {
    fields: [peerRecognitionGrants.communityId],
    references: [communities.id],
  }),
  fromUser: one(appUsers, {
    fields: [peerRecognitionGrants.fromUserId],
    references: [appUsers.id],
  }),
  toUser: one(appUsers, {
    fields: [peerRecognitionGrants.toUserId],
    references: [appUsers.id],
  }),
}));

/**
 * Value Calibration History
 *
 * Tracks changes to items.wealthValue over time for transparency and community decision-making.
 * When communities calibrate the value of contributions (e.g., increasing elder care from 10 to 15 units/hour),
 * this history preserves the reasoning and decision process.
 */
export const valueCalibrationHistory = pgTable('value_calibration_history', {
  id: uuid('id').defaultRandom().primaryKey(),
  communityId: uuid('community_id').references(() => communities.id, { onDelete: 'cascade' }).notNull(),
  itemId: uuid('item_id').references(() => items.id, { onDelete: 'cascade' }).notNull(),

  oldValuePerUnit: numeric('old_value_per_unit').notNull(),
  newValuePerUnit: numeric('new_value_per_unit').notNull(),

  reason: text('reason'),
  proposedBy: text('proposed_by').references(() => appUsers.id),
  decidedThrough: varchar('decided_through', { length: 50 }), // 'council', 'community_poll', 'consensus'
  decidedAt: timestamp('decided_at').defaultNow(),

  effectiveDate: timestamp('effective_date').notNull(),
});

export const valueCalibrationHistoryRelations = relations(valueCalibrationHistory, ({ one }) => ({
  community: one(communities, {
    fields: [valueCalibrationHistory.communityId],
    references: [communities.id],
  }),
  item: one(items, {
    fields: [valueCalibrationHistory.itemId],
    references: [items.id],
  }),
  proposer: one(appUsers, {
    fields: [valueCalibrationHistory.proposedBy],
    references: [appUsers.id],
  }),
}));

/**
 * Type exports for TypeScript
 */
export type RecognizedContribution = typeof recognizedContributions.$inferSelect;
export type NewRecognizedContribution = typeof recognizedContributions.$inferInsert;

export type ContributionSummary = typeof contributionSummary.$inferSelect;
export type NewContributionSummary = typeof contributionSummary.$inferInsert;

export type PeerRecognitionGrant = typeof peerRecognitionGrants.$inferSelect;
export type NewPeerRecognitionGrant = typeof peerRecognitionGrants.$inferInsert;

export type ValueCalibrationHistory = typeof valueCalibrationHistory.$inferSelect;
export type NewValueCalibrationHistory = typeof valueCalibrationHistory.$inferInsert;
