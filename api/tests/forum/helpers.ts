/**
 * Forum Test Helpers
 * Utilities for testing forum functionality
 */

import { mock } from 'bun:test';
import type {
  ForumCategoryRecord,
  ForumThreadRecord,
  ForumPostRecord,
  ForumVoteRecord,
  CreateCategoryDto,
  CreateThreadDto,
  CreatePostDto,
} from '@repositories/forum.repository';

/**
 * Test data generators for forum entities
 */
export const forumTestData = {
  /**
   * Creates a mock forum category
   */
  category: (overrides: Partial<ForumCategoryRecord> = {}): ForumCategoryRecord => ({
    id: 'category-123',
    communityId: 'comm-123',
    name: 'Test Category',
    description: 'A test category for discussions',
    displayOrder: 0,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  }),

  /**
   * Creates a mock forum thread
   */
  thread: (overrides: Partial<ForumThreadRecord> = {}): ForumThreadRecord => ({
    id: 'thread-123',
    categoryId: 'category-123',
    authorId: 'user-123',
    title: 'Test Thread',
    content: 'This is a test thread content',
    isPinned: false,
    isLocked: false,
    bestAnswerPostId: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  }),

  /**
   * Creates a mock forum post
   */
  post: (overrides: Partial<ForumPostRecord> = {}): ForumPostRecord => ({
    id: 'post-123',
    threadId: 'thread-123',
    authorId: 'user-123',
    content: 'This is a test post content',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  }),

  /**
   * Creates a mock forum vote
   */
  vote: (overrides: Partial<ForumVoteRecord> = {}): ForumVoteRecord => ({
    id: 'vote-123',
    userId: 'user-123',
    threadId: 'thread-123',
    postId: null,
    voteType: 'up',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  }),

  /**
   * Creates a mock create category DTO
   */
  createCategoryDto: (overrides: Partial<CreateCategoryDto> = {}): CreateCategoryDto => ({
    communityId: 'comm-123',
    name: 'Test Category',
    description: 'Test category description',
    displayOrder: 0,
    ...overrides,
  }),

  /**
   * Creates a mock create thread DTO
   */
  createThreadDto: (overrides: Partial<CreateThreadDto> = {}): CreateThreadDto => ({
    categoryId: 'category-123',
    title: 'Test Thread',
    content: 'Test thread content',
    tags: ['test', 'discussion'],
    ...overrides,
  }),

  /**
   * Creates a mock create post DTO
   */
  createPostDto: (overrides: Partial<CreatePostDto> = {}): CreatePostDto => ({
    threadId: 'thread-123',
    content: 'Test post content',
    ...overrides,
  }),
};

/**
 * Mock repository factory for forum repository
 */
export function createMockForumRepository() {
  return {
    // Categories
    createCategory: mock(() => Promise.resolve(forumTestData.category())),
    findCategoryById: mock(() => Promise.resolve(forumTestData.category())),
    findCategoriesByCommunity: mock(() => Promise.resolve([forumTestData.category()])),
    updateCategory: mock(() => Promise.resolve(forumTestData.category())),
    deleteCategory: mock(() => Promise.resolve(forumTestData.category())),
    getCategoryStats: mock(() =>
      Promise.resolve({ threadCount: 5, lastActivity: new Date('2024-01-01') })
    ),

    // Threads
    createThread: mock(() => Promise.resolve(forumTestData.thread())),
    findThreadById: mock(() => Promise.resolve(forumTestData.thread())),
    findThreadsByCategory: mock(() =>
      Promise.resolve({ threads: [forumTestData.thread()], total: 1 })
    ),
    updateThread: mock(() => Promise.resolve(forumTestData.thread())),
    deleteThread: mock(() => Promise.resolve(forumTestData.thread())),
    getThreadStats: mock(() =>
      Promise.resolve({
        postCount: 3,
        lastActivity: new Date('2024-01-01'),
        upvotes: 10,
        downvotes: 2,
      })
    ),
    getThreadTags: mock(() => Promise.resolve(['test', 'discussion'])),

    // Posts
    createPost: mock(() => Promise.resolve(forumTestData.post())),
    findPostById: mock(() => Promise.resolve(forumTestData.post())),
    findPostsByThread: mock(() => Promise.resolve([forumTestData.post()])),
    updatePost: mock(() => Promise.resolve(forumTestData.post())),
    deletePost: mock(() => Promise.resolve(forumTestData.post())),

    // Votes
    createOrUpdateVote: mock(() => Promise.resolve(forumTestData.vote())),
    removeVote: mock(() => Promise.resolve(undefined)),
    getVoteCounts: mock(() => Promise.resolve({ upvotes: 10, downvotes: 2 })),
    getUserVote: mock(() => Promise.resolve(null)),
  };
}

/**
 * Mock OpenFGA service for forum tests
 */
