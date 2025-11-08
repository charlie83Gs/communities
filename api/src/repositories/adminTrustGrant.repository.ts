import { db as realDb } from '../db/index';
import { and, eq } from 'drizzle-orm';
import { adminTrustGrants } from '../db/schema/adminTrustGrant.schema';

export class AdminTrustGrantRepository {
  private db: any;

  constructor(db: any) {
    this.db = db;
  }

  /**
   * Upsert (create or update) an admin trust grant
   */
  async upsertGrant(communityId: string, adminUserId: string, toUserId: string, amount: number) {
    // Check if grant exists
    const existing = await this.getGrant(communityId, toUserId);

    if (existing) {
      // Update existing grant
      const [updated] = await this.db
        .update(adminTrustGrants)
        .set({
          adminUserId,
          trustAmount: amount,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(adminTrustGrants.communityId, communityId),
            eq(adminTrustGrants.toUserId, toUserId)
          )
        )
        .returning();
      return updated;
    }

    // Create new grant
    const [created] = await this.db
      .insert(adminTrustGrants)
      .values({
        communityId,
        adminUserId,
        toUserId,
        trustAmount: amount,
      })
      .returning();
    return created;
  }

  /**
   * Get admin trust grant for a user in a community
   */
  async getGrant(communityId: string, toUserId: string) {
    const [grant] = await this.db
      .select()
      .from(adminTrustGrants)
      .where(
        and(eq(adminTrustGrants.communityId, communityId), eq(adminTrustGrants.toUserId, toUserId))
      );
    return grant || null;
  }

  /**
   * List all admin grants in a community
   */
  async listAllGrants(communityId: string) {
    return this.db
      .select()
      .from(adminTrustGrants)
      .where(eq(adminTrustGrants.communityId, communityId));
  }

  /**
   * Delete an admin trust grant
   */
  async deleteGrant(communityId: string, toUserId: string) {
    const [deleted] = await this.db
      .delete(adminTrustGrants)
      .where(
        and(eq(adminTrustGrants.communityId, communityId), eq(adminTrustGrants.toUserId, toUserId))
      )
      .returning();
    return deleted;
  }

  /**
   * Get admin grant amount for a user (returns 0 if no grant exists)
   */
  async getGrantAmount(communityId: string, toUserId: string): Promise<number> {
    const grant = await this.getGrant(communityId, toUserId);
    return grant?.trustAmount ?? 0;
  }
}

export const adminTrustGrantRepository = new AdminTrustGrantRepository(realDb);
