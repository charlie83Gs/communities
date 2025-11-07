import { apiClient } from './client';
import type { User, UserPreferences, UpdateUserPreferencesDto, SearchUsersParams, SearchUsersResponse, SearchUser, MyInvitesResponse, SavedImage, TrustTimelineResponse, TrustSummary } from '@/types/user.types';
import type { Community } from '@/types/community.types';

class UsersService {
  private readonly basePath = '/api/v1/users';

  async searchUsers(params: SearchUsersParams): Promise<SearchUsersResponse> {
    const query = new URLSearchParams({ q: params.q });
    if (params.limit) {
      query.append('limit', params.limit.toString());
    }
    return apiClient.get(`${this.basePath}/search?${query}`);
  }

  async getPreferences(): Promise<UserPreferences> {
    return apiClient.get(`${this.basePath}/preferences`);
  }

  async updatePreferences(data: UpdateUserPreferencesDto): Promise<UserPreferences> {
    return apiClient.put(`${this.basePath}/preferences`, data);
  }

  async getUser(id: string): Promise<SearchUser> {
    return apiClient.get(`${this.basePath}/${id}`);
  }

  async getUserPreferences(id: string): Promise<UserPreferences> {
    return apiClient.get(`${this.basePath}/${id}/preferences`);
  }

  async getUserCommunities(id: string): Promise<Community[]> {
    return apiClient.get(`${this.basePath}/${id}/communities`);
  }

  async getMyInvites(userId: string): Promise<MyInvitesResponse> {
    return apiClient.get(`${this.basePath}/${userId}/invites`);
  }

  async uploadProfileImage(image: File): Promise<SavedImage> {
    const formData = new FormData();
    formData.append('image', image);
    return apiClient.postForm(`${this.basePath}/preferences/profile-image`, formData);
  }

  async getMyTrustTimeline(communityId?: string): Promise<TrustTimelineResponse> {
    const query = communityId ? `?communityId=${communityId}` : '';
    return apiClient.get(`${this.basePath}/me/trust/timeline${query}`);
  }

  async getMyTrustSummary(): Promise<TrustSummary> {
    return apiClient.get(`${this.basePath}/me/trust/summary`);
  }
}

export const usersService = new UsersService();
