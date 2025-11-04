import { OpenFgaClient, CredentialsMethod } from '@openfga/sdk';
import { authorizationModel } from '../config/openfga.model';
import fs from 'fs';
import path from 'path';

export class OpenFGAService {
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
        console.warn('[OpenFGA] .env file not found, skipping persistence');
        return;
      }

      let envContent = fs.readFileSync(envPath, 'utf-8');

      // Update or add OPENFGA_STORE_ID
      if (envContent.includes('OPENFGA_STORE_ID=')) {
        envContent = envContent.replace(
          /OPENFGA_STORE_ID=.*/g,
          `OPENFGA_STORE_ID=${storeId}`
        );
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
      console.log('[OpenFGA] Persisted store and model IDs to .env file');
    } catch (error) {
      console.error('[OpenFGA] Failed to update .env file:', error);
      // Non-fatal error - don't throw
    }
  }

  /**
   * Verify that a store exists in OpenFGA
   */
  private async verifyStoreExists(storeId: string): Promise<boolean> {
    try {
      const response = await fetch(`${process.env.OPENFGA_API_URL || 'http://localhost:8080'}/stores/${storeId}`);
      return response.ok;
    } catch (error) {
      console.warn(`[OpenFGA] Failed to verify store ${storeId}:`, error);
      return false;
    }
  }

  /**
   * Verify that an authorization model exists in OpenFGA
   */
  private async verifyAuthorizationModelExists(storeId: string, modelId: string): Promise<boolean> {
    try {
      const response = await fetch(`${process.env.OPENFGA_API_URL || 'http://localhost:8080'}/stores/${storeId}/authorization-models/${modelId}`);
      return response.ok;
    } catch (error) {
      console.warn(`[OpenFGA] Failed to verify authorization model ${modelId}:`, error);
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
          console.log(`[OpenFGA] Verifying cached store ID: ${this.storeId}`);
          const storeExists = await this.verifyStoreExists(this.storeId);

          if (!storeExists) {
            console.warn(`[OpenFGA] Cached store ID ${this.storeId} does not exist - creating new store`);
            this.storeId = null;
            needsPersistence = true;
          } else {
            console.log(`[OpenFGA] Verified store exists: ${this.storeId}`);
          }
        }

        if (!this.storeId) {
          const store = await this.client.createStore({
            name: process.env.OPENFGA_STORE_NAME || 'share-app',
          });
          this.storeId = store.id;
          console.log(`[OpenFGA] Created new store: ${this.storeId}`);
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
          console.log(`[OpenFGA] Verifying cached authorization model ID: ${this.authorizationModelId}`);
          const modelExists = await this.verifyAuthorizationModelExists(this.storeId, this.authorizationModelId);

          if (!modelExists) {
            console.warn(
              `[OpenFGA] Cached authorization model ID ${this.authorizationModelId} does not exist - creating new model`
            );
            this.authorizationModelId = null;
            needsPersistence = true;
          } else {
            console.log(`[OpenFGA] Verified authorization model exists: ${this.authorizationModelId}`);
          }
        }

        if (!this.authorizationModelId) {
          // Cast to satisfy SDK type narrowing differences across versions
          const model = await this.client.writeAuthorizationModel(authorizationModel as any);
          this.authorizationModelId = model.authorization_model_id;
          console.log(`[OpenFGA] Created new authorization model: ${this.authorizationModelId}`);
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
        console.log('[OpenFGA] Initialization complete - store and authorization model ready');
        return;
      } catch (error) {
        lastError = error;
        const waitMs = this.initAttemptDelayMs;
        console.warn(
          `[OpenFGA] Initialization attempt ${attempt}/${this.maxInitAttempts} failed; retrying in ${Math.round(
            waitMs / 1000
          )}s...`,
          error
        );
        await this.sleep(waitMs);
      }
    }

    console.error('[OpenFGA] CRITICAL: Exhausted initialization retries; OpenFGA not ready.');
    throw lastError ?? new Error('OpenFGA initialization failed after retries');
  }

  /**
   * Map resource type to OpenFGA type
   */
  private mapResourceType(resourceType: string): string {
    const typeMap: Record<string, string> = {
      communities: 'community',
      wealth: 'wealth',
      wealth_comments: 'wealth_comment',
      wealthComments: 'wealth_comment',
      invites: 'invite',
    };
    return typeMap[resourceType] || resourceType;
  }

  /**
   * Map action to OpenFGA relation
   */
  private mapAction(action: string): string {
    const actionMap: Record<string, string> = {
      create: 'can_create',
      read: 'can_read',
      update: 'can_update',
      delete: 'can_delete',
    };
    return actionMap[action] || `can_${action}`;
  }

  /**
   * Check if user can perform action on resource
   */
  async can(userId: string, resourceType: string, resourceId: string, action: string): Promise<boolean> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      // Check for superadmin first
      const isSuperadmin = await this.client.check({
        user: `user:${userId}`,
        relation: 'superadmin',
        object: 'system:global',
      });

      if (isSuperadmin.allowed) {
        return true;
      }

      // Check specific permission
      const fgaType = this.mapResourceType(resourceType);
      const fgaRelation = this.mapAction(action);

      const response = await this.client.check({
        user: `user:${userId}`,
        relation: fgaRelation,
        object: `${fgaType}:${resourceId}`,
      });

      return response.allowed || false;
    } catch (error) {
      console.error('OpenFGA check error:', error);
      return false;
    }
  }

  /**
   * Get user's role for a resource (from OpenFGA)
   * Returns the highest privilege role the user has for the resource
   */
  async getUserRoleForResource(userId: string, resourceType: string, resourceId: string): Promise<string | null> {
    if (!this.initialized) {
      await this.initialize();
    }

    const fgaType = this.mapResourceType(resourceType);
    const roles = ['admin', 'member', 'reader'];

    // Check roles in order of privilege (highest to lowest)
    for (const role of roles) {
      try {
        const response = await this.client.check({
          user: `user:${userId}`,
          relation: role,
          object: `${fgaType}:${resourceId}`,
        });

        if (response.allowed) {
          return role;
        }
      } catch (error) {
        console.error(`Failed to check role ${role} for user ${userId}:`, error);
      }
    }

    return null;
  }

  /**
   * Get all roles for a specific user on a resource (from OpenFGA)
   * Returns all roles the user has on the resource as an array
   */
  async getUserRolesForResource(userId: string, resourceType: string, resourceId: string): Promise<string[]> {
    if (!this.initialized) {
      await this.initialize();
    }

    const fgaType = this.mapResourceType(resourceType);
    const roles = ['admin', 'member', 'reader'];
    const userRoles: string[] = [];

    // Check all roles for the user
    for (const role of roles) {
      try {
        const response = await this.client.check({
          user: `user:${userId}`,
          relation: role,
          object: `${fgaType}:${resourceId}`,
        });

        if (response.allowed) {
          userRoles.push(role);
        }
      } catch (error) {
        console.error(`Failed to check role ${role} for user ${userId}:`, error);
      }
    }

    return userRoles;
  }

  /**
   * Get all users with their roles for a resource (from OpenFGA)
   * This queries OpenFGA to find all users with any role on the resource
   */
  async getRolesForResource(resourceType: string, resourceId: string): Promise<{ userId: string; role: string }[]> {
    if (!this.initialized) {
      await this.initialize();
    }

    const fgaType = this.mapResourceType(resourceType);
    const roles = ['admin', 'member', 'reader'];
    const userRoles: { userId: string; role: string }[] = [];

    try {
      // For each role, read all tuples for that relation
      for (const role of roles) {
        const response = await this.client.read({
          // Cast request body due to SDK minor type differences
          tuple_key: {
            object: `${fgaType}:${resourceId}`,
            relation: role,
          },
        } as any);

        if (response.tuples) {
          for (const tuple of response.tuples) {
            const userMatch = tuple.key.user?.match(/^user:(.+)$/);
            if (userMatch) {
              const userId = userMatch[1];
              // Filter out the special "metadata" user used for invite role metadata
              if (userId !== 'metadata') {
                userRoles.push({
                  userId: userId,
                  role: role,
                });
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Failed to get roles for resource:', error);
    }

    return userRoles;
  }

  /**
   * Get all resource IDs user has access to for a given action (from OpenFGA)
   * This uses OpenFGA's listObjects API to efficiently find all accessible resources
   */
  async getAccessibleResourceIds(userId: string, resourceType: string, action: string): Promise<string[]> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const fgaType = this.mapResourceType(resourceType);
      const fgaRelation = this.mapAction(action);

      const response = await this.client.listObjects({
        user: `user:${userId}`,
        relation: fgaRelation,
        type: fgaType,
      });

      // Extract IDs from the object references (format: "type:id")
      return response.objects?.map((obj) => {
        const parts = obj.split(':');
        return parts.length > 1 ? parts.slice(1).join(':') : obj;
      }) || [];
    } catch (error) {
      console.error('Failed to list accessible resources:', error);
      return [];
    }
  }

  /**
   * Assign role to user for a resource (OpenFGA only)
   * OpenFGA is now the single source of truth for authorization
   *
   * This method is idempotent and handles race conditions by:
   * 1. Reading current state to verify what tuples exist
   * 2. Attempting to delete old roles with error handling (defensive delete)
   * 3. Writing the new tuple if it doesn't already exist
   * 4. Ensuring a user can only have ONE role per community at a time
   *
   * The delete and write operations are separated to handle cases where tuples
   * might not exist (e.g., due to race conditions or computed vs direct tuples).
   */
  async assignRole(userId: string, resourceType: string, resourceId: string, role: string): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }

    const fgaType = this.mapResourceType(resourceType);
    const allRoles = ['admin', 'member', 'reader'];

    // Validate the role is one we recognize
    if (!allRoles.includes(role)) {
      throw new Error(`Invalid role: ${role}. Must be one of: ${allRoles.join(', ')}`);
    }

    try {
      console.log(`[OpenFGA] Assigning role "${role}" to user:${userId} on ${fgaType}:${resourceId}`);

      // Step 1: Read current state - get all existing role tuples for this user on this resource
      const existingTuples = await this.client.read({
        // Cast request body due to SDK minor type differences
        tuple_key: {
          user: `user:${userId}`,
          object: `${fgaType}:${resourceId}`,
        },
      } as any);

      const existingRoles = new Set<string>();

      if (existingTuples.tuples) {
        for (const tuple of existingTuples.tuples) {
          const relation = tuple.key.relation;
          // Only consider actual role relations, not permission relations
          if (allRoles.includes(relation)) {
            existingRoles.add(relation);
          }
        }
      }

      // Step 2: Check if the desired role already exists as the only role
      if (existingRoles.has(role) && existingRoles.size === 1) {
        console.log(`[OpenFGA] User already has exactly role "${role}" - operation is idempotent, no changes needed`);
        return; // Idempotent - already in desired state
      }

      // Step 3: Delete old roles (if any) - use defensive approach with error handling
      // We separate the delete from the write to avoid atomic failures when tuples don't exist
      const rolesToDelete = allRoles.filter((r) => r !== role && existingRoles.has(r));

      if (rolesToDelete.length > 0) {
        console.log(`[OpenFGA] Removing existing roles from user:${userId}: ${rolesToDelete.join(', ')}`);

        // Delete each old role individually with error handling
        for (const oldRole of rolesToDelete) {
          try {
            await this.client.write({
              deletes: [
                {
                  user: `user:${userId}`,
                  relation: oldRole,
                  object: `${fgaType}:${resourceId}`,
                },
              ],
            });
            console.log(`[OpenFGA] Successfully removed role "${oldRole}" from user:${userId}`);
          } catch (deleteError: any) {
            // Ignore "tuple doesn't exist" errors - this can happen due to race conditions
            // or if the tuple was computed rather than direct
            const errorMessage = deleteError?.message || String(deleteError);
            if (errorMessage.includes('cannot delete a tuple which does not exist')) {
              console.log(`[OpenFGA] Tuple for role "${oldRole}" already deleted (race condition or computed tuple) - ignoring`);
            } else {
              // Re-throw other errors
              throw deleteError;
            }
          }
        }
      }

      // Step 4: Write the new role tuple
      // IMPORTANT: Always write the role tuple, even if it appeared to exist in the initial read.
      // This ensures the role is a direct tuple, not a computed one, and handles race conditions
      // where the tuple might have been deleted between our read and this write.
      console.log(`[OpenFGA] Writing role "${role}" tuple for user:${userId} (${existingRoles.has(role) ? 'refreshing' : 'creating'})`);

      try {
        await this.client.write({
          writes: [
            {
              user: `user:${userId}`,
              relation: role,
              object: `${fgaType}:${resourceId}`,
            },
          ],
        });

        console.log(`[OpenFGA] Successfully wrote role "${role}" to user:${userId} on ${fgaType}:${resourceId}`);
      } catch (writeError: any) {
        // If the tuple already exists, that's fine - we've achieved our goal
        const errorMessage = writeError?.message || String(writeError);
        if (errorMessage.includes('cannot write a tuple which already exists')) {
          console.log(`[OpenFGA] Tuple for role "${role}" already exists (concurrent write) - operation is idempotent`);
        } else {
          // Re-throw other errors
          throw writeError;
        }
      }

      // Step 5: Verify the final state (defensive check)
      const finalRoles = await this.getUserRolesForResource(userId, resourceType, resourceId);

      if (finalRoles.length !== 1 || finalRoles[0] !== role) {
        console.error(`[OpenFGA] WARNING: Unexpected final state for user:${userId} on ${fgaType}:${resourceId}. Expected: ["${role}"], Got: ${JSON.stringify(finalRoles)}`);
        throw new Error(`Failed to assign role properly. Expected single role "${role}", but found: ${JSON.stringify(finalRoles)}`);
      }

      console.log(`[OpenFGA] Verified: user:${userId} has exactly role "${role}" on ${fgaType}:${resourceId}`);

    } catch (error) {
      console.error(`[OpenFGA] Failed to assign role "${role}" to user:${userId} on ${fgaType}:${resourceId}:`, error);
      throw error;
    }
  }

  /**
   * Remove role from user for a resource (OpenFGA only)
   * Removes all role tuples for the user on the resource
   */
  async removeRole(userId: string, resourceType: string, resourceId: string): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const fgaType = this.mapResourceType(resourceType);

      // Remove all role tuples for this user on this resource
      await this.removeRoleTuplesFromOpenFGA(userId, fgaType, resourceId);
    } catch (error) {
      console.error('Failed to delete role from OpenFGA:', error);
      throw error;
    }
  }

  /**
   * Remove all role tuples for a user on a resource
   * Helper method to clean up before reassigning roles
   */
  private async removeRoleTuplesFromOpenFGA(userId: string, fgaType: string, resourceId: string): Promise<void> {
    const roles = ['admin', 'member', 'reader'];
    const deletes = roles.map((role) => ({
      user: `user:${userId}`,
      relation: role,
      object: `${fgaType}:${resourceId}`,
    }));

    try {
      await this.client.write({ deletes });
    } catch (error) {
      // Ignore errors - tuples might not exist
      console.debug('No existing tuples to delete:', error);
    }
  }

  /**
   * Create relationship between resources (e.g., wealth -> community)
   */
  async createRelationship(
    childType: string,
    childId: string,
    relation: string,
    parentType: string,
    parentId: string
  ): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const fgaChildType = this.mapResourceType(childType);
      const fgaParentType = this.mapResourceType(parentType);

      await this.client.write({
        writes: [
          {
            user: `${fgaParentType}:${parentId}`,
            relation: relation,
            object: `${fgaChildType}:${childId}`,
          },
        ],
      });
    } catch (error) {
      console.error('Failed to create relationship in OpenFGA:', error);
    }
  }

  /**
   * Remove relationship between resources
   */
  async removeRelationship(
    childType: string,
    childId: string,
    relation: string,
    parentType: string,
    parentId: string
  ): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const fgaChildType = this.mapResourceType(childType);
      const fgaParentType = this.mapResourceType(parentType);

      await this.client.write({
        deletes: [
          {
            user: `${fgaParentType}:${parentId}`,
            relation: relation,
            object: `${fgaChildType}:${childId}`,
          },
        ],
      });
    } catch (error) {
      console.error('Failed to remove relationship from OpenFGA:', error);
    }
  }

  /**
   * Grant superadmin role to a user
   */
  async grantSuperadmin(userId: string): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      await this.client.write({
        writes: [
          {
            user: `user:${userId}`,
            relation: 'superadmin',
            object: 'system:global',
          },
        ],
      });
    } catch (error) {
      console.error('Failed to grant superadmin in OpenFGA:', error);
      throw error;
    }
  }

  /**
   * Revoke superadmin role from a user
   */
  async revokeSuperadmin(userId: string): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      await this.client.write({
        deletes: [
          {
            user: `user:${userId}`,
            relation: 'superadmin',
            object: 'system:global',
          },
        ],
      });
    } catch (error) {
      console.error('Failed to revoke superadmin from OpenFGA:', error);
      throw error;
    }
  }

  /**
   * Store role metadata for an invite
   * Uses a special "grants_X" relation to indicate what role this invite will grant
   */
  async setInviteRoleMetadata(inviteId: string, role: string): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      // Use a synthetic user to store the metadata
      // We use "metadata:role" as a special marker
      const grantsRelation = `grants_${role}`;

      await this.client.write({
        writes: [
          {
            user: `user:metadata`,
            relation: grantsRelation,
            object: `invite:${inviteId}`,
          },
        ],
      });
    } catch (error) {
      console.error('Failed to set invite role metadata in OpenFGA:', error);
      throw error;
    }
  }

  /**
   * Retrieve role metadata from an invite
   * Returns the role that this invite will grant when redeemed
   */
  async getInviteRoleMetadata(inviteId: string): Promise<string | null> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const roles = ['admin', 'member', 'reader'];

      // Check each grants_X relation to find which one is set
      for (const role of roles) {
        const response = await this.client.check({
          user: `user:metadata`,
          relation: `grants_${role}`,
          object: `invite:${inviteId}`,
        });

        if (response.allowed) {
          return role;
        }
      }

      return null;
    } catch (error) {
      console.error('Failed to get invite role metadata from OpenFGA:', error);
      return null;
    }
  }

  /**
   * Remove role metadata from an invite
   * Used when cancelling or after redeeming an invite
   */
  async removeInviteRoleMetadata(inviteId: string): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const roles = ['admin', 'member', 'reader'];
      const deletes = roles.map((role) => ({
        user: `user:metadata`,
        relation: `grants_${role}`,
        object: `invite:${inviteId}`,
      }));

      await this.client.write({ deletes });
    } catch (error) {
      // Ignore errors - metadata might not exist
      console.debug('No invite metadata to delete:', error);
    }
  }

  /**
   * Batch write tuples for performance
   *
   * Writes and/or deletes multiple tuples in a single API call.
   * Used for bulk operations like trust score syncs.
   */
  async batchWrite(
    writes: Array<{ user: string; relation: string; object: string }>,
    deletes: Array<{ user: string; relation: string; object: string }>
  ): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      await this.client.write({ writes, deletes });
    } catch (error) {
      console.error('Failed to batch write to OpenFGA:', error);
      throw error;
    }
  }

  /**
   * Read tuples matching a pattern
   *
   * Retrieves all tuples that match the given pattern.
   * Used for querying relationships.
   */
  async readTuples(pattern: {
    user?: string;
    relation?: string;
    object?: string;
  }): Promise<Array<{ key: { user?: string; relation: string; object: string } }>> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const response = await this.client.read({
        // Cast request body due to SDK minor type differences
        tuple_key: pattern,
      } as any);

      return response.tuples || [];
    } catch (error) {
      console.error('Failed to read tuples from OpenFGA:', error);
      return [];
    }
  }

  /**
   * Check permission (simple wrapper)
   *
   * Direct check method for simple permission queries.
   */
  async check(params: {
    user: string;
    relation: string;
    object: string;
  }): Promise<boolean> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      const response = await this.client.check(params);
      return response.allowed || false;
    } catch (error) {
      console.error('OpenFGA check error:', error);
      return false;
    }
  }

  /**
   * Check if user has trust level >= threshold
   *
   * Convenience method for trust-based checks.
   * Checks if user has any trust_level_X relation where X >= threshold.
   */
  async checkTrustLevel(
    userId: string,
    communityId: string,
    minTrustLevel: number
  ): Promise<boolean> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      // Check admin first (admins bypass trust requirements)
      const isAdmin = await this.check({
        user: `user:${userId}`,
        relation: 'admin',
        object: `community:${communityId}`,
      });

      if (isAdmin) {
        return true;
      }

      // Check trust levels from required level up to 100
      const clampedMin = Math.max(0, Math.min(100, Math.floor(minTrustLevel)));

      for (let level = clampedMin; level <= 100; level++) {
        const hasTrust = await this.check({
          user: `user:${userId}`,
          relation: `trust_level_${level}`,
          object: `community:${communityId}`,
        });

        if (hasTrust) {
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('OpenFGA trust level check error:', error);
      return false;
    }
  }

  /**
   * Check if user has explicit permission grant
   *
   * Checks user-based permissions (poll_creator, dispute_handler, etc.)
   */
  async checkUserPermission(
    userId: string,
    communityId: string,
    permission: 'poll_creator' | 'dispute_handler'
  ): Promise<boolean> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      // Check admin first (admins have all permissions)
      const isAdmin = await this.check({
        user: `user:${userId}`,
        relation: 'admin',
        object: `community:${communityId}`,
      });

      if (isAdmin) {
        return true;
      }

      // Check explicit permission
      return await this.check({
        user: `user:${userId}`,
        relation: permission,
        object: `community:${communityId}`,
      });
    } catch (error) {
      console.error('OpenFGA user permission check error:', error);
      return false;
    }
  }

  /**
   * Assign user permission
   *
   * Grants explicit user-based permission (poll_creator, dispute_handler, etc.)
   */
  async assignUserPermission(
    userId: string,
    communityId: string,
    permission: 'poll_creator' | 'dispute_handler'
  ): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      await this.client.write({
        writes: [
          {
            user: `user:${userId}`,
            relation: permission,
            object: `community:${communityId}`,
          },
        ],
      });
    } catch (error) {
      console.error('Failed to assign user permission in OpenFGA:', error);
      throw error;
    }
  }

  /**
   * Revoke user permission
   *
   * Removes explicit user-based permission.
   */
  async revokeUserPermission(
    userId: string,
    communityId: string,
    permission: 'poll_creator' | 'dispute_handler'
  ): Promise<void> {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      await this.client.write({
        deletes: [
          {
            user: `user:${userId}`,
            relation: permission,
            object: `community:${communityId}`,
          },
        ],
      });
    } catch (error) {
      console.error('Failed to revoke user permission from OpenFGA:', error);
      throw error;
    }
  }
}

export const openFGAService = new OpenFGAService();
