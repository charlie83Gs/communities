import { apiClient } from './client';
import type { TrustLevel, CreateTrustLevelDto, UpdateTrustLevelDto } from '@/types/community.types';

class TrustLevelsService {
  private readonly basePath = '/api/v1/communities';

  async listTrustLevels(communityId: string): Promise<TrustLevel[]> {
    return apiClient.get(`${this.basePath}/${communityId}/trust-levels`);
  }

  async getTrustLevel(communityId: string, id: string): Promise<TrustLevel> {
    return apiClient.get(`${this.basePath}/${communityId}/trust-levels/${id}`);
  }

  async createTrustLevel(communityId: string, data: CreateTrustLevelDto): Promise<TrustLevel> {
    return apiClient.post(`${this.basePath}/${communityId}/trust-levels`, data);
  }

  async updateTrustLevel(communityId: string, id: string, data: UpdateTrustLevelDto): Promise<TrustLevel> {
    return apiClient.put(`${this.basePath}/${communityId}/trust-levels/${id}`, data);
  }

  async deleteTrustLevel(communityId: string, id: string): Promise<void> {
    return apiClient.delete(`${this.basePath}/${communityId}/trust-levels/${id}`);
  }
}

export const trustLevelsService = new TrustLevelsService();
