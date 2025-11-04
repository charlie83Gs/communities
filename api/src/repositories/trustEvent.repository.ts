import { db } from '../db/index';
import { and, desc, eq, or } from 'drizzle-orm';
import { trustEvents } from '../db/schema/trustEvent.schema';

export type TrustEventType = 'share_redeemed' | 'posture_adjustment';

/**
 * TrustEventRepository
 * - Records trust-impacting events
 * - Lists events by user/community for audit/explanation endpoints
 */
export class TrustEventRepository {
  async create(params: {
    communityId: string;
    type: TrustEventType | string;
    entityType?: string | null;
    entityId?: string | null;
    actorUserId?: string | null;
    subjectUserIdA?: string | null;
    subjectUserIdB?: string | null;
    pointsDeltaA?: number;
    pointsDeltaB?: number;
  }) {
    const [row] = await db
      .insert(trustEvents)
      .values({
        communityId: params.communityId,
        type: params.type,
        entityType: params.entityType ?? null,
        entityId: params.entityId ?? null as any,
        actorUserId: params.actorUserId ?? null as any,
        subjectUserIdA: params.subjectUserIdA ?? null as any,
        subjectUserIdB: params.subjectUserIdB ?? null as any,
        pointsDeltaA: params.pointsDeltaA ?? 0,
        pointsDeltaB: params.pointsDeltaB ?? 0,
      })
      .returning();

    return row;
  }

  async listByUser(communityId: string, userId: string, limit = 50, offset = 0) {
    // Return events where the user appears as A or B
    return db
      .select()
      .from(trustEvents)
      .where(
        and(
          eq(trustEvents.communityId, communityId),
          or(
            eq(trustEvents.subjectUserIdA, userId),
            eq(trustEvents.subjectUserIdB, userId)
          )
        )
      )
      .orderBy(desc(trustEvents.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async listByUserB(communityId: string, userId: string, limit = 50, offset = 0) {
    return db
      .select()
      .from(trustEvents)
      .where(
        and(eq(trustEvents.communityId, communityId), eq(trustEvents.subjectUserIdB, userId))
      )
      .orderBy(desc(trustEvents.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async listByCommunity(communityId: string, limit = 100, offset = 0) {
    return db
      .select()
      .from(trustEvents)
      .where(eq(trustEvents.communityId, communityId))
      .orderBy(desc(trustEvents.createdAt))
      .limit(limit)
      .offset(offset);
  }

  async listByUserAllCommunities(userId: string, limit = 50, offset = 0) {
    return db
      .select()
      .from(trustEvents)
      .where(
        or(
          eq(trustEvents.subjectUserIdA, userId),
          eq(trustEvents.subjectUserIdB, userId)
        )
      )
      .orderBy(desc(trustEvents.createdAt))
      .limit(limit)
      .offset(offset);
  }
}

export const trustEventRepository = new TrustEventRepository();