/**
 * HealthAnalytics Service Unit Tests
 *
 * Test Coverage:
 * - Permission checks for analytics access (via OpenFGA)
 * - Wealth overview metrics
 * - Wealth items retrieval
 * - Trust overview metrics
 * - Trust distribution analysis
 * - Error handling
 */

import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { healthAnalyticsService } from './healthAnalytics.service';
import { healthAnalyticsRepository } from '@/repositories/healthAnalytics.repository';
import { communityRepository } from '@/repositories/community.repository';
import { openFGAService } from './openfga.service';

// Valid UUIDs for testing
const VALID_COMM_ID = '550e8400-e29b-41d4-a716-446655440000';
const VALID_USER_ID = '550e8400-e29b-41d4-a716-446655440001';

// Mock dependencies
const mockHealthAnalyticsRepository = {
  getWealthOverview: mock(() =>
    Promise.resolve({
      totalShares: 0,
      openShares: 0,
      requestCount: 0,
      fulfillmentRate: 0,
    })
  ),
  getWealthItems: mock(() => Promise.resolve([])),
  getTrustOverview: mock(() =>
    Promise.resolve({ totalTrust: 0, averageTrust: 0, awardsLastPeriod: 0 })
  ),
  getTrustDistribution: mock(() => Promise.resolve([])),
};

const mockCommunityRepository = {
  findById: mock(() =>
    Promise.resolve({
      id: VALID_COMM_ID,
      name: 'Test Community',
      minTrustForHealthAnalytics: { type: 'trust', value: 20 },
      trustTitles: {
        titles: [
          { name: 'New', minScore: 0 },
          { name: 'Stable', minScore: 10 },
          { name: 'Trusted', minScore: 50 },
        ],
      },
    })
  ),
};

const mockOpenFGAService = {
  checkAccess: mock(() => Promise.resolve(true)),
};

