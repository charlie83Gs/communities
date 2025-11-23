import type { Request, Response, NextFunction } from 'express';
import { notificationService } from '@services/notification.service';
import { ApiResponse } from '@utils/response';

/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: User notification endpoints
 */
export class NotificationController {
  /**
   * @swagger
   * /api/v1/notifications:
   *   get:
   *     summary: List notifications for the current user
   *     tags: [Notifications]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: community_id
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Filter by community
   *       - in: query
   *         name: unread_only
   *         schema:
   *           type: boolean
   *         description: Only return unread notifications
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
   *         description: List of notifications
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 notifications:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: string
   *                         format: uuid
   *                       userId:
   *                         type: string
   *                       communityId:
   *                         type: string
   *                         format: uuid
   *                       type:
   *                         type: string
   *                       title:
   *                         type: string
   *                       message:
   *                         type: string
   *                       resourceType:
   *                         type: string
   *                       resourceId:
   *                         type: string
   *                         format: uuid
   *                       actorId:
   *                         type: string
   *                       isRead:
   *                         type: boolean
   *                       createdAt:
   *                         type: string
   *                         format: date-time
   *                       readAt:
   *                         type: string
   *                         format: date-time
   *                 total:
   *                   type: integer
   *                 unreadCount:
   *                   type: integer
   */
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const { community_id, unread_only, limit, offset } = req.query;

      const result = await notificationService.listForUser(userId, {
        communityId: community_id as string | undefined,
        unreadOnly: unread_only === 'true',
        limit: limit ? Number(limit) : undefined,
        offset: offset ? Number(offset) : undefined,
      });

      return ApiResponse.success(res, result);
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /api/v1/notifications/unread-count:
   *   get:
   *     summary: Get unread notification count
   *     tags: [Notifications]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: community_id
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Filter by community
   *     responses:
   *       200:
   *         description: Unread count
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 count:
   *                   type: integer
   */
  async getUnreadCount(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const { community_id } = req.query;

      const count = await notificationService.getUnreadCount(
        userId,
        community_id as string | undefined
      );

      return ApiResponse.success(res, { count });
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /api/v1/notifications/{id}/read:
   *   post:
   *     summary: Mark a notification as read
   *     tags: [Notifications]
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
   *         description: Notification marked as read
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Notification not found
   */
  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const { id } = req.params;

      await notificationService.markAsRead(id, userId);
      return ApiResponse.success(res, { success: true });
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /api/v1/notifications/read-all:
   *   post:
   *     summary: Mark all notifications as read
   *     tags: [Notifications]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: community_id
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Only mark notifications from this community
   *     responses:
   *       200:
   *         description: Notifications marked as read
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 count:
   *                   type: integer
   *                   description: Number of notifications marked as read
   */
  async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const { community_id } = req.query;

      const count = await notificationService.markAllAsRead(
        userId,
        community_id as string | undefined
      );

      return ApiResponse.success(res, { success: true, count });
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /api/v1/notifications/{id}:
   *   delete:
   *     summary: Delete a notification
   *     tags: [Notifications]
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
   *         description: Notification deleted
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Notification not found
   */
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const { id } = req.params;

      await notificationService.delete(id, userId);
      return ApiResponse.success(res, { success: true });
    } catch (err) {
      next(err);
    }
  }
}

export const notificationController = new NotificationController();
