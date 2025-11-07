import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { AppError, errorHandler } from '@/utils/errors';
import { ZodError, z } from 'zod';
import {
  createMockRequest,
  createMockResponse,
  createMockNext,
} from '../../tests/helpers/testUtils';

describe('AppError', () => {
  it('should create an error with message and status code', () => {
    const error = new AppError('Test error', 400);

    expect(error.message).toBe('Test error');
    expect(error.statusCode).toBe(400);
    expect(error.name).toBe('AppError');
    expect(error).toBeInstanceOf(Error);
  });

  it('should default to 500 status code', () => {
    const error = new AppError('Server error');

    expect(error.message).toBe('Server error');
    expect(error.statusCode).toBe(500);
  });

  it('should be throwable', () => {
    expect(() => {
      throw new AppError('Test error', 404);
    }).toThrow('Test error');
  });
});

describe('errorHandler', () => {
  let consoleErrorSpy: any;

  beforeEach(() => {
    consoleErrorSpy = mock(() => {});
    console.error = consoleErrorSpy;
  });

  it('should handle ZodError with 400 status', () => {
    const schema = z.object({
      name: z.string(),
      age: z.number(),
    });

    let zodError: ZodError;
    try {
      schema.parse({ name: 'John' }); // Missing age
    } catch (err) {
      zodError = err as ZodError;
    }

    const req = createMockRequest();
    const res = createMockResponse();
    const next = createMockNext();

    errorHandler(zodError!, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Validation Error',
      errors: expect.any(Array),
    });
  });

  it('should handle AppError with custom status code', () => {
    const error = new AppError('Not found', 404);
    const req = createMockRequest();
    const res = createMockResponse();
    const next = createMockNext();

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Not found',
    });
  });

  it('should handle AppError with 403 status', () => {
    const error = new AppError('Forbidden', 403);
    const req = createMockRequest();
    const res = createMockResponse();
    const next = createMockNext();

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Forbidden',
    });
  });

  it('should handle JWT authentication errors with 401 status', () => {
    const error = new Error('Invalid token');
    const req = createMockRequest();
    const res = createMockResponse();
    const next = createMockNext();

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Internal Server Error',
    });
  });

  it('should handle generic errors with 500 status', () => {
    const error = new Error('Something went wrong');
    const req = createMockRequest();
    const res = createMockResponse();
    const next = createMockNext();

    errorHandler(error, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Internal Server Error',
    });
  });

  it('should log all errors to console', () => {
    const error = new AppError('Test error', 400);
    const req = createMockRequest();
    const res = createMockResponse();
    const next = createMockNext();

    errorHandler(error, req, res, next);

    expect(consoleErrorSpy).toHaveBeenCalledWith('Error:', error);
  });

  it('should handle errors with various status codes', () => {
    const testCases = [
      { error: new AppError('Bad Request', 400), expectedStatus: 400 },
      { error: new AppError('Unauthorized', 401), expectedStatus: 401 },
      { error: new AppError('Forbidden', 403), expectedStatus: 403 },
      { error: new AppError('Not Found', 404), expectedStatus: 404 },
      { error: new AppError('Conflict', 409), expectedStatus: 409 },
      { error: new AppError('Internal Error', 500), expectedStatus: 500 },
    ];

    testCases.forEach(({ error, expectedStatus }) => {
      const req = createMockRequest();
      const res = createMockResponse();
      const next = createMockNext();

      errorHandler(error, req, res, next);

      expect(res.status).toHaveBeenCalledWith(expectedStatus);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        message: error.message,
      });
    });
  });
});
