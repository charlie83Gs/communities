import { Router } from 'express';
import { verifyToken, verifyTokenOptional } from '../middleware/auth.middleware';
import { inviteController } from '@api/controllers/invite.controller';
import {
  validateCreateUserInvite,
  validateCreateLinkInvite,
  validateCancelInvite,
  validateRedeemUserInvite,
  validateRedeemLinkInvite,
  validateGetUserInvites,
  validateGetLinkInvites,
  validateDeleteLinkInvite,
} from '@api/validators/invite.validator';

const router = Router();

// All invite endpoints require an authenticated session
router.use(verifyToken);

// Create a user invite (admin-only via service check)
router.get(
  '/communities/:communityId/users',
  validateGetUserInvites,
  inviteController.getUserInvites
);

router.post(
  '/communities/:communityId/users',
  validateCreateUserInvite,
  inviteController.createUserInvite
);

// Create a link invite (admin-only via service check)
router.get(
  '/communities/:communityId/links',
  validateGetLinkInvites,
  inviteController.getLinkInvites
);

router.post(
  '/communities/:communityId/links',
  validateCreateLinkInvite,
  inviteController.createLinkInvite
);

// Delete a specific link invite (admin or creator)
router.delete(
  '/communities/:communityId/links/:id',
  validateDeleteLinkInvite,
  inviteController.deleteLinkInvite
);

// Cancel an invite (creator or admin via service check)
router.delete('/:id', validateCancelInvite, inviteController.cancelInvite);

// Redeem a user invite (only the invited user)
router.post('/:id/redeem', validateRedeemUserInvite, inviteController.redeemUserInvite);

// Redeem a link invite by secret (any authenticated user with valid secret)
router.post('/links/redeem', validateRedeemLinkInvite, inviteController.redeemLinkInvite);

export default router;
