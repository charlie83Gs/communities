import { apiClient } from './client';
import type {
  Need,
  NeedStatus,
  NeedPriority,
  CreateNeedDto,
  UpdateNeedDto,
  CommunityNeedsAggregation,
} from '@/types/needs.types';

class NeedsService {
  private readonly basePath = '/api/v1/needs';

  // ========================================
  // MEMBER NEEDS
  // ========================================

  /**
   * List member needs with optional filters
   * - If communityId provided: lists needs for that community
   * - Otherwise: lists needs across all accessible communities
   */
  async listNeeds(params?: {
    communityId?: string;
    status?: NeedStatus;
    priority?: NeedPriority;
    isRecurring?: boolean;
  }): Promise<Need[]> {
    const search = new URLSearchParams();
    if (params?.communityId) search.set('communityId', params.communityId);
    if (params?.status) search.set('status', params.status);
    if (params?.priority) search.set('priority', params.priority);
    if (params?.isRecurring !== undefined)
      search.set('isRecurring', String(params.isRecurring));
    const qs = search.toString();
    return apiClient.get(`${this.basePath}${qs ? `?${qs}` : ''}`);
  }

  /**
   * Get a specific need by ID
   */
  async getNeed(id: string): Promise<Need> {
    return apiClient.get(`${this.basePath}/${id}`);
  }

  /**
   * Create a new member need
   */
  async createNeed(dto: CreateNeedDto): Promise<Need> {
    return apiClient.post(this.basePath, dto);
  }

  /**
   * Update a member need (creator only)
   */
  async updateNeed(id: string, dto: UpdateNeedDto): Promise<Need> {
    return apiClient.put(`${this.basePath}/${id}`, dto);
  }

  /**
   * Delete a member need (creator only)
   */
  async deleteNeed(id: string): Promise<void> {
    return apiClient.delete(`${this.basePath}/${id}`);
  }

  /**
   * Get aggregated community needs (separated by priority)
   */
  async getAggregatedNeeds(communityId: string): Promise<CommunityNeedsAggregation> {
    return apiClient.get(`${this.basePath}/aggregated?communityId=${communityId}`);
  }
}

export const needsService = new NeedsService();
