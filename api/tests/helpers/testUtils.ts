import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '@/api/middleware/auth.middleware';
import { mock } from 'bun:test';

/**
 * Test utilities for mocking Express request/response objects and Keycloak authentication
 */

/**
 * Creates a mock Express Request object with optional overrides
 */
export function createMockRequest(overrides: Partial<Request> = {}): Request {
  return {
    params: {},
    body: {},
    query: {},
    headers: {},
    get: mock((header: string) => ''),
    ...overrides,
  } as Request;
}

/**
 * Creates a mock AuthenticatedRequest with Keycloak JWT authentication
 */
export function createMockAuthenticatedRequest(
  userId: string = 'test-user-id',
  overrides: Partial<AuthenticatedRequest> = {}
): AuthenticatedRequest {
  return {
    user: {
      id: userId,
      email: `${userId}@example.com`,
      username: `user_${userId}`,
      roles: ['member'],
      realmRoles: [],
      clientRoles: ['member'],
    },
    token: 'mock-jwt-token',
    params: {},
    body: {},
    query: {},
    headers: {},
    get: mock((header: string) => ''),
    ...overrides,
  } as AuthenticatedRequest;
}

/**
 * Creates a mock Express Response object with chainable methods
 */
export function createMockResponse(): Response {
  const res = {} as Response;
  res.status = mock((code: number) => res);
  res.json = mock((data: any) => res);
  res.send = mock((data: any) => res);
  res.setHeader = mock((name: string, value: string) => res);
  res.end = mock(() => res);
  return res;
}

/**
 * Creates a mock Express NextFunction
 */
export function createMockNext(): NextFunction {
  return mock(() => {}) as NextFunction;
}

/**
 * Helper to extract error from next() call
 */
export function getNextError(nextFn: NextFunction): Error | undefined {
  const mockNext = nextFn as any;
  if (mockNext.mock && mockNext.mock.calls.length > 0) {
    return mockNext.mock.calls[0][0];
  }
  return undefined;
}

/**
 * Helper to check if next() was called without error
 */
export function wasNextCalledWithoutError(nextFn: NextFunction): boolean {
  const mockNext = nextFn as any;
  if (!mockNext.mock || mockNext.mock.calls.length === 0) {
    return false;
  }
  return mockNext.mock.calls[0][0] === undefined;
}

/**
 * Creates a mock file for testing file uploads
 */
export function createMockFile(
  filename: string = 'test.jpg',
  mimetype: string = 'image/jpeg',
  size: number = 1024
): Express.Multer.File {
  return {
    fieldname: 'file',
    originalname: filename,
    encoding: '7bit',
    mimetype,
    size,
    destination: '/tmp/uploads',
    filename: `${Date.now()}-${filename}`,
    path: `/tmp/uploads/${Date.now()}-${filename}`,
    buffer: Buffer.from('mock file content'),
    stream: {} as any,
  } as Express.Multer.File;
}

/**
 * Mock repository helper - creates a mocked version of a repository
 */
export function createMockRepository<T extends Record<string, any>>(
  methods: (keyof T)[]
): T {
  const mockRepo = {} as T;
  for (const method of methods) {
    mockRepo[method] = mock(() => Promise.resolve(null)) as any;
  }
  return mockRepo;
}

/**
 * Mock service helper - creates a mocked version of a service
 */
export function createMockService<T extends Record<string, any>>(
  methods: (keyof T)[]
): T {
  const mockService = {} as T;
  for (const method of methods) {
    mockService[method] = mock(() => Promise.resolve(null)) as any;
  }
  return mockService;
}

/**
 * Test data generators
 */
export const testData = {
  community: {
    id: 'comm-123',
    name: 'Test Community',
    description: 'A test community',
    createdBy: 'user-123',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  user: {
    id: 'user-123',
    email: 'test@example.com',
    displayName: 'Test User',
    username: 'testuser',
    profileImage: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  wealth: {
    id: 'wealth-123',
    createdBy: 'user-123',
    communityId: 'comm-123',
    itemId: 'item-123',
    title: 'Test Wealth',
    description: 'Test wealth description',
    image: null,
    durationType: 'unlimited' as const,
    endDate: null,
    distributionType: 'request_based' as const,
    unitsAvailable: null,
    maxUnitsPerUser: null,
    automationEnabled: false,
    status: 'active' as const,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  share: {
    id: 'share-123',
    createdBy: 'user-123',
    communityId: 'comm-123',
    itemId: 'item-123',
    title: 'Test Share',
    description: 'Test share description',
    image: null,
    durationType: 'unlimited' as const,
    endDate: null,
    distributionType: 'request_based' as const,
    unitsAvailable: null,
    maxUnitsPerUser: null,
    automationEnabled: false,
    status: 'active' as const,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  invite: {
    id: 'invite-123',
    communityId: 'comm-123',
    invitedBy: 'user-123',
    inviteeEmail: 'invitee@example.com',
    role: 'member' as const,
    status: 'pending' as const,
    token: 'test-token-123',
    expiresAt: new Date('2024-12-31'),
    createdAt: new Date('2024-01-01'),
  },
};

/**
 * Async test wrapper to handle async operations
 */
export async function asyncTest(fn: () => Promise<void>): Promise<void> {
  try {
    await fn();
  } catch (error) {
    throw error;
  }
}

/**
 * Database mock helpers
 */
export const dbMock = {
  /**
   * Creates a mock database transaction
   */
  createTransaction: () => ({
    commit: mock(async () => {}),
    rollback: mock(async () => {}),
  }),

  /**
   * Creates a mock Drizzle query builder
   */
  createQueryBuilder: () => ({
    select: mock(() => dbMock.createQueryBuilder()),
    from: mock(() => dbMock.createQueryBuilder()),
    where: mock(() => dbMock.createQueryBuilder()),
    limit: mock(() => dbMock.createQueryBuilder()),
    offset: mock(() => dbMock.createQueryBuilder()),
    orderBy: mock(() => dbMock.createQueryBuilder()),
    execute: mock(async () => []),
  }),
};
