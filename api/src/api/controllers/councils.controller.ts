import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { councilsService } from '../../services/councils.service';
import { ApiResponse } from '../../utils/response';
import { AppError } from '../../utils/errors';
import logger from '../../utils/logger';

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
 *         communityId:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         trustScore:
 *           type: number
 *         memberCount:
 *           type: number
 *         createdAt:
 *           type: string
 *           format: date-time
 *         createdBy:
 *           type: string
 *       example:
 *         id: "123e4567-e89b-12d3-a456-426614174000"
 *         communityId: "223e4567-e89b-12d3-a456-426614174111"
 *         name: "Food Council"
 *         description: "Manages community food resources"
 *         trustScore: 25
 *         memberCount: 3
 *         createdAt: "2025-10-01T12:00:00Z"
 *         createdBy: "user123"
 */
export class CouncilsController {
  /**
   * @swagger
   * /api/v1/communities/{communityId}/councils/managed:
   *   get:
   *     summary: Get councils managed by the current user
   *     description: Returns only the councils where the authenticated user is a manager
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
   *         description: The community ID
   *     responses:
   *       200:
   *         description: List of managed councils
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 councils:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Council'
   *       401:
   *         description: Unauthorized
   *       404:
   *         description: Community not found
   *       500:
   *         description: Server error
   */
  async getManagedCouncils(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw new AppError('Unauthorized', 401);
      }

      const { communityId } = req.params as { communityId: string };

      logger.debug(
        `[CouncilsController getManagedCouncils] Request - communityId: ${communityId}, userId: ${userId}`
      );

      const result = await councilsService.getManagedCouncils(communityId, userId);

      logger.debug(
        `[CouncilsController getManagedCouncils] Success - found ${result.councils.length} councils`
      );

      return ApiResponse.success(res, result);
    } catch (error) {
      const userId = req.user?.id;
      const { communityId } = req.params as { communityId: string };
      logger.error(
        `[CouncilsController getManagedCouncils] Error for communityId: ${communityId}, userId: ${userId} - ${error}`
      );
      next(error);
    }
  }
}

export const councilsController = new CouncilsController();
