import { describe, it, expect } from 'bun:test';
import {
  validateCreateCommunity,
  validateUpdateCommunity,
  validateGetCommunity,
  validateListCommunities,
  validateGetMembers,
  validateRemoveMember,
  validateUpdateMemberRole,
  validateGetMemberById,
  validateCommunitySearchQuery,
} from '@/api/validators/community.validator';
import { createMockRequest, createMockResponse, createMockNext } from '../../../tests/helpers/testUtils';

describe('Community Validators', () => {
  describe('validateCreateCommunity', () => {
    it('should pass with valid community data (number type)', () => {
      const req = createMockRequest({
        body: {
          name: 'Test Community',
          description: 'A test community',
          minTrustToAwardTrust: { type: 'number', value: 15 },
          minTrustForWealth: { type: 'number', value: 10 },
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateCreateCommunity(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should pass with valid community data (level type)', () => {
      const req = createMockRequest({
        body: {
          name: 'Test Community',
          description: 'A test community',
          minTrustToAwardTrust: { type: 'level', value: '123e4567-e89b-12d3-a456-426614174000' },
          minTrustForWealth: { type: 'level', value: '223e4567-e89b-12d3-a456-426614174001' },
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateCreateCommunity(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should fail with missing name', () => {
      const req = createMockRequest({
        body: {
          description: 'A test community',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateCreateCommunity(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        errors: expect.arrayContaining([
          expect.objectContaining({
            path: expect.arrayContaining(['body', 'name']),
          }),
        ]),
      });
    });

    it('should fail with name too long', () => {
      const req = createMockRequest({
        body: {
          name: 'a'.repeat(101),
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateCreateCommunity(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should pass with optional trust configuration', () => {
      const req = createMockRequest({
        body: {
          name: 'Test Community',
          trustTitles: {
            titles: [
              { name: 'Novice', minScore: 0 },
              { name: 'Expert', minScore: 50 },
            ],
          },
          minTrustForDisputes: { type: 'number', value: 20 },
          minTrustForPolls: { type: 'number', value: 15 },
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateCreateCommunity(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should fail with invalid trust configuration (negative value)', () => {
      const req = createMockRequest({
        body: {
          name: 'Test Community',
          minTrustToAwardTrust: { type: 'number', value: -5 }, // Negative value
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateCreateCommunity(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should fail with invalid trust configuration (invalid UUID for level)', () => {
      const req = createMockRequest({
        body: {
          name: 'Test Community',
          minTrustToAwardTrust: { type: 'level', value: 'not-a-uuid' },
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateCreateCommunity(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should fail with invalid trust requirement (missing type)', () => {
      const req = createMockRequest({
        body: {
          name: 'Test Community',
          minTrustToAwardTrust: { value: 15 }, // Missing type field
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateCreateCommunity(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should fail with invalid trust requirement (plain number)', () => {
      const req = createMockRequest({
        body: {
          name: 'Test Community',
          minTrustToAwardTrust: 15, // Plain number instead of object
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateCreateCommunity(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should pass with valid dispute handling configuration', () => {
      const req = createMockRequest({
        body: {
          name: 'Test Community',
          disputeResolutionRole: 'moderator',
          disputeHandlingCouncils: ['123e4567-e89b-12d3-a456-426614174000'],
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateCreateCommunity(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should fail with invalid UUID in councils', () => {
      const req = createMockRequest({
        body: {
          name: 'Test Community',
          disputeHandlingCouncils: ['not-a-uuid'],
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateCreateCommunity(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should pass with valid analytics configuration', () => {
      const req = createMockRequest({
        body: {
          name: 'Test Community',
          nonContributionThresholdDays: 30,
          dashboardRefreshInterval: 120,
          metricVisibilitySettings: {
            showActiveMembers: true,
            showWealthGeneration: false,
          },
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateCreateCommunity(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should fail with dashboard refresh interval too low', () => {
      const req = createMockRequest({
        body: {
          name: 'Test Community',
          dashboardRefreshInterval: 30, // Less than minimum of 60
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateCreateCommunity(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('validateUpdateCommunity', () => {
    it('should pass with valid update data', () => {
      const req = createMockRequest({
        params: { id: '123e4567-e89b-12d3-a456-426614174000' },
        body: {
          name: 'Updated Community',
          description: 'Updated description',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateUpdateCommunity(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should fail with invalid community ID', () => {
      const req = createMockRequest({
        params: { id: 'not-a-uuid' },
        body: { name: 'Updated Community' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateUpdateCommunity(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should pass with partial update (number type)', () => {
      const req = createMockRequest({
        params: { id: '123e4567-e89b-12d3-a456-426614174000' },
        body: {
          minTrustForWealth: { type: 'number', value: 15 },
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateUpdateCommunity(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should pass with partial update (level type)', () => {
      const req = createMockRequest({
        params: { id: '123e4567-e89b-12d3-a456-426614174000' },
        body: {
          minTrustForWealth: { type: 'level', value: '323e4567-e89b-12d3-a456-426614174002' },
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateUpdateCommunity(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should fail with empty name', () => {
      const req = createMockRequest({
        params: { id: '123e4567-e89b-12d3-a456-426614174000' },
        body: { name: '' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateUpdateCommunity(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('validateGetCommunity', () => {
    it('should pass with valid UUID', () => {
      const req = createMockRequest({
        params: { id: '123e4567-e89b-12d3-a456-426614174000' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateGetCommunity(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should fail with invalid UUID', () => {
      const req = createMockRequest({
        params: { id: 'invalid-uuid' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateGetCommunity(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should fail with missing ID', () => {
      const req = createMockRequest({
        params: {},
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateGetCommunity(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('validateListCommunities', () => {
    it('should pass with valid pagination', () => {
      const req = createMockRequest({
        query: { page: '1', limit: '10' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateListCommunities(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should pass with no query params', () => {
      const req = createMockRequest({
        query: {},
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateListCommunities(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should fail with limit too high', () => {
      const req = createMockRequest({
        query: { limit: '200' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateListCommunities(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should fail with negative page', () => {
      const req = createMockRequest({
        query: { page: '-1' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateListCommunities(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should fail with limit less than 1', () => {
      const req = createMockRequest({
        query: { limit: '0' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateListCommunities(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('validateCommunitySearchQuery', () => {
    it('should pass with search query', () => {
      const req = createMockRequest({
        query: { q: 'test', page: '1', limit: '20' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateCommunitySearchQuery(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should pass with no search query', () => {
      const req = createMockRequest({
        query: {},
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateCommunitySearchQuery(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should fail with search query too long', () => {
      const req = createMockRequest({
        query: { q: 'a'.repeat(201) },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateCommunitySearchQuery(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('validateGetMembers', () => {
    it('should pass with valid community ID', () => {
      const req = createMockRequest({
        params: { id: '123e4567-e89b-12d3-a456-426614174000' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateGetMembers(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should fail with invalid ID', () => {
      const req = createMockRequest({
        params: { id: 'invalid' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateGetMembers(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('validateRemoveMember', () => {
    it('should pass with valid IDs', () => {
      const req = createMockRequest({
        params: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          userId: '223e4567-e89b-12d3-a456-426614174001',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateRemoveMember(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should fail with invalid community ID', () => {
      const req = createMockRequest({
        params: {
          id: 'invalid',
          userId: '223e4567-e89b-12d3-a456-426614174001',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateRemoveMember(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should fail with invalid user ID', () => {
      const req = createMockRequest({
        params: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          userId: 'invalid',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateRemoveMember(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('validateUpdateMemberRole', () => {
    it('should pass with valid data', () => {
      const req = createMockRequest({
        params: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          userId: '223e4567-e89b-12d3-a456-426614174001',
        },
        body: { role: 'admin' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateUpdateMemberRole(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should fail with missing role', () => {
      const req = createMockRequest({
        params: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          userId: '223e4567-e89b-12d3-a456-426614174001',
        },
        body: {},
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateUpdateMemberRole(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should fail with empty role', () => {
      const req = createMockRequest({
        params: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          userId: '223e4567-e89b-12d3-a456-426614174001',
        },
        body: { role: '' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateUpdateMemberRole(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should fail with role too long', () => {
      const req = createMockRequest({
        params: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          userId: '223e4567-e89b-12d3-a456-426614174001',
        },
        body: { role: 'a'.repeat(65) },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateUpdateMemberRole(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('validateGetMemberById', () => {
    it('should pass with valid IDs', () => {
      const req = createMockRequest({
        params: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          userId: '223e4567-e89b-12d3-a456-426614174001',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateGetMemberById(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should fail with invalid community ID', () => {
      const req = createMockRequest({
        params: {
          id: 'invalid',
          userId: '223e4567-e89b-12d3-a456-426614174001',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateGetMemberById(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});
