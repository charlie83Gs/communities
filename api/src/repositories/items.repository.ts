import { db } from '@db/index';
import { items, wealth } from '@db/schema';
import { eq, and, isNull, ilike, sql, or } from 'drizzle-orm';

export interface CreateItemDto {
  communityId: string;
  name: string;
  description?: string | null;
  kind: 'object' | 'service';
  wealthValue: string; // Numeric string for precise decimal handling
  isDefault?: boolean;
  createdBy: string;
}

export interface UpdateItemDto {
  name?: string;
  description?: string | null;
  kind?: 'object' | 'service';
  wealthValue?: string; // Numeric string for precise decimal handling
}

export interface ItemWithCount {
  id: string;
  communityId: string;
  name: string;
  description: string | null;
  kind: 'object' | 'service';
  wealthValue: string;
  isDefault: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  _count: {
    wealthEntries: number;
  };
}

export class ItemsRepository {
  /**
   * Create a new item
   */
  async create(data: CreateItemDto) {
    const [item] = await db
      .insert(items)
      .values({
        ...data,
        isDefault: data.isDefault ?? false,
      })
      .returning();
    return item;
  }

  /**
   * Find item by ID
   */
  async findById(id: string) {
    const [item] = await db
      .select()
      .from(items)
      .where(eq(items.id, id));
    return item;
  }

  /**
   * Find item by community and name (case-insensitive)
   */
  async findByName(communityId: string, name: string) {
    const [item] = await db
      .select()
      .from(items)
      .where(
        and(
          eq(items.communityId, communityId),
          sql`LOWER(${items.name}) = LOWER(${name})`,
          isNull(items.deletedAt)
        )
      );
    return item;
  }

  /**
   * List all items for a community with wealth count
   */
  async listByCommunity(communityId: string, includeDeleted = false): Promise<ItemWithCount[]> {
    const conditions = [eq(items.communityId, communityId)];

    if (!includeDeleted) {
      conditions.push(isNull(items.deletedAt));
    }

    const result = await db
      .select({
        id: items.id,
        communityId: items.communityId,
        name: items.name,
        description: items.description,
        kind: items.kind,
        wealthValue: items.wealthValue,
        isDefault: items.isDefault,
        createdBy: items.createdBy,
        createdAt: items.createdAt,
        updatedAt: items.updatedAt,
        deletedAt: items.deletedAt,
        wealthCount: sql<number>`count(${wealth.id})::int`,
      })
      .from(items)
      .leftJoin(wealth, eq(wealth.itemId, items.id))
      .where(and(...conditions))
      .groupBy(items.id)
      .orderBy(items.name);

    return result.map((row) => ({
      ...row,
      _count: {
        wealthEntries: row.wealthCount,
      },
    }));
  }

  /**
   * Search items by name or description
   */
  async search(
    communityId: string,
    query?: string,
    kind?: 'object' | 'service'
  ) {
    const conditions = [
      eq(items.communityId, communityId),
      isNull(items.deletedAt),
    ];

    if (query) {
      conditions.push(
        or(
          ilike(items.name, `%${query}%`),
          ilike(items.description, `%${query}%`)
        )!
      );
    }

    if (kind) {
      conditions.push(eq(items.kind, kind));
    }

    return await db
      .select()
      .from(items)
      .where(and(...conditions))
      .orderBy(items.name)
      .limit(50);
  }

  /**
   * Update an item
   */
  async update(id: string, data: UpdateItemDto) {
    const [updated] = await db
      .update(items)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(items.id, id))
      .returning();
    return updated;
  }

  /**
   * Soft delete an item
   */
  async softDelete(id: string) {
    const [deleted] = await db
      .update(items)
      .set({
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(items.id, id))
      .returning();
    return deleted;
  }

  /**
   * Check if item has active wealth references
   */
  async hasActiveWealthReferences(itemId: string): Promise<boolean> {
    const [result] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(wealth)
      .where(
        and(
          eq(wealth.itemId, itemId),
          eq(wealth.status, 'active')
        )
      );

    return result.count > 0;
  }

  /**
   * Get wealth count for an item
   */
  async getWealthCount(itemId: string): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(wealth)
      .where(eq(wealth.itemId, itemId));

    return result.count;
  }
}

export const itemsRepository = new ItemsRepository();
