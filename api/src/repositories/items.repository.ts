import { db as realDb } from '@db/index';
type DbClient = typeof realDb;

import { items, wealth } from '@db/schema';
import { eq, and, isNull, sql } from 'drizzle-orm';

export type SupportedLanguage = 'en' | 'es' | 'hi';

export interface ItemTranslation {
  name: string;
  description?: string;
}

export interface ItemTranslations {
  en: ItemTranslation;
  es?: ItemTranslation;
  hi?: ItemTranslation;
}

export interface CreateItemDto {
  communityId: string;
  translations: ItemTranslations;
  kind: 'object' | 'service';
  wealthValue: string; // Numeric string for precise decimal handling
  isDefault?: boolean;
  createdBy: string;
}

export interface UpdateItemDto {
  translations?: ItemTranslations;
  kind?: 'object' | 'service';
  wealthValue?: string; // Numeric string for precise decimal handling
}

export interface ItemWithCount {
  id: string;
  communityId: string;
  translations: ItemTranslations;
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
  private db: DbClient;

  constructor(db: DbClient) {
    this.db = db;
  }

  /**
   * Create a new item
   */
  async create(data: CreateItemDto) {
    const [item] = await this.db
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
    const [item] = await this.db.select().from(items).where(eq(items.id, id));
    return item;
  }

  /**
   * Find item by community and name (case-insensitive)
   * Searches in any language translation
   */
  async findByName(communityId: string, name: string) {
    const [item] = await this.db
      .select()
      .from(items)
      .where(
        and(
          eq(items.communityId, communityId),
          sql`(
            LOWER(${items.translations}->'en'->>'name') = LOWER(${name})
            OR LOWER(${items.translations}->'es'->>'name') = LOWER(${name})
            OR LOWER(${items.translations}->'hi'->>'name') = LOWER(${name})
          )`,
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

    const result = await this.db
      .select({
        id: items.id,
        communityId: items.communityId,
        translations: items.translations,
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
      .orderBy(sql`${items.translations}->'en'->>'name'`);

    return result.map((row) => ({
      ...row,
      translations: row.translations as ItemTranslations,
      _count: {
        wealthEntries: row.wealthCount,
      },
    }));
  }

  /**
   * Search items by name or description in the specified language
   * @param language - Language to search in (default: 'en')
   */
  async search(
    communityId: string,
    language: SupportedLanguage = 'en',
    query?: string,
    kind?: 'object' | 'service'
  ) {
    const conditions = [eq(items.communityId, communityId), isNull(items.deletedAt)];

    if (query) {
      // Search in the requested language's name and description
      conditions.push(
        sql`(
          ${items.translations}->${language}->>'name' ILIKE ${'%' + query + '%'}
          OR ${items.translations}->${language}->>'description' ILIKE ${'%' + query + '%'}
        )`
      );
    }

    if (kind) {
      conditions.push(eq(items.kind, kind));
    }

    return await this.db
      .select()
      .from(items)
      .where(and(...conditions))
      .orderBy(sql`${items.translations}->${language}->>'name'`)
      .limit(50);
  }

  /**
   * Update an item
   */
  async update(id: string, data: UpdateItemDto) {
    const [updated] = await this.db
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
    const [deleted] = await this.db
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
    const [result] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(wealth)
      .where(and(eq(wealth.itemId, itemId), eq(wealth.status, 'active')));

    return result.count > 0;
  }

  /**
   * Get wealth count for an item
   */
  async getWealthCount(itemId: string): Promise<number> {
    const [result] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(wealth)
      .where(eq(wealth.itemId, itemId));

    return result.count;
  }
}

// Default instance for production code paths
export const itemsRepository = new ItemsRepository(realDb);
