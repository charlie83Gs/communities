import { healthAnalyticsRepository, TimeRange } from '../repositories/healthAnalytics.repository';
import { communityRepository } from '../repositories/community.repository';
import { openFGAService } from './openfga.service';
import { AppError } from '../utils/errors';
import logger from '../utils/logger';

export class HealthAnalyticsService {
  /**
   * Check if user has access to health analytics
   * Uses OpenFGA to check can_view_analytics permission
   * (admin OR analytics_viewer OR trust_analytics_viewer)
   */
  private async checkHealthAnalyticsAccess(communityId: string, userId: string): Promise<void> {
    logger.debug(
      `[HealthAnalyticsService checkHealthAnalyticsAccess] Checking access for userId: ${userId}, communityId: ${communityId}`
    );

    const hasAccess = await openFGAService.checkAccess(
      userId,
      'community',
      communityId,
      'can_view_analytics'
    );

    if (!hasAccess) {
      logger.warn(
        `[HealthAnalyticsService checkHealthAnalyticsAccess] User ${userId} lacks can_view_analytics permission for community ${communityId}`
      );
      throw new AppError(
        'Forbidden: requires admin role, analytics_viewer role, or sufficient trust score',
        403
      );
    }

    logger.debug(
      `[HealthAnalyticsService checkHealthAnalyticsAccess] User ${userId} has can_view_analytics permission, access granted`
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
