import { apiClient } from './client';
import type {
  Council,
  CouncilDetail,
  CreateCouncilDto,
  UpdateCouncilDto,
  CouncilsListResponse,
  CouncilInventoryResponse,
  CouncilTransactionsResponse,
  CouncilTrustStatusResponse,
  AwardCouncilTrustResponse,
  RemoveCouncilTrustResponse,
  AddCouncilManagerResponse,
  RemoveCouncilManagerResponse,
} from '@/types/council.types';

class CouncilsService {
  private readonly basePath = '/api/v1/communities';

  /**
   * List councils for a community
   * GET /api/v1/communities/:communityId/councils
   */
  async listCouncils(
    communityId: string,
    params?: {
      page?: number;
      limit?: number;
      sortBy?: 'trustScore' | 'createdAt';
      order?: 'desc' | 'asc';
    }
  ): Promise<CouncilsListResponse> {
    const search = new URLSearchParams();
    if (params?.page) search.set('page', params.page.toString());
    if (params?.limit) search.set('limit', params.limit.toString());
    if (params?.sortBy) search.set('sortBy', params.sortBy);
    if (params?.order) search.set('order', params.order);
    const qs = search.toString();
    return apiClient.get(`${this.basePath}/${communityId}/councils${qs ? `?${qs}` : ''}`);
  }

  /**
   * Get councils managed by the current user
   * GET /api/v1/communities/:communityId/councils/managed
   */
  async getManagedCouncils(communityId: string): Promise<CouncilsListResponse> {
    return apiClient.get(`${this.basePath}/${communityId}/councils/managed`);
  }

  /**
   * Get council details with inventory and managers
   * GET /api/v1/communities/:communityId/councils/:councilId
   */
  async getCouncil(communityId: string, councilId: string): Promise<CouncilDetail> {
    return apiClient.get(`${this.basePath}/${communityId}/councils/${councilId}`);
  }

  /**
   * Create a new council
   * POST /api/v1/communities/:communityId/councils
   */
  async createCouncil(communityId: string, dto: CreateCouncilDto): Promise<Council> {
    return apiClient.post(`${this.basePath}/${communityId}/councils`, dto);
  }

  /**
   * Update council details
   * PUT /api/v1/communities/:communityId/councils/:councilId
   */
  async updateCouncil(
    communityId: string,
    councilId: string,
    dto: UpdateCouncilDto
  ): Promise<Council> {
    return apiClient.put(`${this.basePath}/${communityId}/councils/${councilId}`, dto);
  }

  /**
   * Delete a council
   * DELETE /api/v1/communities/:communityId/councils/:councilId
   */
  async deleteCouncil(communityId: string, councilId: string): Promise<{ success: boolean }> {
    return apiClient.delete(`${this.basePath}/${communityId}/councils/${councilId}`);
  }

  /**
   * Get council trust status for current user
   * GET /api/v1/communities/:communityId/councils/:councilId/trust-status
   */
  async getTrustStatus(
    communityId: string,
    councilId: string
  ): Promise<CouncilTrustStatusResponse> {
    return apiClient.get(`${this.basePath}/${communityId}/councils/${councilId}/trust-status`);
  }

  /**
   * Award trust to a council
   * POST /api/v1/communities/:communityId/councils/:councilId/trust
   */
  async awardTrust(communityId: string, councilId: string): Promise<AwardCouncilTrustResponse> {
    return apiClient.post(`${this.basePath}/${communityId}/councils/${councilId}/trust`, {
      award: true,
    });
  }

  /**
   * Remove trust from a council
   * DELETE /api/v1/communities/:communityId/councils/:councilId/trust
   */
  async removeTrust(
    communityId: string,
    councilId: string
  ): Promise<RemoveCouncilTrustResponse> {
    return apiClient.delete(`${this.basePath}/${communityId}/councils/${councilId}/trust`);
  }

  /**
   * Add a council manager (admin only)
   * POST /api/v1/communities/:communityId/councils/:councilId/managers
   */
  async addManager(
    communityId: string,
    councilId: string,
    userId: string
  ): Promise<AddCouncilManagerResponse> {
    return apiClient.post(`${this.basePath}/${communityId}/councils/${councilId}/managers`, {
      userId,
    });
  }

  /**
   * Remove a council manager (admin only)
   * DELETE /api/v1/communities/:communityId/councils/:councilId/managers/:userId
   */
  async removeManager(
    communityId: string,
    councilId: string,
    userId: string
  ): Promise<RemoveCouncilManagerResponse> {
    return apiClient.delete(
      `${this.basePath}/${communityId}/councils/${councilId}/managers/${userId}`
    );
  }

  /**
   * Get council inventory
   * GET /api/v1/communities/:communityId/councils/:councilId/inventory
   */
  async getInventory(communityId: string, councilId: string): Promise<CouncilInventoryResponse> {
    return apiClient.get(`${this.basePath}/${communityId}/councils/${councilId}/inventory`);
  }

  /**
   * Get council transaction history
   * GET /api/v1/communities/:communityId/councils/:councilId/transactions
   */
  async getTransactions(
    communityId: string,
    councilId: string,
    params?: { page?: number; limit?: number }
  ): Promise<CouncilTransactionsResponse> {
    const search = new URLSearchParams();
    if (params?.page) search.set('page', params.page.toString());
    if (params?.limit) search.set('limit', params.limit.toString());
    const qs = search.toString();
    return apiClient.get(
      `${this.basePath}/${communityId}/councils/${councilId}/transactions${qs ? `?${qs}` : ''}`
    );
  }
}

export const councilsService = new CouncilsService();
