import { db as realDb } from '../db/index';
import { councils, councilManagers, councilTrustScores } from '../db/schema';
import { eq, and, isNull, sql } from 'drizzle-orm';

export type Council = {
  id: string;
  communityId: string;
  name: string;
  description: string;
  trustScore: number;
  memberCount: number;
  createdAt: Date | null;
  createdBy: string;
};

export class CouncilsRepository {
  private db: DbClient;

  constructor(db: DbClient) {
    this.db = db;
  }

  /**
   * Get councils managed by a specific user in a community
   * @param communityId - The community ID
   * @param userId - The user ID
   * @returns Array of councils where user is a manager
   */
  async getManagedCouncilsByUser(communityId: string, userId: string): Promise<Council[]> {
    const result = await this.db
      .select({
        id: councils.id,
        communityId: councils.communityId,
        name: councils.name,
        description: councils.description,
        createdAt: councils.createdAt,
        createdBy: councils.createdBy,
        trustScore: sql<number>`COALESCE(${councilTrustScores.trustScore}, 0)`,
      })
      .from(councils)
      .innerJoin(councilManagers, eq(councils.id, councilManagers.councilId))
      .leftJoin(councilTrustScores, eq(councils.id, councilTrustScores.councilId))
      .where(
        and(
          eq(councils.communityId, communityId),
          eq(councilManagers.userId, userId),
          isNull(councils.deletedAt)
        )
      )
      .orderBy(councils.createdAt);

    // Add member count for each council
    const councilsWithCounts = await Promise.all(
      result.map(async (council) => {
        const [{ count }] = await this.db
          .select({ count: sql<number>`cast(count(*) as int)` })
          .from(councilManagers)
          .where(eq(councilManagers.councilId, council.id));

        return {
          ...council,
          memberCount: count ?? 0,
        };
      })
    );

    return councilsWithCounts;
  }
}

// Default instance for production code paths
export const councilsRepository = new CouncilsRepository(realDb);
