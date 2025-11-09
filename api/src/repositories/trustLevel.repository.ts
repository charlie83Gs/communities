import { db as realDb } from '../db/index';
import { trustLevels } from '../db/schema';
import { eq, and, asc } from 'drizzle-orm';
import { CreateTrustLevelDto, UpdateTrustLevelDto, TrustLevel } from '../types/trustLevel.types';

export class TrustLevelRepository {
  private db: any;

  constructor(db: any) {
    this.db = db;
  }

  async create(communityId: string, data: CreateTrustLevelDto): Promise<TrustLevel> {
    const [trustLevel] = await this.db
      .insert(trustLevels)
      .values({
        communityId,
        ...data,
      })
      .returning();
    return trustLevel as TrustLevel;
  }

  async findById(id: string): Promise<TrustLevel | undefined> {
    const [trustLevel] = await this.db.select().from(trustLevels).where(eq(trustLevels.id, id));
    return trustLevel as TrustLevel | undefined;
  }

  async findByCommunityId(communityId: string): Promise<TrustLevel[]> {
    const levels = await this.db
      .select()
      .from(trustLevels)
      .where(eq(trustLevels.communityId, communityId))
      .orderBy(asc(trustLevels.threshold));
    return levels as TrustLevel[];
  }

  async findByName(communityId: string, name: string): Promise<TrustLevel | undefined> {
    const [trustLevel] = await this.db
      .select()
      .from(trustLevels)
      .where(and(eq(trustLevels.communityId, communityId), eq(trustLevels.name, name)));
    return trustLevel as TrustLevel | undefined;
  }

  async update(id: string, data: UpdateTrustLevelDto): Promise<TrustLevel | undefined> {
    const [updated] = await this.db
      .update(trustLevels)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(trustLevels.id, id))
      .returning();
    return updated as TrustLevel | undefined;
  }

  async delete(id: string): Promise<TrustLevel | undefined> {
    const [deleted] = await this.db.delete(trustLevels).where(eq(trustLevels.id, id)).returning();
    return deleted as TrustLevel | undefined;
  }

  async createDefaultLevels(communityId: string): Promise<TrustLevel[]> {
    const defaultLevels = [
      { name: 'New Member', threshold: 0 },
      { name: 'Known Member', threshold: 10 },
      { name: 'Trusted Member', threshold: 25 },
      { name: 'Advanced Member', threshold: 50 },
      { name: 'Community Expert', threshold: 100 },
      { name: 'Community Leader', threshold: 200 },
    ];

    const created = await this.db
      .insert(trustLevels)
      .values(
        defaultLevels.map((level) => ({
          communityId,
          ...level,
        }))
      )
      .returning();

    return created as TrustLevel[];
  }

  async deleteAllForCommunity(communityId: string): Promise<number> {
    const result = await this.db
      .delete(trustLevels)
      .where(eq(trustLevels.communityId, communityId));
    return result.length;
  }
}

// Default instance for production code paths
export const trustLevelRepository = new TrustLevelRepository(realDb);
