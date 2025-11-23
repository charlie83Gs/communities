/* eslint-disable @typescript-eslint/no-explicit-any */
import { OpenFgaClient, CredentialsMethod } from '@openfga/sdk';
import { authorizationModel } from '../config/openfga.model';
import { configService } from '../config/runtime/config.service';

/**
 * OpenFGA Initialization Utility
 *
 * Handles the initialization and bootstrapping of OpenFGA store and authorization model.
 * This utility manages:
 * - Store creation and verification
 * - Authorization model creation and verification
 * - Configuration persistence to database
 * - Retry logic for robustness during startup
 */

interface OpenFGAConfig {
  storeId: string;
  authorizationModelId: string;
  client: OpenFgaClient;
}

// Retry/backoff config for robust startup
const MAX_INIT_ATTEMPTS = Number(process.env.OPENFGA_INIT_MAX_ATTEMPTS ?? 15); // ~75s with 5s steps
const INIT_ATTEMPT_DELAY_MS = Number(process.env.OPENFGA_INIT_DELAY_MS ?? 5000);

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Verify that a store exists in OpenFGA
 */
async function verifyStoreExists(storeId: string): Promise<boolean> {
  try {
    const response = await fetch(
      `${process.env.OPENFGA_API_URL || 'http://localhost:8080'}/stores/${storeId}`
    );
    return response.ok;
  } catch (error) {
    console.warn(`[OpenFGA Init] Failed to verify store ${storeId}:`, error);
    return false;
  }
}

/**
 * Verify that an authorization model exists in OpenFGA
 */
async function verifyAuthorizationModelExists(storeId: string, modelId: string): Promise<boolean> {
  try {
    const response = await fetch(
      `${process.env.OPENFGA_API_URL || 'http://localhost:8080'}/stores/${storeId}/authorization-models/${modelId}`
    );
    return response.ok;
  } catch (error) {
    console.warn(`[OpenFGA Init] Failed to verify authorization model ${modelId}:`, error);
    return false;
  }
}

/**
 * Initialize OpenFGA store and authorization model
 *
 * This function implements a robust initialization flow that:
 * 1. Loads config from database (with env override support via CONFIG_OPENFGA_STORE_ID)
 * 2. Verifies cached IDs actually exist in OpenFGA
 * 3. Creates missing stores/models automatically
 * 4. Persists valid IDs to database for future use
 * 5. Handles container restarts and database resets gracefully
 *
 * @returns OpenFGA configuration with client
 * @throws Error if initialization fails after all retry attempts
 */
