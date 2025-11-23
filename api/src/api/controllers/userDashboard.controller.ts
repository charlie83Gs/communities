import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { userDashboardService } from '@/services/userDashboard.service';
import { ApiResponse } from '@/utils/response';

/**
 * @swagger
 * tags:
 *   name: User Dashboard
 *   description: User dashboard and summary endpoints
 */
class UserDashboardController {
  /**
   * @swagger
   * /api/v1/user/communities/summary:
   *   get:
   *     summary: Get aggregated dashboard data for user's communities
   *     description: Returns summary of user's communities with stats, pending actions, and invites
   *     tags: [User Dashboard]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: Dashboard summary data
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: success
   *                 data:
   *                   type: object
   *                   properties:
   *                     communities:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           id:
   *                             type: string
   *                             format: uuid
   *                           name:
   *                             type: string
   *                           description:
   *                             type: string
   *                           userTrustScore:
   *                             type: number
   *                           memberCount:
   *                             type: number
   *                           pendingIncoming:
   *                             type: number
   *                             description: Requests TO user's wealth in this community
   *                           pendingOutgoing:
   *                             type: number
   *                             description: User's requests (pending or accepted)
   *                           lastActivityAt:
   *                             type: string
   *                             format: date-time
   *                     pendingActions:
   *                       type: object
   *                       properties:
   *                         incomingRequests:
   *                           type: array
   *                           items:
   *                             type: object
   *                             properties:
   *                               id:
   *                                 type: string
   *                                 format: uuid
   *                               wealthId:
   *                                 type: string
   *                                 format: uuid
   *                               wealthTitle:
   *                                 type: string
   *                               communityId:
   *                                 type: string
   *                                 format: uuid
   *                               communityName:
   *                                 type: string
   *                               requesterDisplayName:
   *                                 type: string
   *                               unitsRequested:
   *                                 type: number
   *                               createdAt:
   *                                 type: string
   *                                 format: date-time
   *                         acceptedOutgoing:
   *                           type: array
   *                           items:
   *                             type: object
   *                             properties:
   *                               id:
   *                                 type: string
   *                                 format: uuid
   *                               wealthId:
   *                                 type: string
   *                                 format: uuid
   *                               wealthTitle:
   *                                 type: string
   *                               communityId:
   *                                 type: string
   *                                 format: uuid
   *                               communityName:
   *                                 type: string
   *                               unitsRequested:
   *                                 type: number
   *                               createdAt:
   *                                 type: string
   *                                 format: date-time
   *                         poolDistributions:
   *                           type: array
   *                           items:
   *                             type: object
   *                             properties:
   *                               id:
   *                                 type: string
   *                                 format: uuid
   *                               wealthId:
   *                                 type: string
   *                                 format: uuid
   *                               wealthTitle:
   *                                 type: string
   *                               poolId:
   *                                 type: string
   *                                 format: uuid
   *                               poolName:
   *                                 type: string
   *                               communityId:
   *                                 type: string
   *                                 format: uuid
   *                               communityName:
   *                                 type: string
   *                               unitsRequested:
   *                                 type: number
   *                               createdAt:
   *                                 type: string
   *                                 format: date-time
   *                     invites:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           id:
   *                             type: string
   *                             format: uuid
   *                           communityId:
   *                             type: string
   *                             format: uuid
   *                           communityName:
   *                             type: string
   *                           inviterDisplayName:
   *                             type: string
   *                           createdAt:
   *                             type: string
   *                             format: date-time
   *       401:
   *         description: Unauthorized - must be authenticated
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: error
   *                 message:
   *                   type: string
   *                   example: Unauthorized
   *       500:
   *         description: Internal server error
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: error
   *                 message:
   *                   type: string
   *                   example: Internal server error
   */
  async getCommunitiesSummary(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return ApiResponse.error(res, 'Unauthorized', 401);
      }

      const summary = await userDashboardService.getCommunitiesSummary(userId);
      return ApiResponse.success(res, summary);
    } catch (error) {
      next(error);
    }
  }
}

export const userDashboardController = new UserDashboardController();
