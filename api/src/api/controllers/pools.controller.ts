import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '@/api/middlewares/auth.middleware';
import { poolsService } from '@/services/pools.service';
import { ApiResponse } from '@/utils/response';
import logger from '@/utils/logger';

/**
 * @swagger
 * tags:
 *   name: Pools
 *   description: Pool management and distribution endpoints
 */
class PoolsController {
  /**
   * @swagger
   * /api/v1/communities/{communityId}/councils/{councilId}/pools:
   *   post:
   *     summary: Create a new pool
   *     tags: [Pools]
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
   *               - name
   *               - description
   *               - distributionType
   *             properties:
   *               name:
   *                 type: string
   *                 maxLength: 200
   *               description:
   *                 type: string
   *               primaryItemId:
   *                 type: string
   *                 format: uuid
   *               distributionType:
   *                 type: string
   *                 enum: [manual, needs_based]
   *               maxUnitsPerUser:
   *                 type: integer
   *                 minimum: 1
   *               minimumContribution:
   *                 type: integer
   *                 minimum: 1
   *     responses:
   *       201:
   *         description: Pool created successfully
   *       403:
   *         description: Only council managers can create pools
   */
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { communityId, councilId } = req.params;
      const userId = req.user!.id;

      const pool = await poolsService.createPool(communityId, councilId, req.body, userId);

