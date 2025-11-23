import { configRepository, ConfigRepository } from './config.repository';
import logger from '@/utils/logger';

/**
 * Application Configuration Service
 *
 * Provides a centralized way to manage runtime configuration with the following priority:
 * 1. Environment variables with CONFIG_ prefix (highest priority)
 * 2. Database stored values
 * 3. Default values (if provided)
 *
 * Environment Variable Convention:
 * - Prefix all config overrides with CONFIG_
 * - Use uppercase with underscores
 * - Example: CONFIG_OPENFGA_STORE_ID=xxx overrides the 'openfga_store_id' key
 *
 * Usage:
 * ```typescript
 * // Get config with optional default
 * const storeId = await configService.get('openfga_store_id', 'default-value');
 *
 * // Set config (persists to database)
 * await configService.set('openfga_store_id', 'new-value', 'OpenFGA store identifier');
 *
 * // Check if value exists
 * const hasStore = await configService.has('openfga_store_id');
 * ```
 */
class ConfigService {
  private repository: ConfigRepository;

  constructor(repository: ConfigRepository) {
    this.repository = repository;
  }

  /**
   * Convert config key to environment variable name
   * Example: 'openfga_store_id' -> 'CONFIG_OPENFGA_STORE_ID'
   */
  private toEnvKey(key: string): string {
    return `CONFIG_${key.toUpperCase()}`;
  }

  /**
   * Get a configuration value with environment variable override support
   *
   * Priority order:
   * 1. Environment variable (CONFIG_<KEY>)
   * 2. Database value
   * 3. Default value (if provided)
   *
   * @param key Configuration key (e.g., 'openfga_store_id')
   * @param defaultValue Optional default value if not found anywhere
   * @returns The configuration value or undefined
   */
  async get(key: string, defaultValue?: string): Promise<string | undefined> {
    // 1. Check environment variable first (highest priority)
    const envKey = this.toEnvKey(key);
    const envValue = process.env[envKey];

    if (envValue !== undefined) {
      logger.debug(`[Config] Using env override for ${key}: ${envKey}=${envValue}`);
      return envValue;
    }

    // 2. Check database
    const dbConfig = await this.repository.get(key);
    if (dbConfig) {
      logger.debug(`[Config] Using database value for ${key}`);
      return dbConfig.value;
    }

    // 3. Use default if provided
    if (defaultValue !== undefined) {
      logger.debug(`[Config] Using default value for ${key}`);
      return defaultValue;
    }

    logger.debug(`[Config] No value found for ${key}`);
    return undefined;
  }

  /**
   * Set a configuration value in the database
   *
   * Note: This does NOT override environment variables. If CONFIG_<KEY> is set,
   * get() will still return the env value, but the database value will be updated.
   *
   * @param key Configuration key
   * @param value Configuration value
   * @param description Optional description
   */
  async set(key: string, value: string, description?: string): Promise<void> {
    logger.info(`[Config] Setting ${key}=${value}`);

    await this.repository.set(key, value, description);

    // Warn if environment variable override exists
    const envKey = this.toEnvKey(key);
    if (process.env[envKey] !== undefined) {
      logger.warn(
        `[Config] Warning: ${envKey} is set in environment and will override database value`
      );
    }
  }

  /**
   * Check if a configuration value exists (in env or database)
   *
   * @param key Configuration key
   * @returns True if value exists, false otherwise
   */
  async has(key: string): Promise<boolean> {
    // Check env first
    const envKey = this.toEnvKey(key);
    if (process.env[envKey] !== undefined) {
      return true;
    }

    // Check database
    return await this.repository.exists(key);
  }

  /**
   * Delete a configuration value from the database
   *
   * Note: This does NOT delete environment variables
   *
   * @param key Configuration key
   * @returns True if deleted, false if not found
   */
  async delete(key: string): Promise<boolean> {
    logger.info(`[Config] Deleting ${key}`);
    return await this.repository.delete(key);
  }

  /**
   * Get all configuration values (database only, not env vars)
   *
   * @returns Object mapping keys to values
   */
  async getAll(): Promise<Record<string, string>> {
    const configs = await this.repository.getAll();
    const result: Record<string, string> = {};

    for (const config of configs) {
      result[config.key] = config.value;
    }

    return result;
  }

  /**
   * Get the effective value source for a key (for debugging)
   *
   * @param key Configuration key
   * @returns Source of the value: 'env', 'database', 'default', or 'none'
   */
  async getSource(key: string, defaultValue?: string): Promise<'env' | 'database' | 'default' | 'none'> {
    const envKey = this.toEnvKey(key);
    if (process.env[envKey] !== undefined) {
      return 'env';
    }

    const dbConfig = await this.repository.get(key);
    if (dbConfig) {
      return 'database';
    }

    if (defaultValue !== undefined) {
      return 'default';
    }

    return 'none';
  }
}

// Default instance for production code paths
export const configService = new ConfigService(configRepository);

// Export class for testing
export { ConfigService };
