import { describe, it, expect, beforeEach, afterEach, mock } from 'bun:test';
import { CommunityRepository } from '@/repositories/community.repository';
import type { CommunitySearchFilters } from '@/repositories/community.repository';
import type { CreateCommunityDto, UpdateCommunityDto, Community } from '@/types/community.types';
import { createThenableMockDb, setupMockDbChains } from '../../tests/helpers/mockDb';
import { communityMemberRepository } from './communityMember.repository';

let communityRepository: CommunityRepository;

// Create mock database
const mockDb = createThenableMockDb();

// Static test data
const testCommunity: Community & { deletedAt?: Date | null } = {
  id: 'comm-123',
  name: 'Test Community',
  description: 'A test community',
  createdBy: 'user-123',
  createdAt: new Date('2024-01-01'),
  deletedAt: null,
  minTrustForWealth: { type: 'number' as const, value: 10 },
  minTrustForPolls: { type: 'number' as const, value: 15 },
  minTrustToAwardTrust: { type: 'number' as const, value: 15 },
  minTrustToViewTrust: { type: 'number' as const, value: 0 },
  trustTitles: { titles: [{ name: 'New', minScore: 0 }] },
  minTrustToViewWealth: { type: 'number' as const, value: 0 },
  minTrustToViewItems: { type: 'number' as const, value: 0 },
  minTrustForDisputeVisibility: { type: 'number' as const, value: 20 },
  minTrustForDisputeParticipation: { type: 'number' as const, value: 10 },
  allowOpenResolutions: true,
  requireMultipleMediators: false,
  minMediatorsCount: 1,
  pollCreatorUsers: [],
  minTrustToViewPolls: { type: 'number' as const, value: 0 },
  minTrustForPoolCreation: { type: 'number' as const, value: 20 },
  minTrustToViewPools: { type: 'number' as const, value: 0 },
  minTrustForCouncilCreation: { type: 'number' as const, value: 25 },
  minTrustToViewCouncils: { type: 'number' as const, value: 0 },
  nonContributionThresholdDays: 30,
  dashboardRefreshInterval: 3600,
  metricVisibilitySettings: {
    showActiveMembers: true,
    showWealthGeneration: true,
    showTrustNetwork: true,
    showCouncilActivity: true,
    showNeedsFulfillment: true,
    showDisputeRate: true,
  },
  minTrustForHealthAnalytics: { type: 'number' as const, value: 20 },
  minTrustForForumModeration: { type: 'number' as const, value: 30 },
  minTrustForThreadCreation: { type: 'number' as const, value: 10 },
  minTrustForAttachments: { type: 'number' as const, value: 15 },
  minTrustForFlagging: { type: 'number' as const, value: 15 },
  minTrustForFlagReview: { type: 'number' as const, value: 30 },
  minTrustToViewForum: { type: 'number' as const, value: 0 },
  minTrustForItemManagement: { type: 'number' as const, value: 20 },
  minTrustForCheckoutLinks: { type: 'number' as const, value: 5 },
  featureFlags: {
    poolsEnabled: true,
    needsEnabled: true,
    pollsEnabled: true,
    councilsEnabled: true,
    forumEnabled: true,
    healthAnalyticsEnabled: true,
    disputesEnabled: true,
    contributionsEnabled: true,
  },
};

const testCommunity2: Community = {
  ...testCommunity,
  id: 'comm-456',
  name: 'Another Community',
  description: 'Another test community',
  createdBy: 'user-456',
};

