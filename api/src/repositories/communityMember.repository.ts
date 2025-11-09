import { openFGAService as realOpenFGAService } from '../services/openfga.service';

/**
 * CommunityMemberRepository
 *
 * This repository manages community memberships using OpenFGA as the single source of truth.
 * All role assignments and checks are performed via OpenFGA.
 */
export class CommunityMemberRepository {
  private openFGAService: any;

  constructor(openFGAService: any) {
    this.openFGAService = openFGAService;
  }

  /**
   * Add a member to a community with a specific role (admin or member)
   */
  async addMember(communityId: string, userId: string, role: 'member' | 'admin' = 'member') {
    // Use the new assignBaseRole method
    await this.openFGAService.assignBaseRole(userId, 'community', communityId, role);

    // Return a simple membership object for compatibility
    return {
      userId,
      resourceType: 'communities' as const,
      resourceId: communityId,
      role,
    };
  }

  /**
   * Find all members of a community
   * Returns user IDs and their roles from OpenFGA
   */
  async findByCommunity(communityId: string) {
    const rolesData = await this.openFGAService.getBaseRolesForResource('community', communityId);

    return rolesData.map((item: { userId: string; role: string }) => ({
      userId: item.userId,
      resourceType: 'communities' as const,
      resourceId: communityId,
      role: item.role,
    }));
  }

  /**
   * Find all communities where a user is a member
   * Returns community IDs where user has any role
   */
  async findByUser(userId: string) {
    // Get all communities where user has read access (covers all roles)
    const communityIds = await this.openFGAService.getAccessibleResourceIds(
      userId,
      'community',
      'read'
    );

    return communityIds.map((communityId: string) => ({
      userId,
      resourceType: 'communities' as const,
      resourceId: communityId,
      role: 'member', // Default for now; could be enhanced to fetch actual role
    }));
  }

  /**
   * Update a user's role in a community
   */
  async updateRole(communityId: string, userId: string, role: 'member' | 'admin') {
    await this.openFGAService.assignBaseRole(userId, 'community', communityId, role);

    return {
      userId,
      resourceType: 'communities' as const,
      resourceId: communityId,
      role,
    };
  }

  /**
   * Remove a member from a community
   */
  async removeMember(communityId: string, userId: string) {
    const currentRole = await this.getUserRole(communityId, userId);

    await this.openFGAService.removeBaseRole(userId, 'community', communityId);

    return {
      userId,
      resourceType: 'communities' as const,
      resourceId: communityId,
      role: currentRole,
    };
  }

  /**
   * Check if a user is a member of a community (has any role)
   */
  async isMember(communityId: string, userId: string) {
    const role = await this.getUserRole(communityId, userId);
    return !!role;
  }

  /**
   * Get a user's role in a community
   */
  async getUserRole(communityId: string, userId: string) {
    return await this.openFGAService.getUserBaseRole(userId, 'community', communityId);
  }

  /**
   * Get all roles for a user in a community
   * Note: In the new model, users have ONE base role (admin or member)
   */
  async getUserRoles(communityId: string, userId: string): Promise<string[]> {
    const role = await this.openFGAService.getUserBaseRole(userId, 'community', communityId, {
      returnAll: true,
    });
    return Array.isArray(role) ? role : role ? [role] : [];
  }

  /**
   * Check if a user is an admin of a community
   */
  async isAdmin(communityId: string, userId: string) {
    const role = await this.getUserRole(communityId, userId);
    return role === 'admin';
  }
}

// Default instance for production code paths
export const communityMemberRepository = new CommunityMemberRepository(realOpenFGAService);
