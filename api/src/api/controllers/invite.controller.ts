import { Request, Response, NextFunction } from 'express';
/**
 * @swagger
 * components:
 *   schemas:
 *     Invite:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         communityId:
 *           type: string
 *           format: uuid
 *         type:
 *           type: string
 *           enum: [user, link]
 *         role:
 *           type: string
 *           enum: [admin, member, reader]
 *         invitedUserId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *         title:
 *           type: string
 *           nullable: true
 *         secret:
 *           type: string
 *           nullable: true
 *         expiresAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         status:
 *           type: string
 *           enum: [pending, redeemed, cancelled, expired]
 *         createdBy:
 *           type: string
 *           format: uuid
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         redeemedBy:
 *           type: string
 *           format: uuid
 *           nullable: true
 *         redeemedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *         cancelledAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 */

import { inviteService } from '@/services/invite.service';
import { ApiResponse } from '@/utils/response';

export class InviteController {
  /**
   * @swagger
   * /api/v1/invites/communities/{communityId}/users:
   *   post:
   *     summary: Create a user invite for a community
   *     tags: [Invites]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: communityId
   *         schema:
   *           type: string
   *           format: uuid
   *         required: true
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [invitedUserId, role]
   *             properties:
   *               invitedUserId:
   *                 type: string
   *                 format: uuid
   *               role:
   *                 type: string
   *                 enum: [admin, member, reader]
   *                 example: "member"
   *                 description: The role to grant when the invite is redeemed
   *     responses:
   *       201:
   *         description: Invite created
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Invite'
   *             example:
   *               $ref: '#/components/schemas/Invite'
   *       400:
   *         description: Bad Request
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: "error"
   *                 message:
   *                   type: string
   *                   example: "Validation failed"
   *       401:
   *         description: Unauthorized
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: "error"
   *                 message:
   *                   type: string
   *                   example: "Unauthorized"
   *       403:
   *         description: Forbidden
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: "error"
   *                 message:
   *                   type: string
   *                   example: "Forbidden"
   */
  async createUserInvite(req: Request, res: Response, next: NextFunction) {
    try {
      const requesterId = (req as any).user?.id;
      const { communityId } = req.params as { communityId: string };
      const { invitedUserId, role } = req.body as { invitedUserId: string; role: string };
      console.log(`[InviteController] Creating user invite: communityId=${communityId}, invitedUserId=${invitedUserId}, role=${role}, requesterId=${requesterId}`);
      const invite = await inviteService.createUserInvite(
        { communityId, invitedUserId, role },
        requesterId
      );
      console.log(`[InviteController] Created invite with ID: ${invite.id}`);
      return ApiResponse.created(res, invite, 'Invite created');
    } catch (err) {
      console.error('[InviteController] Error creating invite:', err);
      next(err);
    }
  }

