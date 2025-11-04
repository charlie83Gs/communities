import { describe, it, expect } from 'bun:test';
import {
  validateCreateItem,
  validateUpdateItem,
  validateIdParam,
  validateListQuery,
  validateSearchQuery,
} from '@/api/validators/items.validator';
import { createMockRequest, createMockResponse, createMockNext } from '../../../tests/helpers/testUtils';

describe('Items Validators', () => {
  describe('validateCreateItem', () => {
    it('should pass validation with valid data', () => {
      const req = createMockRequest({
        body: {
          communityId: '123e4567-e89b-12d3-a456-426614174000',
          name: 'Carrots',
          description: 'Fresh organic carrots',
          kind: 'object',
          wealthValue: '10.50',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateCreateItem(req, res, next);

      expect(next).toHaveBeenCalledWith();
      expect(res.status).not.toHaveBeenCalled();
    });

    it('should pass validation with minimal valid data', () => {
      const req = createMockRequest({
        body: {
          communityId: '123e4567-e89b-12d3-a456-426614174000',
          name: 'T',
          kind: 'service',
          wealthValue: '5.00',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateCreateItem(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('should fail validation with missing communityId', () => {
      const req = createMockRequest({
        body: { name: 'Carrots', kind: 'object' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateCreateItem(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        errors: expect.arrayContaining([
          expect.objectContaining({
            path: expect.arrayContaining(['body', 'communityId']),
          }),
        ]),
      });
    });

    it('should fail validation with invalid UUID', () => {
      const req = createMockRequest({
        body: { communityId: 'not-a-uuid', name: 'Carrots', kind: 'object' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateCreateItem(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalled();
    });

    it('should fail validation with missing name', () => {
      const req = createMockRequest({
        body: { communityId: '123e4567-e89b-12d3-a456-426614174000', kind: 'object' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateCreateItem(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalled();
    });

    it('should fail validation with empty name', () => {
      const req = createMockRequest({
        body: { communityId: '123e4567-e89b-12d3-a456-426614174000', name: '', kind: 'object' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateCreateItem(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalled();
    });

    it('should fail validation with name exceeding 200 characters', () => {
      const req = createMockRequest({
        body: {
          communityId: '123e4567-e89b-12d3-a456-426614174000',
          name: 'a'.repeat(201),
          kind: 'object',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateCreateItem(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalled();
    });

    it('should fail validation with missing kind', () => {
      const req = createMockRequest({
        body: { communityId: '123e4567-e89b-12d3-a456-426614174000', name: 'Carrots' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateCreateItem(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalled();
    });

    it('should fail validation with invalid kind', () => {
      const req = createMockRequest({
        body: { communityId: '123e4567-e89b-12d3-a456-426614174000', name: 'Carrots', kind: 'invalid' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateCreateItem(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalled();
    });

    it('should pass validation with null description', () => {
      const req = createMockRequest({
        body: {
          communityId: '123e4567-e89b-12d3-a456-426614174000',
          name: 'Carrots',
          kind: 'object',
          description: null,
          wealthValue: '15.00',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateCreateItem(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });
  });

  describe('validateUpdateItem', () => {
    it('should pass validation with all fields', () => {
      const req = createMockRequest({
        params: { id: '123e4567-e89b-12d3-a456-426614174000' },
        body: { name: 'Updated Name', description: 'Updated description', kind: 'service' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateUpdateItem(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('should pass validation with partial update', () => {
      const req = createMockRequest({
        params: { id: '123e4567-e89b-12d3-a456-426614174000' },
        body: { name: 'Updated Name' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateUpdateItem(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('should pass validation with empty body', () => {
      const req = createMockRequest({
        params: { id: '123e4567-e89b-12d3-a456-426614174000' },
        body: {},
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateUpdateItem(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('should fail validation with invalid item ID', () => {
      const req = createMockRequest({
        params: { id: 'not-a-uuid' },
        body: { name: 'Updated Name' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateUpdateItem(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalled();
    });

    it('should fail validation with empty name', () => {
      const req = createMockRequest({
        params: { id: '123e4567-e89b-12d3-a456-426614174000' },
        body: { name: '' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateUpdateItem(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalled();
    });

    it('should fail validation with name exceeding 200 characters', () => {
      const req = createMockRequest({
        params: { id: '123e4567-e89b-12d3-a456-426614174000' },
        body: { name: 'a'.repeat(201) },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateUpdateItem(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalled();
    });

    it('should fail validation with invalid kind', () => {
      const req = createMockRequest({
        params: { id: '123e4567-e89b-12d3-a456-426614174000' },
        body: { kind: 'invalid' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateUpdateItem(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('validateIdParam', () => {
    it('should pass validation with valid UUID', () => {
      const req = createMockRequest({
        params: { id: '123e4567-e89b-12d3-a456-426614174000' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateIdParam(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('should fail validation with invalid UUID', () => {
      const req = createMockRequest({
        params: { id: 'not-a-uuid' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateIdParam(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalled();
    });

    it('should fail validation with missing id', () => {
      const req = createMockRequest({ params: {} });
      const res = createMockResponse();
      const next = createMockNext();

      validateIdParam(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('validateListQuery', () => {
    it('should pass validation with valid communityId', () => {
      const req = createMockRequest({
        query: { communityId: '123e4567-e89b-12d3-a456-426614174000' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateListQuery(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('should pass validation with includeDeleted parameter', () => {
      const req = createMockRequest({
        query: { communityId: '123e4567-e89b-12d3-a456-426614174000', includeDeleted: 'true' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateListQuery(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('should fail validation with missing communityId', () => {
      const req = createMockRequest({ query: {} });
      const res = createMockResponse();
      const next = createMockNext();

      validateListQuery(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalled();
    });

    it('should fail validation with invalid UUID', () => {
      const req = createMockRequest({ query: { communityId: 'not-a-uuid' } });
      const res = createMockResponse();
      const next = createMockNext();

      validateListQuery(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('validateSearchQuery', () => {
    it('should pass validation with all parameters', () => {
      const req = createMockRequest({
        query: {
          communityId: '123e4567-e89b-12d3-a456-426614174000',
          query: 'carrot',
          kind: 'object',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateSearchQuery(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('should pass validation with only communityId', () => {
      const req = createMockRequest({
        query: { communityId: '123e4567-e89b-12d3-a456-426614174000' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateSearchQuery(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('should pass validation with kind=service', () => {
      const req = createMockRequest({
        query: { communityId: '123e4567-e89b-12d3-a456-426614174000', kind: 'service' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateSearchQuery(req, res, next);

      expect(next).toHaveBeenCalledWith();
    });

    it('should fail validation with missing communityId', () => {
      const req = createMockRequest({ query: { query: 'carrot' } });
      const res = createMockResponse();
      const next = createMockNext();

      validateSearchQuery(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalled();
    });

    it('should fail validation with invalid UUID', () => {
      const req = createMockRequest({ query: { communityId: 'not-a-uuid' } });
      const res = createMockResponse();
      const next = createMockNext();

      validateSearchQuery(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalled();
    });

    it('should fail validation with invalid kind', () => {
      const req = createMockRequest({
        query: { communityId: '123e4567-e89b-12d3-a456-426614174000', kind: 'invalid' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      validateSearchQuery(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalled();
    });
  });
});
