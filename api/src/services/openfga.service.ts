import { OpenFGARepository } from '../repositories/openfga.repository';
import { initializeOpenFGA } from '../utils/openfga-init';
import {
  BASE_ROLES,
  FEATURE_ROLES as _FEATURE_ROLES,
  TRUST_ROLES as _TRUST_ROLES,
  PERMISSIONS as _PERMISSIONS,
  SUBJECT_TYPES as _SUBJECT_TYPES,
  BaseRole,
  FeatureRole,
  TrustRole as _TrustRole,
  Permission as _Permission,
  SubjectType,
  isBaseRole,
  isFeatureRole,
  isTrustRole,
  isPermission as _isPermission,
  mapResourceType,
  mapActionToPermission,
} from '../config/openfga.constants';

/**
 * OpenFGA Service
 *
 * High-level service for managing permissions based on the role-based schema.
 * This service provides methods for checking permissions, managing roles, and syncing trust levels.
 *
 * Schema Concepts:
 * - BASE ROLES (admin, member): Foundational community membership roles (mutually exclusive)
 * - FEATURE ROLES (forum_manager, pool_creator, etc.): Specific permissions granted by admins
 * - TRUST ROLES (trust_forum_manager, etc.): Auto-granted when trust score >= threshold
 * - PERMISSIONS (can_*): Computed unions of admin + feature_role + trust_role
 *
 * Simplified API:
 * - checkAccess(): Universal permission check
 * - assignRelation() / revokeRelation(): Generic relation management
 * - Specialized helpers for common patterns (base roles, feature roles, trust sync)
 */
export class OpenFGAService {
  private repository: OpenFGARepository | null = null;

  constructor(repository?: OpenFGARepository) {
    this.repository = repository || null;
  }

  /**
   * Initialize OpenFGA
   * Creates store, authorization model, and initializes the repository
   */
  async initialize(): Promise<void> {
    const config = await initializeOpenFGA();
    this.repository = new OpenFGARepository(config.client);
  }

  /**
   * Ensure repository is initialized
   */
  private ensureRepository(): OpenFGARepository {
    if (!this.repository) {
      throw new Error('[OpenFGA Service] Not initialized. Call initialize() first.');
    }
    return this.repository;
  }

  // ========================================
  // CORE PERMISSION CHECKING
  // ========================================

  /**
   * Universal permission/role check
   *
   * Checks if a user has a specific relation on an object.
   *
   * @param userId - User ID
   * @param objectType - Resource type (e.g., 'community', 'wealth')
   * @param objectId - Resource ID
   * @param relation - Relation to check (e.g., 'admin', 'can_read', 'can_manage_forum')
   * @returns True if user has the relation
   *
   * @example
   * // Check permission
   * await checkAccess(userId, 'community', commId, 'can_manage_forum')
   *
   * // Check base role
   * await checkAccess(userId, 'community', commId, 'admin')
   *
   * // Check CRUD action (will map to can_update)
   * await checkAccess(userId, 'community', commId, 'update')
   */
  async checkAccess(
    userId: string,
    objectType: string,
    objectId: string,
    relation: string
  ): Promise<boolean> {
    try {
      // Map action to permission if needed (e.g., 'update' -> 'can_update')
      const mappedRelation = relation.startsWith('can_')
        ? relation
        : mapActionToPermission(relation);

      // Map resource type
      const fgaType = mapResourceType(objectType);

      return await this.ensureRepository().check({
        user: `user:${userId}`,
        relation: mappedRelation,
        object: `${fgaType}:${objectId}`,
      });
    } catch (error) {
      console.error('[OpenFGA Service] Check access error:', error);
      return false;
    }
  }

  /**
   * Use for low-level checks where you need exact control
   */
  async check(params: { user: string; relation: string; object: string }): Promise<boolean> {
    return await this.ensureRepository().check(params);
  }

  /**
   * Get all resource IDs user has access to for a given relation
   *
   * @param userId - User ID
   * @param resourceType - Resource type
   * @param relation - Relation or action to check
   * @returns Array of resource IDs
   *
   * @example
   * // Get all communities user can read
   * const ids = await getAccessibleResourceIds(userId, 'community', 'read')
   */
  async getAccessibleResourceIds(
    userId: string,
    resourceType: string,
    relation: string
  ): Promise<string[]> {
    try {
      const fgaType = mapResourceType(resourceType);
      const mappedRelation = relation.startsWith('can_')
        ? relation
        : mapActionToPermission(relation);

      return await this.ensureRepository().listObjects({
        user: `user:${userId}`,
        relation: mappedRelation,
        type: fgaType,
      });
    } catch (error) {
      console.error('[OpenFGA Service] Failed to list accessible resources:', error);
      return [];
    }
  }

