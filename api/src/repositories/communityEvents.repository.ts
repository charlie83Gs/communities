import { db as realDb } from '../db/index';
import { and, desc, eq } from 'drizzle-orm';
import { communityEvents } from '../db/schema/communityEvents.schema';

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

type DbClient = typeof realDb;

/**
 * CommunityEventsRepository
 * - Records community activity events
 * - Lists events by community for activity feeds and analytics
 */
export class CommunityEventsRepository {
  private db: DbClient;

  constructor(db: DbClient) {
    this.db = db;
  }

  /**
   * Create a new community event
   */
  async create(params: {
    communityId: string;
    userId: string;
    eventType: CommunityEventType;
    entityType: CommunityEntityType;
    entityId: string;
    metadata?: Record<string, unknown>;
  }) {
    const [row] = await this.db
      .insert(communityEvents)
      .values({
        communityId: params.communityId,
        userId: params.userId,
        eventType: params.eventType,
        entityType: params.entityType,
        entityId: params.entityId,
        metadata: params.metadata ?? null,
      })
      .returning();

    return row;
  }

  /**
   * List events for a specific community with pagination
   */
  async listByCommunity(communityId: string, limit = 50, offset = 0) {
    return this.db
      .select()
      .from(communityEvents)
      .where(eq(communityEvents.communityId, communityId))
      .orderBy(desc(communityEvents.createdAt))
      .limit(limit)
      .offset(offset);
  }

  /**
   * List events for a specific community filtered by event type
   */
  async listByType(communityId: string, eventType: CommunityEventType, limit = 50, offset = 0) {
    return this.db
      .select()
      .from(communityEvents)
      .where(
        and(eq(communityEvents.communityId, communityId), eq(communityEvents.eventType, eventType))
      )
      .orderBy(desc(communityEvents.createdAt))
      .limit(limit)
      .offset(offset);
  }

  /**
   * List events for a specific user in a community
   */
  async listByUser(communityId: string, userId: string, limit = 50, offset = 0) {
    return this.db
      .select()
      .from(communityEvents)
      .where(and(eq(communityEvents.communityId, communityId), eq(communityEvents.userId, userId)))
      .orderBy(desc(communityEvents.createdAt))
      .limit(limit)
      .offset(offset);
  }

  /**
   * Get a single event by ID
   */
  async findById(id: string) {
    const [row] = await this.db
      .select()
      .from(communityEvents)
      .where(eq(communityEvents.id, id))
      .limit(1);

    return row || null;
  }
}

export const communityEventsRepository = new CommunityEventsRepository(realDb);
