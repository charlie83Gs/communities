import { db as realDb } from '../db';
import {
  councils,
  councilManagers,
  councilTrustScores,
  councilTrustAwards,
  councilTrustHistory,
} from '../db/schema';
import { eq, and, desc, asc, isNull, count } from 'drizzle-orm';

export type CreateCouncilDto = {
  communityId: string;
  name: string;
  description: string;
  createdBy: string;
};

export type UpdateCouncilDto = {
  name?: string;
  description?: string;
};

type DbClient = typeof realDb;

export class CouncilRepository {
  private db: DbClient;

  constructor(db: DbClient) {
    this.db = db;
  }

  /**
   * Create a new council
   */
  async create(data: CreateCouncilDto) {
    const [council] = await this.db.insert(councils).values(data).returning();

    // Initialize trust score for the council
    await this.db.insert(councilTrustScores).values({
      councilId: council.id,
      trustScore: 0,
    });

    return council;
  }

  /**
   * Find council by ID (not deleted)
   */
  async findById(id: string) {
    const [council] = await this.db
      .select()
      .from(councils)
      .where(and(eq(councils.id, id), isNull(councils.deletedAt)));

    return council;
  }

  /**
   * Find all councils in a community
   */
  async findByCommunityId(
    communityId: string,
    options: {
      page?: number;
      limit?: number;
      sortBy?: 'trustScore' | 'createdAt';
      order?: 'asc' | 'desc';
    } = {}
  ) {
    const { page = 1, limit = 20, sortBy = 'createdAt', order = 'desc' } = options;
    const offset = (page - 1) * limit;

    // Build the query with join to get trust score
    const query = this.db
      .select({
        council: councils,
        trustScore: councilTrustScores.trustScore,
      })
      .from(councils)
      .leftJoin(councilTrustScores, eq(councils.id, councilTrustScores.councilId))
      .where(and(eq(councils.communityId, communityId), isNull(councils.deletedAt)))
      .limit(limit)
      .offset(offset);

    // Apply sorting
    if (sortBy === 'trustScore') {
      if (order === 'desc') {
        query.orderBy(desc(councilTrustScores.trustScore));
      } else {
        query.orderBy(asc(councilTrustScores.trustScore));
      }
    } else {
      if (order === 'desc') {
        query.orderBy(desc(councils.createdAt));
      } else {
        query.orderBy(asc(councils.createdAt));
      }
    }

    const results = await query;

    // Get total count
    const [{ count: total }] = await this.db
      .select({ count: count() })
      .from(councils)
      .where(and(eq(councils.communityId, communityId), isNull(councils.deletedAt)));

    return {
      councils: results.map((r) => ({
        ...r.council,
        trustScore: r.trustScore ?? 0,
      })),
      total: Number(total),
    };
  }

  /**
   * Update council details
   */
  async update(id: string, data: UpdateCouncilDto) {
    const [updated] = await this.db
      .update(councils)
      .set({ ...data, updatedAt: new Date() })
      .where(and(eq(councils.id, id), isNull(councils.deletedAt)))
      .returning();

    return updated;
  }

  /**
   * Soft delete a council
   */
  async delete(id: string) {
    const [deleted] = await this.db
      .update(councils)
      .set({ deletedAt: new Date() })
      .where(eq(councils.id, id))
      .returning();

    return deleted;
  }

  /**
   * Add a manager to a council
   */
  async addManager(councilId: string, userId: string) {
    const [manager] = await this.db
      .insert(councilManagers)
      .values({ councilId, userId })
      .returning();

    return manager;
  }

  /**
   * Remove a manager from a council
   */
  async removeManager(councilId: string, userId: string) {
    const [removed] = await this.db
      .delete(councilManagers)
      .where(and(eq(councilManagers.councilId, councilId), eq(councilManagers.userId, userId)))
      .returning();

    return removed;
  }

  /**
   * Get all managers for a council
   */
  async getManagers(councilId: string) {
    return await this.db
      .select()
      .from(councilManagers)
      .where(eq(councilManagers.councilId, councilId));
  }

  /**
   * Check if user is a manager of a council
   */
  async isManager(councilId: string, userId: string) {
    const [manager] = await this.db
      .select()
      .from(councilManagers)
      .where(and(eq(councilManagers.councilId, councilId), eq(councilManagers.userId, userId)));

    return !!manager;
  }

  /**
   * Get council trust score
   */
  async getTrustScore(councilId: string) {
    const [score] = await this.db
      .select()
      .from(councilTrustScores)
      .where(eq(councilTrustScores.councilId, councilId));

    return score?.trustScore ?? 0;
  }

  /**
   * Check if user has awarded trust to a council
   */
  async hasAwardedTrust(councilId: string, userId: string) {
    const [award] = await this.db
      .select()
      .from(councilTrustAwards)
      .where(
        and(
          eq(councilTrustAwards.councilId, councilId),
          eq(councilTrustAwards.userId, userId),
          isNull(councilTrustAwards.removedAt)
        )
      );

    return !!award;
  }

  /**
   * Award trust to a council
   */
  async awardTrust(councilId: string, userId: string) {
    // Check if award exists
    const [existing] = await this.db
      .select()
      .from(councilTrustAwards)
      .where(
        and(eq(councilTrustAwards.councilId, councilId), eq(councilTrustAwards.userId, userId))
      );

    let award;
    if (existing) {
      // Restore if previously removed
      [award] = await this.db
        .update(councilTrustAwards)
        .set({ removedAt: null, awardedAt: new Date() })
        .where(
          and(eq(councilTrustAwards.councilId, councilId), eq(councilTrustAwards.userId, userId))
        )
        .returning();
    } else {
      // Create new award
      [award] = await this.db
        .insert(councilTrustAwards)
        .values({ councilId, userId, awardedAt: new Date(), removedAt: null })
        .returning();
    }

    // Recalculate trust score
    await this.recalculateTrustScore(councilId);

    // Log to history
    await this.db.insert(councilTrustHistory).values({
      councilId,
      userId,
      action: 'awarded',
    });

    return award;
  }

  /**
   * Remove trust from a council
   */
  async removeTrust(councilId: string, userId: string) {
    const [removed] = await this.db
      .update(councilTrustAwards)
      .set({ removedAt: new Date() })
      .where(
        and(
          eq(councilTrustAwards.councilId, councilId),
          eq(councilTrustAwards.userId, userId),
          isNull(councilTrustAwards.removedAt)
        )
      )
      .returning();

    // Recalculate trust score
    await this.recalculateTrustScore(councilId);

    // Log to history
    await this.db.insert(councilTrustHistory).values({
      councilId,
      userId,
      action: 'removed',
    });

    return removed;
  }

  /**
   * Recalculate trust score for a council
   */
  async recalculateTrustScore(councilId: string) {
    const [{ count: trustCount }] = await this.db
      .select({ count: count() })
      .from(councilTrustAwards)
      .where(
        and(eq(councilTrustAwards.councilId, councilId), isNull(councilTrustAwards.removedAt))
      );

    await this.db
      .update(councilTrustScores)
      .set({ trustScore: Number(trustCount), updatedAt: new Date() })
      .where(eq(councilTrustScores.councilId, councilId));

    return Number(trustCount);
  }

  /**
   * Get member count for a council
   */
  async getMemberCount(councilId: string) {
    const [{ count: memberCount }] = await this.db
      .select({ count: count() })
      .from(councilManagers)
      .where(eq(councilManagers.councilId, councilId));

    return Number(memberCount);
  }
}

// Default instance for production code paths
export const councilRepository = new CouncilRepository(realDb);
