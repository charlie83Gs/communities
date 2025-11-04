import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import * as schema from './schema';

/**
 * Run database migrations
 *
 * This function creates a dedicated postgres client for migrations with max: 1
 * (best practice for postgres-js) and properly closes it after running.
 */
export async function runMigrations(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is required for migrations');
  }

  console.log('[Migrations] Starting database migrations...');

  // Create a dedicated client for migrations with max: 1
  // This is the recommended approach for postgres-js migrations
  const migrationClient = postgres(connectionString, { max: 1 });

  try {
    const db = drizzle(migrationClient, { schema });

    // Run migrations from the migrations folder
    await migrate(db, {
      migrationsFolder: './src/db/migrations'
    });

    console.log('[Migrations] Database migrations completed successfully');
  } catch (error) {
    console.error('[Migrations] CRITICAL: Failed to run migrations:', error);
    throw error;
  } finally {
    // Always close the migration client
    await migrationClient.end();
    console.log('[Migrations] Migration client closed');
  }
}
