import { pgTable, uuid, text, timestamp, varchar, index, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { appUsers } from './app_users.schema';
import { skillEndorsements } from './skillEndorsements.schema';

/**
 * User Skills Table
 *
 * User-scoped skills that persist across all communities.
 * Users declare their abilities/competencies.
 *
 * Fields:
 * - id: UUID primary key
 * - userId: Reference to app_users (owner of the skill)
 * - name: Skill name (max 50 chars, alphanumeric + space/hyphen/ampersand)
 * - createdAt: When skill was added
 * - deletedAt: Soft delete support
 *
 * Constraints:
 * - Unique (userId, name) - prevents duplicate skills per user
 *
 * Indexes:
 * - userId for fast user skill lookups
 * - name for search functionality
 */
export const userSkills = pgTable(
  'user_skills',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: text('user_id')
      .references(() => appUsers.id, { onDelete: 'cascade' })
      .notNull(),
    name: varchar('name', { length: 50 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    deletedAt: timestamp('deleted_at'),
  },
  (table) => ({
    userNameUnique: unique('user_skills_user_name_unique').on(
      table.userId,
      table.name
    ),
    userIdIdx: index('user_skills_user_id_idx').on(table.userId),
    nameIdx: index('user_skills_name_idx').on(table.name),
  })
);

/**
 * User Skills Relations
 */
export const userSkillsRelations = relations(userSkills, ({ one, many }) => ({
  user: one(appUsers, {
    fields: [userSkills.userId],
    references: [appUsers.id],
  }),
  endorsements: many(skillEndorsements),
}));

/**
 * Type exports for TypeScript
 */
export type UserSkill = typeof userSkills.$inferSelect;
export type NewUserSkill = typeof userSkills.$inferInsert;
