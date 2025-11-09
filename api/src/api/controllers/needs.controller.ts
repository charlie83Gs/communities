import type { Response, NextFunction } from 'express';
import { needsService } from '@services/needs.service';
import { ApiResponse } from '@utils/response';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

/**
 * @swagger
 * components:
 *   schemas:
 *     Need:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         createdBy:
 *           type: string
 *         communityId:
 *           type: string
 *           format: uuid
 *         itemId:
 *           type: string
 *           format: uuid
 *         title:
 *           type: string
 *         description:
 *           type: string
 *           nullable: true
 *         priority:
 *           type: string
 *           enum: [need, want]
 *         unitsNeeded:
 *           type: integer
 *         isRecurring:
 *           type: boolean
 *         recurrence:
 *           type: string
 *           enum: [daily, weekly, monthly]
 *           nullable: true
 *         lastFulfilledAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         nextFulfillmentDate:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         status:
 *           type: string
 *           enum: [active, fulfilled, cancelled, expired]
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       example:
 *         id: "123e4567-e89b-12d3-a456-426614174000"
 *         createdBy: "user123"
 *         communityId: "123e4567-e89b-12d3-a456-426614174001"
 *         itemId: "123e4567-e89b-12d3-a456-426614174002"
 *         title: "Weekly vegetables"
 *         description: "I need fresh vegetables every week"
 *         priority: "need"
 *         unitsNeeded: 5
 *         isRecurring: true
 *         recurrence: "weekly"
 *         status: "active"
 *         createdAt: "2025-10-01T12:00:00Z"
 *         updatedAt: "2025-10-01T12:00:00Z"
 *
 *     CouncilNeed:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         councilId:
 *           type: string
 *           format: uuid
 *         createdBy:
 *           type: string
 *         communityId:
 *           type: string
 *           format: uuid
 *         itemId:
 *           type: string
 *           format: uuid
 *         title:
 *           type: string
 *         description:
 *           type: string
 *           nullable: true
 *         priority:
 *           type: string
 *           enum: [need, want]
 *         unitsNeeded:
 *           type: integer
 *         isRecurring:
 *           type: boolean
 *         recurrence:
 *           type: string
 *           enum: [daily, weekly, monthly]
 *           nullable: true
 *         status:
 *           type: string
 *           enum: [active, fulfilled, cancelled, expired]
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *
 *     NeedAggregation:
 *       type: object
 *       properties:
 *         itemId:
 *           type: string
 *           format: uuid
 *         itemName:
 *           type: string
 *         itemKind:
 *           type: string
 *           enum: [object, service]
 *         priority:
 *           type: string
 *           enum: [need, want]
 *         recurrence:
 *           type: string
 *           enum: [one-time, daily, weekly, monthly]
 *         totalUnitsNeeded:
 *           type: integer
 *         memberCount:
 *           type: integer
 *
 *     CommunityNeedsAggregation:
 *       type: object
 *       properties:
 *         needs:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/NeedAggregation'
 *         wants:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/NeedAggregation'
 */
export class NeedsController {
  // ========================================
  // MEMBER NEEDS
  // ========================================

  /**
   * @swagger
   * /api/v1/needs:
   *   post:
   *     summary: Create a new need
   *     tags: [Needs]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [communityId, itemId, title, priority, unitsNeeded, isRecurring]
   *             properties:
   *               communityId:
   *                 type: string
   *                 format: uuid
   *               itemId:
   *                 type: string
   *                 format: uuid
   *               title:
   *                 type: string
   *               description:
   *                 type: string
   *               priority:
   *                 type: string
   *                 enum: [need, want]
   *               unitsNeeded:
   *                 type: integer
   *               isRecurring:
   *                 type: boolean
   *               recurrence:
   *                 type: string
   *                 enum: [daily, weekly, monthly]
   *     responses:
   *       201:
   *         description: Need created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Need'
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Item not found
   */
  async createNeed(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) return ApiResponse.error(res, 'Unauthorized', 401);

      const need = await needsService.createNeed(req.body, userId);
      return ApiResponse.created(res, need, 'Need created successfully');
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /api/v1/needs:
   *   get:
   *     summary: List needs for a community
   *     tags: [Needs]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: communityId
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Filter by community ID (optional)
   *       - in: query
   *         name: priority
   *         schema:
   *           type: string
   *           enum: [need, want]
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [active, fulfilled, cancelled, expired]
   *       - in: query
   *         name: isRecurring
   *         schema:
   *           type: boolean
   *     responses:
   *       200:
   *         description: List of needs
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Need'
   */
  async listNeeds(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) return ApiResponse.error(res, 'Unauthorized', 401);

      const { communityId, priority, status, isRecurring } = req.query as any;

      const needs = await needsService.listNeeds(
        { communityId, priority, status, isRecurring },
        userId
      );
      return ApiResponse.success(res, needs);
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /api/v1/needs/{id}:
   *   get:
   *     summary: Get a need by ID
   *     tags: [Needs]
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
   *         description: Need details
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Need'
   *       404:
   *         description: Need not found
   */
  async getNeed(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) return ApiResponse.error(res, 'Unauthorized', 401);

