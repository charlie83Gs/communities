import { apiClient } from './client';
import type { CommunityInvite, CreateUserInviteDto, CreateLinkInviteDto } from '@/types/community.types';

class InvitesService {
  private readonly basePath = '/api/v1/invites';

  async createUserInvite(communityId: string, data: CreateUserInviteDto): Promise<CommunityInvite> {
    return apiClient.post(`${this.basePath}/communities/${communityId}/users`, data);
  }

  async createLinkInvite(communityId: string, data: CreateLinkInviteDto): Promise<CommunityInvite> {
    return apiClient.post(`${this.basePath}/communities/${communityId}/links`, data);
  }

  async getUserInvites(communityId: string): Promise<CommunityInvite[]> {
    return apiClient.get(`${this.basePath}/communities/${communityId}/users`);
  }

  async getLinkInvites(communityId: string): Promise<CommunityInvite[]> {
    return apiClient.get(`${this.basePath}/communities/${communityId}/links`);
  }

  async cancelInvite(inviteId: string): Promise<void> {
    return apiClient.delete(`${this.basePath}/${inviteId}`);
  }

  async redeemUserInvite(inviteId: string): Promise<CommunityInvite> {
    return apiClient.post(`${this.basePath}/${inviteId}/redeem`, undefined);
  }

  async redeemLinkInvite(secret: string): Promise<CommunityInvite> {
    return apiClient.post(`${this.basePath}/links/redeem`, { secret });
  }
}

export const invitesService = new InvitesService();