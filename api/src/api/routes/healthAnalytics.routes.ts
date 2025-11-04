import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware';
import { healthAnalyticsController } from '../controllers/healthAnalytics.controller';

const router = Router();

/**
 * All health analytics endpoints require authentication
 * Authorization is handled in the service layer (admin or trust threshold)
 */

// Wealth analytics
router.get(
  '/:communityId/health/wealth/overview',
  verifyToken,
  healthAnalyticsController.getWealthOverview
);

router.get(
  '/:communityId/health/wealth/items',
  verifyToken,
  healthAnalyticsController.getWealthItems
);

// Trust analytics
router.get(
  '/:communityId/health/trust/overview',
  verifyToken,
  healthAnalyticsController.getTrustOverview
);

router.get(
  '/:communityId/health/trust/distribution',
  verifyToken,
  healthAnalyticsController.getTrustDistribution
);

export default router;
