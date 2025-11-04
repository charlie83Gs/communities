/**
 * Forum Voting Tests
 * Tests for voting on threads and posts
 */

import { describe, it, expect, beforeEach } from 'bun:test';
import { forumService } from '@/services/forum.service';
import { AppError } from '@/utils/errors';
import {
  forumTestData,
  createMockForumRepository,
  createMockOpenFGAService,
  createMockCommunityMemberRepository,
  createMockCommunityRepository,
  createMockAppUserRepository,
  setupForumServiceMocks,
  resetAllMocks,
} from './helpers';

describe('Forum Voting', () => {
  let mockForumRepo: ReturnType<typeof createMockForumRepository>;
  let mockOpenFGA: ReturnType<typeof createMockOpenFGAService>;
  let mockMemberRepo: ReturnType<typeof createMockCommunityMemberRepository>;
  let mockCommunityRepo: ReturnType<typeof createMockCommunityRepository>;
  let mockUserRepo: ReturnType<typeof createMockAppUserRepository>;

  beforeEach(() => {
    mockForumRepo = createMockForumRepository();
    mockOpenFGA = createMockOpenFGAService();
    mockMemberRepo = createMockCommunityMemberRepository('member');
    mockCommunityRepo = createMockCommunityRepository();
    mockUserRepo = createMockAppUserRepository();

    setupForumServiceMocks(
      mockForumRepo,
      mockOpenFGA,
      mockMemberRepo,
      mockCommunityRepo,
      mockUserRepo
    );
  });

  describe('voteOnThread', () => {
    it('should upvote thread', async () => {
      mockMemberRepo.getUserRole.mockResolvedValue('member');
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());
      mockForumRepo.findThreadById.mockResolvedValue(forumTestData.thread());
      mockForumRepo.createOrUpdateVote.mockResolvedValue(
        forumTestData.vote({ voteType: 'up' })
      );
      mockForumRepo.getVoteCounts.mockResolvedValue({ upvotes: 11, downvotes: 2 });

      const result = await forumService.voteOnThread('thread-123', 'up', 'user-123');

      expect(result.upvotes).toBe(11);
      expect(result.downvotes).toBe(2);
      expect(mockForumRepo.createOrUpdateVote).toHaveBeenCalledWith({
        userId: 'user-123',
        threadId: 'thread-123',
        postId: null,
        voteType: 'up',
      });
    });

    it('should downvote thread', async () => {
      mockMemberRepo.getUserRole.mockResolvedValue('member');
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());
      mockForumRepo.findThreadById.mockResolvedValue(forumTestData.thread());
      mockForumRepo.createOrUpdateVote.mockResolvedValue(
        forumTestData.vote({ voteType: 'down' })
      );
      mockForumRepo.getVoteCounts.mockResolvedValue({ upvotes: 10, downvotes: 3 });

      const result = await forumService.voteOnThread('thread-123', 'down', 'user-123');

      expect(result.upvotes).toBe(10);
      expect(result.downvotes).toBe(3);
      expect(mockForumRepo.createOrUpdateVote).toHaveBeenCalledWith({
        userId: 'user-123',
        threadId: 'thread-123',
        postId: null,
        voteType: 'down',
      });
    });

    it('should remove vote from thread', async () => {
      mockMemberRepo.getUserRole.mockResolvedValue('member');
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());
      mockForumRepo.findThreadById.mockResolvedValue(forumTestData.thread());
      mockForumRepo.removeVote.mockResolvedValue(undefined);
      mockForumRepo.getVoteCounts.mockResolvedValue({ upvotes: 9, downvotes: 2 });

      const result = await forumService.voteOnThread('thread-123', 'remove', 'user-123');

      expect(result.upvotes).toBe(9);
      expect(result.downvotes).toBe(2);
      expect(mockForumRepo.removeVote).toHaveBeenCalledWith('user-123', 'thread-123');
      expect(mockForumRepo.createOrUpdateVote).not.toHaveBeenCalled();
    });

    it('should change vote (upvote to downvote)', async () => {
      mockMemberRepo.getUserRole.mockResolvedValue('member');
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());
      mockForumRepo.findThreadById.mockResolvedValue(forumTestData.thread());

      // First vote: upvote
      mockForumRepo.createOrUpdateVote.mockResolvedValue(
        forumTestData.vote({ voteType: 'up' })
      );
      mockForumRepo.getVoteCounts.mockResolvedValue({ upvotes: 11, downvotes: 2 });

      const firstVote = await forumService.voteOnThread('thread-123', 'up', 'user-123');
      expect(firstVote.upvotes).toBe(11);

      // Change vote: downvote
      mockForumRepo.createOrUpdateVote.mockResolvedValue(
        forumTestData.vote({ voteType: 'down' })
      );
      mockForumRepo.getVoteCounts.mockResolvedValue({ upvotes: 10, downvotes: 3 });

      const secondVote = await forumService.voteOnThread('thread-123', 'down', 'user-123');
      expect(secondVote.upvotes).toBe(10);
      expect(secondVote.downvotes).toBe(3);
    });

    it('should fail for non-member', async () => {
      mockMemberRepo.getUserRole.mockResolvedValue(null);
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());
      mockForumRepo.findThreadById.mockResolvedValue(forumTestData.thread());

      await expect(
        forumService.voteOnThread('thread-123', 'up', 'user-outsider')
      ).rejects.toThrow('Forbidden: only community members can access the forum');
    });

    it('should fail for reader role', async () => {
      mockMemberRepo.getUserRole.mockResolvedValue('reader');
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());
      mockForumRepo.findThreadById.mockResolvedValue(forumTestData.thread());

      await expect(
        forumService.voteOnThread('thread-123', 'up', 'user-reader')
      ).rejects.toThrow('Forbidden: only community members can access the forum');
    });

    it('should return correct vote counts', async () => {
      mockMemberRepo.getUserRole.mockResolvedValue('member');
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());
      mockForumRepo.findThreadById.mockResolvedValue(forumTestData.thread());
      mockForumRepo.createOrUpdateVote.mockResolvedValue(forumTestData.vote());
      mockForumRepo.getVoteCounts.mockResolvedValue({ upvotes: 42, downvotes: 7 });

      const result = await forumService.voteOnThread('thread-123', 'up', 'user-123');

      expect(result).toEqual({ upvotes: 42, downvotes: 7 });
      expect(mockForumRepo.getVoteCounts).toHaveBeenCalledWith('thread-123');
    });
  });

  describe('voteOnPost', () => {
    it('should upvote post', async () => {
      mockMemberRepo.getUserRole.mockResolvedValue('member');
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());
      mockForumRepo.findThreadById.mockResolvedValue(forumTestData.thread());
      mockForumRepo.findPostById.mockResolvedValue(forumTestData.post());
      mockForumRepo.createOrUpdateVote.mockResolvedValue(
        forumTestData.vote({ postId: 'post-123', threadId: null, voteType: 'up' })
      );
      mockForumRepo.getVoteCounts.mockResolvedValue({ upvotes: 15, downvotes: 3 });

      const result = await forumService.voteOnPost('post-123', 'up', 'user-123');

      expect(result.upvotes).toBe(15);
      expect(result.downvotes).toBe(3);
      expect(mockForumRepo.createOrUpdateVote).toHaveBeenCalledWith({
        userId: 'user-123',
        threadId: null,
        postId: 'post-123',
        voteType: 'up',
      });
    });

    it('should downvote post', async () => {
      mockMemberRepo.getUserRole.mockResolvedValue('member');
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());
      mockForumRepo.findThreadById.mockResolvedValue(forumTestData.thread());
      mockForumRepo.findPostById.mockResolvedValue(forumTestData.post());
      mockForumRepo.createOrUpdateVote.mockResolvedValue(
        forumTestData.vote({ postId: 'post-123', threadId: null, voteType: 'down' })
      );
      mockForumRepo.getVoteCounts.mockResolvedValue({ upvotes: 15, downvotes: 4 });

      const result = await forumService.voteOnPost('post-123', 'down', 'user-123');

      expect(result.upvotes).toBe(15);
      expect(result.downvotes).toBe(4);
      expect(mockForumRepo.createOrUpdateVote).toHaveBeenCalledWith({
        userId: 'user-123',
        threadId: null,
        postId: 'post-123',
        voteType: 'down',
      });
    });

    it('should remove vote from post', async () => {
      mockMemberRepo.getUserRole.mockResolvedValue('member');
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());
      mockForumRepo.findThreadById.mockResolvedValue(forumTestData.thread());
      mockForumRepo.findPostById.mockResolvedValue(forumTestData.post());
      mockForumRepo.removeVote.mockResolvedValue(undefined);
      mockForumRepo.getVoteCounts.mockResolvedValue({ upvotes: 14, downvotes: 3 });

      const result = await forumService.voteOnPost('post-123', 'remove', 'user-123');

      expect(result.upvotes).toBe(14);
      expect(result.downvotes).toBe(3);
      expect(mockForumRepo.removeVote).toHaveBeenCalledWith('user-123', undefined, 'post-123');
      expect(mockForumRepo.createOrUpdateVote).not.toHaveBeenCalled();
    });

    it('should change vote on post (downvote to upvote)', async () => {
      mockMemberRepo.getUserRole.mockResolvedValue('member');
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());
      mockForumRepo.findThreadById.mockResolvedValue(forumTestData.thread());
      mockForumRepo.findPostById.mockResolvedValue(forumTestData.post());

      // First vote: downvote
      mockForumRepo.createOrUpdateVote.mockResolvedValue(
        forumTestData.vote({ postId: 'post-123', threadId: null, voteType: 'down' })
      );
      mockForumRepo.getVoteCounts.mockResolvedValue({ upvotes: 15, downvotes: 4 });

      const firstVote = await forumService.voteOnPost('post-123', 'down', 'user-123');
      expect(firstVote.downvotes).toBe(4);

      // Change vote: upvote
      mockForumRepo.createOrUpdateVote.mockResolvedValue(
        forumTestData.vote({ postId: 'post-123', threadId: null, voteType: 'up' })
      );
      mockForumRepo.getVoteCounts.mockResolvedValue({ upvotes: 16, downvotes: 3 });

      const secondVote = await forumService.voteOnPost('post-123', 'up', 'user-123');
      expect(secondVote.upvotes).toBe(16);
      expect(secondVote.downvotes).toBe(3);
    });

    it('should fail for non-member', async () => {
      mockMemberRepo.getUserRole.mockResolvedValue(null);
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());
      mockForumRepo.findThreadById.mockResolvedValue(forumTestData.thread());
      mockForumRepo.findPostById.mockResolvedValue(forumTestData.post());

      await expect(
        forumService.voteOnPost('post-123', 'up', 'user-outsider')
      ).rejects.toThrow('Forbidden: only community members can access the forum');
    });

    it('should return correct vote counts for post', async () => {
      mockMemberRepo.getUserRole.mockResolvedValue('member');
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());
      mockForumRepo.findThreadById.mockResolvedValue(forumTestData.thread());
      mockForumRepo.findPostById.mockResolvedValue(forumTestData.post());
      mockForumRepo.createOrUpdateVote.mockResolvedValue(
        forumTestData.vote({ postId: 'post-123', threadId: null })
      );
      mockForumRepo.getVoteCounts.mockResolvedValue({ upvotes: 28, downvotes: 5 });

      const result = await forumService.voteOnPost('post-123', 'up', 'user-123');

      expect(result).toEqual({ upvotes: 28, downvotes: 5 });
      expect(mockForumRepo.getVoteCounts).toHaveBeenCalledWith(undefined, 'post-123');
    });
  });

  describe('vote behavior', () => {
    it('cannot vote multiple times (vote is updated)', async () => {
      mockMemberRepo.getUserRole.mockResolvedValue('member');
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());
      mockForumRepo.findThreadById.mockResolvedValue(forumTestData.thread());

      // First upvote
      mockForumRepo.createOrUpdateVote.mockResolvedValue(
        forumTestData.vote({ voteType: 'up' })
      );
      mockForumRepo.getVoteCounts.mockResolvedValue({ upvotes: 11, downvotes: 2 });

      await forumService.voteOnThread('thread-123', 'up', 'user-123');

      // Second upvote (should update existing vote, not create new)
      mockForumRepo.createOrUpdateVote.mockResolvedValue(
        forumTestData.vote({ voteType: 'up' })
      );
      mockForumRepo.getVoteCounts.mockResolvedValue({ upvotes: 11, downvotes: 2 });

      await forumService.voteOnThread('thread-123', 'up', 'user-123');

      // Vote count should remain the same (not increase)
      expect(mockForumRepo.createOrUpdateVote).toHaveBeenCalledTimes(2);
    });

    it('should handle zero votes', async () => {
      mockMemberRepo.getUserRole.mockResolvedValue('member');
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());
      mockForumRepo.findThreadById.mockResolvedValue(forumTestData.thread());
      mockForumRepo.getVoteCounts.mockResolvedValue({ upvotes: 0, downvotes: 0 });

      const result = await forumService.voteOnThread('thread-123', 'remove', 'user-123');

      expect(result.upvotes).toBe(0);
      expect(result.downvotes).toBe(0);
    });

    it('should handle large vote counts', async () => {
      mockMemberRepo.getUserRole.mockResolvedValue('member');
      mockForumRepo.findCategoryById.mockResolvedValue(forumTestData.category());
      mockForumRepo.findThreadById.mockResolvedValue(forumTestData.thread());
      mockForumRepo.createOrUpdateVote.mockResolvedValue(forumTestData.vote());
      mockForumRepo.getVoteCounts.mockResolvedValue({ upvotes: 9999, downvotes: 1234 });

      const result = await forumService.voteOnThread('thread-123', 'up', 'user-123');

      expect(result.upvotes).toBe(9999);
      expect(result.downvotes).toBe(1234);
    });
  });
});
