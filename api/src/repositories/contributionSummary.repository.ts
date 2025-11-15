import { db as realDb } from '../db/index';
import { contributionSummary } from '../db/schema';
import { eq, and, inArray } from 'drizzle-orm';

export type CreateContributionSummaryDto = {
  communityId: string;
  userId: string;
  totalValue6Months?: string;
  totalValueLifetime?: string;
  categoryBreakdown?: string;
  lastContributionAt?: Date;
};

export type UpdateContributionSummaryDto = {
  totalValue6Months?: string;
  totalValueLifetime?: string;
  categoryBreakdown?: string;
  lastContributionAt?: Date;
  lastCalculatedAt?: Date;
};

type DbClient = typeof realDb;

export class ContributionSummaryRepository {
  private db: DbClient;

  constructor(db: DbClient) {
    this.db = db;
  }

  async create(data: CreateContributionSummaryDto) {
    const [summary] = await this.db.insert(contributionSummary).values(data).returning();
    return summary;
  }

  async findByUserAndCommunity(userId: string, communityId: string) {
    const [summary] = await this.db
      .select()
      .from(contributionSummary)
      .where(
        and(
          eq(contributionSummary.userId, userId),
          eq(contributionSummary.communityId, communityId)
        )
      );
    return summary;
  }

  async findByCommunity(communityId: string) {
    return await this.db
      .select()
      .from(contributionSummary)
      .where(eq(contributionSummary.communityId, communityId));
  }

  async findByUsers(userIds: string[], communityId: string) {
    return await this.db
      .select()
      .from(contributionSummary)
      .where(
        and(
          inArray(contributionSummary.userId, userIds),
          eq(contributionSummary.communityId, communityId)
        )
      );
  }

  async update(userId: string, communityId: string, data: UpdateContributionSummaryDto) {
    const [updated] = await this.db
      .update(contributionSummary)
      .set(data)
      .where(
        and(
          eq(contributionSummary.userId, userId),
          eq(contributionSummary.communityId, communityId)
        )
      )
      .returning();
    return updated;
  }

  async upsert(userId: string, communityId: string, data: UpdateContributionSummaryDto) {
    // Try to update first
    const existing = await this.findByUserAndCommunity(userId, communityId);

    if (existing) {
      return await this.update(userId, communityId, data);
    }

    // Create if doesn't exist
    return await this.create({
      userId,
      communityId,
      ...data,
    });
  }

  async delete(userId: string, communityId: string) {
    const [deleted] = await this.db
      .delete(contributionSummary)
      .where(
        and(
          eq(contributionSummary.userId, userId),
          eq(contributionSummary.communityId, communityId)
        )
      )
      .returning();
    return deleted;
  }
}

// Default instance for production code paths
export const contributionSummaryRepository = new ContributionSummaryRepository(realDb);
