import { db } from '../db';
import { and, eq, sql, inArray } from 'drizzle-orm';
import { trustViews } from '../db/schema/trustView.schema';
import { trustAwards } from '../db/schema/trustAward.schema';
import { adminTrustGrants } from '../db/schema/adminTrustGrant.schema';
import { trustAwardRepository } from './trustAward.repository';
import { adminTrustGrantRepository } from './adminTrustGrant.repository';

export class TrustViewRepository {
  async get(communityId: string, userId: string) {
    const [row] = await db
      .select()
      .from(trustViews)
      .where(and(eq(trustViews.communityId, communityId), eq(trustViews.userId, userId)));
    return row || null;
  }

  async upsertZero(communityId: string, userId: string) {
    const existing = await this.get(communityId, userId);
    if (existing) return existing;
    const [created] = await db
      .insert(trustViews)
      .values({ communityId, userId, points: 0 })
      .returning();
    return created;
  }

  /**
   * Recalculate and update trust points for a user
   * New formula: COUNT(trust_awards) + COALESCE(admin_trust_grants.trust_amount, 0)
   */
  async recalculatePoints(communityId: string, userId: string) {
    // Count peer awards
    const peerAwards = await trustAwardRepository.countAwardsToUser(communityId, userId);

    // Get admin grant amount (0 if none)
    const adminGrant = await adminTrustGrantRepository.getGrantAmount(communityId, userId);

    // Calculate total points
    const totalPoints = peerAwards + adminGrant;

    // Ensure row exists
    await this.upsertZero(communityId, userId);

    // Update points
    const [updated] = await db
      .update(trustViews)
      .set({ points: totalPoints, updatedAt: new Date() })
      .where(and(eq(trustViews.communityId, communityId), eq(trustViews.userId, userId)))
      .returning();

    return updated;
  }

  async adjustPoints(communityId: string, userId: string, delta: number) {
    // Ensure row exists
    await this.upsertZero(communityId, userId);
    const [updated] = await db
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
    const [updated] = await db
      .update(trustViews)
      .set({ points, updatedAt: new Date() })
      .where(and(eq(trustViews.communityId, communityId), eq(trustViews.userId, userId)))
      .returning();
    return updated;
  }

  async listByCommunity(communityId: string, limit = 50, offset = 0) {
    const results = await db
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
    return db
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
    return db.select().from(trustViews).where(eq(trustViews.communityId, communityId));
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

    const rows = await db
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

export const trustViewRepository = new TrustViewRepository();
