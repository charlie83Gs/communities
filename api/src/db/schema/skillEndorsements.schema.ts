import { pgTable, uuid, text, timestamp, index, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { userSkills } from './skills.schema';
import { appUsers } from './app_users.schema';
import { communities } from './communities.schema';

/**
 * Skill Endorsements Table
 *
 * Community-specific endorsements of user skills.
 * Endorsement counts are independent per community.
 *
 * Fields:
 * - id: UUID primary key
 * - skillId: Reference to user_skills
 * - endorserId: Reference to app_users (person giving endorsement)
 * - communityId: Community context for endorsement
 * - createdAt: When endorsement was given
 * - deletedAt: Soft delete support (toggle endorsements)
 *
 * Constraints:
 * - Unique (skillId, endorserId, communityId) - one endorsement per skill per person per community
 *
 * Indexes:
 * - (skillId, communityId) for counting endorsements
 * - communityId for community queries
 * - endorserId for user query optimization
 *
 * Notes:
 * - Self-endorsement is allowed (endorserId can equal skill.userId)
 * - Soft delete allows toggling endorsements on/off
 */
export const skillEndorsements = pgTable(
  'skill_endorsements',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    skillId: uuid('skill_id')
      .references(() => userSkills.id, { onDelete: 'cascade' })
      .notNull(),
    endorserId: text('endorser_id')
      .references(() => appUsers.id, { onDelete: 'cascade' })
      .notNull(),
    communityId: uuid('community_id')
      .references(() => communities.id, { onDelete: 'cascade' })
      .notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    deletedAt: timestamp('deleted_at'),
  },
  (table) => ({
    uniqueEndorsement: unique('skill_endorsements_unique').on(
      table.skillId,
      table.endorserId,
      table.communityId
    ),
    skillCommunityIdx: index('skill_endorsements_skill_community_idx').on(
      table.skillId,
      table.communityId
    ),
    communityIdx: index('skill_endorsements_community_idx').on(table.communityId),
    endorserIdx: index('skill_endorsements_endorser_idx').on(table.endorserId),
  })
);

/**
 * Skill Endorsements Relations
 */
export const skillEndorsementsRelations = relations(skillEndorsements, ({ one }) => ({
  skill: one(userSkills, {
    fields: [skillEndorsements.skillId],
    references: [userSkills.id],
  }),
  endorser: one(appUsers, {
    fields: [skillEndorsements.endorserId],
    references: [appUsers.id],
  }),
  community: one(communities, {
    fields: [skillEndorsements.communityId],
    references: [communities.id],
  }),
}));

/**
 * Type exports for TypeScript
 */
export type SkillEndorsement = typeof skillEndorsements.$inferSelect;
export type NewSkillEndorsement = typeof skillEndorsements.$inferInsert;
