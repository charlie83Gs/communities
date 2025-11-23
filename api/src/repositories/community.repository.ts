import { db as realDb } from '../db/index';
import {
  communities,
  communityLinkInvites,
  communityUserInvites,
  trustViews,
  wealth,
  wealthRequests,
  pools,
  needs,
  disputes,
  disputeParticipants,
} from '../db/schema';
import { communityMemberRepository } from './communityMember.repository';
import { eq, and, isNull, sql, inArray, or, ilike, notInArray } from 'drizzle-orm';
import {
  CreateCommunityDto,
  UpdateCommunityDto,
  Community,
  CommunityStatsSummary,
  CommunityPendingActions,
} from '../types/community.types';

export type CommunitySearchFilters = {
  q?: string;
  // All communities are now private - only show communities user has access to
  accessibleIds?: string[];
  limit?: number;
  offset?: number;
};

export type CommunitySearchResult = {
  rows: Community[];
  total: number;
};

type DbClient = typeof realDb;

export class CommunityRepository {
  private db: DbClient;

  constructor(db: DbClient) {
    this.db = db;
  }

  async create(data: CreateCommunityDto & { createdBy: string }) {
    const [community] = await this.db.insert(communities).values(data).returning();
    return community;
  }

  async findById(id: string) {
    const [community] = await this.db
      .select()
      .from(communities)
      .where(and(eq(communities.id, id), isNull(communities.deletedAt)));
    return community;
  }

  async findAll(limit = 10, offset = 0) {
    return await this.db
      .select()
      .from(communities)
      .where(isNull(communities.deletedAt))
      .limit(limit)
      .offset(offset);
  }

  // REMOVED: findPublic - all communities are now private (membership-based access only)

  async update(id: string, data: UpdateCommunityDto) {
    const [updated] = await this.db
      .update(communities)
      .set(data)
      .where(and(eq(communities.id, id), isNull(communities.deletedAt)))
      .returning();
    return updated;
  }

  async delete(id: string) {
    return await this.db.transaction(async (tx) => {
      // Soft delete community
      await tx
        .update(communities)
        .set({ deletedAt: sql`CURRENT_TIMESTAMP` })
        .where(and(eq(communities.id, id), isNull(communities.deletedAt)));

      // Delete related invites (resolve invites immediately)
      await tx.delete(communityLinkInvites).where(eq(communityLinkInvites.communityId, id));

      await tx.delete(communityUserInvites).where(eq(communityUserInvites.communityId, id));

      // Note: OpenFGA tuples are managed separately and not automatically cleaned up
      // on soft delete. They will be cleaned up when the community is hard deleted.

      // Return the soft-deleted community
      const [deleted] = await tx.select().from(communities).where(eq(communities.id, id));
      return deleted;
    });
  }

  // REMOVED: isMember and isAdmin methods
  // These checks are now performed via OpenFGA in the communityMemberRepository

  async search(filters: CommunitySearchFilters): Promise<CommunitySearchResult> {
    const whereParts: ReturnType<typeof eq | typeof or | typeof isNull | typeof inArray>[] = [
      isNull(communities.deletedAt),
    ];

    // Text search on name and description
    if (filters.q && filters.q.trim().length > 0) {
      const q = `%${filters.q.trim()}%`;
      whereParts.push(or(ilike(communities.name, q), ilike(communities.description, q)));
    }

    // Access control: only show communities user has access to
    // All communities are now private (membership-based access)
    if (filters.accessibleIds && filters.accessibleIds.length > 0) {
      whereParts.push(inArray(communities.id, filters.accessibleIds));
    } else {
      // No accessible communities - return empty result
      // Use a constant impossible UUID to ensure no rows match
      whereParts.push(eq(communities.id, sql`'00000000-0000-0000-0000-000000000000'::uuid`));
    }

    const where = and(...whereParts);

    // total count
    const [{ count }] = await this.db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(communities)
      .where(where);

    const limit = Math.max(1, Math.min(filters.limit ?? 20, 100));
    const offset = Math.max(0, filters.offset ?? 0);

    const rows = await this.db.select().from(communities).where(where).limit(limit).offset(offset);

    return { rows: rows as Community[], total: count ?? 0 };
  }

