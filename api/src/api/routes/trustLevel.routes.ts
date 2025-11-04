import { Router } from 'express';
import { verifyToken, verifyTokenOptional } from '../middleware/auth.middleware';
import { trustLevelController } from '../controllers/trustLevel.controller';
import {
  validateCreateTrustLevel,
  validateUpdateTrustLevel,
  validateGetTrustLevel,
  validateListTrustLevels,
  validateDeleteTrustLevel,
  validateResolveTrustReference,
} from '../validators/trustLevel.validator';

const router = Router();

/**
 * All trust level endpoints require authentication
 * Admin-level operations (create, update, delete) are enforced at the service level
 */

// List all trust levels for a community
router.get(
  '/:communityId/trust-levels',
  verifyToken,
  validateListTrustLevels,
  trustLevelController.list
);

// Resolve a trust level reference to a numeric value (must be before /:levelId to avoid route conflict)
router.get(
  '/:communityId/trust-levels/resolve/:reference',
  verifyToken,
  validateResolveTrustReference,
  trustLevelController.resolve
);

// Get a specific trust level
router.get(
  '/:communityId/trust-levels/:levelId',
  verifyToken,
  validateGetTrustLevel,
  trustLevelController.getById
);

// Create a new trust level (admin only - enforced in service)
router.post(
  '/:communityId/trust-levels',
  verifyToken,
  validateCreateTrustLevel,
  trustLevelController.create
);

// Update a trust level (admin only - enforced in service)
router.put(
  '/:communityId/trust-levels/:levelId',
  verifyToken,
  validateUpdateTrustLevel,
  trustLevelController.update
);

// Delete a trust level (admin only - enforced in service)
router.delete(
  '/:communityId/trust-levels/:levelId',
  verifyToken,
  validateDeleteTrustLevel,
  trustLevelController.delete
);

export default router;
