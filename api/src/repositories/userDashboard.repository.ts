import { db as realDb } from '@db/index';
import { communities } from '@db/schema/communities.schema';
import { wealth, wealthRequests } from '@db/schema/wealth.schema';
import { pools } from '@db/schema/pools.schema';
import { communityUserInvites } from '@db/schema/communityUserInvites.schema';
import { appUsers } from '@db/schema/app_users.schema';
import { trustViews } from '@db/schema/trustView.schema';
import { notifications } from '@db/schema/notifications.schema';
import { and, eq, inArray, or, desc, sql, isNull, isNotNull, max } from 'drizzle-orm';
import { communityMemberRepository as realCommunityMemberRepository } from '@/repositories/communityMember.repository';
import type {
  CommunitySummaryItem,
  IncomingRequestItem,
  AcceptedOutgoingItem,
  PoolDistributionItem,
  PendingInviteItem,
  DashboardNotification,
} from '@/types/user.types';

export class UserDashboardRepository {
  private db: any;
  private communityMemberRepository: typeof realCommunityMemberRepository;

  constructor(
    db: any,
    communityMemberRepository: typeof realCommunityMemberRepository = realCommunityMemberRepository
  ) {
    this.db = db;
    this.communityMemberRepository = communityMemberRepository;
  }

  /**
   * Get user's communities with stats (member count, pending requests, last activity)
   */
  async getCommunitiesWithStats(userId: string): Promise<CommunitySummaryItem[]> {
    // Get community IDs where user has access (via OpenFGA)
    const memberships = await this.communityMemberRepository.findByUser(userId);
    const communityIds = memberships.map((m) => m.resourceId);
    if (communityIds.length === 0) return [];

    // Get community basic info
    const communityRows = await this.db
      .select({
        id: communities.id,
        name: communities.name,
        description: communities.description,
      })
      .from(communities)
      .where(and(inArray(communities.id, communityIds), isNull(communities.deletedAt)));

    // Get member counts for each community (via OpenFGA)
    const memberCountMap = new Map<string, number>();
    await Promise.all(
      communityIds.map(async (communityId) => {
        const members = await this.communityMemberRepository.findByCommunity(communityId);
        memberCountMap.set(communityId, members.length);
      })
    );

    // Get trust scores for user in each community
    const trustRows = await this.db
      .select({
        communityId: trustViews.communityId,
        points: trustViews.points,
      })
      .from(trustViews)
      .where(and(inArray(trustViews.communityId, communityIds), eq(trustViews.userId, userId)));

    const trustScoreMap = new Map<string, number>();
    for (const row of trustRows) {
      trustScoreMap.set(row.communityId, row.points);
    }

    // Get pending incoming requests count (requests TO user's wealth)
    const pendingIncomingRows = await this.db
      .select({
        communityId: wealth.communityId,
        count: sql<number>`cast(count(*) as int)`,
      })
      .from(wealthRequests)
      .innerJoin(wealth, eq(wealthRequests.wealthId, wealth.id))
      .where(
        and(
          eq(wealth.createdBy, userId),
          eq(wealthRequests.status, 'pending'),
          inArray(wealth.communityId, communityIds),
          isNull(wealth.sourcePoolId) // Exclude pool distributions
        )
      )
      .groupBy(wealth.communityId);

    const pendingIncomingMap = new Map<string, number>();
    for (const row of pendingIncomingRows) {
      pendingIncomingMap.set(row.communityId, row.count);
    }

    // Get pending/accepted outgoing requests count (user's requests)
    const pendingOutgoingRows = await this.db
      .select({
        communityId: wealth.communityId,
        count: sql<number>`cast(count(*) as int)`,
      })
      .from(wealthRequests)
      .innerJoin(wealth, eq(wealthRequests.wealthId, wealth.id))
      .where(
        and(
          eq(wealthRequests.requesterId, userId),
          or(eq(wealthRequests.status, 'pending'), eq(wealthRequests.status, 'accepted')),
          inArray(wealth.communityId, communityIds),
          isNull(wealth.sourcePoolId) // Exclude pool distributions
        )
      )
      .groupBy(wealth.communityId);

    const pendingOutgoingMap = new Map<string, number>();
    for (const row of pendingOutgoingRows) {
      pendingOutgoingMap.set(row.communityId, row.count);
    }

    // Get last activity (most recent request activity involving user)
    const lastActivityRows = await this.db
      .select({
        communityId: wealth.communityId,
        lastActivity: max(wealthRequests.updatedAt),
      })
      .from(wealthRequests)
      .innerJoin(wealth, eq(wealthRequests.wealthId, wealth.id))
      .where(
        and(
          or(eq(wealth.createdBy, userId), eq(wealthRequests.requesterId, userId)),
          inArray(wealth.communityId, communityIds)
        )
      )
      .groupBy(wealth.communityId);

    const lastActivityMap = new Map<string, Date>();
    for (const row of lastActivityRows) {
      if (row.lastActivity) {
        lastActivityMap.set(row.communityId, row.lastActivity);
      }
    }

    // Combine all data
    const result: CommunitySummaryItem[] = communityRows.map((c: any) => ({
      id: c.id,
      name: c.name,
      description: c.description || undefined,
      userTrustScore: trustScoreMap.get(c.id) || 0,
      memberCount: memberCountMap.get(c.id) || 0,
      pendingIncoming: pendingIncomingMap.get(c.id) || 0,
      pendingOutgoing: pendingOutgoingMap.get(c.id) || 0,
      lastActivityAt: lastActivityMap.get(c.id)?.toISOString(),
    }));

    // Sort: has pending actions DESC, lastActivityAt DESC, name ASC
    result.sort((a, b) => {
      const aHasPending = a.pendingIncoming > 0 || a.pendingOutgoing > 0 ? 1 : 0;
      const bHasPending = b.pendingIncoming > 0 || b.pendingOutgoing > 0 ? 1 : 0;

      if (bHasPending !== aHasPending) {
        return bHasPending - aHasPending;
      }

      // Then by last activity (most recent first)
      const aTime = a.lastActivityAt ? new Date(a.lastActivityAt).getTime() : 0;
      const bTime = b.lastActivityAt ? new Date(b.lastActivityAt).getTime() : 0;
      if (bTime !== aTime) {
        return bTime - aTime;
      }

      // Finally by name
      return a.name.localeCompare(b.name);
    });

    return result;
  }

