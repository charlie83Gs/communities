import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware';
import { usersController } from '../controllers/users.controller';
import { trustAnalyticsController } from '../controllers/trustAnalytics.controller';
import { validateGetUserInvites } from '../validators/users.validator';
import { validateGetTrustTimeline, validateGetTrustSummary } from '../validators/trustAnalytics.validator';

const router = Router();

// All user endpoints require authentication
router.use(verifyToken);

// Search users (for invite forms, etc.)
router.get('/search', usersController.searchUsers);

// Trust analytics endpoints for authenticated user (MUST come before :id routes)
router.get('/me/trust/timeline', validateGetTrustTimeline, trustAnalyticsController.getMyTrustTimeline);
router.get('/me/trust/summary', validateGetTrustSummary, trustAnalyticsController.getMyTrustSummary);

// Get user invites MUST come before generic :id route
router.get('/:id/invites', validateGetUserInvites, usersController.getUserInvites);

// Get user communities
router.get('/:id/communities', usersController.getUserCommunities);

// Get user preferences by ID
router.get('/:id/preferences', usersController.getUserPreferences);

// Get user by ID
router.get('/:id', usersController.getUserById);

export default router;