      logger.info('Pool created', { poolId: pool.id, communityId, councilId, userId });
      return ApiResponse.created(res, pool, 'Pool created successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/pools/{poolId}:
   *   get:
   *     summary: Get pool by ID
   *     tags: [Pools]
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
   *         name: poolId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: Pool details
   *       404:
   *         description: Pool not found
   */
  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { poolId } = req.params;
      const userId = req.user!.id;

      const pool = await poolsService.getPool(poolId, userId);
      return ApiResponse.success(res, pool);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/pools:
   *   get:
   *     summary: List all pools in a community
   *     tags: [Pools]
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
   *         description: List of pools
   */
  async listCommunityPools(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { communityId } = req.params;
      const userId = req.user!.id;

      const pools = await poolsService.listCommunityPools(communityId, userId);
      return ApiResponse.success(res, pools);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/pools/{poolId}:
   *   patch:
   *     summary: Update pool settings
   *     tags: [Pools]
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
   *         name: poolId
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
   *               description:
   *                 type: string
   *               primaryItemId:
   *                 type: string
   *                 format: uuid
   *               distributionType:
   *                 type: string
   *                 enum: [manual, needs_based]
   *               maxUnitsPerUser:
   *                 type: integer
   *               minimumContribution:
   *                 type: integer
   *     responses:
   *       200:
   *         description: Pool updated successfully
   *       403:
   *         description: Only council managers can update pools
   */
  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { poolId } = req.params;
      const userId = req.user!.id;

      const pool = await poolsService.updatePool(poolId, req.body, userId);

      logger.info('Pool updated', { poolId, userId });
      return ApiResponse.success(res, pool, 'Pool updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/pools/{poolId}:
   *   delete:
   *     summary: Delete a pool
   *     tags: [Pools]
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
   *         name: poolId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       204:
   *         description: Pool deleted successfully
   *       403:
   *         description: Only council managers can delete pools
   */
  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { poolId } = req.params;
      const userId = req.user!.id;

      await poolsService.deletePool(poolId, userId);

      logger.info('Pool deleted', { poolId, userId });
      return ApiResponse.noContent(res);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/pools/{poolId}/contributions:
   *   post:
   *     summary: Contribute to a pool
   *     tags: [Pools]
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
   *         name: poolId
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
   *               - itemId
   *               - unitsOffered
   *               - title
   *             properties:
   *               itemId:
   *                 type: string
   *                 format: uuid
   *               unitsOffered:
   *                 type: integer
   *                 minimum: 1
   *               message:
   *                 type: string
   *               title:
   *                 type: string
   *               description:
   *                 type: string
   *     responses:
   *       201:
   *         description: Contribution created successfully
   */
  async contributeToPool(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { poolId } = req.params;
      const userId = req.user!.id;

      const result = await poolsService.contributeToPool(poolId, req.body, userId);

      logger.info('Pool contribution created', { poolId, userId, wealthId: result.wealth.id });
      return ApiResponse.created(res, result.wealth, 'Contribution created successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/pools/{poolId}/contributions/pending:
   *   get:
   *     summary: List pending contributions to pool
   *     tags: [Pools]
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
   *         name: poolId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: List of pending contributions
   *       403:
   *         description: Only council managers can view pending contributions
   */
  async listPendingContributions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { poolId } = req.params;
      const userId = req.user!.id;

      const contributions = await poolsService.listPendingContributions(poolId, userId);
      return ApiResponse.success(res, contributions);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/pools/{poolId}/contributions/{wealthId}/confirm:
   *   patch:
   *     summary: Confirm pool contribution
   *     tags: [Pools]
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
   *         name: poolId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *       - in: path
   *         name: wealthId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: Contribution confirmed successfully
   *       403:
   *         description: Only council managers can confirm contributions
   */
  async confirmContribution(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { poolId, wealthId } = req.params;
      const userId = req.user!.id;

      await poolsService.confirmContribution(poolId, wealthId, userId);

      logger.info('Pool contribution confirmed', { poolId, wealthId, userId });
      return ApiResponse.success(res, null, 'Contribution confirmed successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/pools/{poolId}/contributions/{wealthId}/reject:
   *   patch:
   *     summary: Reject pool contribution
   *     tags: [Pools]
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
   *         name: poolId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *       - in: path
   *         name: wealthId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: Contribution rejected successfully
   *       403:
   *         description: Only council managers can reject contributions
   */
  async rejectContribution(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { poolId, wealthId } = req.params;
      const userId = req.user!.id;

      await poolsService.rejectContribution(poolId, wealthId, userId);

      logger.info('Pool contribution rejected', { poolId, wealthId, userId });
      return ApiResponse.success(res, null, 'Contribution rejected successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/pools/{poolId}/distributions:
   *   post:
   *     summary: Distribute from pool manually
   *     tags: [Pools]
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
   *         name: poolId
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
   *               - recipientId
   *               - itemId
   *               - unitsDistributed
   *               - title
   *             properties:
   *               recipientId:
   *                 type: string
   *               itemId:
   *                 type: string
   *                 format: uuid
   *               unitsDistributed:
   *                 type: integer
   *                 minimum: 1
   *               title:
   *                 type: string
   *               description:
   *                 type: string
   *     responses:
   *       201:
   *         description: Distribution created successfully
   *       403:
   *         description: Only council managers can distribute from pools
   */
  async distributeFromPool(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { poolId } = req.params;
      const userId = req.user!.id;

      const result = await poolsService.distributeFromPool(poolId, req.body, userId);

      logger.info('Pool distribution created', { poolId, userId });
      return ApiResponse.created(res, result, 'Distribution created successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/pools/{poolId}/distributions/mass/preview:
   *   post:
   *     summary: Preview needs-based mass distribution
   *     tags: [Pools]
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
   *         name: poolId
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
   *               - itemId
   *               - fulfillmentStrategy
   *             properties:
   *               itemId:
   *                 type: string
   *                 format: uuid
   *               maxUnitsPerUser:
   *                 type: integer
   *               selectedUserIds:
   *                 type: array
   *                 items:
   *                   type: string
   *               fulfillmentStrategy:
   *                 type: string
   *                 enum: [full, partial, equal]
   *     responses:
   *       200:
   *         description: Mass distribution preview
   */
  async previewMassDistribution(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { poolId } = req.params;
      const userId = req.user!.id;

      const preview = await poolsService.previewMassDistribution(poolId, req.body, userId);
      return ApiResponse.success(res, preview);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/pools/{poolId}/distributions/mass:
   *   post:
   *     summary: Execute needs-based mass distribution
   *     tags: [Pools]
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
   *         name: poolId
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
   *               - itemId
   *               - fulfillmentStrategy
   *             properties:
   *               itemId:
   *                 type: string
   *                 format: uuid
   *               maxUnitsPerUser:
   *                 type: integer
   *               selectedUserIds:
   *                 type: array
   *                 items:
   *                   type: string
   *               fulfillmentStrategy:
   *                 type: string
   *                 enum: [full, partial, equal]
   *     responses:
   *       201:
   *         description: Mass distribution executed successfully
   *       403:
   *         description: Only council managers can execute mass distribution
   */
  async executeMassDistribution(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { poolId } = req.params;
      const userId = req.user!.id;

      const result = await poolsService.executeMassDistribution(poolId, req.body, userId);

      logger.info('Mass distribution executed', { poolId, userId, ...result });
      return ApiResponse.created(res, result, 'Mass distribution executed successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/pools/{poolId}/distributions:
   *   get:
   *     summary: List distributions from pool
   *     tags: [Pools]
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
   *         name: poolId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: List of distributions
   *       403:
   *         description: Only council managers can view distributions
   */
  async listDistributions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { poolId } = req.params;
      const userId = req.user!.id;

      const distributions = await poolsService.listDistributions(poolId, userId);
      return ApiResponse.success(res, distributions);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/pools/{poolId}/inventory:
   *   get:
   *     summary: Get pool inventory
   *     tags: [Pools]
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
   *         name: poolId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: Pool inventory
   */
  async getInventory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { poolId } = req.params;
      const userId = req.user!.id;

      const inventory = await poolsService.getPoolInventory(poolId, userId);
      return ApiResponse.success(res, inventory);
    } catch (error) {
      next(error);
    }
  }
}

export const poolsController = new PoolsController();
