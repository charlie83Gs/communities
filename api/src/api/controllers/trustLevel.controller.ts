import { Request, Response, NextFunction } from 'express';
import { trustLevelService } from '../../services/trustLevel.service';
import { ApiResponse } from '../../utils/response';

/**
 * @swagger
 * components:
 *   schemas:
 *     TrustLevel:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         communityId:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *           example: "Stable"
 *         threshold:
 *           type: integer
 *           example: 10
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     TrustRequirement:
 *       oneOf:
 *         - type: object
 *           properties:
 *             type:
 *               type: string
 *               enum: [number]
 *             value:
 *               type: integer
 *               example: 15
 *         - type: object
 *           properties:
 *             type:
 *               type: string
 *               enum: [level]
 *             value:
 *               type: string
 *               example: "Stable"
 */
export class TrustLevelController {
  /**
   * @swagger
   * /api/v1/communities/{communityId}/trust-levels:
   *   post:
   *     summary: Create a new trust level
   *     tags: [Trust Levels]
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
   *               - threshold
   *             properties:
   *               name:
   *                 type: string
   *                 example: "Expert"
   *               threshold:
   *                 type: integer
   *                 example: 100
   *     responses:
   *       201:
   *         description: Trust level created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/TrustLevel'
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden - only admins can create trust levels
   *       404:
   *         description: Community not found
   */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const { communityId } = req.params;
      const trustLevel = await trustLevelService.createTrustLevel(communityId, req.body, userId);
      return ApiResponse.created(res, trustLevel, 'Trust level created successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/trust-levels:
   *   get:
   *     summary: Get all trust levels for a community
   *     tags: [Trust Levels]
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
   *         description: List of trust levels
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/TrustLevel'
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden - no access to this community
   *       404:
   *         description: Community not found
   */
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const { communityId } = req.params;
      const trustLevels = await trustLevelService.listTrustLevels(communityId, userId);
      return ApiResponse.success(res, trustLevels);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/trust-levels/{levelId}:
   *   get:
   *     summary: Get a specific trust level
   *     tags: [Trust Levels]
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
   *         name: levelId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: Trust level details
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/TrustLevel'
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden - no access to this community
   *       404:
   *         description: Trust level not found
   */
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const { levelId } = req.params;
      const trustLevel = await trustLevelService.getTrustLevel(levelId, userId);
      return ApiResponse.success(res, trustLevel);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/trust-levels/{levelId}:
   *   put:
   *     summary: Update a trust level
   *     tags: [Trust Levels]
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
   *         name: levelId
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
   *                 example: "Expert"
   *               threshold:
   *                 type: integer
   *                 example: 100
   *     responses:
   *       200:
   *         description: Trust level updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/TrustLevel'
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden - only admins can update trust levels
   *       404:
   *         description: Trust level not found
   */
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const { levelId } = req.params;
      const trustLevel = await trustLevelService.updateTrustLevel(levelId, req.body, userId);
      return ApiResponse.success(res, trustLevel, 'Trust level updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/trust-levels/{levelId}:
   *   delete:
   *     summary: Delete a trust level
   *     tags: [Trust Levels]
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
   *         name: levelId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: Trust level deleted successfully
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden - only admins can delete trust levels
   *       404:
   *         description: Trust level not found
   */
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const { levelId } = req.params;
      await trustLevelService.deleteTrustLevel(levelId, userId);
      return ApiResponse.success(res, null, 'Trust level deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/trust-levels/resolve/{reference}:
   *   get:
   *     summary: Resolve a trust level reference to a numeric value
   *     tags: [Trust Levels]
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
   *         name: reference
   *         required: true
   *         schema:
   *           type: string
   *         description: The trust level name to resolve
   *         example: "Stable"
   *     responses:
   *       200:
   *         description: Resolved trust level
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 name:
   *                   type: string
   *                   example: "Stable"
   *                 threshold:
   *                   type: integer
   *                   example: 10
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden - no access to this community
   *       404:
   *         description: Trust level not found
   */
  async resolve(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const { communityId, reference } = req.params;
      const resolved = await trustLevelService.resolveTrustReference(communityId, reference, userId);
      return ApiResponse.success(res, resolved);
    } catch (error) {
      next(error);
    }
  }
}

export const trustLevelController = new TrustLevelController();
