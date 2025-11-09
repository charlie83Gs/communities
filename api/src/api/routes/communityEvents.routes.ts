import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware';
import { communityEventsController } from '../controllers/communityEvents.controller';
import { validateListEvents, validateListUserEvents } from '../validators/communityEvents.validator';

const router = Router();

// All endpoints require authentication
// Base path: /api/v1/communities

/**
 * GET /communities/:communityId/events
 * List community events with optional filtering
 */
router.get(
  '/:communityId/events',
  verifyToken,
  validateListEvents,
  communityEventsController.listEvents
);

/**
 * GET /communities/:communityId/events/user/:targetUserId
 * List events for a specific user
 */
router.get(
  '/:communityId/events/user/:targetUserId',
  verifyToken,
  validateListUserEvents,
  communityEventsController.listUserEvents
);

export default router;
