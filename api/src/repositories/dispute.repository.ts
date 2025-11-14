import { db as realDb } from '@db/index';
type DbClient = typeof realDb;

import {
  disputes,
  disputeParticipants,
  disputeMediators,
  disputeResolutions,
  disputeMessages,
  disputeHistory,
} from '@db/schema';
import { eq, and, or, inArray, desc, sql } from 'drizzle-orm';

export type DisputeRecord = typeof disputes.$inferSelect;
export type DisputeParticipantRecord = typeof disputeParticipants.$inferSelect;
export type DisputeMediatorRecord = typeof disputeMediators.$inferSelect;
export type DisputeResolutionRecord = typeof disputeResolutions.$inferSelect;
export type DisputeMessageRecord = typeof disputeMessages.$inferSelect;
export type DisputeHistoryRecord = typeof disputeHistory.$inferSelect;

export type CreateDisputeDto = {
  communityId: string;
  title: string;
  description: string;
  createdBy: string;
};

export type UpdateDisputeDto = {
  title?: string;
  description?: string;
  status?: 'open' | 'in_mediation' | 'resolved' | 'closed';
  resolvedAt?: Date | null;
};

export type AddParticipantDto = {
  disputeId: string;
  userId: string;
  role: 'initiator' | 'participant';
  addedBy: string;
};

export type ProposeMediatorDto = {
  disputeId: string;
  userId: string;
};

export type RespondToMediatorDto = {
  mediatorId: string;
  status: 'accepted' | 'rejected' | 'withdrawn';
  respondedBy: string;
};

export type CreateResolutionDto = {
  disputeId: string;
  resolutionType: 'open' | 'closed';
  resolution: string;
  createdBy: string;
  isPublic: boolean;
};

export type CreateMessageDto = {
  disputeId: string;
  userId: string;
  message: string;
  visibleToParticipants?: boolean;
  visibleToMediators?: boolean;
};

export type CreateHistoryDto = {
  disputeId: string;
  action: string;
  performedBy: string;
  metadata?: string;
};

export class DisputeRepository {
  private db: DbClient;

  constructor(db: DbClient) {
    this.db = db;
  }

  // ===== DISPUTES =====

  async createDispute(data: CreateDisputeDto): Promise<DisputeRecord> {
    const [dispute] = await this.db
      .insert(disputes)
      .values({
        communityId: data.communityId,
        title: data.title,
        description: data.description,
        createdBy: data.createdBy,
        status: 'open',
      })
      .returning();
    return dispute;
  }

  async findDisputeById(id: string): Promise<DisputeRecord | undefined> {
    const [dispute] = await this.db.select().from(disputes).where(eq(disputes.id, id));
    return dispute;
  }

  async findDisputesByCommunity(
    communityId: string,
    options: { limit?: number; offset?: number; status?: string } = {}
  ): Promise<{ disputes: DisputeRecord[]; total: number }> {
    const { limit = 20, offset = 0, status } = options;

    const conditions = [eq(disputes.communityId, communityId)];
    if (status) {
      conditions.push(eq(disputes.status, status as any));
    }

    const disputesResult = await this.db
      .select()
      .from(disputes)
      .where(and(...conditions))
      .orderBy(desc(disputes.createdAt))
      .limit(limit)
      .offset(offset);

    const [{ count }] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(disputes)
      .where(and(...conditions));

    return { disputes: disputesResult, total: count };
  }

  async findDisputesByIds(ids: string[]): Promise<DisputeRecord[]> {
    if (ids.length === 0) return [];
    return await this.db.select().from(disputes).where(inArray(disputes.id, ids));
  }

