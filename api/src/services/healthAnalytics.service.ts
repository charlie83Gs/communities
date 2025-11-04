import { healthAnalyticsRepository, TimeRange } from '../repositories/healthAnalytics.repository';
import { communityRepository } from '../repositories/community.repository';
import { communityMemberRepository } from '../repositories/communityMember.repository';
import { trustViewRepository } from '../repositories/trustView.repository';
import { AppError } from '../utils/errors';
import logger from '../utils/logger';

export class HealthAnalyticsService {
  /**
   * Check if user has access to health analytics
   * User must be admin OR have trust score >= community.minTrustForHealthAnalytics
   */
  private async checkHealthAnalyticsAccess(communityId: string, userId: string): Promise<void> {
    logger.debug(
      `[HealthAnalyticsService checkHealthAnalyticsAccess] Checking access for userId: ${userId}, communityId: ${communityId}`
    );

    // Check if user is member
    const role = await communityMemberRepository.getUserRole(communityId, userId);
    if (!role) {
      logger.warn(
        `[HealthAnalyticsService checkHealthAnalyticsAccess] User ${userId} is not a member of community ${communityId}`
      );
      throw new AppError('Forbidden: must be a member of this community', 403);
    }

    // Check if user is admin
    if (role === 'admin') {
      logger.debug(
        `[HealthAnalyticsService checkHealthAnalyticsAccess] User ${userId} is admin, access granted`
      );
      return;
    }

    // Check trust score
    const community = await communityRepository.findById(communityId);
    if (!community) {
      throw new AppError('Community not found', 404);
    }

    // Extract minTrustForHealthAnalytics from jsonb field
    const minTrustConfig = community.minTrustForHealthAnalytics as { type: string; value: number };
    const minTrustRequired = minTrustConfig?.value ?? 20;

    const trustScore = await trustViewRepository.get(communityId, userId);
    const userTrustScore = trustScore?.points ?? 0;

    logger.debug(
      `[HealthAnalyticsService checkHealthAnalyticsAccess] User trust: ${userTrustScore}, required: ${minTrustRequired}`
    );

    if (userTrustScore < minTrustRequired) {
      logger.warn(
        `[HealthAnalyticsService checkHealthAnalyticsAccess] User ${userId} lacks sufficient trust (${userTrustScore} < ${minTrustRequired})`
      );
      throw new AppError(
        `Forbidden: requires trust score of ${minTrustRequired} or admin role`,
        403
      );
    }

    logger.debug(
      `[HealthAnalyticsService checkHealthAnalyticsAccess] User ${userId} has sufficient trust, access granted`
    );
  }

  /**
   * Get wealth overview statistics
   */
  async getWealthOverview(communityId: string, userId: string, timeRange: TimeRange = '30d') {
    await this.checkHealthAnalyticsAccess(communityId, userId);

    logger.info(
      `[HealthAnalyticsService getWealthOverview] Fetching wealth overview for community: ${communityId}, timeRange: ${timeRange}`
    );

    const overview = await healthAnalyticsRepository.getWealthOverview(communityId, timeRange);

    logger.debug(
      `[HealthAnalyticsService getWealthOverview] Retrieved overview - openShares: ${overview.openShares}, totalShares: ${overview.totalShares}`
    );

    return overview;
  }

  /**
   * Get wealth items with trends
   */
  async getWealthItems(communityId: string, userId: string, timeRange: TimeRange = '30d') {
    await this.checkHealthAnalyticsAccess(communityId, userId);

    logger.info(
      `[HealthAnalyticsService getWealthItems] Fetching wealth items for community: ${communityId}, timeRange: ${timeRange}`
    );

    const items = await healthAnalyticsRepository.getWealthItems(communityId, timeRange);

    logger.debug(
      `[HealthAnalyticsService getWealthItems] Retrieved ${items.length} items with trends`
    );

    return items;
  }

  /**
   * Get trust overview statistics
   */
  async getTrustOverview(communityId: string, userId: string, timeRange: TimeRange = '30d') {
    await this.checkHealthAnalyticsAccess(communityId, userId);

    logger.info(
      `[HealthAnalyticsService getTrustOverview] Fetching trust overview for community: ${communityId}, timeRange: ${timeRange}`
    );

    const overview = await healthAnalyticsRepository.getTrustOverview(communityId, timeRange);

    logger.debug(
      `[HealthAnalyticsService getTrustOverview] Retrieved overview - totalTrust: ${overview.totalTrust}, averageTrust: ${overview.averageTrust}`
    );

    return overview;
  }

  /**
   * Get trust distribution by levels
   */
  async getTrustDistribution(communityId: string, userId: string) {
    await this.checkHealthAnalyticsAccess(communityId, userId);

    logger.info(
      `[HealthAnalyticsService getTrustDistribution] Fetching trust distribution for community: ${communityId}`
    );

    // Get community trust levels configuration
    const community = await communityRepository.findById(communityId);
    if (!community) {
      throw new AppError('Community not found', 404);
    }

    // Extract trust titles from jsonb field
    const trustTitlesConfig = community.trustTitles as {
      titles: Array<{ name: string; minScore: number }>;
    };
    const trustLevels = trustTitlesConfig?.titles ?? [
      { name: 'New', minScore: 0 },
      { name: 'Stable', minScore: 10 },
      { name: 'Trusted', minScore: 50 },
    ];

    const distribution = await healthAnalyticsRepository.getTrustDistribution(
      communityId,
      trustLevels
    );

    logger.debug(
      `[HealthAnalyticsService getTrustDistribution] Retrieved distribution for ${distribution.length} trust levels`
    );

    return { distribution };
  }
}

export const healthAnalyticsService = new HealthAnalyticsService();
