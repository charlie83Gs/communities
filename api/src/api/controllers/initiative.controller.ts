import { Request, Response, NextFunction } from 'express';
import { initiativeService } from '../../services/initiative.service';
import { ApiResponse } from '../../utils/response';
import { AppError } from '../../utils/errors';

/**
 * @swagger
 * components:
 *   schemas:
 *     Initiative:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         councilId:
 *           type: string
 *           format: uuid
 *         communityId:
 *           type: string
 *           format: uuid
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         createdBy:
 *           type: string
 *         status:
 *           type: string
 *           enum: [active, completed, cancelled]
 *         upvotes:
 *           type: integer
 *         downvotes:
 *           type: integer
 *         userVote:
 *           type: string
 *           enum: [upvote, downvote]
 *           nullable: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     InitiativeReport:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         initiativeId:
 *           type: string
 *           format: uuid
 *         title:
 *           type: string
 *         content:
 *           type: string
 *         createdBy:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
export class InitiativeController {
  /**
   * @swagger
   * /api/v1/communities/{communityId}/councils/{councilId}/initiatives:
   *   post:
   *     summary: Create a new initiative
   *     description: Council managers or admins can create initiatives
   *     tags: [Initiatives]
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
   *         name: councilId
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
   *               - title
   *               - description
   *             properties:
   *               title:
   *                 type: string
   *                 minLength: 3
   *                 maxLength: 200
   *                 example: "Community Garden Initiative"
   *               description:
   *                 type: string
   *                 minLength: 10
   *                 example: "Proposal to establish a community garden with shared plots for all members"
   *     responses:
   *       201:
   *         description: Initiative created successfully
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Council not found
   */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw new AppError('Unauthorized', 401);
      }

      const { councilId } = req.params;
      const { title, description } = req.body;

      const initiative = await initiativeService.createInitiative(
        councilId,
        { title, description },
        userId
      );

      return ApiResponse.created(res, initiative, 'Initiative created successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/councils/{councilId}/initiatives:
   *   get:
   *     summary: List all initiatives for a council
   *     tags: [Initiatives]
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
   *         name: councilId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           minimum: 1
   *         example: 1
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *         example: 20
   *     responses:
   *       200:
   *         description: List of initiatives
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Council not found
   */
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw new AppError('Unauthorized', 401);
      }

      const { councilId } = req.params;
      const { page, limit } = req.query;

      const result = await initiativeService.listInitiatives(councilId, userId, {
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
      });

      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/initiatives/{initiativeId}:
   *   get:
   *     summary: Get initiative details
   *     tags: [Initiatives]
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
   *         name: initiativeId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: Initiative details
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Initiative not found
   */
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw new AppError('Unauthorized', 401);
      }

      const { initiativeId } = req.params;
      const initiative = await initiativeService.getInitiative(initiativeId, userId);

      return ApiResponse.success(res, initiative);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/initiatives/{initiativeId}:
   *   put:
   *     summary: Update initiative
   *     description: Council managers or admins can update initiatives
   *     tags: [Initiatives]
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
   *         name: initiativeId
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
   *             properties:
   *               title:
   *                 type: string
   *                 minLength: 3
   *                 maxLength: 200
   *               description:
   *                 type: string
   *                 minLength: 10
   *               status:
   *                 type: string
   *                 enum: [active, completed, cancelled]
   *     responses:
   *       200:
   *         description: Initiative updated successfully
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Initiative not found
   */
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw new AppError('Unauthorized', 401);
      }

      const { initiativeId } = req.params;
      const { title, description, status } = req.body;

      const initiative = await initiativeService.updateInitiative(
        initiativeId,
        { title, description, status },
        userId
      );

      return ApiResponse.success(res, initiative, 'Initiative updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/initiatives/{initiativeId}:
   *   delete:
   *     summary: Delete initiative
   *     description: Council managers or admins can delete initiatives
   *     tags: [Initiatives]
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
   *         name: initiativeId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: Initiative deleted successfully
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Initiative not found
   */
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw new AppError('Unauthorized', 401);
      }

      const { initiativeId } = req.params;
      await initiativeService.deleteInitiative(initiativeId, userId);

      return ApiResponse.success(res, { success: true }, 'Initiative deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/initiatives/{initiativeId}/vote:
   *   post:
   *     summary: Vote on an initiative
   *     description: Community members can upvote or downvote initiatives
   *     tags: [Initiatives]
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
   *         name: initiativeId
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
   *               - voteType
   *             properties:
   *               voteType:
   *                 type: string
   *                 enum: [upvote, downvote]
   *                 example: "upvote"
   *     responses:
   *       200:
   *         description: Vote recorded successfully
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Initiative not found
   */
  async vote(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw new AppError('Unauthorized', 401);
      }

      const { initiativeId } = req.params;
      const { voteType } = req.body;

      if (!voteType || !['upvote', 'downvote'].includes(voteType)) {
        throw new AppError('Invalid vote type. Must be "upvote" or "downvote"', 400);
      }

      const result = await initiativeService.voteOnInitiative(initiativeId, voteType, userId);

      return ApiResponse.success(res, result, 'Vote recorded successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/initiatives/{initiativeId}/vote:
   *   delete:
   *     summary: Remove vote from an initiative
   *     tags: [Initiatives]
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
   *         name: initiativeId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: Vote removed successfully
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Initiative not found
   */
  async removeVote(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw new AppError('Unauthorized', 401);
      }

      const { initiativeId } = req.params;
      const result = await initiativeService.removeVote(initiativeId, userId);

      return ApiResponse.success(res, result, 'Vote removed successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/initiatives/{initiativeId}/reports:
   *   post:
   *     summary: Create a progress report for an initiative
   *     description: Council managers or admins can create reports
   *     tags: [Initiatives]
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
   *         name: initiativeId
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
   *               - title
   *               - content
   *             properties:
   *               title:
   *                 type: string
   *                 minLength: 3
   *                 maxLength: 200
   *                 example: "Progress Update - Week 1"
   *               content:
   *                 type: string
   *                 minLength: 10
   *                 example: "We have successfully planted the first batch of vegetables..."
   *     responses:
   *       201:
   *         description: Report created successfully
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Initiative not found
   */
  async createReport(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw new AppError('Unauthorized', 401);
      }

      const { initiativeId } = req.params;
      const { title, content } = req.body;

      const report = await initiativeService.createReport(
        initiativeId,
        { title, content },
        userId
      );

      return ApiResponse.created(res, report, 'Report created successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/initiatives/{initiativeId}/reports:
   *   get:
   *     summary: List all reports for an initiative
   *     tags: [Initiatives]
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
   *         name: initiativeId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           minimum: 1
   *         example: 1
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *         example: 20
   *     responses:
   *       200:
   *         description: List of reports
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Initiative not found
   */
  async listReports(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw new AppError('Unauthorized', 401);
      }

      const { initiativeId } = req.params;
      const { page, limit } = req.query;

      const result = await initiativeService.listReports(initiativeId, userId, {
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
      });

      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/initiatives/{initiativeId}/comments:
   *   post:
   *     summary: Create a comment on an initiative
   *     tags: [Initiatives]
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
   *         name: initiativeId
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
   *               - content
   *             properties:
   *               content:
   *                 type: string
   *                 minLength: 1
   *                 maxLength: 5000
   *                 example: "Great initiative! I'd like to help with this."
   *     responses:
   *       201:
   *         description: Comment created successfully
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Initiative not found
   */
  async createComment(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw new AppError('Unauthorized', 401);
      }

      const { initiativeId } = req.params;
      const { content } = req.body;

      const comment = await initiativeService.createComment(initiativeId, content, userId);

      return ApiResponse.created(res, comment, 'Comment created successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/initiatives/{initiativeId}/comments:
   *   get:
   *     summary: List comments on an initiative
   *     tags: [Initiatives]
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
   *         name: initiativeId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           minimum: 1
   *         example: 1
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *         example: 20
   *     responses:
   *       200:
   *         description: List of comments
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Initiative not found
   */
  async listComments(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw new AppError('Unauthorized', 401);
      }

      const { initiativeId } = req.params;
      const { page, limit } = req.query;

      const result = await initiativeService.listComments(initiativeId, userId, {
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
      });

      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/reports/{reportId}/comments:
   *   post:
   *     summary: Create a comment on a report
   *     tags: [Initiatives]
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
   *         name: reportId
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
   *               - content
   *             properties:
   *               content:
   *                 type: string
   *                 minLength: 1
   *                 maxLength: 5000
   *                 example: "Excellent progress! Looking forward to the next update."
   *     responses:
   *       201:
   *         description: Comment created successfully
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Report not found
   */
  async createReportComment(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw new AppError('Unauthorized', 401);
      }

      const { reportId } = req.params;
      const { content } = req.body;

      const comment = await initiativeService.createReportComment(reportId, content, userId);

      return ApiResponse.created(res, comment, 'Comment created successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/reports/{reportId}/comments:
   *   get:
   *     summary: List comments on a report
   *     tags: [Initiatives]
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
   *         name: reportId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           minimum: 1
   *         example: 1
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *         example: 20
   *     responses:
   *       200:
   *         description: List of comments
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden
   *       404:
   *         description: Report not found
   */
  async listReportComments(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw new AppError('Unauthorized', 401);
      }

      const { reportId } = req.params;
      const { page, limit } = req.query;

      const result = await initiativeService.listReportComments(reportId, userId, {
        page: page ? Number(page) : 1,
        limit: limit ? Number(limit) : 20,
      });

      return ApiResponse.success(res, result);
    } catch (error) {
      next(error);
    }
  }
}

export const initiativeController = new InitiativeController();
