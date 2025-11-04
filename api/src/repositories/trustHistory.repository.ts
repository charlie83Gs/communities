import { db } from '../db/index';
import { and, eq, desc } from 'drizzle-orm';
import { trustHistory } from '../db/schema/trustHistory.schema';

export type TrustHistoryAction = 'award' | 'remove' | 'admin_grant';

export interface LogActionParams {
  communityId: string;
  fromUserId?: string | null;
  toUserId: string;
  action: TrustHistoryAction;
  pointsDelta: number;
}

export class TrustHistoryRepository {
  /**
   * Log a trust action to history
   */
  async logAction(params: LogActionParams) {
    const [record] = await db
      .insert(trustHistory)
      .values({
        communityId: params.communityId,
        fromUserId: params.fromUserId ?? null,
        toUserId: params.toUserId,
        action: params.action,
        pointsDelta: params.pointsDelta,
      })
      .returning();
    return record;
  }

  /**
   * Get history for a specific user in a community
   */
  async getHistoryForUser(communityId: string, toUserId: string, limit = 50, offset = 0) {
    return db
      .select()
      .from(trustHistory)
      .where(and(eq(trustHistory.communityId, communityId), eq(trustHistory.toUserId, toUserId)))
      .orderBy(desc(trustHistory.createdAt))
      .limit(limit)
      .offset(offset);
  }

  /**
   * Get history for a community
   */
  async getHistoryForCommunity(communityId: string, limit = 50, offset = 0) {
    return db
      .select()
      .from(trustHistory)
      .where(eq(trustHistory.communityId, communityId))
      .orderBy(desc(trustHistory.createdAt))
      .limit(limit)
      .offset(offset);
  }

  /**
   * Get all history for a user across all communities
   */
  async getHistoryForUserAllCommunities(toUserId: string, limit = 50, offset = 0) {
    return db
      .select()
      .from(trustHistory)
      .where(eq(trustHistory.toUserId, toUserId))
      .orderBy(desc(trustHistory.createdAt))
      .limit(limit)
      .offset(offset);
  }
}

export const trustHistoryRepository = new TrustHistoryRepository();
