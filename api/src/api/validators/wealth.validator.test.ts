import { describe, it, expect } from 'bun:test';
import {
  validateCreateWealth,
  validateUpdateWealth,
  validateIdParam,
  validateWealthListQuery,
  validateWealthSearchQuery,
  validateRequestWealth,
  validateRequestIdParams,
  validateWealthRequestStatusesQuery,
  validateCreateComment,
  validateListComments,
  validateUpdateComment,
  validateDeleteComment,
} from '@/api/validators/wealth.validator';
import { createMockRequest, createMockResponse, createMockNext } from '../../../tests/helpers/testUtils';

describe('Wealth Validators', () => {
  describe('validateCreateWealth', () => {
    it('should pass with valid wealth with unlimited duration', () => {
      const req = createMockRequest({
        body: {
          communityId: '123e4567-e89b-12d3-a456-426614174000',
          itemId: '223e4567-e89b-12d3-a456-426614174001',
          title: 'Test Wealth',
          description: 'Test description',
          durationType: 'unlimited',
          distributionType: 'request_based',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateCreateWealth(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should pass with valid wealth with timebound duration', () => {
      const req = createMockRequest({
        body: {
          communityId: '123e4567-e89b-12d3-a456-426614174000',
          itemId: '223e4567-e89b-12d3-a456-426614174001',
          title: 'Test Service',
          durationType: 'timebound',
          endDate: '2025-12-31T23:59:59Z',
          distributionType: 'unit_based',
          unitsAvailable: 10,
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateCreateWealth(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should pass with all optional fields', () => {
      const req = createMockRequest({
        body: {
          communityId: '123e4567-e89b-12d3-a456-426614174000',
          itemId: '223e4567-e89b-12d3-a456-426614174001',
          title: 'Complete Wealth',
          description: 'Full description',
          image: 'image.jpg',
          durationType: 'timebound',
          endDate: '2025-06-15T12:00:00Z',
          distributionType: 'unit_based',
          unitsAvailable: 20,
          maxUnitsPerUser: 5,
          automationEnabled: true,
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateCreateWealth(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should fail with missing title', () => {
      const req = createMockRequest({
        body: {
          communityId: '123e4567-e89b-12d3-a456-426614174000',
          itemId: '223e4567-e89b-12d3-a456-426614174001',
          durationType: 'unlimited',
          distributionType: 'request_based',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateCreateWealth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should fail with empty title', () => {
      const req = createMockRequest({
        body: {
          communityId: '123e4567-e89b-12d3-a456-426614174000',
          itemId: '223e4567-e89b-12d3-a456-426614174001',
          title: '',
          durationType: 'unlimited',
          distributionType: 'request_based',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateCreateWealth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should fail with title too long', () => {
      const req = createMockRequest({
        body: {
          communityId: '123e4567-e89b-12d3-a456-426614174000',
          itemId: '223e4567-e89b-12d3-a456-426614174001',
          title: 'a'.repeat(201),
          durationType: 'unlimited',
          distributionType: 'request_based',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateCreateWealth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should pass with title at max length (200)', () => {
      const req = createMockRequest({
        body: {
          communityId: '123e4567-e89b-12d3-a456-426614174000',
          itemId: '223e4567-e89b-12d3-a456-426614174001',
          title: 'a'.repeat(200),
          durationType: 'unlimited',
          distributionType: 'request_based',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateCreateWealth(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should fail with invalid communityId', () => {
      const req = createMockRequest({
        body: {
          communityId: 'not-a-uuid',
          itemId: '223e4567-e89b-12d3-a456-426614174001',
          title: 'Test Wealth',
          durationType: 'unlimited',
          distributionType: 'request_based',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateCreateWealth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });


    it('should fail with invalid durationType', () => {
      const req = createMockRequest({
        body: {
          communityId: '123e4567-e89b-12d3-a456-426614174000',
          itemId: '223e4567-e89b-12d3-a456-426614174001',
          title: 'Test Wealth',
          durationType: 'invalid',
          distributionType: 'request_based',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateCreateWealth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should fail with timebound duration but no endDate', () => {
      const req = createMockRequest({
        body: {
          communityId: '123e4567-e89b-12d3-a456-426614174000',
          itemId: '223e4567-e89b-12d3-a456-426614174001',
          title: 'Test Wealth',
          durationType: 'timebound',
          distributionType: 'request_based',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateCreateWealth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: 'endDate is required for timebound wealths',
      });
    });

    it('should fail with negative unitsAvailable', () => {
      const req = createMockRequest({
        body: {
          communityId: '123e4567-e89b-12d3-a456-426614174000',
          itemId: '223e4567-e89b-12d3-a456-426614174001',
          title: 'Test Wealth',
          durationType: 'unlimited',
          distributionType: 'unit_based',
          unitsAvailable: -5,
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateCreateWealth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should fail with zero unitsAvailable', () => {
      const req = createMockRequest({
        body: {
          communityId: '123e4567-e89b-12d3-a456-426614174000',
          itemId: '223e4567-e89b-12d3-a456-426614174001',
          title: 'Test Wealth',
          durationType: 'unlimited',
          distributionType: 'unit_based',
          unitsAvailable: 0,
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateCreateWealth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should fail with negative maxUnitsPerUser', () => {
      const req = createMockRequest({
        body: {
          communityId: '123e4567-e89b-12d3-a456-426614174000',
          itemId: '223e4567-e89b-12d3-a456-426614174001',
          title: 'Test Wealth',
          durationType: 'unlimited',
          distributionType: 'unit_based',
          unitsAvailable: 10,
          maxUnitsPerUser: -1,
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateCreateWealth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    // Note: distributionType is not validated because it's always hardcoded to 'unit_based' in the service
    // The field is not accepted as input in the schema

    it('should pass with Date object for endDate', () => {
      const req = createMockRequest({
        body: {
          communityId: '123e4567-e89b-12d3-a456-426614174000',
          itemId: '223e4567-e89b-12d3-a456-426614174001',
          title: 'Test Wealth',
          durationType: 'timebound',
          endDate: new Date('2025-12-31'),
          distributionType: 'request_based',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateCreateWealth(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('validateUpdateWealth', () => {
    it('should pass with valid update', () => {
      const req = createMockRequest({
        params: { id: '123e4567-e89b-12d3-a456-426614174000' },
        body: {
          title: 'Updated Title',
          description: 'Updated description',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateUpdateWealth(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should pass with partial update', () => {
      const req = createMockRequest({
        params: { id: '123e4567-e89b-12d3-a456-426614174000' },
        body: {
          unitsAvailable: 15,
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateUpdateWealth(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should pass with status update', () => {
      const req = createMockRequest({
        params: { id: '123e4567-e89b-12d3-a456-426614174000' },
        body: {
          status: 'fulfilled',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateUpdateWealth(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should fail with invalid wealth ID', () => {
      const req = createMockRequest({
        params: { id: 'not-a-uuid' },
        body: { title: 'Updated' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateUpdateWealth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should fail with empty title', () => {
      const req = createMockRequest({
        params: { id: '123e4567-e89b-12d3-a456-426614174000' },
        body: { title: '' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateUpdateWealth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should fail with title too long', () => {
      const req = createMockRequest({
        params: { id: '123e4567-e89b-12d3-a456-426614174000' },
        body: { title: 'a'.repeat(201) },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateUpdateWealth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should pass with zero unitsAvailable (allowed in update)', () => {
      const req = createMockRequest({
        params: { id: '123e4567-e89b-12d3-a456-426614174000' },
        body: { unitsAvailable: 0 },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateUpdateWealth(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should fail with negative unitsAvailable', () => {
      const req = createMockRequest({
        params: { id: '123e4567-e89b-12d3-a456-426614174000' },
        body: { unitsAvailable: -1 },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateUpdateWealth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should fail with invalid status', () => {
      const req = createMockRequest({
        params: { id: '123e4567-e89b-12d3-a456-426614174000' },
        body: { status: 'invalid_status' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateUpdateWealth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should pass with empty body (all fields optional)', () => {
      const req = createMockRequest({
        params: { id: '123e4567-e89b-12d3-a456-426614174000' },
        body: {},
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateUpdateWealth(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('validateIdParam', () => {
    it('should pass with valid UUID', () => {
      const req = createMockRequest({
        params: { id: '123e4567-e89b-12d3-a456-426614174000' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateIdParam(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should fail with invalid UUID', () => {
      const req = createMockRequest({
        params: { id: 'not-a-uuid' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateIdParam(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should fail with missing ID', () => {
      const req = createMockRequest({
        params: {},
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateIdParam(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('validateWealthListQuery', () => {
    it('should pass with valid query', () => {
      const req = createMockRequest({
        query: {
          communityId: '123e4567-e89b-12d3-a456-426614174000',
          status: 'active',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateWealthListQuery(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should pass with empty query', () => {
      const req = createMockRequest({
        query: {},
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateWealthListQuery(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should fail with invalid communityId', () => {
      const req = createMockRequest({
        query: { communityId: 'not-a-uuid' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateWealthListQuery(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should fail with invalid status', () => {
      const req = createMockRequest({
        query: { status: 'invalid' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateWealthListQuery(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('validateWealthSearchQuery', () => {
    it('should pass with search query', () => {
      const req = createMockRequest({
        query: {
          q: 'test search',
          page: '1',
          limit: '20',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateWealthSearchQuery(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should pass with all filters', () => {
      const req = createMockRequest({
        query: {
          q: 'search',
          communityId: '123e4567-e89b-12d3-a456-426614174000',
          durationType: 'timebound',
          distributionType: 'unit_based',
          status: 'active',
          endDateBefore: '2025-12-31T23:59:59Z',
          endDateAfter: '2025-01-01T00:00:00Z',
          page: '2',
          limit: '50',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateWealthSearchQuery(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should pass with no query params', () => {
      const req = createMockRequest({
        query: {},
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateWealthSearchQuery(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should fail with search query too long', () => {
      const req = createMockRequest({
        query: { q: 'a'.repeat(201) },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateWealthSearchQuery(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should fail with limit too high', () => {
      const req = createMockRequest({
        query: { limit: '101' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateWealthSearchQuery(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should fail with negative page', () => {
      const req = createMockRequest({
        query: { page: '-1' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateWealthSearchQuery(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should fail with zero page', () => {
      const req = createMockRequest({
        query: { page: '0' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateWealthSearchQuery(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('validateRequestWealth', () => {
    it('should pass with valid request', () => {
      const req = createMockRequest({
        params: { id: '123e4567-e89b-12d3-a456-426614174000' },
        body: {
          message: 'Please share with me',
          unitsRequested: 5,
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateRequestWealth(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should pass with no optional fields', () => {
      const req = createMockRequest({
        params: { id: '123e4567-e89b-12d3-a456-426614174000' },
        body: {},
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateRequestWealth(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should fail with message too long', () => {
      const req = createMockRequest({
        params: { id: '123e4567-e89b-12d3-a456-426614174000' },
        body: { message: 'a'.repeat(2001) },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateRequestWealth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should pass with message at max length (2000)', () => {
      const req = createMockRequest({
        params: { id: '123e4567-e89b-12d3-a456-426614174000' },
        body: { message: 'a'.repeat(2000) },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateRequestWealth(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should fail with negative unitsRequested', () => {
      const req = createMockRequest({
        params: { id: '123e4567-e89b-12d3-a456-426614174000' },
        body: { unitsRequested: -5 },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateRequestWealth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should fail with zero unitsRequested', () => {
      const req = createMockRequest({
        params: { id: '123e4567-e89b-12d3-a456-426614174000' },
        body: { unitsRequested: 0 },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateRequestWealth(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('validateRequestIdParams', () => {
    it('should pass with valid IDs', () => {
      const req = createMockRequest({
        params: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          requestId: '223e4567-e89b-12d3-a456-426614174001',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateRequestIdParams(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should fail with invalid wealth ID', () => {
      const req = createMockRequest({
        params: {
          id: 'invalid',
          requestId: '223e4567-e89b-12d3-a456-426614174001',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateRequestIdParams(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should fail with invalid request ID', () => {
      const req = createMockRequest({
        params: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          requestId: 'invalid',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateRequestIdParams(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('validateWealthRequestStatusesQuery', () => {
    it('should pass with single status', () => {
      const req = createMockRequest({
        query: { statuses: 'pending' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateWealthRequestStatusesQuery(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should pass with no statuses', () => {
      const req = createMockRequest({
        query: {},
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateWealthRequestStatusesQuery(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should pass with array of statuses', () => {
      const req = createMockRequest({
        query: { statuses: ['pending', 'accepted'] },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateWealthRequestStatusesQuery(req, res, next);

      expect(next).toHaveBeenCalled();
    });
  });

  describe('validateCreateComment', () => {
    it('should pass with valid comment', () => {
      const req = createMockRequest({
        params: { wealthId: '123e4567-e89b-12d3-a456-426614174000' },
        body: {
          content: 'This is a comment',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateCreateComment(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should pass with parent comment', () => {
      const req = createMockRequest({
        params: { wealthId: '123e4567-e89b-12d3-a456-426614174000' },
        body: {
          content: 'Reply comment',
          parentId: '223e4567-e89b-12d3-a456-426614174001',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateCreateComment(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should fail with empty content', () => {
      const req = createMockRequest({
        params: { wealthId: '123e4567-e89b-12d3-a456-426614174000' },
        body: { content: '' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateCreateComment(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should fail with content too long', () => {
      const req = createMockRequest({
        params: { wealthId: '123e4567-e89b-12d3-a456-426614174000' },
        body: { content: 'a'.repeat(2001) },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateCreateComment(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should fail with invalid wealthId', () => {
      const req = createMockRequest({
        params: { wealthId: 'not-a-uuid' },
        body: { content: 'Comment' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateCreateComment(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('validateListComments', () => {
    it('should pass with valid params', () => {
      const req = createMockRequest({
        params: { wealthId: '123e4567-e89b-12d3-a456-426614174000' },
        query: { limit: '20', offset: '10' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateListComments(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should pass with default pagination', () => {
      const req = createMockRequest({
        params: { wealthId: '123e4567-e89b-12d3-a456-426614174000' },
        query: {},
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateListComments(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should fail with limit too high', () => {
      const req = createMockRequest({
        params: { wealthId: '123e4567-e89b-12d3-a456-426614174000' },
        query: { limit: '101' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateListComments(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should fail with negative offset', () => {
      const req = createMockRequest({
        params: { wealthId: '123e4567-e89b-12d3-a456-426614174000' },
        query: { offset: '-1' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateListComments(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('validateUpdateComment', () => {
    it('should pass with valid update', () => {
      const req = createMockRequest({
        params: {
          wealthId: '123e4567-e89b-12d3-a456-426614174000',
          commentId: '223e4567-e89b-12d3-a456-426614174001',
        },
        body: { content: 'Updated comment' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateUpdateComment(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should fail with empty content', () => {
      const req = createMockRequest({
        params: {
          wealthId: '123e4567-e89b-12d3-a456-426614174000',
          commentId: '223e4567-e89b-12d3-a456-426614174001',
        },
        body: { content: '' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateUpdateComment(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should fail with invalid commentId', () => {
      const req = createMockRequest({
        params: {
          wealthId: '123e4567-e89b-12d3-a456-426614174000',
          commentId: 'invalid',
        },
        body: { content: 'Updated' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateUpdateComment(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('validateDeleteComment', () => {
    it('should pass with valid IDs', () => {
      const req = createMockRequest({
        params: {
          wealthId: '123e4567-e89b-12d3-a456-426614174000',
          commentId: '223e4567-e89b-12d3-a456-426614174001',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateDeleteComment(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should fail with invalid wealthId', () => {
      const req = createMockRequest({
        params: {
          wealthId: 'invalid',
          commentId: '223e4567-e89b-12d3-a456-426614174001',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateDeleteComment(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});
