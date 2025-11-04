import type { Request, Response, NextFunction } from 'express';
import { trustService } from '../../services/trust.service';
import { ApiResponse } from '../../utils/response';

/**
 * TrustController
 * Community-scoped trust endpoints + user-scoped trust endpoints
 */
export class TrustController {
  /**
   * @swagger
   * /api/v1/communities/{communityId}/trust/events:
   *   get:
   *     summary: Get trust-impacting events for a user (audit)
   *     tags: [Trust]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: communityId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *       - in: query
   *         name: userId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Events list
   */
  async getEventsForUser(req: Request, res: Response, next: NextFunction) {
    try {
      const requesterId = (req as any).user?.id;
      const { communityId } = req.params;
      const { userId, page, limit } = req.query as any;
      const result = await trustService.getEventsForUser(
        communityId,
        requesterId,
        userId,
        page ? Number(page) : 1,
        limit ? Number(limit) : 50
      );
      return ApiResponse.success(res, result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/trust/users/{userId}:
   *   get:
   *     summary: Get trust view (points) for a user
   *     tags: [Trust]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: communityId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *       - in: path
   *         name: userId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: Trust view entry
   */
  async getTrustView(req: Request, res: Response, next: NextFunction) {
    try {
      const requesterId = (req as any).user?.id;
      const { communityId, userId } = req.params as any;
      const result = await trustService.getTrustView(communityId, requesterId, userId);
      return ApiResponse.success(res, result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/trust/users:
   *   get:
   *     summary: List trust views (points) for community
   *     tags: [Trust]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: communityId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: List of trust views
   */
  async listCommunityTrust(req: Request, res: Response, next: NextFunction) {
    try {
      const requesterId = (req as any).user?.id;
      const { communityId } = req.params;
      const { page, limit } = req.query as any;
      const result = await trustService.listCommunityTrust(
        communityId,
        requesterId,
        page ? Number(page) : 1,
        limit ? Number(limit) : 50
      );
      return ApiResponse.success(res, result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/trust/me:
   *   get:
   *     summary: Get my trust summary in this community
   *     tags: [Trust]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: communityId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: My trust summary
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
   *                     trusted:
   *                       type: boolean
   *                       description: Whether the user is trusted in this community (admin or has any trust points)
   *                     points:
   *                       type: number
   *                       description: The user's trust points in this community
   *                     roles:
   *                       type: array
   *                       items:
   *                         type: string
   *                       description: All roles the user has in this community
   *                       example: ["admin", "member"]
   *                     canAwardTrust:
   *                       type: boolean
   *                       description: Whether user can award trust (admin or points >= minTrustToAwardTrust)
   *                     canAccessWealth:
   *                       type: boolean
   *                       description: Whether user can access wealth features (admin or points >= minTrustForWealth)
   *                     canHandleDisputes:
   *                       type: boolean
   *                       description: Whether user can handle disputes (admin or points >= minTrustForDisputes)
   *                     canCreatePolls:
   *                       type: boolean
   *                       description: Whether user can create polls (admin or points >= minTrustForPolls)
   *       404:
   *         description: Community not found
   */
  async getTrustMe(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const { communityId } = req.params;
      const result = await trustService.getTrustMe(communityId, userId);
      return ApiResponse.success(res, result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /api/v1/user/trust/events:
   *   get:
   *     summary: Get my trust-impacting events across all communities
   *     tags: [Trust]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Events list across all communities
   */
  async listMyEventsAllCommunities(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const { page, limit } = req.query as any;
      const result = await trustService.getMyEventsAllCommunities(
        userId,
        page ? Number(page) : 1,
        limit ? Number(limit) : 50
      );
      return ApiResponse.success(res, result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /api/v1/users/trust/communities:
   *   get:
   *     summary: List my trust view (points) across all communities
   *     tags: [Trust]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: List of trust views across communities
   */
  async listMyTrustAcrossCommunities(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const { page, limit } = req.query as any;
      const result = await trustService.listMyTrustAcrossCommunities(
        userId,
        page ? Number(page) : 1,
        limit ? Number(limit) : 50
      );
      return ApiResponse.success(res, result);
    } catch (err) {
      next(err);
    }
  }

  // ========== NEW TRUST AWARD ENDPOINTS ==========

  /**
   * @swagger
   * /api/v1/communities/{communityId}/trust/awards/{toUserId}:
   *   post:
   *     summary: Award trust to another user (1 point)
   *     tags: [Trust]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: communityId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *       - in: path
   *         name: toUserId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: Trust awarded successfully
   *       400:
   *         description: Already awarded or cannot award to self
   *       401:
   *         description: Not enough trust to award
   *       403:
   *         description: Not a member
   */
  async awardTrust(req: Request, res: Response, next: NextFunction) {
    try {
      const fromUserId = (req as any).user?.id;
      const { communityId, toUserId } = req.params;
      const result = await trustService.awardTrust(communityId, fromUserId, toUserId);
      return ApiResponse.success(res, result, 'Trust awarded successfully');
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/trust/awards/{toUserId}:
   *   delete:
   *     summary: Remove trust award from another user
   *     tags: [Trust]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: communityId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *       - in: path
   *         name: toUserId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: Trust removed successfully
   *       400:
   *         description: No award to remove
   *       403:
   *         description: Not a member
   */
  async removeTrust(req: Request, res: Response, next: NextFunction) {
    try {
      const fromUserId = (req as any).user?.id;
      const { communityId, toUserId } = req.params;
      const result = await trustService.removeTrust(communityId, fromUserId, toUserId);
      return ApiResponse.success(res, result, 'Trust removed successfully');
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/trust/awards:
   *   get:
   *     summary: List all trust awards given by me
   *     tags: [Trust]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: communityId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: List of awards given
   *       403:
   *         description: Not a member
   */
  async listMyAwards(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const { communityId } = req.params;
      const result = await trustService.listMyAwards(communityId, userId);
      return ApiResponse.success(res, result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/trust/awards/{userId}:
   *   get:
   *     summary: List all trust awards received by a user
   *     tags: [Trust]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: communityId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *       - in: path
   *         name: userId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: List of awards received
   *       403:
   *         description: Not a member
   */
  async listAwardsToUser(req: Request, res: Response, next: NextFunction) {
    try {
      const requesterId = (req as any).user?.id;
      const { communityId, userId } = req.params;
      const result = await trustService.listAwardsToUser(communityId, requesterId, userId);
      return ApiResponse.success(res, result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/trust/history/{userId}:
   *   get:
   *     summary: Get trust history for a user
   *     tags: [Trust]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: communityId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *       - in: path
   *         name: userId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *     responses:
   *       200:
   *         description: Trust history
   *       403:
   *         description: Not a member
   */
  async getTrustHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const requesterId = (req as any).user?.id;
      const { communityId, userId } = req.params;
      const { page, limit } = req.query as any;
      const result = await trustService.getTrustHistory(
        communityId,
        requesterId,
        userId,
        page ? Number(page) : 1,
        limit ? Number(limit) : 50
      );
      return ApiResponse.success(res, result);
    } catch (err) {
      next(err);
    }
  }

  // ========== ADMIN GRANT ENDPOINTS ==========

  /**
   * @swagger
   * /api/v1/communities/{communityId}/trust/admin/grants:
   *   get:
   *     summary: Get all admin grants for a community (admin only)
   *     tags: [Trust]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: communityId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: List of admin grants
   *       403:
   *         description: Not an admin
   */
  async getAdminGrants(req: Request, res: Response, next: NextFunction) {
    try {
      const requesterId = (req as any).user?.id;
      const { communityId } = req.params;
      const result = await trustService.getAdminGrants(communityId, requesterId);
      return ApiResponse.success(res, result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/trust/admin/grants/{toUserId}:
   *   post:
   *     summary: Set admin trust grant for a user (admin only)
   *     tags: [Trust]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: communityId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *       - in: path
   *         name: toUserId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [amount]
   *             properties:
   *               amount:
   *                 type: integer
   *                 minimum: 0
   *                 description: Trust amount to grant
   *     responses:
   *       200:
   *         description: Admin grant set successfully
   *       400:
   *         description: Invalid amount
   *       403:
   *         description: Not an admin
   */
  async setAdminGrant(req: Request, res: Response, next: NextFunction) {
    try {
      const adminUserId = (req as any).user?.id;
      const { communityId, toUserId } = req.params;
      const { amount } = req.body;
      const result = await trustService.setAdminGrant(communityId, adminUserId, toUserId, amount);
      return ApiResponse.success(res, result, 'Admin grant set successfully');
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/trust/admin/grants/{toUserId}:
   *   put:
   *     summary: Update admin trust grant for a user (admin only)
   *     tags: [Trust]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: communityId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *       - in: path
   *         name: toUserId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [amount]
   *             properties:
   *               amount:
   *                 type: integer
   *                 minimum: 0
   *                 description: Trust amount to grant
   *     responses:
   *       200:
   *         description: Admin grant updated successfully
   *       400:
   *         description: Invalid amount
   *       403:
   *         description: Not an admin
   */
  async updateAdminGrant(req: Request, res: Response, next: NextFunction) {
    try {
      const adminUserId = (req as any).user?.id;
      const { communityId, toUserId } = req.params;
      const { amount } = req.body;
      const result = await trustService.setAdminGrant(communityId, adminUserId, toUserId, amount);
      return ApiResponse.success(res, result, 'Admin grant updated successfully');
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/trust/admin/grants/{toUserId}:
   *   delete:
   *     summary: Delete admin trust grant (admin only)
   *     tags: [Trust]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: communityId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *       - in: path
   *         name: toUserId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: Admin grant deleted successfully
   *       403:
   *         description: Not an admin
   *       404:
   *         description: Grant not found
   */
  async deleteAdminGrant(req: Request, res: Response, next: NextFunction) {
    try {
      const adminUserId = (req as any).user?.id;
      const { communityId, toUserId } = req.params;
      const result = await trustService.deleteAdminGrant(communityId, adminUserId, toUserId);
      return ApiResponse.success(res, result, 'Admin grant deleted successfully');
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/trust/timeline:
   *   get:
   *     summary: Get trust timeline/roadmap for the community
   *     description: Returns all trust levels, permission thresholds, and user's current position
   *     tags: [Trust]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: communityId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: Trust timeline retrieved successfully
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
   *                     userTrustScore:
   *                       type: number
   *                       example: 15
   *                     timeline:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           threshold:
   *                             type: number
   *                           trustLevel:
   *                             type: object
   *                             nullable: true
   *                             properties:
   *                               name:
   *                                 type: string
   *                               id:
   *                                 type: string
   *                           permissions:
   *                             type: array
   *                             items:
   *                               type: string
   *                           unlocked:
   *                             type: boolean
   *       403:
   *         description: Not a member of this community
   *       404:
   *         description: Community not found
   */
  async getTrustTimeline(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const { communityId } = req.params;
      const result = await trustService.getTrustTimeline(communityId, userId);
      return ApiResponse.success(res, result, 'Trust timeline retrieved successfully');
    } catch (err) {
      next(err);
    }
  }
}

export const trustController = new TrustController();