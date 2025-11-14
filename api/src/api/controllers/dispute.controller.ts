import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { disputeService } from '../../services/dispute.service';
import { ApiResponse } from '../../utils/response';
import logger from '../../utils/logger';

/**
 * @swagger
 * tags:
 *   name: Disputes
 *   description: Community dispute resolution and mediation endpoints
 */
class DisputeController {
  /**
   * @swagger
   * /api/v1/communities/{communityId}/disputes:
   *   post:
   *     summary: Create a new dispute
   *     tags: [Disputes]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: communityId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: Community ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - title
   *               - description
   *             properties:
   *               title:
   *                 type: string
   *                 minLength: 1
   *                 maxLength: 200
   *               description:
   *                 type: string
   *                 minLength: 1
   *               participantIds:
   *                 type: array
   *                 items:
   *                   type: string
   *     responses:
   *       201:
   *         description: Dispute created successfully
   *       400:
   *         description: Invalid request data
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Insufficient permissions
   */
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { communityId } = req.params;
      const userId = req.user!.id;
      const { title, description, participantIds } = req.body;

      const dispute = await disputeService.createDispute(communityId, userId, {
        title,
        description,
        participantIds,
      });

      logger.info('Dispute created via API', { disputeId: dispute.id, communityId, userId });
      return ApiResponse.created(res, dispute, 'Dispute created successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/disputes:
   *   get:
   *     summary: List disputes in community
   *     tags: [Disputes]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: communityId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           minimum: 0
   *           default: 0
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           default: 20
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [open, in_mediation, resolved, closed]
   *     responses:
   *       200:
   *         description: List of disputes
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Insufficient permissions
   */
  async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { communityId } = req.params;
      const userId = req.user!.id;
      const { page = 0, limit = 20, status } = req.query;

      const result = await disputeService.listDisputes(communityId, userId, {
        page: Number(page),
        limit: Number(limit),
        status: status as string | undefined,
      });

      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/disputes/{disputeId}:
   *   get:
   *     summary: Get dispute details
   *     tags: [Disputes]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: communityId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *       - in: path
   *         name: disputeId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: Dispute details
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Insufficient permissions
   *       404:
   *         description: Dispute not found
   */
  async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { disputeId } = req.params;
      const userId = req.user!.id;

      const dispute = await disputeService.getDisputeById(disputeId, userId);
      return ApiResponse.success(res, dispute);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/disputes/{disputeId}/participants:
   *   post:
   *     summary: Add participant to dispute
   *     tags: [Disputes]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: communityId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *       - in: path
   *         name: disputeId
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
   *               - userId
   *             properties:
   *               userId:
   *                 type: string
   *     responses:
   *       201:
   *         description: Participant added successfully
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Insufficient permissions
   */
  async addParticipant(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { disputeId } = req.params;
      const userId = req.user!.id;
      const { userId: participantId } = req.body;

      await disputeService.addParticipant(disputeId, participantId, userId);
      return ApiResponse.success(res, null, 'Participant added successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/disputes/{disputeId}/mediators:
   *   post:
   *     summary: Propose as mediator for dispute
   *     tags: [Disputes]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: communityId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *       - in: path
   *         name: disputeId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       201:
   *         description: Mediator proposal created
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Insufficient permissions
   */
  async proposeMediator(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { disputeId } = req.params;
      const userId = req.user!.id;

      const mediator = await disputeService.proposeAsMediator(disputeId, userId);
      return ApiResponse.created(res, mediator, 'Mediator proposal created successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/disputes/{disputeId}/mediators/{mediatorId}:
   *   put:
   *     summary: Accept or reject mediator proposal
   *     tags: [Disputes]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: communityId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *       - in: path
   *         name: disputeId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *       - in: path
   *         name: mediatorId
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
   *               - accept
   *             properties:
   *               accept:
   *                 type: boolean
   *     responses:
   *       200:
   *         description: Mediator response recorded
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Insufficient permissions
   */
  async respondToMediator(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { mediatorId } = req.params;
      const userId = req.user!.id;
      const { accept } = req.body;

      const mediator = await disputeService.respondToMediatorProposal(mediatorId, userId, accept);
      return ApiResponse.success(res, mediator, 'Mediator response recorded');
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/disputes/{disputeId}/resolutions:
   *   post:
   *     summary: Create resolution for dispute (mediator only)
   *     tags: [Disputes]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: communityId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *       - in: path
   *         name: disputeId
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
   *               - resolutionType
   *               - resolution
   *             properties:
   *               resolutionType:
   *                 type: string
   *                 enum: [open, closed]
   *               resolution:
   *                 type: string
   *                 minLength: 1
   *     responses:
   *       201:
   *         description: Resolution created successfully
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Insufficient permissions
   */
  async createResolution(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { disputeId } = req.params;
      const userId = req.user!.id;
      const { resolutionType, resolution } = req.body;

      const result = await disputeService.createResolution(disputeId, userId, {
        resolutionType,
        resolution,
      });

      return ApiResponse.created(res, result, 'Resolution created successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/disputes/{disputeId}/messages:
   *   post:
   *     summary: Add message to dispute
   *     tags: [Disputes]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: communityId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *       - in: path
   *         name: disputeId
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
   *               - message
   *             properties:
   *               message:
   *                 type: string
   *                 minLength: 1
   *               visibleToParticipants:
   *                 type: boolean
   *                 default: true
   *               visibleToMediators:
   *                 type: boolean
   *                 default: true
   *     responses:
   *       201:
   *         description: Message added successfully
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Insufficient permissions
   */
  async createMessage(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { disputeId } = req.params;
      const userId = req.user!.id;
      const { message, visibleToParticipants, visibleToMediators } = req.body;

      const result = await disputeService.addMessage(disputeId, userId, {
        message,
        visibleToParticipants,
        visibleToMediators,
      });

      return ApiResponse.created(res, result, 'Message added successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/disputes/{disputeId}/messages:
   *   get:
   *     summary: Get messages for dispute
   *     tags: [Disputes]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: communityId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *       - in: path
   *         name: disputeId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           minimum: 0
   *           default: 0
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           default: 50
   *     responses:
   *       200:
   *         description: List of messages
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Insufficient permissions
   */
  async getMessages(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { disputeId } = req.params;
      const userId = req.user!.id;
      const { page = 0, limit = 50 } = req.query;

      const result = await disputeService.getMessages(disputeId, userId, {
        page: Number(page),
        limit: Number(limit),
      });

      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/disputes/{disputeId}/status:
   *   put:
   *     summary: Update dispute status
   *     tags: [Disputes]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: communityId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *       - in: path
   *         name: disputeId
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
   *               - status
   *             properties:
   *               status:
   *                 type: string
   *                 enum: [open, in_mediation, resolved, closed]
   *     responses:
   *       200:
   *         description: Status updated successfully
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Insufficient permissions
   */
  async updateStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { disputeId } = req.params;
      const userId = req.user!.id;
      const { status } = req.body;

      const dispute = await disputeService.updateDisputeStatus(disputeId, userId, status);
      return ApiResponse.success(res, dispute, 'Status updated successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const disputeController = new DisputeController();
