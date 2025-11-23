import { db as realDb } from '@db/index';
import { pools, poolInventory, poolAllowedItems } from '@db/schema/pools.schema';
import { councils } from '@db/schema/councils.schema';
import { items } from '@db/schema/items.schema';
import { eq, and, isNull, desc, sql } from 'drizzle-orm';
import type { AllowedItemResponse } from '@/types/pools.types';

export type PoolRecord = typeof pools.$inferSelect;
export type CreatePoolInput = typeof pools.$inferInsert;
export type UpdatePoolInput = Partial<
  Omit<typeof pools.$inferInsert, 'id' | 'createdAt' | 'createdBy' | 'communityId' | 'councilId'>
>;

export type PoolInventoryRecord = typeof poolInventory.$inferSelect;

export interface PoolWithDetails extends PoolRecord {
  councilName: string;
  inventory: Array<{
    itemId: string;
    itemName: string;
    unitsAvailable: number;
  }>;
  allowedItems: AllowedItemResponse[];
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
   * Find pool by ID with full details (council name, primary item, inventory, allowed items)
   */
  async findByIdWithDetails(id: string): Promise<PoolWithDetails | undefined> {
    const pool = await this.findById(id);
    if (!pool) return undefined;

    // Get council name
    const [council] = await this.db
      .select({ name: councils.name })
      .from(councils)
      .where(eq(councils.id, pool.councilId));

    // Get inventory
    const inventory = await this.getInventory(id);

    // Get allowed items
    const allowedItems = await this.getAllowedItems(id);

    return {
      ...pool,
      councilName: council?.name ?? 'Unknown Council',
      inventory,
      allowedItems,
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
        itemName: sql<string>`${items.translations}->'en'->>'name'`,
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

  /**
   * Get allowed items for a pool with full item details
   */
  async getAllowedItems(poolId: string): Promise<AllowedItemResponse[]> {
    const allowedItems = await this.db
      .select({
        id: items.id,
        name: sql<string>`${items.translations}->'en'->>'name'`,
        categoryId: items.id, // Using item id as category placeholder
        categoryName: items.kind, // Using kind as category placeholder
      })
      .from(poolAllowedItems)
      .innerJoin(items, eq(poolAllowedItems.itemId, items.id))
      .where(eq(poolAllowedItems.poolId, poolId));

    return allowedItems.map((item: any) => ({
      id: item.id,
      name: item.name || 'Unknown Item',
      categoryId: item.categoryId,
      categoryName: item.categoryName,
    }));
  }

  /**
   * Get allowed item IDs for a pool (simple list)
   */
  async getAllowedItemIds(poolId: string): Promise<string[]> {
    const allowedItems = await this.db
      .select({ itemId: poolAllowedItems.itemId })
      .from(poolAllowedItems)
      .where(eq(poolAllowedItems.poolId, poolId));

    return allowedItems.map((item: any) => item.itemId);
  }

  /**
   * Set allowed items for a pool (replaces existing)
   */
  async setAllowedItems(poolId: string, itemIds: string[]): Promise<void> {
    // Delete existing allowed items
    await this.db.delete(poolAllowedItems).where(eq(poolAllowedItems.poolId, poolId));

    // Insert new allowed items if any
    if (itemIds.length > 0) {
      await this.db.insert(poolAllowedItems).values(
        itemIds.map((itemId) => ({
          poolId,
          itemId,
        }))
      );
    }
  }

  /**
   * Check if an item is allowed in a pool
   * Returns true if pool has no whitelist (all items allowed) or if item is in whitelist
   */
  async isItemAllowed(poolId: string, itemId: string): Promise<boolean> {
    // Get all allowed items for the pool
    const allowedItemIds = await this.getAllowedItemIds(poolId);

    // If no whitelist, all items are allowed
    if (allowedItemIds.length === 0) {
      return true;
    }

    // Check if item is in whitelist
    return allowedItemIds.includes(itemId);
  }
}

// Default instance for production code paths
export const poolsRepository = new PoolsRepository(realDb);
