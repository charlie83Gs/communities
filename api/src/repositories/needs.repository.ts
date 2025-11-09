import { db as realDb } from '@db/index';
import {
  needs,
  councilNeeds,
  needPriorityEnum,
  needRecurrenceEnum,
  needStatusEnum,
} from '@db/schema/needs.schema';
import { items } from '@db/schema/items.schema';
import { and, desc, eq, isNull, sql, count as drizzleCount, inArray } from 'drizzle-orm';

export type NeedRecord = typeof needs.$inferSelect;
export type CreateNeedInput = typeof needs.$inferInsert;
export type UpdateNeedInput = Partial<
  Omit<typeof needs.$inferInsert, 'id' | 'createdAt' | 'createdBy' | 'communityId'>
>;

export type CouncilNeedRecord = typeof councilNeeds.$inferSelect;
export type CreateCouncilNeedInput = typeof councilNeeds.$inferInsert;
export type UpdateCouncilNeedInput = Partial<
  Omit<typeof councilNeeds.$inferInsert, 'id' | 'createdAt' | 'createdBy' | 'communityId'>
>;

export type NeedListFilters = {
  communityId?: string;
  priority?: (typeof needPriorityEnum.enumValues)[number];
  status?: (typeof needStatusEnum.enumValues)[number];
  isRecurring?: boolean;
};

export type CouncilNeedListFilters = {
  councilId?: string;
  communityId?: string;
  priority?: (typeof needPriorityEnum.enumValues)[number];
  status?: (typeof needStatusEnum.enumValues)[number];
  isRecurring?: boolean;
};

export type NeedAggregationResult = {
  itemId: string;
  itemName: string;
  itemKind: 'object' | 'service';
  priority: 'need' | 'want';
  recurrence: 'one-time' | 'daily' | 'weekly' | 'monthly';
  totalUnitsNeeded: number;
  memberCount: number;
};

export class NeedsRepository {
  private db: any;

  constructor(db: any) {
    this.db = db;
  }

  // ========================================
  // MEMBER NEEDS
  // ========================================

  /**
   * Create a new member need
   */
  async createNeed(input: CreateNeedInput): Promise<NeedRecord> {
    const [need] = await this.db.insert(needs).values(input).returning();
    return need;
  }

  /**
   * Find need by ID (not deleted)
   */
  async findNeedById(id: string): Promise<NeedRecord | undefined> {
    const [need] = await this.db
      .select()
      .from(needs)
      .where(and(eq(needs.id, id), isNull(needs.deletedAt)));
    return need;
  }

  /**
   * List needs with optional filters
   */
  async listNeeds(filters: NeedListFilters = {}): Promise<NeedRecord[]> {
    const conditions = [isNull(needs.deletedAt)];

    if (filters.communityId) {
      conditions.push(eq(needs.communityId, filters.communityId));
    }
    if (filters.priority) {
      conditions.push(eq(needs.priority, filters.priority));
    }
    if (filters.status) {
      conditions.push(eq(needs.status, filters.status));
    }
    if (filters.isRecurring !== undefined) {
      conditions.push(eq(needs.isRecurring, filters.isRecurring));
    }

    return await this.db
      .select()
      .from(needs)
      .where(and(...conditions))
      .orderBy(desc(needs.createdAt));
  }

  /**
   * List needs by community
   */
  async listNeedsByCommunity(communityId: string): Promise<NeedRecord[]> {
    return this.listNeeds({ communityId });
  }

  /**
   * List needs by creator
   */
  async listNeedsByCreator(createdBy: string): Promise<NeedRecord[]> {
    return await this.db
      .select()
      .from(needs)
      .where(and(eq(needs.createdBy, createdBy), isNull(needs.deletedAt)))
      .orderBy(desc(needs.createdAt));
  }

  /**
   * Update a need
   */
  async updateNeed(id: string, patch: UpdateNeedInput): Promise<NeedRecord | undefined> {
    const [updated] = await this.db
      .update(needs)
      .set({ ...patch, updatedAt: new Date() })
      .where(and(eq(needs.id, id), isNull(needs.deletedAt)))
      .returning();
    return updated;
  }

  /**
   * Soft delete a need
   */
  async deleteNeed(id: string): Promise<NeedRecord | undefined> {
    const [deleted] = await this.db
      .update(needs)
      .set({ deletedAt: new Date() })
      .where(eq(needs.id, id))
      .returning();
    return deleted;
  }

