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
 *               trustAwarded:
 *                 type: integer
 *               trustRemoved:
 *                 type: integer
 *               netTrust:
 *                 type: integer
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
}

export const healthAnalyticsController = new HealthAnalyticsController();
