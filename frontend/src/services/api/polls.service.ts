import { apiClient } from './client';
import type {
  Poll,
  PollDetail,
  CreatePollDto,
  PollComment,
  CreatePollCommentDto,
  UpdatePollCommentDto,
  PollStatus,
  PollCreatorType,
} from '@/types/poll.types';

class PollsService {
  private readonly basePath = '/api/v1/communities';

  /**
   * List polls for a community
   * GET /api/v1/communities/:communityId/polls
   */
  async listPolls(
    communityId: string,
    params?: { status?: PollStatus; creatorType?: PollCreatorType }
  ): Promise<{ polls: Poll[] }> {
    const search = new URLSearchParams();
    if (params?.status) search.set('status', params.status);
    if (params?.creatorType) search.set('creatorType', params.creatorType);
    const qs = search.toString();
    return apiClient.get(`${this.basePath}/${communityId}/polls${qs ? `?${qs}` : ''}`);
  }

  /**
   * Get poll details with options, user vote, and results
   * GET /api/v1/communities/:communityId/polls/:pollId
   */
  async getPoll(communityId: string, pollId: string): Promise<PollDetail> {
    return apiClient.get(`${this.basePath}/${communityId}/polls/${pollId}`);
  }

  /**
   * Create a new poll
   * POST /api/v1/communities/:communityId/polls
   */
  async createPoll(communityId: string, dto: CreatePollDto): Promise<{ poll: Poll }> {
    return apiClient.post(`${this.basePath}/${communityId}/polls`, dto);
  }

  /**
   * Vote on a poll
   * POST /api/v1/communities/:communityId/polls/:pollId/vote
   */
  async votePoll(
    communityId: string,
    pollId: string,
    optionId: string
  ): Promise<{ success: boolean }> {
    return apiClient.post(`${this.basePath}/${communityId}/polls/${pollId}/vote`, { optionId });
  }

  /**
   * Close a poll (creator/admin only)
   * POST /api/v1/communities/:communityId/polls/:pollId/close
   */
  async closePoll(communityId: string, pollId: string): Promise<{ poll: Poll }> {
    return apiClient.post(`${this.basePath}/${communityId}/polls/${pollId}/close`, {});
  }

  /**
   * Create a comment on a poll
   * POST /api/v1/communities/:communityId/polls/:pollId/comments
   */
  async createComment(
    communityId: string,
    pollId: string,
    dto: CreatePollCommentDto
  ): Promise<{ comment: PollComment }> {
    return apiClient.post(`${this.basePath}/${communityId}/polls/${pollId}/comments`, dto);
  }

  /**
   * List comments for a poll
   * GET /api/v1/communities/:communityId/polls/:pollId/comments
   */
  async getComments(communityId: string, pollId: string): Promise<{ comments: PollComment[] }> {
    return apiClient.get(`${this.basePath}/${communityId}/polls/${pollId}/comments`);
  }

  /**
   * Update a comment (author only)
   * PUT /api/v1/communities/:communityId/polls/:pollId/comments/:commentId
   */
  async updateComment(
    communityId: string,
    pollId: string,
    commentId: string,
    dto: UpdatePollCommentDto
  ): Promise<{ comment: PollComment }> {
    return apiClient.put(
      `${this.basePath}/${communityId}/polls/${pollId}/comments/${commentId}`,
      dto
    );
  }

  /**
   * Delete a comment (author/admin only)
   * DELETE /api/v1/communities/:communityId/polls/:pollId/comments/:commentId
   */
  async deleteComment(communityId: string, pollId: string, commentId: string): Promise<void> {
    return apiClient.delete(
      `${this.basePath}/${communityId}/polls/${pollId}/comments/${commentId}`
    );
  }
}

export const pollsService = new PollsService();
