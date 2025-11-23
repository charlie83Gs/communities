import { apiClient } from './client';
import type { CommunityMember } from '@/types/community.types';

class CommunityMembersService {
  private readonly basePath = '/api/v1/communities';

  async getMembers(communityId: string, search?: string): Promise<CommunityMember[]> {
    const params = new URLSearchParams();
    if (search) {
      params.set('search', search);
    }
    const qs = params.toString();
    return apiClient.get(`${this.basePath}/${communityId}/members${qs ? `?${qs}` : ''}`);
  }

  async getMemberRole(communityId: string, userId: string): Promise<CommunityMember> {
    return apiClient.get(`${this.basePath}/${communityId}/members/${userId}`);
  }


  async removeMember(communityId: string, userId: string): Promise<void> {
    return apiClient.delete(`${this.basePath}/${communityId}/members/${userId}`);
  }

  async updateMemberRole(communityId: string, userId: string, role: string): Promise<void> {
    return apiClient.put(`${this.basePath}/${communityId}/members/${userId}`, { role });
  }

  async updateMemberFeatureRoles(communityId: string, userId: string, roles: string[]): Promise<void> {
    return apiClient.put(`${this.basePath}/${communityId}/members/${userId}/feature-roles`, { roles });
  }
}

export const communityMembersService = new CommunityMembersService();
