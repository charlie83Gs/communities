import { db as realDb } from '@db/index';
import {
  wealth,
  wealthRequests,
  wealthStatusEnum,
  wealthRequestStatusEnum,
  wealthDistributionTypeEnum,
} from '@db/schema/wealth.schema';
import { items } from '@db/schema/items.schema';
import { pools } from '@db/schema/pools.schema';
import { and, eq, inArray, ilike, or, gte, lte, desc, sql, isNull, isNotNull } from 'drizzle-orm';

export type WealthRecord = typeof wealth.$inferSelect;
export type CreateWealthInput = typeof wealth.$inferInsert;
export type UpdateWealthInput = Partial<
  Omit<typeof wealth.$inferInsert, 'id' | 'createdAt' | 'createdBy' | 'communityId'>
>;

export type WealthRequestRecord = typeof wealthRequests.$inferSelect;
export type CreateWealthRequestInput = {
  wealthId: string;
  requesterId: string;
  message?: string | null;
  unitsRequested?: number | null;
};

export type PoolDistributionRequestRecord = WealthRequestRecord & {
  sourcePoolId: string;
  poolName: string;
  wealthTitle: string;
};

export type WealthSearchFilters = {
  communityIds: string[]; // required scope filter
  communityId?: string; // optional explicit narrowing
  q?: string;
  durationType?: 'timebound' | 'unlimited';
  endDateAfter?: Date;
  endDateBefore?: Date;
  distributionType?: (typeof wealthDistributionTypeEnum.enumValues)[number];
  status?: (typeof wealthStatusEnum.enumValues)[number];
  limit?: number;
  offset?: number;
};

export type WealthSearchResult = {
  rows: WealthRecord[];
  total: number;
};

export class WealthRepository {
  private db: any;

  constructor(db: any) {
    this.db = db;
  }

  // Wealth
  async createWealth(input: CreateWealthInput): Promise<WealthRecord> {
    const [row] = await this.db.insert(wealth).values(input).returning();
    return row;
  }

  async findById(id: string): Promise<WealthRecord | undefined> {
    const [row] = await this.db.select().from(wealth).where(eq(wealth.id, id));
    return row;
  }

  async listByCommunities(
    communityIds: string[],
    status?: (typeof wealthStatusEnum.enumValues)[number]
  ): Promise<WealthRecord[]> {
    if (communityIds.length === 0) return [];
    const where = status
      ? and(inArray(wealth.communityId, communityIds), eq(wealth.status, status))
      : inArray(wealth.communityId, communityIds);
    return await this.db.select().from(wealth).where(where).orderBy(desc(wealth.createdAt));
  }

  async listByCommunity(
    communityId: string,
    status?: (typeof wealthStatusEnum.enumValues)[number]
  ): Promise<WealthRecord[]> {
    const where = status
      ? and(eq(wealth.communityId, communityId), eq(wealth.status, status))
      : eq(wealth.communityId, communityId);
    return await this.db.select().from(wealth).where(where).orderBy(desc(wealth.createdAt));
  }

