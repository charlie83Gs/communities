import {
  councilUsageReportRepository,
  CreateUsageReportDto,
  UpdateUsageReportDto,
  CreateAttachmentDto,
} from '../repositories/councilUsageReport.repository';
import { councilRepository } from '../repositories/council.repository';
import { communityMemberRepository } from '../repositories/communityMember.repository';
import { appUserRepository } from '../repositories/appUser.repository';
import { AppError } from '../utils/errors';
import { openFGAService } from './openfga.service';
import logger from '../utils/logger';

export class CouncilUsageReportService {
  /**
   * Check if user can manage council (community admin OR council manager)
   */
  private async canManageCouncil(
    councilId: string,
    communityId: string,
    userId: string
  ): Promise<boolean> {
    // Check if user is community admin
    const isAdmin = await openFGAService.checkAccess(userId, 'community', communityId, 'admin');

    // Check if user is council manager (has can_manage permission on council)
    const canManageCouncil = await openFGAService.checkAccess(
      userId,
      'council',
      councilId,
      'can_manage'
    );

    return isAdmin || canManageCouncil;
  }

  /**
   * Create a new usage report
   * Only council managers can create reports
   */
  async createReport(councilId: string, data: CreateUsageReportDto, userId: string) {
    logger.info(
      `[CouncilUsageReportService createReport] Creating report for council: ${councilId}`
    );

    // Get council to verify it exists
    const council = await councilRepository.findById(councilId);
    if (!council) {
      throw new AppError('Council not found', 404);
    }

    // Check permission (admin OR council manager)
    const canManage = await this.canManageCouncil(councilId, council.communityId, userId);
    if (!canManage) {
      throw new AppError('Forbidden: only council managers can create usage reports', 403);
    }

    // Validate title length
    if (!data.title || data.title.length < 3 || data.title.length > 200) {
      throw new AppError('Report title must be between 3 and 200 characters', 400);
    }

    // Validate content
    if (!data.content || data.content.length < 10) {
      throw new AppError('Report content must be at least 10 characters', 400);
    }

    const report = await councilUsageReportRepository.create(councilId, data, userId);

    logger.info(`[CouncilUsageReportService createReport] Report created with id: ${report.id}`);

    // Get full report with items
    const fullReport = await councilUsageReportRepository.findById(report.id);

    // Get creator details
    const creator = await appUserRepository.findById(userId);

    return {
      ...fullReport,
      creatorName: creator?.displayName || creator?.email || 'Unknown',
    };
  }

  /**
   * Get a single usage report by ID
   * Any community member can view reports (transparency)
   */
  async getReport(reportId: string, userId: string) {
    const report = await councilUsageReportRepository.findById(reportId);
    if (!report) {
      throw new AppError('Usage report not found', 404);
    }

    // Get council to check membership
    const council = await councilRepository.findById(report.councilId);
    if (!council) {
      throw new AppError('Council not found', 404);
    }

    // Check user is member of the community
    const userRole = await communityMemberRepository.getUserRole(council.communityId, userId);
    if (!userRole) {
      throw new AppError('Forbidden: not a member of this community', 403);
    }

    // Get creator details
    const creator = report.createdBy ? await appUserRepository.findById(report.createdBy) : null;

    return {
      ...report,
      creatorName: creator?.displayName || creator?.email || 'Unknown',
    };
  }

  /**
   * List usage reports for a council
   * Any community member can view reports (transparency)
   */
  async listReports(
    councilId: string,
    userId: string,
    options: { page?: number; limit?: number } = {}
  ) {
    // Get council to verify it exists
    const council = await councilRepository.findById(councilId);
    if (!council) {
      throw new AppError('Council not found', 404);
    }

    // Check user is member of the community
    const userRole = await communityMemberRepository.getUserRole(council.communityId, userId);
    if (!userRole) {
      throw new AppError('Forbidden: not a member of this community', 403);
    }

    const result = await councilUsageReportRepository.findByCouncil(councilId, options);

    // Add creator details to each report
    const reportsWithCreators = await Promise.all(
      result.reports.map(async (report) => {
        const creator = report.createdBy
          ? await appUserRepository.findById(report.createdBy)
          : null;
        return {
          ...report,
          creatorName: creator?.displayName || creator?.email || 'Unknown',
        };
      })
    );

    return {
      reports: reportsWithCreators,
      total: result.total,
      page: options.page || 1,
      limit: options.limit || 20,
    };
  }

