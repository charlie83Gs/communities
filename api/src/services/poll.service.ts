import { db } from '@db/index';
import { polls, pollOptions, pollVotes } from '@db/schema';
import { eq, and, sql, desc } from 'drizzle-orm';
import { openFGAService } from './openfga.service';
import { AppError } from '@utils/errors';
import type {
  CreatePollDto,
  Poll,
  PollWithDetails,
  PollResult,
  ListPollsQuery,
  PollOption,
} from '@types/poll.types';

export class PollService {
  /**
   * Ensure user is a member or admin of the community
   * Uses OpenFGA to check can_read permission (requires member or admin role)
   */
  private async ensureMemberOrAdmin(communityId: string, userId: string): Promise<void> {
    const canRead = await openFGAService.checkAccess(userId, 'community', communityId, 'can_read');
    if (!canRead) {
      throw new AppError('You must be a member of this community to access polls', 403);
    }
  }

  /**
   * Check if user can create polls in a community
   * Uses OpenFGA unified permission check: admin OR poll_creator OR trust_poll_creator
   */
  private async canCreatePoll(userId: string, communityId: string): Promise<boolean> {
    return await openFGAService.checkAccess(userId, 'community', communityId, 'can_create_poll');
  }

  /**
   * Check if user can view polls in a community
   * Uses OpenFGA unified permission check: admin OR poll_viewer OR trust_poll_viewer
   */
  private async canViewPolls(userId: string, communityId: string): Promise<boolean> {
    return await openFGAService.checkAccess(userId, 'community', communityId, 'can_view_poll');
  }

  /**
   * Create a new poll
   */
  async createPoll(data: CreatePollDto, userId: string): Promise<Poll> {
    // Verify user is a member of the community
    await this.ensureMemberOrAdmin(data.communityId, userId);

    // Check poll creation permission
    const canCreate = await this.canCreatePoll(userId, data.communityId);

    if (!canCreate) {
      throw new AppError(
        'You do not have permission to create polls in this community. You need the poll_creator role or sufficient trust level.',
        403
      );
    }

    // Validate options
    if (!data.options || data.options.length < 2) {
      throw new AppError('Poll must have at least 2 options', 400);
    }

    if (data.options.length > 10) {
      throw new AppError('Poll cannot have more than 10 options', 400);
    }

    // Validate duration
    if (data.duration < 1 || data.duration > 720) {
      // Max 30 days
      throw new AppError('Poll duration must be between 1 hour and 720 hours (30 days)', 400);
    }

    // If creatorType is council or pool, verify user has permission for that entity
    if (data.creatorType === 'council' && data.creatorId) {
      // Check if user is a council member
      const isCouncilMember = await openFGAService.check({
        user: `user:${userId}`,
        relation: 'member',
        object: `council:${data.creatorId}`,
      });

      if (!isCouncilMember) {
        throw new AppError('You are not a member of this council', 403);
      }
    }

    if (data.creatorType === 'pool' && data.creatorId) {
      // Check if user is a pool manager
      const isPoolManager = await openFGAService.check({
        user: `user:${userId}`,
        relation: 'manager',
        object: `pool:${data.creatorId}`,
      });

      if (!isPoolManager) {
        throw new AppError('You are not a manager of this pool', 403);
      }
    }

    // Calculate end time
    const endsAt = new Date();
    endsAt.setHours(endsAt.getHours() + data.duration);

    // Create poll in transaction
    return await db.transaction(async (tx) => {
      // Insert poll
      const [poll] = await tx
        .insert(polls)
        .values({
          communityId: data.communityId,
          title: data.title,
          description: data.description || null,
          creatorType: data.creatorType,
          creatorId: data.creatorId || null,
          createdBy: userId,
          status: 'active',
          endsAt,
        })
        .returning();

      // Insert options
      const optionValues = data.options.map((optionText, index) => ({
        pollId: poll.id,
        optionText,
        displayOrder: index,
      }));

      await tx.insert(pollOptions).values(optionValues);

      return poll;
    });
  }

  /**
   * List polls for a community
   */
  async listPolls(
    communityId: string,
    userId: string,
    query: ListPollsQuery = {}
  ): Promise<Poll[]> {
    // Verify user is a member of the community
    await this.ensureMemberOrAdmin(communityId, userId);

    // Check poll viewing permission
    const canView = await this.canViewPolls(userId, communityId);

    if (!canView) {
      throw new AppError(
        'You do not have permission to view polls. You need the poll_viewer role or sufficient trust level.',
        403
      );
    }

    // Build query conditions
    const conditions = [eq(polls.communityId, communityId)];

    if (query.status) {
      conditions.push(eq(polls.status, query.status));
    }

    if (query.creatorType) {
      conditions.push(eq(polls.creatorType, query.creatorType));
    }

    // Fetch polls
    const pollsList = await db
      .select()
      .from(polls)
      .where(and(...conditions))
      .orderBy(desc(polls.createdAt));

    return pollsList;
  }

