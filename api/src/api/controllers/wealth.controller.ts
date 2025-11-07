import type { Request, Response, NextFunction } from 'express';
import { wealthService } from '@services/wealth.service';
import { wealthCommentService } from '@services/wealthComment.service';
import { ApiResponse } from '@utils/response';

/**
 * @swagger
 * components:
 *   schemas:
 *     Wealth:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         communityId:
 *           type: string
 *           format: uuid
 *         title:
 *           type: string
 *         description:
 *           type: string
 *           nullable: true
 *         image:
 *           type: string
 *           nullable: true
 *         type:
 *           type: string
 *           enum: [object, service]
 *         durationType:
 *           type: string
 *           enum: [timebound, unlimited]
 *         endDate:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         distributionType:
 *           type: string
 *           enum: [request_based, unit_based]
 *         unitsAvailable:
 *           type: integer
 *           nullable: true
 *         maxUnitsPerUser:
 *           type: integer
 *           nullable: true
 *         automationEnabled:
 *           type: boolean
 *         status:
 *           type: string
 *           enum: [active, fulfilled, expired, cancelled]
 *         createdBy:
 *           type: string
 *           format: uuid
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       example:
 *         id: "123e4567-e89b-12d3-a456-426614174000"
 *         communityId: "123e4567-e89b-12d3-a456-426614174001"
 *         title: "Spare lawn mower"
 *         description: "Lightly used mower available this weekend"
 *         image: "mower.webp"
 *         durationType: "timebound"
 *         endDate: "2025-12-31T23:59:59Z"
 *         distributionType: "request_based"
 *         unitsAvailable: null
 *         maxUnitsPerUser: null
 *         automationEnabled: false
 *         status: "active"
 *         createdBy: "123e4567-e89b-12d3-a456-426614174999"
 *         createdAt: "2025-10-01T12:00:00Z"
 *         updatedAt: "2025-10-01T12:00:00Z"
 *
 *     WealthRequest:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         wealthId:
 *           type: string
 *           format: uuid
 *         requesterId:
 *           type: string
 *           format: uuid
 *         message:
 *           type: string
 *           nullable: true
 *         unitsRequested:
 *           type: integer
 *           nullable: true
 *         status:
 *           type: string
 *           enum: [pending, accepted, rejected, cancelled, fulfilled, failed]
 *         createdAt:
 *           type: string
 *           format: date-time
 *       example:
 *         id: "223e4567-e89b-12d3-a456-426614174000"
 *         wealthId: "123e4567-e89b-12d3-a456-426614174000"
 *         requesterId: "98be64a7-a6a3-4e6a-8f0c-5bd6f8a1d123"
 *         message: "Can I pick it up Saturday morning?"
 *         unitsRequested: 1
 *         status: "pending"
 *         createdAt: "2025-10-02T10:00:00Z"
 *     WealthComment:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         wealthId:
 *           type: string
 *           format: uuid
 *         authorId:
 *           type: string
 *           format: uuid
 *         content:
 *           type: string
 *         parentId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       example:
 *         id: "123e4567-e89b-12d3-a456-426614174000"
 *         wealthId: "123e4567-e89b-12d3-a456-426614174001"
 *         authorId: "123e4567-e89b-12d3-a456-426614174999"
 *         content: "This wealth looks great!"
 *         parentId: null
 *         createdAt: "2025-10-06T20:00:00Z"
 *         updatedAt: "2025-10-06T20:00:00Z"
 *     */
