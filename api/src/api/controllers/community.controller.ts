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
}

export const communityController = new CommunityController();