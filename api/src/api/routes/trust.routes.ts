import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware';
import { trustController } from '../controllers/trust.controller';
import {
  validateGetEventsForUser,
  validateGetTrustView,
  validateListCommunityTrust,
  validateGetTrustMe,
  validateAwardTrust,
  validateRemoveTrust,
  validateListMyAwards,
  validateListAwardsToUser,
  validateGetTrustHistory,
  validateSetAdminGrant,
  validateGetAdminGrants,
  validateDeleteAdminGrant,
  validateGetTrustTimeline,
} from '../validators/trust.validator';

const router = Router();

// All trust endpoints require authentication; they are community-scoped
// Base path (mounted from app): /api/v1/communities
// This router defines paths under: /:communityId/trust/*

// ========== NEW TRUST AWARD ENDPOINTS ==========
router.post('/:communityId/trust/awards/:toUserId', verifyToken, validateAwardTrust, trustController.awardTrust);
router.delete('/:communityId/trust/awards/:toUserId', verifyToken, validateRemoveTrust, trustController.removeTrust);
router.get('/:communityId/trust/awards', verifyToken, validateListMyAwards, trustController.listMyAwards);
router.get('/:communityId/trust/awards/:userId', verifyToken, validateListAwardsToUser, trustController.listAwardsToUser);

// ========== TRUST HISTORY ==========
router.get('/:communityId/trust/history/:userId', verifyToken, validateGetTrustHistory, trustController.getTrustHistory);

// ========== ADMIN GRANT ENDPOINTS ==========
router.get('/:communityId/trust/admin/grants', verifyToken, validateGetAdminGrants, trustController.getAdminGrants);
router.post('/:communityId/trust/admin/grants/:toUserId', verifyToken, validateSetAdminGrant, trustController.setAdminGrant);
router.put('/:communityId/trust/admin/grants/:toUserId', verifyToken, validateSetAdminGrant, trustController.updateAdminGrant);
router.delete('/:communityId/trust/admin/grants/:toUserId', verifyToken, validateDeleteAdminGrant, trustController.deleteAdminGrant);

// ========== TRUST EVENTS (LEGACY) ==========
router.get('/:communityId/trust/events', verifyToken, validateGetEventsForUser, trustController.getEventsForUser);

// ========== TRUST VIEW (READ-ONLY) ==========
router.get('/:communityId/trust/users/:userId', verifyToken, validateGetTrustView, trustController.getTrustView);
router.get('/:communityId/trust/users', verifyToken, validateListCommunityTrust, trustController.listCommunityTrust);

// ========== ME SUMMARY ==========
router.get('/:communityId/trust/me', verifyToken, validateGetTrustMe, trustController.getTrustMe);

// ========== TRUST TIMELINE ==========
router.get('/:communityId/trust/timeline', verifyToken, validateGetTrustTimeline, trustController.getTrustTimeline);

// ========== TRUST DECAY ==========
router.get('/:communityId/trust/decaying', verifyToken, trustController.getDecayingEndorsements);
router.post('/:communityId/trust/recertify', verifyToken, trustController.recertifyTrust);
router.get('/:communityId/trust/status/:toUserId', verifyToken, trustController.getTrustStatus);

export default router;
