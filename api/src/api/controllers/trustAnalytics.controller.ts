import { Request, Response, NextFunction } from 'express';
import { trustAnalyticsService } from '@/services/trustAnalytics.service';
import { ApiResponse } from '@/utils/response';

export class TrustAnalyticsController {
  /**
   * @swagger
   * /api/v1/users/me/trust/timeline:
   *   get:
   *     summary: Get trust timeline for the authenticated user
   *     description: Returns all trust events (awards, removals, admin grants) with cumulative trust over time
   *     tags: [Trust Analytics]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: communityId
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Filter events by specific community
   *       - in: query
   *         name: startDate
   *         schema:
   *           type: string
   *           format: date-time
   *         description: Filter events from this date (ISO 8601 format)
   *         example: "2024-01-01T00:00:00Z"
   *       - in: query
   *         name: endDate
   *         schema:
   *           type: string
   *           format: date-time
   *         description: Filter events to this date (ISO 8601 format)
   *         example: "2024-12-31T23:59:59Z"
   *     responses:
   *       200:
   *         description: Trust timeline events
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: "success"
   *                 data:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       timestamp:
   *                         type: string
   *                         format: date-time
   *                         example: "2024-10-15T14:30:00Z"
   *                       type:
   *                         type: string
   *                         enum: [award, remove, admin_grant]
   *                         example: "award"
   *                       fromUserId:
   *                         type: string
   *                         nullable: true
   *                         example: "user-uuid-123"
   *                       fromUserDisplayName:
   *                         type: string
   *                         nullable: true
   *                         example: "John Doe"
   *                       amount:
   *                         type: number
   *                         example: 1
   *                       cumulativeTrust:
   *                         type: number
   *                         example: 15
   *                       communityId:
   *                         type: string
   *                         format: uuid
   *                         example: "community-uuid-456"
   *                       communityName:
   *                         type: string
   *                         example: "Tech Community"
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden - not a member of specified community
   *       400:
   *         description: Validation error
   */
  async getMyTrustTimeline(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { communityId, startDate, endDate } = req.query;

      const timeline = await trustAnalyticsService.getMyTrustTimeline(userId, {
        communityId: communityId as string | undefined,
        startDate: startDate as string | undefined,
        endDate: endDate as string | undefined,
      });

      return ApiResponse.success(res, timeline);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/users/me/trust/summary:
   *   get:
   *     summary: Get trust summary for the authenticated user
   *     description: Returns aggregate statistics about user's trust across communities
   *     tags: [Trust Analytics]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: communityId
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Filter summary by specific community
   *     responses:
   *       200:
   *         description: Trust summary statistics
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: "success"
   *                 data:
   *                   type: object
   *                   properties:
   *                     totalTrustPoints:
   *                       type: number
   *                       example: 42
   *                       description: Total trust points across all communities (or filtered community)
   *                     totalAwardsReceived:
   *                       type: number
   *                       example: 35
   *                       description: Number of trust awards received
   *                     totalAwardsRemoved:
   *                       type: number
   *                       example: 3
   *                       description: Number of trust awards removed
   *                     trustByCommunity:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           communityId:
   *                             type: string
   *                             format: uuid
   *                             example: "community-uuid-456"
   *                           communityName:
   *                             type: string
   *                             example: "Tech Community"
   *                           trustPoints:
   *                             type: number
   *                             example: 25
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden - not a member of specified community
   *       400:
   *         description: Validation error
   */
  async getMyTrustSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const { communityId } = req.query;

      const summary = await trustAnalyticsService.getMyTrustSummary(userId, {
        communityId: communityId as string | undefined,
      });

      return ApiResponse.success(res, summary);
    } catch (error) {
      next(error);
    }
  }
}

export const trustAnalyticsController = new TrustAnalyticsController();
