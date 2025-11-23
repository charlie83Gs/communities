import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

/**
 * Application-level configuration stored in the database.
 * This table stores runtime configuration that persists across pod restarts.
 *
 * Environment variables with CONFIG_ prefix can override values from this table.
 * Example: CONFIG_OPENFGA_STORE_ID=xxx will override the openfga_store_id value
 */
export const appConfig = pgTable('app_config', {
  // Configuration key (e.g., 'openfga_store_id', 'feature_flag_xyz')
  key: text('key').primaryKey(),

  // Configuration value (stored as text, parse as needed)
  value: text('value').notNull(),

  // Optional description of what this config does
  description: text('description'),

  // Audit fields
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type AppConfig = typeof appConfig.$inferSelect;
export type NewAppConfig = typeof appConfig.$inferInsert;