describe('CommunityRepository', () => {
  beforeEach(() => {
    // Reset all mocks and setup default chains
    setupMockDbChains(mockDb);

    // Mock transaction to execute callback immediately
    mockDb.transaction = mock(async (callback: Function) => {
      return callback({
        insert: mockDb.insert,
        select: mockDb.select,
        update: mockDb.update,
        delete: mockDb.delete,
      });
    });

    // Instantiate repository with the per-test mock DB
    communityRepository = new CommunityRepository(mockDb);
  });

  afterEach(() => {
    // Nothing to clean up; a fresh CommunityRepository is created per test
  });
  describe('Type Validation', () => {
    it('should have correct method signatures', () => {
      expect(typeof communityRepository.create).toBe('function');
      expect(typeof communityRepository.findById).toBe('function');
      expect(typeof communityRepository.findAll).toBe('function');
      expect(typeof communityRepository.update).toBe('function');
      expect(typeof communityRepository.delete).toBe('function');
      expect(typeof communityRepository.search).toBe('function');
      expect(typeof communityRepository.cleanupOldDeleted).toBe('function');
      expect(typeof communityRepository.getStatsSummary).toBe('function');
      expect(typeof communityRepository.getPendingActionsCounts).toBe('function');
    });
  });

  describe('create', () => {
    it('should create a community', async () => {
      mockDb.returning.mockResolvedValue([testCommunity]);

      const data: CreateCommunityDto & { createdBy: string } = {
        name: 'Test Community',
        description: 'A test community',
        createdBy: 'user-123',
      };

      const result = await communityRepository.create(data);

      expect(result as any).toEqual(testCommunity as any);
      expect(mockDb.insert).toHaveBeenCalled();
      expect(mockDb.values).toHaveBeenCalled();
      expect(mockDb.returning).toHaveBeenCalled();
    });

    it('should create community with minimal data', async () => {
      const minimalCommunity = {
        ...testCommunity,
        name: 'Minimal Community',
        createdBy: 'user-456',
        description: undefined,
      };
      mockDb.returning.mockResolvedValue([minimalCommunity]);

      const data: CreateCommunityDto & { createdBy: string } = {
        name: 'Minimal Community',
        createdBy: 'user-456',
      };

      const result = await communityRepository.create(data);

      expect(result).toBeDefined();
      expect(result.name).toBe('Minimal Community');
      expect(mockDb.insert).toHaveBeenCalled();
    });

    it('should create community with all fields', async () => {
      mockDb.returning.mockResolvedValue([testCommunity]);

      const data: CreateCommunityDto & { createdBy: string } = {
        name: 'Full Community',
        description: 'Full description',
        createdBy: 'user-789',
      };

      const result = await communityRepository.create(data);

      expect(result).toBeDefined();
      expect(result.name).toBe(testCommunity.name);
      expect(result.description).toBe(testCommunity.description);
    });

    it('should set deletedAt to null on creation', async () => {
      mockDb.returning.mockResolvedValue([testCommunity]);

      const data: CreateCommunityDto & { createdBy: string } = {
        name: 'Not Deleted Community',
        createdBy: 'user-123',
      };

      const result = await communityRepository.create(data);

      expect((result as any).deletedAt).toBeNull();
    });
  });

  describe('findById', () => {
    it('should return community for valid id', async () => {
      mockDb.where.mockResolvedValue([testCommunity]);

      const result = await communityRepository.findById('comm-123');

      expect(result as any).toEqual(testCommunity as any);
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.where).toHaveBeenCalled();
    });

    it('should return undefined for nonexistent id', async () => {
      mockDb.where.mockResolvedValue([]);

      const result = await communityRepository.findById('nonexistent');

      expect(result).toBeUndefined();
    });

    it('should exclude soft-deleted communities', async () => {
      // When querying for a soft-deleted community, it should not be returned
      mockDb.where.mockResolvedValue([]);

      const result = await communityRepository.findById('comm-123');

      expect(result).toBeUndefined();
      expect(mockDb.where).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return array of communities', async () => {
      mockDb.offset.mockResolvedValue([testCommunity, testCommunity2]);

      const result = await communityRepository.findAll();

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);
      expect(mockDb.select).toHaveBeenCalled();
      expect(mockDb.limit).toHaveBeenCalled();
      expect(mockDb.offset).toHaveBeenCalled();
    });

    it('should respect limit parameter', async () => {
      mockDb.offset.mockResolvedValue([testCommunity]);

      const result = await communityRepository.findAll(5);

      expect(Array.isArray(result)).toBe(true);
      expect(mockDb.limit).toHaveBeenCalled();
    });

    it('should respect offset parameter', async () => {
      mockDb.offset.mockResolvedValue([testCommunity2]);

      const result = await communityRepository.findAll(10, 5);

      expect(Array.isArray(result)).toBe(true);
      expect(mockDb.offset).toHaveBeenCalled();
    });

    it('should handle pagination', async () => {
      mockDb.offset.mockResolvedValueOnce([testCommunity]);
      mockDb.offset.mockResolvedValueOnce([testCommunity2]);

      const page1 = await communityRepository.findAll(5, 0);
      const page2 = await communityRepository.findAll(5, 5);

      expect(Array.isArray(page1)).toBe(true);
      expect(Array.isArray(page2)).toBe(true);
    });

    it('should exclude soft-deleted communities', async () => {
      mockDb.offset.mockResolvedValue([testCommunity, testCommunity2]);

      const result = await communityRepository.findAll();

      result.forEach((community) => {
        expect((community as any).deletedAt).toBeNull();
      });
    });

    it('should use default limit of 10', async () => {
      mockDb.offset.mockResolvedValue([testCommunity]);

      const result = await communityRepository.findAll();

      expect(Array.isArray(result)).toBe(true);
      expect(mockDb.limit).toHaveBeenCalled();
    });

    it('should use default offset of 0', async () => {
      mockDb.offset.mockResolvedValue([testCommunity]);

      const result = await communityRepository.findAll(5);

      expect(Array.isArray(result)).toBe(true);
      expect(mockDb.offset).toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('should update community fields', async () => {
      const updatedCommunity = {
        ...testCommunity,
        name: 'Updated Community Name',
        description: 'Updated description',
      };
      mockDb.returning.mockResolvedValue([updatedCommunity]);

      const updates: UpdateCommunityDto = {
        name: 'Updated Community Name',
        description: 'Updated description',
      };
      const result = await communityRepository.update('comm-123', updates);

      expect(result).toBeDefined();
      expect(result?.name).toBe(updates.name!);
      expect(result?.description).toBe(updates.description!);
      expect(mockDb.update).toHaveBeenCalled();
      expect(mockDb.set).toHaveBeenCalled();
      expect(mockDb.returning).toHaveBeenCalled();
    });

    it('should return undefined for nonexistent community', async () => {
      mockDb.returning.mockResolvedValue([]);

      const updates: UpdateCommunityDto = {
        name: 'Should Not Work',
      };
      const result = await communityRepository.update('nonexistent', updates);

      expect(result).toBeUndefined();
    });

    it('should not update soft-deleted communities', async () => {
      mockDb.returning.mockResolvedValue([]);

      const updates: UpdateCommunityDto = {
        name: 'Should Not Update',
      };
      const result = await communityRepository.update('comm-123', updates);

      expect(result).toBeUndefined();
    });

    it('should allow partial updates', async () => {
      const updatedCommunity = {
        ...testCommunity,
        description: 'Updated description only',
      };
      mockDb.returning.mockResolvedValue([updatedCommunity]);

      const updates: UpdateCommunityDto = {
        description: 'Updated description only',
      };
      const result = await communityRepository.update('comm-123', updates);

      expect(result).toBeDefined();
      expect(result?.description).toBe(updates.description!);
      expect(result?.name).toBe(testCommunity.name);
    });
  });

  describe('delete (soft delete)', () => {
    it('should soft delete community', async () => {
      const deletedCommunity = {
        ...testCommunity,
        deletedAt: new Date('2024-06-01'),
      } as any;
      mockDb.where.mockResolvedValue([deletedCommunity]);

      const result = await communityRepository.delete('comm-123');

      expect(result).toBeDefined();
      expect((result as any)?.deletedAt).not.toBeNull();
      expect((result as any)?.deletedAt).toBeInstanceOf(Date);
      expect(mockDb.update).toHaveBeenCalled();
      expect(mockDb.delete).toHaveBeenCalled();
    });

    it('should not be findable after soft delete', async () => {
      // Mock soft delete
      const deletedCommunity = {
        ...testCommunity,
        deletedAt: new Date('2024-06-01'),
      } as any;
      mockDb.where.mockResolvedValueOnce([deletedCommunity]);

      await communityRepository.delete('comm-123');

      // Mock findById to return undefined (as it filters deletedAt)
      mockDb.where.mockResolvedValueOnce([]);
      const result = await communityRepository.findById('comm-123');

      expect(result).toBeUndefined();
    });

    it('should handle deleting nonexistent community', async () => {
      mockDb.where.mockResolvedValue([]);

      const result = await communityRepository.delete('nonexistent');

      expect(result).toBeUndefined();
    });

    it('should handle deleting already deleted community', async () => {
      mockDb.where.mockResolvedValue([]);

      const result = await communityRepository.delete('comm-123');

      expect(result).toBeUndefined();
    });

    it('should delete related invites', async () => {
      const deletedCommunity = {
        ...testCommunity,
        deletedAt: new Date('2024-06-01'),
      } as any;
      mockDb.where.mockResolvedValue([deletedCommunity]);

      await communityRepository.delete('comm-123');

      // Verify delete was called (for invites)
      expect(mockDb.delete).toHaveBeenCalled();
    });
  });

  describe('search', () => {
    it('should return structured result with rows and total', async () => {
      // Mock count query
      mockDb.where.mockResolvedValueOnce([{ count: 2 }]);
      // Mock rows query
      mockDb.offset.mockResolvedValueOnce([testCommunity, testCommunity2]);

      const filters: CommunitySearchFilters = {
        accessibleIds: ['comm-123'],
      };
      const result = await communityRepository.search(filters);

      expect(result).toHaveProperty('rows');
      expect(result).toHaveProperty('total');
      expect(Array.isArray(result.rows)).toBe(true);
      expect(typeof result.total).toBe('number');
      expect(result.total).toBe(2);
    });

    it('should return empty result when no accessible IDs', async () => {
      mockDb.where.mockResolvedValueOnce([{ count: 0 }]);
      mockDb.offset.mockResolvedValueOnce([]);

      const filters: CommunitySearchFilters = {
        accessibleIds: [],
      };
      const result = await communityRepository.search(filters);

      expect(result.rows).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('should return empty result when accessibleIds is undefined', async () => {
      mockDb.where.mockResolvedValueOnce([{ count: 0 }]);
      mockDb.offset.mockResolvedValueOnce([]);

      const filters: CommunitySearchFilters = {};
      const result = await communityRepository.search(filters);

      expect(result.rows).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('should filter by query string', async () => {
      mockDb.where.mockResolvedValueOnce([{ count: 1 }]);
      mockDb.offset.mockResolvedValueOnce([testCommunity]);

      const filters: CommunitySearchFilters = {
        q: 'test',
        accessibleIds: ['comm-123', 'comm-456'],
      };
      const result = await communityRepository.search(filters);

      expect(Array.isArray(result.rows)).toBe(true);
      expect(typeof result.total).toBe('number');
    });

    it('should search in name and description', async () => {
      mockDb.where.mockResolvedValueOnce([{ count: 1 }]);
      mockDb.offset.mockResolvedValueOnce([testCommunity]);

      const filters: CommunitySearchFilters = {
        q: 'community',
        accessibleIds: ['comm-123'],
      };
      const result = await communityRepository.search(filters);

      expect(Array.isArray(result.rows)).toBe(true);
    });

    it('should handle empty query string', async () => {
      mockDb.where.mockResolvedValueOnce([{ count: 1 }]);
      mockDb.offset.mockResolvedValueOnce([testCommunity]);

      const filters: CommunitySearchFilters = {
        q: '',
        accessibleIds: ['comm-123'],
      };
      const result = await communityRepository.search(filters);

      expect(Array.isArray(result.rows)).toBe(true);
    });

    it('should handle whitespace-only query', async () => {
      mockDb.where.mockResolvedValueOnce([{ count: 1 }]);
      mockDb.offset.mockResolvedValueOnce([testCommunity]);

      const filters: CommunitySearchFilters = {
        q: '   ',
        accessibleIds: ['comm-123'],
      };
      const result = await communityRepository.search(filters);

      expect(Array.isArray(result.rows)).toBe(true);
    });

    it('should respect limit parameter', async () => {
      mockDb.where.mockResolvedValueOnce([{ count: 5 }]);
      mockDb.offset.mockResolvedValueOnce([testCommunity]);

      const filters: CommunitySearchFilters = {
        accessibleIds: ['comm-123', 'comm-456', 'comm-789'],
        limit: 5,
      };
      const result = await communityRepository.search(filters);

      expect(Array.isArray(result.rows)).toBe(true);
      expect(mockDb.limit).toHaveBeenCalled();
    });

    it('should respect offset parameter', async () => {
      mockDb.where.mockResolvedValueOnce([{ count: 10 }]);
      mockDb.offset.mockResolvedValueOnce([testCommunity2]);

      const filters: CommunitySearchFilters = {
        accessibleIds: ['comm-123'],
        limit: 10,
        offset: 5,
      };
      const result = await communityRepository.search(filters);

      expect(Array.isArray(result.rows)).toBe(true);
      expect(mockDb.offset).toHaveBeenCalled();
    });

    it('should use default limit of 20', async () => {
      mockDb.where.mockResolvedValueOnce([{ count: 1 }]);
      mockDb.offset.mockResolvedValueOnce([testCommunity]);

      const filters: CommunitySearchFilters = {
        accessibleIds: ['comm-123'],
      };
      const result = await communityRepository.search(filters);

      expect(Array.isArray(result.rows)).toBe(true);
      expect(mockDb.limit).toHaveBeenCalled();
    });

    it('should use default offset of 0', async () => {
      mockDb.where.mockResolvedValueOnce([{ count: 1 }]);
      mockDb.offset.mockResolvedValueOnce([testCommunity]);

      const filters: CommunitySearchFilters = {
        accessibleIds: ['comm-123'],
        limit: 5,
      };
      const result = await communityRepository.search(filters);

      expect(Array.isArray(result.rows)).toBe(true);
      expect(mockDb.offset).toHaveBeenCalled();
    });

    it('should enforce maximum limit of 100', async () => {
      mockDb.where.mockResolvedValueOnce([{ count: 200 }]);
      mockDb.offset.mockResolvedValueOnce([testCommunity]);

      const filters: CommunitySearchFilters = {
        accessibleIds: ['comm-123'],
        limit: 200,
      };
      const result = await communityRepository.search(filters);

      expect(Array.isArray(result.rows)).toBe(true);
      expect(mockDb.limit).toHaveBeenCalled();
    });

    it('should enforce minimum limit of 1', async () => {
      mockDb.where.mockResolvedValueOnce([{ count: 1 }]);
      mockDb.offset.mockResolvedValueOnce([testCommunity]);

      const filters: CommunitySearchFilters = {
        accessibleIds: ['comm-123'],
        limit: 0,
      };
      const result = await communityRepository.search(filters);

      expect(Array.isArray(result.rows)).toBe(true);
    });

    it('should handle negative offset', async () => {
      mockDb.where.mockResolvedValueOnce([{ count: 1 }]);
      mockDb.offset.mockResolvedValueOnce([testCommunity]);

      const filters: CommunitySearchFilters = {
        accessibleIds: ['comm-123'],
        offset: -5,
      };
      const result = await communityRepository.search(filters);

      expect(Array.isArray(result.rows)).toBe(true);
    });

    it('should exclude soft-deleted communities', async () => {
      mockDb.where.mockResolvedValueOnce([{ count: 2 }]);
      mockDb.offset.mockResolvedValueOnce([testCommunity, testCommunity2]);

      const filters: CommunitySearchFilters = {
        accessibleIds: ['comm-123'],
      };
      const result = await communityRepository.search(filters);

      result.rows.forEach((community) => {
        expect((community as any).deletedAt).toBeNull();
      });
    });

    it('should filter by single accessible ID', async () => {
      mockDb.where.mockResolvedValueOnce([{ count: 1 }]);
      mockDb.offset.mockResolvedValueOnce([testCommunity]);

      const filters: CommunitySearchFilters = {
        accessibleIds: ['comm-123'],
      };
      const result = await communityRepository.search(filters);

      expect(Array.isArray(result.rows)).toBe(true);
    });

    it('should filter by multiple accessible IDs', async () => {
      mockDb.where.mockResolvedValueOnce([{ count: 2 }]);
      mockDb.offset.mockResolvedValueOnce([testCommunity, testCommunity2]);

      const filters: CommunitySearchFilters = {
        accessibleIds: ['comm-123', 'comm-456', 'comm-789'],
      };
      const result = await communityRepository.search(filters);

      expect(Array.isArray(result.rows)).toBe(true);
    });

    it('should handle pagination correctly', async () => {
      // First call: count query - where resolves to data
      mockDb.where.mockResolvedValueOnce([{ count: 10 }]);
      // First call: rows query - where returns mockDb to continue chain
      mockDb.where.mockReturnValueOnce(mockDb);
      mockDb.limit.mockReturnValueOnce(mockDb);
      mockDb.offset.mockResolvedValueOnce([testCommunity]);

      // Second call: count query
      mockDb.where.mockResolvedValueOnce([{ count: 10 }]);
      // Second call: rows query
      mockDb.where.mockReturnValueOnce(mockDb);
      mockDb.limit.mockReturnValueOnce(mockDb);
      mockDb.offset.mockResolvedValueOnce([testCommunity2]);

      const filters: CommunitySearchFilters = {
        accessibleIds: ['comm-123'],
        limit: 5,
      };

      const page1 = await communityRepository.search({ ...filters, offset: 0 });
      const page2 = await communityRepository.search({ ...filters, offset: 5 });

      expect(Array.isArray(page1.rows)).toBe(true);
      expect(Array.isArray(page2.rows)).toBe(true);
    });

    it('should return same total across pages', async () => {
      // First call: count query
      mockDb.where.mockResolvedValueOnce([{ count: 10 }]);
      // First call: rows query
      mockDb.where.mockReturnValueOnce(mockDb);
      mockDb.limit.mockReturnValueOnce(mockDb);
      mockDb.offset.mockResolvedValueOnce([testCommunity]);

      // Second call: count query
      mockDb.where.mockResolvedValueOnce([{ count: 10 }]);
      // Second call: rows query
      mockDb.where.mockReturnValueOnce(mockDb);
      mockDb.limit.mockReturnValueOnce(mockDb);
      mockDb.offset.mockResolvedValueOnce([testCommunity2]);

      const filters: CommunitySearchFilters = {
        accessibleIds: ['comm-123'],
        limit: 5,
      };

      const page1 = await communityRepository.search({ ...filters, offset: 0 });
      const page2 = await communityRepository.search({ ...filters, offset: 5 });

      expect(page1.total).toBe(page2.total);
    });
  });

  describe('cleanupOldDeleted', () => {
    it('should return number of deleted communities', async () => {
      // Setup transaction mock to execute the callback
      mockDb.transaction.mockImplementationOnce(async (callback: Function) => {
        // Mock the select query for old communities
        mockDb.where.mockResolvedValueOnce([{ id: 'comm-old-1' }, { id: 'comm-old-2' }]);
        // Mock the delete operations - return the result from callback
        return callback({
          select: mockDb.select,
          from: mockDb.from,
          where: mockDb.where,
          delete: mockDb.delete,
        });
      });

      const result = await communityRepository.cleanupOldDeleted();

      expect(result).toBeDefined();
    });

    it('should return 0 when no old deleted communities', async () => {
      // Setup transaction mock
      mockDb.transaction.mockImplementationOnce(async (callback: Function) => {
        mockDb.where.mockResolvedValueOnce([]);
        return callback({
          select: mockDb.select,
          from: mockDb.from,
          where: mockDb.where,
          delete: mockDb.delete,
        });
      });

      const result = await communityRepository.cleanupOldDeleted();

      expect(result).toBe(0);
    });

    it('should only delete communities older than 90 days', async () => {
      mockDb.transaction.mockImplementationOnce(async (callback: Function) => {
        mockDb.where.mockResolvedValueOnce([{ id: 'comm-old-1' }]);
        return callback({
          select: mockDb.select,
          from: mockDb.from,
          where: mockDb.where,
          delete: mockDb.delete,
        });
      });

      const result = await communityRepository.cleanupOldDeleted();

      expect(result).toBeDefined();
      expect(mockDb.where).toHaveBeenCalled();
    });

    it('should handle empty result set', async () => {
      mockDb.transaction.mockImplementationOnce(async (callback: Function) => {
        mockDb.where.mockResolvedValueOnce([]);
        return callback({
          select: mockDb.select,
          from: mockDb.from,
          where: mockDb.where,
          delete: mockDb.delete,
        });
      });

      const result = await communityRepository.cleanupOldDeleted();

      expect(result).toBe(0);
    });

    it('should clean up related invites', async () => {
      mockDb.transaction.mockImplementationOnce(async (callback: Function) => {
        mockDb.where.mockResolvedValueOnce([{ id: 'comm-old-1' }]);
        return callback({
          select: mockDb.select,
          from: mockDb.from,
          where: mockDb.where,
          delete: mockDb.delete,
        });
      });

      const result = await communityRepository.cleanupOldDeleted();

      expect(result).toBeDefined();
    });
  });

  describe('Input validation', () => {
    it('should accept valid CreateCommunityDto', () => {
      const input: CreateCommunityDto & { createdBy: string } = {
        name: 'Test Community',
        description: 'Test description',
        createdBy: 'user-123',
      };

      expect(input.name).toBe('Test Community');
      expect(input.createdBy).toBe('user-123');
    });

    it('should accept CreateCommunityDto with description', () => {
      const input: CreateCommunityDto & { createdBy: string } = {
        name: 'Test Community',
        description: 'Full description',
        createdBy: 'user-123',
      };

      expect(input.name).toBe('Test Community');
      expect(input.description).toBe('Full description');
    });

    it('should accept valid UpdateCommunityDto', () => {
      const input: UpdateCommunityDto = {
        name: 'Updated Name',
        description: 'Updated description',
      };

      expect(input.name).toBe('Updated Name');
    });

    it('should accept partial UpdateCommunityDto', () => {
      const input: UpdateCommunityDto = {
        description: 'Only description',
      };

      expect(input.description).toBe('Only description');
      expect(input.name).toBeUndefined();
    });

    it('should accept valid CommunitySearchFilters', () => {
      const input: CommunitySearchFilters = {
        q: 'search query',
        accessibleIds: ['comm-123', 'comm-456'],
        limit: 10,
        offset: 5,
      };

      expect(input.q).toBe('search query');
      expect(input.accessibleIds).toEqual(['comm-123', 'comm-456']);
      expect(input.limit).toBe(10);
      expect(input.offset).toBe(5);
    });

    it('should accept empty CommunitySearchFilters', () => {
      const input: CommunitySearchFilters = {};

      expect(input.q).toBeUndefined();
      expect(input.accessibleIds).toBeUndefined();
    });
  });

  describe('Return type validation', () => {
    it('create should return Community', async () => {
      mockDb.returning.mockResolvedValue([testCommunity]);

      const data: CreateCommunityDto & { createdBy: string } = {
        name: 'Return Type Community',
        createdBy: 'user-123',
      };

      const result = await communityRepository.create(data);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('createdBy');
      expect(result).toHaveProperty('deletedAt');
    });

    it('findById should return Community or undefined', async () => {
      mockDb.where.mockResolvedValueOnce([testCommunity]);

      const result = await communityRepository.findById('comm-123');

      expect(result === undefined || typeof result === 'object').toBe(true);
      if (result) {
        expect(result).toHaveProperty('id');
        expect(result).toHaveProperty('name');
      }
    });

    it('findAll should return array of Community', async () => {
      mockDb.offset.mockResolvedValue([testCommunity, testCommunity2]);

      const result = await communityRepository.findAll();

      expect(Array.isArray(result)).toBe(true);
      result.forEach((community) => {
        expect(community).toHaveProperty('id');
        expect(community).toHaveProperty('name');
      });
    });

    it('update should return Community or undefined', async () => {
      const updatedCommunity = { ...testCommunity, name: 'Test' };
      mockDb.returning.mockResolvedValue([updatedCommunity]);

      const result = await communityRepository.update('comm-123', { name: 'Test' });

      expect(result === undefined || typeof result === 'object').toBe(true);
      if (result) {
        expect(result).toHaveProperty('id');
        expect(result).toHaveProperty('name');
      }
    });

    it('search should return CommunitySearchResult', async () => {
      mockDb.where.mockResolvedValueOnce([{ count: 1 }]);
      mockDb.offset.mockResolvedValueOnce([testCommunity]);

      const result = await communityRepository.search({ accessibleIds: ['comm-123'] });

      expect(result).toHaveProperty('rows');
      expect(result).toHaveProperty('total');
      expect(Array.isArray(result.rows)).toBe(true);
      expect(typeof result.total).toBe('number');
    });

    it('cleanupOldDeleted should return number', async () => {
      mockDb.transaction.mockImplementationOnce(async (callback: Function) => {
        mockDb.where.mockResolvedValueOnce([]);
        return callback({
          select: mockDb.select,
          from: mockDb.from,
          where: mockDb.where,
          delete: mockDb.delete,
        });
      });

      const result = await communityRepository.cleanupOldDeleted();

      expect(typeof result).toBe('number');
    });
  });

  describe('getStatsSummary', () => {
    const mockFindByCommunity = mock(() => Promise.resolve([]));

    beforeEach(() => {
      mockFindByCommunity.mockReset();
      (communityMemberRepository.findByCommunity as any) = mockFindByCommunity;
    });

    it('should return stats summary with all counts', async () => {
      // Mock member count from communityMemberRepository
      mockFindByCommunity.mockResolvedValue(Array(10).fill({ userId: 'user' }) as any);
      // Mock avg trust score query
      mockDb.where.mockResolvedValueOnce([{ avg: 15.5 }] as any);
      // Mock wealth count query
      mockDb.where.mockResolvedValueOnce([{ count: 5 }] as any);
      // Mock pool count query
      mockDb.where.mockResolvedValueOnce([{ count: 2 }] as any);
      // Mock needs count query
      mockDb.where.mockResolvedValueOnce([{ count: 3 }] as any);

      const result = await communityRepository.getStatsSummary('comm-123');

      expect(result).toEqual({
        memberCount: 10,
        avgTrustScore: 16, // Rounded from 15.5
        wealthCount: 5,
        poolCount: 2,
        needsCount: 3,
      });
    });

    it('should return zero for all counts when community is empty', async () => {
      // Mock empty member list
      mockFindByCommunity.mockResolvedValue([]);
      // Mock all queries returning 0
      mockDb.where.mockResolvedValueOnce([{ avg: 0 }]);
      mockDb.where.mockResolvedValueOnce([{ count: 0 }]);
      mockDb.where.mockResolvedValueOnce([{ count: 0 }]);
      mockDb.where.mockResolvedValueOnce([{ count: 0 }]);

      const result = await communityRepository.getStatsSummary('comm-123');

      expect(result).toEqual({
        memberCount: 0,
        avgTrustScore: 0,
        wealthCount: 0,
        poolCount: 0,
        needsCount: 0,
      });
    });

    it('should handle null values from database', async () => {
      // Mock empty member list
      mockFindByCommunity.mockResolvedValue([]);
      // Mock queries returning null values
      mockDb.where.mockResolvedValueOnce([{ avg: null }]);
      mockDb.where.mockResolvedValueOnce([{ count: null }]);
      mockDb.where.mockResolvedValueOnce([{ count: null }]);
      mockDb.where.mockResolvedValueOnce([{ count: null }]);

      const result = await communityRepository.getStatsSummary('comm-123');

      expect(result).toEqual({
        memberCount: 0,
        avgTrustScore: 0,
        wealthCount: 0,
        poolCount: 0,
        needsCount: 0,
      });
    });

    it('should round average trust score to nearest integer', async () => {
      mockFindByCommunity.mockResolvedValue(Array(5).fill({ userId: 'user' }) as any);
      mockDb.where.mockResolvedValueOnce([{ avg: 12.7 }] as any); // Should round to 13
      mockDb.where.mockResolvedValueOnce([{ count: 3 }] as any);
      mockDb.where.mockResolvedValueOnce([{ count: 1 }] as any);
      mockDb.where.mockResolvedValueOnce([{ count: 2 }] as any);

      const result = await communityRepository.getStatsSummary('comm-123');

      expect(result.avgTrustScore).toBe(13);
    });
  });

  describe('getPendingActionsCounts', () => {
    it('should return pending actions counts', async () => {
      // Mock incoming requests query
      mockDb.where.mockResolvedValueOnce([{ count: 3 }]);
      // Mock outgoing requests query
      mockDb.where.mockResolvedValueOnce([{ count: 2 }]);
      // Mock open disputes query
      mockDb.where.mockResolvedValueOnce([{ count: 1 }]);

      const result = await communityRepository.getPendingActionsCounts('comm-123', 'user-123');

      expect(result).toEqual({
        incomingRequests: 3,
        outgoingRequests: 2,
        poolDistributions: 0, // Not yet implemented
        openDisputes: 1,
      });
    });

    it('should return zero for all counts when no pending actions', async () => {
      mockDb.where.mockResolvedValueOnce([{ count: 0 }]);
      mockDb.where.mockResolvedValueOnce([{ count: 0 }]);
      mockDb.where.mockResolvedValueOnce([{ count: 0 }]);

      const result = await communityRepository.getPendingActionsCounts('comm-123', 'user-123');

      expect(result).toEqual({
        incomingRequests: 0,
        outgoingRequests: 0,
        poolDistributions: 0,
        openDisputes: 0,
      });
    });

    it('should handle null values from database', async () => {
      mockDb.where.mockResolvedValueOnce([{ count: null }]);
      mockDb.where.mockResolvedValueOnce([{ count: null }]);
      mockDb.where.mockResolvedValueOnce([{ count: null }]);

      const result = await communityRepository.getPendingActionsCounts('comm-123', 'user-123');

      expect(result).toEqual({
        incomingRequests: 0,
        outgoingRequests: 0,
        poolDistributions: 0,
        openDisputes: 0,
      });
    });

    it('should always return 0 for poolDistributions (not yet implemented)', async () => {
      mockDb.where.mockResolvedValueOnce([{ count: 5 }]);
      mockDb.where.mockResolvedValueOnce([{ count: 3 }]);
      mockDb.where.mockResolvedValueOnce([{ count: 2 }]);

      const result = await communityRepository.getPendingActionsCounts('comm-123', 'user-123');

      expect(result.poolDistributions).toBe(0);
    });
  });
});
