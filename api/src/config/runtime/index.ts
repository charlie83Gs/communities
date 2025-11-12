/**
 * Runtime Configuration Module
 *
 * Provides database-backed configuration with environment variable overrides.
 *
 * Priority order for configuration values:
 * 1. Environment variables with CONFIG_ prefix (highest priority)
 * 2. Database stored values
 * 3. Default values (if provided)
 *
 * Example usage:
 * ```typescript
 * import { configService } from '@/config/runtime';
 *
 * // Get config with optional default
 * const value = await configService.get('my_config_key', 'default-value');
 *
 * // Set config (persists to database)
 * await configService.set('my_config_key', 'new-value', 'Optional description');
 *
 * // Override via environment variable (no code changes needed)
 * // CONFIG_MY_CONFIG_KEY=override-value
 * ```
 */

export { configService, ConfigService } from './config.service';
export { configRepository, ConfigRepository } from './config.repository';
