import { Response, NextFunction, Request } from 'express';
import { AuthenticatedRequest } from '@/api/middleware/auth.middleware';
import { checkoutLinksService } from '@/services/checkoutLinks.service';
import { ApiResponse } from '@/utils/response';
import logger from '@/utils/logger';

/**
 * @swagger
 * tags:
 *   name: CheckoutLinks
 *   description: Sharing Markets - QR code checkout links for pools and shares
 */
class CheckoutLinksController {
  // ========== Pool Checkout Links ==========

  /**
   * @swagger
   * /api/v1/pools/{poolId}/checkout-links:
   *   post:
   *     summary: Create a pool checkout link
   *     tags: [CheckoutLinks]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: poolId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - itemId
   *             properties:
   *               itemId:
   *                 type: string
   *                 format: uuid
   *               maxUnitsPerCheckout:
   *                 type: number
   *                 nullable: true
   *     responses:
   *       201:
   *         description: Checkout link created successfully
   *       403:
   *         description: Only council members or admins can create pool checkout links
   */
  async createPoolCheckoutLink(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { poolId } = req.params;
      const userId = req.user!.id;

      const link = await checkoutLinksService.createPoolCheckoutLink(poolId, req.body, userId);

      logger.info('Pool checkout link created', { poolId, linkId: link.id, userId });
      return ApiResponse.created(res, link, 'Pool checkout link created successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/pools/{poolId}/checkout-links:
   *   get:
   *     summary: List pool checkout links
   *     tags: [CheckoutLinks]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: poolId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: List of checkout links
   */
  async listPoolCheckoutLinks(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { poolId } = req.params;
      const userId = req.user!.id;

      const links = await checkoutLinksService.listPoolCheckoutLinks(poolId, userId);

      return ApiResponse.success(res, { links }, 'Pool checkout links retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/pools/{poolId}/checkout-links/{linkId}/revoke:
   *   post:
   *     summary: Revoke a pool checkout link
   *     tags: [CheckoutLinks]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: poolId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *       - in: path
   *         name: linkId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               reason:
   *                 type: string
   *     responses:
   *       200:
   *         description: Checkout link revoked successfully
   */
  async revokePoolCheckoutLink(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { poolId, linkId } = req.params;
      const userId = req.user!.id;

      await checkoutLinksService.revokePoolCheckoutLink(poolId, linkId, req.body, userId);

      logger.info('Pool checkout link revoked', { poolId, linkId, userId });
      return ApiResponse.success(res, null, 'Pool checkout link revoked successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/pools/{poolId}/checkout-links/{linkId}/regenerate:
   *   post:
   *     summary: Regenerate a pool checkout link (creates new code, revokes old)
   *     tags: [CheckoutLinks]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: poolId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *       - in: path
   *         name: linkId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       201:
   *         description: Checkout link regenerated successfully
   */
  async regeneratePoolCheckoutLink(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { poolId, linkId } = req.params;
      const userId = req.user!.id;

      const newLink = await checkoutLinksService.regeneratePoolCheckoutLink(poolId, linkId, userId);

      logger.info('Pool checkout link regenerated', { poolId, oldLinkId: linkId, newLinkId: newLink.id, userId });
      return ApiResponse.created(res, newLink, 'Pool checkout link regenerated successfully');
    } catch (error) {
      next(error);
    }
  }

  // ========== Share Checkout Links ==========

  /**
   * @swagger
   * /api/v1/wealth/{shareId}/checkout-link:
   *   post:
   *     summary: Create a share checkout link
   *     tags: [CheckoutLinks]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: shareId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     requestBody:
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               maxUnitsPerCheckout:
   *                 type: number
   *                 nullable: true
   *     responses:
   *       201:
   *         description: Checkout link created successfully
   *       403:
   *         description: Only share owner or admin can create checkout links
   */
  async createShareCheckoutLink(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { shareId } = req.params;
      const userId = req.user!.id;

      const link = await checkoutLinksService.createShareCheckoutLink(shareId, req.body, userId);

      logger.info('Share checkout link created', { shareId, linkId: link.id, userId });
      return ApiResponse.created(res, link, 'Share checkout link created successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/wealth/{shareId}/checkout-link:
   *   get:
   *     summary: Get share checkout link info
   *     tags: [CheckoutLinks]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: shareId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: Checkout link info retrieved successfully
   */
  async getShareCheckoutLinkInfo(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { shareId } = req.params;
      const userId = req.user!.id;

      const link = await checkoutLinksService.getShareCheckoutLinkInfo(shareId, userId);

      return ApiResponse.success(res, link, 'Share checkout link info retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/wealth/{shareId}/checkout-link:
   *   delete:
   *     summary: Revoke a share checkout link
   *     tags: [CheckoutLinks]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: shareId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: Checkout link revoked successfully
   */
  async revokeShareCheckoutLink(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { shareId } = req.params;
      const userId = req.user!.id;

      await checkoutLinksService.revokeShareCheckoutLink(shareId, userId);

      logger.info('Share checkout link revoked', { shareId, userId });
      return ApiResponse.success(res, null, 'Share checkout link revoked successfully');
    } catch (error) {
      next(error);
    }
  }

  // ========== Public Checkout Endpoints ==========

  /**
   * @swagger
   * /api/v1/checkout/{linkCode}:
   *   get:
   *     summary: Get checkout details (PUBLIC - no auth required)
   *     tags: [CheckoutLinks]
   *     parameters:
   *       - in: path
   *         name: linkCode
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Checkout details retrieved successfully
   *       404:
   *         description: Checkout link not found
   */
  async getCheckoutDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const { linkCode } = req.params;

      const details = await checkoutLinksService.getCheckoutDetails(linkCode);

      return ApiResponse.success(res, details, 'Checkout details retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/checkout/{linkCode}:
   *   post:
   *     summary: Complete a checkout (requires auth - user must be community member)
   *     tags: [CheckoutLinks]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: linkCode
   *         required: true
   *         schema:
   *           type: string
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - units
   *             properties:
   *               units:
   *                 type: number
   *     responses:
   *       201:
   *         description: Checkout completed successfully
   *       403:
   *         description: Insufficient trust or not a community member
   *       501:
   *         description: Checkout completion not yet implemented
   */
  async completeCheckout(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { linkCode } = req.params;
      const userId = req.user!.id;

      const result = await checkoutLinksService.completeCheckout(linkCode, req.body, userId);

      logger.info('Checkout completed', { linkCode, userId, units: req.body.units });
      return ApiResponse.created(res, result, 'Checkout completed successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const checkoutLinksController = new CheckoutLinksController();
