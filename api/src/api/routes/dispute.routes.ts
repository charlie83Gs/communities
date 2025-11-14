import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware';
import { disputeController } from '../controllers/dispute.controller';
import {
  validateCreateDispute,
  validateGetDispute,
  validateListDisputes,
  validateAddParticipant,
  validateProposeMediator,
  validateRespondToMediator,
  validateCreateResolution,
  validateCreateMessage,
  validateGetMessages,
  validateUpdateDisputeStatus,
} from '../validators/dispute.validator';

const router = Router();

/**
 * All dispute endpoints require authentication
 * Authorization is handled in the service layer based on:
 * - Trust thresholds (minTrustForDisputeVisibility, minTrustForDisputeParticipation)
 * - Participant/mediator status
 * - Community admin role
 */

// List disputes in community
router.get(
  '/communities/:communityId/disputes',
  verifyToken,
  validateListDisputes,
  disputeController.list
);

// Create new dispute
router.post(
  '/communities/:communityId/disputes',
  verifyToken,
  validateCreateDispute,
  disputeController.create
);

// Get dispute details
router.get(
  '/communities/:communityId/disputes/:disputeId',
  verifyToken,
  validateGetDispute,
  disputeController.getById
);

// Add participant to dispute
router.post(
  '/communities/:communityId/disputes/:disputeId/participants',
  verifyToken,
  validateAddParticipant,
  disputeController.addParticipant
);

// Propose as mediator
router.post(
  '/communities/:communityId/disputes/:disputeId/mediators',
  verifyToken,
  validateProposeMediator,
  disputeController.proposeMediator
);

// Accept/reject mediator proposal
router.put(
  '/communities/:communityId/disputes/:disputeId/mediators/:mediatorId',
  verifyToken,
  validateRespondToMediator,
  disputeController.respondToMediator
);

// Create resolution (mediator only)
router.post(
  '/communities/:communityId/disputes/:disputeId/resolutions',
  verifyToken,
  validateCreateResolution,
  disputeController.createResolution
);

// Add message to dispute
router.post(
  '/communities/:communityId/disputes/:disputeId/messages',
  verifyToken,
  validateCreateMessage,
  disputeController.createMessage
);

// Get messages for dispute
router.get(
  '/communities/:communityId/disputes/:disputeId/messages',
  verifyToken,
  validateGetMessages,
  disputeController.getMessages
);

// Update dispute status
router.put(
  '/communities/:communityId/disputes/:disputeId/status',
  verifyToken,
  validateUpdateDisputeStatus,
  disputeController.updateStatus
);

export default router;
