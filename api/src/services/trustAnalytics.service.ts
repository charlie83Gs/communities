import { AppError } from '../utils/errors';
import {
  trustAnalyticsRepository,
  TrustTimelineEvent,
  TrustSummary,
} from '../repositories/trustAnalytics.repository';
import { communityMemberRepository } from '../repositories/communityMember.repository';

export interface GetTimelineOptions {
  communityId?: string;
  startDate?: string;
  endDate?: string;
}

export interface GetSummaryOptions {
  communityId?: string;
}

export class TrustAnalyticsService {
  /**
   * Get trust timeline for the authenticated user
   * Returns all trust events with cumulative trust calculation
   */
  async getMyTrustTimeline(
    userId: string,
    options?: GetTimelineOptions
  ): Promise<TrustTimelineEvent[]> {
    // Parse date strings if provided
    const parsedOptions = {
      communityId: options?.communityId,
      startDate: options?.startDate ? new Date(options.startDate) : undefined,
      endDate: options?.endDate ? new Date(options.endDate) : undefined,
    };

    // Validate date range
    if (
      parsedOptions.startDate &&
      parsedOptions.endDate &&
      parsedOptions.startDate > parsedOptions.endDate
    ) {
      throw new AppError('Start date must be before end date', 400);
    }

    // Validate community membership if communityId is provided
    if (options?.communityId) {
      const role = await communityMemberRepository.getUserRole(options.communityId, userId);
      if (!role) {
        throw new AppError('You are not a member of this community', 403);
      }
    }

    // Get timeline from repository
    const timeline = await trustAnalyticsRepository.getTrustTimeline(userId, parsedOptions);

    return timeline;
  }

  /**
   * Get trust summary for the authenticated user
   * Returns aggregate statistics about user's trust
   */
  async getMyTrustSummary(userId: string, options?: GetSummaryOptions): Promise<TrustSummary> {
    // Validate community membership if communityId is provided
    if (options?.communityId) {
      const role = await communityMemberRepository.getUserRole(options.communityId, userId);
      if (!role) {
        throw new AppError('You are not a member of this community', 403);
      }
    }

    // Get summary from repository
    const summary = await trustAnalyticsRepository.getTrustSummary(userId, {
      communityId: options?.communityId,
    });

    return summary;
  }

  /**
   * Get current trust score for a user in a specific community
   */
  async getUserTrustScore(userId: string, communityId: string): Promise<number> {
    // Validate community membership
    const role = await communityMemberRepository.getUserRole(communityId, userId);
    if (!role) {
      throw new AppError('User is not a member of this community', 403);
    }

    return trustAnalyticsRepository.getCurrentTrustScore(userId, communityId);
  }
}

export const trustAnalyticsService = new TrustAnalyticsService();