  /**
   * Get incoming pending requests (requests TO user's wealth)
   */
  async getIncomingRequests(userId: string): Promise<IncomingRequestItem[]> {
    const rows = await this.db
      .select({
        id: wealthRequests.id,
        wealthId: wealthRequests.wealthId,
        wealthTitle: wealth.title,
        communityId: wealth.communityId,
        communityName: communities.name,
        requesterDisplayName: appUsers.displayName,
        requesterUsername: appUsers.username,
        unitsRequested: wealthRequests.unitsRequested,
        createdAt: wealthRequests.createdAt,
      })
      .from(wealthRequests)
      .innerJoin(wealth, eq(wealthRequests.wealthId, wealth.id))
      .innerJoin(communities, eq(wealth.communityId, communities.id))
      .innerJoin(appUsers, eq(wealthRequests.requesterId, appUsers.id))
      .where(
        and(
          eq(wealth.createdBy, userId),
          eq(wealthRequests.status, 'pending'),
          isNull(wealth.sourcePoolId) // Exclude pool distributions
        )
      )
      .orderBy(desc(wealthRequests.createdAt));

    return rows.map((r: any) => ({
      id: r.id,
      wealthId: r.wealthId,
      wealthTitle: r.wealthTitle,
      communityId: r.communityId,
      communityName: r.communityName,
      requesterDisplayName: r.requesterDisplayName || r.requesterUsername || 'Unknown',
      unitsRequested: r.unitsRequested || undefined,
      createdAt: r.createdAt?.toISOString() || new Date().toISOString(),
    }));
  }

  /**
   * Get accepted outgoing requests (user's requests that have been accepted)
   */
  async getAcceptedOutgoingRequests(userId: string): Promise<AcceptedOutgoingItem[]> {
    const rows = await this.db
      .select({
        id: wealthRequests.id,
        wealthId: wealthRequests.wealthId,
        wealthTitle: wealth.title,
        communityId: wealth.communityId,
        communityName: communities.name,
        unitsRequested: wealthRequests.unitsRequested,
        createdAt: wealthRequests.createdAt,
      })
      .from(wealthRequests)
      .innerJoin(wealth, eq(wealthRequests.wealthId, wealth.id))
      .innerJoin(communities, eq(wealth.communityId, communities.id))
      .where(
        and(
          eq(wealthRequests.requesterId, userId),
          eq(wealthRequests.status, 'accepted'),
          isNull(wealth.sourcePoolId) // Exclude pool distributions
        )
      )
      .orderBy(desc(wealthRequests.createdAt));

    return rows.map((r: any) => ({
      id: r.id,
      wealthId: r.wealthId,
      wealthTitle: r.wealthTitle,
      communityId: r.communityId,
      communityName: r.communityName,
      unitsRequested: r.unitsRequested || undefined,
      createdAt: r.createdAt?.toISOString() || new Date().toISOString(),
    }));
  }

