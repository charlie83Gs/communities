import { randomBytes } from 'crypto';
import { inviteRepository, type InviteRecord, type UserInviteRecord, type LinkInviteRecord } from '@/repositories/invite.repository';
import { openFGAService } from './openfga.service';
import { AppError } from '@/utils/errors';
import { appUserRepository } from '@/repositories/appUser.repository';

// Valid community roles as defined in OpenFGA authorization model
export type CommunityRole = 'admin' | 'member' | 'reader';

export type CreateUserInviteDto = {
  communityId: string;
  invitedUserId: string;
  role: CommunityRole;
};

export type CreateLinkInviteDto = {
  communityId: string;
  role: CommunityRole;
  title?: string;
  // absolute expiration date
  expiresAt: string;
};

function now(): Date {
  return new Date();
}

function secondsFromNow(sec: number): Date {
  return new Date(Date.now() + sec * 1000);
}

function generateSecret(bytes: number = 24): string {
  return randomBytes(bytes).toString('hex');
}

export class InviteService {
  /**
   * Ensure the caller is community admin using OpenFGA
   */
  private async assertAdmin(userId: string, communityId: string): Promise<void> {
    const role = await openFGAService.getUserRoleForResource(userId, 'communities', communityId);
    if (role !== 'admin') {
      throw new AppError('Forbidden: only community admins can perform this action', 403);
    }
  }

  /**
   * Augment invite with role from OpenFGA metadata
   */
  private async augmentInviteWithRole<T extends InviteRecord>(invite: T): Promise<T & { role?: string }> {
    const role = await openFGAService.getInviteRoleMetadata(invite.id);
    return { ...invite, role: role || undefined };
  }

  /**
   * Augment multiple invites with roles from OpenFGA metadata
   */
  private async augmentInvitesWithRoles<T extends InviteRecord>(invites: T[]): Promise<Array<T & { role?: string }>> {
    return Promise.all(invites.map(invite => this.augmentInviteWithRole(invite)));
  }

  /**
   * No longer needed - app_users.id IS the user ID now
   * Invites already use user IDs directly
   */

  async createUserInvite(dto: CreateUserInviteDto, requesterId: string) {
    console.log(`[InviteService] createUserInvite called: communityId=${dto.communityId}, invitedUserId=${dto.invitedUserId}, role=${dto.role}, requesterId=${requesterId}`);

    // Defensive guard: ensure role is provided and valid
    if (!dto.role) {
      throw new AppError('Role is required', 400);
    }
    const validRoles: CommunityRole[] = ['admin', 'member', 'reader'];
    if (!validRoles.includes(dto.role)) {
      throw new AppError(`Invalid role. Must be one of: ${validRoles.join(', ')}`, 400);
    }

    await this.assertAdmin(requesterId, dto.communityId);

    // Basic guard: prevent self-invite if already has role
    const existingRole = await openFGAService.getUserRoleForResource(dto.invitedUserId, 'communities', dto.communityId);
    if (existingRole === dto.role) {
      throw new AppError('User already has this role in the community', 400);
    }

    // Verify users exist in app_users (IDs are already user IDs)
    const requester = await appUserRepository.findById(requesterId);
    const invited = await appUserRepository.findById(dto.invitedUserId);
    if (!requester) {
      throw new AppError('Requester profile not found', 404);
    }
    if (!invited) {
      throw new AppError('Invited user profile not found', 404);
    }

    console.log(`[InviteService] Creating invite in database...`);
    const invite = await inviteRepository.createUserInvite({
      communityId: dto.communityId,
      invitedUserId: dto.invitedUserId, // user ID
      createdBy: requesterId,   // user ID
    });
    console.log(`[InviteService] Database invite created with ID: ${invite.id}`);

    // Store role metadata in OpenFGA
    try {
      console.log(`[InviteService] Setting role metadata in OpenFGA for invite ${invite.id}: role=${dto.role}`);
      await openFGAService.setInviteRoleMetadata(invite.id, dto.role);
    } catch (error) {
      console.error('Failed to set invite role metadata in OpenFGA:', error);
      throw new AppError('Failed to create invite with role metadata', 500);
    }

    // Create parent_community relationship in OpenFGA for hierarchical permissions
    try {
      await openFGAService.createRelationship('invites', invite.id, 'parent_community', 'communities', dto.communityId);
    } catch (error) {
      console.error('Failed to create invite->community relationship in OpenFGA:', error);
      // non-fatal
    }

    // Return invite with role augmented from OpenFGA
    console.log(`[InviteService] Augmenting invite ${invite.id} with role from OpenFGA...`);
    const augmentedInvite = await this.augmentInviteWithRole(invite);
    console.log(`[InviteService] Returning augmented invite with role: ${augmentedInvite.role}`);
    return augmentedInvite;
  }

