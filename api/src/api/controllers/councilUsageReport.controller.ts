import { Request, Response, NextFunction } from 'express';
import { councilUsageReportService } from '../../services/councilUsageReport.service';
import { ApiResponse } from '../../utils/response';
import { AppError } from '../../utils/errors';
import { v4 as uuidv4 } from 'uuid';

/**
 * @swagger
 * components:
 *   schemas:
 *     UsageReport:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         councilId:
 *           type: string
 *           format: uuid
 *         title:
 *           type: string
 *         content:
 *           type: string
 *         createdBy:
 *           type: string
 *         creatorName:
 *           type: string
 *         attachments:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ReportAttachment'
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ReportItem'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     ReportAttachment:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         filename:
 *           type: string
 *         originalName:
 *           type: string
 *         mimeType:
 *           type: string
 *         size:
 *           type: integer
 *         url:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *     ReportItem:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         itemId:
 *           type: string
 *           format: uuid
 *         itemName:
 *           type: string
 *         quantity:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date-time
 */
export class CouncilUsageReportController {
  /**
   * @swagger
   * /api/v1/communities/{communityId}/councils/{councilId}/usage-reports:
   *   post:
   *     summary: Create a usage report
   *     description: Council managers can create reports explaining resource usage
   *     tags: [Council Usage Reports]
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
   *               - content
   *             properties:
   *               title:
   *                 type: string
   *                 minLength: 3
   *                 maxLength: 200
   *                 example: "Weekly Resource Usage"
   *               content:
   *                 type: string
   *                 minLength: 10
   *                 example: "Used 5 carrots to feed community rabbits this week..."
   *               items:
   *                 type: array
   *                 items:
   *                   type: object
   *                   required:
   *                     - itemId
   *                     - quantity
   *                   properties:
   *                     itemId:
   *                       type: string
   *                       format: uuid
   *                     quantity:
   *                       type: integer
   *                       minimum: 1
   *     responses:
   *       201:
   *         description: Report created successfully
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden - not a council manager
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
      const { title, content, items } = req.body;

      const report = await councilUsageReportService.createReport(
        councilId,
        { title, content, items },
        userId
      );

      return ApiResponse.created(res, report, 'Usage report created successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/councils/{councilId}/usage-reports:
   *   get:
   *     summary: List usage reports for a council
   *     description: Any community member can view reports (transparency)
   *     tags: [Council Usage Reports]
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
   *         description: List of usage reports
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden - not a community member
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

      const result = await councilUsageReportService.listReports(councilId, userId, {
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
   * /api/v1/communities/{communityId}/councils/{councilId}/usage-reports/{reportId}:
   *   get:
   *     summary: Get a usage report by ID
   *     description: Any community member can view reports (transparency)
   *     tags: [Council Usage Reports]
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
   *       - in: path
   *         name: reportId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: Usage report details
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden - not a community member
   *       404:
   *         description: Report not found
   */
  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw new AppError('Unauthorized', 401);
      }

      const { reportId } = req.params;
      const report = await councilUsageReportService.getReport(reportId, userId);

      return ApiResponse.success(res, report);
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/councils/{councilId}/usage-reports/{reportId}:
   *   patch:
   *     summary: Update a usage report
   *     description: Council managers can update reports
   *     tags: [Council Usage Reports]
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
   *             properties:
   *               title:
   *                 type: string
   *                 minLength: 3
   *                 maxLength: 200
   *               content:
   *                 type: string
   *                 minLength: 10
   *               items:
   *                 type: array
   *                 items:
   *                   type: object
   *                   required:
   *                     - itemId
   *                     - quantity
   *                   properties:
   *                     itemId:
   *                       type: string
   *                       format: uuid
   *                     quantity:
   *                       type: integer
   *                       minimum: 1
   *     responses:
   *       200:
   *         description: Report updated successfully
   *       400:
   *         description: Validation error
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden - not a council manager
   *       404:
   *         description: Report not found
   */
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw new AppError('Unauthorized', 401);
      }

      const { reportId } = req.params;
      const { title, content, items } = req.body;

      const report = await councilUsageReportService.updateReport(
        reportId,
        { title, content, items },
        userId
      );

      return ApiResponse.success(res, report, 'Usage report updated successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/councils/{councilId}/usage-reports/{reportId}:
   *   delete:
   *     summary: Delete a usage report
   *     description: Council managers can delete reports
   *     tags: [Council Usage Reports]
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
   *       - in: path
   *         name: reportId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: Report deleted successfully
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden - not a council manager
   *       404:
   *         description: Report not found
   */
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw new AppError('Unauthorized', 401);
      }

      const { reportId } = req.params;
      await councilUsageReportService.deleteReport(reportId, userId);

      return ApiResponse.success(res, { success: true }, 'Usage report deleted successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/councils/{councilId}/usage-reports/{reportId}/attachments:
   *   post:
   *     summary: Add an attachment to a usage report
   *     description: Council managers can add attachments (images, documents)
   *     tags: [Council Usage Reports]
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
   *       - in: path
   *         name: reportId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             required:
   *               - file
   *             properties:
   *               file:
   *                 type: string
   *                 format: binary
   *     responses:
   *       201:
   *         description: Attachment added successfully
   *       400:
   *         description: Validation error or max attachments reached
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden - not a council manager
   *       404:
   *         description: Report not found
   */
  async addAttachment(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw new AppError('Unauthorized', 401);
      }

      const { reportId } = req.params;
      const file = (req as any).file;

      if (!file) {
        throw new AppError('No file uploaded', 400);
      }

      // Generate a unique filename
      const ext = file.originalname.split('.').pop() || 'bin';
      const filename = `${uuidv4()}.${ext}`;

      // For now, we'll store attachments in a simple way
      // In production, you'd upload to S3/cloud storage
      const url = `/uploads/attachments/${filename}`;

      const attachment = await councilUsageReportService.addAttachment(
        reportId,
        {
          filename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          url,
        },
        userId
      );

      return ApiResponse.created(res, attachment, 'Attachment added successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/communities/{communityId}/councils/{councilId}/usage-reports/{reportId}/attachments/{attachmentId}:
   *   delete:
   *     summary: Remove an attachment from a usage report
   *     description: Council managers can remove attachments
   *     tags: [Council Usage Reports]
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
   *       - in: path
   *         name: reportId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *       - in: path
   *         name: attachmentId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *     responses:
   *       200:
   *         description: Attachment removed successfully
   *       401:
   *         description: Unauthorized
   *       403:
   *         description: Forbidden - not a council manager
   *       404:
   *         description: Attachment not found
   */
  async removeAttachment(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        throw new AppError('Unauthorized', 401);
      }

      const { reportId, attachmentId } = req.params;
      await councilUsageReportService.removeAttachment(reportId, attachmentId, userId);

      return ApiResponse.success(res, { success: true }, 'Attachment removed successfully');
    } catch (error) {
      next(error);
    }
  }
}

export const councilUsageReportController = new CouncilUsageReportController();
