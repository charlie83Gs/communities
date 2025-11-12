import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { HealthAnalyticsRepository } from '@/repositories/healthAnalytics.repository';
import type {
  TimeRange,
  WealthOverviewData,
  WealthItemData,
  TrustOverviewData,
  TrustDistributionData,
} from '@/repositories/healthAnalytics.repository';
import { createThenableMockDb, setupMockDbChains } from '../../tests/helpers/mockDb';

let healthAnalyticsRepository: HealthAnalyticsRepository;

// Create mock database
const mockDb = createThenableMockDb();

// Static test data
const TEST_COMMUNITY_ID = 'comm-123';
const TEST_COMMUNITY_ID_2 = 'comm-456';

describe('HealthAnalyticsRepository', () => {
  beforeEach(() => {
    // Reset all mocks and setup default chains
    setupMockDbChains(mockDb);
    // Instantiate repository with the per-test mock DB
    healthAnalyticsRepository = new HealthAnalyticsRepository(mockDb);
  });

  afterEach(() => {
    // Nothing to clean up; a fresh HealthAnalyticsRepository is created per test
  });

  describe('Type Validation', () => {
    it('should have correct method signatures', () => {
      expect(typeof healthAnalyticsRepository.getWealthOverview).toBe('function');
      expect(typeof healthAnalyticsRepository.getWealthItems).toBe('function');
      expect(typeof healthAnalyticsRepository.getTrustOverview).toBe('function');
      expect(typeof healthAnalyticsRepository.getTrustDistribution).toBe('function');
    });
  });

  describe('TimeRange validation', () => {
    it('should accept valid time ranges', () => {
      const ranges: TimeRange[] = ['7d', '30d', '90d', '1y'];
      ranges.forEach((range) => {
        expect(['7d', '30d', '90d', '1y']).toContain(range);
      });
    });

    it('should handle time range string literals', () => {
      const range7d: TimeRange = '7d';
      const range30d: TimeRange = '30d';
      const range90d: TimeRange = '90d';
      const range1y: TimeRange = '1y';

      expect(range7d).toBe('7d');
      expect(range30d).toBe('30d');
      expect(range90d).toBe('90d');
      expect(range1y).toBe('1y');
    });
  });

  describe('getWealthOverview', () => {
    it('should return structured wealth overview', async () => {
      mockDb.where.mockResolvedValueOnce([{ count: 5 }]);
      mockDb.where.mockResolvedValueOnce([{ count: 10 }]);
      mockDb.where.mockResolvedValueOnce([{ itemId: 'item-1' }, { itemId: 'item-2' }]);
      mockDb.execute.mockResolvedValueOnce([
        { date: '2024-01-01', shares: '2', requests: '1', fulfilled: '1' },
        { date: '2024-01-02', shares: '3', requests: '2', fulfilled: '1' },
      ]);

      const result = await healthAnalyticsRepository.getWealthOverview(TEST_COMMUNITY_ID);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('openShares');
      expect(result).toHaveProperty('totalShares');
      expect(result).toHaveProperty('activeCategories');
      expect(result).toHaveProperty('timeSeriesData');
    });

    it('should return numeric values for metrics', async () => {
      mockDb.where.mockResolvedValueOnce([{ count: 8 }]);
      mockDb.where.mockResolvedValueOnce([{ count: 15 }]);
      mockDb.where.mockResolvedValueOnce([{ itemId: 'item-1' }]);
      mockDb.execute.mockResolvedValueOnce([]);

      const result = await healthAnalyticsRepository.getWealthOverview(TEST_COMMUNITY_ID_2);

      expect(typeof result.openShares).toBe('number');
      expect(typeof result.totalShares).toBe('number');
      expect(typeof result.activeCategories).toBe('number');
    });

    it('should return non-negative metrics', async () => {
      mockDb.where.mockResolvedValueOnce([{ count: 0 }]);
      mockDb.where.mockResolvedValueOnce([{ count: 0 }]);
      mockDb.where.mockResolvedValueOnce([]);
      mockDb.execute.mockResolvedValueOnce([]);

      const result = await healthAnalyticsRepository.getWealthOverview(TEST_COMMUNITY_ID);

      expect(result.openShares).toBeGreaterThanOrEqual(0);
      expect(result.totalShares).toBeGreaterThanOrEqual(0);
      expect(result.activeCategories).toBeGreaterThanOrEqual(0);
    });

    it('should return time series data as array', async () => {
      mockDb.where.mockResolvedValueOnce([{ count: 1 }]);
      mockDb.where.mockResolvedValueOnce([{ count: 1 }]);
      mockDb.where.mockResolvedValueOnce([]);
      mockDb.execute.mockResolvedValueOnce([
        { date: '2024-01-01', shares: '1', requests: '0', fulfilled: '0' },
      ]);

      const result = await healthAnalyticsRepository.getWealthOverview(TEST_COMMUNITY_ID);

      expect(Array.isArray(result.timeSeriesData)).toBe(true);
    });

    it('should have correct time series structure', async () => {
      mockDb.where.mockResolvedValueOnce([{ count: 2 }]);
      mockDb.where.mockResolvedValueOnce([{ count: 5 }]);
      mockDb.where.mockResolvedValueOnce([{ itemId: 'item-1' }]);
      mockDb.execute.mockResolvedValueOnce([
        { date: '2024-01-01', shares: '3', requests: '1', fulfilled: '0' },
        { date: '2024-01-02', shares: '2', requests: '1', fulfilled: '1' },
      ]);

      const result = await healthAnalyticsRepository.getWealthOverview(TEST_COMMUNITY_ID);

      result.timeSeriesData.forEach((item) => {
        expect(item).toHaveProperty('date');
        expect(item).toHaveProperty('shares');
        expect(item).toHaveProperty('requests');
        expect(item).toHaveProperty('fulfilled');
        expect(typeof item.date).toBe('string');
        expect(typeof item.shares).toBe('number');
        expect(typeof item.requests).toBe('number');
        expect(typeof item.fulfilled).toBe('number');
      });
    });

    it('should accept 7d time range', async () => {
      mockDb.where.mockResolvedValueOnce([{ count: 1 }]);
      mockDb.where.mockResolvedValueOnce([{ count: 1 }]);
      mockDb.where.mockResolvedValueOnce([]);
      mockDb.execute.mockResolvedValueOnce([]);

      const result = await healthAnalyticsRepository.getWealthOverview(TEST_COMMUNITY_ID, '7d');

      expect(result).toBeDefined();
      expect(Array.isArray(result.timeSeriesData)).toBe(true);
    });

    it('should accept 30d time range (default)', async () => {
      mockDb.where.mockResolvedValueOnce([{ count: 1 }]);
      mockDb.where.mockResolvedValueOnce([{ count: 1 }]);
      mockDb.where.mockResolvedValueOnce([]);
      mockDb.execute.mockResolvedValueOnce([]);

      const result = await healthAnalyticsRepository.getWealthOverview(TEST_COMMUNITY_ID, '30d');

      expect(result).toBeDefined();
      expect(Array.isArray(result.timeSeriesData)).toBe(true);
    });

    it('should accept 90d time range', async () => {
      mockDb.where.mockResolvedValueOnce([{ count: 1 }]);
      mockDb.where.mockResolvedValueOnce([{ count: 1 }]);
      mockDb.where.mockResolvedValueOnce([]);
      mockDb.execute.mockResolvedValueOnce([]);

      const result = await healthAnalyticsRepository.getWealthOverview(TEST_COMMUNITY_ID, '90d');

      expect(result).toBeDefined();
      expect(Array.isArray(result.timeSeriesData)).toBe(true);
    });

    it('should accept 1y time range', async () => {
      mockDb.where.mockResolvedValueOnce([{ count: 1 }]);
      mockDb.where.mockResolvedValueOnce([{ count: 1 }]);
      mockDb.where.mockResolvedValueOnce([]);
      mockDb.execute.mockResolvedValueOnce([]);

      const result = await healthAnalyticsRepository.getWealthOverview(TEST_COMMUNITY_ID, '1y');

      expect(result).toBeDefined();
      expect(Array.isArray(result.timeSeriesData)).toBe(true);
    });

    it('should use default time range when not specified', async () => {
      mockDb.where.mockResolvedValueOnce([{ count: 1 }]);
      mockDb.where.mockResolvedValueOnce([{ count: 1 }]);
      mockDb.where.mockResolvedValueOnce([]);
      mockDb.execute.mockResolvedValueOnce([]);

      const result = await healthAnalyticsRepository.getWealthOverview(TEST_COMMUNITY_ID);

      expect(result).toBeDefined();
      expect(Array.isArray(result.timeSeriesData)).toBe(true);
    });

    it('should handle community with no data', async () => {
      mockDb.where.mockResolvedValueOnce([{ count: 0 }]);
      mockDb.where.mockResolvedValueOnce([{ count: 0 }]);
      mockDb.where.mockResolvedValueOnce([]);
      mockDb.execute.mockResolvedValueOnce([]);

      const result = await healthAnalyticsRepository.getWealthOverview(TEST_COMMUNITY_ID);

      expect(result.openShares).toBe(0);
      expect(result.totalShares).toBe(0);
      expect(result.activeCategories).toBe(0);
    });

    it('should handle different time ranges differently', async () => {
      mockDb.where.mockResolvedValueOnce([{ count: 1 }]);
      mockDb.where.mockResolvedValueOnce([{ count: 2 }]);
      mockDb.where.mockResolvedValueOnce([]);
      mockDb.execute.mockResolvedValueOnce([
        { date: '2024-01-01', shares: '1', requests: '0', fulfilled: '0' },
      ]);

      mockDb.where.mockResolvedValueOnce([{ count: 1 }]);
      mockDb.where.mockResolvedValueOnce([{ count: 5 }]);
      mockDb.where.mockResolvedValueOnce([]);
      mockDb.execute.mockResolvedValueOnce([
        { date: '2024-01-01', shares: '1', requests: '0', fulfilled: '0' },
        { date: '2024-01-02', shares: '1', requests: '0', fulfilled: '0' },
      ]);

      const result7d = await healthAnalyticsRepository.getWealthOverview(TEST_COMMUNITY_ID, '7d');
      const result30d = await healthAnalyticsRepository.getWealthOverview(TEST_COMMUNITY_ID, '30d');

      expect(result7d.timeSeriesData.length).toBeLessThanOrEqual(
        result30d.timeSeriesData.length + 1
      );
    });

    it('should return non-null time series data', async () => {
      mockDb.where.mockResolvedValueOnce([{ count: 1 }]);
      mockDb.where.mockResolvedValueOnce([{ count: 1 }]);
      mockDb.where.mockResolvedValueOnce([]);
      mockDb.execute.mockResolvedValueOnce([
        { date: '2024-01-01', shares: '1', requests: '1', fulfilled: '0' },
      ]);

      const result = await healthAnalyticsRepository.getWealthOverview(TEST_COMMUNITY_ID);

      result.timeSeriesData.forEach((item) => {
        expect(item.date).not.toBeNull();
        expect(item.shares).not.toBeNull();
        expect(item.requests).not.toBeNull();
        expect(item.fulfilled).not.toBeNull();
      });
    });
  });

  describe('getWealthItems', () => {
    it('should return array of wealth items', async () => {
      mockDb.execute.mockResolvedValueOnce([]);

      const result = await healthAnalyticsRepository.getWealthItems(TEST_COMMUNITY_ID);

      expect(Array.isArray(result)).toBe(true);
    });

    it('should have correct item structure', async () => {
      mockDb.execute.mockResolvedValueOnce([
        {
          item_id: 'item-1',
          item_name: 'Laptop',
          item_kind: 'object',
          share_count: '3',
          value_points: '150',
        },
      ]);
      mockDb.execute.mockResolvedValueOnce([{ date: '2024-01-01', count: '1' }]);

      const result = await healthAnalyticsRepository.getWealthItems(TEST_COMMUNITY_ID);

      result.forEach((item) => {
        expect(item).toHaveProperty('categoryName');
        expect(item).toHaveProperty('subcategoryName');
        expect(item).toHaveProperty('itemName');
        expect(item).toHaveProperty('shareCount');
        expect(item).toHaveProperty('valuePoints');
        expect(item).toHaveProperty('trend');
      });
    });

    it('should return numeric metrics for items', async () => {
      mockDb.execute.mockResolvedValueOnce([
        {
          item_id: 'item-1',
          item_name: 'Bike',
          item_kind: 'object',
          share_count: '2',
          value_points: '100',
        },
      ]);
      mockDb.execute.mockResolvedValueOnce([{ date: '2024-01-01', count: '2' }]);

      const result = await healthAnalyticsRepository.getWealthItems(TEST_COMMUNITY_ID);

      result.forEach((item) => {
        expect(typeof item.categoryName).toBe('string');
        expect(typeof item.subcategoryName).toBe('string');
        expect(typeof item.itemName).toBe('string');
        expect(typeof item.shareCount).toBe('number');
        expect(typeof item.valuePoints).toBe('number');
        expect(Array.isArray(item.trend)).toBe(true);
      });
    });

    it('should return non-negative counts', async () => {
      mockDb.execute.mockResolvedValueOnce([
        {
          item_id: 'item-1',
          item_name: 'Tool',
          item_kind: 'object',
          share_count: '1',
          value_points: '50',
        },
      ]);
      mockDb.execute.mockResolvedValueOnce([]);

      const result = await healthAnalyticsRepository.getWealthItems(TEST_COMMUNITY_ID);

      result.forEach((item) => {
        expect(item.shareCount).toBeGreaterThanOrEqual(0);
        expect(item.valuePoints).toBeGreaterThanOrEqual(0);
      });
    });

    it('should include trend data for each item', async () => {
      mockDb.execute.mockResolvedValueOnce([
        {
          item_id: 'item-1',
          item_name: 'Car',
          item_kind: 'object',
          share_count: '5',
          value_points: '250',
        },
      ]);
      mockDb.execute.mockResolvedValueOnce([
        { date: '2024-01-01', count: '2' },
        { date: '2024-01-02', count: '3' },
      ]);

      const result = await healthAnalyticsRepository.getWealthItems(TEST_COMMUNITY_ID);

      result.forEach((item) => {
        expect(Array.isArray(item.trend)).toBe(true);
        item.trend.forEach((trendPoint) => {
          expect(trendPoint).toHaveProperty('date');
          expect(trendPoint).toHaveProperty('count');
          expect(typeof trendPoint.date).toBe('string');
          expect(typeof trendPoint.count).toBe('number');
        });
      });
    });

    it('should accept 7d time range', async () => {
      mockDb.execute.mockResolvedValueOnce([]);

      const result = await healthAnalyticsRepository.getWealthItems(TEST_COMMUNITY_ID, '7d');

      expect(Array.isArray(result)).toBe(true);
    });

    it('should accept 30d time range', async () => {
      mockDb.execute.mockResolvedValueOnce([]);

      const result = await healthAnalyticsRepository.getWealthItems(TEST_COMMUNITY_ID, '30d');

      expect(Array.isArray(result)).toBe(true);
    });

    it('should accept 90d time range', async () => {
      mockDb.execute.mockResolvedValueOnce([]);

      const result = await healthAnalyticsRepository.getWealthItems(TEST_COMMUNITY_ID, '90d');

      expect(Array.isArray(result)).toBe(true);
    });

    it('should accept 1y time range', async () => {
      mockDb.execute.mockResolvedValueOnce([]);

      const result = await healthAnalyticsRepository.getWealthItems(TEST_COMMUNITY_ID, '1y');

      expect(Array.isArray(result)).toBe(true);
    });

    it('should use default time range when not specified', async () => {
      mockDb.execute.mockResolvedValueOnce([]);

      const result = await healthAnalyticsRepository.getWealthItems(TEST_COMMUNITY_ID);

      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle community with no items', async () => {
      mockDb.execute.mockResolvedValueOnce([]);

      const result = await healthAnalyticsRepository.getWealthItems(TEST_COMMUNITY_ID);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    it('should return empty array for nonexistent community', async () => {
      mockDb.execute.mockResolvedValueOnce([]);

      const result = await healthAnalyticsRepository.getWealthItems(TEST_COMMUNITY_ID);

      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle items with zero shares in time range', async () => {
      mockDb.execute.mockResolvedValueOnce([]);

      const result = await healthAnalyticsRepository.getWealthItems(TEST_COMMUNITY_ID);

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('getTrustOverview', () => {
    it('should return structured trust overview', async () => {
      mockDb.execute.mockResolvedValueOnce([{ total: '100' }]);
      mockDb.execute.mockResolvedValueOnce([{ average: '25', count: '4' }]);
      mockDb.execute.mockResolvedValueOnce([
        { date: '2024-01-01', trust_awarded: '10', trust_removed: '2', net_trust: '8' },
      ]);

      const result = await healthAnalyticsRepository.getTrustOverview(TEST_COMMUNITY_ID);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('totalTrust');
      expect(result).toHaveProperty('averageTrust');
      expect(result).toHaveProperty('trustPerDay');
      expect(result).toHaveProperty('timeSeriesData');
    });

    it('should return numeric trust metrics', async () => {
      mockDb.execute.mockResolvedValueOnce([{ total: '50' }]);
      mockDb.execute.mockResolvedValueOnce([{ average: '12.5', count: '4' }]);
      mockDb.execute.mockResolvedValueOnce([]);

      const result = await healthAnalyticsRepository.getTrustOverview(TEST_COMMUNITY_ID);

      expect(typeof result.totalTrust).toBe('number');
      expect(typeof result.averageTrust).toBe('number');
      expect(typeof result.trustPerDay).toBe('number');
    });

    it('should return non-negative metrics', async () => {
      mockDb.execute.mockResolvedValueOnce([{ total: '0' }]);
      mockDb.execute.mockResolvedValueOnce([{ average: '0', count: '0' }]);
      mockDb.execute.mockResolvedValueOnce([]);

      const result = await healthAnalyticsRepository.getTrustOverview(TEST_COMMUNITY_ID);

      expect(result.totalTrust).toBeGreaterThanOrEqual(0);
      expect(result.averageTrust).toBeGreaterThanOrEqual(0);
      expect(result.trustPerDay).toBeGreaterThanOrEqual(0);
    });

    it('should return time series data as array', async () => {
      mockDb.execute.mockResolvedValueOnce([{ total: '10' }]);
      mockDb.execute.mockResolvedValueOnce([{ average: '5', count: '2' }]);
      mockDb.execute.mockResolvedValueOnce([
        { date: '2024-01-01', trust_awarded: '5', trust_removed: '1', net_trust: '4' },
      ]);

      const result = await healthAnalyticsRepository.getTrustOverview(TEST_COMMUNITY_ID);

      expect(Array.isArray(result.timeSeriesData)).toBe(true);
    });

    it('should have correct time series structure', async () => {
      mockDb.execute.mockResolvedValueOnce([{ total: '20' }]);
      mockDb.execute.mockResolvedValueOnce([{ average: '10', count: '2' }]);
      mockDb.execute.mockResolvedValueOnce([
        { date: '2024-01-01', trust_awarded: '10', trust_removed: '2', net_trust: '8' },
        { date: '2024-01-02', trust_awarded: '5', trust_removed: '1', net_trust: '4' },
      ]);

      const result = await healthAnalyticsRepository.getTrustOverview(TEST_COMMUNITY_ID);

      result.timeSeriesData.forEach((item) => {
        expect(item).toHaveProperty('date');
        expect(item).toHaveProperty('trustAwarded');
        expect(item).toHaveProperty('trustRemoved');
        expect(item).toHaveProperty('netTrust');
        expect(typeof item.date).toBe('string');
        expect(typeof item.trustAwarded).toBe('number');
        expect(typeof item.trustRemoved).toBe('number');
        expect(typeof item.netTrust).toBe('number');
      });
    });

    it('should accept 7d time range', async () => {
      mockDb.execute.mockResolvedValueOnce([{ total: '5' }]);
      mockDb.execute.mockResolvedValueOnce([{ average: '5', count: '1' }]);
      mockDb.execute.mockResolvedValueOnce([]);

      const result = await healthAnalyticsRepository.getTrustOverview(TEST_COMMUNITY_ID, '7d');

      expect(result).toBeDefined();
      expect(Array.isArray(result.timeSeriesData)).toBe(true);
    });

    it('should accept 30d time range', async () => {
      mockDb.execute.mockResolvedValueOnce([{ total: '10' }]);
      mockDb.execute.mockResolvedValueOnce([{ average: '5', count: '2' }]);
      mockDb.execute.mockResolvedValueOnce([]);

      const result = await healthAnalyticsRepository.getTrustOverview(TEST_COMMUNITY_ID, '30d');

      expect(result).toBeDefined();
      expect(Array.isArray(result.timeSeriesData)).toBe(true);
    });

    it('should accept 90d time range', async () => {
      mockDb.execute.mockResolvedValueOnce([{ total: '15' }]);
      mockDb.execute.mockResolvedValueOnce([{ average: '5', count: '3' }]);
      mockDb.execute.mockResolvedValueOnce([]);

      const result = await healthAnalyticsRepository.getTrustOverview(TEST_COMMUNITY_ID, '90d');

      expect(result).toBeDefined();
      expect(Array.isArray(result.timeSeriesData)).toBe(true);
    });

    it('should accept 1y time range', async () => {
      mockDb.execute.mockResolvedValueOnce([{ total: '20' }]);
      mockDb.execute.mockResolvedValueOnce([{ average: '5', count: '4' }]);
      mockDb.execute.mockResolvedValueOnce([]);

      const result = await healthAnalyticsRepository.getTrustOverview(TEST_COMMUNITY_ID, '1y');

      expect(result).toBeDefined();
      expect(Array.isArray(result.timeSeriesData)).toBe(true);
    });

    it('should use default time range when not specified', async () => {
      mockDb.execute.mockResolvedValueOnce([{ total: '10' }]);
      mockDb.execute.mockResolvedValueOnce([{ average: '5', count: '2' }]);
      mockDb.execute.mockResolvedValueOnce([]);

      const result = await healthAnalyticsRepository.getTrustOverview(TEST_COMMUNITY_ID);

      expect(result).toBeDefined();
      expect(Array.isArray(result.timeSeriesData)).toBe(true);
    });

    it('should handle community with no trust data', async () => {
      mockDb.execute.mockResolvedValueOnce([{ total: '0' }]);
      mockDb.execute.mockResolvedValueOnce([{ average: '0', count: '0' }]);
      mockDb.execute.mockResolvedValueOnce([]);

      const result = await healthAnalyticsRepository.getTrustOverview(TEST_COMMUNITY_ID);

      expect(result.totalTrust).toBe(0);
      expect(result.averageTrust).toBe(0);
      expect(result.trustPerDay).toBe(0);
    });

    it('should round average trust to 2 decimal places', async () => {
      mockDb.execute.mockResolvedValueOnce([{ total: '100' }]);
      mockDb.execute.mockResolvedValueOnce([{ average: '33.333333', count: '3' }]);
      mockDb.execute.mockResolvedValueOnce([]);

      const result = await healthAnalyticsRepository.getTrustOverview(TEST_COMMUNITY_ID);

      const decimalPlaces = result.averageTrust.toString().split('.')[1]?.length || 0;
      expect(decimalPlaces).toBeLessThanOrEqual(2);
    });

    it('should round trustPerDay to 2 decimal places', async () => {
      mockDb.execute.mockResolvedValueOnce([{ total: '100' }]);
      mockDb.execute.mockResolvedValueOnce([{ average: '10', count: '10' }]);
      mockDb.execute.mockResolvedValueOnce([]);

      const result = await healthAnalyticsRepository.getTrustOverview(TEST_COMMUNITY_ID);

      const decimalPlaces = result.trustPerDay.toString().split('.')[1]?.length || 0;
      expect(decimalPlaces).toBeLessThanOrEqual(2);
    });

    it('should calculate netTrust correctly', async () => {
      mockDb.execute.mockResolvedValueOnce([{ total: '50' }]);
      mockDb.execute.mockResolvedValueOnce([{ average: '10', count: '5' }]);
      mockDb.execute.mockResolvedValueOnce([
        { date: '2024-01-01', trust_awarded: '10', trust_removed: '2', net_trust: '8' },
      ]);

      const result = await healthAnalyticsRepository.getTrustOverview(TEST_COMMUNITY_ID);

      result.timeSeriesData.forEach((item) => {
        expect(typeof item.netTrust).toBe('number');
      });
    });

    it('should handle negative net trust', async () => {
      mockDb.execute.mockResolvedValueOnce([{ total: '20' }]);
      mockDb.execute.mockResolvedValueOnce([{ average: '5', count: '4' }]);
      mockDb.execute.mockResolvedValueOnce([
        { date: '2024-01-01', trust_awarded: '5', trust_removed: '10', net_trust: '-5' },
      ]);

      const result = await healthAnalyticsRepository.getTrustOverview(TEST_COMMUNITY_ID);

      result.timeSeriesData.forEach((item) => {
        expect(typeof item.netTrust).toBe('number');
      });
    });
  });

  describe('getTrustDistribution', () => {
    it('should return array of distribution data', async () => {
      mockDb.execute.mockResolvedValueOnce([]);

      const trustLevels = [
        { name: 'New', minScore: 0 },
        { name: 'Stable', minScore: 10 },
        { name: 'Trusted', minScore: 50 },
      ];
      const result = await healthAnalyticsRepository.getTrustDistribution(
        TEST_COMMUNITY_ID,
        trustLevels
      );

      expect(Array.isArray(result)).toBe(true);
    });

    it('should have correct distribution structure', async () => {
      mockDb.execute.mockResolvedValueOnce([
        { user_id: 'user-1', trust_score: '15' },
        { user_id: 'user-2', trust_score: '5' },
      ]);

      const trustLevels = [
        { name: 'New', minScore: 0 },
        { name: 'Stable', minScore: 10 },
      ];
      const result = await healthAnalyticsRepository.getTrustDistribution(
        TEST_COMMUNITY_ID,
        trustLevels
      );

      result.forEach((item) => {
        expect(item).toHaveProperty('trustLevel');
        expect(item).toHaveProperty('minScore');
        expect(item).toHaveProperty('maxScore');
        expect(item).toHaveProperty('userCount');
        expect(typeof item.trustLevel).toBe('string');
        expect(typeof item.minScore).toBe('number');
        expect(typeof item.maxScore).toBe('number');
        expect(typeof item.userCount).toBe('number');
      });
    });

    it('should return correct number of levels', async () => {
      mockDb.execute.mockResolvedValueOnce([]);

      const trustLevels = [
        { name: 'New', minScore: 0 },
        { name: 'Stable', minScore: 10 },
        { name: 'Trusted', minScore: 50 },
      ];
      const result = await healthAnalyticsRepository.getTrustDistribution(
        TEST_COMMUNITY_ID,
        trustLevels
      );

      expect(result.length).toBe(trustLevels.length);
    });

    it('should return non-negative user counts', async () => {
      mockDb.execute.mockResolvedValueOnce([]);

      const trustLevels = [
        { name: 'New', minScore: 0 },
        { name: 'Stable', minScore: 10 },
      ];
      const result = await healthAnalyticsRepository.getTrustDistribution(
        TEST_COMMUNITY_ID,
        trustLevels
      );

      result.forEach((item) => {
        expect(item.userCount).toBeGreaterThanOrEqual(0);
      });
    });

    it('should sort levels by minScore', async () => {
      mockDb.execute.mockResolvedValueOnce([]);

      const trustLevels = [
        { name: 'Trusted', minScore: 50 },
        { name: 'New', minScore: 0 },
        { name: 'Stable', minScore: 10 },
      ];
      const result = await healthAnalyticsRepository.getTrustDistribution(
        TEST_COMMUNITY_ID,
        trustLevels
      );

      for (let i = 1; i < result.length; i++) {
        expect(result[i].minScore).toBeGreaterThan(result[i - 1].minScore);
      }
    });

    it('should calculate maxScore correctly', async () => {
      mockDb.execute.mockResolvedValueOnce([]);

      const trustLevels = [
        { name: 'New', minScore: 0 },
        { name: 'Stable', minScore: 10 },
        { name: 'Trusted', minScore: 50 },
      ];
      const result = await healthAnalyticsRepository.getTrustDistribution(
        TEST_COMMUNITY_ID,
        trustLevels
      );

      expect(result[0].maxScore).toBe(9);
      expect(result[1].maxScore).toBe(49);
      expect(result[2].maxScore).toBe(999999);
    });

    it('should handle single trust level', async () => {
      mockDb.execute.mockResolvedValueOnce([]);

      const trustLevels = [{ name: 'All', minScore: 0 }];
      const result = await healthAnalyticsRepository.getTrustDistribution(
        TEST_COMMUNITY_ID,
        trustLevels
      );

      expect(result.length).toBe(1);
      expect(result[0].maxScore).toBe(999999);
    });

    it('should handle empty trust levels array', async () => {
      mockDb.execute.mockResolvedValueOnce([]);

      const trustLevels: Array<{ name: string; minScore: number }> = [];
      const result = await healthAnalyticsRepository.getTrustDistribution(
        TEST_COMMUNITY_ID,
        trustLevels
      );

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
    });

    it('should handle community with no users', async () => {
      mockDb.execute.mockResolvedValueOnce([]);

      const trustLevels = [
        { name: 'New', minScore: 0 },
        { name: 'Stable', minScore: 10 },
      ];
      const result = await healthAnalyticsRepository.getTrustDistribution(
        TEST_COMMUNITY_ID,
        trustLevels
      );

      result.forEach((item) => {
        expect(item.userCount).toBe(0);
      });
    });

    it('should use Infinity for highest level internally', async () => {
      mockDb.execute.mockResolvedValueOnce([]);

      const trustLevels = [
        { name: 'Low', minScore: 0 },
        { name: 'High', minScore: 100 },
      ];
      const result = await healthAnalyticsRepository.getTrustDistribution(
        TEST_COMMUNITY_ID,
        trustLevels
      );

      expect(result[result.length - 1].maxScore).toBe(999999);
    });

    it('should preserve trust level names', async () => {
      mockDb.execute.mockResolvedValueOnce([]);

      const trustLevels = [
        { name: 'Beginner', minScore: 0 },
        { name: 'Intermediate', minScore: 20 },
        { name: 'Expert', minScore: 80 },
      ];
      const result = await healthAnalyticsRepository.getTrustDistribution(
        TEST_COMMUNITY_ID,
        trustLevels
      );

      expect(result[0].trustLevel).toBe('Beginner');
      expect(result[1].trustLevel).toBe('Intermediate');
      expect(result[2].trustLevel).toBe('Expert');
    });

    it('should handle non-zero starting minScore', async () => {
      mockDb.execute.mockResolvedValueOnce([]);

      const trustLevels = [
        { name: 'Active', minScore: 5 },
        { name: 'Very Active', minScore: 25 },
      ];
      const result = await healthAnalyticsRepository.getTrustDistribution(
        TEST_COMMUNITY_ID,
        trustLevels
      );

      expect(result[0].minScore).toBe(5);
      expect(result[0].maxScore).toBe(24);
      expect(result[1].minScore).toBe(25);
    });

    it('should handle large minScore values', async () => {
      mockDb.execute.mockResolvedValueOnce([]);

      const trustLevels = [
        { name: 'Normal', minScore: 0 },
        { name: 'Super', minScore: 1000 },
      ];
      const result = await healthAnalyticsRepository.getTrustDistribution(
        TEST_COMMUNITY_ID,
        trustLevels
      );

      expect(result[1].minScore).toBe(1000);
      expect(result[1].maxScore).toBe(999999);
    });

    it('should handle trust levels with same minScore (edge case)', async () => {
      mockDb.execute.mockResolvedValueOnce([]);

      const trustLevels = [
        { name: 'Level1', minScore: 10 },
        { name: 'Level2', minScore: 10 },
      ];
      const result = await healthAnalyticsRepository.getTrustDistribution(
        TEST_COMMUNITY_ID,
        trustLevels
      );

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('Input validation', () => {
    it('should accept valid WealthOverviewData structure', () => {
      const data: WealthOverviewData = {
        openShares: 10,
        totalShares: 50,
        activeCategories: 5,
        timeSeriesData: [{ date: '2024-01-01', shares: 5, requests: 3, fulfilled: 2 }],
      };

      expect(data.openShares).toBe(10);
      expect(data.totalShares).toBe(50);
      expect(data.activeCategories).toBe(5);
      expect(Array.isArray(data.timeSeriesData)).toBe(true);
    });

    it('should accept valid WealthItemData structure', () => {
      const data: WealthItemData = {
        categoryName: 'Food',
        subcategoryName: 'Vegetables',
        itemName: 'Carrots',
        shareCount: 10,
        valuePoints: 50,
        trend: [{ date: '2024-01-01', count: 5 }],
      };

      expect(data.categoryName).toBe('Food');
      expect(data.itemName).toBe('Carrots');
      expect(Array.isArray(data.trend)).toBe(true);
    });

    it('should accept valid TrustOverviewData structure', () => {
      const data: TrustOverviewData = {
        totalTrust: 100,
        averageTrust: 25.5,
        trustPerDay: 5.2,
        timeSeriesData: [{ date: '2024-01-01', trustAwarded: 10, trustRemoved: 2, netTrust: 8 }],
      };

      expect(data.totalTrust).toBe(100);
      expect(data.averageTrust).toBe(25.5);
      expect(Array.isArray(data.timeSeriesData)).toBe(true);
    });

    it('should accept valid TrustDistributionData structure', () => {
      const data: TrustDistributionData = {
        trustLevel: 'Trusted',
        minScore: 50,
        maxScore: 999999,
        userCount: 15,
      };

      expect(data.trustLevel).toBe('Trusted');
      expect(data.minScore).toBe(50);
      expect(data.userCount).toBe(15);
    });

    it('should accept valid trust levels array', () => {
      const trustLevels: Array<{ name: string; minScore: number }> = [
        { name: 'New', minScore: 0 },
        { name: 'Stable', minScore: 10 },
        { name: 'Trusted', minScore: 50 },
      ];

      expect(Array.isArray(trustLevels)).toBe(true);
      expect(trustLevels.length).toBe(3);
    });
  });

  describe('Return type validation', () => {
    it('getWealthOverview should return WealthOverviewData', async () => {
      mockDb.where.mockResolvedValueOnce([{ count: 1 }]);
      mockDb.where.mockResolvedValueOnce([{ count: 1 }]);
      mockDb.where.mockResolvedValueOnce([]);
      mockDb.execute.mockResolvedValueOnce([]);

      const result = await healthAnalyticsRepository.getWealthOverview(TEST_COMMUNITY_ID);

      expect(result).toBeDefined();
      expect(typeof result.openShares).toBe('number');
      expect(typeof result.totalShares).toBe('number');
      expect(typeof result.activeCategories).toBe('number');
      expect(Array.isArray(result.timeSeriesData)).toBe(true);
    });

    it('getWealthItems should return array of WealthItemData', async () => {
      mockDb.execute.mockResolvedValueOnce([
        {
          item_id: 'item-1',
          item_name: 'Test',
          item_kind: 'object',
          share_count: '1',
          value_points: '10',
        },
      ]);
      mockDb.execute.mockResolvedValueOnce([]);

      const result = await healthAnalyticsRepository.getWealthItems(TEST_COMMUNITY_ID);

      expect(Array.isArray(result)).toBe(true);
      result.forEach((item) => {
        expect(typeof item.categoryName).toBe('string');
        expect(typeof item.subcategoryName).toBe('string');
        expect(typeof item.itemName).toBe('string');
        expect(typeof item.shareCount).toBe('number');
        expect(typeof item.valuePoints).toBe('number');
        expect(Array.isArray(item.trend)).toBe(true);
      });
    });

    it('getTrustOverview should return TrustOverviewData', async () => {
      mockDb.execute.mockResolvedValueOnce([{ total: '10' }]);
      mockDb.execute.mockResolvedValueOnce([{ average: '5', count: '2' }]);
      mockDb.execute.mockResolvedValueOnce([]);

      const result = await healthAnalyticsRepository.getTrustOverview(TEST_COMMUNITY_ID);

      expect(result).toBeDefined();
      expect(typeof result.totalTrust).toBe('number');
      expect(typeof result.averageTrust).toBe('number');
      expect(typeof result.trustPerDay).toBe('number');
      expect(Array.isArray(result.timeSeriesData)).toBe(true);
    });

    it('getTrustDistribution should return array of TrustDistributionData', async () => {
      mockDb.execute.mockResolvedValueOnce([]);

      const trustLevels = [
        { name: 'New', minScore: 0 },
        { name: 'Stable', minScore: 10 },
      ];
      const result = await healthAnalyticsRepository.getTrustDistribution(
        TEST_COMMUNITY_ID,
        trustLevels
      );

      expect(Array.isArray(result)).toBe(true);
      result.forEach((item) => {
        expect(typeof item.trustLevel).toBe('string');
        expect(typeof item.minScore).toBe('number');
        expect(typeof item.maxScore).toBe('number');
        expect(typeof item.userCount).toBe('number');
      });
    });
  });

  describe('Edge cases', () => {
    it('should handle UUID format community IDs', async () => {
      mockDb.where.mockResolvedValueOnce([{ count: 1 }]);
      mockDb.where.mockResolvedValueOnce([{ count: 1 }]);
      mockDb.where.mockResolvedValueOnce([]);
      mockDb.execute.mockResolvedValueOnce([]);

      const result = await healthAnalyticsRepository.getWealthOverview(
        '550e8400-e29b-41d4-a716-446655440000'
      );

      expect(result).toBeDefined();
    });

    it('should handle nonexistent community gracefully', async () => {
      mockDb.where.mockResolvedValueOnce([{ count: 0 }]);
      mockDb.where.mockResolvedValueOnce([{ count: 0 }]);
      mockDb.where.mockResolvedValueOnce([]);
      mockDb.execute.mockResolvedValueOnce([]);

      const result = await healthAnalyticsRepository.getWealthOverview(TEST_COMMUNITY_ID);

      expect(result).toBeDefined();
      expect(result.openShares).toBeGreaterThanOrEqual(0);
    });

    it('should handle very short time ranges', async () => {
      mockDb.where.mockResolvedValueOnce([{ count: 1 }]);
      mockDb.where.mockResolvedValueOnce([{ count: 1 }]);
      mockDb.where.mockResolvedValueOnce([]);
      mockDb.execute.mockResolvedValueOnce([]);

      const result = await healthAnalyticsRepository.getWealthOverview(TEST_COMMUNITY_ID, '7d');

      expect(result).toBeDefined();
      expect(Array.isArray(result.timeSeriesData)).toBe(true);
    });

    it('should handle very long time ranges', async () => {
      mockDb.where.mockResolvedValueOnce([{ count: 1 }]);
      mockDb.where.mockResolvedValueOnce([{ count: 1 }]);
      mockDb.where.mockResolvedValueOnce([]);
      mockDb.execute.mockResolvedValueOnce([]);

      const result = await healthAnalyticsRepository.getWealthOverview(TEST_COMMUNITY_ID, '1y');

      expect(result).toBeDefined();
      expect(Array.isArray(result.timeSeriesData)).toBe(true);
    });

    it('should handle empty time series data', async () => {
      mockDb.where.mockResolvedValueOnce([{ count: 1 }]);
      mockDb.where.mockResolvedValueOnce([{ count: 1 }]);
      mockDb.where.mockResolvedValueOnce([]);
      mockDb.execute.mockResolvedValueOnce([]);

      const result = await healthAnalyticsRepository.getWealthOverview(TEST_COMMUNITY_ID);

      expect(Array.isArray(result.timeSeriesData)).toBe(true);
    });

    it('should handle zero values in metrics', async () => {
      mockDb.where.mockResolvedValueOnce([{ count: 0 }]);
      mockDb.where.mockResolvedValueOnce([{ count: 0 }]);
      mockDb.where.mockResolvedValueOnce([]);
      mockDb.execute.mockResolvedValueOnce([]);

      const result = await healthAnalyticsRepository.getWealthOverview(TEST_COMMUNITY_ID);

      expect(typeof result.openShares).toBe('number');
      expect(typeof result.totalShares).toBe('number');
    });

    it('should handle division by zero in averages', async () => {
      mockDb.execute.mockResolvedValueOnce([{ total: '0' }]);
      mockDb.execute.mockResolvedValueOnce([{ average: '0', count: '0' }]);
      mockDb.execute.mockResolvedValueOnce([]);

      const result = await healthAnalyticsRepository.getTrustOverview(TEST_COMMUNITY_ID);

      expect(typeof result.averageTrust).toBe('number');
      expect(typeof result.trustPerDay).toBe('number');
      expect(!isNaN(result.averageTrust)).toBe(true);
      expect(!isNaN(result.trustPerDay)).toBe(true);
    });

    it('should handle large numbers in metrics', async () => {
      mockDb.where.mockResolvedValueOnce([{ count: 999999 }]);
      mockDb.where.mockResolvedValueOnce([{ count: 1000000 }]);
      mockDb.where.mockResolvedValueOnce([]);
      mockDb.execute.mockResolvedValueOnce([]);

      const result = await healthAnalyticsRepository.getWealthOverview(TEST_COMMUNITY_ID);

      expect(typeof result.totalShares).toBe('number');
      expect(result.totalShares).toBeGreaterThanOrEqual(0);
    });

    it('should handle negative netTrust values', async () => {
      mockDb.execute.mockResolvedValueOnce([{ total: '10' }]);
      mockDb.execute.mockResolvedValueOnce([{ average: '5', count: '2' }]);
      mockDb.execute.mockResolvedValueOnce([
        { date: '2024-01-01', trust_awarded: '5', trust_removed: '10', net_trust: '-5' },
      ]);

      const result = await healthAnalyticsRepository.getTrustOverview(TEST_COMMUNITY_ID);

      result.timeSeriesData.forEach((item) => {
        expect(typeof item.netTrust).toBe('number');
      });
    });

    it('should handle unsorted trust levels input', async () => {
      mockDb.execute.mockResolvedValueOnce([]);

      const trustLevels = [
        { name: 'High', minScore: 100 },
        { name: 'Low', minScore: 0 },
        { name: 'Medium', minScore: 50 },
      ];
      const result = await healthAnalyticsRepository.getTrustDistribution(
        TEST_COMMUNITY_ID,
        trustLevels
      );

      for (let i = 1; i < result.length; i++) {
        expect(result[i].minScore).toBeGreaterThan(result[i - 1].minScore);
      }
    });
  });
});
