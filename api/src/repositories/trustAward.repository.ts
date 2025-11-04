import { db } from '../db/index';
import { and, eq, count } from 'drizzle-orm';
import { trustAwards } from '../db/schema/trustAward.schema';

export class TrustAwardRepository {
  /**
   * Create a new trust award
   */
  async createAward(communityId: string, fromUserId: string, toUserId: string) {
    const [award] = await db
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
    const [deleted] = await db
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
    const [award] = await db
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
    const [award] = await db
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
    return db
      .select()
      .from(trustAwards)
      .where(and(eq(trustAwards.communityId, communityId), eq(trustAwards.fromUserId, fromUserId)));
  }

  /**
   * List all awards received by a user in a community
   */
  async listAwardsToUser(communityId: string, toUserId: string) {
    return db
      .select()
      .from(trustAwards)
      .where(and(eq(trustAwards.communityId, communityId), eq(trustAwards.toUserId, toUserId)));
  }

  /**
   * Count awards received by a user in a community
   */
  async countAwardsToUser(communityId: string, toUserId: string): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(trustAwards)
      .where(and(eq(trustAwards.communityId, communityId), eq(trustAwards.toUserId, toUserId)));
    return result.count;
  }

  /**
   * Count awards given by a user in a community
   */
  async countAwardsFromUser(communityId: string, fromUserId: string): Promise<number> {
    const [result] = await db
      .select({ count: count() })
      .from(trustAwards)
      .where(and(eq(trustAwards.communityId, communityId), eq(trustAwards.fromUserId, fromUserId)));
    return result.count;
  }
}

export const trustAwardRepository = new TrustAwardRepository();