export class WealthController {
  /**
   * @swagger
   * /api/v1/wealths:
   *   get:
   *     summary: List wealths
   *     description: List wealths for a specific community (requires membership) or all communities the current user belongs to.
   *     tags: [Wealths]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: communityId
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Community ID to filter by. If omitted, lists wealths across communities the user belongs to.
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [active, fulfilled, expired, cancelled]
   *     responses:
   *       200:
   *         description: List of wealths
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Wealth'
   *             example:
   *               - id: "123e4567-e89b-12d3-a456-426614174000"
   *                 communityId: "123e4567-e89b-12d3-a456-426614174001"
   *                 title: "Spare lawn mower"
   *                 description: "Lightly used mower available this weekend"
   *                 durationType: "timebound"
   *                 endDate: "2025-12-31T23:59:59Z"
   *                 distributionType: "request_based"
   *                 status: "active"
   */
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const { communityId, status } = req.query as { communityId?: string; status?: any };
      if (communityId) {
        const wealths = await wealthService.listCommunityWealth(communityId, userId, status);
        return ApiResponse.success(res, wealths);
      }
      const wealths = await wealthService.listMyCommunitiesWealth(userId, status);
      return ApiResponse.success(res, wealths);
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /api/v1/wealths/search:
   *   get:
   *     summary: Search wealths
   *     description: Search wealths scoped to user's communities (or a specific community) with filters. Performs case-insensitive search across title and description. Matched terms will be bolded in highlightedTitle/highlightedDescription fields using Markdown.
   *     tags: [Wealths]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: q
   *         required: false
   *         schema:
   *           type: string
   *         description: Optional search text (matches title and description). If omitted or empty, returns all wealths within scope.
   *       - in: query
   *         name: communityId
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Restrict search to a specific community (membership required)
   *       - in: query
   *         name: type
   *         schema:
   *           type: string
   *           enum: [object, service]
   *       - in: query
   *         name: durationType
   *         schema:
   *           type: string
   *           enum: [timebound, unlimited]
   *       - in: query
   *         name: distributionType
   *         schema:
   *           type: string
   *           enum: [request_based, unit_based]
   *       - in: query
   *         name: status
   *         description: Wealth status to filter by (default -> active)
   *         schema:
   *           type: string
   *           enum:
   *             - active
   *             - fulfilled
   *             - expired
   *             - cancelled
   *       - in: query
   *         name: endDateAfter
   *         schema:
   *           type: string
   *           format: date-time
   *       - in: query
   *         name: endDateBefore
   *         schema:
   *           type: string
   *           format: date-time
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           minimum: 1
   *         description: Page number (default 1)
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *         description: Page size (default 20, max 100)
   *     responses:
   *       200:
   *         description: Search results with optional highlighted fields and pagination
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 items:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Wealth'
   *                 pagination:
   *                   type: object
   *                   properties:
   *                     total: { type: integer, example: 42 }
   *                     page: { type: integer, example: 1 }
   *                     limit: { type: integer, example: 20 }
   *                     hasMore: { type: boolean, example: true }
   *             example:
   *               items:
   *                 - id: "123e4567-e89b-12d3-a456-426614174000"
   *                   title: "Spare lawn mower"
   *                   status: "active"
   *               pagination:
   *                 total: 42
   *                 page: 1
   *                 limit: 20
   *                 hasMore: true
   */
  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const {
        q,
        communityId,
        type,
        durationType,
        distributionType,
        status,
        endDateAfter,
        endDateBefore,
        page,
        limit,
      } = req.query as {
        q: string;
        communityId?: string;
        type?: 'object' | 'service';
        durationType?: 'timebound' | 'unlimited';
        distributionType?: 'request_based' | 'unit_based';
        status?: 'active' | 'fulfilled' | 'expired' | 'cancelled';
        endDateAfter?: string;
        endDateBefore?: string;
        page?: string | number;
        limit?: string | number;
      };

      const numericPage = page != null ? Number(page) : undefined;
      const numericLimit = limit != null ? Number(limit) : undefined;

      const results = await wealthService.searchWealth(userId, {
        q,
        communityId,
        type,
        durationType,
        distributionType,
        status,
        endDateAfter,
        endDateBefore,
        page: numericPage,
        limit: numericLimit,
      });

