import type { Request, Response, NextFunction } from 'express';
import { pollService } from '@services/poll.service';
import { wealthCommentService } from '@services/wealthComment.service';
import { ApiResponse } from '@utils/response';

/**
 * @swagger
 * components:
 *   schemas:
 *     Poll:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         communityId:
 *           type: string
 *           format: uuid
 *         title:
 *           type: string
 *         description:
 *           type: string
 *           nullable: true
 *         creatorType:
 *           type: string
 *           enum: [user, council, pool]
 *         creatorId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *         createdBy:
 *           type: string
 *         status:
 *           type: string
 *           enum: [active, closed]
 *         endsAt:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       example:
 *         id: "123e4567-e89b-12d3-a456-426614174000"
 *         communityId: "123e4567-e89b-12d3-a456-426614174001"
 *         title: "What should we plant in the community garden?"
 *         description: "Vote for your preferred vegetables"
 *         creatorType: "user"
 *         creatorId: null
 *         createdBy: "user123"
 *         status: "active"
 *         endsAt: "2025-11-10T12:00:00Z"
 *         createdAt: "2025-11-03T12:00:00Z"
 *         updatedAt: "2025-11-03T12:00:00Z"
 *
 *     PollOption:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         pollId:
 *           type: string
 *           format: uuid
 *         optionText:
 *           type: string
 *         displayOrder:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date-time
 *       example:
 *         id: "223e4567-e89b-12d3-a456-426614174000"
 *         pollId: "123e4567-e89b-12d3-a456-426614174000"
 *         optionText: "Tomatoes"
 *         displayOrder: 0
 *         createdAt: "2025-11-03T12:00:00Z"
 *
 *     PollResult:
 *       type: object
 *       properties:
 *         optionId:
 *           type: string
 *           format: uuid
 *         votes:
 *           type: integer
 *         percentage:
 *           type: integer
 *       example:
 *         optionId: "223e4567-e89b-12d3-a456-426614174000"
 *         votes: 15
 *         percentage: 45
 *
 *     PollWithDetails:
 *       type: object
 *       allOf:
 *         - $ref: '#/components/schemas/Poll'
 *         - type: object
 *           properties:
 *             options:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PollOption'
 *             userVote:
 *               type: object
 *               nullable: true
 *               properties:
 *                 optionId:
 *                   type: string
 *                   format: uuid
 *             results:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PollResult'
 */

export class PollController {
  /**
   * @swagger
   * /api/v1/communities/{communityId}/polls:
   *   get:
   *     summary: List polls for a community
   *     tags: [Polls]
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
   *         name: status
   *         schema:
   *           type: string
   *           enum: [active, closed]
   *       - in: query
   *         name: creatorType
   *         schema:
   *           type: string
   *           enum: [user, council, pool]
   *     responses:
   *       200:
   *         description: List of polls
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 polls:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Poll'
   *       403:
   *         description: Forbidden (not a community member)
   */
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const { communityId } = req.params;
      const { status, creatorType } = req.query as { status?: any; creatorType?: any };

      const polls = await pollService.listPolls(communityId, userId, {
        status,
        creatorType,
      });

      return ApiResponse.success(res, { polls });
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/polls/{pollId}:
   *   get:
   *     summary: Get poll by ID with details
   *     tags: [Polls]
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
   *         name: pollId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: Poll details with options, user vote, and results
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 poll:
   *                   $ref: '#/components/schemas/Poll'
   *                 options:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/PollOption'
   *                 userVote:
   *                   type: object
   *                   nullable: true
   *                   properties:
   *                     optionId:
   *                       type: string
   *                       format: uuid
   *                 results:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/PollResult'
   *       404:
   *         description: Poll not found
   *       403:
   *         description: Forbidden (not a community member)
   */
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const { communityId, pollId } = req.params;

      const pollWithDetails = await pollService.getPollById(communityId, pollId, userId);

