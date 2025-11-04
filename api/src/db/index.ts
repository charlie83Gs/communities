import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Regular client for application queries
const client = postgres(connectionString);
export const db = drizzle(client, { schema });

// Export schema for use in migrations and other modules
export { schema };