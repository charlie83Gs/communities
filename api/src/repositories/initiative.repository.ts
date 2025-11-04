import { db } from '../db';
import {
  initiatives,
  initiativeReports,
  initiativeVotes,
  initiativeComments,
  initiativeReportComments,
} from '../db/schema';
import { eq, and, desc, sql, count } from 'drizzle-orm';
import {
  CreateInitiativeDto,
  UpdateInitiativeDto,
  CreateInitiativeReportDto,
} from '../types/initiative.types';

export class InitiativeRepository {
  /**
   * Create a new initiative
   */
  async create(councilId: string, communityId: string, data: CreateInitiativeDto, createdBy: string) {
    const [initiative] = await db
      .insert(initiatives)
      .values({
        councilId,
        communityId,
        title: data.title,
        description: data.description,
        createdBy,
      })
      .returning();

    return initiative;
  }

  /**
   * Find initiative by ID with vote counts and user's vote
   */
  async findById(id: string, userId?: string) {
    const [initiative] = await db
      .select()
      .from(initiatives)
      .where(eq(initiatives.id, id));

    if (!initiative) {
      return null;
    }

    // Get vote counts
    const [voteCounts] = await db
      .select({
        upvotes: sql<number>`COUNT(CASE WHEN ${initiativeVotes.voteType} = 'upvote' THEN 1 END)`,
        downvotes: sql<number>`COUNT(CASE WHEN ${initiativeVotes.voteType} = 'downvote' THEN 1 END)`,
      })
      .from(initiativeVotes)
      .where(eq(initiativeVotes.initiativeId, id));

    // Get user's vote if userId provided
    let userVote: 'upvote' | 'downvote' | null = null;
    if (userId) {
      const [vote] = await db
        .select()
        .from(initiativeVotes)
        .where(and(
          eq(initiativeVotes.initiativeId, id),
          eq(initiativeVotes.userId, userId)
        ));

      if (vote) {
        userVote = vote.voteType;
      }
    }

    return {
      ...initiative,
      upvotes: Number(voteCounts?.upvotes ?? 0),
      downvotes: Number(voteCounts?.downvotes ?? 0),
      userVote,
    };
  }

  /**
   * Find all initiatives by council
   */
  async findByCouncil(
    councilId: string,
    userId: string,
    options: {
      page?: number;
      limit?: number;
    } = {}
  ) {
    const { page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;

    // Get initiatives with vote counts
    const initiativesList = await db
      .select({
        initiative: initiatives,
        upvotes: sql<number>`COUNT(CASE WHEN ${initiativeVotes.voteType} = 'upvote' THEN 1 END)`,
        downvotes: sql<number>`COUNT(CASE WHEN ${initiativeVotes.voteType} = 'downvote' THEN 1 END)`,
      })
      .from(initiatives)
      .leftJoin(initiativeVotes, eq(initiatives.id, initiativeVotes.initiativeId))
      .where(eq(initiatives.councilId, councilId))
      .groupBy(initiatives.id)
      .orderBy(desc(initiatives.createdAt))
      .limit(limit)
      .offset(offset);

    // Get user votes for all initiatives in the list
    const initiativeIds = initiativesList.map(i => i.initiative.id);
    const userVotes = await db
      .select()
      .from(initiativeVotes)
      .where(and(
        sql`${initiativeVotes.initiativeId} = ANY(${initiativeIds})`,
        eq(initiativeVotes.userId, userId)
      ));

    const userVoteMap = new Map(
      userVotes.map(v => [v.initiativeId, v.voteType])
    );

    // Get total count
    const [{ count: total }] = await db
      .select({ count: count() })
      .from(initiatives)
      .where(eq(initiatives.councilId, councilId));

    return {
      initiatives: initiativesList.map(i => ({
        ...i.initiative,
        upvotes: Number(i.upvotes ?? 0),
        downvotes: Number(i.downvotes ?? 0),
        userVote: userVoteMap.get(i.initiative.id) ?? null,
      })),
      total: Number(total),
    };
  }

  /**
   * Update initiative
   */
  async update(id: string, data: UpdateInitiativeDto) {
    const [updated] = await db
      .update(initiatives)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(initiatives.id, id))
      .returning();

    return updated;
  }

  /**
   * Delete initiative
   */
  async delete(id: string) {
    const [deleted] = await db
      .delete(initiatives)
      .where(eq(initiatives.id, id))
      .returning();

    return deleted;
  }