  // ========================================
  // GENERIC RELATION MANAGEMENT
  // ========================================

  /**
   * Assign a relation between subject and object
   *
   * Generic method for assigning any relation type.
   * Handles validation, mutual exclusivity, and idempotency.
   *
   * @param subject - Subject ID (e.g., user ID, community ID)
   * @param subjectType - Type of subject
   * @param relation - Relation to assign
   * @param objectType - Object resource type
   * @param objectId - Object resource ID
   * @param options - Additional options
   *
   * @example
   * // Assign base role (mutually exclusive)
   * await assignRelation(userId, 'user', 'admin', 'community', commId, {
   *   mutuallyExclusive: BASE_ROLES
   * })
   *
   * // Assign feature role
   * await assignRelation(userId, 'user', 'forum_manager', 'community', commId, {
   *   validate: isFeatureRole
   * })
   *
   * // Assign superadmin
   * await assignRelation(userId, 'user', 'superadmin', 'system', 'global')
   *
   * // Create resource relationship
   * await assignRelation(parentId, 'community', 'parent_community', 'wealth', wealthId)
   */
  async assignRelation(
    subject: string,
    subjectType: SubjectType,
    relation: string,
    objectType: string,
    objectId: string,
    options: {
      mutuallyExclusive?: readonly string[];
      validate?: (relation: string) => boolean;
      skipVerification?: boolean;
    } = {}
  ): Promise<void> {
    const fgaObjectType = mapResourceType(objectType);
    const subjectStr = subjectType === 'user' ? `user:${subject}` : `${subjectType}:${subject}`;

    // Validation
    if (options.validate && !options.validate(relation)) {
      throw new Error(`Invalid relation: ${relation}`);
    }

    try {
      console.log(
        `[OpenFGA Service] Assigning relation "${relation}" to ${subjectStr} on ${fgaObjectType}:${objectId}`
      );

      // Handle mutually exclusive relations (e.g., base roles)
      if (options.mutuallyExclusive && options.mutuallyExclusive.length > 0) {
        // Step 1: Read current state to check for conflicts
        const existingTuples = await this.ensureRepository().readTuples({
          user: subjectStr,
          object: `${fgaObjectType}:${objectId}`,
        });

        const conflictingRelations = existingTuples.filter(
          (t) => options.mutuallyExclusive!.includes(t.key.relation) && t.key.relation !== relation
        );

        // Step 2: Remove conflicting relations ONLY if they exist
        // This happens BEFORE adding the new role
        if (conflictingRelations.length > 0) {
          console.log(
            `[OpenFGA Service] Removing ${conflictingRelations.length} conflicting relations before assigning "${relation}" to ${subjectStr} on ${fgaObjectType}:${objectId}`
          );

          await this.ensureRepository().write(
            undefined,
            conflictingRelations.map((t) => ({
              user: t.key.user,
              relation: t.key.relation,
              object: t.key.object,
            }))
          );

          console.log(`[OpenFGA Service] Successfully removed conflicting relations`);
        }

        // Step 3: Write the desired relation (idempotent - won't fail if already exists)
        await this.ensureRepository().write([
          {
            user: subjectStr,
            relation,
            object: `${fgaObjectType}:${objectId}`,
          },
        ]);

        console.log(
          `[OpenFGA Service] Wrote relation "${relation}" to ${subjectStr} on ${fgaObjectType}:${objectId}`
        );

        // Step 4: Verify final state if verification not skipped
        if (!options.skipVerification) {
          const hasRelation = await this.ensureRepository().check({
            user: subjectStr,
            relation: relation,
            object: `${fgaObjectType}:${objectId}`,
          });

          if (!hasRelation) {
            throw new Error(
              `Verification failed: ${subjectStr} does not have relation "${relation}" on ${fgaObjectType}:${objectId}`
            );
          }
        }

        console.log(
          `[OpenFGA Service] Successfully assigned relation "${relation}" to ${subjectStr} on ${fgaObjectType}:${objectId}`
        );
      } else {
        // Simple assignment (no mutual exclusivity)
        await this.ensureRepository().write([
          {
            user: subjectStr,
            relation,
            object: `${fgaObjectType}:${objectId}`,
          },
        ]);

        console.log(
          `[OpenFGA Service] Successfully assigned relation "${relation}" to ${subjectStr} on ${fgaObjectType}:${objectId}`
        );
      }
    } catch (error) {
      console.error(
        `[OpenFGA Service] Failed to assign relation "${relation}" to ${subjectStr} on ${fgaObjectType}:${objectId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Revoke relation(s) between subject and object
   *
   * @param subject - Subject ID
   * @param subjectType - Type of subject
   * @param relation - Relation(s) to revoke (string or array)
   * @param objectType - Object resource type
   * @param objectId - Object resource ID
   *
   * @example
   * // Revoke single relation
   * await revokeRelation(userId, 'user', 'forum_manager', 'community', commId)
   *
   * // Revoke multiple relations
   * await revokeRelation(userId, 'user', ['admin', 'member'], 'community', commId)
   */
  async revokeRelation(
    subject: string,
    subjectType: SubjectType,
    relation: string | string[],
    objectType: string,
    objectId: string
  ): Promise<void> {
    const fgaObjectType = mapResourceType(objectType);
    const subjectStr = subjectType === 'user' ? `user:${subject}` : `${subjectType}:${subject}`;
    const relations = Array.isArray(relation) ? relation : [relation];

    try {
      const deletes = relations.map((r) => ({
        user: subjectStr,
        relation: r,
        object: `${fgaObjectType}:${objectId}`,
      }));

      await this.ensureRepository().write(undefined, deletes);

      console.log(
        `[OpenFGA Service] Successfully revoked relation(s) "${relations.join(', ')}" from ${subjectStr} on ${fgaObjectType}:${objectId}`
      );
    } catch (error) {
      console.error(
        `[OpenFGA Service] Failed to revoke relation(s) "${relations.join(', ')}" from ${subjectStr} on ${fgaObjectType}:${objectId}:`,
        error
      );
      throw error;
    }
  }

  // ========================================
  // BASE ROLE MANAGEMENT (admin, member)
  // ========================================

  /**
   * Assign a base role to a user on a resource
   *
   * Base roles are mutually exclusive - user can only have ONE base role per resource.
   *
   * @param userId - User ID
   * @param resourceType - Resource type
   * @param resourceId - Resource ID
   * @param role - Base role ('admin' or 'member')
   */
  async assignBaseRole(
    userId: string,
    resourceType: string,
    resourceId: string,
    role: BaseRole
  ): Promise<void> {
    if (!isBaseRole(role)) {
      throw new Error(`Invalid base role: ${role}. Must be one of: ${BASE_ROLES.join(', ')}`);
    }

    await this.assignRelation(userId, 'user', role, resourceType, resourceId, {
      mutuallyExclusive: BASE_ROLES,
      validate: isBaseRole,
    });
  }

  /**
   * Remove all base roles from a user on a resource
   *
   * Checks which base roles the user actually has before attempting to delete them.
   * This prevents OpenFGA errors when trying to delete non-existent tuples.
   */
  async removeBaseRole(userId: string, resourceType: string, resourceId: string): Promise<void> {
    // Get all roles the user currently has
    const currentRoles = await this.getUserBaseRole(userId, resourceType, resourceId, {
      returnAll: true,
    });

    // If user has no roles, nothing to do
    if (!currentRoles || !Array.isArray(currentRoles) || currentRoles.length === 0) {
      console.log(
        `[OpenFGA Service] No base roles to remove for user:${userId} on ${resourceType}:${resourceId}`
      );
      return;
    }

    // Only revoke the roles that actually exist
    await this.revokeRelation(userId, 'user', currentRoles, resourceType, resourceId);
  }

  /**
   * Get user's base role for a resource
   *
   * @param userId - User ID
   * @param resourceType - Resource type
   * @param resourceId - Resource ID
   * @param options - Options
   * @returns Single role (highest privilege) or array of roles or null
   *
   * @example
   * // Get single role (highest privilege)
   * const role = await getUserBaseRole(userId, 'community', commId) // 'admin' | 'member' | null
   *
   * // Get all roles (should be 0-1 with current schema)
   * const roles = await getUserBaseRole(userId, 'community', commId, { returnAll: true }) // ['admin']
   */
  async getUserBaseRole(
    userId: string,
    resourceType: string,
    resourceId: string,
    options: { returnAll?: boolean } = {}
  ): Promise<BaseRole | BaseRole[] | null> {
    const fgaType = mapResourceType(resourceType);
    const userRoles: BaseRole[] = [];

    for (const role of BASE_ROLES) {
      try {
        const hasRole = await this.ensureRepository().check({
          user: `user:${userId}`,
          relation: role,
          object: `${fgaType}:${resourceId}`,
        });

        if (hasRole) {
          if (!options.returnAll) {
            return role; // Return first (highest privilege)
          }
          userRoles.push(role);
        }
      } catch (error) {
        console.error(
          `[OpenFGA Service] Failed to check base role ${role} for user ${userId}:`,
          error
        );
      }
    }

    return options.returnAll ? userRoles : null;
  }

  /**
   * Get all users with their base roles for a resource
   *
   * @returns Array of { userId, role } objects
   */
  async getBaseRolesForResource(
    resourceType: string,
    resourceId: string
  ): Promise<{ userId: string; role: BaseRole }[]> {
    const fgaType = mapResourceType(resourceType);
    const userRoles: { userId: string; role: BaseRole }[] = [];

    try {
      for (const role of BASE_ROLES) {
        const tuples = await this.ensureRepository().readTuples({
          object: `${fgaType}:${resourceId}`,
          relation: role,
        });

        for (const tuple of tuples) {
          const userMatch = tuple.key.user?.match(/^user:(.+)$/);
          if (userMatch) {
            const userId = userMatch[1];
            // Filter out special users
            if (userId !== 'metadata') {
              userRoles.push({ userId, role });
            }
          }
        }
      }
    } catch (error) {
      console.error('[OpenFGA Service] Failed to get base roles for resource:', error);
    }

    return userRoles;
  }

  // ========================================
  // FEATURE ROLE MANAGEMENT (forum_manager, etc.)
  // ========================================

  /**
   * Assign a feature role to a user
   *
   * Feature roles grant specific permissions.
   * Users can have MULTIPLE feature roles.
   *
   * @param userId - User ID
   * @param communityId - Community ID
   * @param role - Feature role (e.g., 'forum_manager', 'pool_creator')
   */
  async assignFeatureRole(userId: string, communityId: string, role: FeatureRole): Promise<void> {
    if (!isFeatureRole(role)) {
      throw new Error(`Invalid feature role: ${role}. Must be one of the defined feature roles.`);
    }

    await this.assignRelation(userId, 'user', role, 'community', communityId, {
      validate: isFeatureRole,
      skipVerification: true, // Skip verification for performance (non-mutually-exclusive)
    });
  }

  /**
   * Revoke a feature role from a user
   */
  async revokeFeatureRole(userId: string, communityId: string, role: FeatureRole): Promise<void> {
    await this.revokeRelation(userId, 'user', role, 'community', communityId);
  }

  // ========================================
  // TRUST ROLE SYNCHRONIZATION
  // ========================================

  /**
   * Sync trust roles for a user based on their trust score
   *
   * Trust roles are auto-granted when trust >= threshold.
   * This method should be called whenever a user's trust score changes.
   *
   * @param userId - User ID
   * @param communityId - Community ID
   * @param trustScore - User's current trust score
   * @param thresholds - Map of trust role to minimum trust required
   *
   * @example
   * await syncTrustRoles(userId, commId, 30, {
   *   trust_trust_granter: 15,
   *   trust_wealth_creator: 10,
   *   trust_poll_creator: 15,
   *   trust_forum_manager: 30,
   * })
   */
  async syncTrustRoles(
    userId: string,
    communityId: string,
    trustScore: number,
    thresholds: Record<string, number>
  ): Promise<void> {
    try {
      const writes: Array<{ user: string; relation: string; object: string }> = [];
      const deletes: Array<{ user: string; relation: string; object: string }> = [];

      // Iterate through all possible trust roles
      for (const [trustRole, minTrust] of Object.entries(thresholds)) {
        // Only process trust roles (prefixed with "trust_")
        if (!isTrustRole(trustRole)) {
          continue;
        }

        const shouldHaveRole = trustScore >= minTrust;

        // Read current state
        const hasRole = await this.ensureRepository().check({
          user: `user:${userId}`,
          relation: trustRole,
          object: `community:${communityId}`,
        });

        if (shouldHaveRole && !hasRole) {
          // Grant the trust role
          writes.push({
            user: `user:${userId}`,
            relation: trustRole,
            object: `community:${communityId}`,
          });
        } else if (!shouldHaveRole && hasRole) {
          // Revoke the trust role
          deletes.push({
            user: `user:${userId}`,
            relation: trustRole,
            object: `community:${communityId}`,
          });
        }
      }

      // Batch write changes
      if (writes.length > 0 || deletes.length > 0) {
        await this.ensureRepository().write(
          writes.length > 0 ? writes : undefined,
          deletes.length > 0 ? deletes : undefined
        );
        console.log(
          `[OpenFGA Service] Synced trust roles for user:${userId} on community:${communityId} (trust: ${trustScore}, granted: ${writes.length}, revoked: ${deletes.length})`
        );
      }
    } catch (error) {
      console.error('[OpenFGA Service] Failed to sync trust roles:', error);
      throw error;
    }
  }

  // ========================================
  // INVITE METADATA MANAGEMENT
  // ========================================

  /**
   * Store role metadata for an invite
   *
   * Uses a special "grants_X" relation to indicate what role this invite will grant
   * The 'metadata' user is a special user ID used to store metadata about resources
   */
  async setInviteRoleMetadata(inviteId: string, role: BaseRole): Promise<void> {
    const grantsRelation = `grants_${role}`;
    await this.assignRelation('metadata', 'user', grantsRelation, 'invite', inviteId, {
      skipVerification: true,
    });
  }

  /**
   * Retrieve role metadata from an invite
   *
   * @returns The role that this invite will grant when redeemed
   */
  async getInviteRoleMetadata(inviteId: string): Promise<BaseRole | null> {
    try {
      for (const role of BASE_ROLES) {
        const hasGrant = await this.ensureRepository().check({
          user: `user:metadata`,
          relation: `grants_${role}`,
          object: `invite:${inviteId}`,
        });

        if (hasGrant) {
          return role;
        }
      }

      return null;
    } catch (error) {
      console.error('[OpenFGA Service] Failed to get invite role metadata:', error);
      return null;
    }
  }

  /**
   * Remove role metadata from an invite
   */
  async removeInviteRoleMetadata(inviteId: string): Promise<void> {
    try {
      const deletes = BASE_ROLES.map((role) => ({
        user: `user:metadata`,
        relation: `grants_${role}`,
        object: `invite:${inviteId}`,
      }));

      await this.ensureRepository().write(undefined, deletes);
    } catch (error) {
      // Ignore errors - metadata might not exist
      console.debug('[OpenFGA Service] No invite metadata to delete:', error);
    }
  }

  // ========================================
  // RESOURCE RELATIONSHIPS
  // ========================================

  /**
   * Create relationship between resources
   *
   * @example
   * // Link wealth to community
   * await createRelationship('wealth', wealthId, 'parent_community', 'community', commId)
   */
  async createRelationship(
    childType: string,
    childId: string,
    relation: string,
    parentType: string,
    parentId: string
  ): Promise<void> {
    try {
      const fgaChildType = mapResourceType(childType);
      const fgaParentType = mapResourceType(parentType);

      await this.ensureRepository().write([
        {
          user: `${fgaParentType}:${parentId}`,
          relation: relation,
          object: `${fgaChildType}:${childId}`,
        },
      ]);
    } catch (error) {
      console.error('[OpenFGA Service] Failed to create relationship:', error);
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
    try {
      const fgaChildType = mapResourceType(childType);
      const fgaParentType = mapResourceType(parentType);

      await this.ensureRepository().write(undefined, [
        {
          user: `${fgaParentType}:${parentId}`,
          relation: relation,
          object: `${fgaChildType}:${childId}`,
        },
      ]);
    } catch (error) {
      console.error('[OpenFGA Service] Failed to remove relationship:', error);
    }
  }

  // ========================================
  // LOW-LEVEL UTILITIES
  // ========================================

  /**
   * Batch write tuples for performance
   */
  async batchWrite(
    writes: Array<{ user: string; relation: string; object: string }>,
    deletes: Array<{ user: string; relation: string; object: string }>
  ): Promise<void> {
    try {
      await this.ensureRepository().write(writes, deletes);
    } catch (error) {
      console.error('[OpenFGA Service] Failed to batch write:', error);
      throw error;
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
    return await this.ensureRepository().readTuples(pattern);
  }
}

export const openFGAService = new OpenFGAService();
