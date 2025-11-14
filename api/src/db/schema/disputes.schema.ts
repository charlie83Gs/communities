import { pgTable, uuid, varchar, text, timestamp, pgEnum, boolean } from 'drizzle-orm/pg-core';
import { communities } from './communities.schema';
import { appUsers } from './app_users.schema';

// Enums for disputes
export const disputeStatusEnum = pgEnum('dispute_status', ['open', 'in_mediation', 'resolved', 'closed']);
export const disputeParticipantRoleEnum = pgEnum('dispute_participant_role', ['initiator', 'participant']);
export const disputeMediatorStatusEnum = pgEnum('dispute_mediator_status', ['proposed', 'accepted', 'rejected', 'withdrawn']);
export const disputeResolutionTypeEnum = pgEnum('dispute_resolution_type', ['open', 'closed']);

// Main disputes table
export const disputes = pgTable('disputes', {
  id: uuid('id').defaultRandom().primaryKey(),
  communityId: uuid('community_id').notNull()
    .references(() => communities.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description').notNull(),
  status: disputeStatusEnum('status').notNull().default('open'),
  createdBy: text('created_by').notNull()
    .references(() => appUsers.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  resolvedAt: timestamp('resolved_at'),
});

// Dispute participants
export const disputeParticipants = pgTable('dispute_participants', {
  id: uuid('id').defaultRandom().primaryKey(),
  disputeId: uuid('dispute_id').notNull()
    .references(() => disputes.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull()
    .references(() => appUsers.id, { onDelete: 'cascade' }),
  role: disputeParticipantRoleEnum('role').notNull(),
  addedAt: timestamp('added_at').defaultNow().notNull(),
  addedBy: text('added_by').notNull()
    .references(() => appUsers.id, { onDelete: 'cascade' }),
});

// Dispute mediators (proposals and acceptances)
export const disputeMediators = pgTable('dispute_mediators', {
  id: uuid('id').defaultRandom().primaryKey(),
  disputeId: uuid('dispute_id').notNull()
    .references(() => disputes.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull()
    .references(() => appUsers.id, { onDelete: 'cascade' }),
  status: disputeMediatorStatusEnum('status').notNull().default('proposed'),
  proposedAt: timestamp('proposed_at').defaultNow().notNull(),
  respondedAt: timestamp('responded_at'),
  respondedBy: text('responded_by')
    .references(() => appUsers.id, { onDelete: 'cascade' }),
});

// Dispute resolutions
export const disputeResolutions = pgTable('dispute_resolutions', {
  id: uuid('id').defaultRandom().primaryKey(),
  disputeId: uuid('dispute_id').notNull()
    .references(() => disputes.id, { onDelete: 'cascade' }),
  resolutionType: disputeResolutionTypeEnum('resolution_type').notNull(),
  resolution: text('resolution').notNull(),
  createdBy: text('created_by').notNull()
    .references(() => appUsers.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  isPublic: boolean('is_public').notNull().default(false),
});

// Dispute messages (communication between participants and mediators)
export const disputeMessages = pgTable('dispute_messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  disputeId: uuid('dispute_id').notNull()
    .references(() => disputes.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull()
    .references(() => appUsers.id, { onDelete: 'cascade' }),
  message: text('message').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  visibleToParticipants: boolean('visible_to_participants').notNull().default(true),
  visibleToMediators: boolean('visible_to_mediators').notNull().default(true),
});

// Dispute history (audit log)
export const disputeHistory = pgTable('dispute_history', {
  id: uuid('id').defaultRandom().primaryKey(),
  disputeId: uuid('dispute_id').notNull()
    .references(() => disputes.id, { onDelete: 'cascade' }),
  action: varchar('action', { length: 100 }).notNull(),
  performedBy: text('performed_by').notNull()
    .references(() => appUsers.id, { onDelete: 'cascade' }),
  performedAt: timestamp('performed_at').defaultNow().notNull(),
  metadata: text('metadata'), // JSON string for action-specific data
});
