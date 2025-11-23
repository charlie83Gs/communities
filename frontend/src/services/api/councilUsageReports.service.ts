import { apiClient } from './client';
import type {
  UsageReport,
  UsageReportAttachment,
  CreateUsageReportDto,
  UpdateUsageReportDto,
  UsageReportsListResponse,
} from '@/types/council.types';

class CouncilUsageReportsService {
  private readonly basePath = '/api/v1/communities';

  /**
   * Create a usage report for a council
   * POST /api/v1/communities/:communityId/councils/:councilId/usage-reports
   */
  async createReport(
    communityId: string,
    councilId: string,
    data: CreateUsageReportDto
  ): Promise<UsageReport> {
    return apiClient.post(
      `${this.basePath}/${communityId}/councils/${councilId}/usage-reports`,
      data
    );
  }

  /**
   * List usage reports for a council
   * GET /api/v1/communities/:communityId/councils/:councilId/usage-reports
   */
  async getReports(
    communityId: string,
    councilId: string,
    params?: { page?: number; limit?: number }
  ): Promise<UsageReportsListResponse> {
    const search = new URLSearchParams();
    if (params?.page) search.set('page', params.page.toString());
    if (params?.limit) search.set('limit', params.limit.toString());
    const qs = search.toString();
    return apiClient.get(
      `${this.basePath}/${communityId}/councils/${councilId}/usage-reports${qs ? `?${qs}` : ''}`
    );
  }

  /**
   * Get a specific usage report
   * GET /api/v1/communities/:communityId/councils/:councilId/usage-reports/:reportId
   */
  async getReport(
    communityId: string,
    councilId: string,
    reportId: string
  ): Promise<UsageReport> {
    return apiClient.get(
      `${this.basePath}/${communityId}/councils/${councilId}/usage-reports/${reportId}`
    );
  }

  /**
   * Update a usage report
   * PATCH /api/v1/communities/:communityId/councils/:councilId/usage-reports/:reportId
   */
  async updateReport(
    communityId: string,
    councilId: string,
    reportId: string,
    data: UpdateUsageReportDto
  ): Promise<UsageReport> {
    return apiClient.patch(
      `${this.basePath}/${communityId}/councils/${councilId}/usage-reports/${reportId}`,
      data
    );
  }

  /**
   * Delete a usage report
   * DELETE /api/v1/communities/:communityId/councils/:councilId/usage-reports/:reportId
   */
  async deleteReport(
    communityId: string,
    councilId: string,
    reportId: string
  ): Promise<void> {
    return apiClient.delete(
      `${this.basePath}/${communityId}/councils/${councilId}/usage-reports/${reportId}`
    );
  }

  /**
   * Add attachment to a usage report
   * POST /api/v1/communities/:communityId/councils/:councilId/usage-reports/:reportId/attachments
   */
  async addAttachment(
    communityId: string,
    councilId: string,
    reportId: string,
    file: File
  ): Promise<UsageReportAttachment> {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post(
      `${this.basePath}/${communityId}/councils/${councilId}/usage-reports/${reportId}/attachments`,
      formData
    );
  }

  /**
   * Remove attachment from a usage report
   * DELETE /api/v1/communities/:communityId/councils/:councilId/usage-reports/:reportId/attachments/:attachmentId
   */
  async removeAttachment(
    communityId: string,
    councilId: string,
    reportId: string,
    attachmentId: string
  ): Promise<void> {
    return apiClient.delete(
      `${this.basePath}/${communityId}/councils/${councilId}/usage-reports/${reportId}/attachments/${attachmentId}`
    );
  }
}

export const councilUsageReportsService = new CouncilUsageReportsService();