  /**
   * Update a usage report
   * Only council managers can update reports
   */
  async updateReport(reportId: string, data: UpdateUsageReportDto, userId: string) {
    const report = await councilUsageReportRepository.findById(reportId);
    if (!report) {
      throw new AppError('Usage report not found', 404);
    }

    // Get council to get communityId
    const council = await councilRepository.findById(report.councilId);
    if (!council) {
      throw new AppError('Council not found', 404);
    }

    // Check permission (admin OR council manager)
    const canManage = await this.canManageCouncil(report.councilId, council.communityId, userId);
    if (!canManage) {
      throw new AppError('Forbidden: only council managers can update usage reports', 403);
    }

    // Validate title if provided
    if (data.title && (data.title.length < 3 || data.title.length > 200)) {
      throw new AppError('Report title must be between 3 and 200 characters', 400);
    }

    // Validate content if provided
    if (data.content && data.content.length < 10) {
      throw new AppError('Report content must be at least 10 characters', 400);
    }

    const updated = await councilUsageReportRepository.update(reportId, data);
    if (!updated) {
      throw new AppError('Failed to update report', 500);
    }

    // Get full report with attachments
    const fullReport = await councilUsageReportRepository.findById(reportId);
    const creator = fullReport?.createdBy
      ? await appUserRepository.findById(fullReport.createdBy)
      : null;

    return {
      ...fullReport,
      creatorName: creator?.displayName || creator?.email || 'Unknown',
    };
  }

  /**
   * Delete a usage report
   * Only council managers can delete reports
   */
  async deleteReport(reportId: string, userId: string) {
    const report = await councilUsageReportRepository.findById(reportId);
    if (!report) {
      throw new AppError('Usage report not found', 404);
    }

    // Get council to get communityId
    const council = await councilRepository.findById(report.councilId);
    if (!council) {
      throw new AppError('Council not found', 404);
    }

    // Check permission (admin OR council manager)
    const canManage = await this.canManageCouncil(report.councilId, council.communityId, userId);
    if (!canManage) {
      throw new AppError('Forbidden: only council managers can delete usage reports', 403);
    }

    await councilUsageReportRepository.delete(reportId);

    logger.info(`[CouncilUsageReportService deleteReport] Report ${reportId} deleted by ${userId}`);

    return { success: true };
  }

  /**
   * Add an attachment to a report
   * Only council managers can add attachments
   */
  async addAttachment(reportId: string, data: CreateAttachmentDto, userId: string) {
    const report = await councilUsageReportRepository.findById(reportId);
    if (!report) {
      throw new AppError('Usage report not found', 404);
    }

    // Get council to get communityId
    const council = await councilRepository.findById(report.councilId);
    if (!council) {
      throw new AppError('Council not found', 404);
    }

    // Check permission (admin OR council manager)
    const canManage = await this.canManageCouncil(report.councilId, council.communityId, userId);
    if (!canManage) {
      throw new AppError('Forbidden: only council managers can add attachments', 403);
    }

    // Check attachment limits
    const currentAttachments = await councilUsageReportRepository.findAttachmentsByReport(reportId);
    if (currentAttachments.length >= 10) {
      throw new AppError('Maximum of 10 attachments per report', 400);
    }

    // Validate file size (max 10MB)
    if (data.size > 10 * 1024 * 1024) {
      throw new AppError('File size cannot exceed 10MB', 400);
    }

    const attachment = await councilUsageReportRepository.addAttachment(reportId, data);

    logger.info(
      `[CouncilUsageReportService addAttachment] Attachment ${attachment.id} added to report ${reportId}`
    );

    return attachment;
  }

  /**
   * Remove an attachment from a report
   * Only council managers can remove attachments
   */
  async removeAttachment(reportId: string, attachmentId: string, userId: string) {
    const report = await councilUsageReportRepository.findById(reportId);
    if (!report) {
      throw new AppError('Usage report not found', 404);
    }

    // Get council to get communityId
    const council = await councilRepository.findById(report.councilId);
    if (!council) {
      throw new AppError('Council not found', 404);
    }

    // Check permission (admin OR council manager)
    const canManage = await this.canManageCouncil(report.councilId, council.communityId, userId);
    if (!canManage) {
      throw new AppError('Forbidden: only council managers can remove attachments', 403);
    }

    // Verify attachment exists and belongs to this report
    const attachment = await councilUsageReportRepository.findAttachmentById(attachmentId);
    if (!attachment) {
      throw new AppError('Attachment not found', 404);
    }
    if (attachment.reportId !== reportId) {
      throw new AppError('Attachment does not belong to this report', 400);
    }

    await councilUsageReportRepository.removeAttachment(attachmentId);

    logger.info(
      `[CouncilUsageReportService removeAttachment] Attachment ${attachmentId} removed from report ${reportId}`
    );

    return { success: true };
  }
}

export const councilUsageReportService = new CouncilUsageReportService();
