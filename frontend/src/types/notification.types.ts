/**
 * Notification types for the Share application
 */

export type NotificationType =
  | 'wealth_request_message'
  | 'wealth_request_status'
  | 'wealth_request_new'
  | 'pool_activity'
  | 'council_activity'
  | 'dispute_update'
  | 'trust_change'
  | 'poll_activity';

export interface Notification {
  id: string;
  userId: string;
  communityId: string;
  type: NotificationType;
  title: string;
  message?: string;
  resourceType: string;
  resourceId: string;
  actorId?: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
}

export interface NotificationListResponse {
  notifications: Notification[];
  total: number;
  unreadCount: number;
}

export interface NotificationListParams {
  communityId?: string;
  unreadOnly?: boolean;
  limit?: number;
  offset?: number;
}
