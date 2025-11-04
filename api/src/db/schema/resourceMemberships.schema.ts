import { pgTable, uuid, varchar, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { appUsers } from './app_users.schema';

export const resourceMemberships = pgTable('resource_memberships', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id').notNull().references(() => appUsers.id, { onDelete: 'cascade' }),
  resourceType: varchar('resource_type', { length: 50 }).notNull(), // e.g., 'communities', 'global'
  resourceId: uuid('resource_id').notNull(),
  // REMOVED: role column - roles are now stored in OpenFGA only
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userResourceUnique: uniqueIndex('resource_memberships_user_resource_unique').on(
    table.userId,
    table.resourceType,
    table.resourceId
  ),
}));

export const resourceMembershipsRelations = relations(resourceMemberships, ({ one }) => ({
  user: one(appUsers, {
    fields: [resourceMemberships.userId],
    references: [appUsers.id],
  }),
}));