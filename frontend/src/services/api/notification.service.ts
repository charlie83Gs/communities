import { apiClient } from './client';
import type {
  Notification,
  NotificationListResponse,
  NotificationListParams,
} from '@/types/notification.types';

class NotificationService {
  private readonly basePath = '/api/v1/notifications';

  /** List notifications with optional filters */
  async list(params?: NotificationListParams): Promise<NotificationListResponse> {
    const search = new URLSearchParams();
    if (params?.communityId) search.set('community_id', params.communityId);
    if (params?.unreadOnly) search.set('unread_only', 'true');
    if (params?.limit != null) search.set('limit', String(params.limit));
    if (params?.offset != null) search.set('offset', String(params.offset));
    const qs = search.toString();
    return apiClient.get(`${this.basePath}${qs ? `?${qs}` : ''}`);
  }

  /** Get unread notification count */
  async getUnreadCount(communityId?: string): Promise<{ count: number }> {
    const search = new URLSearchParams();
    if (communityId) search.set('community_id', communityId);
    const qs = search.toString();
    return apiClient.get(`${this.basePath}/unread-count${qs ? `?${qs}` : ''}`);
  }

  /** Mark a notification as read */
  async markAsRead(notificationId: string): Promise<void> {
    return apiClient.post(`${this.basePath}/${notificationId}/read`, {});
  }

  /** Mark all notifications as read */
  async markAllAsRead(communityId?: string): Promise<void> {
    const search = new URLSearchParams();
    if (communityId) search.set('community_id', communityId);
    const qs = search.toString();
    return apiClient.post(`${this.basePath}/read-all${qs ? `?${qs}` : ''}`, {});
  }
}

export const notificationService = new NotificationService();
