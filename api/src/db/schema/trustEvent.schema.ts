import { pgTable, uuid, text, timestamp, varchar, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { communities } from './communities.schema';
import { appUsers } from './app_users.schema';

export const trustEvents = pgTable('trust_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  communityId: uuid('community_id').references(() => communities.id).notNull(),
  // A compact type string to allow future event kinds (e.g., 'share_redeemed', 'manual_adjustment')
  type: varchar('type', { length: 64 }).notNull(),
  // Optional relation for events tied to a domain entity (e.g., share id)
  entityType: varchar('entity_type', { length: 64 }),
  entityId: uuid('entity_id'),
  actorUserId: text('actor_user_id').references(() => appUsers.id), // user who triggered the event
  subjectUserIdA: text('subject_user_id_a').references(() => appUsers.id), // participant A
  subjectUserIdB: text('subject_user_id_b').references(() => appUsers.id), // participant B (optional depending on event)
  // How many points the event applies per subject; positive or negative
  pointsDeltaA: integer('points_delta_a').default(0).notNull(),
  pointsDeltaB: integer('points_delta_b').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (table) => {
  return {
    idxCommunity: { columns: [table.communityId] },
    idxCommunityType: { columns: [table.communityId, table.type] },
    idxCommunitySubjectA: { columns: [table.communityId, table.subjectUserIdA] },
    idxCommunitySubjectB: { columns: [table.communityId, table.subjectUserIdB] },
  };
});

export const trustEventsRelations = relations(trustEvents, ({ one }) => ({
  community: one(communities, {
    fields: [trustEvents.communityId],
    references: [communities.id],
  }),
}));
