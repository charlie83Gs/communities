import { Request, Response, NextFunction } from 'express';
import { communityService } from '../../services/community.service';
import { ApiResponse } from '../../utils/response';
import { AppError } from '../../utils/errors';
import logger from '../../utils/logger';

/**
 * @swagger
 * components:
 *   schemas:
 *     Community:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         description:
 *           type: string
 *           nullable: true
 *         minTrustToAwardTrust:
 *           type: integer
 *           default: 15
 *         trustTitles:
 *           type: object
 *           nullable: true
 *         minTrustForWealth:
 *           type: integer
 *           default: 10
 *         minTrustForDisputes:
 *           type: integer
 *           nullable: true
 *         disputeResolutionRole:
 *           type: string
 *           nullable: true
 *         disputeHandlingCouncils:
 *           type: array
 *           items:
 *             type: string
 *             format: uuid
 *           nullable: true
 *         pollCreatorUsers:
 *           type: array
 *           items:
 *             type: string
 *             format: uuid
 *           nullable: true
 *         minTrustForPolls:
 *           type: integer
 *           nullable: true
 *         nonContributionThresholdDays:
 *           type: integer
 *           nullable: true
 *         dashboardRefreshInterval:
 *           type: integer
 *           nullable: true
 *         metricVisibilitySettings:
 *           type: object
 *           nullable: true
 *         createdBy:
 *           type: string
 *           format: uuid
 *         createdAt:
 *           type: string
 *           format: date-time
 *       example:
 *         id: "123e4567-e89b-12d3-a456-426614174000"
 *         name: "Local Gardening Group"
 *         description: "A community for sharing gardening tips and tools"
 *         minTrustToAwardTrust: 15
 *         minTrustForWealth: 10
 *         createdBy: "223e4567-e89b-12d3-a456-426614174111"
 *         createdAt: "2025-10-01T12:00:00Z"
 */
