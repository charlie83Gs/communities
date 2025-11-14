import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '@/api/middleware/auth.middleware';
import { valueRecognitionService } from '@/services/valueRecognition.service';
import { ApiResponse } from '@/utils/response';
import logger from '@/utils/logger';

/**
 * @swagger
 * tags:
 *   name: Value Recognition
 *   description: Community value recognition and contribution tracking endpoints
 */
class ValueRecognitionController {
  /**
   * @swagger
   * /api/v1/communities/{communityId}/contributions:
   *   post:
   *     summary: Log a contribution
   *     tags: [Value Recognition]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: communityId
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
   *               - units
   *               - description
   *             properties:
   *               itemId:
   *                 type: string
   *                 format: uuid
   *               units:
   *                 type: number
   *                 minimum: 0.01
   *               description:
   *                 type: string
   *                 minLength: 1
   *                 maxLength: 1000
   *               beneficiaryIds:
   *                 type: array
   *                 items:
   *                   type: string
   *               witnessIds:
   *                 type: array
   *                 items:
   *                   type: string
   *               sourceType:
   *                 type: string
   *                 enum: [system_logged, peer_grant, self_reported]
   *                 default: self_reported
   *     responses:
   *       201:
   *         description: Contribution logged successfully
   *       400:
   *         description: Invalid request data
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Insufficient permissions
   */
  async logContribution(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { communityId } = req.params;
      const userId = req.user!.id;
      const { itemId, units, description, beneficiaryIds, witnessIds, sourceType } = req.body;

      const contribution = await valueRecognitionService.logContribution({
        communityId,
        contributorId: userId,
        itemId,
        units,
        description,
        beneficiaryIds,
        witnessIds,
        sourceType: sourceType || 'self_reported',
      });

      logger.info('Contribution logged via API', {
        contributionId: contribution.id,
        userId,
        communityId,
      });

      return ApiResponse.created(res, contribution, 'Contribution logged successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/contributions/profile/me:
   *   get:
   *     summary: Get my contribution profile
   *     tags: [Value Recognition]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: communityId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: Contribution profile retrieved
   *       401:
   *         description: Unauthorized
   */
  async getMyProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { communityId } = req.params;
      const userId = req.user!.id;

      const profile = await valueRecognitionService.getContributionProfile(userId, communityId, userId);
      return ApiResponse.success(res, profile);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/contributions/profile/{userId}:
   *   get:
   *     summary: Get user's contribution profile
   *     tags: [Value Recognition]
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
   *         name: userId
   *         required: true
   *         schema:
   *           type: string
   *     responses:
   *       200:
   *         description: Contribution profile retrieved
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Insufficient permissions to view profile
   *       404:
   *         description: User not found
   */
  async getUserProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { communityId, userId } = req.params;
      const requestingUserId = req.user!.id;

      const profile = await valueRecognitionService.getContributionProfile(userId, communityId, requestingUserId);
      return ApiResponse.success(res, profile);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/contributions/pending-verifications:
   *   get:
   *     summary: Get pending verifications for current user
   *     tags: [Value Recognition]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: communityId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: List of pending verifications
   *       401:
   *         description: Unauthorized
   */
  async getPendingVerifications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { communityId } = req.params;
      const userId = req.user!.id;

      // This would need to be implemented in the repository
      // For now, return empty array as placeholder
      return ApiResponse.success(res, { pending: [] });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/contributions/{contributionId}/verify:
   *   post:
   *     summary: Verify a contribution as beneficiary or witness
   *     tags: [Value Recognition]
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
   *         name: contributionId
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
   *               testimonial:
   *                 type: string
   *                 maxLength: 2000
   *     responses:
   *       200:
   *         description: Contribution verified successfully
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Not authorized to verify this contribution
   *       404:
   *         description: Contribution not found
   */
  async verifyContribution(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { contributionId } = req.params;
      const userId = req.user!.id;
      const { testimonial } = req.body;

      const updated = await valueRecognitionService.verifyContribution({
        contributionId,
        userId,
        testimonial,
      });

      logger.info('Contribution verified via API', { contributionId, userId });
      return ApiResponse.success(res, updated, 'Contribution verified successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/contributions/{contributionId}/dispute:
   *   post:
   *     summary: Dispute a contribution
   *     tags: [Value Recognition]
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
   *         name: contributionId
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
   *               - reason
   *             properties:
   *               reason:
   *                 type: string
   *                 minLength: 1
   *                 maxLength: 1000
   *     responses:
   *       200:
   *         description: Contribution disputed successfully
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Not authorized to dispute this contribution
   *       404:
   *         description: Contribution not found
   */
  async disputeContribution(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { contributionId } = req.params;
      const userId = req.user!.id;
      const { reason } = req.body;

      const updated = await valueRecognitionService.disputeContribution({
        contributionId,
        userId,
        reason,
      });

      logger.warn('Contribution disputed via API', { contributionId, userId });
      return ApiResponse.success(res, updated, 'Contribution disputed');
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/peer-recognition:
   *   post:
   *     summary: Grant peer recognition to another user
   *     tags: [Value Recognition]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: communityId
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
   *               - toUserId
   *               - valueUnits
   *               - description
   *             properties:
   *               toUserId:
   *                 type: string
   *               valueUnits:
   *                 type: number
   *                 minimum: 0.01
   *                 maximum: 100
   *               description:
   *                 type: string
   *                 minLength: 1
   *                 maxLength: 500
   *     responses:
   *       201:
   *         description: Peer recognition granted
   *       400:
   *         description: Invalid request or limit exceeded
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Insufficient permissions
   */
  async grantPeerRecognition(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { communityId } = req.params;
      const fromUserId = req.user!.id;
      const { toUserId, valueUnits, description } = req.body;

      const result = await valueRecognitionService.grantPeerRecognition({
        communityId,
        fromUserId,
        toUserId,
        valueUnits,
        description,
      });

      logger.info('Peer recognition granted via API', {
        fromUserId,
        toUserId,
        valueUnits,
        communityId,
      });

      return ApiResponse.created(res, result, 'Peer recognition granted successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/peer-recognition/limits:
   *   get:
   *     summary: Get peer recognition limits for current user
   *     tags: [Value Recognition]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: communityId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: Peer recognition limits
   *       401:
   *         description: Unauthorized
   */
  async getPeerRecognitionLimits(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { communityId } = req.params;
      const userId = req.user!.id;

      const limits = await valueRecognitionService.checkPeerRecognitionLimits(userId, communityId);
      return ApiResponse.success(res, limits);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/peer-recognition/my:
   *   get:
   *     summary: Get my peer recognition grants (given and received)
   *     tags: [Value Recognition]
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
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           default: 50
   *     responses:
   *       200:
   *         description: List of peer recognition grants
   *       401:
   *         description: Unauthorized
   */
  async getMyPeerRecognition(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { communityId } = req.params;
      const userId = req.user!.id;
      const { limit = 50 } = req.query;

      // This would be implemented in repository
      // For now, return placeholder
      return ApiResponse.success(res, { given: [], received: [] });
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/items/{itemId}/value:
   *   patch:
   *     summary: Update item value (calibration)
   *     tags: [Value Recognition]
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
   *         name: itemId
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
   *               - newValue
   *               - reason
   *             properties:
   *               newValue:
   *                 type: number
   *                 minimum: 0.01
   *               reason:
   *                 type: string
   *                 minLength: 1
   *                 maxLength: 1000
   *               decidedThrough:
   *                 type: string
   *                 enum: [council, community_poll, consensus, admin]
   *     responses:
   *       200:
   *         description: Item value updated
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Insufficient permissions
   *       404:
   *         description: Item not found
   */
  async updateItemValue(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { itemId } = req.params;
      const userId = req.user!.id;
      const { newValue, reason, decidedThrough } = req.body;

      const result = await valueRecognitionService.updateItemValue({
        itemId,
        newValue,
        reason,
        proposedBy: userId,
        decidedThrough,
      });

      logger.info('Item value updated via API', { itemId, userId, newValue });
      return ApiResponse.success(res, result, 'Item value updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/value-calibration-history:
   *   get:
   *     summary: Get value calibration history
   *     tags: [Value Recognition]
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
   *         name: itemId
   *         schema:
   *           type: string
   *           format: uuid
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           default: 50
   *     responses:
   *       200:
   *         description: Value calibration history
   *       401:
   *         description: Unauthorized
   */
  async getValueCalibrationHistory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { communityId } = req.params;
      const { itemId, limit = 50 } = req.query;

      // This would be implemented using valueCalibrationRepository
      // For now, return placeholder
      return ApiResponse.success(res, { history: [] });
    } catch (error) {
      next(error);
    }
  }
}

export const valueRecognitionController = new ValueRecognitionController();
