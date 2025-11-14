import { pgTable, uuid, varchar, text, timestamp, integer, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { appUsers } from './app_users.schema';

export const communities = pgTable('communities', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),

  // Trust System Configuration
  minTrustToAwardTrust: jsonb('min_trust_to_award_trust').notNull().default({ type: 'number', value: 15 }),
  minTrustToViewTrust: jsonb('min_trust_to_view_trust').notNull().default({ type: 'number', value: 0 }),
  trustTitles: jsonb('trust_titles').default({
    titles: [
      { name: 'New', minScore: 0 },
      { name: 'Stable', minScore: 10 },
      { name: 'Trusted', minScore: 50 }
    ]
  }),

  // Wealth Access Configuration
  minTrustForWealth: jsonb('min_trust_for_wealth').notNull().default({ type: 'number', value: 10 }),
  minTrustToViewWealth: jsonb('min_trust_to_view_wealth').notNull().default({ type: 'number', value: 0 }),

  // Item Management Configuration
  minTrustForItemManagement: jsonb('min_trust_for_item_management').notNull().default({ type: 'number', value: 20 }),
  minTrustToViewItems: jsonb('min_trust_to_view_items').notNull().default({ type: 'number', value: 0 }),

  // Dispute Handling Configuration
  minTrustForDisputeVisibility: jsonb('min_trust_for_dispute_visibility').notNull().default({ type: 'number', value: 20 }),
  minTrustForDisputeParticipation: jsonb('min_trust_for_dispute_participation').notNull().default({ type: 'number', value: 10 }),
  allowOpenResolutions: jsonb('allow_open_resolutions').default(true),
  requireMultipleMediators: jsonb('require_multiple_mediators').default(false),
  minMediatorsCount: integer('min_mediators_count').default(1),

  // Polling Permissions
  pollCreatorUsers: jsonb('poll_creator_users').default([]), // Array of user IDs
  minTrustForPolls: jsonb('min_trust_for_polls').default({ type: 'number', value: 15 }),
  minTrustToViewPolls: jsonb('min_trust_to_view_polls').default({ type: 'number', value: 0 }),

  // Pool Permissions
  minTrustForPoolCreation: jsonb('min_trust_for_pool_creation').default({ type: 'number', value: 20 }),
  minTrustToViewPools: jsonb('min_trust_to_view_pools').default({ type: 'number', value: 0 }),

  // Council Permissions
  minTrustForCouncilCreation: jsonb('min_trust_for_council_creation').default({ type: 'number', value: 25 }),
  minTrustToViewCouncils: jsonb('min_trust_to_view_councils').default({ type: 'number', value: 0 }),

  // Analytics Configuration
  nonContributionThresholdDays: integer('non_contribution_threshold_days').default(30),
  dashboardRefreshInterval: integer('dashboard_refresh_interval').default(3600), // in seconds
  metricVisibilitySettings: jsonb('metric_visibility_settings').default({
    showActiveMembers: true,
    showWealthGeneration: true,
    showTrustNetwork: true,
    showCouncilActivity: true,
    showNeedsFulfillment: true,
    showDisputeRate: true
  }),
  minTrustForHealthAnalytics: jsonb('min_trust_for_health_analytics').notNull().default({ type: 'number', value: 20 }),

  // Forum Configuration
  minTrustForThreadCreation: jsonb('min_trust_for_thread_creation').default({ type: 'number', value: 10 }),
  minTrustForAttachments: jsonb('min_trust_for_attachments').default({ type: 'number', value: 15 }),
  minTrustForFlagging: jsonb('min_trust_for_flagging').default({ type: 'number', value: 15 }),
  minTrustForFlagReview: jsonb('min_trust_for_flag_review').default({ type: 'number', value: 30 }),
  minTrustForForumModeration: jsonb('min_trust_for_forum_moderation').default({ type: 'number', value: 30 }),
  minTrustToViewForum: jsonb('min_trust_to_view_forum').default({ type: 'number', value: 0 }),

  // Needs System Configuration
  minTrustForNeeds: jsonb('min_trust_for_needs').default({ type: 'number', value: 5 }),
  minTrustToViewNeeds: jsonb('min_trust_to_view_needs').default({ type: 'number', value: 0 }),

  createdBy: text('created_by').references(() => appUsers.id),
  createdAt: timestamp('created_at').defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

export const communitiesRelations = relations(communities, ({ one, many }) => ({
  creator: one(appUsers, {
    fields: [communities.createdBy],
    references: [appUsers.id],
  }),
  members: many(communityMembers),
}));

// REMOVED: memberRoleEnum - roles are now stored in OpenFGA only

export const communityMembers = pgTable('community_members', {
  id: uuid('id').defaultRandom().primaryKey(),
  communityId: uuid('community_id').references(() => communities.id).notNull(),
  userId: text('user_id').references(() => appUsers.id).notNull(),
  // REMOVED: role column - roles are now stored in OpenFGA only
  joinedAt: timestamp('joined_at').defaultNow(),
});

export const communityMembersRelations = relations(communityMembers, ({ one }) => ({
  community: one(communities, {
    fields: [communityMembers.communityId],
    references: [communities.id],
  }),
  user: one(appUsers, {
    fields: [communityMembers.userId],
    references: [appUsers.id],
  }),
}));
