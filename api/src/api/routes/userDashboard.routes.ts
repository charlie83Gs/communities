import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware';
import { userDashboardController } from '../controllers/userDashboard.controller';

const router = Router();

// All user dashboard endpoints require authentication
router.use(verifyToken);

/**
 * User dashboard endpoints:
 * - GET /user/communities/summary (aggregated dashboard data)
 */
router.get('/communities/summary', userDashboardController.getCommunitiesSummary);

export default router;
