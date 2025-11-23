export type NotificationType =
  | 'wealth_request_message'
  | 'wealth_request_status'
  | 'wealth_request_new'
  | 'pool_activity'
  | 'council_activity'
  | 'dispute_update'
  | 'trust_change'
  | 'trust_decay_warning'
  | 'poll_activity'
  | 'peer_recognition';

export interface Notification {
  id: string;
  userId: string;
  communityId: string;
  type: NotificationType;
  title: string;
  message?: string | null;
  resourceType: string;
  resourceId: string;
  actorId?: string | null;
  isRead: boolean;
  createdAt: Date;
  readAt?: Date | null;
}

export interface NotificationCreate {
  userId: string;
  communityId: string;
  type: NotificationType;
  title: string;
  message?: string | null;
  resourceType: string;
  resourceId: string;
  actorId?: string | null;
}

export interface NotificationListOptions {
  communityId?: string;
  unreadOnly?: boolean;
  limit?: number;
  offset?: number;
}
