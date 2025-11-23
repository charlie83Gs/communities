import { db as realDb } from '@/db';
import { appConfig } from '@/db/schema';
import { eq } from 'drizzle-orm';
import type { AppConfig } from '@/db/schema';

/**
 * Repository for application-level configuration stored in the database.
 *
 * This repository handles CRUD operations for runtime configuration that persists
 * across pod restarts in a Kubernetes environment.
 */
class ConfigRepository {
  private db: any;

  constructor(db: any) {
    this.db = db;
  }

  /**
   * Get a configuration value by key
   * @param key Configuration key (e.g., 'openfga_store_id')
   * @returns Config object or undefined if not found
   */
  async get(key: string): Promise<AppConfig | undefined> {
    const [config] = await this.db
      .select()
      .from(appConfig)
      .where(eq(appConfig.key, key));
    return config;
  }

  /**
   * Get multiple configuration values by keys
   * @param keys Array of configuration keys
   * @returns Array of config objects
   */
  async getMany(keys: string[]): Promise<AppConfig[]> {
    if (keys.length === 0) return [];

    return await this.db
      .select()
      .from(appConfig)
      .where(eq(appConfig.key, keys[0])); // Will need inArray for multiple
  }

  /**
   * Set a configuration value (insert or update)
   * @param key Configuration key
   * @param value Configuration value
   * @param description Optional description
   * @returns The created/updated config object
   */
  async set(key: string, value: string, description?: string): Promise<AppConfig> {
    const existing = await this.get(key);

    if (existing) {
      // Update existing
      const [updated] = await this.db
        .update(appConfig)
        .set({
          value,
          description: description ?? existing.description,
          updatedAt: new Date()
        })
        .where(eq(appConfig.key, key))
        .returning();
      return updated;
    } else {
      // Insert new
      const [created] = await this.db
        .insert(appConfig)
        .values({ key, value, description })
        .returning();
      return created;
    }
  }

  /**
   * Delete a configuration value
   * @param key Configuration key
   * @returns True if deleted, false if not found
   */
  async delete(key: string): Promise<boolean> {
    const result = await this.db
      .delete(appConfig)
      .where(eq(appConfig.key, key));
    return result.rowCount > 0;
  }

  /**
   * Get all configuration values
   * @returns Array of all config objects
   */
  async getAll(): Promise<AppConfig[]> {
    return await this.db
      .select()
      .from(appConfig);
  }

  /**
   * Check if a configuration key exists
   * @param key Configuration key
   * @returns True if exists, false otherwise
   */
  async exists(key: string): Promise<boolean> {
    const config = await this.get(key);
    return config !== undefined;
  }
}

// Default instance for production code paths
export const configRepository = new ConfigRepository(realDb);

// Export class for testing
export { ConfigRepository };
