import { notificationRepository, NotificationRecord } from '@repositories/notification.repository';
import { AppError } from '@utils/errors';
import type { NotificationCreate, NotificationListOptions } from '@/types/notification.types';

export class NotificationService {
  async create(data: NotificationCreate): Promise<NotificationRecord> {
    return await notificationRepository.create(data);
  }

  async listForUser(
    userId: string,
    options?: NotificationListOptions
  ): Promise<{
    notifications: NotificationRecord[];
    total: number;
    unreadCount: number;
  }> {
    const notifications = await notificationRepository.listByUserId(userId, options);
    const total = await notificationRepository.getTotalCount(
      userId,
      options?.communityId,
      options?.unreadOnly
    );
    const unreadCount = await notificationRepository.getUnreadCount(userId, options?.communityId);

    return {
      notifications,
      total,
      unreadCount,
    };
  }

  async getUnreadCount(userId: string, communityId?: string): Promise<number> {
    return await notificationRepository.getUnreadCount(userId, communityId);
  }

  async markAsRead(notificationId: string, userId: string): Promise<void> {
    const notification = await notificationRepository.findById(notificationId);
    if (!notification) {
      throw new AppError('Notification not found', 404);
    }

    if (notification.userId !== userId) {
      throw new AppError('Forbidden: you cannot mark this notification as read', 403);
    }

    await notificationRepository.markAsRead(notificationId);
  }

  async markAllAsRead(userId: string, communityId?: string): Promise<number> {
    return await notificationRepository.markAllAsRead(userId, communityId);
  }

  async delete(notificationId: string, userId: string): Promise<void> {
    const notification = await notificationRepository.findById(notificationId);
    if (!notification) {
      throw new AppError('Notification not found', 404);
    }

    if (notification.userId !== userId) {
      throw new AppError('Forbidden: you cannot delete this notification', 403);
    }

    await notificationRepository.delete(notificationId);
  }

  async hasUnreadForResource(
    userId: string,
    resourceType: string,
    resourceId: string
  ): Promise<boolean> {
    const notifications = await notificationRepository.getByResource(
      resourceType,
      resourceId,
      userId
    );
    return notifications.some((n) => !n.isRead);
  }

  async markResourceNotificationsAsRead(
    userId: string,
    resourceType: string,
    resourceId: string
  ): Promise<number> {
    return await notificationRepository.markResourceNotificationsAsRead(
      resourceType,
      resourceId,
      userId
    );
  }
}

export const notificationService = new NotificationService();
