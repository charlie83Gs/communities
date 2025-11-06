import { describe, test, expect, mock, beforeEach } from 'bun:test';
import { healthAnalyticsController } from './healthAnalytics.controller';
import { healthAnalyticsService } from '@/services/healthAnalytics.service';
import {
  createMockAuthenticatedRequest,
  createMockResponse,
  createMockNext,
} from '../../../tests/helpers/testUtils';

// Mock the service
const mockHealthAnalyticsService = {
  getWealthOverview: mock(() => Promise.resolve({ totalShares: 0, activeRequests: 0, fulfilledRequests: 0 })),
  getWealthItems: mock(() => Promise.resolve({ items: [], total: 0 })),
  getTrustOverview: mock(() => Promise.resolve({ averageTrust: 0, totalAwards: 0 })),
  getTrustDistribution: mock(() => Promise.resolve({ distribution: [] })),
};

describe('HealthAnalyticsController', () => {
  beforeEach(() => {
    // Reset all mocks
    Object.values(mockHealthAnalyticsService).forEach(m => m.mockReset());

    // Replace service methods with mocks
    Object.keys(mockHealthAnalyticsService).forEach(key => {
      (healthAnalyticsService as any)[key] = (mockHealthAnalyticsService as any)[key];
    });
  });

  describe('getWealthOverview', () => {
    test('should get wealth overview successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123' },
        query: { timeRange: '30d' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const overview = { totalShares: 100, activeRequests: 25, fulfilledRequests: 75 };
      mockHealthAnalyticsService.getWealthOverview.mockResolvedValue(overview);

      await healthAnalyticsController.getWealthOverview(req, res, next);

      expect(mockHealthAnalyticsService.getWealthOverview).toHaveBeenCalledWith('comm-123', 'user-123', '30d');
      expect(res.json).toHaveBeenCalled();
    });

    test('should handle errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123' },
        query: {},
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new Error('Forbidden');
      mockHealthAnalyticsService.getWealthOverview.mockRejectedValue(error);

      await healthAnalyticsController.getWealthOverview(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getWealthItems', () => {
    test('should get wealth items successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123' },
        query: { page: '1', limit: '20', category: 'food' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const result = { items: [], total: 0 };
      mockHealthAnalyticsService.getWealthItems.mockResolvedValue(result);

      await healthAnalyticsController.getWealthItems(req, res, next);

      expect(mockHealthAnalyticsService.getWealthItems).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalled();
    });

    test('should handle errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123' },
        query: {},
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new Error('Database error');
      mockHealthAnalyticsService.getWealthItems.mockRejectedValue(error);

      await healthAnalyticsController.getWealthItems(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getTrustOverview', () => {
    test('should get trust overview successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123' },
        query: { timeRange: '30d' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const overview = { averageTrust: 15, totalAwards: 100, totalMembers: 50 };
      mockHealthAnalyticsService.getTrustOverview.mockResolvedValue(overview);

      await healthAnalyticsController.getTrustOverview(req, res, next);

      expect(mockHealthAnalyticsService.getTrustOverview).toHaveBeenCalledWith('comm-123', 'user-123', '30d');
      expect(res.json).toHaveBeenCalled();
    });

    test('should handle errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123' },
        query: {},
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new Error('Forbidden');
      mockHealthAnalyticsService.getTrustOverview.mockRejectedValue(error);

      await healthAnalyticsController.getTrustOverview(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getTrustDistribution', () => {
    test('should get trust distribution successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123' },
        query: {},
      });
      const res = createMockResponse();
      const next = createMockNext();

      const distribution = {
        distribution: [
          { range: '0-10', count: 20 },
          { range: '11-20', count: 15 },
          { range: '21-30', count: 10 },
        ],
      };
      mockHealthAnalyticsService.getTrustDistribution.mockResolvedValue(distribution);

      await healthAnalyticsController.getTrustDistribution(req, res, next);

      expect(mockHealthAnalyticsService.getTrustDistribution).toHaveBeenCalledWith('comm-123', 'user-123');
      expect(res.json).toHaveBeenCalled();
    });

    test('should handle errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123' },
        query: {},
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new Error('Database error');
      mockHealthAnalyticsService.getTrustDistribution.mockRejectedValue(error);

      await healthAnalyticsController.getTrustDistribution(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