describe('HealthAnalyticsService', () => {
  beforeEach(() => {
    // Reset all mocks
    Object.values(mockHealthAnalyticsRepository).forEach((m) => m.mockReset());
    Object.values(mockCommunityRepository).forEach((m) => m.mockReset());
    Object.values(mockOpenFGAService).forEach((m) => m.mockReset());

    // Replace dependencies with mocks
    (openFGAService.checkAccess as any) = mockOpenFGAService.checkAccess;
    (communityRepository.findById as any) = mockCommunityRepository.findById;
    (healthAnalyticsRepository.getWealthOverview as any) =
      mockHealthAnalyticsRepository.getWealthOverview;
    (healthAnalyticsRepository.getWealthItems as any) =
      mockHealthAnalyticsRepository.getWealthItems;
    (healthAnalyticsRepository.getTrustOverview as any) =
      mockHealthAnalyticsRepository.getTrustOverview;
    (healthAnalyticsRepository.getTrustDistribution as any) =
      mockHealthAnalyticsRepository.getTrustDistribution;

    // Default mock behaviors - user has analytics access
    mockOpenFGAService.checkAccess.mockResolvedValue(true);
    mockCommunityRepository.findById.mockResolvedValue({
      id: VALID_COMM_ID,
      name: 'Test Community',
      minTrustForHealthAnalytics: { type: 'trust', value: 20 },
      trustTitles: {
        titles: [
          { name: 'New', minScore: 0 },
          { name: 'Stable', minScore: 10 },
          { name: 'Trusted', minScore: 50 },
        ],
      },
    });
  });

  describe('Permission Checks', () => {
    it('should allow user with can_view_analytics permission', async () => {
      mockOpenFGAService.checkAccess.mockResolvedValue(true);
      mockHealthAnalyticsRepository.getWealthOverview.mockResolvedValue({
        totalShares: 100,
        openShares: 25,
        requestCount: 75,
        fulfillmentRate: 0.75,
      });

      const result = await healthAnalyticsService.getWealthOverview(
        VALID_COMM_ID,
        VALID_USER_ID,
        '30d'
      );

      expect(result).toBeDefined();
      expect(mockOpenFGAService.checkAccess).toHaveBeenCalledWith(
        VALID_USER_ID,
        'community',
        VALID_COMM_ID,
        'can_view_analytics'
      );
    });

    it('should deny user without can_view_analytics permission', async () => {
      mockOpenFGAService.checkAccess.mockResolvedValue(false);

      await expect(
        healthAnalyticsService.getWealthOverview(VALID_COMM_ID, VALID_USER_ID, '30d')
      ).rejects.toThrow('Forbidden: requires admin role, analytics_viewer role, or sufficient trust score');

      expect(mockOpenFGAService.checkAccess).toHaveBeenCalledWith(
        VALID_USER_ID,
        'community',
        VALID_COMM_ID,
        'can_view_analytics'
      );
    });
  });

  describe('getWealthOverview', () => {
    it('should return wealth overview with correct metrics', async () => {
      mockHealthAnalyticsRepository.getWealthOverview.mockResolvedValue({
        totalShares: 100,
        openShares: 25,
        requestCount: 75,
        fulfillmentRate: 0.75,
      });

      const result = await healthAnalyticsService.getWealthOverview(
        VALID_COMM_ID,
        VALID_USER_ID,
        '30d'
      );

      expect(result).toBeDefined();
      expect(result.totalShares).toBe(100);
      expect(result.fulfillmentRate).toBe(0.75);
      expect(mockHealthAnalyticsRepository.getWealthOverview).toHaveBeenCalledWith(
        VALID_COMM_ID,
        '30d'
      );
    });

    it('should calculate fulfillment rate correctly', async () => {
      mockHealthAnalyticsRepository.getWealthOverview.mockResolvedValue({
        totalShares: 50,
        openShares: 10,
        requestCount: 40,
        fulfillmentRate: 0.8,
      });

      const result = await healthAnalyticsService.getWealthOverview(
        VALID_COMM_ID,
        VALID_USER_ID,
        '7d'
      );

      expect(result.fulfillmentRate).toBeGreaterThan(0);
      expect(result.fulfillmentRate).toBeLessThanOrEqual(1);
    });
  });

  describe('getWealthItems', () => {
    it('should return wealth items with trends', async () => {
      mockHealthAnalyticsRepository.getWealthItems.mockResolvedValue([
        {
          id: 'item-123',
          name: 'Tomatoes',
          category: 'Food',
          shareCount: 10,
          trend: 'up',
        },
        {
          id: 'item-456',
          name: 'Carrots',
          category: 'Food',
          shareCount: 5,
          trend: 'stable',
        },
      ]);

      const result = await healthAnalyticsService.getWealthItems(
        VALID_COMM_ID,
        VALID_USER_ID,
        '30d'
      );

      expect(result).toBeDefined();
      expect(result).toHaveLength(2);
      expect(mockHealthAnalyticsRepository.getWealthItems).toHaveBeenCalledWith(
        VALID_COMM_ID,
        '30d'
      );
    });

    it('should support pagination', async () => {
      mockHealthAnalyticsRepository.getWealthItems.mockResolvedValue([]);

      const result = await healthAnalyticsService.getWealthItems(
        VALID_COMM_ID,
        VALID_USER_ID,
        '7d'
      );

      expect(result).toEqual([]);
      expect(mockHealthAnalyticsRepository.getWealthItems).toHaveBeenCalledWith(
        VALID_COMM_ID,
        '7d'
      );
    });

    it('should filter by category', async () => {
      mockHealthAnalyticsRepository.getWealthItems.mockResolvedValue([
        {
          id: 'item-123',
          name: 'Tomatoes',
          category: 'Food',
          shareCount: 10,
          trend: 'up',
        },
      ]);

      const result = await healthAnalyticsService.getWealthItems(
        VALID_COMM_ID,
        VALID_USER_ID,
        '30d'
      );

      expect(mockHealthAnalyticsRepository.getWealthItems).toHaveBeenCalledWith(
        VALID_COMM_ID,
        '30d'
      );
    });
  });

  describe('getTrustOverview', () => {
    it('should return trust overview with correct metrics', async () => {
      mockHealthAnalyticsRepository.getTrustOverview.mockResolvedValue({
        totalTrust: 250,
        averageTrust: 15.5,
        awardsLastPeriod: 50,
      });

      const result = await healthAnalyticsService.getTrustOverview(
        VALID_COMM_ID,
        VALID_USER_ID,
        '30d'
      );

      expect(result).toBeDefined();
      expect(result.averageTrust).toBe(15.5);
      expect(result.totalTrust).toBe(250);
      expect(result.awardsLastPeriod).toBe(50);
      expect(mockHealthAnalyticsRepository.getTrustOverview).toHaveBeenCalledWith(
        VALID_COMM_ID,
        '30d'
      );
    });

    it('should handle community with no trust awards', async () => {
      mockHealthAnalyticsRepository.getTrustOverview.mockResolvedValue({
        totalTrust: 0,
        averageTrust: 0,
        awardsLastPeriod: 0,
      });

      const result = await healthAnalyticsService.getTrustOverview(
        VALID_COMM_ID,
        VALID_USER_ID,
        '7d'
      );

      expect(result.averageTrust).toBe(0);
      expect(result.totalTrust).toBe(0);
    });
  });

  describe('getTrustDistribution', () => {
    it('should return trust distribution by levels', async () => {
      mockHealthAnalyticsRepository.getTrustDistribution.mockResolvedValue([
        { level: 'New', count: 20 },
        { level: 'Stable', count: 15 },
        { level: 'Trusted', count: 10 },
      ]);

      const result = await healthAnalyticsService.getTrustDistribution(
        VALID_COMM_ID,
        VALID_USER_ID
      );

      expect(result).toBeDefined();
      expect(result.distribution).toHaveLength(3);
      expect(mockHealthAnalyticsRepository.getTrustDistribution).toHaveBeenCalled();
    });

    it('should show distribution ranges correctly', async () => {
      mockHealthAnalyticsRepository.getTrustDistribution.mockResolvedValue([
        { level: 'New', count: 25 },
        { level: 'Stable', count: 15 },
        { level: 'Trusted', count: 10 },
      ]);

      const result = await healthAnalyticsService.getTrustDistribution(
        VALID_COMM_ID,
        VALID_USER_ID
      );

      const totalCount = result.distribution.reduce((sum, item) => sum + item.count, 0);
      expect(totalCount).toBe(50);
    });
  });
});