      // Return consistent payload with items + pagination meta
      return ApiResponse.success(res, {
        items: results.items,
        pagination: {
          total: results.total,
          page: results.page,
          limit: results.limit,
          hasMore: results.hasMore,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /api/v1/wealths:
   *   post:
   *     summary: Create a new wealth
   *     tags: [Wealths]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [communityId, title, type, durationType, distributionType]
   *             properties:
   *               communityId:
   *                 type: string
   *                 format: uuid
   *               title:
   *                 type: string
   *               description:
   *                 type: string
   *               image:
   *                 type: string
   *               type:
   *                 type: string
   *                 enum: [object, service]
   *               durationType:
   *                 type: string
   *                 enum: [timebound, unlimited]
   *               endDate:
   *                 type: string
   *                 format: date-time
   *               distributionType:
   *                 type: string
   *                 enum: [request_based, unit_based]
   *               unitsAvailable:
   *                 type: integer
   *               maxUnitsPerUser:
   *                 type: integer
   *               automationEnabled:
   *                 type: boolean
   *     responses:
   *       201:
   *         description: Wealth created
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Wealth'
   *             example:
   *               id: "6f1b6c2e-1f0e-4c6b-8f1e-2b6a1c9b2d34"
   *               communityId: "123e4567-e89b-12d3-a456-426614174001"
   *               title: "Offer: Kids bike"
   *               durationType: "unlimited"
   *               distributionType: "request_based"
   *               status: "active"
   *       403:
   *         description: Forbidden (not a community member)
   */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const wealth = await wealthService.createWealth(req.body, userId);
      return ApiResponse.created(res, wealth, 'Wealth created successfully');
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /api/v1/wealths/{id}:
   *   get:
   *     summary: Get wealth by ID
   *     tags: [Wealths]
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
   *         description: Wealth details
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Wealth'
   *             example:
   *               id: "123e4567-e89b-12d3-a456-426614174000"
   *               communityId: "123e4567-e89b-12d3-a456-426614174001"
   *               title: "Spare lawn mower"
   *               status: "active"
   *       404:
   *         description: Wealth not found
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status: { type: string, example: "error" }
   *                 message: { type: string, example: "Wealth not found" }
   */
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const wealth = await wealthService.getWealth(req.params.id, userId);
      return ApiResponse.success(res, wealth);
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /api/v1/wealths/{id}:
   *   put:
   *     summary: Update a wealth (owner only)
   *     tags: [Wealths]
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
   *               image:
   *                 type: string
   *               endDate:
   *                 type: string
   *                 format: date-time
   *               unitsAvailable:
   *                 type: integer
   *               maxUnitsPerUser:
   *                 type: integer
   *               automationEnabled:
   *                 type: boolean
   *               status:
   *                 type: string
   *                 enum: [active, fulfilled, expired, cancelled]
   *     responses:
   *       200:
   *         description: Updated wealth
   *       403:
   *         description: Forbidden (not owner)
   */
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const wealth = await wealthService.updateWealth(req.params.id, req.body, userId);
      return ApiResponse.success(res, wealth, 'Wealth updated successfully');
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /api/v1/wealths/{id}/cancel:
   *   post:
   *     summary: Cancel a wealth (owner only)
   *     tags: [Wealths]
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
   *         description: Wealth cancelled
   */
  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const wealth = await wealthService.cancelWealth(req.params.id, userId);
      return ApiResponse.success(res, wealth, 'Wealth cancelled');
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /api/v1/wealths/{id}/fulfill:
   *   post:
   *     summary: Mark wealth as fulfilled (owner only)
   *     tags: [Wealths]
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
   *         description: Wealth fulfilled
   */
  async fulfill(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const wealth = await wealthService.fulfillWealth(req.params.id, userId);
      return ApiResponse.success(res, wealth, 'Wealth fulfilled');
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /api/v1/wealths/{id}/request:
   *   post:
   *     summary: Request a wealth (members/admins)
   *     tags: [Wealths]
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
   *               message:
   *                 type: string
   *               unitsRequested:
   *                 type: integer
   *     responses:
   *       201:
   *         description: Wealth request created
   */
  async requestWealth(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const request = await wealthService.requestWealth(
        req.params.id,
        userId,
        req.body?.message,
        req.body?.unitsRequested
      );
      return ApiResponse.created(res, request, 'Request created');
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /api/v1/wealths/{id}/requests:
   *   get:
   *     summary: List requests for a wealth
   *     tags: [Wealths]
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
   *         description: List of requests
   */
  async listRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const requests = await wealthService.listRequests(req.params.id, userId);
      return ApiResponse.success(res, requests);
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /api/v1/wealths/{id}/requests/{requestId}/accept:
   *   post:
   *     summary: Accept a request (owner only)
   *     tags: [Wealths]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema: { type: string, format: uuid }
   *         required: true
   *       - in: path
   *         name: requestId
   *         schema: { type: string, format: uuid }
   *         required: true
   *     responses:
   *       200:
   *         description: Request accepted
   */
  async acceptRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const result = await wealthService.acceptRequest(req.params.id, req.params.requestId, userId);
      return ApiResponse.success(res, result, 'Request accepted');
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /api/v1/wealths/{id}/requests/{requestId}/reject:
   *   post:
   *     summary: Reject a request (owner only)
   *     tags: [Wealths]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema: { type: string, format: uuid }
   *         required: true
   *       - in: path
   *         name: requestId
   *         schema: { type: string, format: uuid }
   *         required: true
   *     responses:
   *       200:
   *         description: Request rejected
   */
  async rejectRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const result = await wealthService.rejectRequest(req.params.id, req.params.requestId, userId);
      return ApiResponse.success(res, result, 'Request rejected');
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /api/v1/wealths/{id}/requests/{requestId}/cancel:
   *   post:
   *     summary: Cancel a request (requester or owner)
   *     tags: [Wealths]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema: { type: string, format: uuid }
   *         required: true
   *       - in: path
   *         name: requestId
   *         schema: { type: string, format: uuid }
   *         required: true
   *     responses:
   *       200:
   *         description: Request cancelled
   */
  async cancelRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const result = await wealthService.cancelRequest(req.params.id, req.params.requestId, userId);
      return ApiResponse.success(res, result, 'Request cancelled');
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /api/v1/wealths/{id}/requests/{requestId}/confirm:
   *   post:
   *     summary: Confirm receipt of wealth (requester only)
   *     description: The requester confirms they received the wealth. This decrements units and marks the request as fulfilled.
   *     tags: [Wealths]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema: { type: string, format: uuid }
   *         required: true
   *         description: Wealth ID
   *       - in: path
   *         name: requestId
   *         schema: { type: string, format: uuid }
   *         required: true
   *         description: Request ID
   *     responses:
   *       200:
   *         description: Request confirmed successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 wealth:
   *                   $ref: '#/components/schemas/Wealth'
   *                 request:
   *                   $ref: '#/components/schemas/WealthRequest'
   *       400:
   *         description: Invalid request status (only accepted requests can be confirmed)
   *       403:
   *         description: Forbidden (only requester can confirm)
   *       404:
   *         description: Wealth or request not found
   */
  async confirmRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const result = await wealthService.confirmRequest(req.params.id, req.params.requestId, userId);
      return ApiResponse.success(res, result, 'Request confirmed successfully');
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /api/v1/wealths/{id}/requests/{requestId}/fail:
   *   post:
   *     summary: Mark request as failed (requester only)
   *     description: The requester marks that they did not receive the wealth. Units are NOT decremented.
   *     tags: [Wealths]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema: { type: string, format: uuid }
   *         required: true
   *         description: Wealth ID
   *       - in: path
   *         name: requestId
   *         schema: { type: string, format: uuid }
   *         required: true
   *         description: Request ID
   *     responses:
   *       200:
   *         description: Request marked as failed
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/WealthRequest'
   *       400:
   *         description: Invalid request status (only accepted requests can be marked as failed)
   *       403:
   *         description: Forbidden (only requester can mark as failed)
   *       404:
   *         description: Wealth or request not found
   */
  async failRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const result = await wealthService.failRequest(req.params.id, req.params.requestId, userId);
      return ApiResponse.success(res, result, 'Request marked as failed');
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /api/v1/wealths/requests/me:
   *   get:
   *     summary: List my wealth requests across all communities
   *     description: Returns the authenticated user's wealth requests across all communities. Optionally filter by request statuses.
   *     tags: [Wealths]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: statuses
   *         schema:
   *           oneOf:
   *             - type: string
   *               enum: [pending, accepted, rejected, cancelled, fulfilled]
   *             - type: array
   *               items:
   *                 type: string
   *                 enum: [pending, accepted, rejected, cancelled, fulfilled]
   *         description: Optional status or comma-separated statuses to filter requests.
   *     responses:
   *       200:
   *         description: List of my requests
   */
  async listMyRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const statuses = (req as any).parsedStatuses as Array<'pending' | 'accepted' | 'rejected' | 'cancelled' | 'fulfilled'> | undefined;
      const requests = await wealthService.listRequestsByUser(userId, statuses);
      return ApiResponse.success(res, requests);
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /api/v1/wealth/requests/incoming:
   *   get:
   *     summary: List incoming wealth requests (requests to my wealth items)
   *     tags: [Wealths]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: statuses
   *         schema:
   *           type: array
   *           items:
   *             type: string
   *             enum: [pending, accepted, rejected, cancelled, fulfilled]
   *         description: Filter by request statuses
   *     responses:
   *       200:
   *         description: List of incoming requests
   */
  async listIncomingRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const statuses = (req as any).parsedStatuses as Array<'pending' | 'accepted' | 'rejected' | 'cancelled' | 'fulfilled'> | undefined;
      const requests = await wealthService.listIncomingRequests(userId, statuses);
      return ApiResponse.success(res, requests);
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /api/v1/wealths/{wealthId}/comments:
   *   post:
   *     summary: Create a comment on a wealth
   *     tags: [Wealths]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: wealthId
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
   *             required: [content]
   *             properties:
   *               content:
   *                 type: string
   *                 example: "This wealth looks great!"
   *               parentId:
   *                 type: string
   *                 format: uuid
   *                 description: ID of parent comment for replies
   *                 example: "123e4567-e89b-12d3-a456-426614174000"
   *     responses:
   *       201:
   *         description: Comment created successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   $ref: '#/components/schemas/WealthComment'
   *                 message:
   *                   type: string
   *                   example: "Comment created successfully"
   *       400:
   *         description: Validation error
   *       403:
   *         description: Forbidden (no permission to comment)
   *       404:
   *         description: Wealth not found
   */
  async createComment(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const { wealthId } = req.params;
      const comment = await wealthCommentService.createComment(
        { wealthId, ...req.body },
        userId
      );
      return ApiResponse.created(res, comment, 'Comment created successfully');
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /api/v1/wealths/{wealthId}/comments:
   *   get:
   *     summary: List comments for a wealth
   *     tags: [Wealths]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: wealthId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           default: 50
   *       - in: query
   *         name: offset
   *         schema:
   *           type: integer
   *           minimum: 0
   *           default: 0
   *     responses:
   *       200:
   *         description: List of comments
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/WealthComment'
   *       403:
   *         description: Forbidden (no permission to view comments)
   *       404:
   *         description: Wealth not found
   */
  async listComments(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const { wealthId } = req.params;
      const { limit, offset } = req.query;
      const comments = await wealthCommentService.getCommentsByWealthId(
        wealthId,
        userId,
        Number(limit) || 50,
        Number(offset) || 0
      );
      return ApiResponse.success(res, comments);
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /api/v1/wealths/{wealthId}/comments/{commentId}:
   *   put:
   *     summary: Update a comment (author only)
   *     tags: [Wealths]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: wealthId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *       - in: path
   *         name: commentId
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
   *               content:
   *                 type: string
   *                 example: "Updated comment content"
   *     responses:
   *       200:
   *         description: Comment updated
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/WealthComment'
   *       403:
   *         description: Forbidden (not author)
   *       404:
   *         description: Comment not found
   */
  async updateComment(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const { wealthId, commentId } = req.params;
      const comment = await wealthCommentService.updateComment(commentId, req.body, userId);
      return ApiResponse.success(res, comment, 'Comment updated successfully');
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /api/v1/wealths/{wealthId}/comments/{commentId}:
   *   delete:
   *     summary: Delete a comment (author or wealth owner only)
   *     tags: [Wealths]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: wealthId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *       - in: path
   *         name: commentId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: Comment deleted
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "Comment deleted successfully"
   *       403:
   *         description: Forbidden (not authorized)
   *       404:
   *         description: Comment not found
   */
  async deleteComment(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const { wealthId, commentId } = req.params;
      await wealthCommentService.deleteComment(commentId, userId);
      return ApiResponse.success(res, null, 'Comment deleted successfully');
    } catch (err) {
      next(err);
    }
  }
}

export const wealthController = new WealthController();