  async updateDispute(id: string, data: UpdateDisputeDto): Promise<DisputeRecord | undefined> {
    const [updated] = await this.db
      .update(disputes)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(disputes.id, id))
      .returning();
    return updated;
  }

  async deleteDispute(id: string): Promise<DisputeRecord | undefined> {
    const [deleted] = await this.db.delete(disputes).where(eq(disputes.id, id)).returning();
    return deleted;
  }

  // ===== PARTICIPANTS =====

  async addParticipant(data: AddParticipantDto): Promise<DisputeParticipantRecord> {
    const [participant] = await this.db
      .insert(disputeParticipants)
      .values({
        disputeId: data.disputeId,
        userId: data.userId,
        role: data.role,
        addedBy: data.addedBy,
      })
      .returning();
    return participant;
  }

  async findParticipantsByDispute(disputeId: string): Promise<DisputeParticipantRecord[]> {
    return await this.db
      .select()
      .from(disputeParticipants)
      .where(eq(disputeParticipants.disputeId, disputeId));
  }

  async findParticipant(
    disputeId: string,
    userId: string
  ): Promise<DisputeParticipantRecord | undefined> {
    const [participant] = await this.db
      .select()
      .from(disputeParticipants)
      .where(
        and(eq(disputeParticipants.disputeId, disputeId), eq(disputeParticipants.userId, userId))
      );
    return participant;
  }

  async removeParticipant(disputeId: string, userId: string): Promise<void> {
    await this.db
      .delete(disputeParticipants)
      .where(
        and(eq(disputeParticipants.disputeId, disputeId), eq(disputeParticipants.userId, userId))
      );
  }

  async isParticipant(disputeId: string, userId: string): Promise<boolean> {
    const participant = await this.findParticipant(disputeId, userId);
    return !!participant;
  }

  // ===== MEDIATORS =====

  async proposeMediator(data: ProposeMediatorDto): Promise<DisputeMediatorRecord> {
    const [mediator] = await this.db
      .insert(disputeMediators)
      .values({
        disputeId: data.disputeId,
        userId: data.userId,
        status: 'proposed',
      })
      .returning();
    return mediator;
  }

  async findMediatorsByDispute(disputeId: string): Promise<DisputeMediatorRecord[]> {
    return await this.db
      .select()
      .from(disputeMediators)
      .where(eq(disputeMediators.disputeId, disputeId))
      .orderBy(desc(disputeMediators.proposedAt));
  }

  async findMediatorProposal(
    disputeId: string,
    userId: string
  ): Promise<DisputeMediatorRecord | undefined> {
    const [mediator] = await this.db
      .select()
      .from(disputeMediators)
      .where(and(eq(disputeMediators.disputeId, disputeId), eq(disputeMediators.userId, userId)));
    return mediator;
  }

  async findMediatorById(id: string): Promise<DisputeMediatorRecord | undefined> {
    const [mediator] = await this.db
      .select()
      .from(disputeMediators)
      .where(eq(disputeMediators.id, id));
    return mediator;
  }

  async updateMediatorStatus(
    id: string,
    data: RespondToMediatorDto
  ): Promise<DisputeMediatorRecord | undefined> {
    const [updated] = await this.db
      .update(disputeMediators)
      .set({
        status: data.status,
        respondedAt: new Date(),
        respondedBy: data.respondedBy,
      })
      .where(eq(disputeMediators.id, id))
      .returning();
    return updated;
  }

  async getAcceptedMediators(disputeId: string): Promise<DisputeMediatorRecord[]> {
    return await this.db
      .select()
      .from(disputeMediators)
      .where(
        and(eq(disputeMediators.disputeId, disputeId), eq(disputeMediators.status, 'accepted'))
      );
  }

  async isAcceptedMediator(disputeId: string, userId: string): Promise<boolean> {
    const [mediator] = await this.db
      .select()
      .from(disputeMediators)
      .where(
        and(
          eq(disputeMediators.disputeId, disputeId),
          eq(disputeMediators.userId, userId),
          eq(disputeMediators.status, 'accepted')
        )
      );
    return !!mediator;
  }

  // ===== RESOLUTIONS =====

  async createResolution(data: CreateResolutionDto): Promise<DisputeResolutionRecord> {
    const [resolution] = await this.db
      .insert(disputeResolutions)
      .values({
        disputeId: data.disputeId,
        resolutionType: data.resolutionType,
        resolution: data.resolution,
        createdBy: data.createdBy,
        isPublic: data.isPublic,
      })
      .returning();
    return resolution;
  }

  async findResolutionsByDispute(disputeId: string): Promise<DisputeResolutionRecord[]> {
    return await this.db
      .select()
      .from(disputeResolutions)
      .where(eq(disputeResolutions.disputeId, disputeId))
      .orderBy(desc(disputeResolutions.createdAt));
  }

  async findResolutionById(id: string): Promise<DisputeResolutionRecord | undefined> {
    const [resolution] = await this.db
      .select()
      .from(disputeResolutions)
      .where(eq(disputeResolutions.id, id));
    return resolution;
  }

  // ===== MESSAGES =====

  async createMessage(data: CreateMessageDto): Promise<DisputeMessageRecord> {
    const [message] = await this.db
      .insert(disputeMessages)
      .values({
        disputeId: data.disputeId,
        userId: data.userId,
        message: data.message,
        visibleToParticipants: data.visibleToParticipants ?? true,
        visibleToMediators: data.visibleToMediators ?? true,
      })
      .returning();
    return message;
  }

  async findMessagesByDispute(
    disputeId: string,
    options: { limit?: number; offset?: number } = {}
  ): Promise<{ messages: DisputeMessageRecord[]; total: number }> {
    const { limit = 50, offset = 0 } = options;

    const messages = await this.db
      .select()
      .from(disputeMessages)
      .where(eq(disputeMessages.disputeId, disputeId))
      .orderBy(desc(disputeMessages.createdAt))
      .limit(limit)
      .offset(offset);

    const [{ count }] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(disputeMessages)
      .where(eq(disputeMessages.disputeId, disputeId));

    return { messages, total: count };
  }

  // ===== HISTORY =====

  async createHistory(data: CreateHistoryDto): Promise<DisputeHistoryRecord> {
    const [history] = await this.db
      .insert(disputeHistory)
      .values({
        disputeId: data.disputeId,
        action: data.action,
        performedBy: data.performedBy,
        metadata: data.metadata,
      })
      .returning();
    return history;
  }

  async findHistoryByDispute(disputeId: string): Promise<DisputeHistoryRecord[]> {
    return await this.db
      .select()
      .from(disputeHistory)
      .where(eq(disputeHistory.disputeId, disputeId))
      .orderBy(desc(disputeHistory.performedAt));
  }

  // ===== UTILITY METHODS =====

  async getUserDisputesAsMediatorOrParticipant(userId: string): Promise<string[]> {
    // Get disputes where user is a participant
    const participantDisputes = await this.db
      .select({ id: disputeParticipants.disputeId })
      .from(disputeParticipants)
      .where(eq(disputeParticipants.userId, userId));

    // Get disputes where user is an accepted mediator
    const mediatorDisputes = await this.db
      .select({ id: disputeMediators.disputeId })
      .from(disputeMediators)
      .where(and(eq(disputeMediators.userId, userId), eq(disputeMediators.status, 'accepted')));

    const disputeIds = [
      ...participantDisputes.map((d) => d.id),
      ...mediatorDisputes.map((d) => d.id),
    ];

    return [...new Set(disputeIds)];
  }
}

export const disputeRepository = new DisputeRepository(realDb);