  async updateWealth(id: string, patch: UpdateWealthInput): Promise<WealthRecord | undefined> {
    const [row] = await this.db
      .update(wealth)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(wealth.id, id))
      .returning();
    return row;
  }

  async cancelWealth(id: string): Promise<WealthRecord | undefined> {
    const [row] = await this.db
      .update(wealth)
      .set({ status: 'cancelled', updatedAt: new Date() })
      .where(eq(wealth.id, id))
      .returning();
    return row;
  }

  async markFulfilled(id: string): Promise<WealthRecord | undefined> {
    const [row] = await this.db
      .update(wealth)
      .set({ status: 'fulfilled', updatedAt: new Date() })
      .where(eq(wealth.id, id))
      .returning();
    return row;
  }

  async decrementUnits(id: string, units: number): Promise<WealthRecord | undefined> {
    // Using SQL expression would be better; Drizzle supports .set with sql`...`
    // For simplicity: fetch, compute, update
    const wealthItem = await this.findById(id);
    if (!wealthItem) return undefined;
    const remaining = (wealthItem.unitsAvailable ?? 0) - units;
    const nextStatus =
      wealthItem.distributionType === 'unit_based' && remaining <= 0
        ? 'fulfilled'
        : wealthItem.status;
    const [row] = await this.db
      .update(wealth)
      .set({
        unitsAvailable: remaining,
        status: nextStatus,
        updatedAt: new Date(),
      })
      .where(eq(wealth.id, id))
      .returning();
    return row;
  }

  async search(filters: WealthSearchFilters): Promise<WealthSearchResult> {
    const scopeCommunityIds = filters.communityId ? [filters.communityId] : filters.communityIds;
    if (!scopeCommunityIds || scopeCommunityIds.length === 0) {
      return { rows: [], total: 0 };
    }

    const whereParts: any[] = [inArray(wealth.communityId, scopeCommunityIds)];

    if (filters.status) {
      whereParts.push(eq(wealth.status, filters.status));
    }
    if (filters.durationType) {
      whereParts.push(eq(wealth.durationType, filters.durationType));
    }
    if (filters.distributionType) {
      whereParts.push(eq(wealth.distributionType, filters.distributionType));
    }
    if (filters.endDateAfter) {
      whereParts.push(gte(wealth.endDate, filters.endDateAfter));
    }
    if (filters.endDateBefore) {
      whereParts.push(lte(wealth.endDate, filters.endDateBefore));
    }

    if (filters.q && filters.q.trim().length > 0) {
      const q = `%${filters.q.trim()}%`;
      whereParts.push(or(ilike(wealth.title, q), ilike(wealth.description, q)));
    }

    const where = and(...whereParts);

    // total count
    const [{ count }] = await this.db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(wealth)
      .where(where);

    // rows with pagination
    const limit = Math.max(1, Math.min(filters.limit ?? 20, 100));
    const offset = Math.max(0, filters.offset ?? 0);

    const rows = await this.db
      .select()
      .from(wealth)
      .where(where)
      .orderBy(desc(wealth.createdAt))
      .limit(limit)
      .offset(offset);

    return { rows, total: count ?? 0 };
  }

  // Wealth Requests
  async createWealthRequest(input: CreateWealthRequestInput): Promise<WealthRequestRecord> {
    const [row] = await this.db
      .insert(wealthRequests)
      .values({
        wealthId: input.wealthId,
        requesterId: input.requesterId,
        message: input.message,
        unitsRequested: input.unitsRequested,
      })
      .returning();
    return row;
  }

  async listRequestsForWealth(wealthId: string): Promise<WealthRequestRecord[]> {
    return await this.db
      .select()
      .from(wealthRequests)
      .where(eq(wealthRequests.wealthId, wealthId))
      .orderBy(desc(wealthRequests.createdAt));
  }

  async listRequestsForWealthByRequester(
    wealthId: string,
    requesterId: string
  ): Promise<WealthRequestRecord[]> {
    return await this.db
      .select()
      .from(wealthRequests)
      .where(
        and(eq(wealthRequests.wealthId, wealthId), eq(wealthRequests.requesterId, requesterId))
      )
      .orderBy(desc(wealthRequests.createdAt));
  }

  async listRequestsByUser(
    requesterId: string,
    statuses?: (typeof wealthRequestStatusEnum.enumValues)[number][]
  ): Promise<WealthRequestRecord[]> {
    // Join with wealth to exclude pool distribution requests (where sourcePoolId is not null)
    const whereParts: any[] = [
      eq(wealthRequests.requesterId, requesterId),
      isNull(wealth.sourcePoolId), // Exclude pool distributions
    ];

    if (statuses && statuses.length > 0) {
      whereParts.push(inArray(wealthRequests.status, statuses as any));
    }

    const query = this.db
      .select({
        id: wealthRequests.id,
        wealthId: wealthRequests.wealthId,
        requesterId: wealthRequests.requesterId,
        message: wealthRequests.message,
        unitsRequested: wealthRequests.unitsRequested,
        status: wealthRequests.status,
        createdAt: wealthRequests.createdAt,
        updatedAt: wealthRequests.updatedAt,
      })
      .from(wealthRequests)
      .innerJoin(wealth, eq(wealthRequests.wealthId, wealth.id))
      .where(and(...whereParts))
      .orderBy(desc(wealthRequests.createdAt));

    return await query;
  }

  async listIncomingRequestsByOwner(
    ownerId: string,
    statuses?: (typeof wealthRequestStatusEnum.enumValues)[number][]
  ): Promise<WealthRequestRecord[]> {
    // Join wealthRequests with wealth to filter by owner
    // Exclude pool distribution requests (where sourcePoolId is not null)
    const whereParts: any[] = [
      eq(wealth.createdBy, ownerId),
      isNull(wealth.sourcePoolId), // Exclude pool distributions
    ];

    if (statuses && statuses.length > 0) {
      whereParts.push(inArray(wealthRequests.status, statuses as any));
    }

    const query = this.db
      .select({
        id: wealthRequests.id,
        wealthId: wealthRequests.wealthId,
        requesterId: wealthRequests.requesterId,
        message: wealthRequests.message,
        unitsRequested: wealthRequests.unitsRequested,
        status: wealthRequests.status,
        createdAt: wealthRequests.createdAt,
        updatedAt: wealthRequests.updatedAt,
      })
      .from(wealthRequests)
      .innerJoin(wealth, eq(wealthRequests.wealthId, wealth.id))
      .where(and(...whereParts))
      .orderBy(desc(wealthRequests.createdAt));

    return await query;
  }

  async listPoolDistributionRequests(
    requesterId: string,
    statuses?: (typeof wealthRequestStatusEnum.enumValues)[number][]
  ): Promise<PoolDistributionRequestRecord[]> {
    // Join wealthRequests with wealth and pools to get pool distribution requests
    // Only includes requests where wealth.sourcePoolId IS NOT NULL
    const whereParts: any[] = [
      eq(wealthRequests.requesterId, requesterId),
      isNotNull(wealth.sourcePoolId), // Only pool distributions
    ];

    if (statuses && statuses.length > 0) {
      whereParts.push(inArray(wealthRequests.status, statuses as any));
    }

    const query = this.db
      .select({
        id: wealthRequests.id,
        wealthId: wealthRequests.wealthId,
        requesterId: wealthRequests.requesterId,
        message: wealthRequests.message,
        unitsRequested: wealthRequests.unitsRequested,
        status: wealthRequests.status,
        createdAt: wealthRequests.createdAt,
        updatedAt: wealthRequests.updatedAt,
        sourcePoolId: wealth.sourcePoolId,
        poolName: pools.name,
        wealthTitle: wealth.title,
      })
      .from(wealthRequests)
      .innerJoin(wealth, eq(wealthRequests.wealthId, wealth.id))
      .leftJoin(pools, eq(wealth.sourcePoolId, pools.id))
      .where(and(...whereParts))
      .orderBy(desc(wealthRequests.createdAt));

    return await query;
  }

  async findRequestById(id: string): Promise<WealthRequestRecord | undefined> {
    const [row] = await this.db.select().from(wealthRequests).where(eq(wealthRequests.id, id));
    return row;
  }

  async acceptRequest(requestId: string): Promise<WealthRequestRecord | undefined> {
    const [row] = await this.db
      .update(wealthRequests)
      .set({ status: 'accepted', updatedAt: new Date() })
      .where(eq(wealthRequests.id, requestId))
      .returning();
    return row;
  }

  async rejectRequest(requestId: string): Promise<WealthRequestRecord | undefined> {
    const [row] = await this.db
      .update(wealthRequests)
      .set({ status: 'rejected', updatedAt: new Date() })
      .where(eq(wealthRequests.id, requestId))
      .returning();
    return row;
  }

  async cancelRequest(requestId: string): Promise<WealthRequestRecord | undefined> {
    const [row] = await this.db
      .update(wealthRequests)
      .set({ status: 'cancelled', updatedAt: new Date() })
      .where(eq(wealthRequests.id, requestId))
      .returning();
    return row;
  }

  async markRequestFulfilled(requestId: string): Promise<WealthRequestRecord | undefined> {
    const [row] = await this.db
      .update(wealthRequests)
      .set({ status: 'fulfilled', updatedAt: new Date() })
      .where(eq(wealthRequests.id, requestId))
      .returning();
    return row;
  }

  async confirmRequest(requestId: string): Promise<WealthRequestRecord | undefined> {
    const [row] = await this.db
      .update(wealthRequests)
      .set({ status: 'fulfilled', updatedAt: new Date() })
      .where(eq(wealthRequests.id, requestId))
      .returning();
    return row;
  }

  async failRequest(requestId: string): Promise<WealthRequestRecord | undefined> {
    const [row] = await this.db
      .update(wealthRequests)
      .set({ status: 'failed', updatedAt: new Date() })
      .where(eq(wealthRequests.id, requestId))
      .returning();
    return row;
  }

  // Recurrent Wealth Methods

  /**
   * Find all wealth items that are due for replenishment
   * @param currentDate - The current date to compare against nextReplenishmentDate
   * @returns Array of wealth records that need replenishment
   */
  async findDueForReplenishment(currentDate: Date = new Date()): Promise<WealthRecord[]> {
    return await this.db
      .select()
      .from(wealth)
      .where(
        and(
          eq(wealth.isRecurrent, true),
          eq(wealth.status, 'active'),
          lte(wealth.nextReplenishmentDate, currentDate)
        )
      );
  }

  /**
   * Replenish a wealth item by adding units and updating replenishment dates
   * @param id - Wealth item ID
   * @param unitsToAdd - Number of units to add
   * @param frequency - Recurrent frequency ('weekly' or 'monthly')
   * @returns Updated wealth record
   */
  async replenishWealth(
    id: string,
    unitsToAdd: number,
    frequency: 'weekly' | 'monthly'
  ): Promise<WealthRecord | undefined> {
    const now = new Date();
    const nextReplenishment = this.calculateNextReplenishmentDate(now, frequency);

    const [row] = await this.db
      .update(wealth)
      .set({
        unitsAvailable: sql`${wealth.unitsAvailable} + ${unitsToAdd}`,
        lastReplenishedAt: now,
        nextReplenishmentDate: nextReplenishment,
        updatedAt: now,
      })
      .where(eq(wealth.id, id))
      .returning();

    return row;
  }

  /**
   * Get a wealth item with its associated item details (including kind)
   * @param wealthId - Wealth item ID
   * @returns Wealth record with item details
   */
  async findByIdWithItem(wealthId: string): Promise<
    | {
        wealth: WealthRecord;
        item: typeof items.$inferSelect;
      }
    | undefined
  > {
    const [result] = await this.db
      .select({
        wealth: wealth,
        item: items,
      })
      .from(wealth)
      .innerJoin(items, eq(wealth.itemId, items.id))
      .where(eq(wealth.id, wealthId));

    return result;
  }

  /**
   * Calculate the next replenishment date based on frequency
   * @param fromDate - Starting date
   * @param frequency - 'weekly' or 'monthly'
   * @returns Next replenishment date
   */
  private calculateNextReplenishmentDate(fromDate: Date, frequency: 'weekly' | 'monthly'): Date {
    const nextDate = new Date(fromDate);
    if (frequency === 'weekly') {
      nextDate.setDate(nextDate.getDate() + 7);
    } else if (frequency === 'monthly') {
      nextDate.setMonth(nextDate.getMonth() + 1);
    }
    return nextDate;
  }

  /**
   * Get all wealth contributions to a specific pool
   * @param poolId - Pool ID
   * @returns Array of wealth records that are contributions to the pool
   */
  async getContributionsByPoolId(poolId: string): Promise<WealthRecord[]> {
    return await this.db
      .select()
      .from(wealth)
      .where(eq(wealth.targetPoolId, poolId))
      .orderBy(desc(wealth.createdAt));
  }

  /**
   * Get all wealth distributions from a specific pool with item details and recipient info
   * @param poolId - Pool ID
   * @returns Array of wealth records that are distributions from the pool
   */
  async getDistributionsByPoolId(poolId: string): Promise<WealthRecord[]> {
    const results = await this.db
      .select({
        wealth: wealth,
        item: items,
        wealthRequest: wealthRequests,
      })
      .from(wealth)
      .leftJoin(items, eq(wealth.itemId, items.id))
      .leftJoin(wealthRequests, eq(wealth.id, wealthRequests.wealthId))
      .where(eq(wealth.sourcePoolId, poolId))
      .orderBy(desc(wealth.createdAt));

    // Flatten the results to include item and request data in wealth object
    return results.map((row: any) => ({
      ...row.wealth,
      item: row.item,
      wealthRequest: row.wealthRequest,
    }));
  }

  /**
   * Get pending contributions to a pool (wealth requests not yet fulfilled) with item details
   * @param poolId - Pool ID
   * @returns Array of wealth records with item information
   */
  async getPendingContributionsByPoolId(poolId: string): Promise<WealthRecord[]> {
    const results = await this.db
      .select({
        wealth: wealth,
        item: items,
      })
      .from(wealth)
      .leftJoin(items, eq(wealth.itemId, items.id))
      .where(and(eq(wealth.targetPoolId, poolId), eq(wealth.status, 'active')))
      .orderBy(desc(wealth.createdAt));

    // Flatten the results to include item data in wealth object
    return results.map((row: any) => ({
      ...row.wealth,
      item: row.item,
    }));
  }
}

// Default instance for production code paths
export const wealthRepository = new WealthRepository(realDb);
