import { db as realDb } from '../db';
import { and, eq, sql, inArray } from 'drizzle-orm';
import { trustViews } from '../db/schema/trustView.schema';
import { trustAwards } from '../db/schema/trustAward.schema';
import { adminTrustGrants } from '../db/schema/adminTrustGrant.schema';
import { trustAwardRepository } from './trustAward.repository';
import { adminTrustGrantRepository } from './adminTrustGrant.repository';
import { calculateTrustDecay } from '../utils/trustDecay';

export class TrustViewRepository {
  private db: any;

  constructor(db: any) {
    this.db = db;
  }

  async get(communityId: string, userId: string) {
    const [row] = await this.db
      .select()
      .from(trustViews)
      .where(and(eq(trustViews.communityId, communityId), eq(trustViews.userId, userId)));
    return row || null;
  }

  async upsertZero(communityId: string, userId: string) {
    const existing = await this.get(communityId, userId);
    if (existing) return existing;
    const [created] = await this.db
      .insert(trustViews)
      .values({ communityId, userId, points: 0 })
      .returning();
    return created;
  }

  /**
   * Recalculate and update trust points for a user
   * Formula: SUM(decayed peer awards) + admin_trust_grants.trust_amount
   * Peer awards decay over time (100% for 0-6 months, linear decay to 0% at 12 months)
   * Admin grants do NOT decay
   */
  async recalculatePoints(communityId: string, userId: string) {
    // Get all peer awards with their timestamps for decay calculation
    const peerAwards = await trustAwardRepository.getEndorsementsWithDecay(communityId, userId);

    // Calculate effective peer trust (sum of decayed values)
    const effectivePeerTrust = peerAwards.reduce((sum: number, award: { updatedAt: Date }) => {
      return sum + calculateTrustDecay(award.updatedAt);
    }, 0);

    // Get admin grant amount (0 if none) - does NOT decay
    const adminGrant = await adminTrustGrantRepository.getGrantAmount(communityId, userId);

    // Calculate total points (floor the decayed peer trust)
    const totalPoints = Math.floor(effectivePeerTrust) + adminGrant;

    // Ensure row exists
    await this.upsertZero(communityId, userId);

    // Update points
    const [updated] = await this.db
      .update(trustViews)
      .set({ points: totalPoints, updatedAt: new Date() })
      .where(and(eq(trustViews.communityId, communityId), eq(trustViews.userId, userId)))
      .returning();

    return updated;
  }

  async adjustPoints(communityId: string, userId: string, delta: number) {
    // Ensure row exists
    await this.upsertZero(communityId, userId);
    const [updated] = await this.db
      .update(trustViews)
      .set({
        points: (await this.get(communityId, userId))!.points + delta,
        updatedAt: new Date(),
      })
      .where(and(eq(trustViews.communityId, communityId), eq(trustViews.userId, userId)))
      .returning();
    return updated;
  }

  async setPoints(communityId: string, userId: string, points: number) {
    await this.upsertZero(communityId, userId);
    const [updated] = await this.db
      .update(trustViews)
      .set({ points, updatedAt: new Date() })
      .where(and(eq(trustViews.communityId, communityId), eq(trustViews.userId, userId)))
      .returning();
    return updated;
  }

  async listByCommunity(communityId: string, limit = 50, offset = 0) {
    const results = await this.db
      .select({
        id: trustViews.id,
        communityId: trustViews.communityId,
        userId: trustViews.userId,
        points: trustViews.points,
        updatedAt: trustViews.updatedAt,
        peerAwards: sql<number>`COALESCE(COUNT(DISTINCT ${trustAwards.id}), 0)`,
        adminGrant: sql<number>`COALESCE(MAX(${adminTrustGrants.trustAmount}), 0)`,
      })
      .from(trustViews)
      .leftJoin(
        trustAwards,
        and(
          eq(trustAwards.communityId, trustViews.communityId),
          eq(trustAwards.toUserId, trustViews.userId)
        )
      )
      .leftJoin(
        adminTrustGrants,
        and(
          eq(adminTrustGrants.communityId, trustViews.communityId),
          eq(adminTrustGrants.toUserId, trustViews.userId)
        )
      )
      .where(eq(trustViews.communityId, communityId))
      .groupBy(
        trustViews.id,
        trustViews.communityId,
        trustViews.userId,
        trustViews.points,
        trustViews.updatedAt
      )
      .limit(limit)
      .offset(offset);

    return results;
  }

  async listByUser(userId: string, limit = 50, offset = 0) {
    return this.db
      .select()
      .from(trustViews)
      .where(eq(trustViews.userId, userId))
      .limit(limit)
      .offset(offset);
  }

  /**
   * Get all trust views for a community (for OpenFGA sync)
   */
  async getAllForCommunity(communityId: string) {
    return this.db.select().from(trustViews).where(eq(trustViews.communityId, communityId));
  }

  /**
   * Batch fetch trust scores for a user across multiple communities
   * @param communityIds - Array of community IDs to fetch trust scores for
   * @param userId - Internal user ID (from app_users.id)
   * @returns Map of communityId -> trust points
   */
  async getBatchForUser(communityIds: string[], userId: string): Promise<Map<string, number>> {
    if (communityIds.length === 0) {
      return new Map();
    }

    const rows = await this.db
      .select({
        communityId: trustViews.communityId,
        points: trustViews.points,
      })
      .from(trustViews)
      .where(and(inArray(trustViews.communityId, communityIds), eq(trustViews.userId, userId)));

    const map = new Map<string, number>();
    for (const row of rows) {
      map.set(row.communityId, row.points);
    }
    return map;
  }
}

// Default instance for production code paths
export const trustViewRepository = new TrustViewRepository(realDb);