  /**
   * @swagger
   * /api/v1/invites/communities/{communityId}/links:
   *   post:
   *     summary: Create a link invite for a community
   *     tags: [Invites]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: communityId
   *         schema:
   *           type: string
   *           format: uuid
   *         required: true
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [role, expiresAt]
   *             properties:
   *               role:
   *                 type: string
   *                 enum: [admin, member, reader]
   *                 example: "member"
   *                 description: The role to grant when the invite is redeemed
   *               title:
   *                 type: string
   *                 example: "Launch Party Invite"
   *               expiresAt:
   *                 type: string
   *                 format: date-time
   *                 example: "2024-12-31T23:59:59Z"
   *     responses:
   *       201:
   *         description: Link invite created
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Invite'
   *             example:
   *               $ref: '#/components/schemas/Invite'
   *       400:
   *         description: Bad Request
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: "error"
   *                 message:
   *                   type: string
   *                   example: "Validation failed"
   *       401:
   *         description: Unauthorized
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: "error"
   *                 message:
   *                   type: string
   *                   example: "Unauthorized"
   *       403:
   *         description: Forbidden
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: "error"
   *                 message:
   *                   type: string
   *                   example: "Forbidden"
   */
  async createLinkInvite(req: Request, res: Response, next: NextFunction) {
    try {
      const requesterId = (req as any).user?.id;
      const { communityId } = req.params as { communityId: string };
      const { role, title, expiresAt } = req.body as { role: string; title?: string; expiresAt: string };
      const invite = await inviteService.createLinkInvite(
        { communityId, role, title, expiresAt },
        requesterId
      );
      return ApiResponse.created(res, invite, 'Link invite created');
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /api/v1/invites/{id}:
   *   delete:
   *     summary: Cancel an invite (user or link)
   *     tags: [Invites]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: string
   *           format: uuid
   *         required: true
   *     responses:
   *       200:
   *         description: Invite cancelled
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Invite'
   *             example:
   *               $ref: '#/components/schemas/Invite'
   *       400:
   *         description: Not cancellable
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: "error"
   *                 message:
   *                   type: string
   *                   example: "Invite cannot be cancelled"
   *       401:
   *         description: Unauthorized
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: "error"
   *                 message:
   *                   type: string
   *                   example: "Unauthorized"
   *       403:
   *         description: Forbidden
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: "error"
   *                 message:
   *                   type: string
   *                   example: "Forbidden"
   *       404:
   *         description: Not found
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: "error"
   *                 message:
   *                   type: string
   *                   example: "Invite not found"
   */
  async cancelInvite(req: Request, res: Response, next: NextFunction) {
    try {
      const requesterId = (req as any).user?.id;
      const { id } = req.params as { id: string };
      const invite = await inviteService.cancelInvite(id, requesterId);
      return ApiResponse.success(res, invite, 'Invite cancelled');
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /api/v1/invites/{id}/redeem:
   *   post:
   *     summary: Redeem a user invite (invited user only)
   *     tags: [Invites]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: string
   *           format: uuid
   *         required: true
   *     responses:
   *       200:
   *         description: Invite redeemed
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Invite'
   *             example:
   *               $ref: '#/components/schemas/Invite'
   *       400:
   *         description: Not redeemable
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: "error"
   *                 message:
   *                   type: string
   *                   example: "Invite cannot be redeemed"
   *       401:
   *         description: Unauthorized
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: "error"
   *                 message:
   *                   type: string
   *                   example: "Unauthorized"
   *       403:
   *         description: Forbidden
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: "error"
   *                 message:
   *                   type: string
   *                   example: "Forbidden"
   *       404:
   *         description: Not found
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: "error"
   *                 message:
   *                   type: string
   *                   example: "Invite not found"
   */
  async redeemUserInvite(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const { id } = req.params as { id: string };
      const invite = await inviteService.redeemUserInvite(id, userId);
      return ApiResponse.success(res, invite, 'Invite redeemed');
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /api/v1/invites/links/redeem:
   *   post:
   *     summary: Redeem a link invite by secret
   *     tags: [Invites]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [secret]
   *             properties:
   *               secret:
   *                 type: string
   *     responses:
   *       200:
   *         description: Link invite redeemed
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Invite'
   *             example:
   *               $ref: '#/components/schemas/Invite'
   *       400:
   *         description: Not redeemable
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: "error"
   *                 message:
   *                   type: string
   *                   example: "Invite cannot be redeemed"
   *       401:
   *         description: Unauthorized
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: "error"
   *                 message:
   *                   type: string
   *                   example: "Unauthorized"
   *       404:
   *         description: Not found
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: "error"
   *                 message:
   *                   type: string
   *                   example: "Invite not found"
   *       410:
   *         description: Expired
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: "error"
   *                 message:
   *                   type: string
   *                   example: "Invite expired"
   */
  async redeemLinkInvite(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const { secret } = req.body as { secret: string };
      const invite = await inviteService.redeemLinkInviteBySecret(secret, userId);
      return ApiResponse.success(res, invite, 'Link invite redeemed');
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /api/v1/invites/communities/{communityId}/users:
   *   get:
   *     summary: Get pending user invites for a community
   *     tags: [Invites]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: communityId
   *         schema:
   *           type: string
   *           format: uuid
   *         required: true
   *     responses:
   *       200:
   *         description: List of pending user invites
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Invite'
   *             example:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Invite'
   *       401:
   *         description: Unauthorized
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: "error"
   *                 message:
   *                   type: string
   *                   example: "Unauthorized"
   *       403:
   *         description: Forbidden (not admin)
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: "error"
   *                 message:
   *                   type: string
   *                   example: "Forbidden: Admin access required"
   *       404:
   *         description: Community not found
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: "error"
   *                 message:
   *                   type: string
   *                   example: "Community not found"
   */
  async getUserInvites(req: Request, res: Response, next: NextFunction) {
    try {
      const requesterId = (req as any).user?.id;
      const { communityId } = req.params as { communityId: string };
      const invites = await inviteService.getPendingUserInvites(communityId, requesterId);
      return ApiResponse.success(res, invites);
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /api/v1/invites/communities/{communityId}/links:
   *   get:
   *     summary: Get active link invites for a community
   *     tags: [Invites]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: communityId
   *         schema:
   *           type: string
   *           format: uuid
   *         required: true
   *     responses:
   *       200:
   *         description: List of active link invites
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Invite'
   *             example:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/Invite'
   *       401:
   *         description: Unauthorized
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: "error"
   *                 message:
   *                   type: string
   *                   example: "Unauthorized"
   *       403:
   *         description: Forbidden (not admin)
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: "error"
   *                 message:
   *                   type: string
   *                   example: "Forbidden: Admin access required"
   *       404:
   *         description: Community not found
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: "error"
   *                 message:
   *                   type: string
   *                   example: "Community not found"
   */
  async getLinkInvites(req: Request, res: Response, next: NextFunction) {
    try {
      const requesterId = (req as any).user?.id;
      const { communityId } = req.params as { communityId: string };
      const invites = await inviteService.getActiveLinkInvites(communityId, requesterId);
      return ApiResponse.success(res, invites);
    } catch (err) {
      next(err);
    }
  }
  
  /**
   * @swagger
   * /api/v1/invites/communities/{communityId}/links/{id}:
   *   delete:
   *     summary: Delete/cancel a specific link invite
   *     tags: [Invites]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: communityId
   *         schema:
   *           type: string
   *           format: uuid
   *         required: true
   *       - in: path
   *         name: id
   *         schema:
   *           type: string
   *           format: uuid
   *         required: true
   *     responses:
   *       200:
   *         description: Link invite deleted
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Invite'
   *             example:
   *               $ref: '#/components/schemas/Invite'
   *       400:
   *         description: Not cancellable
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: "error"
   *                 message:
   *                   type: string
   *                   example: "Invite cannot be cancelled"
   *       401:
   *         description: Unauthorized
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: "error"
   *                 message:
   *                   type: string
   *                   example: "Unauthorized"
   *       403:
   *         description: Forbidden
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: "error"
   *                 message:
   *                   type: string
   *                   example: "Forbidden"
   *       404:
   *         description: Not found
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 status:
   *                   type: string
   *                   example: "error"
   *                 message:
   *                   type: string
   *                   example: "Invite not found"
   */
  async deleteLinkInvite(req: Request, res: Response, next: NextFunction) {
    try {
      const requesterId = (req as any).user?.id;
      const { id } = req.params as { id: string };
      const invite = await inviteService.cancelInvite(id, requesterId);
      return ApiResponse.success(res, invite, 'Link invite deleted');
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /api/v1/invites/{id}:
   *   delete:
   *     summary: Cancel an invite (user or link)
   *     tags: [Invites]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         schema:
   *           type: string
   *           format: uuid
   *         required: true
   *     responses:
   *       200:
   *         description: Invite cancelled
   *       400:
   *         description: Not cancellable
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Not found
   */
}

export const inviteController = new InviteController();