      const need = await needsService.getNeed(req.params.id, userId);
      return ApiResponse.success(res, need);
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /api/v1/needs/{id}:
   *   patch:
   *     summary: Update a need
   *     tags: [Needs]
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
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               title:
   *                 type: string
   *               description:
   *                 type: string
   *               priority:
   *                 type: string
   *                 enum: [need, want]
   *               unitsNeeded:
   *                 type: integer
   *               isRecurring:
   *                 type: boolean
   *               recurrence:
   *                 type: string
   *                 enum: [daily, weekly, monthly]
   *               status:
   *                 type: string
   *                 enum: [active, fulfilled, cancelled, expired]
   *     responses:
   *       200:
   *         description: Need updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Need'
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Need not found
   */
  async updateNeed(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) return ApiResponse.error(res, 'Unauthorized', 401);

      const need = await needsService.updateNeed(req.params.id, req.body, userId);
      return ApiResponse.success(res, need, 'Need updated successfully');
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /api/v1/needs/{id}:
   *   delete:
   *     summary: Delete a need
   *     tags: [Needs]
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
   *         description: Need deleted successfully
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Need not found
   */
  async deleteNeed(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) return ApiResponse.error(res, 'Unauthorized', 401);

      await needsService.deleteNeed(req.params.id, userId);
      return ApiResponse.success(res, null, 'Need deleted successfully');
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /api/v1/needs/aggregated:
   *   get:
   *     summary: Get aggregated needs for a community
   *     tags: [Needs]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: communityId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: Aggregated needs
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/CommunityNeedsAggregation'
   */
  async getAggregatedNeeds(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) return ApiResponse.error(res, 'Unauthorized', 401);

      const { communityId } = req.query as any;
      const aggregation = await needsService.getAggregatedNeeds(communityId, userId);
      return ApiResponse.success(res, aggregation);
    } catch (err) {
      next(err);
    }
  }

  // ========================================
  // COUNCIL NEEDS
  // ========================================

  /**
   * @swagger
   * /api/v1/needs/council:
   *   post:
   *     summary: Create a new council need
   *     tags: [Needs]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [councilId, communityId, itemId, title, priority, unitsNeeded, isRecurring]
   *             properties:
   *               councilId:
   *                 type: string
   *                 format: uuid
   *               communityId:
   *                 type: string
   *                 format: uuid
   *               itemId:
   *                 type: string
   *                 format: uuid
   *               title:
   *                 type: string
   *               description:
   *                 type: string
   *               priority:
   *                 type: string
   *                 enum: [need, want]
   *               unitsNeeded:
   *                 type: integer
   *               isRecurring:
   *                 type: boolean
   *               recurrence:
   *                 type: string
   *                 enum: [daily, weekly, monthly]
   *     responses:
   *       201:
   *         description: Council need created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/CouncilNeed'
   */
  async createCouncilNeed(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) return ApiResponse.error(res, 'Unauthorized', 401);

      const need = await needsService.createCouncilNeed(req.body, userId);
      return ApiResponse.created(res, need, 'Council need created successfully');
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /api/v1/needs/council:
   *   get:
   *     summary: List needs for a council
   *     tags: [Needs]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: councilId
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Filter by council ID (optional)
   *       - in: query
   *         name: communityId
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Filter by community ID (optional)
   *       - in: query
   *         name: priority
   *         schema:
   *           type: string
   *           enum: [need, want]
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [active, fulfilled, cancelled, expired]
   *       - in: query
   *         name: isRecurring
   *         schema:
   *           type: boolean
   *     responses:
   *       200:
   *         description: List of council needs
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/CouncilNeed'
   */
  async listCouncilNeeds(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) return ApiResponse.error(res, 'Unauthorized', 401);

      const { councilId, communityId, priority, status, isRecurring } = req.query as any;

      const needs = await needsService.listCouncilNeeds(
        { councilId, communityId, priority, status, isRecurring },
        userId
      );
      return ApiResponse.success(res, needs);
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /api/v1/needs/council/{id}:
   *   get:
   *     summary: Get a council need by ID
   *     tags: [Needs]
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
   *         description: Council need details
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/CouncilNeed'
   *       404:
   *         description: Council need not found
   */
  async getCouncilNeed(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) return ApiResponse.error(res, 'Unauthorized', 401);

      const need = await needsService.getCouncilNeed(req.params.id, userId);
      return ApiResponse.success(res, need);
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /api/v1/needs/council/{id}:
   *   patch:
   *     summary: Update a council need
   *     tags: [Needs]
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
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               title:
   *                 type: string
   *               description:
   *                 type: string
   *               priority:
   *                 type: string
   *                 enum: [need, want]
   *               unitsNeeded:
   *                 type: integer
   *               isRecurring:
   *                 type: boolean
   *               recurrence:
   *                 type: string
   *                 enum: [daily, weekly, monthly]
   *               status:
   *                 type: string
   *                 enum: [active, fulfilled, cancelled, expired]
   *     responses:
   *       200:
   *         description: Council need updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/CouncilNeed'
   */
  async updateCouncilNeed(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) return ApiResponse.error(res, 'Unauthorized', 401);

      const need = await needsService.updateCouncilNeed(req.params.id, req.body, userId);
      return ApiResponse.success(res, need, 'Council need updated successfully');
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /api/v1/needs/council/{id}:
   *   delete:
   *     summary: Delete a council need
   *     tags: [Needs]
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
   *         description: Council need deleted successfully
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Council need not found
   */
  async deleteCouncilNeed(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) return ApiResponse.error(res, 'Unauthorized', 401);

      await needsService.deleteCouncilNeed(req.params.id, userId);
      return ApiResponse.success(res, null, 'Council need deleted successfully');
    } catch (err) {
      next(err);
    }
  }
}

export const needsController = new NeedsController();