export function createMockOpenFGAService(config: {
  isAdmin?: boolean;
  isForumManager?: boolean;
  canCreateThreads?: boolean;
  trustLevel?: number;
} = {}) {
  return {
    check: mock(async (params: any) => {
      // Handle admin check
      if (params.relation === 'admin') {
        return config.isAdmin ?? false;
      }
      // Handle forum_manager check
      if (params.relation === 'forum_manager') {
        return config.isForumManager ?? false;
      }
      return false;
    }),
    checkAccess: mock(async (userId: string, resourceType: string, resourceId: string, permission: string) => {
      // Map permissions to config
      if (permission === 'can_manage_forum') {
        return config.isAdmin || config.isForumManager || false;
      }
      if (permission === 'can_create_thread') {
        return config.canCreateThreads ?? true;
      }
      if (permission === 'admin') {
        return config.isAdmin ?? false;
      }
      if (permission === 'can_read') {
        return true; // Members can always read
      }
      return false;
    }),
    checkTrustLevel: mock(async () => config.canCreateThreads ?? true),
    createRelationship: mock(() => Promise.resolve()),
    deleteRelationship: mock(() => Promise.resolve()),
  };
}

/**
 * Mock community member repository for forum tests
 */
export function createMockCommunityMemberRepository(role: string | null = 'member') {
  return {
    getUserRole: mock(() => Promise.resolve(role)),
    getUserRoles: mock(() => Promise.resolve(role ? [role] : [])),
    isAdmin: mock(() => Promise.resolve(role === 'admin')),
    findByUser: mock(() => Promise.resolve([{ resourceId: 'comm-123', role: role ?? 'member' }])),
    findByCommunity: mock(() =>
      Promise.resolve([{ userId: 'user-123', role: role ?? 'member' }])
    ),
    addMember: mock(() => Promise.resolve()),
    removeMember: mock(() => Promise.resolve()),
    updateRole: mock(() => Promise.resolve()),
  };
}

/**
 * Mock community repository for forum tests
 */
export function createMockCommunityRepository() {
  return {
    findById: mock(() =>
      Promise.resolve({
        id: 'comm-123',
        name: 'Test Community',
        description: 'Test community',
        minTrustForThreadCreation: { value: 10 },
        minTrustForForumModeration: { value: 30 },
        createdBy: 'user-123',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    ),
    create: mock(() => Promise.resolve(null)),
    update: mock(() => Promise.resolve(null)),
    delete: mock(() => Promise.resolve(null)),
    search: mock(() => Promise.resolve({ rows: [], total: 0 })),
  };
}

/**
 * Mock app user repository for forum tests
 */
export function createMockAppUserRepository() {
  return {
    findById: mock((userId: string) =>
      Promise.resolve({
        id: userId,
        email: `${userId}@example.com`,
        username: `user_${userId.slice(0, 8)}`,
        displayName: `Test User ${userId.slice(0, 8)}`,
        country: null,
        stateProvince: null,
        city: null,
        description: null,
        profileImage: null,
        lastSeenAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    ),
    findByEmail: mock(() => Promise.resolve(null)),
    create: mock(() => Promise.resolve(null)),
    update: mock(() => Promise.resolve(null)),
  };
}

/**
 * Helper to setup mocks for forum service tests
 */
export function setupForumServiceMocks(
  forumRepository: any,
  openFGAService: any,
  communityMemberRepository: any,
  communityRepository: any,
  appUserRepository: any
) {
  // Replace repository methods with mocks
  const forumRepo = require('@repositories/forum.repository');
  Object.keys(forumRepository).forEach((key) => {
    (forumRepo.forumRepository as any)[key] = forumRepository[key];
  });

  const fgaService = require('@/services/openfga.service');
  Object.keys(openFGAService).forEach((key) => {
    (fgaService.openFGAService as any)[key] = openFGAService[key];
  });

  const memberRepo = require('@repositories/communityMember.repository');
  Object.keys(communityMemberRepository).forEach((key) => {
    (memberRepo.communityMemberRepository as any)[key] = communityMemberRepository[key];
  });

  const commRepo = require('@repositories/community.repository');
  Object.keys(communityRepository).forEach((key) => {
    (commRepo.communityRepository as any)[key] = communityRepository[key];
  });

  const userRepo = require('@repositories/appUser.repository');
  Object.keys(appUserRepository).forEach((key) => {
    (userRepo.appUserRepository as any)[key] = appUserRepository[key];
  });
}

/**
 * Helper to reset all mocks
 */
export function resetAllMocks(
  forumRepository: any,
  openFGAService: any,
  communityMemberRepository: any,
  communityRepository: any,
  appUserRepository: any
) {
  Object.values(forumRepository).forEach((mockFn: any) => {
    if (mockFn.mockReset) mockFn.mockReset();
  });
  Object.values(openFGAService).forEach((mockFn: any) => {
    if (mockFn.mockReset) mockFn.mockReset();
  });
  Object.values(communityMemberRepository).forEach((mockFn: any) => {
    if (mockFn.mockReset) mockFn.mockReset();
  });
  Object.values(communityRepository).forEach((mockFn: any) => {
    if (mockFn.mockReset) mockFn.mockReset();
  });
  Object.values(appUserRepository).forEach((mockFn: any) => {
    if (mockFn.mockReset) mockFn.mockReset();
  });
}