  /**
   * Aggregate community needs by item, priority, and recurrence
   */
  async aggregateCommunityNeeds(communityId: string): Promise<NeedAggregationResult[]> {
    const results = await this.db
      .select({
        itemId: needs.itemId,
        itemName: items.name,
        itemKind: items.kind,
        priority: needs.priority,
        recurrence: needs.recurrence,
        isRecurring: needs.isRecurring,
        totalUnitsNeeded: sql<number>`sum(${needs.unitsNeeded})::int`,
        memberCount: sql<number>`count(distinct ${needs.createdBy})::int`,
      })
      .from(needs)
      .innerJoin(items, eq(needs.itemId, items.id))
      .where(
        and(eq(needs.communityId, communityId), eq(needs.status, 'active'), isNull(needs.deletedAt))
      )
      .groupBy(
        needs.itemId,
        items.name,
        items.kind,
        needs.priority,
        needs.recurrence,
        needs.isRecurring
      );

    // Transform results to match expected format
    return results.map((r) => ({
      itemId: r.itemId,
      itemName: r.itemName,
      itemKind: r.itemKind,
      priority: r.priority,
      recurrence: r.isRecurring && r.recurrence ? r.recurrence : 'one-time',
      totalUnitsNeeded: r.totalUnitsNeeded,
      memberCount: r.memberCount,
    }));
  }

  /**
   * Find needs due for recurring fulfillment
   */
  async findNeedsDueForFulfillment(currentDate: Date = new Date()): Promise<NeedRecord[]> {
    return await this.db
      .select()
      .from(needs)
      .where(
        and(
          eq(needs.isRecurring, true),
          eq(needs.status, 'active'),
          isNull(needs.deletedAt),
          sql`${needs.nextFulfillmentDate} <= ${currentDate}`
        )
      );
  }

  /**
   * Find member needs due for replenishment
   * @param currentDate - The current date to compare against nextFulfillmentDate
   * @returns Array of member needs that need replenishment
   */
  async findMemberNeedsDueForReplenishment(currentDate: Date = new Date()): Promise<NeedRecord[]> {
    return await this.db
      .select()
      .from(needs)
      .where(
        and(
          eq(needs.isRecurring, true),
          eq(needs.status, 'active'),
          isNull(needs.deletedAt),
          sql`${needs.nextFulfillmentDate} <= ${currentDate}`
        )
      );
  }

  /**
   * Update a member need's fulfillment dates
   * @param needId - Need ID
   * @param lastFulfilledAt - Last fulfillment date
   * @param nextFulfillmentDate - Next fulfillment date
   * @returns Updated need record
   */
  async updateNeedFulfillmentDates(
    needId: string,
    lastFulfilledAt: Date,
    nextFulfillmentDate: Date
  ): Promise<NeedRecord | undefined> {
    const [updated] = await this.db
      .update(needs)
      .set({
        lastFulfilledAt,
        nextFulfillmentDate,
        updatedAt: new Date(),
      })
      .where(eq(needs.id, needId))
      .returning();
    return updated;
  }

  // ========================================
  // COUNCIL NEEDS
  // ========================================

  /**
   * Create a new council need
   */
  async createCouncilNeed(input: CreateCouncilNeedInput): Promise<CouncilNeedRecord> {
    const [need] = await this.db.insert(councilNeeds).values(input).returning();
    return need;
  }

  /**
   * Find council need by ID (not deleted)
   */
  async findCouncilNeedById(id: string): Promise<CouncilNeedRecord | undefined> {
    const [need] = await this.db
      .select()
      .from(councilNeeds)
      .where(and(eq(councilNeeds.id, id), isNull(councilNeeds.deletedAt)));
    return need;
  }

  /**
   * List council needs with optional filters
   */
  async listCouncilNeeds(filters: CouncilNeedListFilters = {}): Promise<CouncilNeedRecord[]> {
    const conditions = [isNull(councilNeeds.deletedAt)];

    if (filters.councilId) {
      conditions.push(eq(councilNeeds.councilId, filters.councilId));
    }
    if (filters.communityId) {
      conditions.push(eq(councilNeeds.communityId, filters.communityId));
    }
    if (filters.priority) {
      conditions.push(eq(councilNeeds.priority, filters.priority));
    }
    if (filters.status) {
      conditions.push(eq(councilNeeds.status, filters.status));
    }
    if (filters.isRecurring !== undefined) {
      conditions.push(eq(councilNeeds.isRecurring, filters.isRecurring));
    }

    return await this.db
      .select()
      .from(councilNeeds)
      .where(and(...conditions))
      .orderBy(desc(councilNeeds.createdAt));
  }

