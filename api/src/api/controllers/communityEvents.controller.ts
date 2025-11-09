import type { Response, NextFunction } from 'express';
import { communityEventsService } from '@services/communityEvents.service';
import { ApiResponse } from '@utils/response';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

/**
 * @swagger
 * components:
 *   schemas:
 *     CommunityEvent:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         communityId:
 *           type: string
 *           format: uuid
 *         userId:
 *           type: string
 *         eventType:
 *           type: string
 *           enum: [need_created, need_updated, need_fulfilled, need_deleted, wealth_created, wealth_updated, wealth_fulfilled, wealth_deleted, poll_created, poll_completed, poll_deleted, forum_thread_created, forum_post_created, forum_thread_deleted, forum_post_deleted, council_created, council_updated, council_deleted, trust_awarded, trust_removed]
 *         entityType:
 *           type: string
 *           enum: [need, wealth, poll, forum_thread, forum_post, council, trust_award]
 *         entityId:
 *           type: string
 *           format: uuid
 *         metadata:
 *           type: object
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *       example:
 *         id: "123e4567-e89b-12d3-a456-426614174000"
 *         communityId: "123e4567-e89b-12d3-a456-426614174001"
 *         userId: "user123"
 *         eventType: "need_created"
 *         entityType: "need"
 *         entityId: "123e4567-e89b-12d3-a456-426614174002"
 *         metadata: { itemName: "Carrots", priority: "need", unitsNeeded: 5 }
 *         createdAt: "2024-01-01T00:00:00Z"
 */
export class CommunityEventsController {
  /**
   * @swagger
   * /api/v1/communities/{communityId}/events:
   *   get:
   *     summary: Get community events
   *     tags: [Community Events]
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
   *         name: eventType
   *         schema:
   *           type: string
   *           enum: [need_created, need_updated, need_fulfilled, need_deleted, wealth_created, wealth_updated, wealth_fulfilled, wealth_deleted, poll_created, poll_completed, poll_deleted]
   *         description: Filter by event type
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 50
   *       - in: query
   *         name: offset
   *         schema:
   *           type: integer
   *           default: 0
   *     responses:
   *       200:
   *         description: List of community events
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/CommunityEvent'
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden - not a community member
   *       404:
   *         description: Community not found
   */
  async listEvents(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return ApiResponse.error(res, 'Unauthorized', 401);
      }

      const { communityId } = req.params;
      const { eventType, limit, offset } = req.query;

      const events = await communityEventsService.getCommunityEvents(communityId, userId, {
        eventType: eventType as any,
        limit: limit ? parseInt(limit as string, 10) : undefined,
        offset: offset ? parseInt(offset as string, 10) : undefined,
      });

      return ApiResponse.success(res, events);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/events/user/{targetUserId}:
   *   get:
   *     summary: Get events for a specific user in a community
   *     tags: [Community Events]
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
   *         name: targetUserId
   *         required: true
   *         schema:
   *           type: string
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 50
   *       - in: query
   *         name: offset
   *         schema:
   *           type: integer
   *           default: 0
   *     responses:
   *       200:
   *         description: List of user events
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/CommunityEvent'
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden - not a community member
   *       404:
   *         description: Community not found
   */
  async listUserEvents(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return ApiResponse.error(res, 'Unauthorized', 401);
      }

      const { communityId, targetUserId } = req.params;
      const { limit, offset } = req.query;

      const events = await communityEventsService.getUserEvents(
        communityId,
        userId,
        targetUserId,
        limit ? parseInt(limit as string, 10) : undefined,
        offset ? parseInt(offset as string, 10) : undefined
      );

      return ApiResponse.success(res, events);
    } catch (error) {
      next(error);
    }
  }
}

export const communityEventsController = new CommunityEventsController();
