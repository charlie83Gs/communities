import { pgTable, uuid, varchar, text, pgEnum, integer, boolean, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { appUsers } from './app_users.schema';
import { communities } from './communities.schema';
import { items } from './items.schema';

/**
 * Enums aligned with frontend/prompt.md Wealth System
 */
export const wealthTypeEnum = pgEnum('wealth_type', ['object', 'service']);
export const wealthDurationTypeEnum = pgEnum('wealth_duration_type', ['timebound', 'unlimited']);
export const wealthDistributionTypeEnum = pgEnum('wealth_distribution_type', ['request_based', 'unit_based']);
export const wealthStatusEnum = pgEnum('wealth_status', ['active', 'fulfilled', 'expired', 'cancelled']);

export const wealthRequestStatusEnum = pgEnum('wealth_request_status', [
  'pending',
  'accepted',
  'rejected',
  'cancelled',
  'fulfilled',
]);

/**
 * wealth
 * - owner is user who created the wealth (createdBy)
 * - authorization model (service-level):
 *   - only community admins/members of the target community can create/view/request
 *   - only owner (createdBy) can accept requests, mark fulfilled, update or cancel the wealth
 */
export const wealth = pgTable('wealth', {
  id: uuid('id').defaultRandom().primaryKey(),

  createdBy: text('created_by').references(() => appUsers.id).notNull(),
  communityId: uuid('community_id').references(() => communities.id).notNull(),

  // Link to standardized item (e.g., "Carrots", "Car Repair Service")
  itemId: uuid('item_id').references(() => items.id).notNull(),

  title: varchar('title', { length: 200 }).notNull(),
  description: text('description'),

  durationType: wealthDurationTypeEnum('duration_type').notNull(),
  endDate: timestamp('end_date'), // required only when durationType == timebound

  distributionType: wealthDistributionTypeEnum('distribution_type').notNull(),
  unitsAvailable: integer('units_available'),
  maxUnitsPerUser: integer('max_units_per_user'),

  automationEnabled: boolean('automation_enabled').default(false),

  status: wealthStatusEnum('status').default('active').notNull(),
  image: varchar('image', { length: 255 }),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const wealthRelations = relations(wealth, ({ one, many }) => ({
  owner: one(appUsers, {
    fields: [wealth.createdBy],
    references: [appUsers.id],
  }),
  community: one(communities, {
    fields: [wealth.communityId],
    references: [communities.id],
  }),
  item: one(items, {
    fields: [wealth.itemId],
    references: [items.id],
  }),
  requests: many(wealthRequests),
}));

/**
 * wealth_requests
 * - tracks requests from community members/admins to the owner
 * - unitsRequested is relevant for unit_based wealth; optional otherwise
 */
export const wealthRequests = pgTable('wealth_requests', {
  id: uuid('id').defaultRandom().primaryKey(),

  wealthId: uuid('wealth_id').references(() => wealth.id).notNull(),
  requesterId: text('requester_id').references(() => appUsers.id).notNull(),

  // Optional message to the owner
  message: text('message'),

  // For unit_based distribution
  unitsRequested: integer('units_requested'),

  status: wealthRequestStatusEnum('status').default('pending').notNull(),

  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const wealthRequestsRelations = relations(wealthRequests, ({ one }) => ({
  wealth: one(wealth, {
    fields: [wealthRequests.wealthId],
    references: [wealth.id],
  }),
  requester: one(appUsers, {
    fields: [wealthRequests.requesterId],
    references: [appUsers.id],
  }),
}));
