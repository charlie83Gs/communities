import { db } from '../db/index';
import { trustLevels } from '../db/schema';
import { eq, and, asc } from 'drizzle-orm';
import { CreateTrustLevelDto, UpdateTrustLevelDto, TrustLevel } from '../types/trustLevel.types';

export class TrustLevelRepository {
  async create(communityId: string, data: CreateTrustLevelDto): Promise<TrustLevel> {
    const [trustLevel] = await db
      .insert(trustLevels)
      .values({
        communityId,
        ...data,
      })
      .returning();
    return trustLevel as TrustLevel;
  }

  async findById(id: string): Promise<TrustLevel | undefined> {
    const [trustLevel] = await db.select().from(trustLevels).where(eq(trustLevels.id, id));
    return trustLevel as TrustLevel | undefined;
  }

  async findByCommunityId(communityId: string): Promise<TrustLevel[]> {
    const levels = await db
      .select()
      .from(trustLevels)
      .where(eq(trustLevels.communityId, communityId))
      .orderBy(asc(trustLevels.threshold));
    return levels as TrustLevel[];
  }

  async findByName(communityId: string, name: string): Promise<TrustLevel | undefined> {
    const [trustLevel] = await db
      .select()
      .from(trustLevels)
      .where(and(eq(trustLevels.communityId, communityId), eq(trustLevels.name, name)));
    return trustLevel as TrustLevel | undefined;
  }

  async update(id: string, data: UpdateTrustLevelDto): Promise<TrustLevel | undefined> {
    const [updated] = await db
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
    const [deleted] = await db.delete(trustLevels).where(eq(trustLevels.id, id)).returning();
    return deleted as TrustLevel | undefined;
  }

  async createDefaultLevels(communityId: string): Promise<TrustLevel[]> {
    const defaultLevels = [
      { name: 'New', threshold: 0 },
      { name: 'Stable', threshold: 10 },
      { name: 'Trusted', threshold: 50 },
    ];

    const created = await db
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
    const result = await db.delete(trustLevels).where(eq(trustLevels.communityId, communityId));
    return result.length;
  }
}

export const trustLevelRepository = new TrustLevelRepository();
