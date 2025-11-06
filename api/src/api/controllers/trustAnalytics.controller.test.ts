import { describe, test, expect, mock, beforeEach } from 'bun:test';
import { trustAnalyticsController } from './trustAnalytics.controller';
import { trustAnalyticsService } from '@/services/trustAnalytics.service';
import {
  createMockAuthenticatedRequest,
  createMockResponse,
  createMockNext,
} from '../../../tests/helpers/testUtils';

// Mock the service
const mockTrustAnalyticsService = {
  getMyTrustTimeline: mock(() => Promise.resolve({ timeline: [], total: 0 })),
  getMyTrustSummary: mock(() => Promise.resolve({ total: 0, awarded: 0, received: 0 })),
};

describe('TrustAnalyticsController', () => {
  beforeEach(() => {
    // Reset all mocks
    Object.values(mockTrustAnalyticsService).forEach(m => m.mockReset());

    // Replace service methods with mocks
    Object.keys(mockTrustAnalyticsService).forEach(key => {
      (trustAnalyticsService as any)[key] = (mockTrustAnalyticsService as any)[key];
    });
  });

  describe('getMyTrustTimeline', () => {
    test('should get trust timeline successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        query: { communityId: 'comm-123', startDate: '2024-01-01', endDate: '2024-12-31' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const timeline = { timeline: [], total: 0 };
      mockTrustAnalyticsService.getMyTrustTimeline.mockResolvedValue(timeline);

      await trustAnalyticsController.getMyTrustTimeline(req, res, next);

      expect(mockTrustAnalyticsService.getMyTrustTimeline).toHaveBeenCalledWith('user-123', {
        communityId: 'comm-123',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      });
      expect(res.json).toHaveBeenCalled();
    });

    test('should handle errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        query: {},
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new Error('Forbidden');
      mockTrustAnalyticsService.getMyTrustTimeline.mockRejectedValue(error);

      await trustAnalyticsController.getMyTrustTimeline(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getMyTrustSummary', () => {
    test('should get trust summary successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        query: { communityId: 'comm-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const summary = { total: 15, awarded: 5, received: 10 };
      mockTrustAnalyticsService.getMyTrustSummary.mockResolvedValue(summary);

      await trustAnalyticsController.getMyTrustSummary(req, res, next);

      expect(mockTrustAnalyticsService.getMyTrustSummary).toHaveBeenCalledWith('user-123', {
        communityId: 'comm-123',
      });
      expect(res.json).toHaveBeenCalled();
    });

    test('should handle errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        query: {},
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new Error('Database error');
      mockTrustAnalyticsService.getMyTrustSummary.mockRejectedValue(error);

      await trustAnalyticsController.getMyTrustSummary(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