      return ApiResponse.success(res, pollWithDetails);
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/polls:
   *   post:
   *     summary: Create a new poll
   *     tags: [Polls]
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
   *             required: [title, options, duration, creatorType]
   *             properties:
   *               title:
   *                 type: string
   *                 maxLength: 200
   *               description:
   *                 type: string
   *                 maxLength: 1000
   *               options:
   *                 type: array
   *                 minItems: 2
   *                 maxItems: 10
   *                 items:
   *                   type: string
   *                   maxLength: 200
   *               duration:
   *                 type: integer
   *                 minimum: 1
   *                 maximum: 720
   *                 description: Duration in hours
   *               creatorType:
   *                 type: string
   *                 enum: [user, council, pool]
   *               creatorId:
   *                 type: string
   *                 format: uuid
   *                 description: Required for council or pool creator types
   *           example:
   *             title: "What should we plant in the community garden?"
   *             description: "Vote for your preferred vegetables"
   *             options: ["Tomatoes", "Carrots", "Lettuce", "Peppers"]
   *             duration: 168
   *             creatorType: "user"
   *     responses:
   *       201:
   *         description: Poll created successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Poll'
   *       400:
   *         description: Validation error
   *       403:
   *         description: Forbidden (insufficient permissions)
   */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const { communityId } = req.params;

      const poll = await pollService.createPoll(
        {
          ...req.body,
          communityId,
        },
        userId
      );

      return ApiResponse.created(res, poll, 'Poll created successfully');
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/polls/{pollId}/vote:
   *   post:
   *     summary: Vote on a poll
   *     tags: [Polls]
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
   *         name: pollId
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
   *             required: [optionId]
   *             properties:
   *               optionId:
   *                 type: string
   *                 format: uuid
   *           example:
   *             optionId: "223e4567-e89b-12d3-a456-426614174000"
   *     responses:
   *       200:
   *         description: Vote recorded successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *       400:
   *         description: Invalid request (poll closed, already voted, etc.)
   *       403:
   *         description: Forbidden (not a community member)
   *       404:
   *         description: Poll or option not found
   */
  async vote(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const { communityId, pollId } = req.params;
      const { optionId } = req.body;

      await pollService.vote(communityId, pollId, optionId, userId);

      return ApiResponse.success(res, { success: true }, 'Vote recorded successfully');
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/polls/{pollId}/close:
   *   post:
   *     summary: Close a poll (creator or admin only)
   *     tags: [Polls]
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
   *         name: pollId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: Poll closed successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Poll'
   *       400:
   *         description: Poll already closed
   *       403:
   *         description: Forbidden (not creator or admin)
   *       404:
   *         description: Poll not found
   */
  async close(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const { communityId, pollId } = req.params;

      const poll = await pollService.closePoll(communityId, pollId, userId);

      return ApiResponse.success(res, poll, 'Poll closed successfully');
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/polls/{pollId}/comments:
   *   post:
   *     summary: Create a comment on a poll
   *     tags: [Polls]
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
   *         name: pollId
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
   *             required: [content]
   *             properties:
   *               content:
   *                 type: string
   *                 example: "I think tomatoes are the best choice!"
   *               parentId:
   *                 type: string
   *                 format: uuid
   *                 description: ID of parent comment for replies
   *     responses:
   *       201:
   *         description: Comment created successfully
   *       403:
   *         description: Forbidden (no permission to comment)
   *       404:
   *         description: Poll not found
   */
  async createComment(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const { pollId } = req.params;

      // Note: Using wealthCommentService as a generic comment service
      // In a production system, you might want a dedicated poll comment service
      const comment = await wealthCommentService.createComment(
        {
          wealthId: pollId, // Reusing wealth comments structure
          ...req.body,
        },
        userId
      );

      return ApiResponse.created(res, comment, 'Comment created successfully');
    } catch (err) {
      next(err);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/polls/{pollId}/comments:
   *   get:
   *     summary: List comments for a poll
   *     tags: [Polls]
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
   *         name: pollId
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
   *       - in: query
   *         name: offset
   *         schema:
   *           type: integer
   *           minimum: 0
   *           default: 0
   *     responses:
   *       200:
   *         description: List of comments
   *       403:
   *         description: Forbidden (no permission to view comments)
   *       404:
   *         description: Poll not found
   */
  async listComments(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const { pollId } = req.params;
      const { limit, offset } = req.query;

      const comments = await wealthCommentService.getCommentsByWealthId(
        pollId,
        userId,
        Number(limit) || 50,
        Number(offset) || 0
      );

      return ApiResponse.success(res, { comments });
    } catch (err) {
      next(err);
    }
  }
}

export const pollController = new PollController();
