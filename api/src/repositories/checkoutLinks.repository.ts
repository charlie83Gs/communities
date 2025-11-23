import { db as realDb } from '@db/index';
import { poolCheckoutLinks, shareCheckoutLinks } from '@db/schema/checkoutLinks.schema';
import { pools } from '@db/schema/pools.schema';
import { wealth } from '@db/schema/wealth.schema';
import { items } from '@db/schema/items.schema';
import { communities } from '@db/schema/communities.schema';
import { eq, desc, sql } from 'drizzle-orm';

// ========== Pool Checkout Links ==========

export type PoolCheckoutLinkRecord = typeof poolCheckoutLinks.$inferSelect;
export type CreatePoolCheckoutLinkInput = typeof poolCheckoutLinks.$inferInsert;
export type UpdatePoolCheckoutLinkInput = Partial<
  Omit<
    typeof poolCheckoutLinks.$inferInsert,
    'id' | 'createdAt' | 'createdBy' | 'poolId' | 'itemId'
  >
>;

export interface PoolCheckoutLinkWithDetails extends PoolCheckoutLinkRecord {
  pool: {
    id: string;
    name: string;
    communityId: string;
    councilId: string;
  };
  item: {
    id: string;
    name: string;
  };
}

// ========== Share Checkout Links ==========

export type ShareCheckoutLinkRecord = typeof shareCheckoutLinks.$inferSelect;
export type CreateShareCheckoutLinkInput = typeof shareCheckoutLinks.$inferInsert;
export type UpdateShareCheckoutLinkInput = Partial<
  Omit<typeof shareCheckoutLinks.$inferInsert, 'id' | 'createdAt' | 'shareId'>
>;

export interface ShareCheckoutLinkWithDetails extends ShareCheckoutLinkRecord {
  share: {
    id: string;
    title: string;
    unitsAvailable: number;
    communityId: string;
    itemId: string;
    createdBy: string;
  };
  item: {
    id: string;
    name: string;
  };
  community: {
    id: string;
    name: string;
  };
}

export class CheckoutLinksRepository {
  private db: any;

  constructor(db: any) {
    this.db = db;
  }

  // ========== Pool Checkout Links CRUD ==========

  /**
   * Create a new pool checkout link
   */
  async createPoolLink(input: CreatePoolCheckoutLinkInput): Promise<PoolCheckoutLinkRecord> {
    const [link] = await this.db.insert(poolCheckoutLinks).values(input).returning();
    return link;
  }

  /**
   * Find pool checkout link by ID
   */
  async findPoolLinkById(id: string): Promise<PoolCheckoutLinkRecord | undefined> {
    const [link] = await this.db
      .select()
      .from(poolCheckoutLinks)
      .where(eq(poolCheckoutLinks.id, id));
    return link;
  }

  /**
   * Find pool checkout link by link code
   */
  async findPoolLinkByCode(linkCode: string): Promise<PoolCheckoutLinkRecord | undefined> {
    const [link] = await this.db
      .select()
      .from(poolCheckoutLinks)
      .where(eq(poolCheckoutLinks.linkCode, linkCode));
    return link;
  }

  /**
   * Find pool checkout link by code with full details
   */
  async findPoolLinkByCodeWithDetails(
    linkCode: string
  ): Promise<PoolCheckoutLinkWithDetails | undefined> {
    const result = await this.db
      .select({
        id: poolCheckoutLinks.id,
        poolId: poolCheckoutLinks.poolId,
        itemId: poolCheckoutLinks.itemId,
        linkCode: poolCheckoutLinks.linkCode,
        maxUnitsPerCheckout: poolCheckoutLinks.maxUnitsPerCheckout,
        isActive: poolCheckoutLinks.isActive,
        revokedAt: poolCheckoutLinks.revokedAt,
        revokedBy: poolCheckoutLinks.revokedBy,
        revokeReason: poolCheckoutLinks.revokeReason,
        createdAt: poolCheckoutLinks.createdAt,
        createdBy: poolCheckoutLinks.createdBy,
        totalCheckouts: poolCheckoutLinks.totalCheckouts,
        totalUnitsDistributed: poolCheckoutLinks.totalUnitsDistributed,
        lastCheckoutAt: poolCheckoutLinks.lastCheckoutAt,
        pool: {
          id: pools.id,
          name: pools.name,
          communityId: pools.communityId,
          councilId: pools.councilId,
        },
        item: {
          id: items.id,
          name: sql<string>`${items.translations}->'en'->>'name'`,
        },
      })
      .from(poolCheckoutLinks)
      .innerJoin(pools, eq(poolCheckoutLinks.poolId, pools.id))
      .innerJoin(items, eq(poolCheckoutLinks.itemId, items.id))
      .where(eq(poolCheckoutLinks.linkCode, linkCode));

    return result[0];
  }

