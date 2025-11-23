import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware';
import { checkoutLinksController } from '@api/controllers/checkoutLinks.controller';
import {
  validateCreatePoolCheckoutLink,
  validateRevokePoolCheckoutLink,
  validateCreateShareCheckoutLink,
  validateCompleteCheckout,
} from '@api/validators/checkoutLinks.validator';

const router = Router();

/**
 * FT-21: Sharing Markets - Checkout Links
 * Enables frictionless self-checkout via QR codes for pools and shares
 */

// ========== Pool Checkout Links ==========

/**
 * Create Pool Checkout Link
 * POST /api/v1/pools/:poolId/checkout-links
 * - Requires: Council member or community admin
 * - Generates QR code and checkout URL
 */
router.post(
  '/pools/:poolId/checkout-links',
  verifyToken,
  validateCreatePoolCheckoutLink,
  checkoutLinksController.createPoolCheckoutLink
);

/**
 * List Pool Checkout Links
 * GET /api/v1/pools/:poolId/checkout-links
 * - Requires: Council member or community admin
 * - Returns all links for pool with stats
 */
router.get(
  '/pools/:poolId/checkout-links',
  verifyToken,
  checkoutLinksController.listPoolCheckoutLinks
);

/**
 * Revoke Pool Checkout Link
 * POST /api/v1/pools/:poolId/checkout-links/:linkId/revoke
 * - Requires: Council member or community admin
 * - Deactivates link immediately
 */
router.post(
  '/pools/:poolId/checkout-links/:linkId/revoke',
  verifyToken,
  validateRevokePoolCheckoutLink,
  checkoutLinksController.revokePoolCheckoutLink
);

/**
 * Regenerate Pool Checkout Link
 * POST /api/v1/pools/:poolId/checkout-links/:linkId/regenerate
 * - Requires: Council member or community admin
 * - Creates new code, revokes old link
 */
router.post(
  '/pools/:poolId/checkout-links/:linkId/regenerate',
  verifyToken,
  checkoutLinksController.regeneratePoolCheckoutLink
);

// ========== Share Checkout Links ==========

/**
 * Create Share Checkout Link
 * POST /api/v1/wealth/:shareId/checkout-link
 * - Requires: Share owner or community admin
 * - Generates QR code and checkout URL
 */
router.post(
  '/wealth/:shareId/checkout-link',
  verifyToken,
  validateCreateShareCheckoutLink,
  checkoutLinksController.createShareCheckoutLink
);

/**
 * Get Share Checkout Link Info
 * GET /api/v1/wealth/:shareId/checkout-link
 * - Requires: Share owner or community admin
 * - Returns link details and stats
 */
router.get(
  '/wealth/:shareId/checkout-link',
  verifyToken,
  checkoutLinksController.getShareCheckoutLinkInfo
);

/**
 * Revoke Share Checkout Link
 * DELETE /api/v1/wealth/:shareId/checkout-link
 * - Requires: Share owner or community admin
 * - Deactivates link immediately
 */
router.delete(
  '/wealth/:shareId/checkout-link',
  verifyToken,
  checkoutLinksController.revokeShareCheckoutLink
);

// ========== Public Checkout Endpoints ==========

/**
 * Get Checkout Details (PUBLIC - no auth)
 * GET /api/v1/checkout/:linkCode
 * - No authentication required
 * - Returns community, item, and availability info
 */
router.get(
  '/checkout/:linkCode',
  checkoutLinksController.getCheckoutDetails
);

/**
 * Complete Checkout (Authenticated)
 * POST /api/v1/checkout/:linkCode
 * - Requires: Community member with sufficient trust
 * - Creates auto-approved wealth request
 * - Updates link stats
 * - Rate limited (5 per hour per link)
 */
router.post(
  '/checkout/:linkCode',
  verifyToken,
  validateCompleteCheckout,
  checkoutLinksController.completeCheckout
);

export default router;
