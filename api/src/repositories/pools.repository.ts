import { db as realDb } from '@db/index';
import { pools, poolInventory } from '@db/schema/pools.schema';
import { councils } from '@db/schema/councils.schema';
import { items } from '@db/schema/items.schema';
import { eq, and, isNull, desc, sql } from 'drizzle-orm';

export type PoolRecord = typeof pools.$inferSelect;
export type CreatePoolInput = typeof pools.$inferInsert;
export type UpdatePoolInput = Partial<
  Omit<typeof pools.$inferInsert, 'id' | 'createdAt' | 'createdBy' | 'communityId' | 'councilId'>
>;

export type PoolInventoryRecord = typeof poolInventory.$inferSelect;

export interface PoolWithDetails extends PoolRecord {
  councilName: string;
  primaryItemName?: string;
  inventory: Array<{
    itemId: string;
    itemName: string;
    unitsAvailable: number;
  }>;
}

export class PoolsRepository {
  private db: any;

  constructor(db: any) {
    this.db = db;
  }

  /**
   * Create a new pool
   */
  async create(input: CreatePoolInput): Promise<PoolRecord> {
    const [pool] = await this.db.insert(pools).values(input).returning();
    return pool;
  }

  /**
   * Find pool by ID
   */
  async findById(id: string): Promise<PoolRecord | undefined> {
    const [pool] = await this.db
      .select()
      .from(pools)
      .where(and(eq(pools.id, id), isNull(pools.deletedAt)));
    return pool;
  }

  /**
   * Find pool by ID with full details (council name, primary item, inventory)
   */
  async findByIdWithDetails(id: string): Promise<PoolWithDetails | undefined> {
    const pool = await this.findById(id);
    if (!pool) return undefined;

    // Get council name
    const [council] = await this.db
      .select({ name: councils.name })
      .from(councils)
      .where(eq(councils.id, pool.councilId));

    // Get primary item name if exists
    let primaryItemName: string | undefined;
    if (pool.primaryItemId) {
      const [item] = await this.db
        .select({ name: items.name })
        .from(items)
        .where(eq(items.id, pool.primaryItemId));
      primaryItemName = item?.name;
    }

    // Get inventory
    const inventory = await this.getInventory(id);

    return {
      ...pool,
      councilName: council?.name ?? 'Unknown Council',
      primaryItemName,
      inventory,
    };
  }

  /**
   * List all pools for a community
   */
  async listByCommunity(communityId: string): Promise<PoolRecord[]> {
    return await this.db
      .select()
      .from(pools)
      .where(and(eq(pools.communityId, communityId), isNull(pools.deletedAt)))
      .orderBy(desc(pools.createdAt));
  }

  /**
   * List all pools for a council
   */
  async listByCouncil(councilId: string): Promise<PoolRecord[]> {
    return await this.db
      .select()
      .from(pools)
      .where(and(eq(pools.councilId, councilId), isNull(pools.deletedAt)))
      .orderBy(desc(pools.createdAt));
  }

  /**
   * Update pool
   */
  async update(id: string, patch: UpdatePoolInput): Promise<PoolRecord | undefined> {
    const [updated] = await this.db
      .update(pools)
      .set({ ...patch, updatedAt: new Date() })
      .where(and(eq(pools.id, id), isNull(pools.deletedAt)))
      .returning();
    return updated;
  }

  /**
   * Soft delete pool
   */
  async delete(id: string): Promise<PoolRecord | undefined> {
    const [deleted] = await this.db
      .update(pools)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(pools.id, id))
      .returning();
    return deleted;
  }

  /**
   * Get pool inventory
   */
  async getInventory(
    poolId: string
  ): Promise<Array<{ itemId: string; itemName: string; unitsAvailable: number }>> {
    const inventory = await this.db
      .select({
        itemId: poolInventory.itemId,
        itemName: items.name,
        unitsAvailable: poolInventory.unitsAvailable,
      })
      .from(poolInventory)
      .innerJoin(items, eq(poolInventory.itemId, items.id))
      .where(eq(poolInventory.poolId, poolId));

    return inventory;
  }

  /**
   * Get inventory for a specific item in a pool
   */
  async getInventoryForItem(poolId: string, itemId: string): Promise<number> {
    const [inventory] = await this.db
      .select({ unitsAvailable: poolInventory.unitsAvailable })
      .from(poolInventory)
      .where(and(eq(poolInventory.poolId, poolId), eq(poolInventory.itemId, itemId)));

    return inventory?.unitsAvailable ?? 0;
  }

  /**
   * Increment pool inventory (when contribution is confirmed)
   */
  async incrementInventory(poolId: string, itemId: string, units: number): Promise<void> {
    // Check if inventory record exists
    const [existing] = await this.db
      .select()
      .from(poolInventory)
      .where(and(eq(poolInventory.poolId, poolId), eq(poolInventory.itemId, itemId)));

    if (existing) {
      // Update existing inventory
      await this.db
        .update(poolInventory)
        .set({
          unitsAvailable: sql`${poolInventory.unitsAvailable} + ${units}`,
          updatedAt: new Date(),
        })
        .where(and(eq(poolInventory.poolId, poolId), eq(poolInventory.itemId, itemId)));
    } else {
      // Create new inventory record
      await this.db.insert(poolInventory).values({
        poolId,
        itemId,
        unitsAvailable: units,
        updatedAt: new Date(),
      });
    }
  }

  /**
   * Decrement pool inventory (when distribution happens)
   * Returns false if insufficient inventory
   */
  async decrementInventory(poolId: string, itemId: string, units: number): Promise<boolean> {
    const currentUnits = await this.getInventoryForItem(poolId, itemId);

    if (currentUnits < units) {
      return false; // Insufficient inventory
    }

    await this.db
      .update(poolInventory)
      .set({
        unitsAvailable: sql`${poolInventory.unitsAvailable} - ${units}`,
        updatedAt: new Date(),
      })
      .where(and(eq(poolInventory.poolId, poolId), eq(poolInventory.itemId, itemId)));

    return true;
  }

  /**
   * Batch decrement inventory (for mass distribution)
   * Returns false if insufficient inventory for any item
   */
  async batchDecrementInventory(
    poolId: string,
    itemId: string,
    totalUnits: number
  ): Promise<boolean> {
    return await this.decrementInventory(poolId, itemId, totalUnits);
  }
}

// Default instance for production code paths
export const poolsRepository = new PoolsRepository(realDb);
