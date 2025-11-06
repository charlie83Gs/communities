import { initiativeRepository } from '../repositories/initiative.repository';
import { councilRepository } from '../repositories/council.repository';
import { communityMemberRepository } from '../repositories/communityMember.repository';
import { appUserRepository } from '../repositories/appUser.repository';
import { AppError } from '../utils/errors';
import {
  CreateInitiativeDto,
  UpdateInitiativeDto,
  CreateInitiativeReportDto,
} from '../types/initiative.types';
import logger from '../utils/logger';

export class InitiativeService {
  /**
   * Check if user is admin of the community
   */
  private async isAdmin(communityId: string, userId: string): Promise<boolean> {
    return await communityMemberRepository.isAdmin(communityId, userId);
  }

  /**
   * Check if user is a council manager
   */
  private async isCouncilManager(councilId: string, userId: string): Promise<boolean> {
    return await councilRepository.isManager(councilId, userId);
  }

  /**
   * Check if user can manage council (admin OR council manager)
   */
  private async canManageCouncil(councilId: string, userId: string): Promise<boolean> {
    const council = await councilRepository.findById(councilId);
    if (!council) {
      throw new AppError('Council not found', 404);
    }

    const isAdmin = await this.isAdmin(council.communityId, userId);
    const isManager = await this.isCouncilManager(councilId, userId);

    return isAdmin || isManager;
  }

  /**
   * Create a new initiative
   */
  async createInitiative(
    councilId: string,
    data: CreateInitiativeDto,
    userId: string
  ) {
    logger.info(`[InitiativeService createInitiative] Creating initiative for councilId: ${councilId}`);

    const council = await councilRepository.findById(councilId);
    if (!council) {
      throw new AppError('Council not found', 404);
    }

    // Check if user can manage this council
    const canManage = await this.canManageCouncil(councilId, userId);
    if (!canManage) {
      throw new AppError('Forbidden: only admins or council managers can create initiatives', 403);
    }

    // Validate title
    if (data.title.length < 3 || data.title.length > 200) {
      throw new AppError('Initiative title must be between 3 and 200 characters', 400);
    }

    // Validate description
    if (data.description.length < 10) {
      throw new AppError('Initiative description must be at least 10 characters', 400);
    }

    // Create initiative
    const initiative = await initiativeRepository.create(
      councilId,
      council.communityId,
      data,
      userId
    );

    logger.info(`[InitiativeService createInitiative] Initiative created with id: ${initiative.id}`);

    return {
      ...initiative,
      upvotes: 0,
      downvotes: 0,
      userVote: null,
    };
  }

  /**
   * Get initiative by ID
   */
  async getInitiative(initiativeId: string, userId: string) {
    const initiative = await initiativeRepository.findById(initiativeId, userId);
    if (!initiative) {
      throw new AppError('Initiative not found', 404);
    }

    // Check user is member of the community
    const userRole = await communityMemberRepository.getUserRole(initiative.communityId, userId);
    if (!userRole) {
      throw new AppError('Forbidden: not a member of this community', 403);
    }

    return initiative;
  }

  /**
   * List initiatives by council
   */
  async listInitiatives(
    councilId: string,
    userId: string,
    options: { page?: number; limit?: number } = {}
  ) {
    logger.info(`[InitiativeService listInitiatives] Listing initiatives for councilId: ${councilId}`);

    const council = await councilRepository.findById(councilId);
    if (!council) {
      throw new AppError('Council not found', 404);
    }

    // Check user is member of the community
    const userRole = await communityMemberRepository.getUserRole(council.communityId, userId);
    if (!userRole) {
      throw new AppError('Forbidden: not a member of this community', 403);
    }

    try {
      const result = await initiativeRepository.findByCouncil(councilId, userId, options);
      logger.info(`[InitiativeService listInitiatives] Found ${result.initiatives.length} initiatives`);
      return result;
    } catch (error) {
      logger.error(`[InitiativeService listInitiatives] Error fetching initiatives:`, error);
      throw error;
    }
  }