export async function initializeOpenFGA(): Promise<OpenFGAConfig> {
  let attempt = 0;
  let lastError: unknown = null;

  while (attempt < MAX_INIT_ATTEMPTS) {
    attempt++;
    try {
      let storeId: string | null = null;
      let authorizationModelId: string | null = null;
      let needsPersistence = false;

      // Step 1: Load store ID from config service (supports env override via CONFIG_OPENFGA_STORE_ID)
      storeId = (await configService.get('openfga_store_id')) || null;
      if (storeId) {
        const source = await configService.getSource('openfga_store_id');
        console.log(`[OpenFGA Init] Loaded store ID from ${source}: ${storeId}`);
      }

      // Step 2: Verify and create store if needed
      if (storeId) {
        console.log(`[OpenFGA Init] Verifying cached store ID: ${storeId}`);
        const storeExists = await verifyStoreExists(storeId);

        if (!storeExists) {
          console.warn(
            `[OpenFGA Init] Cached store ID ${storeId} does not exist - creating new store`
          );
          storeId = null;
          needsPersistence = true;
        } else {
          console.log(`[OpenFGA Init] Verified store exists: ${storeId}`);
        }
      }

      // Create store if needed
      if (!storeId) {
        const tempClient = new OpenFgaClient({
          apiUrl: process.env.OPENFGA_API_URL || 'http://localhost:8080',
          credentials: process.env.OPENFGA_API_TOKEN
            ? {
                method: CredentialsMethod.ApiToken,
                config: {
                  token: process.env.OPENFGA_API_TOKEN,
                },
              }
            : undefined,
        });

        const store = await tempClient.createStore({
          name: process.env.OPENFGA_STORE_NAME || 'share-app',
        });
        storeId = store.id;
        console.log(`[OpenFGA Init] Created new store: ${storeId}`);
        needsPersistence = true;
      }

      // Step 3: Create client with store ID
      const client = new OpenFgaClient({
        apiUrl: process.env.OPENFGA_API_URL || 'http://localhost:8080',
        storeId,
        credentials: process.env.OPENFGA_API_TOKEN
          ? {
              method: CredentialsMethod.ApiToken,
              config: {
                token: process.env.OPENFGA_API_TOKEN,
              },
            }
          : undefined,
      });

      // Step 4: Load authorization model ID from config
      authorizationModelId = (await configService.get('openfga_authorization_model_id')) || null;
      if (authorizationModelId) {
        const source = await configService.getSource('openfga_authorization_model_id');
        console.log(
          `[OpenFGA Init] Loaded authorization model ID from ${source}: ${authorizationModelId}`
        );
      }

      // Step 5: Verify and create authorization model if needed
      if (authorizationModelId) {
        console.log(
          `[OpenFGA Init] Verifying cached authorization model ID: ${authorizationModelId}`
        );
        const modelExists = await verifyAuthorizationModelExists(storeId, authorizationModelId);

        if (!modelExists) {
          console.warn(
            `[OpenFGA Init] Cached authorization model ID ${authorizationModelId} does not exist - creating new model`
          );
          authorizationModelId = null;
          needsPersistence = true;
        } else {
          console.log(
            `[OpenFGA Init] Verified authorization model exists: ${authorizationModelId}`
          );
        }
      }

      // Create authorization model if needed
      if (!authorizationModelId) {
        const model = await client.writeAuthorizationModel(authorizationModel as any);
        authorizationModelId = model.authorization_model_id;
        console.log(`[OpenFGA Init] Created new authorization model: ${authorizationModelId}`);
        needsPersistence = true;
      }

      // Step 6: Create final client with both store and model IDs
      const finalClient = new OpenFgaClient({
        apiUrl: process.env.OPENFGA_API_URL || 'http://localhost:8080',
        storeId,
        authorizationModelId,
        credentials: process.env.OPENFGA_API_TOKEN
          ? {
              method: CredentialsMethod.ApiToken,
              config: {
                token: process.env.OPENFGA_API_TOKEN,
              },
            }
          : undefined,
      });

      // Step 7: Persist to database if we created new resources
      if (needsPersistence) {
        try {
          await configService.set(
            'openfga_store_id',
            storeId,
            'OpenFGA store identifier for authorization'
          );
          await configService.set(
            'openfga_authorization_model_id',
            authorizationModelId,
            'OpenFGA authorization model identifier'
          );
          console.log('[OpenFGA Init] Persisted store and model IDs to database');
        } catch (error) {
          console.error('[OpenFGA Init] Failed to persist config to database:', error);
          // Non-fatal error - don't throw
        }
      }

      console.log('[OpenFGA Init] Initialization complete - store and authorization model ready');
      return {
        storeId,
        authorizationModelId,
        client: finalClient,
      };
    } catch (error) {
      lastError = error;
      const waitMs = INIT_ATTEMPT_DELAY_MS;
      console.warn(
        `[OpenFGA Init] Initialization attempt ${attempt}/${MAX_INIT_ATTEMPTS} failed; retrying in ${Math.round(
          waitMs / 1000
        )}s...`,
        error
      );
      await sleep(waitMs);
    }
  }

  // All retry attempts exhausted
  throw new Error(
    `[OpenFGA Init] Failed to initialize after ${MAX_INIT_ATTEMPTS} attempts: ${lastError}`
  );
}