  /**
   * List all pool checkout links for a pool
   */
  async listPoolLinksByPool(poolId: string): Promise<PoolCheckoutLinkRecord[]> {
    return await this.db
      .select()
      .from(poolCheckoutLinks)
      .where(eq(poolCheckoutLinks.poolId, poolId))
      .orderBy(desc(poolCheckoutLinks.createdAt));
  }

  /**
   * List pool checkout links for a pool with item details
   */
  async listPoolLinksByPoolWithDetails(
    poolId: string
  ): Promise<Array<PoolCheckoutLinkRecord & { item: { id: string; name: string; unit: string } }>> {
    return await this.db
      .select({
        id: poolCheckoutLinks.id,
        poolId: poolCheckoutLinks.poolId,
        itemId: poolCheckoutLinks.itemId,
        linkCode: poolCheckoutLinks.linkCode,
        maxUnitsPerCheckout: poolCheckoutLinks.maxUnitsPerCheckout,
        isActive: poolCheckoutLinks.isActive,
        revokedAt: poolCheckoutLinks.revokedAt,
        revokedBy: poolCheckoutLinks.revokedBy,
        revokeReason: poolCheckoutLinks.revokeReason,
        createdAt: poolCheckoutLinks.createdAt,
        createdBy: poolCheckoutLinks.createdBy,
        totalCheckouts: poolCheckoutLinks.totalCheckouts,
        totalUnitsDistributed: poolCheckoutLinks.totalUnitsDistributed,
        lastCheckoutAt: poolCheckoutLinks.lastCheckoutAt,
        item: {
          id: items.id,
          name: sql<string>`${items.translations}->'en'->>'name'`,
          unit: sql<string>`${items.translations}->'en'->>'unit'`,
        },
      })
      .from(poolCheckoutLinks)
      .innerJoin(items, eq(poolCheckoutLinks.itemId, items.id))
      .where(eq(poolCheckoutLinks.poolId, poolId))
      .orderBy(desc(poolCheckoutLinks.createdAt));
  }

  /**
   * Update pool checkout link
   */
  async updatePoolLink(
    id: string,
    input: UpdatePoolCheckoutLinkInput
  ): Promise<PoolCheckoutLinkRecord> {
    const [link] = await this.db
      .update(poolCheckoutLinks)
      .set(input)
      .where(eq(poolCheckoutLinks.id, id))
      .returning();
    return link;
  }

  /**
   * Revoke pool checkout link
   */
  async revokePoolLink(
    id: string,
    revokedBy: string,
    reason?: string
  ): Promise<PoolCheckoutLinkRecord> {
    const [link] = await this.db
      .update(poolCheckoutLinks)
      .set({
        isActive: false,
        revokedAt: new Date(),
        revokedBy,
        revokeReason: reason || null,
      })
      .where(eq(poolCheckoutLinks.id, id))
      .returning();
    return link;
  }

  /**
   * Increment pool checkout link stats (after successful checkout)
   */
  async incrementPoolLinkStats(id: string, unitsDistributed: number): Promise<void> {
    await this.db
      .update(poolCheckoutLinks)
      .set({
        totalCheckouts: sql`${poolCheckoutLinks.totalCheckouts} + 1`,
        totalUnitsDistributed: sql`${poolCheckoutLinks.totalUnitsDistributed} + ${unitsDistributed}`,
        lastCheckoutAt: new Date(),
      })
      .where(eq(poolCheckoutLinks.id, id));
  }

  // ========== Share Checkout Links CRUD ==========

  /**
   * Create a new share checkout link
   */
  async createShareLink(input: CreateShareCheckoutLinkInput): Promise<ShareCheckoutLinkRecord> {
    const [link] = await this.db.insert(shareCheckoutLinks).values(input).returning();
    return link;
  }

