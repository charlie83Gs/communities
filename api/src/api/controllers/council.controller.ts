import { Request, Response, NextFunction } from 'express';
import { councilService } from '../../services/council.service';
import { ApiResponse } from '../../utils/response';
import { AppError } from '../../utils/errors';

/**
 * @swagger
 * components:
 *   schemas:
 *     Council:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         trustScore:
 *           type: integer
 *         memberCount:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date-time
 *         createdBy:
 *           type: string
 */
export class CouncilController {
  /**
   * @swagger
   * /api/v1/communities/{communityId}/councils:
   *   get:
   *     summary: List all councils in a community
   *     tags: [Councils]
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
   *           minimum: 1
   *         example: 1
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *         example: 20
   *       - in: query
   *         name: sortBy
   *         schema:
   *           type: string
   *           enum: [trustScore, createdAt]
   *         example: trustScore
   *       - in: query
   *         name: order
   *         schema:
   *           type: string
   *           enum: [asc, desc]
   *         example: desc
   *     responses:
   *       200:
   *         description: List of councils
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   */
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw new AppError('Unauthorized', 401);
      }

      const { communityId } = req.params;
      const { page, limit, sortBy, order } = req.query;

      const result = await councilService.listCouncils(communityId, userId, {
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
        sortBy: sortBy as 'trustScore' | 'createdAt',
        order: order as 'asc' | 'desc',
      });

      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/councils/{councilId}:
   *   get:
   *     summary: Get council details
   *     tags: [Councils]
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
   *         name: councilId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: Council details
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Council not found
   */
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw new AppError('Unauthorized', 401);
      }

      const { councilId } = req.params;
      const council = await councilService.getCouncil(councilId, userId);

      return ApiResponse.success(res, council);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/councils:
   *   post:
   *     summary: Create a new council
   *     tags: [Councils]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: communityId
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
   *             required:
   *               - name
   *               - description
   *             properties:
   *               name:
   *                 type: string
   *                 minLength: 3
   *                 maxLength: 100
   *                 example: "Food Council"
   *               description:
   *                 type: string
   *                 minLength: 10
   *                 maxLength: 1000
   *                 example: "Managing community food resources and initiatives"
   *     responses:
   *       201:
   *         description: Council created successfully
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

      const { communityId } = req.params;
      const { name, description } = req.body;

      const council = await councilService.createCouncil(
        { communityId, name, description, createdBy: userId },
        userId
      );

      return ApiResponse.created(res, council, 'Council created successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/councils/{councilId}:
   *   put:
   *     summary: Update council details
   *     tags: [Councils]
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
   *         name: councilId
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
   *                 minLength: 3
   *                 maxLength: 100
   *               description:
   *                 type: string
   *                 minLength: 10
   *                 maxLength: 1000
   *     responses:
   *       200:
   *         description: Council updated successfully
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Council not found
   */
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw new AppError('Unauthorized', 401);
      }

      const { councilId } = req.params;
      const { name, description } = req.body;

      const council = await councilService.updateCouncil(councilId, { name, description }, userId);

      return ApiResponse.success(res, council, 'Council updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/councils/{councilId}:
   *   delete:
   *     summary: Delete a council
   *     tags: [Councils]
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
   *         name: councilId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: Council deleted successfully
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden (admin only)
   *       404:
   *         description: Council not found
   */
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw new AppError('Unauthorized', 401);
      }

      const { councilId } = req.params;
      await councilService.deleteCouncil(councilId, userId);

      return ApiResponse.success(res, { success: true }, 'Council deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/councils/{councilId}/trust:
   *   post:
   *     summary: Award trust to a council
   *     tags: [Councils]
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
   *         name: councilId
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
   *               award:
   *                 type: boolean
   *                 example: true
   *     responses:
   *       200:
   *         description: Trust awarded successfully
   *       400:
   *         description: Already awarded or validation error
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Council not found
   */
  async awardTrust(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw new AppError('Unauthorized', 401);
      }

      const { councilId } = req.params;
      const result = await councilService.awardTrust(councilId, userId);

      return ApiResponse.success(res, result, 'Trust awarded successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/councils/{councilId}/trust:
   *   delete:
   *     summary: Remove trust from a council
   *     tags: [Councils]
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
   *         name: councilId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: Trust removed successfully
   *       400:
   *         description: Trust not previously awarded
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Council not found
   */
  async removeTrust(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw new AppError('Unauthorized', 401);
      }

      const { councilId } = req.params;
      const result = await councilService.removeTrust(councilId, userId);

      return ApiResponse.success(res, result, 'Trust removed successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/councils/{councilId}/trust-status:
   *   get:
   *     summary: Check if current user trusts this council
   *     tags: [Councils]
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
   *         name: councilId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: Trust status
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Council not found
   */
  async getTrustStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw new AppError('Unauthorized', 401);
      }

      const { councilId } = req.params;
      const result = await councilService.getTrustStatus(councilId, userId);

      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/councils/{councilId}/managers:
   *   post:
   *     summary: Add a council manager
   *     description: Admin or existing council managers can add new managers to a council
   *     tags: [Councils]
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
   *         name: councilId
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
   *             required:
   *               - userId
   *             properties:
   *               userId:
   *                 type: string
   *                 example: "user123"
   *     responses:
   *       200:
   *         description: Manager added successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 managers:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       userId:
   *                         type: string
   *                       userName:
   *                         type: string
   *                       userEmail:
   *                         type: string
   *                       addedAt:
   *                         type: string
   *                         format: date-time
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden (admin or council manager required)
   *       404:
   *         description: Council not found
   */
  async addManager(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw new AppError('Unauthorized', 401);
      }

      const { councilId } = req.params;
      const { userId: targetUserId } = req.body;

      const result = await councilService.addManager(councilId, targetUserId, userId);

      return ApiResponse.success(res, result, 'Manager added successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/councils/{councilId}/managers/{userId}:
   *   delete:
   *     summary: Remove a council manager
   *     tags: [Councils]
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
   *         name: councilId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *       - in: path
   *         name: userId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Manager removed successfully
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden (admin only)
   *       404:
   *         description: Council not found
   */
  async removeManager(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw new AppError('Unauthorized', 401);
      }

      const { councilId, userId: targetUserId } = req.params;
      const result = await councilService.removeManager(councilId, targetUserId, userId);

      return ApiResponse.success(res, result, 'Manager removed successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const councilController = new CouncilController();
