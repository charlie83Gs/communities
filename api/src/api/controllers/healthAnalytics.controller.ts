import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { healthAnalyticsService } from '../../services/healthAnalytics.service';
import { TimeRange } from '../../repositories/healthAnalytics.repository';
import { ApiResponse } from '../../utils/response';
import logger from '../../utils/logger';

/**
 * @swagger
 * components:
 *   schemas:
 *     WealthOverview:
 *       type: object
 *       properties:
 *         openShares:
 *           type: integer
 *           description: Number of currently active wealth shares
 *         totalShares:
 *           type: integer
 *           description: Total wealth shares in time range
 *         activeCategories:
 *           type: integer
 *           description: Number of distinct item types shared
 *         timeSeriesData:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               shares:
 *                 type: integer
 *               requests:
 *                 type: integer
 *               fulfilled:
 *                 type: integer
 *     WealthItem:
 *       type: object
 *       properties:
 *         categoryName:
 *           type: string
 *           description: Category name (Objects or Services)
 *         subcategoryName:
 *           type: string
 *           description: Subcategory name
 *         itemName:
 *           type: string
 *           description: Item name
 *         shareCount:
 *           type: integer
 *           description: Number of times this item was shared
 *         valuePoints:
 *           type: number
 *           description: Aggregate value points for this item
 *         trend:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               count:
 *                 type: integer
 *     TrustOverview:
 *       type: object
 *       properties:
 *         totalTrust:
 *           type: integer
 *           description: Total trust points awarded in time range
 *         averageTrust:
 *           type: number
 *           description: Average trust score per user
 *         trustPerDay:
 *           type: number
 *           description: Average trust points awarded per day
 *         timeSeriesData:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               cumulativePeerTrust:
 *                 type: integer
 *                 description: Total peer trust awarded up to and including this date
 *               cumulativeAdminTrust:
 *                 type: integer
 *                 description: Total admin trust granted up to and including this date
 *               cumulativeTotal:
 *                 type: integer
 *                 description: Combined total trust as of this date
 *     TrustDistribution:
 *       type: object
 *       properties:
 *         distribution:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               trustLevel:
 *                 type: string
 *                 description: Trust level name
 *               minScore:
 *                 type: integer
 *                 description: Minimum trust score for this level
 *               maxScore:
 *                 type: integer
 *                 description: Maximum trust score for this level
 *               userCount:
 *                 type: integer
 *                 description: Number of users in this trust level
 *     NeedsOverview:
 *       type: object
 *       properties:
 *         totalActiveNeeds:
 *           type: integer
 *           description: Number of currently active needs (priority=need)
 *         totalActiveWants:
 *           type: integer
 *           description: Number of currently active wants (priority=want)
 *         activeMembers:
 *           type: integer
 *           description: Number of members who have published needs
 *         activeCouncils:
 *           type: integer
 *           description: Number of councils who have published needs
 *         objectsVsServices:
 *           type: object
 *           properties:
 *             objects:
 *               type: integer
 *               description: Number of distinct object items needed
 *             services:
 *               type: integer
 *               description: Number of distinct service items needed
 *         timeSeriesData:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               needs:
 *                 type: integer
 *                 description: Number of needs created on this date
 *               wants:
 *                 type: integer
 *                 description: Number of wants created on this date
 *     NeedsItem:
 *       type: object
 *       properties:
 *         categoryName:
 *           type: string
 *           description: Category name (Objects or Services)
 *         itemName:
 *           type: string
 *           description: Item name
 *         priority:
 *           type: string
 *           enum: [need, want]
 *           description: Priority level
 *         recurrence:
 *           type: string
 *           enum: [one-time, daily, weekly, monthly]
 *           description: Recurrence pattern
 *         totalUnitsNeeded:
 *           type: integer
 *           description: Total units needed across all members/councils
 *         memberCount:
 *           type: integer
 *           description: Number of members or councils expressing this need
 *         source:
 *           type: string
 *           enum: [member, council, both]
 *           description: Whether need comes from members, councils, or both
 *     AggregatedNeedsData:
 *       type: object
 *       properties:
 *         recurrence:
 *           type: string
 *           enum: [one-time, daily, weekly, monthly]
 *           description: Recurrence pattern for this group
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               itemId:
 *                 type: string
 *                 format: uuid
 *                 description: Item ID
 *               itemName:
 *                 type: string
 *                 description: Item name
 *               categoryName:
 *                 type: string
 *                 enum: [Objects, Services]
 *                 description: Category name (Objects or Services)
 *               needsTotal:
 *                 type: integer
 *                 description: Total units where priority=need
 *               wantsTotal:
 *                 type: integer
 *                 description: Total units where priority=want
 *               totalUnits:
 *                 type: integer
 *                 description: needsTotal + wantsTotal
 *               participantCount:
 *                 type: integer
 *                 description: Distinct members + councils expressing this need
 *     AggregatedWealthData:
 *       type: object
 *       properties:
 *         itemId:
 *           type: string
 *           format: uuid
 *           description: Item ID
 *         itemName:
 *           type: string
 *           description: Item name
 *         categoryName:
 *           type: string
 *           enum: [Objects, Services]
 *           description: Category name (Objects or Services)
 *         activeShares:
 *           type: integer
 *           description: Count of active shares for this item
 *         totalValuePoints:
 *           type: number
 *           description: Sum of wealth_value * quantity from all active shares
 *         sharerCount:
 *           type: integer
 *           description: Distinct members sharing this item
 *         totalQuantity:
 *           type: integer
 *           description: Sum of quantity from all active shares
 */