  /**
   * Get poll by ID with details
   */
  async getPollById(communityId: string, pollId: string, userId: string): Promise<PollWithDetails> {
    // Verify user is a member of the community
    await this.ensureMemberOrAdmin(communityId, userId);

    // Check poll viewing permission
    const canView = await this.canViewPolls(userId, communityId);

    if (!canView) {
      throw new AppError(
        'You do not have permission to view polls. You need the poll_viewer role or sufficient trust level.',
        403
      );
    }

    // Fetch poll
    const [poll] = await db
      .select()
      .from(polls)
      .where(and(eq(polls.id, pollId), eq(polls.communityId, communityId)))
      .limit(1);

    if (!poll) {
      throw new AppError('Poll not found', 404);
    }

    // Fetch options
    const options = await db
      .select()
      .from(pollOptions)
      .where(eq(pollOptions.pollId, pollId))
      .orderBy(pollOptions.displayOrder);

    // Fetch user's vote
    const [userVote] = await db
      .select({ optionId: pollVotes.optionId })
      .from(pollVotes)
      .where(and(eq(pollVotes.pollId, pollId), eq(pollVotes.userId, userId)))
      .limit(1);

    // Calculate results
    const results = await this.calculateResults(pollId, options);

    return {
      ...poll,
      options,
      userVote: userVote ? { optionId: userVote.optionId } : undefined,
      results,
    };
  }

  /**
   * Calculate poll results
   */
  private async calculateResults(pollId: string, options: PollOption[]): Promise<PollResult[]> {
    // Get vote counts for each option
    const voteCounts = await db
      .select({
        optionId: pollVotes.optionId,
        count: sql<number>`count(*)::int`,
      })
      .from(pollVotes)
      .where(eq(pollVotes.pollId, pollId))
      .groupBy(pollVotes.optionId);

    // Calculate total votes
    const totalVotes = voteCounts.reduce((sum, vc) => sum + vc.count, 0);

    // Build results for all options (including those with 0 votes)
    return options.map((option) => {
      const voteCount = voteCounts.find((vc) => vc.optionId === option.id);
      const votes = voteCount?.count ?? 0;
      const percentage = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;

      return {
        optionId: option.id,
        votes,
        percentage,
      };
    });
  }

  /**
   * Vote on a poll
   */
  async vote(communityId: string, pollId: string, optionId: string, userId: string): Promise<void> {
    // Verify user is a member of the community
    await this.ensureMemberOrAdmin(communityId, userId);

    // Check poll viewing permission (users must be able to view polls to vote)
    const canView = await this.canViewPolls(userId, communityId);

    if (!canView) {
      throw new AppError(
        'You do not have permission to view polls. You need the poll_viewer role or sufficient trust level.',
        403
      );
    }

    // Fetch poll
    const [poll] = await db
      .select()
      .from(polls)
      .where(and(eq(polls.id, pollId), eq(polls.communityId, communityId)))
      .limit(1);

    if (!poll) {
      throw new AppError('Poll not found', 404);
    }

    // Check if poll is active
    if (poll.status !== 'active') {
      throw new AppError('This poll is closed', 400);
    }

    // Check if poll has ended
    if (new Date() > poll.endsAt) {
      throw new AppError('This poll has ended', 400);
    }

    // Verify option exists and belongs to this poll
    const [option] = await db
      .select()
      .from(pollOptions)
      .where(and(eq(pollOptions.id, optionId), eq(pollOptions.pollId, pollId)))
      .limit(1);

    if (!option) {
      throw new AppError('Invalid poll option', 400);
    }

    // Check if user has already voted
    const [existingVote] = await db
      .select()
      .from(pollVotes)
      .where(and(eq(pollVotes.pollId, pollId), eq(pollVotes.userId, userId)))
      .limit(1);

    if (existingVote) {
      throw new AppError('You have already voted on this poll', 400);
    }

    // Record vote
    await db.insert(pollVotes).values({
      pollId,
      optionId,
      userId,
    });
  }

  /**
   * Close a poll
   */
  async closePoll(communityId: string, pollId: string, userId: string): Promise<Poll> {
    // Fetch poll
    const [poll] = await db
      .select()
      .from(polls)
      .where(and(eq(polls.id, pollId), eq(polls.communityId, communityId)))
      .limit(1);

    if (!poll) {
      throw new AppError('Poll not found', 404);
    }

    // Check if user is the creator or admin
    const isCreator = poll.createdBy === userId;
    const isAdmin = await openFGAService.check({
      user: `user:${userId}`,
      relation: 'admin',
      object: `community:${communityId}`,
    });

    if (!isCreator && !isAdmin) {
      throw new AppError('Only the poll creator or community admin can close this poll', 403);
    }

    // Check if poll is already closed
    if (poll.status === 'closed') {
      throw new AppError('Poll is already closed', 400);
    }

    // Update poll status
    const [updatedPoll] = await db
      .update(polls)
      .set({
        status: 'closed',
        updatedAt: new Date(),
      })
      .where(eq(polls.id, pollId))
      .returning();

    return updatedPoll;
  }
}

export const pollService = new PollService();
