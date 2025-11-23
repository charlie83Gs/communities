import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware';
import { poolsController } from '@api/controllers/pools.controller';
import {
  validateCreatePool,
  validateGetPool,
  validateListCommunityPools,
  validateUpdatePool,
  validateDeletePool,
  validateContributeToPool,
  validateListPendingContributions,
  validateConfirmContribution,
  validateRejectContribution,
  validateDistributeFromPool,
  validateMassDistribute,
  validatePreviewMassDistribution,
  validateGetPoolInventory,
  validateGetPoolNeeds,
} from '@api/validators/pools.validator';

const router = Router();

/**
 * Pool Management Endpoints
 * All endpoints require authentication
 * Council manager permissions checked in service layer
 */

/**
 * Create Pool
 * POST /api/v1/communities/:communityId/councils/:councilId/pools
 * - Requires: Council manager role
 */
router.post(
  '/communities/:communityId/councils/:councilId/pools',
  verifyToken,
  validateCreatePool,
  poolsController.create
);

/**
 * List Community Pools
 * GET /api/v1/communities/:communityId/pools
 * - Requires: Community membership
 */
router.get(
  '/communities/:communityId/pools',
  verifyToken,
  validateListCommunityPools,
  poolsController.listCommunityPools
);

/**
 * Get Pool Details
 * GET /api/v1/communities/:communityId/pools/:poolId
 * - Requires: Community membership
 */
router.get(
  '/communities/:communityId/pools/:poolId',
  verifyToken,
  validateGetPool,
  poolsController.getById
);

/**
 * Update Pool
 * PATCH /api/v1/communities/:communityId/pools/:poolId
 * - Requires: Council manager role
 */
router.patch(
  '/communities/:communityId/pools/:poolId',
  verifyToken,
  validateUpdatePool,
  poolsController.update
);

/**
 * Delete Pool
 * DELETE /api/v1/communities/:communityId/pools/:poolId
 * - Requires: Council manager role
 */
router.delete(
  '/communities/:communityId/pools/:poolId',
  verifyToken,
  validateDeletePool,
  poolsController.delete
);

/**
 * Pool Contribution Endpoints
 */

/**
 * Contribute to Pool
 * POST /api/v1/communities/:communityId/pools/:poolId/contributions
 * - Requires: Permission to create wealth (trust-gated)
 * - Creates wealth entry with targetPoolId
 */
router.post(
  '/communities/:communityId/pools/:poolId/contributions',
  verifyToken,
  validateContributeToPool,
  poolsController.contributeToPool
);

/**
 * List Pending Contributions
 * GET /api/v1/communities/:communityId/pools/:poolId/contributions/pending
 * - Requires: Council manager role
 */
router.get(
  '/communities/:communityId/pools/:poolId/contributions/pending',
  verifyToken,
  validateListPendingContributions,
  poolsController.listPendingContributions
);

/**
 * Confirm Contribution
 * PATCH /api/v1/communities/:communityId/pools/:poolId/contributions/:wealthId/confirm
 * - Requires: Council manager role
 * - Updates inventory
 */
router.patch(
  '/communities/:communityId/pools/:poolId/contributions/:wealthId/confirm',
  verifyToken,
  validateConfirmContribution,
  poolsController.confirmContribution
);

/**
 * Reject Contribution
 * PATCH /api/v1/communities/:communityId/pools/:poolId/contributions/:wealthId/reject
 * - Requires: Council manager role
 */
router.patch(
  '/communities/:communityId/pools/:poolId/contributions/:wealthId/reject',
  verifyToken,
  validateRejectContribution,
  poolsController.rejectContribution
);

/**
 * Pool Distribution Endpoints
 * IMPORTANT: More specific routes MUST come before less specific ones
 * Express matches routes in order, so /mass/preview must be before /mass, which must be before base /distributions
 */

/**
 * Preview Mass Distribution
 * POST /api/v1/communities/:communityId/pools/:poolId/distributions/mass/preview
 * - Requires: Council manager role
 * - Returns preview of distribution based on needs
 */
router.post(
  '/communities/:communityId/pools/:poolId/distributions/mass/preview',
  verifyToken,
  validatePreviewMassDistribution,
  poolsController.previewMassDistribution
);

/**
 * Mass Distribution
 * POST /api/v1/communities/:communityId/pools/:poolId/distributions/mass
 * - Requires: Council manager role
 * - Creates multiple wealth entries based on needs
 */
router.post(
  '/communities/:communityId/pools/:poolId/distributions/mass',
  verifyToken,
  validateMassDistribute,
  poolsController.executeMassDistribution
);

/**
 * List Distributions
 * GET /api/v1/communities/:communityId/pools/:poolId/distributions
 * - Requires: Council manager role
 * - Returns list of distributions from pool
 */
router.get(
  '/communities/:communityId/pools/:poolId/distributions',
  verifyToken,
  validateGetPool,
  poolsController.listDistributions
);

/**
 * Manual Distribution
 * POST /api/v1/communities/:communityId/pools/:poolId/distributions
 * - Requires: Council manager role
 * - Creates wealth entry with sourcePoolId
 */
router.post(
  '/communities/:communityId/pools/:poolId/distributions',
  verifyToken,
  validateDistributeFromPool,
  poolsController.distributeFromPool
);

/**
 * Pool Needs Endpoint
 */

/**
 * Get Pool Needs
 * GET /api/v1/communities/:communityId/pools/:poolId/needs
 * - Requires: Council manager role
 * - Returns aggregated needs for pool's whitelisted items
 */
router.get(
  '/communities/:communityId/pools/:poolId/needs',
  verifyToken,
  validateGetPoolNeeds,
  poolsController.getPoolNeeds
);

/**
 * Pool Inventory Endpoint
 */

/**
 * Get Pool Inventory
 * GET /api/v1/communities/:communityId/pools/:poolId/inventory
 * - Requires: Community membership
 */
router.get(
  '/communities/:communityId/pools/:poolId/inventory',
  verifyToken,
  validateGetPoolInventory,
  poolsController.getInventory
);

export default router;