export class CommunityController {
  /**
   * @swagger
   * /api/v1/communities:
   *   post:
   *     summary: Create a new community
   *     tags: [Communities]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - name
   *             properties:
   *               name:
   *                 type: string
   *                 example: "Local Gardening Group"
   *               description:
   *                 type: string
   *                 example: "A community for sharing gardening tips and tools"
   *               minTrustToAwardTrust:
   *                 type: integer
   *                 example: 15
   *               minTrustForWealth:
   *                 type: integer
   *                 example: 10
   *               minTrustForDisputes:
   *                 type: integer
   *                 example: 20
   *               minTrustForPolls:
   *                 type: integer
   *                 example: 15
   *     responses:
   *       201:
   *         description: Community created successfully
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw new AppError('Unauthorized', 401);
      }
      const community = await communityService.createCommunity(req.body, userId);
      return ApiResponse.created(res, community, 'Community created successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{id}:
   *   get:
   *     summary: Get community by ID
   *     tags: [Communities]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: Community details
   *       404:
   *         description: Community not found
   *       403:
   *         description: Forbidden
   */
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const communityId = req.params.id;
      logger.debug(`[Community GetById] Request - communityId: ${communityId}, userId: ${userId || 'guest'}`);
      const community = await communityService.getCommunity(communityId, userId);
      logger.debug(`[Community GetById] Success - communityId: ${communityId}, userId: ${userId || 'guest'}`);
      return ApiResponse.success(res, community);
    } catch (error) {
      const userId = (req as any).user?.id;
      logger.error(`[Community GetById] Error for communityId: ${req.params.id}, userId: ${userId || 'guest'} - ${error}`);
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/communities:
   *   get:
   *     summary: List communities
   *     tags: [Communities]
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           minimum: 1
   *         example: 1
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *         example: 10
   *     responses:
   *       200:
   *         description: List of communities
   */
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const userId = (req as any).user?.id;
      logger.debug(`[Community List] Request - page: ${page}, limit: ${limit}, userId: ${userId || 'guest'}`);
      const result = await communityService.listCommunities(Number(page), Number(limit), userId);
      logger.debug(`[Community List] Response - total: ${result.total}, userId: ${userId || 'guest'}`);
      return ApiResponse.success(res, result);
    } catch (error) {
      const userId = (req as any).user?.id;
      logger.error(`[Community List] Error for userId: ${userId || 'guest'} - ${error}`);
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/search:
   *   get:
   *     summary: Search communities
   *     description: Returns communities the authenticated user belongs to. Supports text search on name/description. All communities are private (membership-based access only).
   *     tags: [Communities]
   *     parameters:
   *       - in: query
   *         name: q
   *         schema:
   *           type: string
   *         description: Optional search text (matches community name and description, case-insensitive)
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           minimum: 1
   *         example: 1
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *         example: 20
   *     responses:
   *       200:
   *         description: Search results
   */
  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const {
        q,
        page = 1,
        limit = 20,
      } = req.query as {
        q?: string;
        page?: any;
        limit?: any;
      };

      const result = await communityService.searchCommunities(userId, {
        q,
        page: Number(page),
        limit: Number(limit),
      });

      return ApiResponse.success(res, result);
    } catch (error) {
      const userId = (req as any).user?.id;
      logger.error(`[Community Search] Error for userId: ${userId || 'guest'} - ${error}`);
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{id}:
   *   put:
   *     summary: Update community
   *     tags: [Communities]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
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
   *             properties:
   *               name:
   *                 type: string
   *                 example: "Updated Community Name"
   *               description:
   *                 type: string
   *                 example: "Updated description"
   *     responses:
   *       200:
   *         description: Community updated successfully
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Community not found
   */
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const community = await communityService.updateCommunity(req.params.id, req.body, userId);
      return ApiResponse.success(res, community, 'Community updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{id}:
   *   delete:
   *     summary: Delete community
   *     tags: [Communities]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: Community deleted successfully
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Community not found
   */
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      await communityService.deleteCommunity(req.params.id, userId);
      return ApiResponse.success(res, null, 'Community deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{id}/members:
   *   get:
   *     summary: List community members
   *     tags: [Communities]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *       - in: query
   *         name: search
   *         schema:
   *           type: string
   *         description: Optional search text (matches member name and email, case-insensitive)
   *     responses:
   *       200:
   *         description: List of members
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 type: object
   *                 properties:
   *                   userId:
   *                     type: string
   *                     format: uuid
   *                   roles:
   *                     type: array
   *                     items:
   *                       type: string
   *                     example: ["admin", "member"]
   *                   displayName:
   *                     type: string
   *                     nullable: true
   *                   email:
   *                     type: string
   *                     nullable: true
   *                   profileImage:
   *                     type: string
   *                     nullable: true
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden (only admins)
   *       404:
   *         description: Community not found
   */
  async getMembers(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const { id } = req.params as { id: string };
      const { search } = req.query as { search?: string };
      logger.debug(`[Community GetMembers] Request - communityId: ${id}, userId: ${userId}, search: ${search || 'none'}`);
      const members = await communityService.getMembers(id, userId, search);
      logger.debug(`[Community GetMembers] Success - communityId: ${id}, members count: ${members.length}`);
      return ApiResponse.success(res, members);
    } catch (error) {
      const userId = (req as any).user?.id;
      const { id } = req.params as { id: string };
      logger.error(`[Community GetMembers] Error for communityId: ${id}, userId: ${userId} - ${error}`);
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/members/{userId}:
   *   get:
   *     summary: Get community member role by user ID
   *     tags: [Communities]
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
   *         description: Member details with roles
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 userId:
   *                   type: string
   *                   format: uuid
   *                 roles:
   *                   type: array
   *                   items:
   *                     type: string
   *                   example: ["admin", "member"]
   *                 displayName:
   *                   type: string
   *                   nullable: true
   *                 email:
   *                   type: string
   *                   nullable: true
   *                 profileImage:
   *                   type: string
   *                   nullable: true
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden (only admins or self)
   *       404:
   *         description: Not found
   * */
  async getMemberById(req: Request, res: Response, next: NextFunction) {
    try {
      const requesterId = (req as any).user?.id;
      const { id, userId } = req.params as { id: string; userId: string };
      const communityId = id;
      logger.debug(`[Community GetMemberById] Request - communityId: ${communityId}, userId: ${userId}, requesterId: ${requesterId}`);
      const member = await communityService.getUserRoleInCommunity(communityId, userId, requesterId);
      if (member === null) {
        throw new AppError('Member not found', 404);
      }
      logger.debug(`[Community GetMemberById] Success - roles: ${member.roles.join(', ')}`);
      return ApiResponse.success(res, member);
    } catch (error) {
      const requesterId = (req as any).user?.id;
      const { id, userId } = req.params as { id: string; userId: string };
      const communityId = id;
      logger.error(`[Community GetMemberById] Error for communityId: ${communityId}, userId: ${userId}, requesterId: ${requesterId} - ${error}`);
      next(error);
    }
  }


  /**
   * @swagger
   * /api/v1/communities/{id}/members/{userId}:
   *   delete:
   *     summary: Remove a member from community
   *     tags: [Communities]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
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
   *       204:
   *         description: Member removed
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden (only admins)
   *       404:
   *         description: Not found
   */
  async removeMember(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const { id, userId: targetUserId } = req.params as { id: string; userId: string };
      await communityService.removeMember(id, targetUserId, userId);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{id}/members/{userId}:
   *   put:
   *     summary: Update member role in community
   *     tags: [Communities]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
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
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [role]
   *             properties:
   *               role:
   *                 type: string
   *                 example: "admin"
   *     responses:
   *       204:
   *         description: Role updated
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden (only admins)
   *       404:
   *         description: Not found
   */
  async updateMemberRole(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const { id, userId: targetUserId } = req.params as { id: string; userId: string };
      const { role } = req.body as { role: string };
      await communityService.updateMemberRole(id, targetUserId, role, userId);
      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{id}/members/{userId}/feature-roles:
   *   put:
   *     summary: Update member feature roles
   *     description: Set the feature roles for a community member. This replaces all existing feature roles with the provided set.
   *     tags: [Communities]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Community ID
   *       - in: path
   *         name: userId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Target user ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [roles]
   *             properties:
   *               roles:
   *                 type: array
   *                 items:
   *                   type: string
   *                 example: ["forum_manager", "wealth_creator"]
   *                 description: Array of feature roles to assign
   *     responses:
   *       204:
   *         description: Feature roles updated successfully
   *       400:
   *         description: Validation error - invalid role names
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden - only admins can update feature roles
   *       404:
   *         description: Community or user not found
   */
  async updateMemberFeatureRoles(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw new AppError('Unauthorized', 401);
      }

      const { id: communityId, userId: targetUserId } = req.params as { id: string; userId: string };
      const { roles } = req.body as { roles: string[] };

      logger.debug(
        `[Community UpdateMemberFeatureRoles] Request - communityId: ${communityId}, targetUserId: ${targetUserId}, requesterId: ${userId}, roles: [${roles.join(', ')}]`
      );

      await communityService.updateMemberFeatureRoles(communityId, targetUserId, roles as any, userId);

      logger.info(
        `[Community UpdateMemberFeatureRoles] Success - communityId: ${communityId}, targetUserId: ${targetUserId}`
      );

      return res.status(204).send();
    } catch (error) {
      const userId = (req as any).user?.id;
      const { id: communityId, userId: targetUserId } = req.params as { id: string; userId: string };
      logger.error(
        `[Community UpdateMemberFeatureRoles] Error for communityId: ${communityId}, targetUserId: ${targetUserId}, requesterId: ${userId || 'guest'} - ${error}`
      );
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{id}/stats/summary:
   *   get:
   *     summary: Get community statistics summary
   *     description: Returns aggregated statistics about the community including member count, average trust score, wealth count, pool count, and needs count.
   *     tags: [Communities]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Community ID
   *     responses:
   *       200:
   *         description: Community statistics summary
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 memberCount:
   *                   type: integer
   *                   description: Total number of community members
   *                   example: 42
   *                 avgTrustScore:
   *                   type: number
   *                   description: Average trust score across all members
   *                   example: 15
   *                 wealthCount:
   *                   type: integer
   *                   description: Number of active wealth items
   *                   example: 18
   *                 poolCount:
   *                   type: integer
   *                   description: Number of active pools
   *                   example: 3
   *                 needsCount:
   *                   type: integer
   *                   description: Number of open needs
   *                   example: 7
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden - user must be a community member
   *       404:
   *         description: Community not found
   */
  async getStatsSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const { id } = req.params as { id: string };

      if (!userId) {
        throw new AppError('Unauthorized', 401);
      }

      logger.debug(`[Community GetStatsSummary] Request - communityId: ${id}, userId: ${userId}`);
      const stats = await communityService.getStatsSummary(id, userId);
      logger.debug(`[Community GetStatsSummary] Success - communityId: ${id}`);

      return ApiResponse.success(res, stats);
    } catch (error) {
      const userId = (req as any).user?.id;
      const { id } = req.params as { id: string };
      logger.error(`[Community GetStatsSummary] Error for communityId: ${id}, userId: ${userId || 'guest'} - ${error}`);
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{id}/stats/pending-actions:
   *   get:
   *     summary: Get pending actions for the current user in a community
   *     description: Returns counts of pending items that require the user's attention, including incoming wealth requests, outgoing requests, pool distributions, and open disputes.
   *     tags: [Communities]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Community ID
   *     responses:
   *       200:
   *         description: Pending actions for the user
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 incomingRequests:
   *                   type: integer
   *                   description: Number of pending requests for user's wealth items
   *                   example: 5
   *                 outgoingRequests:
   *                   type: integer
   *                   description: Number of user's pending requests to others
   *                   example: 2
   *                 poolDistributions:
   *                   type: integer
   *                   description: Number of pending pool distributions for user
   *                   example: 0
   *                 openDisputes:
   *                   type: integer
   *                   description: Number of open disputes where user is a participant
   *                   example: 1
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden - user must be a community member
   *       404:
   *         description: Community not found
   */
  async getPendingActions(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const { id } = req.params as { id: string };

      if (!userId) {
        throw new AppError('Unauthorized', 401);
      }

      logger.debug(`[Community GetPendingActions] Request - communityId: ${id}, userId: ${userId}`);
      const pendingActions = await communityService.getPendingActions(id, userId);
      logger.debug(`[Community GetPendingActions] Success - communityId: ${id}`);

      return ApiResponse.success(res, pendingActions);
    } catch (error) {
      const userId = (req as any).user?.id;
      const { id } = req.params as { id: string };
      logger.error(`[Community GetPendingActions] Error for communityId: ${id}, userId: ${userId || 'guest'} - ${error}`);
      next(error);
    }
  }
}

export const communityController = new CommunityController();
