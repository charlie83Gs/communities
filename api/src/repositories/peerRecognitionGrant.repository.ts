import { db as realDb } from '../db/index';
import { peerRecognitionGrants, appUsers } from '../db/schema';
import { eq, and, sql, desc } from 'drizzle-orm';

export type CreatePeerRecognitionGrantDto = {
  communityId: string;
  fromUserId: string;
  toUserId: string;
  valueUnits: string;
  description: string;
  monthYear: string; // 'YYYY-MM'
};

type DbClient = typeof realDb;

export class PeerRecognitionGrantRepository {
  private db: DbClient;

  constructor(db: DbClient) {
    this.db = db;
  }

  async create(data: CreatePeerRecognitionGrantDto) {
    const [grant] = await this.db.insert(peerRecognitionGrants).values(data).returning();
    return grant;
  }

  async findById(id: string) {
    const [grant] = await this.db
      .select()
      .from(peerRecognitionGrants)
      .where(eq(peerRecognitionGrants.id, id));
    return grant;
  }

  async findByToUser(toUserId: string, communityId: string, limit = 50) {
    return await this.db
      .select({
        grant: peerRecognitionGrants,
        fromUser: appUsers,
      })
      .from(peerRecognitionGrants)
      .leftJoin(appUsers, eq(peerRecognitionGrants.fromUserId, appUsers.id))
      .where(
        and(
          eq(peerRecognitionGrants.toUserId, toUserId),
          eq(peerRecognitionGrants.communityId, communityId)
        )
      )
      .orderBy(desc(peerRecognitionGrants.createdAt))
      .limit(limit);
  }

  async findByFromUserAndMonth(fromUserId: string, communityId: string, monthYear: string) {
    return await this.db
      .select()
      .from(peerRecognitionGrants)
      .where(
        and(
          eq(peerRecognitionGrants.fromUserId, fromUserId),
          eq(peerRecognitionGrants.communityId, communityId),
          eq(peerRecognitionGrants.monthYear, monthYear)
        )
      );
  }

  async getMonthlyTotalByFromUser(fromUserId: string, communityId: string, monthYear: string) {
    const [result] = await this.db
      .select({
        totalGranted: sql<string>`COALESCE(SUM(${peerRecognitionGrants.valueUnits}), 0)::text`,
        grantCount: sql<number>`COUNT(*)::int`,
      })
      .from(peerRecognitionGrants)
      .where(
        and(
          eq(peerRecognitionGrants.fromUserId, fromUserId),
          eq(peerRecognitionGrants.communityId, communityId),
          eq(peerRecognitionGrants.monthYear, monthYear)
        )
      );

    return result;
  }

  async getGrantsToSamePersonInMonth(
    fromUserId: string,
    toUserId: string,
    communityId: string,
    monthYear: string
  ) {
    return await this.db
      .select()
      .from(peerRecognitionGrants)
      .where(
        and(
          eq(peerRecognitionGrants.fromUserId, fromUserId),
          eq(peerRecognitionGrants.toUserId, toUserId),
          eq(peerRecognitionGrants.communityId, communityId),
          eq(peerRecognitionGrants.monthYear, monthYear)
        )
      );
  }

  async getRecentByCommunity(communityId: string, limit = 100) {
    return await this.db
      .select({
        grant: peerRecognitionGrants,
        fromUser: appUsers,
        toUser: {
          id: sql<string>`to_users.id`,
          username: sql<string>`to_users.username`,
          displayName: sql<string>`to_users.display_name`,
        },
      })
      .from(peerRecognitionGrants)
      .leftJoin(appUsers, eq(peerRecognitionGrants.fromUserId, appUsers.id))
      .leftJoin(sql`app_users as to_users`, sql`${peerRecognitionGrants.toUserId} = to_users.id`)
      .where(eq(peerRecognitionGrants.communityId, communityId))
      .orderBy(desc(peerRecognitionGrants.createdAt))
      .limit(limit);
  }
}

// Default instance for production code paths
export const peerRecognitionGrantRepository = new PeerRecognitionGrantRepository(realDb);
