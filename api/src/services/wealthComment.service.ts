import { wealthCommentRepository } from '@repositories/wealthComment.repository';
import { openFGAService } from './openfga.service';
import { AppError } from '@utils/errors';
import { CreateWealthCommentDto } from '../types/wealth.types';
import { wealthRepository } from '@repositories/wealth.repository';

export class WealthCommentService {
  async createComment(data: CreateWealthCommentDto, userId: string) {
    const { wealthId, ...commentData } = data;

    // Fetch wealth to verify existence and get communityId
    const wealthItem = await wealthRepository.findById(wealthId);
    if (!wealthItem) {
      throw new AppError('Wealth not found', 404);
    }

    // Check permission: community members (or admins) can read/comment
    const canReadCommunity = await openFGAService.can(
      userId,
      'communities',
      wealthItem.communityId,
      'read'
    );
    if (!canReadCommunity) {
      throw new AppError('Forbidden: You do not have permission to comment on this wealth', 403);
    }
    // Members can create comments; no separate "create on wealth" permission required

    // Create comment with authorId
    const comment = await wealthCommentRepository.create({
      ...commentData,
      wealthId,
      authorId: userId,
    });

    // Create parent_community relationship in OpenFGA for hierarchical permissions
    try {
      await openFGAService.createRelationship(
        'wealthComments',
        comment.id,
        'parent_community',
        'communities',
        wealthItem.communityId
      );
    } catch (error) {
      console.error('Failed to create wealthComment->community relationship in OpenFGA:', error);
      // non-fatal
    }

    return comment;
  }

  async getCommentsByWealthId(wealthId: string, userId: string, limit = 50, offset = 0) {
    // Fetch wealth to derive community membership for access check
    const wealthItem = await wealthRepository.findById(wealthId);
    if (!wealthItem) {
      throw new AppError('Wealth not found', 404);
    }

    // Allow read for any member/admin of the community
    const canReadCommunity = await openFGAService.can(
      userId,
      'communities',
      wealthItem.communityId,
      'read'
    );
    if (!canReadCommunity) {
      throw new AppError(
        'Forbidden: You do not have permission to view comments on this wealth',
        403
      );
    }

    const comments = await wealthCommentRepository.findByWealthId(wealthId, limit, offset);
    return comments;
  }

  async updateComment(commentId: string, data: { content?: string }, userId: string) {
    const comment = await wealthCommentRepository.findById(commentId);
    if (!comment) {
      throw new AppError('Comment not found', 404);
    }

    // Only author can update (no additional wealth-level permission required)
    if (comment.authorId !== userId) {
      throw new AppError('Forbidden: You can only update your own comments', 403);
    }

    const updated = await wealthCommentRepository.update(commentId, data);
    return updated;
  }

  async deleteComment(commentId: string, userId: string) {
    const comment = await wealthCommentRepository.findById(commentId);
    if (!comment) {
      throw new AppError('Comment not found', 404);
    }

    // Only author can delete (per requirement)
    if (comment.authorId !== userId) {
      throw new AppError('Forbidden: You can only delete your own comments', 403);
    }

    const deleted = await wealthCommentRepository.delete(commentId);
    return deleted;
  }
}

export const wealthCommentService = new WealthCommentService();
