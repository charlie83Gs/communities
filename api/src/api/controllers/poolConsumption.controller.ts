import { Request, Response, NextFunction } from 'express';
import { poolConsumptionService } from '../../services/poolConsumption.service';
import { ApiResponse } from '../../utils/response';
import { AppError } from '../../utils/errors';

/**
 * @swagger
 * components:
 *   schemas:
 *     PoolConsumption:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         poolId:
 *           type: string
 *           format: uuid
 *         councilId:
 *           type: string
 *           format: uuid
 *         itemId:
 *           type: string
 *           format: uuid
 *         units:
 *           type: integer
 *         description:
 *           type: string
 *         reportId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *         reportTitle:
 *           type: string
 *           nullable: true
 *         consumedBy:
 *           type: string
 *         consumerName:
 *           type: string
 *         poolName:
 *           type: string
 *         itemName:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
export class PoolConsumptionController {
  /**
   * @swagger
   * /api/v1/communities/{communityId}/councils/{councilId}/consumptions:
   *   post:
   *     summary: Create a consumption from a pool
   *     description: Council managers can consume items from pools for services or materials
   *     tags: [Pool Consumptions]
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
   *               - poolId
   *               - itemId
   *               - units
   *               - description
   *             properties:
   *               poolId:
   *                 type: string
   *                 format: uuid
   *               itemId:
   *                 type: string
   *                 format: uuid
   *               units:
   *                 type: integer
   *                 minimum: 1
   *               description:
   *                 type: string
   *                 minLength: 3
   *                 example: "Transportation for food distribution"
   *               reportId:
   *                 type: string
   *                 format: uuid
   *                 description: Optional - link to existing report
   *     responses:
   *       201:
   *         description: Consumption created successfully
   *       400:
   *         description: Validation error or insufficient inventory
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden - not a council manager
   *       404:
   *         description: Council or pool not found
   */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw new AppError('Unauthorized', 401);
      }

      const { councilId } = req.params;
      const { poolId, itemId, units, description, reportId } = req.body;

      const consumption = await poolConsumptionService.createConsumption(
        councilId,
        { poolId, itemId, units, description, reportId },
        userId
      );

      return ApiResponse.created(res, consumption, 'Consumption created successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/councils/{councilId}/consumptions:
   *   get:
   *     summary: List consumptions for a council
   *     description: Any community member can view consumptions (transparency)
   *     tags: [Pool Consumptions]
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
   *         description: List of consumptions
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden - not a community member
   *       404:
   *         description: Council not found
   */
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw new AppError('Unauthorized', 401);
      }

      const { councilId } = req.params;
      const { page, limit } = req.query;

      const result = await poolConsumptionService.listConsumptions(councilId, userId, {
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
      });

      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/councils/{councilId}/consumptions/unreported:
   *   get:
   *     summary: List unreported consumptions for a council
   *     description: Council managers can see consumptions not yet linked to a report
   *     tags: [Pool Consumptions]
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
   *         description: List of unreported consumptions
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden - not a council manager
   *       404:
   *         description: Council not found
   */
  async listUnreported(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw new AppError('Unauthorized', 401);
      }

      const { councilId } = req.params;

      const consumptions = await poolConsumptionService.listUnreportedConsumptions(councilId, userId);

      return ApiResponse.success(res, consumptions);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/councils/{councilId}/consumptions/{consumptionId}:
   *   get:
   *     summary: Get a consumption by ID
   *     description: Any community member can view consumption details
   *     tags: [Pool Consumptions]
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
   *         name: consumptionId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: Consumption details
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden - not a community member
   *       404:
   *         description: Consumption not found
   */
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw new AppError('Unauthorized', 401);
      }

      const { consumptionId } = req.params;
      const consumption = await poolConsumptionService.getConsumption(consumptionId, userId);

      return ApiResponse.success(res, consumption);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/councils/{councilId}/consumptions/{consumptionId}:
   *   patch:
   *     summary: Update a consumption
   *     description: Council managers can update description or link to report
   *     tags: [Pool Consumptions]
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
   *         name: consumptionId
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
   *               description:
   *                 type: string
   *                 minLength: 3
   *               reportId:
   *                 type: string
   *                 format: uuid
   *                 nullable: true
   *     responses:
   *       200:
   *         description: Consumption updated successfully
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden - not a council manager
   *       404:
   *         description: Consumption not found
   */
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw new AppError('Unauthorized', 401);
      }

      const { consumptionId } = req.params;
      const { description, reportId } = req.body;

      const consumption = await poolConsumptionService.updateConsumption(
        consumptionId,
        { description, reportId },
        userId
      );

      return ApiResponse.success(res, consumption, 'Consumption updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/councils/{councilId}/consumptions/link-to-report:
   *   post:
   *     summary: Link multiple consumptions to a report
   *     description: Council managers can link consumptions to usage reports
   *     tags: [Pool Consumptions]
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
   *               - consumptionIds
   *               - reportId
   *             properties:
   *               consumptionIds:
   *                 type: array
   *                 items:
   *                   type: string
   *                   format: uuid
   *               reportId:
   *                 type: string
   *                 format: uuid
   *     responses:
   *       200:
   *         description: Consumptions linked successfully
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden - not a council manager
   *       404:
   *         description: Council not found
   */
  async linkToReport(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw new AppError('Unauthorized', 401);
      }

      const { councilId } = req.params;
      const { consumptionIds, reportId } = req.body;

      await poolConsumptionService.linkConsumptionsToReport(councilId, consumptionIds, reportId, userId);

      return ApiResponse.success(res, { success: true }, 'Consumptions linked to report successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/councils/{councilId}/consumptions/{consumptionId}:
   *   delete:
   *     summary: Delete a consumption
   *     description: Council managers can delete consumptions (restores inventory)
   *     tags: [Pool Consumptions]
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
   *         name: consumptionId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: Consumption deleted successfully
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden - not a council manager
   *       404:
   *         description: Consumption not found
   */
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw new AppError('Unauthorized', 401);
      }

      const { consumptionId } = req.params;
      await poolConsumptionService.deleteConsumption(consumptionId, userId);

      return ApiResponse.success(res, { success: true }, 'Consumption deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const poolConsumptionController = new PoolConsumptionController();