  async getStatsSummary(communityId: string): Promise<CommunityStatsSummary> {
    // Member count from OpenFGA (the source of truth for membership)
    const members = await communityMemberRepository.findByCommunity(communityId);
    const memberCount = members.length;

    // Average trust score
    const [trustResult] = await this.db
      .select({ avg: sql<number>`coalesce(avg(${trustViews.points}), 0)` })
      .from(trustViews)
      .where(eq(trustViews.communityId, communityId));

    // Active wealth count (excluding cancelled and fulfilled statuses)
    const [wealthResult] = await this.db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(wealth)
      .where(
        and(
          eq(wealth.communityId, communityId),
          notInArray(wealth.status, ['cancelled', 'fulfilled', 'expired'])
        )
      );

    // Active pool count
    const [poolResult] = await this.db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(pools)
      .where(and(eq(pools.communityId, communityId), isNull(pools.deletedAt)));

    // Active needs count
    const [needsResult] = await this.db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(needs)
      .where(
        and(eq(needs.communityId, communityId), isNull(needs.deletedAt), eq(needs.status, 'active'))
      );

    return {
      memberCount,
      avgTrustScore: Math.round(Number(trustResult?.avg) || 0),
      wealthCount: wealthResult?.count ?? 0,
      poolCount: poolResult?.count ?? 0,
      needsCount: needsResult?.count ?? 0,
    };
  }

  async getPendingActionsCounts(
    communityId: string,
    userId: string
  ): Promise<CommunityPendingActions> {
    // Incoming requests (to user's wealth items)
    const [incomingResult] = await this.db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(wealthRequests)
      .innerJoin(wealth, eq(wealthRequests.wealthId, wealth.id))
      .where(
        and(
          eq(wealth.communityId, communityId),
          eq(wealth.createdBy, userId),
          eq(wealthRequests.status, 'pending')
        )
      );

    // Outgoing requests (user's requests to others)
    const [outgoingResult] = await this.db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(wealthRequests)
      .innerJoin(wealth, eq(wealthRequests.wealthId, wealth.id))
      .where(
        and(
          eq(wealth.communityId, communityId),
          eq(wealthRequests.requesterId, userId),
          eq(wealthRequests.status, 'pending')
        )
      );

    // Pool distributions (awaiting user action)
    // Note: pool_distributions table doesn't exist yet, returning 0
    const poolDistributions = 0;

    // Open disputes (where user is participant)
    const [disputesResult] = await this.db
      .select({ count: sql<number>`cast(count(distinct ${disputes.id}) as int)` })
      .from(disputes)
      .innerJoin(disputeParticipants, eq(disputeParticipants.disputeId, disputes.id))
      .where(
        and(
          eq(disputes.communityId, communityId),
          eq(disputeParticipants.userId, userId),
          inArray(disputes.status, ['open', 'in_mediation'])
        )
      );

    return {
      incomingRequests: incomingResult?.count ?? 0,
      outgoingRequests: outgoingResult?.count ?? 0,
      poolDistributions,
      openDisputes: disputesResult?.count ?? 0,
    };
  }

  async cleanupOldDeleted() {
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    return await this.db.transaction(async (tx) => {
      const oldCommunityIds = await tx
        .select({ id: communities.id })
        .from(communities)
        .where(sql`deleted_at IS NOT NULL AND deleted_at < ${ninetyDaysAgo.toISOString()}`);

      const ids = oldCommunityIds.map((c) => c.id);

      if (ids.length === 0) return 0;

      // Delete any remaining invites (though already deleted on soft delete)
      await tx.delete(communityLinkInvites).where(inArray(communityLinkInvites.communityId, ids));

      await tx.delete(communityUserInvites).where(inArray(communityUserInvites.communityId, ids));

      // Note: OpenFGA tuples should be cleaned up separately if needed
      // This could be done via a separate cleanup job that queries OpenFGA
      // and removes tuples for deleted communities

      // Hard delete old soft-deleted communities
      const deletedCount = await tx.delete(communities).where(inArray(communities.id, ids));

      return deletedCount;
    });
  }
}

// Default instance for production code paths
export const communityRepository = new CommunityRepository(realDb);
