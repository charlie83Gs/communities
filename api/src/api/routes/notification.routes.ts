import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware';
import { notificationController } from '@api/controllers/notification.controller';
import {
  validateNotificationListQuery,
  validateNotificationIdParam,
  validateCommunityIdQuery,
} from '@api/validators/notification.validator';

const router = Router();

// All notification endpoints require authentication
router.use(verifyToken);

// List notifications
router.get('/', validateNotificationListQuery, notificationController.list);

// Get unread count
router.get('/unread-count', validateCommunityIdQuery, notificationController.getUnreadCount);

// Mark all as read
router.post('/read-all', validateCommunityIdQuery, notificationController.markAllAsRead);

// Mark specific notification as read
router.post('/:id/read', validateNotificationIdParam, notificationController.markAsRead);

// Delete notification
router.delete('/:id', validateNotificationIdParam, notificationController.delete);

export default router;
