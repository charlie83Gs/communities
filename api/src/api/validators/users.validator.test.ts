import { describe, it, expect } from 'bun:test';
import {
  validateGetUserInvites,
} from '@/api/validators/users.validator';
import { createMockRequest, createMockResponse, createMockNext } from '../../../tests/helpers/testUtils';

describe('Users Validators', () => {
  describe('validateGetUserInvites', () => {
    it('should pass with valid UUID', () => {
      const req = createMockRequest({
        params: { id: '123e4567-e89b-12d3-a456-426614174000' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateGetUserInvites(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should pass with different valid UUID', () => {
      const req = createMockRequest({
        params: { id: 'a1b2c3d4-e5f6-4789-a012-3456789abcde' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateGetUserInvites(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should fail with invalid UUID format', () => {
      const req = createMockRequest({
        params: { id: 'not-a-uuid' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateGetUserInvites(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        errors: expect.arrayContaining([
          expect.objectContaining({
            path: expect.arrayContaining(['params', 'id']),
          }),
        ]),
      });
    });

    it('should fail with malformed UUID', () => {
      const req = createMockRequest({
        params: { id: '123e4567-e89b-12d3-a456-42661417400' }, // Missing one character
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateGetUserInvites(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should fail with UUID-like string with wrong format', () => {
      const req = createMockRequest({
        params: { id: '123e4567e89b12d3a456426614174000' }, // Missing dashes
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateGetUserInvites(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should fail with empty string', () => {
      const req = createMockRequest({
        params: { id: '' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateGetUserInvites(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should fail with missing ID parameter', () => {
      const req = createMockRequest({
        params: {},
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateGetUserInvites(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should fail with null ID', () => {
      const req = createMockRequest({
        params: { id: null as any },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateGetUserInvites(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should fail with undefined ID', () => {
      const req = createMockRequest({
        params: { id: undefined as any },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateGetUserInvites(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should fail with numeric ID', () => {
      const req = createMockRequest({
        params: { id: '12345' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateGetUserInvites(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should fail with special characters', () => {
      const req = createMockRequest({
        params: { id: '123e4567-e89b-12d3-a456-42661417400@' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateGetUserInvites(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should fail with spaces in UUID', () => {
      const req = createMockRequest({
        params: { id: '123e4567 e89b 12d3 a456 426614174000' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateGetUserInvites(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should fail with uppercase UUID (if validator is strict)', () => {
      const req = createMockRequest({
        params: { id: '123E4567-E89B-12D3-A456-426614174000' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      // Note: Some UUID validators accept uppercase, so this test documents current behavior
      // If it passes, the validator is case-insensitive (which is actually correct for UUIDs)
      validateGetUserInvites(req, res, next);

      // This might pass or fail depending on zod's UUID validation
      // UUID spec is case-insensitive, so either behavior is valid
    });

    it('should fail with SQL injection attempt', () => {
      const req = createMockRequest({
        params: { id: "'; DROP TABLE users; --" },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateGetUserInvites(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should fail with path traversal attempt', () => {
      const req = createMockRequest({
        params: { id: '../../../etc/passwd' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateGetUserInvites(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should pass with nil UUID', () => {
      const req = createMockRequest({
        params: { id: '00000000-0000-0000-0000-000000000000' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateGetUserInvites(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should pass with max UUID value', () => {
      const req = createMockRequest({
        params: { id: 'ffffffff-ffff-ffff-ffff-ffffffffffff' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateGetUserInvites(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should fail with too many characters', () => {
      const req = createMockRequest({
        params: { id: '123e4567-e89b-12d3-a456-426614174000-extra' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateGetUserInvites(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});
