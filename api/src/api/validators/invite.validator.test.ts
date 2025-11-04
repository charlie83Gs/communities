import { describe, test, expect, mock } from 'bun:test';
import { createUserInviteSchema, createLinkInviteSchema, validateCreateUserInvite } from '@/api/validators/invite.validator';
import type { Request, Response, NextFunction } from 'express';

describe('Invite Validators', () => {
  describe('createUserInviteSchema', () => {
    test('should accept valid user invite with member role', () => {
      const validRequest = {
        params: { communityId: '123e4567-e89b-12d3-a456-426614174000' },
        body: {
          invitedUserId: '123e4567-e89b-12d3-a456-426614174001',
          role: 'member',
        },
      };

      const result = createUserInviteSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    test('should accept valid user invite with admin role', () => {
      const validRequest = {
        params: { communityId: '123e4567-e89b-12d3-a456-426614174000' },
        body: {
          invitedUserId: '123e4567-e89b-12d3-a456-426614174001',
          role: 'admin',
        },
      };

      const result = createUserInviteSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    test('should accept valid user invite with reader role', () => {
      const validRequest = {
        params: { communityId: '123e4567-e89b-12d3-a456-426614174000' },
        body: {
          invitedUserId: '123e4567-e89b-12d3-a456-426614174001',
          role: 'reader',
        },
      };

      const result = createUserInviteSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    test('should reject user invite without role field', () => {
      const invalidRequest = {
        params: { communityId: '123e4567-e89b-12d3-a456-426614174000' },
        body: {
          invitedUserId: '123e4567-e89b-12d3-a456-426614174001',
        },
      };

      const result = createUserInviteSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0);
        // Verify the error is about the role field
        const roleError = result.error.issues.find(issue => issue.path.includes('role'));
        expect(roleError).toBeDefined();
      }
    });

    test('should reject user invite with invalid role', () => {
      const invalidRequest = {
        params: { communityId: '123e4567-e89b-12d3-a456-426614174000' },
        body: {
          invitedUserId: '123e4567-e89b-12d3-a456-426614174001',
          role: 'superuser',
        },
      };

      const result = createUserInviteSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0);
        // Verify the error is about the role field and mentions the expected values
        const roleError = result.error.issues.find(issue => issue.path.includes('role'));
        expect(roleError).toBeDefined();
        expect(roleError?.message).toMatch(/admin|member|reader/);
      }
    });

    test('should reject user invite with empty role', () => {
      const invalidRequest = {
        params: { communityId: '123e4567-e89b-12d3-a456-426614174000' },
        body: {
          invitedUserId: '123e4567-e89b-12d3-a456-426614174001',
          role: '',
        },
      };

      const result = createUserInviteSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0);
        // Verify the error is about the role field
        const roleError = result.error.issues.find(issue => issue.path.includes('role'));
        expect(roleError).toBeDefined();
      }
    });

    test('should reject user invite with null role', () => {
      const invalidRequest = {
        params: { communityId: '123e4567-e89b-12d3-a456-426614174000' },
        body: {
          invitedUserId: '123e4567-e89b-12d3-a456-426614174001',
          role: null,
        },
      };

      const result = createUserInviteSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
    });
  });

  describe('createLinkInviteSchema', () => {
    test('should accept valid link invite with member role', () => {
      const validRequest = {
        params: { communityId: '123e4567-e89b-12d3-a456-426614174000' },
        body: {
          role: 'member',
          title: 'Test Invite',
          expiresAt: '2025-12-31T23:59:59Z',
        },
      };

      const result = createLinkInviteSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    test('should accept valid link invite with admin role', () => {
      const validRequest = {
        params: { communityId: '123e4567-e89b-12d3-a456-426614174000' },
        body: {
          role: 'admin',
          expiresAt: '2025-12-31T23:59:59Z',
        },
      };

      const result = createLinkInviteSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    test('should accept valid link invite with reader role', () => {
      const validRequest = {
        params: { communityId: '123e4567-e89b-12d3-a456-426614174000' },
        body: {
          role: 'reader',
          expiresAt: '2025-12-31T23:59:59Z',
        },
      };

      const result = createLinkInviteSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    test('should reject link invite without role field', () => {
      const invalidRequest = {
        params: { communityId: '123e4567-e89b-12d3-a456-426614174000' },
        body: {
          title: 'Test Invite',
          expiresAt: '2025-12-31T23:59:59Z',
        },
      };

      const result = createLinkInviteSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0);
        // Verify the error is about the role field
        const roleError = result.error.issues.find(issue => issue.path.includes('role'));
        expect(roleError).toBeDefined();
      }
    });

    test('should reject link invite with invalid role', () => {
      const invalidRequest = {
        params: { communityId: '123e4567-e89b-12d3-a456-426614174000' },
        body: {
          role: 'invalid_role',
          expiresAt: '2025-12-31T23:59:59Z',
        },
      };

      const result = createLinkInviteSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0);
        // Verify the error is about the role field and mentions the expected values
        const roleError = result.error.issues.find(issue => issue.path.includes('role'));
        expect(roleError).toBeDefined();
        expect(roleError?.message).toMatch(/admin|member|reader/);
      }
    });

    test('should reject link invite with empty role', () => {
      const invalidRequest = {
        params: { communityId: '123e4567-e89b-12d3-a456-426614174000' },
        body: {
          role: '',
          expiresAt: '2025-12-31T23:59:59Z',
        },
      };

      const result = createLinkInviteSchema.safeParse(invalidRequest);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues.length).toBeGreaterThan(0);
        // Verify the error is about the role field
        const roleError = result.error.issues.find(issue => issue.path.includes('role'));
        expect(roleError).toBeDefined();
      }
    });
  });

  describe('validateCreateUserInvite middleware', () => {
    test('should call next() when validation passes', () => {
      const req = {
        params: { communityId: '123e4567-e89b-12d3-a456-426614174000' },
        body: {
          invitedUserId: '123e4567-e89b-12d3-a456-426614174001',
          role: 'member',
        },
      } as unknown as Request;

      const res = {
        status: mock(() => res),
        json: mock(() => res),
      } as unknown as Response;

      const next = mock(() => {}) as unknown as NextFunction;

      validateCreateUserInvite(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    test('should return 400 when role is missing', () => {
      const req = {
        params: { communityId: '123e4567-e89b-12d3-a456-426614174000' },
        body: {
          invitedUserId: '123e4567-e89b-12d3-a456-426614174001',
          // role is missing
        },
      } as unknown as Request;

      const jsonMock = mock(() => res);
      const statusMock = mock(() => res);
      const res = {
        status: statusMock,
        json: jsonMock,
      } as unknown as Response;

      const next = mock(() => {}) as unknown as NextFunction;

      validateCreateUserInvite(req, res, next);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    test('should return 400 when role is invalid', () => {
      const req = {
        params: { communityId: '123e4567-e89b-12d3-a456-426614174000' },
        body: {
          invitedUserId: '123e4567-e89b-12d3-a456-426614174001',
          role: 'invalid_role',
        },
      } as unknown as Request;

      const jsonMock = mock(() => res);
      const statusMock = mock(() => res);
      const res = {
        status: statusMock,
        json: jsonMock,
      } as unknown as Response;

      const next = mock(() => {}) as unknown as NextFunction;

      validateCreateUserInvite(req, res, next);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });
  });
});
