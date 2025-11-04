import { apiClient } from './client';
import type {
  Initiative,
  InitiativeReport,
  CreateInitiativeDto,
  CreateInitiativeReportDto,
  VoteInitiativeDto,
  InitiativeComment,
  ReportComment,
  CreateCommentDto,
  InitiativesListResponse,
  ReportsListResponse,
} from '@/types/initiative.types';

class InitiativesService {
  private readonly basePath = '/api/v1/communities';

  /**
   * List initiatives for a council
   * GET /api/v1/communities/:communityId/councils/:councilId/initiatives
   */
  async listInitiatives(
    communityId: string,
    councilId: string,
    params?: {
      page?: number;
      limit?: number;
      status?: 'active' | 'completed' | 'cancelled';
    }
  ): Promise<InitiativesListResponse> {
    const search = new URLSearchParams();
    if (params?.page) search.set('page', params.page.toString());
    if (params?.limit) search.set('limit', params.limit.toString());
    if (params?.status) search.set('status', params.status);
    const qs = search.toString();
    return apiClient.get(
      `${this.basePath}/${communityId}/councils/${councilId}/initiatives${qs ? `?${qs}` : ''}`
    );
  }

  /**
   * Get initiative details
   * GET /api/v1/communities/:communityId/initiatives/:initiativeId
   */
  async getInitiative(communityId: string, initiativeId: string): Promise<Initiative> {
    return apiClient.get(`${this.basePath}/${communityId}/initiatives/${initiativeId}`);
  }

  /**
   * Create a new initiative
   * POST /api/v1/communities/:communityId/councils/:councilId/initiatives
   */
  async createInitiative(
    communityId: string,
    councilId: string,
    dto: CreateInitiativeDto
  ): Promise<Initiative> {
    return apiClient.post(
      `${this.basePath}/${communityId}/councils/${councilId}/initiatives`,
      dto
    );
  }

  /**
   * Update initiative
   * PUT /api/v1/communities/:communityId/initiatives/:initiativeId
   */
  async updateInitiative(
    communityId: string,
    initiativeId: string,
    dto: Partial<CreateInitiativeDto> & { status?: 'active' | 'completed' | 'cancelled' }
  ): Promise<Initiative> {
    return apiClient.put(`${this.basePath}/${communityId}/initiatives/${initiativeId}`, dto);
  }

  /**
   * Delete initiative
   * DELETE /api/v1/communities/:communityId/initiatives/:initiativeId
   */
  async deleteInitiative(
    communityId: string,
    initiativeId: string
  ): Promise<{ success: boolean }> {
    return apiClient.delete(`${this.basePath}/${communityId}/initiatives/${initiativeId}`);
  }

  /**
   * Vote on initiative
   * POST /api/v1/communities/:communityId/initiatives/:initiativeId/vote
   */
  async voteInitiative(
    communityId: string,
    initiativeId: string,
    dto: VoteInitiativeDto
  ): Promise<Initiative> {
    return apiClient.post(`${this.basePath}/${communityId}/initiatives/${initiativeId}/vote`, dto);
  }

  /**
   * Remove vote from initiative
   * DELETE /api/v1/communities/:communityId/initiatives/:initiativeId/vote
   */
  async removeVote(communityId: string, initiativeId: string): Promise<Initiative> {
    return apiClient.delete(`${this.basePath}/${communityId}/initiatives/${initiativeId}/vote`);
  }

  /**
   * List reports for an initiative
   * GET /api/v1/communities/:communityId/initiatives/:initiativeId/reports
   */
  async listReports(
    communityId: string,
    initiativeId: string,
    params?: { page?: number; limit?: number }
  ): Promise<ReportsListResponse> {
    const search = new URLSearchParams();
    if (params?.page) search.set('page', params.page.toString());
    if (params?.limit) search.set('limit', params.limit.toString());
    const qs = search.toString();
    return apiClient.get(
      `${this.basePath}/${communityId}/initiatives/${initiativeId}/reports${qs ? `?${qs}` : ''}`
    );
  }

  /**
   * Create a report for an initiative
   * POST /api/v1/communities/:communityId/initiatives/:initiativeId/reports
   */
  async createReport(
    communityId: string,
    initiativeId: string,
    dto: CreateInitiativeReportDto
  ): Promise<InitiativeReport> {
    return apiClient.post(
      `${this.basePath}/${communityId}/initiatives/${initiativeId}/reports`,
      dto
    );
  }

  /**
   * Get report details
   * GET /api/v1/communities/:communityId/reports/:reportId
   */
  async getReport(communityId: string, reportId: string): Promise<InitiativeReport> {
    return apiClient.get(`${this.basePath}/${communityId}/reports/${reportId}`);
  }

  /**
   * List comments for an initiative
   * GET /api/v1/communities/:communityId/initiatives/:initiativeId/comments
   */
  async listInitiativeComments(
    communityId: string,
    initiativeId: string
  ): Promise<InitiativeComment[]> {
    return apiClient.get(
      `${this.basePath}/${communityId}/initiatives/${initiativeId}/comments`
    );
  }

  /**
   * Create comment on initiative
   * POST /api/v1/communities/:communityId/initiatives/:initiativeId/comments
   */
  async createInitiativeComment(
    communityId: string,
    initiativeId: string,
    dto: CreateCommentDto
  ): Promise<InitiativeComment> {
    return apiClient.post(
      `${this.basePath}/${communityId}/initiatives/${initiativeId}/comments`,
      dto
    );
  }

  /**
   * List comments for a report
   * GET /api/v1/communities/:communityId/reports/:reportId/comments
   */
  async listReportComments(communityId: string, reportId: string): Promise<ReportComment[]> {
    return apiClient.get(`${this.basePath}/${communityId}/reports/${reportId}/comments`);
  }

  /**
   * Create comment on report
   * POST /api/v1/communities/:communityId/reports/:reportId/comments
   */
  async createReportComment(
    communityId: string,
    reportId: string,
    dto: CreateCommentDto
  ): Promise<ReportComment> {
    return apiClient.post(`${this.basePath}/${communityId}/reports/${reportId}/comments`, dto);
  }
}

export const initiativesService = new InitiativesService();
