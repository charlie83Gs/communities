import { db as realDb } from '../db';
import { poolConsumptions, councilUsageReports, items, pools, poolInventory } from '../db/schema';
import { eq, desc, count, and, isNull } from 'drizzle-orm';

type DbClient = typeof realDb;

export interface CreateConsumptionDto {
  poolId: string;
  itemId: string;
  units: number;
  description: string;
  reportId?: string | null;
}

export interface UpdateConsumptionDto {
  description?: string;
  reportId?: string | null;
}

export class PoolConsumptionRepository {
  private db: DbClient;

  constructor(db: DbClient) {
    this.db = db;
  }

  /**
   * Helper to extract item name from translations JSONB
   */
  private getItemName(translations: unknown): string {
    if (!translations || typeof translations !== 'object') {
      return 'Unknown Item';
    }
    const trans = translations as Record<string, { name?: string }>;
    if (trans.en?.name) return trans.en.name;
    const firstLang = Object.keys(trans)[0];
    if (firstLang && trans[firstLang]?.name) return trans[firstLang].name;
    return 'Unknown Item';
  }

  /**
   * Create a consumption and decrement pool inventory atomically
   */
  async create(councilId: string, data: CreateConsumptionDto, consumedBy: string) {
    return await this.db.transaction(async (tx) => {
      // 1. Check current inventory
      const [inventory] = await tx
        .select()
        .from(poolInventory)
        .where(and(eq(poolInventory.poolId, data.poolId), eq(poolInventory.itemId, data.itemId)));

      if (!inventory || inventory.unitsAvailable < data.units) {
        throw new Error('Insufficient inventory');
      }

      // 2. Decrement inventory
      await tx
        .update(poolInventory)
        .set({
          unitsAvailable: inventory.unitsAvailable - data.units,
          updatedAt: new Date(),
        })
        .where(eq(poolInventory.id, inventory.id));

      // 3. Create consumption record
      const [consumption] = await tx
        .insert(poolConsumptions)
        .values({
          poolId: data.poolId,
          councilId,
          itemId: data.itemId,
          units: data.units,
          description: data.description,
          reportId: data.reportId || null,
          consumedBy,
        })
        .returning();

      return consumption;
    });
  }

  /**
   * Find consumption by ID with related data
   */
  async findById(consumptionId: string) {
    const [consumption] = await this.db
      .select({
        id: poolConsumptions.id,
        poolId: poolConsumptions.poolId,
        councilId: poolConsumptions.councilId,
        itemId: poolConsumptions.itemId,
        units: poolConsumptions.units,
        description: poolConsumptions.description,
        reportId: poolConsumptions.reportId,
        consumedBy: poolConsumptions.consumedBy,
        createdAt: poolConsumptions.createdAt,
        updatedAt: poolConsumptions.updatedAt,
        poolName: pools.name,
        itemName: items.translations,
        reportTitle: councilUsageReports.title,
      })
      .from(poolConsumptions)
      .leftJoin(pools, eq(poolConsumptions.poolId, pools.id))
      .leftJoin(items, eq(poolConsumptions.itemId, items.id))
      .leftJoin(councilUsageReports, eq(poolConsumptions.reportId, councilUsageReports.id))
      .where(eq(poolConsumptions.id, consumptionId));

    if (!consumption) {
      return null;
    }

    return {
      ...consumption,
      itemName: this.getItemName(consumption.itemName),
    };
  }