  /**
   * Update initiative
   */
  async updateInitiative(
    initiativeId: string,
    data: UpdateInitiativeDto,
    userId: string
  ) {
    const initiative = await initiativeRepository.findById(initiativeId);
    if (!initiative) {
      throw new AppError('Initiative not found', 404);
    }

    // Check if user can manage the council
    const canManage = await this.canManageCouncil(initiative.councilId, userId);
    if (!canManage) {
      throw new AppError('Forbidden: only admins or council managers can update initiatives', 403);
    }

    // Validate title if provided
    if (data.title) {
      if (data.title.length < 3 || data.title.length > 200) {
        throw new AppError('Initiative title must be between 3 and 200 characters', 400);
      }
    }

    // Validate description if provided
    if (data.description) {
      if (data.description.length < 10) {
        throw new AppError('Initiative description must be at least 10 characters', 400);
      }
    }

    const updated = await initiativeRepository.update(initiativeId, data);
    if (!updated) {
      throw new AppError('Failed to update initiative', 500);
    }

    // Get updated initiative with vote counts
    return await initiativeRepository.findById(initiativeId, userId);
  }

  /**
   * Delete initiative
   */
  async deleteInitiative(initiativeId: string, userId: string) {
    const initiative = await initiativeRepository.findById(initiativeId);
    if (!initiative) {
      throw new AppError('Initiative not found', 404);
    }

    // Check if user can manage the council
    const canManage = await this.canManageCouncil(initiative.councilId, userId);
    if (!canManage) {
      throw new AppError('Forbidden: only admins or council managers can delete initiatives', 403);
    }

    await initiativeRepository.delete(initiativeId);

    return { success: true };
  }

  /**
   * Vote on initiative
   */
  async voteOnInitiative(
    initiativeId: string,
    voteType: 'upvote' | 'downvote',
    userId: string
  ) {
    const initiative = await initiativeRepository.findById(initiativeId);
    if (!initiative) {
      throw new AppError('Initiative not found', 404);
    }

    // Check user is member of the community
    const userRole = await communityMemberRepository.getUserRole(initiative.communityId, userId);
    if (!userRole) {
      throw new AppError('Forbidden: not a member of this community', 403);
    }

    await initiativeRepository.vote(initiativeId, userId, voteType);

    // Return updated vote counts
    return await initiativeRepository.findById(initiativeId, userId);
  }

  /**
   * Remove vote from initiative
   */
  async removeVote(initiativeId: string, userId: string) {
    const initiative = await initiativeRepository.findById(initiativeId);
    if (!initiative) {
      throw new AppError('Initiative not found', 404);
    }

    // Check user is member of the community
    const userRole = await communityMemberRepository.getUserRole(initiative.communityId, userId);
    if (!userRole) {
      throw new AppError('Forbidden: not a member of this community', 403);
    }

    await initiativeRepository.removeVote(initiativeId, userId);

    // Return updated vote counts
    return await initiativeRepository.findById(initiativeId, userId);
  }

  /**
   * Create initiative report
   */
  async createReport(
    initiativeId: string,
    data: CreateInitiativeReportDto,
    userId: string
  ) {
    logger.info(`[InitiativeService createReport] Creating report for initiativeId: ${initiativeId}`);

    const initiative = await initiativeRepository.findById(initiativeId);
    if (!initiative) {
      throw new AppError('Initiative not found', 404);
    }

    // Check if user can manage the council
    const canManage = await this.canManageCouncil(initiative.councilId, userId);
    if (!canManage) {
      throw new AppError('Forbidden: only admins or council managers can create reports', 403);
    }

    // Validate title
    if (data.title.length < 3 || data.title.length > 200) {
      throw new AppError('Report title must be between 3 and 200 characters', 400);
    }

    // Validate content
    if (data.content.length < 10) {
      throw new AppError('Report content must be at least 10 characters', 400);
    }

    const report = await initiativeRepository.createReport(initiativeId, data, userId);

    logger.info(`[InitiativeService createReport] Report created with id: ${report.id}`);

    return report;
  }

  /**
   * List reports for an initiative
   */
  async listReports(
    initiativeId: string,
    userId: string,
    options: { page?: number; limit?: number } = {}
  ) {
    const initiative = await initiativeRepository.findById(initiativeId);
    if (!initiative) {
      throw new AppError('Initiative not found', 404);
    }

    // Check user is member of the community
    const userRole = await communityMemberRepository.getUserRole(initiative.communityId, userId);
    if (!userRole) {
      throw new AppError('Forbidden: not a member of this community', 403);
    }

    return await initiativeRepository.findReportsByInitiative(initiativeId, options);
  }

