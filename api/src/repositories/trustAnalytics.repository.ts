import { db as realDb } from '../db/index';
import { eq, and, gte, lte, asc, sql } from 'drizzle-orm';
import { trustHistory } from '../db/schema/trustHistory.schema';
import { communities } from '../db/schema/communities.schema';
import { appUsers } from '../db/schema/app_users.schema';
import { trustAwards } from '../db/schema/trustAward.schema';
import { adminTrustGrants } from '../db/schema/adminTrustGrant.schema';

export interface TrustTimelineEvent {
  timestamp: Date;
  type: 'award' | 'remove' | 'admin_grant';
  fromUserId: string | null;
  fromUserDisplayName: string | null;
  amount: number;
  cumulativeTrust: number;
  communityId: string;
  communityName: string;
}

export interface TrustSummary {
  totalTrustPoints: number;
  totalAwardsReceived: number;
  totalAwardsRemoved: number;
  trustByCommunity: Array<{
    communityId: string;
    communityName: string;
    trustPoints: number;
  }>;
}

export class TrustAnalyticsRepository {
  private db: any;

  constructor(db: any) {
    this.db = db;
  }
  /**
   * Get trust timeline for a user
   * Returns all trust events (awards, removals, admin grants) with cumulative trust calculation
   */
  async getTrustTimeline(
    userId: string,
    options?: {
      communityId?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<TrustTimelineEvent[]> {
    // Build WHERE conditions
    const conditions = [eq(trustHistory.toUserId, userId)];

    if (options?.communityId) {
      conditions.push(eq(trustHistory.communityId, options.communityId));
    }

    if (options?.startDate) {
      conditions.push(gte(trustHistory.createdAt, options.startDate));
    }

    if (options?.endDate) {
      conditions.push(lte(trustHistory.createdAt, options.endDate));
    }

    // Query trust history with joins to get community names and user display names
    const events = await this.db
      .select({
        id: trustHistory.id,
        timestamp: trustHistory.createdAt,
        type: trustHistory.action,
        fromUserId: trustHistory.fromUserId,
        fromUserDisplayName: appUsers.displayName,
        fromUserUsername: appUsers.username,
        amount: trustHistory.pointsDelta,
        communityId: trustHistory.communityId,
        communityName: communities.name,
      })
      .from(trustHistory)
      .leftJoin(communities, eq(trustHistory.communityId, communities.id))
      .leftJoin(appUsers, eq(trustHistory.fromUserId, appUsers.id))
      .where(and(...conditions))
      .orderBy(asc(trustHistory.createdAt));

    // Calculate cumulative trust over time
    let cumulative = 0;
    const timeline: TrustTimelineEvent[] = events.map(
      (event: {
        id: string;
        timestamp: Date;
        type: 'award' | 'remove' | 'admin_grant';
        fromUserId: string | null;
        fromUserDisplayName: string | null;
        fromUserUsername: string | null;
        amount: number;
        communityId: string;
        communityName: string | null;
      }) => {
        cumulative += event.amount;
        return {
          timestamp: event.timestamp,
          type: event.type as 'award' | 'remove' | 'admin_grant',
          fromUserId: event.fromUserId,
          fromUserDisplayName: event.fromUserDisplayName || event.fromUserUsername || null,
          amount: event.amount,
          cumulativeTrust: cumulative,
          communityId: event.communityId,
          communityName: event.communityName || 'Unknown Community',
        };
      }
    );

    // Return in descending order (newest first) for API response
    return timeline.reverse();
  }

  /**
   * Get trust summary for a user
   * Returns aggregate statistics about user's trust across communities
   */
  async getTrustSummary(
    userId: string,
    options?: {
      communityId?: string;
    }
  ): Promise<TrustSummary> {
    // Build WHERE conditions for trust history
    const conditions = [eq(trustHistory.toUserId, userId)];

    if (options?.communityId) {
      conditions.push(eq(trustHistory.communityId, options.communityId));
    }

    // Get total points and count of awards/removals
    const [stats] = await this.db
      .select({
        totalPoints: sql<number>`COALESCE(SUM(${trustHistory.pointsDelta}), 0)`,
        totalAwards: sql<number>`COALESCE(COUNT(*) FILTER (WHERE ${trustHistory.action} = 'award'), 0)`,
        totalRemovals: sql<number>`COALESCE(COUNT(*) FILTER (WHERE ${trustHistory.action} = 'remove'), 0)`,
      })
      .from(trustHistory)
      .where(and(...conditions));

    // Get trust breakdown by community
    const communityConditions = options?.communityId
      ? [eq(trustHistory.toUserId, userId), eq(trustHistory.communityId, options.communityId)]
      : [eq(trustHistory.toUserId, userId)];

    const byCommunity = await this.db
      .select({
        communityId: trustHistory.communityId,
        communityName: communities.name,
        trustPoints: sql<number>`COALESCE(SUM(${trustHistory.pointsDelta}), 0)`,
      })
      .from(trustHistory)
      .leftJoin(communities, eq(trustHistory.communityId, communities.id))
      .where(and(...communityConditions))
      .groupBy(trustHistory.communityId, communities.name);

    return {
      totalTrustPoints: Number(stats.totalPoints),
      totalAwardsReceived: Number(stats.totalAwards),
      totalAwardsRemoved: Number(stats.totalRemovals),
      trustByCommunity: byCommunity.map(
        (item: { communityId: string; communityName: string | null; trustPoints: number }) => ({
          communityId: item.communityId,
          communityName: item.communityName || 'Unknown Community',
          trustPoints: Number(item.trustPoints),
        })
      ),
    };
  }

  /**
   * Get current trust score for a user in a specific community
   * Calculates from trust_awards (peer awards) + admin_trust_grants
   */
  async getCurrentTrustScore(userId: string, communityId: string): Promise<number> {
    // Count peer awards
    const [peerCount] = await this.db
      .select({
        count: sql<number>`COUNT(*)`,
      })
      .from(trustAwards)
      .where(and(eq(trustAwards.communityId, communityId), eq(trustAwards.toUserId, userId)));

    // Get admin grant (if exists)
    const [adminGrant] = await this.db
      .select({
        amount: adminTrustGrants.trustAmount,
      })
      .from(adminTrustGrants)
      .where(
        and(eq(adminTrustGrants.communityId, communityId), eq(adminTrustGrants.toUserId, userId))
      );

    const peerPoints = Number(peerCount.count) || 0;
    const adminPoints = adminGrant?.amount || 0;

    return peerPoints + adminPoints;
  }
}

// Default instance for production code paths
export const trustAnalyticsRepository = new TrustAnalyticsRepository(realDb);
