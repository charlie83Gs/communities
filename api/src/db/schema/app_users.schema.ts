import { pgTable, timestamp, uuid, text, varchar } from 'drizzle-orm/pg-core';

/**
 * App Users table
 *
 * This table stores all user profile data internally for efficient database queries,
 * relations, and search functionality. Data is synced from Keycloak on signup/login.
 *
 * Fields:
 * - id: User ID from Keycloak (used as primary key for direct foreign key relationships)
 * - email: User's email address
 * - username: Unique username (required)
 * - displayName: Optional display name
 * - description: Optional user bio/description
 * - profileImage: Optional profile image URL
 * - lastSeenAt: App-specific tracking
 */
export const appUsers = pgTable('app_users', {
  id: text('id').primaryKey().notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  displayName: varchar('display_name', { length: 255 }),
  description: text('description'),
  profileImage: text('profile_image'),
  lastSeenAt: timestamp('last_seen_at', { withTimezone: true }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
