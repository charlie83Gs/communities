import { db as realDb } from '../db/index';
import { valueCalibrationHistory, items, appUsers } from '../db/schema';
import { eq, desc } from 'drizzle-orm';

export type CreateValueCalibrationDto = {
  communityId: string;
  itemId: string;
  oldValuePerUnit: string;
  newValuePerUnit: string;
  reason?: string;
  proposedBy?: string;
  decidedThrough?: string; // 'council', 'community_poll', 'consensus'
  effectiveDate: Date;
};

type DbClient = typeof realDb;

export class ValueCalibrationRepository {
  private db: DbClient;

  constructor(db: DbClient) {
    this.db = db;
  }

  async create(data: CreateValueCalibrationDto) {
    const [calibration] = await this.db.insert(valueCalibrationHistory).values(data).returning();
    return calibration;
  }

  async findById(id: string) {
    const [calibration] = await this.db
      .select()
      .from(valueCalibrationHistory)
      .where(eq(valueCalibrationHistory.id, id));
    return calibration;
  }

  async findByItem(itemId: string) {
    return await this.db
      .select({
        calibration: valueCalibrationHistory,
        proposer: appUsers,
      })
      .from(valueCalibrationHistory)
      .leftJoin(appUsers, eq(valueCalibrationHistory.proposedBy, appUsers.id))
      .where(eq(valueCalibrationHistory.itemId, itemId))
      .orderBy(desc(valueCalibrationHistory.decidedAt));
  }

  async findByCommunity(communityId: string) {
    return await this.db
      .select({
        calibration: valueCalibrationHistory,
        item: items,
        proposer: appUsers,
      })
      .from(valueCalibrationHistory)
      .leftJoin(items, eq(valueCalibrationHistory.itemId, items.id))
      .leftJoin(appUsers, eq(valueCalibrationHistory.proposedBy, appUsers.id))
      .where(eq(valueCalibrationHistory.communityId, communityId))
      .orderBy(desc(valueCalibrationHistory.decidedAt));
  }

  async findRecentByCommunity(communityId: string, limit = 50) {
    return await this.db
      .select({
        calibration: valueCalibrationHistory,
        item: items,
        proposer: appUsers,
      })
      .from(valueCalibrationHistory)
      .leftJoin(items, eq(valueCalibrationHistory.itemId, items.id))
      .leftJoin(appUsers, eq(valueCalibrationHistory.proposedBy, appUsers.id))
      .where(eq(valueCalibrationHistory.communityId, communityId))
      .orderBy(desc(valueCalibrationHistory.decidedAt))
      .limit(limit);
  }
}

// Default instance for production code paths
export const valueCalibrationRepository = new ValueCalibrationRepository(realDb);