  /**
   * Find all consumptions for a council with pagination
   */
  async findByCouncil(councilId: string, options: { page?: number; limit?: number } = {}) {
    const { page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;

    const consumptions = await this.db
      .select({
        id: poolConsumptions.id,
        poolId: poolConsumptions.poolId,
        councilId: poolConsumptions.councilId,
        itemId: poolConsumptions.itemId,
        units: poolConsumptions.units,
        description: poolConsumptions.description,
        reportId: poolConsumptions.reportId,
        consumedBy: poolConsumptions.consumedBy,
        createdAt: poolConsumptions.createdAt,
        updatedAt: poolConsumptions.updatedAt,
        poolName: pools.name,
        itemName: items.translations,
        reportTitle: councilUsageReports.title,
      })
      .from(poolConsumptions)
      .leftJoin(pools, eq(poolConsumptions.poolId, pools.id))
      .leftJoin(items, eq(poolConsumptions.itemId, items.id))
      .leftJoin(councilUsageReports, eq(poolConsumptions.reportId, councilUsageReports.id))
      .where(eq(poolConsumptions.councilId, councilId))
      .orderBy(desc(poolConsumptions.createdAt))
      .limit(limit)
      .offset(offset);

    const [{ count: total }] = await this.db
      .select({ count: count() })
      .from(poolConsumptions)
      .where(eq(poolConsumptions.councilId, councilId));

    return {
      consumptions: consumptions.map((c) => ({
        ...c,
        itemName: this.getItemName(c.itemName),
      })),
      total: Number(total),
    };
  }

  /**
   * Find consumptions without a report (for linking to new reports)
   */
  async findUnreportedByCouncil(councilId: string) {
    const consumptions = await this.db
      .select({
        id: poolConsumptions.id,
        poolId: poolConsumptions.poolId,
        councilId: poolConsumptions.councilId,
        itemId: poolConsumptions.itemId,
        units: poolConsumptions.units,
        description: poolConsumptions.description,
        createdAt: poolConsumptions.createdAt,
        poolName: pools.name,
        itemName: items.translations,
      })
      .from(poolConsumptions)
      .leftJoin(pools, eq(poolConsumptions.poolId, pools.id))
      .leftJoin(items, eq(poolConsumptions.itemId, items.id))
      .where(and(eq(poolConsumptions.councilId, councilId), isNull(poolConsumptions.reportId)))
      .orderBy(desc(poolConsumptions.createdAt));

    return consumptions.map((c) => ({
      ...c,
      itemName: this.getItemName(c.itemName),
    }));
  }

  /**
   * Update a consumption (description or report link)
   */
  async update(consumptionId: string, data: UpdateConsumptionDto) {
    const [updated] = await this.db
      .update(poolConsumptions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(poolConsumptions.id, consumptionId))
      .returning();

    return updated;
  }

  /**
   * Link multiple consumptions to a report
   */
  async linkToReport(consumptionIds: string[], reportId: string) {
    for (const id of consumptionIds) {
      await this.db
        .update(poolConsumptions)
        .set({ reportId, updatedAt: new Date() })
        .where(eq(poolConsumptions.id, id));
    }
  }

  /**
   * Unlink consumption from a report
   */
  async unlinkFromReport(consumptionId: string) {
    const [updated] = await this.db
      .update(poolConsumptions)
      .set({ reportId: null, updatedAt: new Date() })
      .where(eq(poolConsumptions.id, consumptionId))
      .returning();

    return updated;
  }

  /**
   * Delete a consumption and restore pool inventory
   */
  async delete(consumptionId: string) {
    return await this.db.transaction(async (tx) => {
      // 1. Get consumption details
      const [consumption] = await tx
        .select()
        .from(poolConsumptions)
        .where(eq(poolConsumptions.id, consumptionId));

      if (!consumption) {
        return null;
      }

      // 2. Restore inventory
      const [inventory] = await tx
        .select()
        .from(poolInventory)
        .where(
          and(
            eq(poolInventory.poolId, consumption.poolId),
            eq(poolInventory.itemId, consumption.itemId)
          )
        );

      if (inventory) {
        await tx
          .update(poolInventory)
          .set({
            unitsAvailable: inventory.unitsAvailable + consumption.units,
            updatedAt: new Date(),
          })
          .where(eq(poolInventory.id, inventory.id));
      }

      // 3. Delete consumption
      const [deleted] = await tx
        .delete(poolConsumptions)
        .where(eq(poolConsumptions.id, consumptionId))
        .returning();

      return deleted;
    });
  }

  /**
   * Find consumptions linked to a specific report
   */
  async findByReport(reportId: string) {
    const consumptions = await this.db
      .select({
        id: poolConsumptions.id,
        poolId: poolConsumptions.poolId,
        itemId: poolConsumptions.itemId,
        units: poolConsumptions.units,
        description: poolConsumptions.description,
        createdAt: poolConsumptions.createdAt,
        poolName: pools.name,
        itemName: items.translations,
      })
      .from(poolConsumptions)
      .leftJoin(pools, eq(poolConsumptions.poolId, pools.id))
      .leftJoin(items, eq(poolConsumptions.itemId, items.id))
      .where(eq(poolConsumptions.reportId, reportId))
      .orderBy(desc(poolConsumptions.createdAt));

    return consumptions.map((c) => ({
      ...c,
      itemName: this.getItemName(c.itemName),
    }));
  }
}

// Default instance for production code paths
export const poolConsumptionRepository = new PoolConsumptionRepository(realDb);
