/**
 * TrustAnalytics Service Unit Tests
 *
 * Test Coverage:
 * - Permission checks for analytics access
 * - Trust timeline retrieval
 * - Trust summary calculations
 * - Error handling
 */

import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { trustAnalyticsService } from './trustAnalytics.service';
import { openFGAService } from './openfga.service';
import { trustAnalyticsRepository } from '@/repositories/trustAnalytics.repository';

// Valid UUIDs for testing
const VALID_COMM_ID = '550e8400-e29b-41d4-a716-446655440000';
const VALID_USER_ID = '550e8400-e29b-41d4-a716-446655440001';

// Mock dependencies
const mockOpenFGAService = {
  checkAccess: mock(() => Promise.resolve(true)),
};

const mockTrustAnalyticsRepository = {
  getTrustTimeline: mock(() => Promise.resolve([])),
  getTrustSummary: mock(() =>
    Promise.resolve({ currentScore: 0, totalAwarded: 0, totalReceived: 0 })
  ),
  getCurrentTrustScore: mock(() => Promise.resolve(0)),
};

describe('TrustAnalyticsService', () => {
  beforeEach(() => {
    // Reset all mocks
    Object.values(mockOpenFGAService).forEach((m) => m.mockReset());
    Object.values(mockTrustAnalyticsRepository).forEach((m) => m.mockReset());

    // Replace dependencies with mocks
    (openFGAService.checkAccess as any) = mockOpenFGAService.checkAccess;
    (trustAnalyticsRepository.getTrustTimeline as any) =
      mockTrustAnalyticsRepository.getTrustTimeline;
    (trustAnalyticsRepository.getTrustSummary as any) =
      mockTrustAnalyticsRepository.getTrustSummary;
    (trustAnalyticsRepository.getCurrentTrustScore as any) =
      mockTrustAnalyticsRepository.getCurrentTrustScore;

    // Default mock behaviors
    mockOpenFGAService.checkAccess.mockResolvedValue(true);
  });

  describe('getMyTrustTimeline', () => {
    it('should allow member to get their trust timeline', async () => {
      const timeline = [
        {
          eventType: 'award',
          fromUserId: 'user-2',
          timestamp: new Date('2025-11-01'),
          cumulativeScore: 5,
        },
        {
          eventType: 'award',
          fromUserId: 'user-3',
          timestamp: new Date('2025-11-02'),
          cumulativeScore: 8,
        },
      ];
      mockTrustAnalyticsRepository.getTrustTimeline.mockResolvedValue(timeline as any);

      const result = await trustAnalyticsService.getMyTrustTimeline(VALID_USER_ID, {
        communityId: VALID_COMM_ID,
      });

      expect(result).toBeDefined();
      expect(result).toHaveLength(2);
      expect(mockTrustAnalyticsRepository.getTrustTimeline).toHaveBeenCalledWith(VALID_USER_ID, {
        communityId: VALID_COMM_ID,
        startDate: undefined,
        endDate: undefined,
      });
    });

    it('should reject non-member from getting trust timeline', async () => {
      mockOpenFGAService.checkAccess.mockResolvedValue(false);

      await expect(
        trustAnalyticsService.getMyTrustTimeline(VALID_USER_ID, {
          communityId: VALID_COMM_ID,
        })
      ).rejects.toThrow('You are not a member of this community');

      expect(mockOpenFGAService.checkAccess).toHaveBeenCalledWith(
        VALID_USER_ID,
        'community',
        VALID_COMM_ID,
        'can_read'
      );
    });

    it('should use default pagination values', async () => {
      mockTrustAnalyticsRepository.getTrustTimeline.mockResolvedValue([]);

      await trustAnalyticsService.getMyTrustTimeline(VALID_USER_ID);

      expect(mockTrustAnalyticsRepository.getTrustTimeline).toHaveBeenCalledWith(VALID_USER_ID, {
        communityId: undefined,
        startDate: undefined,
        endDate: undefined,
      });
    });
  });

  describe('getMyTrustSummary', () => {
    it('should allow member to get their trust summary', async () => {
      const summary = {
        currentScore: 15,
        totalAwarded: 5,
        totalReceived: 10,
        trustLevel: 'Trusted',
      };
      mockTrustAnalyticsRepository.getTrustSummary.mockResolvedValue(summary);

      const result = await trustAnalyticsService.getMyTrustSummary(VALID_USER_ID, {
        communityId: VALID_COMM_ID,
      });

      expect(result).toBeDefined();
      expect((result as any).currentScore).toBe(15);
      expect(mockTrustAnalyticsRepository.getTrustSummary).toHaveBeenCalledWith(VALID_USER_ID, {
        communityId: VALID_COMM_ID,
      });
    });

    it('should reject non-member from getting trust summary', async () => {
      mockOpenFGAService.checkAccess.mockResolvedValue(false);

      await expect(
        trustAnalyticsService.getMyTrustSummary(VALID_USER_ID, {
          communityId: VALID_COMM_ID,
        })
      ).rejects.toThrow('You are not a member of this community');

      expect(mockOpenFGAService.checkAccess).toHaveBeenCalledWith(
        VALID_USER_ID,
        'community',
        VALID_COMM_ID,
        'can_read'
      );
    });
  });
});
