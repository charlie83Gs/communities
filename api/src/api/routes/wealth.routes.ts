import { Router } from 'express';
import { verifyToken, verifyTokenOptional } from '../middleware/auth.middleware';
import { wealthController } from '@api/controllers/wealth.controller';
import {
  validateCreateWealth,
  validateUpdateWealth,
  validateWealthListQuery,
  validateIdParam,
  validateRequestWealth,
  validateRequestIdParams,
  validateWealthSearchQuery,
  validateWealthRequestStatusesQuery,
  validateCreateComment,
  validateListComments,
  validateUpdateComment,
  validateDeleteComment,
} from '@api/validators/wealth.validator';

const router = Router();

// All wealth endpoints require authentication
router.use(verifyToken);

// List wealths (by communityId or all my communities)
router.get('/', validateWealthListQuery, wealthController.list);

// Search wealths (filters + text search on title/description)
router.get('/search', validateWealthSearchQuery, wealthController.search);

// List my wealth requests across all communities (optional status filters)
router.get('/requests/me', validateWealthRequestStatusesQuery, wealthController.listMyRequests);

// List incoming wealth requests (requests to my wealth items)
router.get('/requests/incoming', validateWealthRequestStatusesQuery, wealthController.listIncomingRequests);

// Create wealth
router.post('/', validateCreateWealth, wealthController.create);

// Get wealth by id
router.get('/:id', validateIdParam, wealthController.getById);

// Update wealth (owner only)
router.put('/:id', validateUpdateWealth, wealthController.update);

// Cancel wealth (owner only)
router.post('/:id/cancel', validateIdParam, wealthController.cancel);

// Fulfill wealth (owner only)
router.post('/:id/fulfill', validateIdParam, wealthController.fulfill);

// Create a request for a wealth (member/admin)
router.post('/:id/request', validateRequestWealth, wealthController.requestWealth);

// List requests for a wealth
router.get('/:id/requests', validateIdParam, wealthController.listRequests);

// Accept a request (owner only)
router.post('/:id/requests/:requestId/accept', validateRequestIdParams, wealthController.acceptRequest);

// Reject a request (owner only)
router.post('/:id/requests/:requestId/reject', validateRequestIdParams, wealthController.rejectRequest);

// Cancel a request (requester or owner)
router.post('/:id/requests/:requestId/cancel', validateRequestIdParams, wealthController.cancelRequest);

router.post(
  '/:wealthId/comments',
  verifyToken,
  validateCreateComment,
  wealthController.createComment
);

router.get(
  '/:wealthId/comments',
  verifyToken,
  validateListComments,
  wealthController.listComments
);

router.put(
  '/:wealthId/comments/:commentId',
  verifyToken,
  validateUpdateComment,
  wealthController.updateComment
);

router.delete(
  '/:wealthId/comments/:commentId',
  verifyToken,
  validateDeleteComment,
  wealthController.deleteComment
);

export default router;