  /**
   * List council needs by council
   */
  async listCouncilNeedsByCouncil(councilId: string): Promise<CouncilNeedRecord[]> {
    return this.listCouncilNeeds({ councilId });
  }

  /**
   * List council needs by community
   */
  async listCouncilNeedsByCommunity(communityId: string): Promise<CouncilNeedRecord[]> {
    return this.listCouncilNeeds({ communityId });
  }

  /**
   * Update a council need
   */
  async updateCouncilNeed(
    id: string,
    patch: UpdateCouncilNeedInput
  ): Promise<CouncilNeedRecord | undefined> {
    const [updated] = await this.db
      .update(councilNeeds)
      .set({ ...patch, updatedAt: new Date() })
      .where(and(eq(councilNeeds.id, id), isNull(councilNeeds.deletedAt)))
      .returning();
    return updated;
  }

  /**
   * Soft delete a council need
   */
  async deleteCouncilNeed(id: string): Promise<CouncilNeedRecord | undefined> {
    const [deleted] = await this.db
      .update(councilNeeds)
      .set({ deletedAt: new Date() })
      .where(eq(councilNeeds.id, id))
      .returning();
    return deleted;
  }

  /**
   * Aggregate council needs for a community
   */
  async aggregateCouncilNeeds(communityId: string): Promise<NeedAggregationResult[]> {
    const results = await this.db
      .select({
        itemId: councilNeeds.itemId,
        itemName: items.name,
        itemKind: items.kind,
        priority: councilNeeds.priority,
        recurrence: councilNeeds.recurrence,
        isRecurring: councilNeeds.isRecurring,
        totalUnitsNeeded: sql<number>`sum(${councilNeeds.unitsNeeded})::int`,
        memberCount: sql<number>`count(distinct ${councilNeeds.councilId})::int`,
      })
      .from(councilNeeds)
      .innerJoin(items, eq(councilNeeds.itemId, items.id))
      .where(
        and(
          eq(councilNeeds.communityId, communityId),
          eq(councilNeeds.status, 'active'),
          isNull(councilNeeds.deletedAt)
        )
      )
      .groupBy(
        councilNeeds.itemId,
        items.name,
        items.kind,
        councilNeeds.priority,
        councilNeeds.recurrence,
        councilNeeds.isRecurring
      );

    // Transform results to match expected format
    return results.map((r) => ({
      itemId: r.itemId,
      itemName: r.itemName,
      itemKind: r.itemKind,
      priority: r.priority,
      recurrence: r.isRecurring && r.recurrence ? r.recurrence : 'one-time',
      totalUnitsNeeded: r.totalUnitsNeeded,
      memberCount: r.memberCount,
    }));
  }

  /**
   * Find council needs due for recurring fulfillment
   */
  async findCouncilNeedsDueForFulfillment(
    currentDate: Date = new Date()
  ): Promise<CouncilNeedRecord[]> {
    return await this.db
      .select()
      .from(councilNeeds)
      .where(
        and(
          eq(councilNeeds.isRecurring, true),
          eq(councilNeeds.status, 'active'),
          isNull(councilNeeds.deletedAt),
          sql`${councilNeeds.nextFulfillmentDate} <= ${currentDate}`
        )
      );
  }

  /**
   * Find council needs due for replenishment
   * @param currentDate - The current date to compare against nextFulfillmentDate
   * @returns Array of council needs that need replenishment
   */
  async findCouncilNeedsDueForReplenishment(
    currentDate: Date = new Date()
  ): Promise<CouncilNeedRecord[]> {
    return await this.db
      .select()
      .from(councilNeeds)
      .where(
        and(
          eq(councilNeeds.isRecurring, true),
          eq(councilNeeds.status, 'active'),
          isNull(councilNeeds.deletedAt),
          sql`${councilNeeds.nextFulfillmentDate} <= ${currentDate}`
        )
      );
  }

  /**
   * Update a council need's fulfillment dates
   * @param needId - Council need ID
   * @param lastFulfilledAt - Last fulfillment date
   * @param nextFulfillmentDate - Next fulfillment date
   * @returns Updated council need record
   */
  async updateCouncilNeedFulfillmentDates(
    needId: string,
    lastFulfilledAt: Date,
    nextFulfillmentDate: Date
  ): Promise<CouncilNeedRecord | undefined> {
    const [updated] = await this.db
      .update(councilNeeds)
      .set({
        lastFulfilledAt,
        nextFulfillmentDate,
        updatedAt: new Date(),
      })
      .where(eq(councilNeeds.id, needId))
      .returning();
    return updated;
  }
}

// Default instance for production code paths
export const needsRepository = new NeedsRepository(realDb);
