import { db as realDb } from '../db/index';
import { communities, communityLinkInvites, communityUserInvites } from '../db/schema';
import { eq, and, isNull, sql, inArray, or, ilike } from 'drizzle-orm';
import { CreateCommunityDto, UpdateCommunityDto, Community } from '../types/community.types';

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

export class CommunityRepository {
  private db: any;

  constructor(db: any) {
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
    const whereParts: any[] = [isNull(communities.deletedAt)];

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
      whereParts.push(eq(communities.id, sql`'00000000-0000-0000-0000-000000000000'::uuid` as any));
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