  /**
   * Get pool distribution requests for user
   */
  async getPoolDistributionRequests(userId: string): Promise<PoolDistributionItem[]> {
    const rows = await this.db
      .select({
        id: wealthRequests.id,
        wealthId: wealthRequests.wealthId,
        wealthTitle: wealth.title,
        poolId: wealth.sourcePoolId,
        poolName: pools.name,
        communityId: wealth.communityId,
        communityName: communities.name,
        unitsRequested: wealthRequests.unitsRequested,
        createdAt: wealthRequests.createdAt,
      })
      .from(wealthRequests)
      .innerJoin(wealth, eq(wealthRequests.wealthId, wealth.id))
      .innerJoin(communities, eq(wealth.communityId, communities.id))
      .leftJoin(pools, eq(wealth.sourcePoolId, pools.id))
      .where(
        and(
          eq(wealthRequests.requesterId, userId),
          or(eq(wealthRequests.status, 'pending'), eq(wealthRequests.status, 'accepted')),
          isNotNull(wealth.sourcePoolId) // Only pool distributions
        )
      )
      .orderBy(desc(wealthRequests.createdAt));

    return rows.map((r: any) => ({
      id: r.id,
      wealthId: r.wealthId,
      wealthTitle: r.wealthTitle,
      poolId: r.poolId,
      poolName: r.poolName || 'Unknown Pool',
      communityId: r.communityId,
      communityName: r.communityName,
      unitsRequested: r.unitsRequested || undefined,
      createdAt: r.createdAt?.toISOString() || new Date().toISOString(),
    }));
  }

  /**
   * Get pending invites for user
   */
  async getPendingInvites(userId: string): Promise<PendingInviteItem[]> {
    const rows = await this.db
      .select({
        id: communityUserInvites.id,
        communityId: communityUserInvites.communityId,
        communityName: communities.name,
        inviterDisplayName: appUsers.displayName,
        inviterUsername: appUsers.username,
        createdAt: communityUserInvites.createdAt,
      })
      .from(communityUserInvites)
      .innerJoin(communities, eq(communityUserInvites.communityId, communities.id))
      .innerJoin(appUsers, eq(communityUserInvites.createdBy, appUsers.id))
      .where(
        and(
          eq(communityUserInvites.invitedUserId, userId),
          eq(communityUserInvites.status, 'pending')
        )
      )
      .orderBy(desc(communityUserInvites.createdAt));

    return rows.map((r: any) => ({
      id: r.id,
      communityId: r.communityId,
      communityName: r.communityName,
      inviterDisplayName: r.inviterDisplayName || r.inviterUsername || 'Unknown',
      createdAt: r.createdAt?.toISOString() || new Date().toISOString(),
    }));
  }

  /**
   * Get unread notifications for user with community names and action URLs
   */
  async getUnreadNotifications(userId: string): Promise<DashboardNotification[]> {
    // Query notifications with community names
    const rows = await this.db
      .select({
        id: notifications.id,
        type: notifications.type,
        title: notifications.title,
        message: notifications.message,
        communityId: notifications.communityId,
        communityName: communities.name,
        resourceType: notifications.resourceType,
        resourceId: notifications.resourceId,
        createdAt: notifications.createdAt,
      })
      .from(notifications)
      .innerJoin(communities, eq(notifications.communityId, communities.id))
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)))
      .orderBy(desc(notifications.createdAt))
      .limit(20);

    // Build action URLs based on resource type
    // For wealth_request resources, we need to look up the wealthId
    const result: DashboardNotification[] = [];

    for (const r of rows) {
      let actionUrl = '';

      if (r.resourceType === 'wealth_request') {
        // Look up the wealthId from the request
        const [request] = await this.db
          .select({ wealthId: wealthRequests.wealthId })
          .from(wealthRequests)
          .where(eq(wealthRequests.id, r.resourceId));

        if (request?.wealthId) {
          actionUrl = `/wealth/${request.wealthId}`;
        }
      } else if (r.resourceType === 'wealth') {
        actionUrl = `/wealth/${r.resourceId}`;
      } else if (r.resourceType === 'pool') {
        actionUrl = `/community/${r.communityId}/pools/${r.resourceId}`;
      } else {
        // Default fallback
        actionUrl = `/community/${r.communityId}`;
      }

      result.push({
        id: r.id,
        type: r.type,
        title: r.title,
        message: r.message || undefined,
        communityId: r.communityId,
        communityName: r.communityName,
        resourceType: r.resourceType,
        resourceId: r.resourceId,
        actionUrl,
        createdAt: r.createdAt?.toISOString() || new Date().toISOString(),
      });
    }

    return result;
  }
}

// Default instance for production code paths
export const userDashboardRepository = new UserDashboardRepository(realDb);