export class HealthAnalyticsController {
  /**
   * @swagger
   * /api/v1/communities/{communityId}/health/wealth/overview:
   *   get:
   *     summary: Get wealth overview statistics
   *     description: Requires admin role or trust score >= community.minTrustForHealthAnalytics (default 20)
   *     tags: [Health Analytics]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: communityId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Community ID
   *       - in: query
   *         name: timeRange
   *         schema:
   *           type: string
   *           enum: [7d, 30d, 90d, 1y]
   *           default: 30d
   *         description: Time range for statistics
   *     responses:
   *       200:
   *         description: Wealth overview statistics
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/WealthOverview'
   *       401:
   *         description: Unauthorized - authentication required
   *       403:
   *         description: Forbidden - insufficient trust or not a member
   *       404:
   *         description: Community not found
   */
  async getWealthOverview(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { communityId } = req.params;
      const timeRange = (req.query.timeRange as TimeRange) || '30d';
      const userId = req.user?.id;

      if (!userId) {
        return ApiResponse.error(res, 'Unauthorized', 401);
      }

      logger.info(
        `[HealthAnalyticsController getWealthOverview] Request from userId: ${userId}, communityId: ${communityId}, timeRange: ${timeRange}`
      );

      const overview = await healthAnalyticsService.getWealthOverview(
        communityId,
        userId,
        timeRange
      );

      return ApiResponse.success(res, overview);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/health/wealth/items:
   *   get:
   *     summary: Get wealth items with statistics and trends
   *     description: Requires admin role or trust score >= community.minTrustForHealthAnalytics (default 20)
   *     tags: [Health Analytics]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: communityId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Community ID
   *       - in: query
   *         name: timeRange
   *         schema:
   *           type: string
   *           enum: [7d, 30d, 90d, 1y]
   *           default: 30d
   *         description: Time range for statistics
   *     responses:
   *       200:
   *         description: Wealth items with trends
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 items:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/WealthItem'
   *       401:
   *         description: Unauthorized - authentication required
   *       403:
   *         description: Forbidden - insufficient trust or not a member
   *       404:
   *         description: Community not found
   */
  async getWealthItems(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { communityId } = req.params;
      const timeRange = (req.query.timeRange as TimeRange) || '30d';
      const userId = req.user?.id;

      if (!userId) {
        return ApiResponse.error(res, 'Unauthorized', 401);
      }

      logger.info(
        `[HealthAnalyticsController getWealthItems] Request from userId: ${userId}, communityId: ${communityId}, timeRange: ${timeRange}`
      );

      const items = await healthAnalyticsService.getWealthItems(communityId, userId, timeRange);

      return ApiResponse.success(res, { items });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/health/trust/overview:
   *   get:
   *     summary: Get trust overview statistics
   *     description: Requires admin role or trust score >= community.minTrustForHealthAnalytics (default 20)
   *     tags: [Health Analytics]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: communityId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Community ID
   *       - in: query
   *         name: timeRange
   *         schema:
   *           type: string
   *           enum: [7d, 30d, 90d, 1y]
   *           default: 30d
   *         description: Time range for statistics
   *     responses:
   *       200:
   *         description: Trust overview statistics
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/TrustOverview'
   *       401:
   *         description: Unauthorized - authentication required
   *       403:
   *         description: Forbidden - insufficient trust or not a member
   *       404:
   *         description: Community not found
   */
  async getTrustOverview(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { communityId } = req.params;
      const timeRange = (req.query.timeRange as TimeRange) || '30d';
      const userId = req.user?.id;

      if (!userId) {
        return ApiResponse.error(res, 'Unauthorized', 401);
      }

      logger.info(
        `[HealthAnalyticsController getTrustOverview] Request from userId: ${userId}, communityId: ${communityId}, timeRange: ${timeRange}`
      );

      const overview = await healthAnalyticsService.getTrustOverview(
        communityId,
        userId,
        timeRange
      );

      return ApiResponse.success(res, overview);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/health/trust/distribution:
   *   get:
   *     summary: Get trust distribution by levels
   *     description: Requires admin role or trust score >= community.minTrustForHealthAnalytics (default 20)
   *     tags: [Health Analytics]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: communityId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Community ID
   *     responses:
   *       200:
   *         description: Trust distribution by levels
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/TrustDistribution'
   *       401:
   *         description: Unauthorized - authentication required
   *       403:
   *         description: Forbidden - insufficient trust or not a member
   *       404:
   *         description: Community not found
   */
  async getTrustDistribution(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { communityId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return ApiResponse.error(res, 'Unauthorized', 401);
      }

      logger.info(
        `[HealthAnalyticsController getTrustDistribution] Request from userId: ${userId}, communityId: ${communityId}`
      );

      const distribution = await healthAnalyticsService.getTrustDistribution(communityId, userId);

      return ApiResponse.success(res, distribution);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/health/needs/overview:
   *   get:
   *     summary: Get needs overview statistics
   *     description: Requires admin role or trust score >= community.minTrustForHealthAnalytics (default 20)
   *     tags: [Health Analytics]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: communityId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Community ID
   *       - in: query
   *         name: timeRange
   *         schema:
   *           type: string
   *           enum: [7d, 30d, 90d, 1y]
   *           default: 30d
   *         description: Time range for statistics
   *     responses:
   *       200:
   *         description: Needs overview statistics
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/NeedsOverview'
   *       401:
   *         description: Unauthorized - authentication required
   *       403:
   *         description: Forbidden - insufficient trust or not a member
   *       404:
   *         description: Community not found
   */
  async getNeedsOverview(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { communityId } = req.params;
      const timeRange = (req.query.timeRange as TimeRange) || '30d';
      const userId = req.user?.id;

      if (!userId) {
        return ApiResponse.error(res, 'Unauthorized', 401);
      }

      logger.info(
        `[HealthAnalyticsController getNeedsOverview] Request from userId: ${userId}, communityId: ${communityId}, timeRange: ${timeRange}`
      );

      const overview = await healthAnalyticsService.getNeedsOverview(
        communityId,
        userId,
        timeRange
      );

      return ApiResponse.success(res, overview);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/health/needs/items:
   *   get:
   *     summary: Get needs items with aggregation
   *     description: Requires admin role or trust score >= community.minTrustForHealthAnalytics (default 20)
   *     tags: [Health Analytics]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: communityId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Community ID
   *       - in: query
   *         name: timeRange
   *         schema:
   *           type: string
   *           enum: [7d, 30d, 90d, 1y]
   *           default: 30d
   *         description: Time range for statistics
   *     responses:
   *       200:
   *         description: Needs items with aggregation
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 items:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/NeedsItem'
   *       401:
   *         description: Unauthorized - authentication required
   *       403:
   *         description: Forbidden - insufficient trust or not a member
   *       404:
   *         description: Community not found
   */
  async getNeedsItems(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { communityId } = req.params;
      const timeRange = (req.query.timeRange as TimeRange) || '30d';
      const userId = req.user?.id;

      if (!userId) {
        return ApiResponse.error(res, 'Unauthorized', 401);
      }

      logger.info(
        `[HealthAnalyticsController getNeedsItems] Request from userId: ${userId}, communityId: ${communityId}, timeRange: ${timeRange}`
      );

      const items = await healthAnalyticsService.getNeedsItems(communityId, userId, timeRange);

      return ApiResponse.success(res, { items });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/health/needs/aggregated:
   *   get:
   *     summary: Get aggregated needs by recurrence pattern
   *     description: Returns total units needed per item, grouped by recurrence pattern (one-time, daily, weekly, monthly). Requires admin role or trust score >= community.minTrustForHealthAnalytics (default 20)
   *     tags: [Health Analytics]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: communityId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Community ID
   *     responses:
   *       200:
   *         description: Aggregated needs grouped by recurrence pattern
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/AggregatedNeedsData'
   *       401:
   *         description: Unauthorized - authentication required
   *       403:
   *         description: Forbidden - insufficient trust or not a member
   *       404:
   *         description: Community not found
   */
  async getAggregatedNeeds(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { communityId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return ApiResponse.error(res, 'Unauthorized', 401);
      }

      logger.info(
        `[HealthAnalyticsController getAggregatedNeeds] Request from userId: ${userId}, communityId: ${communityId}`
      );

      const aggregatedNeeds = await healthAnalyticsService.getAggregatedNeeds(
        communityId,
        userId
      );

      return ApiResponse.success(res, aggregatedNeeds);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/health/wealth/aggregated:
   *   get:
   *     summary: Get aggregated wealth shares by item
   *     description: Returns total active shares per item, showing aggregated data across all members. Requires admin role or trust score >= community.minTrustForHealthAnalytics (default 20)
   *     tags: [Health Analytics]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: communityId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Community ID
   *     responses:
   *       200:
   *         description: Aggregated wealth shares by item
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/AggregatedWealthData'
   *       401:
   *         description: Unauthorized - authentication required
   *       403:
   *         description: Forbidden - insufficient trust or not a member
   *       404:
   *         description: Community not found
   */
  async getAggregatedWealth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { communityId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return ApiResponse.error(res, 'Unauthorized', 401);
      }

      logger.info(
        `[HealthAnalyticsController getAggregatedWealth] Request from userId: ${userId}, communityId: ${communityId}`
      );

      const aggregatedWealth = await healthAnalyticsService.getAggregatedWealth(
        communityId,
        userId
      );

      return ApiResponse.success(res, aggregatedWealth);
    } catch (error) {
      next(error);
    }
  }
}

export const healthAnalyticsController = new HealthAnalyticsController();