  /**
   * Upsert vote on initiative
   */
  async vote(initiativeId: string, userId: string, voteType: 'upvote' | 'downvote') {
    // Check if vote exists
    const [existing] = await db
      .select()
      .from(initiativeVotes)
      .where(and(
        eq(initiativeVotes.initiativeId, initiativeId),
        eq(initiativeVotes.userId, userId)
      ));

    if (existing) {
      // Update existing vote
      const [updated] = await db
        .update(initiativeVotes)
        .set({ voteType, createdAt: new Date() })
        .where(and(
          eq(initiativeVotes.initiativeId, initiativeId),
          eq(initiativeVotes.userId, userId)
        ))
        .returning();

      return updated;
    } else {
      // Insert new vote
      const [inserted] = await db
        .insert(initiativeVotes)
        .values({ initiativeId, userId, voteType })
        .returning();

      return inserted;
    }
  }

  /**
   * Remove vote from initiative
   */
  async removeVote(initiativeId: string, userId: string) {
    const [removed] = await db
      .delete(initiativeVotes)
      .where(and(
        eq(initiativeVotes.initiativeId, initiativeId),
        eq(initiativeVotes.userId, userId)
      ))
      .returning();

    return removed;
  }

  /**
   * Create initiative report
   */
  async createReport(initiativeId: string, data: CreateInitiativeReportDto, createdBy: string) {
    const [report] = await db
      .insert(initiativeReports)
      .values({
        initiativeId,
        title: data.title,
        content: data.content,
        createdBy,
      })
      .returning();

    return report;
  }

  /**
   * Find all reports for an initiative
   */
  async findReportsByInitiative(
    initiativeId: string,
    options: {
      page?: number;
      limit?: number;
    } = {}
  ) {
    const { page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;

    const reports = await db
      .select()
      .from(initiativeReports)
      .where(eq(initiativeReports.initiativeId, initiativeId))
      .orderBy(desc(initiativeReports.createdAt))
      .limit(limit)
      .offset(offset);

    const [{ count: total }] = await db
      .select({ count: count() })
      .from(initiativeReports)
      .where(eq(initiativeReports.initiativeId, initiativeId));

    return {
      reports,
      total: Number(total),
    };
  }

  /**
   * Find report by ID
   */
  async findReportById(id: string) {
    const [report] = await db
      .select()
      .from(initiativeReports)
      .where(eq(initiativeReports.id, id));

    return report;
  }

  /**
   * Create initiative comment
   */
  async createComment(initiativeId: string, content: string, authorId: string) {
    const [comment] = await db
      .insert(initiativeComments)
      .values({ initiativeId, content, authorId })
      .returning();

    return comment;
  }

  /**
   * Find comments by initiative
   */
  async findCommentsByInitiative(
    initiativeId: string,
    options: {
      page?: number;
      limit?: number;
    } = {}
  ) {
    const { page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;

    const comments = await db
      .select()
      .from(initiativeComments)
      .where(eq(initiativeComments.initiativeId, initiativeId))
      .orderBy(desc(initiativeComments.createdAt))
      .limit(limit)
      .offset(offset);

    const [{ count: total }] = await db
      .select({ count: count() })
      .from(initiativeComments)
      .where(eq(initiativeComments.initiativeId, initiativeId));

    return {
      comments,
      total: Number(total),
    };
  }

  /**
   * Create report comment
   */
  async createReportComment(reportId: string, content: string, authorId: string) {
    const [comment] = await db
      .insert(initiativeReportComments)
      .values({ reportId, content, authorId })
      .returning();

    return comment;
  }

  /**
   * Find comments by report
   */
  async findCommentsByReport(
    reportId: string,
    options: {
      page?: number;
      limit?: number;
    } = {}
  ) {
    const { page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;

    const comments = await db
      .select()
      .from(initiativeReportComments)
      .where(eq(initiativeReportComments.reportId, reportId))
      .orderBy(desc(initiativeReportComments.createdAt))
      .limit(limit)
      .offset(offset);

    const [{ count: total }] = await db
      .select({ count: count() })
      .from(initiativeReportComments)
      .where(eq(initiativeReportComments.reportId, reportId));

    return {
      comments,
      total: Number(total),
    };
  }
}

export const initiativeRepository = new InitiativeRepository();