  /**
   * Create comment on initiative
   */
  async createComment(
    initiativeId: string,
    content: string,
    userId: string
  ) {
    const initiative = await initiativeRepository.findById(initiativeId);
    if (!initiative) {
      throw new AppError('Initiative not found', 404);
    }

    // Check user is member of the community
    const userRole = await communityMemberRepository.getUserRole(initiative.communityId, userId);
    if (!userRole) {
      throw new AppError('Forbidden: not a member of this community', 403);
    }

    // Validate content
    if (content.length < 1 || content.length > 5000) {
      throw new AppError('Comment must be between 1 and 5000 characters', 400);
    }

    const comment = await initiativeRepository.createComment(initiativeId, content, userId);

    // Get author details
    const author = await appUserRepository.findById(userId);

    return {
      ...comment,
      authorName: author?.displayName || author?.email || 'Unknown',
    };
  }

  /**
   * List comments for an initiative
   */
  async listComments(
    initiativeId: string,
    userId: string,
    options: { page?: number; limit?: number } = {}
  ) {
    const initiative = await initiativeRepository.findById(initiativeId);
    if (!initiative) {
      throw new AppError('Initiative not found', 404);
    }

    // Check user is member of the community
    const userRole = await communityMemberRepository.getUserRole(initiative.communityId, userId);
    if (!userRole) {
      throw new AppError('Forbidden: not a member of this community', 403);
    }

    const result = await initiativeRepository.findCommentsByInitiative(initiativeId, options);

    // Add author details
    const commentsWithAuthors = await Promise.all(
      result.comments.map(async (comment) => {
        const author = await appUserRepository.findById(comment.authorId);
        return {
          ...comment,
          authorName: author?.displayName || author?.email || 'Unknown',
        };
      })
    );

    return {
      comments: commentsWithAuthors,
      total: result.total,
    };
  }

  /**
   * Create comment on report
   */
  async createReportComment(
    reportId: string,
    content: string,
    userId: string
  ) {
    const report = await initiativeRepository.findReportById(reportId);
    if (!report) {
      throw new AppError('Report not found', 404);
    }

    const initiative = await initiativeRepository.findById(report.initiativeId);
    if (!initiative) {
      throw new AppError('Initiative not found', 404);
    }

    // Check user is member of the community
    const userRole = await communityMemberRepository.getUserRole(initiative.communityId, userId);
    if (!userRole) {
      throw new AppError('Forbidden: not a member of this community', 403);
    }

    // Validate content
    if (content.length < 1 || content.length > 5000) {
      throw new AppError('Comment must be between 1 and 5000 characters', 400);
    }

    const comment = await initiativeRepository.createReportComment(reportId, content, userId);

    // Get author details
    const author = await appUserRepository.findById(userId);

    return {
      ...comment,
      authorName: author?.displayName || author?.email || 'Unknown',
    };
  }

  /**
   * List comments for a report
   */
  async listReportComments(
    reportId: string,
    userId: string,
    options: { page?: number; limit?: number } = {}
  ) {
    const report = await initiativeRepository.findReportById(reportId);
    if (!report) {
      throw new AppError('Report not found', 404);
    }

    const initiative = await initiativeRepository.findById(report.initiativeId);
    if (!initiative) {
      throw new AppError('Initiative not found', 404);
    }

    // Check user is member of the community
    const userRole = await communityMemberRepository.getUserRole(initiative.communityId, userId);
    if (!userRole) {
      throw new AppError('Forbidden: not a member of this community', 403);
    }

    const result = await initiativeRepository.findCommentsByReport(reportId, options);

    // Add author details
    const commentsWithAuthors = await Promise.all(
      result.comments.map(async (comment) => {
        const author = await appUserRepository.findById(comment.authorId);
        return {
          ...comment,
          authorName: author?.displayName || author?.email || 'Unknown',
        };
      })
    );

    return {
      comments: commentsWithAuthors,
      total: result.total,
    };
  }
}

export const initiativeService = new InitiativeService();
