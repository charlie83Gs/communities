import { db } from '@db/index';
import {
  wealth,
  wealthRequests,
  wealthStatusEnum,
  wealthDistributionTypeEnum,
  wealthRequestStatusEnum,
} from '@db/schema/wealth.schema';
import { and, desc, eq, inArray, ilike, or, gte, lte, sql } from 'drizzle-orm';

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

export type WealthSearchFilters = {
  communityIds: string[]; // required scope filter
  communityId?: string; // optional explicit narrowing
  q?: string;
  durationType?: 'timebound' | 'unlimited';
  endDateAfter?: Date;
  endDateBefore?: Date;
  distributionType?: 'request_based' | 'unit_based';
  status?: (typeof wealthStatusEnum.enumValues)[number];
  limit?: number;
  offset?: number;
};

export type WealthSearchResult = {
  rows: WealthRecord[];
  total: number;
};

export class WealthRepository {
  // Wealth
  async createWealth(input: CreateWealthInput): Promise<WealthRecord> {
    const [row] = await db.insert(wealth).values(input).returning();
    return row;
  }

  async findById(id: string): Promise<WealthRecord | undefined> {
    const [row] = await db.select().from(wealth).where(eq(wealth.id, id));
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
    return await db.select().from(wealth).where(where).orderBy(desc(wealth.createdAt));
  }

  async listByCommunity(
    communityId: string,
    status?: (typeof wealthStatusEnum.enumValues)[number]
  ): Promise<WealthRecord[]> {
    const where = status
      ? and(eq(wealth.communityId, communityId), eq(wealth.status, status))
      : eq(wealth.communityId, communityId);
    return await db.select().from(wealth).where(where).orderBy(desc(wealth.createdAt));
  }

  async updateWealth(id: string, patch: UpdateWealthInput): Promise<WealthRecord | undefined> {
    const [row] = await db
      .update(wealth)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(wealth.id, id))
      .returning();
    return row;
  }

  async cancelWealth(id: string): Promise<WealthRecord | undefined> {
    const [row] = await db
      .update(wealth)
      .set({ status: 'cancelled', updatedAt: new Date() })
      .where(eq(wealth.id, id))
      .returning();
    return row;
  }

  async markFulfilled(id: string): Promise<WealthRecord | undefined> {
    const [row] = await db
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
    const [row] = await db
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
    const [{ count }] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(wealth)
      .where(where);

    // rows with pagination
    const limit = Math.max(1, Math.min(filters.limit ?? 20, 100));
    const offset = Math.max(0, filters.offset ?? 0);

    const rows = await db
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
    const [row] = await db
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
    return await db
      .select()
      .from(wealthRequests)
      .where(eq(wealthRequests.wealthId, wealthId))
      .orderBy(desc(wealthRequests.createdAt));
  }

  async listRequestsForWealthByRequester(
    wealthId: string,
    requesterId: string
  ): Promise<WealthRequestRecord[]> {
    return await db
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
    const where =
      statuses && statuses.length > 0
        ? and(
            eq(wealthRequests.requesterId, requesterId),
            inArray(wealthRequests.status, statuses as any)
          )
        : eq(wealthRequests.requesterId, requesterId);

    return await db
      .select()
      .from(wealthRequests)
      .where(where)
      .orderBy(desc(wealthRequests.createdAt));
  }

  async listIncomingRequestsByOwner(
    ownerId: string,
    statuses?: (typeof wealthRequestStatusEnum.enumValues)[number][]
  ): Promise<WealthRequestRecord[]> {
    // Join wealthRequests with wealth to filter by owner
    const query = db
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
      .where(
        statuses && statuses.length > 0
          ? and(eq(wealth.createdBy, ownerId), inArray(wealthRequests.status, statuses as any))
          : eq(wealth.createdBy, ownerId)
      )
      .orderBy(desc(wealthRequests.createdAt));

    return await query;
  }

  async findRequestById(id: string): Promise<WealthRequestRecord | undefined> {
    const [row] = await db.select().from(wealthRequests).where(eq(wealthRequests.id, id));
    return row;
  }

  async acceptRequest(requestId: string): Promise<WealthRequestRecord | undefined> {
    const [row] = await db
      .update(wealthRequests)
      .set({ status: 'accepted', updatedAt: new Date() })
      .where(eq(wealthRequests.id, requestId))
      .returning();
    return row;
  }

  async rejectRequest(requestId: string): Promise<WealthRequestRecord | undefined> {
    const [row] = await db
      .update(wealthRequests)
      .set({ status: 'rejected', updatedAt: new Date() })
      .where(eq(wealthRequests.id, requestId))
      .returning();
    return row;
  }

  async cancelRequest(requestId: string): Promise<WealthRequestRecord | undefined> {
    const [row] = await db
      .update(wealthRequests)
      .set({ status: 'cancelled', updatedAt: new Date() })
      .where(eq(wealthRequests.id, requestId))
      .returning();
    return row;
  }

  async markRequestFulfilled(requestId: string): Promise<WealthRequestRecord | undefined> {
    const [row] = await db
      .update(wealthRequests)
      .set({ status: 'fulfilled', updatedAt: new Date() })
      .where(eq(wealthRequests.id, requestId))
      .returning();
    return row;
  }

  async confirmRequest(requestId: string): Promise<WealthRequestRecord | undefined> {
    const [row] = await db
      .update(wealthRequests)
      .set({ status: 'fulfilled', updatedAt: new Date() })
      .where(eq(wealthRequests.id, requestId))
      .returning();
    return row;
  }

  async failRequest(requestId: string): Promise<WealthRequestRecord | undefined> {
    const [row] = await db
      .update(wealthRequests)
      .set({ status: 'failed', updatedAt: new Date() })
      .where(eq(wealthRequests.id, requestId))
      .returning();
    return row;
  }
}

export const wealthRepository = new WealthRepository();