  /**
   * Find share checkout link by ID
   */
  async findShareLinkById(id: string): Promise<ShareCheckoutLinkRecord | undefined> {
    const [link] = await this.db
      .select()
      .from(shareCheckoutLinks)
      .where(eq(shareCheckoutLinks.id, id));
    return link;
  }

  /**
   * Find share checkout link by share ID
   */
  async findShareLinkByShareId(shareId: string): Promise<ShareCheckoutLinkRecord | undefined> {
    const [link] = await this.db
      .select()
      .from(shareCheckoutLinks)
      .where(eq(shareCheckoutLinks.shareId, shareId));
    return link;
  }

  /**
   * Find share checkout link by link code
   */
  async findShareLinkByCode(linkCode: string): Promise<ShareCheckoutLinkRecord | undefined> {
    const [link] = await this.db
      .select()
      .from(shareCheckoutLinks)
      .where(eq(shareCheckoutLinks.linkCode, linkCode));
    return link;
  }

  /**
   * Find share checkout link by code with full details
   */
  async findShareLinkByCodeWithDetails(
    linkCode: string
  ): Promise<ShareCheckoutLinkWithDetails | undefined> {
    const result = await this.db
      .select({
        id: shareCheckoutLinks.id,
        shareId: shareCheckoutLinks.shareId,
        linkCode: shareCheckoutLinks.linkCode,
        maxUnitsPerCheckout: shareCheckoutLinks.maxUnitsPerCheckout,
        isActive: shareCheckoutLinks.isActive,
        deactivatedAt: shareCheckoutLinks.deactivatedAt,
        deactivationReason: shareCheckoutLinks.deactivationReason,
        createdAt: shareCheckoutLinks.createdAt,
        totalCheckouts: shareCheckoutLinks.totalCheckouts,
        totalUnitsDistributed: shareCheckoutLinks.totalUnitsDistributed,
        lastCheckoutAt: shareCheckoutLinks.lastCheckoutAt,
        share: {
          id: wealth.id,
          title: wealth.title,
          unitsAvailable: wealth.unitsAvailable,
          communityId: wealth.communityId,
          itemId: wealth.itemId,
          createdBy: wealth.createdBy,
        },
        item: {
          id: items.id,
          name: sql<string>`${items.translations}->'en'->>'name'`,
        },
        community: {
          id: communities.id,
          name: communities.name,
        },
      })
      .from(shareCheckoutLinks)
      .innerJoin(wealth, eq(shareCheckoutLinks.shareId, wealth.id))
      .innerJoin(items, eq(wealth.itemId, items.id))
      .innerJoin(communities, eq(wealth.communityId, communities.id))
      .where(eq(shareCheckoutLinks.linkCode, linkCode));

    return result[0];
  }

  /**
   * Update share checkout link
   */
  async updateShareLink(
    id: string,
    input: UpdateShareCheckoutLinkInput
  ): Promise<ShareCheckoutLinkRecord> {
    const [link] = await this.db
      .update(shareCheckoutLinks)
      .set(input)
      .where(eq(shareCheckoutLinks.id, id))
      .returning();
    return link;
  }

  /**
   * Deactivate share checkout link
   */
  async deactivateShareLink(
    id: string,
    reason: 'share_closed' | 'units_depleted' | 'manual_revoke'
  ): Promise<ShareCheckoutLinkRecord> {
    const [link] = await this.db
      .update(shareCheckoutLinks)
      .set({
        isActive: false,
        deactivatedAt: new Date(),
        deactivationReason: reason,
      })
      .where(eq(shareCheckoutLinks.id, id))
      .returning();
    return link;
  }

  /**
   * Increment share checkout link stats (after successful checkout)
   */
  async incrementShareLinkStats(id: string, unitsDistributed: number): Promise<void> {
    await this.db
      .update(shareCheckoutLinks)
      .set({
        totalCheckouts: sql`${shareCheckoutLinks.totalCheckouts} + 1`,
        totalUnitsDistributed: sql`${shareCheckoutLinks.totalUnitsDistributed} + ${unitsDistributed}`,
        lastCheckoutAt: new Date(),
      })
      .where(eq(shareCheckoutLinks.id, id));
  }
}

// Export singleton instance
export const checkoutLinksRepository = new CheckoutLinksRepository(realDb);
