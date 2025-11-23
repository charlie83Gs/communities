import { apiClient } from './client';
import type { Community, CreateCommunityDto, UpdateCommunityDto, PaginatedCommunities, SearchCommunitiesParams, SearchCommunitiesResponse, CommunityStatsSummary, CommunityPendingActions } from '@/types/community.types';

class CommunitiesService {
  private readonly basePath = '/api/v1/communities';

  async listCommunities(page: number = 1, limit: number = 10): Promise<PaginatedCommunities> {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    return apiClient.get(`${this.basePath}?${params}`);
  }

  async getCommunity(id: string): Promise<Community> {
    if (!id) {
      throw new Error('Community ID is required');
    }
    const response = await apiClient.get(`${this.basePath}/${id}`);
    if (response.createdAt) {
      response.createdAt = new Date(response.createdAt);
    }
    return response;
  }

  async createCommunity(data: CreateCommunityDto): Promise<Community> {
    return apiClient.post(this.basePath, data);
  }

  async updateCommunity(id: string, data: UpdateCommunityDto): Promise<Community> {
    return apiClient.put(`${this.basePath}/${id}`, data);
  }

  async deleteCommunity(id: string): Promise<void> {
    return apiClient.delete(`${this.basePath}/${id}`);
  }

  async searchCommunities(params: SearchCommunitiesParams): Promise<SearchCommunitiesResponse> {
    const searchParams = new URLSearchParams();
    if (params.q) searchParams.append('q', params.q);
    if (params.locationRestricted !== undefined) searchParams.append('locationRestricted', params.locationRestricted.toString());
    if (params.country) searchParams.append('country', params.country);
    if (params.stateProvince) searchParams.append('stateProvince', params.stateProvince);
    if (params.city) searchParams.append('city', params.city);
    searchParams.append('page', params.page.toString());
    searchParams.append('limit', params.limit.toString());

    const queryString = searchParams.toString();
    const url = `${this.basePath}/search${queryString ? `?${queryString}` : ''}`;
    const response = await apiClient.get(url);

    // Map API response to expected type (handle wrapped structure)
    return {
      items: response.data || [],
      pagination: {
        page: response.page || 1,
        limit: response.limit || params.limit,
        total: response.total || 0,
        hasMore: (response.page || 1) * (response.limit || params.limit) < (response.total || 0),
      },
    };
  }

  async getCommunityStatsSummary(communityId: string): Promise<CommunityStatsSummary> {
    if (!communityId) {
      throw new Error('Community ID is required');
    }
    return apiClient.get(`${this.basePath}/${communityId}/stats/summary`);
  }

  async getCommunityPendingActions(communityId: string): Promise<CommunityPendingActions> {
    if (!communityId) {
      throw new Error('Community ID is required');
    }
    return apiClient.get(`${this.basePath}/${communityId}/stats/pending-actions`);
  }
}

export const communitiesService = new CommunitiesService();
