export type CommunityEventType =
  | 'need_created'
  | 'need_updated'
  | 'need_fulfilled'
  | 'need_deleted'
  | 'wealth_created'
  | 'wealth_updated'
  | 'wealth_fulfilled'
  | 'wealth_deleted'
  | 'poll_created'
  | 'poll_completed'
  | 'poll_deleted'
  | 'forum_thread_created'
  | 'forum_post_created'
  | 'forum_thread_deleted'
  | 'forum_post_deleted'
  | 'council_created'
  | 'council_updated'
  | 'council_deleted'
  | 'trust_awarded'
  | 'trust_removed';

export type CommunityEntityType =
  | 'need'
  | 'wealth'
  | 'poll'
  | 'forum_thread'
  | 'forum_post'
  | 'council'
  | 'trust_award';

export interface CommunityEvent {
  id: string;
  communityId: string;
  userId: string;
  eventType: CommunityEventType;
  entityType: CommunityEntityType;
  entityId: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface ListEventsParams {
  eventType?: CommunityEventType;
  limit?: number;
  offset?: number;
}
