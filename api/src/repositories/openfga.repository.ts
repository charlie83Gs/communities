import { OpenFgaClient, CredentialsMethod } from '@openfga/sdk';
import { authorizationModel } from '../config/openfga.model';
import fs from 'fs';
import path from 'path';

/**
 * OpenFGA Repository
 *
 * Handles all OpenFGA initialization, store management, and tuple operations.
 * This repository encapsulates the low-level OpenFGA client operations.
 */
export class OpenFGARepository {
  private client: OpenFgaClient;
  private storeId: string | null = null;
  private authorizationModelId: string | null = null;
  private initialized = false;

  // Retry/backoff config for robust startup against OpenFGA readiness/migrations
  private readonly maxInitAttempts = Number(process.env.OPENFGA_INIT_MAX_ATTEMPTS ?? 15); // ~75s with 5s steps
  private readonly initAttemptDelayMs = Number(process.env.OPENFGA_INIT_DELAY_MS ?? 5000);

  constructor() {
    // Initialize client with environment variables
    this.client = new OpenFgaClient({
      apiUrl: process.env.OPENFGA_API_URL || 'http://localhost:8080',
      storeId: process.env.OPENFGA_STORE_ID,
      authorizationModelId: process.env.OPENFGA_AUTHORIZATION_MODEL_ID,
      credentials: process.env.OPENFGA_API_TOKEN
        ? {
            method: CredentialsMethod.ApiToken,
            config: {
              token: process.env.OPENFGA_API_TOKEN,
            },
          }
        : undefined,
    });

    this.storeId = process.env.OPENFGA_STORE_ID || null;
    this.authorizationModelId = process.env.OPENFGA_AUTHORIZATION_MODEL_ID || null;
  }

  private async sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Update .env file with OpenFGA credentials
   * This ensures the same store and model are used across restarts
   */
  private updateEnvFile(storeId: string, authorizationModelId: string): void {
    try {
      const envPath = path.resolve(process.cwd(), '.env');

      if (!fs.existsSync(envPath)) {
        console.warn('[OpenFGA Repository] .env file not found, skipping persistence');
        return;
      }

      let envContent = fs.readFileSync(envPath, 'utf-8');

      // Update or add OPENFGA_STORE_ID
      if (envContent.includes('OPENFGA_STORE_ID=')) {
        envContent = envContent.replace(/OPENFGA_STORE_ID=.*/g, `OPENFGA_STORE_ID=${storeId}`);
      } else {
        envContent += `\nOPENFGA_STORE_ID=${storeId}`;
      }

      // Update or add OPENFGA_AUTHORIZATION_MODEL_ID
      if (envContent.includes('OPENFGA_AUTHORIZATION_MODEL_ID=')) {
        envContent = envContent.replace(
          /OPENFGA_AUTHORIZATION_MODEL_ID=.*/g,
          `OPENFGA_AUTHORIZATION_MODEL_ID=${authorizationModelId}`
        );
      } else {
        envContent += `\nOPENFGA_AUTHORIZATION_MODEL_ID=${authorizationModelId}`;
      }

      fs.writeFileSync(envPath, envContent, 'utf-8');
      console.log('[OpenFGA Repository] Persisted store and model IDs to .env file');
    } catch (error) {
      console.error('[OpenFGA Repository] Failed to update .env file:', error);
      // Non-fatal error - don't throw
    }
  }

