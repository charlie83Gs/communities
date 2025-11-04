import { Router } from 'express';
import { verifyToken, verifyTokenOptional } from '../middleware/auth.middleware';
import { pollController } from '@api/controllers/poll.controller';
import {
  validateCreatePoll,
  validateListPollsQuery,
  validateGetPollById,
  validateVote,
  validateClosePoll,
} from '@api/validators/poll.validator';

const router = Router();

// All poll endpoints require authentication
router.use(verifyToken);

/**
 * Poll routes under /api/v1/communities/:communityId/polls
 */

// List polls for a community
router.get(
  '/:communityId/polls',
  validateListPollsQuery,
  pollController.list
);

// Get poll by ID
router.get(
  '/:communityId/polls/:pollId',
  validateGetPollById,
  pollController.getById
);

// Create a new poll
router.post(
  '/:communityId/polls',
  validateCreatePoll,
  pollController.create
);

// Vote on a poll
router.post(
  '/:communityId/polls/:pollId/vote',
  validateVote,
  pollController.vote
);

// Close a poll (creator or admin only)
router.post(
  '/:communityId/polls/:pollId/close',
  validateClosePoll,
  pollController.close
);

// Create a comment on a poll
router.post(
  '/:communityId/polls/:pollId/comments',
  pollController.createComment
);

// List comments for a poll
router.get(
  '/:communityId/polls/:pollId/comments',
  pollController.listComments
);

export default router;
