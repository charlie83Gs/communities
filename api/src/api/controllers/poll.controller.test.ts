import { describe, test, expect, mock, beforeEach } from 'bun:test';
import { pollController } from './poll.controller';
import { pollService } from '@/services/poll.service';
import { wealthCommentService } from '@/services/wealthComment.service';
import {
  createMockAuthenticatedRequest,
  createMockResponse,
  createMockNext,
} from '../../../tests/helpers/testUtils';

// Mock the services
const mockPollService = {
  listPolls: mock(() => Promise.resolve([])),
  getPollById: mock(() => Promise.resolve({ poll: {}, options: [], userVote: null, results: [] })),
  createPoll: mock(() => Promise.resolve({ id: 'poll-123' })),
  vote: mock(() => Promise.resolve()),
  closePoll: mock(() => Promise.resolve({ id: 'poll-123', status: 'closed' })),
};

const mockWealthCommentService = {
  createComment: mock(() => Promise.resolve({ id: 'comment-123' })),
  getCommentsByWealthId: mock(() => Promise.resolve([])),
};

describe('PollController', () => {
  beforeEach(() => {
    // Reset all mocks
    Object.values(mockPollService).forEach(m => m.mockReset());
    Object.values(mockWealthCommentService).forEach(m => m.mockReset());

    // Replace service methods with mocks
    Object.keys(mockPollService).forEach(key => {
      (pollService as any)[key] = (mockPollService as any)[key];
    });
    Object.keys(mockWealthCommentService).forEach(key => {
      (wealthCommentService as any)[key] = (mockWealthCommentService as any)[key];
    });
  });

  describe('list', () => {
    test('should list polls successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123' },
        query: { status: 'active', creatorType: 'user' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const polls = [{ id: 'poll-123', title: 'Test Poll' }];
      mockPollService.listPolls.mockResolvedValue(polls);

      await pollController.list(req, res, next);

      expect(mockPollService.listPolls).toHaveBeenCalledWith('comm-123', 'user-123', {
        status: 'active',
        creatorType: 'user',
      });
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: { polls },
        message: 'Success',
      });
    });

    test('should handle errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123' },
        query: {},
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new Error('Forbidden');
      mockPollService.listPolls.mockRejectedValue(error);

      await pollController.list(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getById', () => {
    test('should get poll by ID successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123', pollId: 'poll-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const pollDetails = {
        poll: { id: 'poll-123', title: 'Test Poll' },
        options: [{ id: 'opt-1', optionText: 'Option 1' }],
        userVote: null,
        results: [{ optionId: 'opt-1', votes: 5, percentage: 100 }],
      };
      mockPollService.getPollById.mockResolvedValue(pollDetails);

      await pollController.getById(req, res, next);

      expect(mockPollService.getPollById).toHaveBeenCalledWith('comm-123', 'poll-123', 'user-123');
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: pollDetails,
        message: 'Success',
      });
    });

    test('should handle errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123', pollId: 'poll-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new Error('Not found');
      mockPollService.getPollById.mockRejectedValue(error);

      await pollController.getById(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('create', () => {
    test('should create poll successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123' },
        body: {
          title: 'New Poll',
          description: 'Description',
          options: ['Option 1', 'Option 2'],
          duration: 168,
          creatorType: 'user',
        },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const poll = { id: 'poll-123', title: 'New Poll' };
      mockPollService.createPoll.mockResolvedValue(poll);

      await pollController.create(req, res, next);

      expect(mockPollService.createPoll).toHaveBeenCalledWith(
        {
          title: 'New Poll',
          description: 'Description',
          options: ['Option 1', 'Option 2'],
          duration: 168,
          creatorType: 'user',
          communityId: 'comm-123',
        },
        'user-123'
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: poll,
        message: 'Poll created successfully',
      });
    });

    test('should handle errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123' },
        body: { title: 'New Poll' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new Error('Validation error');
      mockPollService.createPoll.mockRejectedValue(error);

      await pollController.create(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('vote', () => {
    test('should vote successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123', pollId: 'poll-123' },
        body: { optionId: 'opt-1' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      mockPollService.vote.mockResolvedValue(undefined);

      await pollController.vote(req, res, next);

      expect(mockPollService.vote).toHaveBeenCalledWith('comm-123', 'poll-123', 'opt-1', 'user-123');
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: { success: true },
        message: 'Vote recorded successfully',
      });
    });

    test('should handle errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123', pollId: 'poll-123' },
        body: { optionId: 'opt-1' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new Error('Poll closed');
      mockPollService.vote.mockRejectedValue(error);

      await pollController.vote(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('close', () => {
    test('should close poll successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123', pollId: 'poll-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const poll = { id: 'poll-123', status: 'closed' };
      mockPollService.closePoll.mockResolvedValue(poll);

      await pollController.close(req, res, next);

      expect(mockPollService.closePoll).toHaveBeenCalledWith('comm-123', 'poll-123', 'user-123');
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: poll,
        message: 'Poll closed successfully',
      });
    });

    test('should handle errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123', pollId: 'poll-123' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new Error('Forbidden');
      mockPollService.closePoll.mockRejectedValue(error);

      await pollController.close(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('createComment', () => {
    test('should create comment successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123', pollId: 'poll-123' },
        body: { content: 'Great poll!', parentId: null },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const comment = { id: 'comment-123', content: 'Great poll!' };
      mockWealthCommentService.createComment.mockResolvedValue(comment);

      await pollController.createComment(req, res, next);

      expect(mockWealthCommentService.createComment).toHaveBeenCalledWith(
        {
          wealthId: 'poll-123',
          content: 'Great poll!',
          parentId: null,
        },
        'user-123'
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: comment,
        message: 'Comment created successfully',
      });
    });

    test('should handle errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123', pollId: 'poll-123' },
        body: { content: 'Comment' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new Error('Forbidden');
      mockWealthCommentService.createComment.mockRejectedValue(error);

      await pollController.createComment(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('listComments', () => {
    test('should list comments successfully', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123', pollId: 'poll-123' },
        query: { limit: '25', offset: '10' },
      });
      const res = createMockResponse();
      const next = createMockNext();

      const comments = [{ id: 'comment-123', content: 'Great poll!' }];
      mockWealthCommentService.getCommentsByWealthId.mockResolvedValue(comments);

      await pollController.listComments(req, res, next);

      expect(mockWealthCommentService.getCommentsByWealthId).toHaveBeenCalledWith(
        'poll-123',
        'user-123',
        25,
        10
      );
      expect(res.json).toHaveBeenCalledWith({
        status: 'success',
        data: { comments },
        message: 'Success',
      });
    });

    test('should use default limit and offset', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123', pollId: 'poll-123' },
        query: {},
      });
      const res = createMockResponse();
      const next = createMockNext();

      mockWealthCommentService.getCommentsByWealthId.mockResolvedValue([]);

      await pollController.listComments(req, res, next);

      expect(mockWealthCommentService.getCommentsByWealthId).toHaveBeenCalledWith(
        'poll-123',
        'user-123',
        50,
        0
      );
    });

    test('should handle errors', async () => {
      const req = createMockAuthenticatedRequest('user-123', {
        params: { communityId: 'comm-123', pollId: 'poll-123' },
        query: {},
      });
      const res = createMockResponse();
      const next = createMockNext();

      const error = new Error('Not found');
      mockWealthCommentService.getCommentsByWealthId.mockRejectedValue(error);

      await pollController.listComments(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
