import { db as realDb } from '../db/index';
import { recognizedContributions, items, appUsers } from '../db/schema';
import { eq, and, isNull, desc, gte, sql, inArray } from 'drizzle-orm';

export type CreateRecognizedContributionDto = {
  communityId: string;
  contributorId: string;
  itemId: string; // Changed from categoryId to itemId (references items table)
  units: string;
  valuePerUnit: string;
  totalValue: string;
  description: string;
  verificationStatus?: 'auto_verified' | 'pending' | 'verified' | 'disputed';
  verifiedBy?: string;
  verifiedAt?: Date;
  beneficiaryIds?: string[];
  witnessIds?: string[];
  testimonial?: string;
  sourceType: 'system_logged' | 'peer_grant' | 'self_reported';
  sourceId?: string;
};

export type UpdateRecognizedContributionDto = {
  verificationStatus?: 'auto_verified' | 'pending' | 'verified' | 'disputed';
  verifiedBy?: string;
  verifiedAt?: Date;
  testimonial?: string;
};

type DbClient = typeof realDb;

export class RecognizedContributionRepository {
  private db: DbClient;

  constructor(db: DbClient) {
    this.db = db;
  }

  async create(data: CreateRecognizedContributionDto) {
    const [contribution] = await this.db.insert(recognizedContributions).values(data).returning();
    return contribution;
  }

  async findById(id: string) {
    const [contribution] = await this.db
      .select()
      .from(recognizedContributions)
      .where(and(eq(recognizedContributions.id, id), isNull(recognizedContributions.deletedAt)));
    return contribution;
  }

  async findByContributor(contributorId: string, communityId: string, limit = 50, offset = 0) {
    return await this.db
      .select({
        contribution: recognizedContributions,
        item: items,
      })
      .from(recognizedContributions)
      .leftJoin(items, eq(recognizedContributions.itemId, items.id))
      .where(
        and(
          eq(recognizedContributions.contributorId, contributorId),
          eq(recognizedContributions.communityId, communityId),
          isNull(recognizedContributions.deletedAt)
        )
      )
      .orderBy(desc(recognizedContributions.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async findPendingVerificationByBeneficiary(beneficiaryId: string, communityId: string) {
    return await this.db
      .select({
        contribution: recognizedContributions,
        item: items,
        contributor: appUsers,
      })
      .from(recognizedContributions)
      .leftJoin(items, eq(recognizedContributions.itemId, items.id))
      .leftJoin(appUsers, eq(recognizedContributions.contributorId, appUsers.id))
      .where(
        and(
          eq(recognizedContributions.communityId, communityId),
          eq(recognizedContributions.verificationStatus, 'pending'),
          isNull(recognizedContributions.deletedAt),
          sql`${beneficiaryId} = ANY(${recognizedContributions.beneficiaryIds})`
        )
      )
      .orderBy(desc(recognizedContributions.createdAt));
  }

  async findRecentByCommunity(communityId: string, limit = 100) {
    return await this.db
      .select({
        contribution: recognizedContributions,
        item: items,
        contributor: appUsers,
      })
      .from(recognizedContributions)
      .leftJoin(items, eq(recognizedContributions.itemId, items.id))
      .leftJoin(appUsers, eq(recognizedContributions.contributorId, appUsers.id))
      .where(
        and(
          eq(recognizedContributions.communityId, communityId),
          isNull(recognizedContributions.deletedAt)
        )
      )
      .orderBy(desc(recognizedContributions.createdAt))
      .limit(limit);
  }

  async findByItemAndDateRange(itemId: string, startDate: Date, endDate: Date) {
    return await this.db
      .select()
      .from(recognizedContributions)
      .where(
        and(
          eq(recognizedContributions.itemId, itemId),
          gte(recognizedContributions.createdAt, startDate),
          sql`${recognizedContributions.createdAt} <= ${endDate}`,
          isNull(recognizedContributions.deletedAt)
        )
      )
      .orderBy(desc(recognizedContributions.createdAt));
  }

  async findVerifiedSince(userId: string, communityId: string, since: Date) {
    return await this.db
      .select()
      .from(recognizedContributions)
      .where(
        and(
          eq(recognizedContributions.contributorId, userId),
          eq(recognizedContributions.communityId, communityId),
          inArray(recognizedContributions.verificationStatus, ['auto_verified', 'verified']),
          gte(recognizedContributions.createdAt, since),
          isNull(recognizedContributions.deletedAt)
        )
      );
  }

  async update(id: string, data: UpdateRecognizedContributionDto) {
    const [updated] = await this.db
      .update(recognizedContributions)
      .set(data)
      .where(and(eq(recognizedContributions.id, id), isNull(recognizedContributions.deletedAt)))
      .returning();
    return updated;
  }

  async delete(id: string) {
    const [deleted] = await this.db
      .update(recognizedContributions)
      .set({ deletedAt: new Date() })
      .where(eq(recognizedContributions.id, id))
      .returning();
    return deleted;
  }

  async getAggregateStatsByCommunity(communityId: string) {
    const [stats] = await this.db
      .select({
        totalValue: sql<string>`COALESCE(SUM(${recognizedContributions.totalValue}), 0)::text`,
        totalContributions: sql<number>`COUNT(*)::int`,
        uniqueContributors: sql<number>`COUNT(DISTINCT ${recognizedContributions.contributorId})::int`,
        verifiedCount: sql<number>`COUNT(CASE WHEN ${recognizedContributions.verificationStatus} IN ('auto_verified', 'verified') THEN 1 END)::int`,
        pendingCount: sql<number>`COUNT(CASE WHEN ${recognizedContributions.verificationStatus} = 'pending' THEN 1 END)::int`,
      })
      .from(recognizedContributions)
      .where(
        and(
          eq(recognizedContributions.communityId, communityId),
          isNull(recognizedContributions.deletedAt)
        )
      );

    return stats;
  }

  async getItemBreakdownByUser(userId: string, communityId: string, since?: Date) {
    const conditions = [
      eq(recognizedContributions.contributorId, userId),
      eq(recognizedContributions.communityId, communityId),
      inArray(recognizedContributions.verificationStatus, ['auto_verified', 'verified']),
      isNull(recognizedContributions.deletedAt),
    ];

    if (since) {
      conditions.push(gte(recognizedContributions.createdAt, since));
    }

    return await this.db
      .select({
        itemId: items.id,
        itemTranslations: items.translations,
        itemKind: items.kind,
        contributionMetadata: items.contributionMetadata,
        totalValue: sql<string>`SUM(${recognizedContributions.totalValue})::text`,
        contributionCount: sql<number>`COUNT(*)::int`,
      })
      .from(recognizedContributions)
      .leftJoin(items, eq(recognizedContributions.itemId, items.id))
      .where(and(...conditions))
      .groupBy(items.id, items.translations, items.kind, items.contributionMetadata);
  }
}

// Default instance for production code paths
export const recognizedContributionRepository = new RecognizedContributionRepository(realDb);
