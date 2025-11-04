import { describe, it, expect } from 'bun:test';
import {
  validateGetEventsForUser,
  validateGetTrustView,
  validateListCommunityTrust,
  validateGetTrustMe,
  validateListMyEventsAllCommunities,
  validateListMyTrustAcrossCommunities,
  validateAwardTrust,
  validateRemoveTrust,
  validateListMyAwards,
  validateListAwardsToUser,
  validateGetTrustHistory,
  validateSetAdminGrant,
  validateGetAdminGrants,
  validateDeleteAdminGrant,
} from '@/api/validators/trust.validator';
import { createMockRequest, createMockResponse, createMockNext } from '../../../tests/helpers/testUtils';

describe('Trust Validators', () => {
  describe('validateGetEventsForUser', () => {
    it('should pass with valid params and query', () => {
      const req = createMockRequest({
        params: { communityId: '123e4567-e89b-12d3-a456-426614174000' },
        query: {
          userId: '223e4567-e89b-12d3-a456-426614174001',
          page: '1',
          limit: '50',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateGetEventsForUser(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should pass with default pagination', () => {
      const req = createMockRequest({
        params: { communityId: '123e4567-e89b-12d3-a456-426614174000' },
        query: { userId: '223e4567-e89b-12d3-a456-426614174001' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateGetEventsForUser(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should fail with invalid communityId', () => {
      const req = createMockRequest({
        params: { communityId: 'not-a-uuid' },
        query: { userId: '223e4567-e89b-12d3-a456-426614174001' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      expect(() => validateGetEventsForUser(req, res, next)).toThrow();
    });

    it('should fail with invalid userId', () => {
      const req = createMockRequest({
        params: { communityId: '123e4567-e89b-12d3-a456-426614174000' },
        query: { userId: 'invalid-uuid' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      expect(() => validateGetEventsForUser(req, res, next)).toThrow();
    });

    it('should fail with missing userId', () => {
      const req = createMockRequest({
        params: { communityId: '123e4567-e89b-12d3-a456-426614174000' },
        query: {},
      });
      const res = createMockResponse();
      const next = createMockNext();

      expect(() => validateGetEventsForUser(req, res, next)).toThrow();
    });

    it('should fail with limit too high', () => {
      const req = createMockRequest({
        params: { communityId: '123e4567-e89b-12d3-a456-426614174000' },
        query: {
          userId: '223e4567-e89b-12d3-a456-426614174001',
          limit: '101',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      expect(() => validateGetEventsForUser(req, res, next)).toThrow();
    });

    it('should fail with zero page', () => {
      const req = createMockRequest({
        params: { communityId: '123e4567-e89b-12d3-a456-426614174000' },
        query: {
          userId: '223e4567-e89b-12d3-a456-426614174001',
          page: '0',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      expect(() => validateGetEventsForUser(req, res, next)).toThrow();
    });
  });

  describe('validateGetTrustView', () => {
    it('should pass with valid IDs', () => {
      const req = createMockRequest({
        params: {
          communityId: '123e4567-e89b-12d3-a456-426614174000',
          userId: '223e4567-e89b-12d3-a456-426614174001',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateGetTrustView(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should fail with invalid communityId', () => {
      const req = createMockRequest({
        params: {
          communityId: 'invalid',
          userId: '223e4567-e89b-12d3-a456-426614174001',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      expect(() => validateGetTrustView(req, res, next)).toThrow();
    });

    it('should fail with invalid userId', () => {
      const req = createMockRequest({
        params: {
          communityId: '123e4567-e89b-12d3-a456-426614174000',
          userId: 'not-uuid',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      expect(() => validateGetTrustView(req, res, next)).toThrow();
    });

    it('should fail with missing params', () => {
      const req = createMockRequest({
        params: {},
      });
      const res = createMockResponse();
      const next = createMockNext();

      expect(() => validateGetTrustView(req, res, next)).toThrow();
    });
  });

  describe('validateListCommunityTrust', () => {
    it('should pass with valid params', () => {
      const req = createMockRequest({
        params: { communityId: '123e4567-e89b-12d3-a456-426614174000' },
        query: { page: '1', limit: '50' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateListCommunityTrust(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should pass with default pagination', () => {
      const req = createMockRequest({
        params: { communityId: '123e4567-e89b-12d3-a456-426614174000' },
        query: {},
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateListCommunityTrust(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should fail with invalid communityId', () => {
      const req = createMockRequest({
        params: { communityId: 'invalid' },
        query: {},
      });
      const res = createMockResponse();
      const next = createMockNext();

      expect(() => validateListCommunityTrust(req, res, next)).toThrow();
    });

    it('should fail with negative page', () => {
      const req = createMockRequest({
        params: { communityId: '123e4567-e89b-12d3-a456-426614174000' },
        query: { page: '-1' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      expect(() => validateListCommunityTrust(req, res, next)).toThrow();
    });
  });

  describe('validateGetTrustMe', () => {
    it('should pass with valid communityId', () => {
      const req = createMockRequest({
        params: { communityId: '123e4567-e89b-12d3-a456-426614174000' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateGetTrustMe(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should fail with invalid communityId', () => {
      const req = createMockRequest({
        params: { communityId: 'not-a-uuid' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      expect(() => validateGetTrustMe(req, res, next)).toThrow();
    });

    it('should fail with missing communityId', () => {
      const req = createMockRequest({
        params: {},
      });
      const res = createMockResponse();
      const next = createMockNext();

      expect(() => validateGetTrustMe(req, res, next)).toThrow();
    });
  });

  describe('validateListMyEventsAllCommunities', () => {
    it('should pass with pagination', () => {
      const req = createMockRequest({
        query: { page: '2', limit: '25' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateListMyEventsAllCommunities(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should pass with no query params', () => {
      const req = createMockRequest({
        query: {},
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateListMyEventsAllCommunities(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should fail with limit exceeding maximum', () => {
      const req = createMockRequest({
        query: { limit: '150' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      expect(() => validateListMyEventsAllCommunities(req, res, next)).toThrow();
    });
  });

  describe('validateListMyTrustAcrossCommunities', () => {
    it('should pass with pagination', () => {
      const req = createMockRequest({
        query: { page: '1', limit: '30' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateListMyTrustAcrossCommunities(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should pass with no params', () => {
      const req = createMockRequest({
        query: {},
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateListMyTrustAcrossCommunities(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should fail with zero page', () => {
      const req = createMockRequest({
        query: { page: '0' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      expect(() => validateListMyTrustAcrossCommunities(req, res, next)).toThrow();
    });
  });

  describe('validateAwardTrust', () => {
    it('should pass with valid IDs', () => {
      const req = createMockRequest({
        params: {
          communityId: '123e4567-e89b-12d3-a456-426614174000',
          toUserId: '223e4567-e89b-12d3-a456-426614174001',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateAwardTrust(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should fail with invalid communityId', () => {
      const req = createMockRequest({
        params: {
          communityId: 'invalid-uuid',
          toUserId: '223e4567-e89b-12d3-a456-426614174001',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      expect(() => validateAwardTrust(req, res, next)).toThrow();
    });

    it('should fail with invalid toUserId', () => {
      const req = createMockRequest({
        params: {
          communityId: '123e4567-e89b-12d3-a456-426614174000',
          toUserId: 'not-valid',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      expect(() => validateAwardTrust(req, res, next)).toThrow();
    });

    it('should fail with missing params', () => {
      const req = createMockRequest({
        params: {},
      });
      const res = createMockResponse();
      const next = createMockNext();

      expect(() => validateAwardTrust(req, res, next)).toThrow();
    });
  });

  describe('validateRemoveTrust', () => {
    it('should pass with valid IDs', () => {
      const req = createMockRequest({
        params: {
          communityId: '123e4567-e89b-12d3-a456-426614174000',
          toUserId: '223e4567-e89b-12d3-a456-426614174001',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateRemoveTrust(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should fail with invalid communityId', () => {
      const req = createMockRequest({
        params: {
          communityId: 'bad-id',
          toUserId: '223e4567-e89b-12d3-a456-426614174001',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      expect(() => validateRemoveTrust(req, res, next)).toThrow();
    });

    it('should fail with invalid toUserId', () => {
      const req = createMockRequest({
        params: {
          communityId: '123e4567-e89b-12d3-a456-426614174000',
          toUserId: '123',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      expect(() => validateRemoveTrust(req, res, next)).toThrow();
    });
  });

  describe('validateListMyAwards', () => {
    it('should pass with valid communityId', () => {
      const req = createMockRequest({
        params: { communityId: '123e4567-e89b-12d3-a456-426614174000' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateListMyAwards(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should fail with invalid communityId', () => {
      const req = createMockRequest({
        params: { communityId: 'invalid' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      expect(() => validateListMyAwards(req, res, next)).toThrow();
    });
  });

  describe('validateListAwardsToUser', () => {
    it('should pass with valid IDs', () => {
      const req = createMockRequest({
        params: {
          communityId: '123e4567-e89b-12d3-a456-426614174000',
          userId: '223e4567-e89b-12d3-a456-426614174001',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateListAwardsToUser(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should fail with invalid communityId', () => {
      const req = createMockRequest({
        params: {
          communityId: 'bad-uuid',
          userId: '223e4567-e89b-12d3-a456-426614174001',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      expect(() => validateListAwardsToUser(req, res, next)).toThrow();
    });

    it('should fail with invalid userId', () => {
      const req = createMockRequest({
        params: {
          communityId: '123e4567-e89b-12d3-a456-426614174000',
          userId: 'not-uuid',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      expect(() => validateListAwardsToUser(req, res, next)).toThrow();
    });
  });

  describe('validateGetTrustHistory', () => {
    it('should pass with valid params and query', () => {
      const req = createMockRequest({
        params: {
          communityId: '123e4567-e89b-12d3-a456-426614174000',
          userId: '223e4567-e89b-12d3-a456-426614174001',
        },
        query: { page: '1', limit: '50' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateGetTrustHistory(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should pass with default pagination', () => {
      const req = createMockRequest({
        params: {
          communityId: '123e4567-e89b-12d3-a456-426614174000',
          userId: '223e4567-e89b-12d3-a456-426614174001',
        },
        query: {},
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateGetTrustHistory(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should fail with invalid communityId', () => {
      const req = createMockRequest({
        params: {
          communityId: 'invalid',
          userId: '223e4567-e89b-12d3-a456-426614174001',
        },
        query: {},
      });
      const res = createMockResponse();
      const next = createMockNext();

      expect(() => validateGetTrustHistory(req, res, next)).toThrow();
    });

    it('should fail with invalid userId', () => {
      const req = createMockRequest({
        params: {
          communityId: '123e4567-e89b-12d3-a456-426614174000',
          userId: 'bad-id',
        },
        query: {},
      });
      const res = createMockResponse();
      const next = createMockNext();

      expect(() => validateGetTrustHistory(req, res, next)).toThrow();
    });

    it('should fail with limit exceeding max', () => {
      const req = createMockRequest({
        params: {
          communityId: '123e4567-e89b-12d3-a456-426614174000',
          userId: '223e4567-e89b-12d3-a456-426614174001',
        },
        query: { limit: '150' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      expect(() => validateGetTrustHistory(req, res, next)).toThrow();
    });
  });

  describe('validateSetAdminGrant', () => {
    it('should pass with valid params and body', () => {
      const req = createMockRequest({
        params: {
          communityId: '123e4567-e89b-12d3-a456-426614174000',
          toUserId: '223e4567-e89b-12d3-a456-426614174001',
        },
        body: { amount: 10 },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateSetAdminGrant(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should pass with zero amount', () => {
      const req = createMockRequest({
        params: {
          communityId: '123e4567-e89b-12d3-a456-426614174000',
          toUserId: '223e4567-e89b-12d3-a456-426614174001',
        },
        body: { amount: 0 },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateSetAdminGrant(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should fail with negative amount', () => {
      const req = createMockRequest({
        params: {
          communityId: '123e4567-e89b-12d3-a456-426614174000',
          toUserId: '223e4567-e89b-12d3-a456-426614174001',
        },
        body: { amount: -5 },
      });
      const res = createMockResponse();
      const next = createMockNext();

      expect(() => validateSetAdminGrant(req, res, next)).toThrow();
    });

    it('should fail with missing amount', () => {
      const req = createMockRequest({
        params: {
          communityId: '123e4567-e89b-12d3-a456-426614174000',
          toUserId: '223e4567-e89b-12d3-a456-426614174001',
        },
        body: {},
      });
      const res = createMockResponse();
      const next = createMockNext();

      expect(() => validateSetAdminGrant(req, res, next)).toThrow();
    });

    it('should fail with decimal amount', () => {
      const req = createMockRequest({
        params: {
          communityId: '123e4567-e89b-12d3-a456-426614174000',
          toUserId: '223e4567-e89b-12d3-a456-426614174001',
        },
        body: { amount: 10.5 },
      });
      const res = createMockResponse();
      const next = createMockNext();

      expect(() => validateSetAdminGrant(req, res, next)).toThrow();
    });

    it('should fail with invalid communityId', () => {
      const req = createMockRequest({
        params: {
          communityId: 'not-uuid',
          toUserId: '223e4567-e89b-12d3-a456-426614174001',
        },
        body: { amount: 10 },
      });
      const res = createMockResponse();
      const next = createMockNext();

      expect(() => validateSetAdminGrant(req, res, next)).toThrow();
    });

    it('should fail with invalid toUserId', () => {
      const req = createMockRequest({
        params: {
          communityId: '123e4567-e89b-12d3-a456-426614174000',
          toUserId: 'invalid',
        },
        body: { amount: 10 },
      });
      const res = createMockResponse();
      const next = createMockNext();

      expect(() => validateSetAdminGrant(req, res, next)).toThrow();
    });
  });

  describe('validateGetAdminGrants', () => {
    it('should pass with valid communityId', () => {
      const req = createMockRequest({
        params: { communityId: '123e4567-e89b-12d3-a456-426614174000' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateGetAdminGrants(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should fail with invalid communityId', () => {
      const req = createMockRequest({
        params: { communityId: 'not-a-uuid' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      expect(() => validateGetAdminGrants(req, res, next)).toThrow();
    });

    it('should fail with missing communityId', () => {
      const req = createMockRequest({
        params: {},
      });
      const res = createMockResponse();
      const next = createMockNext();

      expect(() => validateGetAdminGrants(req, res, next)).toThrow();
    });
  });

  describe('validateDeleteAdminGrant', () => {
    it('should pass with valid IDs', () => {
      const req = createMockRequest({
        params: {
          communityId: '123e4567-e89b-12d3-a456-426614174000',
          toUserId: '223e4567-e89b-12d3-a456-426614174001',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateDeleteAdminGrant(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should fail with invalid communityId', () => {
      const req = createMockRequest({
        params: {
          communityId: 'invalid-id',
          toUserId: '223e4567-e89b-12d3-a456-426614174001',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      expect(() => validateDeleteAdminGrant(req, res, next)).toThrow();
    });

    it('should fail with invalid toUserId', () => {
      const req = createMockRequest({
        params: {
          communityId: '123e4567-e89b-12d3-a456-426614174000',
          toUserId: 'bad-uuid',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      expect(() => validateDeleteAdminGrant(req, res, next)).toThrow();
    });

    it('should fail with missing params', () => {
      const req = createMockRequest({
        params: {},
      });
      const res = createMockResponse();
      const next = createMockNext();

      expect(() => validateDeleteAdminGrant(req, res, next)).toThrow();
    });
  });
});