  /**
   * Verify that a store exists in OpenFGA
   */
  private async verifyStoreExists(storeId: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${process.env.OPENFGA_API_URL || 'http://localhost:8080'}/stores/${storeId}`
      );
      return response.ok;
    } catch (error) {
      console.warn(`[OpenFGA Repository] Failed to verify store ${storeId}:`, error);
      return false;
    }
  }

  /**
   * Verify that an authorization model exists in OpenFGA
   */
  private async verifyAuthorizationModelExists(storeId: string, modelId: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${process.env.OPENFGA_API_URL || 'http://localhost:8080'}/stores/${storeId}/authorization-models/${modelId}`
      );
      return response.ok;
    } catch (error) {
      console.warn(`[OpenFGA Repository] Failed to verify authorization model ${modelId}:`, error);
      return false;
    }
  }

  /**
   * Initialize OpenFGA store and authorization model
   *
   * This method implements a robust initialization flow that:
   * 1. Verifies cached IDs actually exist in OpenFGA
   * 2. Creates missing stores/models automatically
   * 3. Persists valid IDs to .env for future use
   * 4. Handles container restarts and database resets gracefully
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Retry loop to handle:
    // - OpenFGA container not yet ready (connection refused)
    // - OpenFGA datastore migrations not yet complete (returns readiness errors)
    // - Transient network hiccups at startup
    let attempt = 0;
    let lastError: unknown = null;

    while (attempt < this.maxInitAttempts) {
      attempt++;
      try {
        let needsPersistence = false;

        // Step 1: Verify and create store if needed
        if (this.storeId) {
          console.log(`[OpenFGA Repository] Verifying cached store ID: ${this.storeId}`);
          const storeExists = await this.verifyStoreExists(this.storeId);

          if (!storeExists) {
            console.warn(
              `[OpenFGA Repository] Cached store ID ${this.storeId} does not exist - creating new store`
            );
            this.storeId = null;
            needsPersistence = true;
          } else {
            console.log(`[OpenFGA Repository] Verified store exists: ${this.storeId}`);
          }
        }

        if (!this.storeId) {
          const store = await this.client.createStore({
            name: process.env.OPENFGA_STORE_NAME || 'share-app',
          });
          this.storeId = store.id;
          console.log(`[OpenFGA Repository] Created new store: ${this.storeId}`);
          needsPersistence = true;
        }

        // Step 2: Update client with verified store ID
        this.client = new OpenFgaClient({
          apiUrl: process.env.OPENFGA_API_URL || 'http://localhost:8080',
          storeId: this.storeId,
          credentials: process.env.OPENFGA_API_TOKEN
            ? {
                method: CredentialsMethod.ApiToken,
                config: {
                  token: process.env.OPENFGA_API_TOKEN,
                },
              }
            : undefined,
        });

        // Step 3: Verify and create authorization model if needed
        if (this.authorizationModelId) {
          console.log(
            `[OpenFGA Repository] Verifying cached authorization model ID: ${this.authorizationModelId}`
          );
          const modelExists = await this.verifyAuthorizationModelExists(
            this.storeId,
            this.authorizationModelId
          );

          if (!modelExists) {
            console.warn(
              `[OpenFGA Repository] Cached authorization model ID ${this.authorizationModelId} does not exist - creating new model`
            );
            this.authorizationModelId = null;
            needsPersistence = true;
          } else {
            console.log(
              `[OpenFGA Repository] Verified authorization model exists: ${this.authorizationModelId}`
            );
          }
        }

        if (!this.authorizationModelId) {
          // Cast to satisfy SDK type narrowing differences across versions
          const model = await this.client.writeAuthorizationModel(authorizationModel as any);
          this.authorizationModelId = model.authorization_model_id;
          console.log(
            `[OpenFGA Repository] Created new authorization model: ${this.authorizationModelId}`
          );
          needsPersistence = true;
        }

        // Step 4: Update client with verified authorization model ID
        this.client = new OpenFgaClient({
          apiUrl: process.env.OPENFGA_API_URL || 'http://localhost:8080',
          storeId: this.storeId,
          authorizationModelId: this.authorizationModelId,
          credentials: process.env.OPENFGA_API_TOKEN
            ? {
                method: CredentialsMethod.ApiToken,
                config: {
                  token: process.env.OPENFGA_API_TOKEN,
                },
              }
            : undefined,
        });

        // Step 5: Persist to .env file if we created new resources or verified IDs changed
        if (needsPersistence && this.storeId && this.authorizationModelId) {
          this.updateEnvFile(this.storeId, this.authorizationModelId);
        }

        this.initialized = true;
        console.log(
          '[OpenFGA Repository] Initialization complete - store and authorization model ready'
        );
        return;
      } catch (error) {
        lastError = error;
        const waitMs = this.initAttemptDelayMs;
        console.warn(
          `[OpenFGA Repository] Initialization attempt ${attempt}/${this.maxInitAttempts} failed; retrying in ${Math.round(
            waitMs / 1000
          )}s...`,
          error
        );
        await this.sleep(waitMs);
      }
    }

    console.error(
      '[OpenFGA Repository] CRITICAL: Exhausted initialization retries; OpenFGA not ready.'
    );
    throw lastError ?? new Error('OpenFGA initialization failed after retries');
  }

  /**
   * Ensure OpenFGA is initialized
   */
  async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  /**
   * Check if user can perform action on resource
   */
  async check(params: { user: string; relation: string; object: string }): Promise<boolean> {
    await this.ensureInitialized();

    try {
      const response = await this.client.check(params);
      return response.allowed || false;
    } catch (error) {
      console.error('[OpenFGA Repository] Check error:', error);
      return false;
    }
  }

  /**
   * Read tuples matching a pattern
   */
  async readTuples(pattern: {
    user?: string;
    relation?: string;
    object?: string;
  }): Promise<Array<{ key: { user?: string; relation: string; object: string } }>> {
    await this.ensureInitialized();

    try {
      const response = await this.client.read({
        // Cast request body due to SDK minor type differences
        tuple_key: pattern,
      } as any);

      return response.tuples || [];
    } catch (error) {
      console.error('[OpenFGA Repository] Read tuples error:', error);
      return [];
    }
  }

  /**
   * Write tuples to OpenFGA
   */
  async write(
    writes?: Array<{ user: string; relation: string; object: string }>,
    deletes?: Array<{ user: string; relation: string; object: string }>
  ): Promise<void> {
    await this.ensureInitialized();

    try {
      await this.client.write({ writes, deletes });
    } catch (error) {
      console.error('[OpenFGA Repository] Write error:', error);
      throw error;
    }
  }

  /**
   * List objects user has access to
   */
  async listObjects(params: { user: string; relation: string; type: string }): Promise<string[]> {
    await this.ensureInitialized();

    try {
      const response = await this.client.listObjects(params);

      // Extract IDs from the object references (format: "type:id")
      return (
        response.objects?.map((obj) => {
          const parts = obj.split(':');
          return parts.length > 1 ? parts.slice(1).join(':') : obj;
        }) || []
      );
    } catch (error) {
      console.error('[OpenFGA Repository] List objects error:', error);
      return [];
    }
  }
}

// Default instance for production code paths
export const openFGARepository = new OpenFGARepository();
