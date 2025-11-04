import { describe, test, expect, beforeAll, afterAll } from 'bun:test';
import { inviteService } from '@/services/invite.service';
import { AppError } from '@/utils/errors';

/**
 * Integration test for invite validation bug fix
 *
 * This test verifies that the invite system properly validates
 * and rejects requests without the required 'role' field, preventing
 * the "Invite role metadata not found" error during redemption.
 *
 * Bug: Invites were being created without role metadata, causing
 * redemption failures with "Invite role metadata not found" error.
 *
 * Fix: Added defensive guards in service layer to reject undefined
 * or invalid role values before invite creation.
 */
describe('Invite Validation Integration', () => {
  describe('User Invite Validation', () => {
    test('should reject invite creation with undefined role', async () => {
      // Attempt to create invite without role field
      await expect(
        inviteService.createUserInvite(
          {
            communityId: '123e4567-e89b-12d3-a456-426614174000',
            invitedUserId: '123e4567-e89b-12d3-a456-426614174001',
            role: undefined as any, // Simulating missing role
          },
          'admin-user-id'
        )
      ).rejects.toThrow('Role is required');
    });

    test('should reject invite creation with null role', async () => {
      // Attempt to create invite with null role
      await expect(
        inviteService.createUserInvite(
          {
            communityId: '123e4567-e89b-12d3-a456-426614174000',
            invitedUserId: '123e4567-e89b-12d3-a456-426614174001',
            role: null as any, // Simulating null role
          },
          'admin-user-id'
        )
      ).rejects.toThrow('Role is required');
    });

    test('should reject invite creation with empty string role', async () => {
      // Attempt to create invite with empty role
      await expect(
        inviteService.createUserInvite(
          {
            communityId: '123e4567-e89b-12d3-a456-426614174000',
            invitedUserId: '123e4567-e89b-12d3-a456-426614174001',
            role: '' as any, // Simulating empty role
          },
          'admin-user-id'
        )
      ).rejects.toThrow('Role is required');
    });

    test('should reject invite creation with invalid role', async () => {
      // Attempt to create invite with invalid role value
      await expect(
        inviteService.createUserInvite(
          {
            communityId: '123e4567-e89b-12d3-a456-426614174000',
            invitedUserId: '123e4567-e89b-12d3-a456-426614174001',
            role: 'superuser' as any, // Invalid role
          },
          'admin-user-id'
        )
      ).rejects.toThrow('Invalid role. Must be one of: admin, member, reader');
    });

    test('should reject invite creation with invalid role type', async () => {
      // Attempt to create invite with wrong type
      await expect(
        inviteService.createUserInvite(
          {
            communityId: '123e4567-e89b-12d3-a456-426614174000',
            invitedUserId: '123e4567-e89b-12d3-a456-426614174001',
            role: 123 as any, // Number instead of string
          },
          'admin-user-id'
        )
      ).rejects.toThrow('Invalid role. Must be one of: admin, member, reader');
    });
  });

  describe('Link Invite Validation', () => {
    test('should reject link invite creation with undefined role', async () => {
      // Attempt to create link invite without role field
      await expect(
        inviteService.createLinkInvite(
          {
            communityId: '123e4567-e89b-12d3-a456-426614174000',
            role: undefined as any, // Simulating missing role
            expiresAt: new Date(Date.now() + 86400000).toISOString(),
          },
          'admin-user-id'
        )
      ).rejects.toThrow('Role is required');
    });

    test('should reject link invite creation with null role', async () => {
      // Attempt to create link invite with null role
      await expect(
        inviteService.createLinkInvite(
          {
            communityId: '123e4567-e89b-12d3-a456-426614174000',
            role: null as any, // Simulating null role
            expiresAt: new Date(Date.now() + 86400000).toISOString(),
          },
          'admin-user-id'
        )
      ).rejects.toThrow('Role is required');
    });

    test('should reject link invite creation with invalid role', async () => {
      // Attempt to create link invite with invalid role value
      await expect(
        inviteService.createLinkInvite(
          {
            communityId: '123e4567-e89b-12d3-a456-426614174000',
            role: 'invalid_role' as any, // Invalid role
            expiresAt: new Date(Date.now() + 86400000).toISOString(),
          },
          'admin-user-id'
        )
      ).rejects.toThrow('Invalid role. Must be one of: admin, member, reader');
    });
  });

  describe('Valid Role Values', () => {
    const validRoles = ['admin', 'member', 'reader'] as const;

    // Note: These tests will fail at authentication/authorization layer
    // in real execution, but they verify the role validation logic passes
    test.each(validRoles)('should accept %s as valid role', async (role) => {
      // This should fail at auth layer, not role validation
      try {
        await inviteService.createUserInvite(
          {
            communityId: '123e4567-e89b-12d3-a456-426614174000',
            invitedUserId: '123e4567-e89b-12d3-a456-426614174001',
            role: role,
          },
          'non-admin-user-id'
        );
      } catch (error) {
        // Should fail for permission reasons, not role validation
        if (error instanceof AppError) {
          expect(error.message).not.toContain('Role is required');
          expect(error.message).not.toContain('Invalid role');
        }
      }
    });
  });

  describe('Error Message Quality', () => {
    test('should provide clear error message for missing role', async () => {
      try {
        await inviteService.createUserInvite(
          {
            communityId: '123e4567-e89b-12d3-a456-426614174000',
            invitedUserId: '123e4567-e89b-12d3-a456-426614174001',
            role: undefined as any,
          },
          'admin-user-id'
        );
        expect.unreachable('Should have thrown error');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        if (error instanceof AppError) {
          expect(error.message).toBe('Role is required');
          expect(error.statusCode).toBe(400);
        }
      }
    });

    test('should provide clear error message for invalid role', async () => {
      try {
        await inviteService.createUserInvite(
          {
            communityId: '123e4567-e89b-12d3-a456-426614174000',
            invitedUserId: '123e4567-e89b-12d3-a456-426614174001',
            role: 'invalid_role' as any,
          },
          'admin-user-id'
        );
        expect.unreachable('Should have thrown error');
      } catch (error) {
        expect(error).toBeInstanceOf(AppError);
        if (error instanceof AppError) {
          expect(error.message).toContain('Invalid role');
          expect(error.message).toContain('admin');
          expect(error.message).toContain('member');
          expect(error.message).toContain('reader');
          expect(error.statusCode).toBe(400);
        }
      }
    });
  });
});
