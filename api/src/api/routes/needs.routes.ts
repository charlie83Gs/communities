import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware';
import { needsController } from '@api/controllers/needs.controller';
import {
  validateCreateNeed,
  validateUpdateNeed,
  validateCreateCouncilNeed,
  validateUpdateCouncilNeed,
  validateIdParam,
  validateNeedListQuery,
  validateCouncilNeedListQuery,
  validateAggregateNeedsQuery,
} from '@api/validators/needs.validator';

const router = Router();

// All needs endpoints require authentication
router.use(verifyToken);

// ========================================
// MEMBER NEEDS ROUTES (mounted at /api/v1/needs)
// ========================================

// Get aggregated needs - must come before /:id to avoid route conflict
// GET /api/v1/needs/aggregated?communityId=X
router.get(
  '/aggregated',
  validateAggregateNeedsQuery,
  needsController.getAggregatedNeeds.bind(needsController)
);

// List needs - GET /api/v1/needs?communityId=X&status=active&priority=need&isRecurring=true
router.get(
  '/',
  validateNeedListQuery,
  needsController.listNeeds.bind(needsController)
);

// Create need - POST /api/v1/needs
router.post(
  '/',
  validateCreateNeed,
  needsController.createNeed.bind(needsController)
);

// Get need by ID - GET /api/v1/needs/:id
router.get(
  '/:id',
  validateIdParam,
  needsController.getNeed.bind(needsController)
);

// Update need - PATCH /api/v1/needs/:id
router.patch(
  '/:id',
  validateUpdateNeed,
  needsController.updateNeed.bind(needsController)
);

// Delete need - DELETE /api/v1/needs/:id
router.delete(
  '/:id',
  validateIdParam,
  needsController.deleteNeed.bind(needsController)
);

// ========================================
// COUNCIL NEEDS ROUTES (mounted at /api/v1/needs/council)
// ========================================

// List council needs - GET /api/v1/needs/council?councilId=X&communityId=Y
router.get(
  '/council',
  validateCouncilNeedListQuery,
  needsController.listCouncilNeeds.bind(needsController)
);

// Create council need - POST /api/v1/needs/council
router.post(
  '/council',
  validateCreateCouncilNeed,
  needsController.createCouncilNeed.bind(needsController)
);

// Get council need by ID - GET /api/v1/needs/council/:id
router.get(
  '/council/:id',
  validateIdParam,
  needsController.getCouncilNeed.bind(needsController)
);

// Update council need - PATCH /api/v1/needs/council/:id
router.patch(
  '/council/:id',
  validateUpdateCouncilNeed,
  needsController.updateCouncilNeed.bind(needsController)
);

// Delete council need - DELETE /api/v1/needs/council/:id
router.delete(
  '/council/:id',
  validateIdParam,
  needsController.deleteCouncilNeed.bind(needsController)
);

export default router;
