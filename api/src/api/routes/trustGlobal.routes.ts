import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware';
import { trustController } from '../controllers/trust.controller';
import {
  validateListMyEventsAllCommunities,
  validateListMyTrustAcrossCommunities,
} from '../validators/trust.validator';

const router = Router();

// All routes require an authenticated session
router.use(verifyToken);

// NOTE: This router is expected to be mounted at '/api/v1'
// 1) User trust events across all communities
// Final path: GET /api/v1/user/trust/events
router.get(
  '/user/trust/events',
  validateListMyEventsAllCommunities,
  trustController.listMyEventsAllCommunities.bind(trustController)
);

// 2) User trust view (points) across all communities
// Final path: GET /api/v1/users/trust/communities
router.get(
  '/users/trust/communities',
  validateListMyTrustAcrossCommunities,
  trustController.listMyTrustAcrossCommunities.bind(trustController)
);

export default router;
