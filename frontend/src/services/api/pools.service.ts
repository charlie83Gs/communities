import { apiClient } from './client';
import type {
  Pool,
  CreatePoolRequest,
  UpdatePoolRequest,
  ContributeToPoolRequest,
  ManualDistributeRequest,
  MassDistributeRequest,
  MassDistributePreviewResponse,
  PoolInventoryItem,
  PendingContribution,
  PoolDistribution,
  PoolNeedsResponse,
} from '@/types/pools.types';
import type { Wealth } from '@/types/wealth.types';

class PoolsService {
  /**
   * Create a new pool (council managers only)
   * POST /api/communities/:communityId/councils/:councilId/pools
   */
  async createPool(
    communityId: string,
    councilId: string,
    dto: CreatePoolRequest
  ): Promise<Pool> {
    return apiClient.post(`/api/v1/communities/${communityId}/councils/${councilId}/pools`, dto);
  }

  /**
   * List all pools in a community
   * GET /api/communities/:communityId/pools
   */
  async listPools(communityId: string, filters?: {
    councilId?: string;
    itemId?: string;
  }): Promise<Pool[]> {
    const params = new URLSearchParams();
    if (filters?.councilId) params.set('councilId', filters.councilId);
    if (filters?.itemId) params.set('itemId', filters.itemId);
    const qs = params.toString();
    return apiClient.get(`/api/v1/communities/${communityId}/pools${qs ? `?${qs}` : ''}`);
  }

  /**
   * Get pool details by ID
   * GET /api/communities/:communityId/pools/:poolId
   */
  async getPool(communityId: string, poolId: string): Promise<Pool> {
    return apiClient.get(`/api/v1/communities/${communityId}/pools/${poolId}`);
  }

  /**
   * Update pool settings (council managers only)
   * PATCH /api/communities/:communityId/pools/:poolId
   */
  async updatePool(
    communityId: string,
    poolId: string,
    dto: UpdatePoolRequest
  ): Promise<Pool> {
    return apiClient.patch(`/api/v1/communities/${communityId}/pools/${poolId}`, dto);
  }

  /**
   * Delete a pool (council managers only)
   * DELETE /api/communities/:communityId/pools/:poolId
   */
  async deletePool(communityId: string, poolId: string): Promise<void> {
    return apiClient.delete(`/api/v1/communities/${communityId}/pools/${poolId}`);
  }

  /**
   * Contribute to a pool (creates a wealth share with sharingTarget='pool')
   * POST /api/communities/:communityId/pools/:poolId/contributions
   */
  async contributeToPool(
    communityId: string,
    poolId: string,
    dto: ContributeToPoolRequest
  ): Promise<Wealth> {
    return apiClient.post(`/api/v1/communities/${communityId}/pools/${poolId}/contributions`, dto);
  }

  /**
   * List pending contributions to pool (council managers only)
   * GET /api/communities/:communityId/pools/:poolId/contributions/pending
   */
  async listPendingContributions(
    communityId: string,
    poolId: string
  ): Promise<PendingContribution[]> {
    return apiClient.get(`/api/v1/communities/${communityId}/pools/${poolId}/contributions/pending`);
  }

  /**
   * Confirm a contribution (council managers only)
   * PATCH /api/communities/:communityId/pools/:poolId/contributions/:wealthId/confirm
   */
  async confirmContribution(
    communityId: string,
    poolId: string,
    wealthId: string
  ): Promise<void> {
    return apiClient.patch(`/api/v1/communities/${communityId}/pools/${poolId}/contributions/${wealthId}/confirm`);
  }

  /**
   * Reject a contribution (council managers only)
   * PATCH /api/communities/:communityId/pools/:poolId/contributions/:wealthId/reject
   */
  async rejectContribution(
    communityId: string,
    poolId: string,
    wealthId: string
  ): Promise<void> {
    return apiClient.patch(`/api/v1/communities/${communityId}/pools/${poolId}/contributions/${wealthId}/reject`);
  }

  /**
   * Manual distribution from pool (council managers only)
   * POST /api/communities/:communityId/pools/:poolId/distributions
   */
  async distributeManually(
    communityId: string,
    poolId: string,
    dto: ManualDistributeRequest
  ): Promise<Wealth> {
    return apiClient.post(`/api/v1/communities/${communityId}/pools/${poolId}/distributions`, dto);
  }

  /**
   * Mass distribution from pool (council managers only)
   * POST /api/communities/:communityId/pools/:poolId/distributions/mass
   */
  async distributeMass(
    communityId: string,
    poolId: string,
    dto: MassDistributeRequest
  ): Promise<Wealth[]> {
    return apiClient.post(`/api/v1/communities/${communityId}/pools/${poolId}/distributions/mass`, dto);
  }

  /**
   * List distributions from pool
   * GET /api/communities/:communityId/pools/:poolId/distributions
   */
  async listDistributions(
    communityId: string,
    poolId: string,
    params?: { limit?: number; offset?: number }
  ): Promise<PoolDistribution[]> {
    const search = new URLSearchParams();
    if (params?.limit != null) search.set('limit', String(params.limit));
    if (params?.offset != null) search.set('offset', String(params.offset));
    const qs = search.toString();
    return apiClient.get(`/api/v1/communities/${communityId}/pools/${poolId}/distributions${qs ? `?${qs}` : ''}`);
  }

  /**
   * Get pool inventory
   * GET /api/communities/:communityId/pools/:poolId/inventory
   */
  async getInventory(
    communityId: string,
    poolId: string
  ): Promise<PoolInventoryItem[]> {
    return apiClient.get(`/api/v1/communities/${communityId}/pools/${poolId}/inventory`);
  }

  /**
   * Preview needs for mass distribution planning
   * POST /api/communities/:communityId/pools/:poolId/distributions/mass/preview
   */
  async previewNeeds(
    communityId: string,
    poolId: string,
    params: {
      itemId: string;
      fulfillmentStrategy: 'full' | 'partial' | 'equal';
      maxUnitsPerUser?: number;
      selectedUserIds?: string[];
    }
  ): Promise<MassDistributePreviewResponse> {
    return apiClient.post(`/api/v1/communities/${communityId}/pools/${poolId}/distributions/mass/preview`, {
      itemId: params.itemId,
      fulfillmentStrategy: params.fulfillmentStrategy,
      maxUnitsPerUser: params.maxUnitsPerUser,
      selectedUserIds: params.selectedUserIds,
    });
  }

  /**
   * Get pool needs breakdown
   * GET /api/communities/:communityId/pools/:poolId/needs
   */
  async getPoolNeeds(
    communityId: string,
    poolId: string
  ): Promise<PoolNeedsResponse> {
    return apiClient.get(`/api/v1/communities/${communityId}/pools/${poolId}/needs`);
  }
}

export const poolsService = new PoolsService();