  async createLinkInvite(dto: CreateLinkInviteDto, requesterId: string) {
    // Defensive guard: ensure role is provided and valid
    if (!dto.role) {
      throw new AppError('Role is required', 400);
    }
    const validRoles: CommunityRole[] = ['admin', 'member', 'reader'];
    if (!validRoles.includes(dto.role)) {
      throw new AppError(`Invalid role. Must be one of: ${validRoles.join(', ')}`, 400);
    }

    await this.assertAdmin(requesterId, dto.communityId);

    const expiresAt = new Date(dto.expiresAt);
    if (isNaN(expiresAt.getTime())) {
      throw new AppError('expiresAt must be a valid ISO datetime string', 400);
    }
    if (expiresAt <= now()) {
      throw new AppError('expiresAt must be in the future', 400);
    }

    const secret = generateSecret();

    // Verify requester exists in app_users
    const requester = await appUserRepository.findById(requesterId);
    if (!requester) {
      throw new AppError('Requester profile not found', 404);
    }

    const invite = await inviteRepository.createLinkInvite({
      communityId: dto.communityId,
      title: dto.title,
      secret,
      expiresAt,
      createdBy: requesterId, // user ID
    });

    // Store role metadata in OpenFGA
    try {
      await openFGAService.setInviteRoleMetadata(invite.id, dto.role);
    } catch (error) {
      console.error('Failed to set invite role metadata in OpenFGA:', error);
      throw new AppError('Failed to create invite with role metadata', 500);
    }

    // Create parent_community relationship in OpenFGA for hierarchical permissions
    try {
      await openFGAService.createRelationship('invites', invite.id, 'parent_community', 'communities', dto.communityId);
    } catch (error) {
      console.error('Failed to create invite->community relationship in OpenFGA:', error);
      // non-fatal
    }

    // Return invite with role augmented from OpenFGA
    const augmented = await this.augmentInviteWithRole(invite);
    return augmented;
  }

  async cancelInvite(inviteId: string, requesterId: string) {
    const invite = await inviteRepository.findInviteById(inviteId);
    if (!invite) {
      throw new AppError('Invite not found', 404);
    }
    if (invite.status !== 'pending') {
      throw new AppError('Invite is not pending', 400);
    }

    // Only admins of the community (or creator) can cancel
    const isCreator = invite.createdBy === requesterId;
    if (!isCreator) {
      await this.assertAdmin(requesterId, invite.communityId);
    }

    const cancelled = await inviteRepository.cancelInvite(inviteId);
    return cancelled;
  }

  async getPendingUserInvites(communityId: string, requesterId: string) {
    await this.assertAdmin(requesterId, communityId);
    const invites = await inviteRepository.findPendingUserInvitesByCommunity(communityId);
    const withRoles = await this.augmentInvitesWithRoles(invites);
    return withRoles;
  }

  async getPendingInvitesForUser(userId: string, requesterId: string) {
    if (userId !== requesterId) {
      throw new AppError('Forbidden: can only view own invites', 403);
    }

    const invites = await inviteRepository.findPendingUserInvitesByUser(userId);
    const withRoles = await this.augmentInvitesWithRoles(invites);
    return withRoles;
  }

  async getActiveLinkInvites(communityId: string, requesterId: string) {
    await this.assertAdmin(requesterId, communityId);
    const invites = await inviteRepository.findActiveLinkInvitesByCommunity(communityId);
    const withRoles = await this.augmentInvitesWithRoles(invites);
    return withRoles;
  }

  async redeemUserInvite(inviteId: string, userId: string) {
    const invite = await inviteRepository.findUserInviteById(inviteId);
    if (!invite) {
      throw new AppError('Invite not found', 404);
    }
    if (invite.status !== 'pending') {
      throw new AppError('Invite is not pending', 400);
    }

    // Check that the invite is for this user
    if (invite.invitedUserId !== userId) {
      throw new AppError('Forbidden: invite not meant for this user', 403);
    }

    // Get role from OpenFGA metadata
    const role = await openFGAService.getInviteRoleMetadata(invite.id);
    if (!role) {
      throw new AppError('Invite role metadata not found', 500);
    }

    // Assign role via OpenFGA
    await openFGAService.assignRole(userId, 'communities', invite.communityId, role);

    // Clean up role metadata after redemption
    try {
      await openFGAService.removeInviteRoleMetadata(invite.id);
    } catch (error) {
      console.error('Failed to remove invite role metadata:', error);
      // non-fatal
    }

    // Mark redeemed
    const updated = await inviteRepository.markUserInviteRedeemed(invite.id, userId);
    return updated;
  }

  async redeemLinkInviteBySecret(secret: string, userId: string) {
    const invite = await inviteRepository.findBySecret(secret);
    if (!invite) {
      throw new AppError('Invite not found', 404);
    }
    if (invite.status !== 'pending') {
      throw new AppError('Invite is not pending', 400);
    }
    if (!invite.expiresAt) {
      throw new AppError('Invalid invite: missing expiration', 400);
    }
    if (invite.expiresAt.getTime() <= now().getTime()) {
      throw new AppError('Invite has expired', 410);
    }

    // Get role from OpenFGA metadata
    const role = await openFGAService.getInviteRoleMetadata(invite.id);
    if (!role) {
      throw new AppError('Invite role metadata not found', 500);
    }

    // Assign role via OpenFGA
    await openFGAService.assignRole(userId, 'communities', invite.communityId, role);

    // Clean up role metadata after redemption
    try {
      await openFGAService.removeInviteRoleMetadata(invite.id);
    } catch (error) {
      console.error('Failed to remove invite role metadata:', error);
      // non-fatal
    }

    // Mark redeemed
    const updated = await inviteRepository.markLinkInviteRedeemed(invite.id, userId);
    return updated;
  }
}

export const inviteService = new InviteService();
