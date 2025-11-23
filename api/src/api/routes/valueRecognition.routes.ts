import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware';
import { valueRecognitionController } from '../controllers/valueRecognition.controller';
import {
  validateLogContribution,
  validateVerifyContribution,
  validateDisputeContribution,
  validateGrantPeerRecognition,
  validateGetContributionProfile,
  validateGetPendingVerifications,
  validateGetPeerRecognitionLimits,
  validateGetPeerRecognitionGrants,
  validateUpdateItemValue,
  validateGetValueCalibrationHistory,
} from '../validators/valueRecognition.validator';

const router = Router();

/**
 * Contribution Logging & Management
 */

// Log a new contribution
router.post(
  '/communities/:communityId/contributions',
  verifyToken,
  validateLogContribution,
  valueRecognitionController.logContribution
);

// Get my contribution profile
router.get(
  '/communities/:communityId/contributions/profile/me',
  verifyToken,
  validateGetContributionProfile,
  valueRecognitionController.getMyProfile
);

// Get my contributions list
router.get(
  '/communities/:communityId/contributions/my',
  verifyToken,
  validateGetContributionProfile,
  valueRecognitionController.getMyContributions
);

// Get user's contribution profile
router.get(
  '/communities/:communityId/contributions/profile/:userId',
  verifyToken,
  validateGetContributionProfile,
  valueRecognitionController.getUserProfile
);

// Get pending verifications for current user
router.get(
  '/communities/:communityId/contributions/pending-verifications',
  verifyToken,
  validateGetPendingVerifications,
  valueRecognitionController.getPendingVerifications
);

// Verify a contribution
router.post(
  '/communities/:communityId/contributions/:contributionId/verify',
  verifyToken,
  validateVerifyContribution,
  valueRecognitionController.verifyContribution
);

// Dispute a contribution
router.post(
  '/communities/:communityId/contributions/:contributionId/dispute',
  verifyToken,
  validateDisputeContribution,
  valueRecognitionController.disputeContribution
);

/**
 * Peer Recognition
 */

// Grant peer recognition
router.post(
  '/communities/:communityId/peer-recognition',
  verifyToken,
  validateGrantPeerRecognition,
  valueRecognitionController.grantPeerRecognition
);

// Get peer recognition limits
router.get(
  '/communities/:communityId/peer-recognition/limits',
  verifyToken,
  validateGetPeerRecognitionLimits,
  valueRecognitionController.getPeerRecognitionLimits
);

// Get my peer recognition grants (given and received)
router.get(
  '/communities/:communityId/peer-recognition/my',
  verifyToken,
  validateGetPeerRecognitionGrants,
  valueRecognitionController.getMyPeerRecognition
);

/**
 * Item Value Calibration
 */

// Update item value (calibration)
router.patch(
  '/communities/:communityId/items/:itemId/value',
  verifyToken,
  validateUpdateItemValue,
  valueRecognitionController.updateItemValue
);

// Get value calibration history
router.get(
  '/communities/:communityId/value-calibration-history',
  verifyToken,
  validateGetValueCalibrationHistory,
  valueRecognitionController.getValueCalibrationHistory
);

export default router;
