import { db as realDb } from '../db/index';
import { and, eq, count, lt, gte, inArray } from 'drizzle-orm';
import { trustAwards } from '../db/schema/trustAward.schema';
import { appUsers } from '../db/schema/app_users.schema';

// Decay constants
const DECAY_START_MONTHS = 6;

export class TrustAwardRepository {
  private db: any;

  constructor(db: any) {
    this.db = db;
  }

  /**
   * Create a new trust award
   */
  async createAward(communityId: string, fromUserId: string, toUserId: string) {
    const [award] = await this.db
      .insert(trustAwards)
      .values({
        communityId,
        fromUserId,
        toUserId,
      })
      .returning();
    return award;
  }

  /**
   * Delete a trust award
   */
  async deleteAward(communityId: string, fromUserId: string, toUserId: string) {
    const [deleted] = await this.db
      .delete(trustAwards)
      .where(
        and(
          eq(trustAwards.communityId, communityId),
          eq(trustAwards.fromUserId, fromUserId),
          eq(trustAwards.toUserId, toUserId)
        )
      )
      .returning();
    return deleted;
  }

  /**
   * Check if a user has awarded trust to another user
   */
  async hasAward(communityId: string, fromUserId: string, toUserId: string): Promise<boolean> {
    const [award] = await this.db
      .select()
      .from(trustAwards)
      .where(
        and(
          eq(trustAwards.communityId, communityId),
          eq(trustAwards.fromUserId, fromUserId),
          eq(trustAwards.toUserId, toUserId)
        )
      );
    return !!award;
  }

  /**
   * Get a specific trust award
   */
  async getAward(communityId: string, fromUserId: string, toUserId: string) {
    const [award] = await this.db
      .select()
      .from(trustAwards)
      .where(
        and(
          eq(trustAwards.communityId, communityId),
          eq(trustAwards.fromUserId, fromUserId),
          eq(trustAwards.toUserId, toUserId)
        )
      );
    return award || null;
  }

  /**
   * List all awards given by a user in a community
   */
  async listUserAwards(communityId: string, fromUserId: string) {
    return this.db
      .select()
      .from(trustAwards)
      .where(and(eq(trustAwards.communityId, communityId), eq(trustAwards.fromUserId, fromUserId)));
  }

  /**
   * List all awards received by a user in a community
   */
  async listAwardsToUser(communityId: string, toUserId: string) {
    return this.db
      .select()
      .from(trustAwards)
      .where(and(eq(trustAwards.communityId, communityId), eq(trustAwards.toUserId, toUserId)));
  }

  /**
   * Count awards received by a user in a community
   */
  async countAwardsToUser(communityId: string, toUserId: string): Promise<number> {
    const [result] = await this.db
      .select({ count: count() })
      .from(trustAwards)
      .where(and(eq(trustAwards.communityId, communityId), eq(trustAwards.toUserId, toUserId)));
    return result.count;
  }

  /**
   * Count awards given by a user in a community
   */
  async countAwardsFromUser(communityId: string, fromUserId: string): Promise<number> {
    const [result] = await this.db
      .select({ count: count() })
      .from(trustAwards)
      .where(and(eq(trustAwards.communityId, communityId), eq(trustAwards.fromUserId, fromUserId)));
    return result.count;
  }

  /**
   * Get decaying endorsements granted by a user (> 6 months old)
   */
  async getDecayingEndorsementsByGrantor(communityId: string, fromUserId: string) {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - DECAY_START_MONTHS);

    return this.db
      .select({
        id: trustAwards.id,
        toUserId: trustAwards.toUserId,
        recipientName: appUsers.displayName,
        recipientUsername: appUsers.username,
        updatedAt: trustAwards.updatedAt,
      })
      .from(trustAwards)
      .innerJoin(appUsers, eq(appUsers.id, trustAwards.toUserId))
      .where(
        and(
          eq(trustAwards.communityId, communityId),
          eq(trustAwards.fromUserId, fromUserId),
          lt(trustAwards.updatedAt, sixMonthsAgo)
        )
      );
  }

  /**
   * Get endorsements that just hit the 6-month decay threshold (for notifications)
   * Returns endorsements where updatedAt is between 6 months and 6 months + 1 day ago
   */
  async getEndorsementsNeedingNotification() {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - DECAY_START_MONTHS);

    const sixMonthsOneDayAgo = new Date(sixMonthsAgo);
    sixMonthsOneDayAgo.setDate(sixMonthsOneDayAgo.getDate() - 1);

    return this.db
      .select({
        id: trustAwards.id,
        communityId: trustAwards.communityId,
        fromUserId: trustAwards.fromUserId,
        toUserId: trustAwards.toUserId,
        updatedAt: trustAwards.updatedAt,
      })
      .from(trustAwards)
      .where(
        and(lt(trustAwards.updatedAt, sixMonthsAgo), gte(trustAwards.updatedAt, sixMonthsOneDayAgo))
      );
  }

  /**
   * Recertify trust endorsements (bulk) - resets updatedAt to now
   */
  async recertify(communityId: string, fromUserId: string, toUserIds: string[]) {
    if (toUserIds.length === 0) return [];

    return this.db
      .update(trustAwards)
      .set({ updatedAt: new Date() })
      .where(
        and(
          eq(trustAwards.communityId, communityId),
          eq(trustAwards.fromUserId, fromUserId),
          inArray(trustAwards.toUserId, toUserIds)
        )
      )
      .returning();
  }

  /**
   * Get all endorsements received by a user with their decay status
   */
  async getEndorsementsWithDecay(communityId: string, toUserId: string) {
    return this.db
      .select({
        id: trustAwards.id,
        fromUserId: trustAwards.fromUserId,
        updatedAt: trustAwards.updatedAt,
      })
      .from(trustAwards)
      .where(and(eq(trustAwards.communityId, communityId), eq(trustAwards.toUserId, toUserId)));
  }

  /**
   * Get all users in a community with decaying endorsements for OpenFGA sync
   */
  async getUsersWithDecayingEndorsements(communityId: string) {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - DECAY_START_MONTHS);

    return this.db
      .selectDistinct({ toUserId: trustAwards.toUserId })
      .from(trustAwards)
      .where(
        and(eq(trustAwards.communityId, communityId), lt(trustAwards.updatedAt, sixMonthsAgo))
      );
  }
}

// Default instance for production code paths
export const trustAwardRepository = new TrustAwardRepository(realDb);
