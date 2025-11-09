import { apiClient } from './client';
import type {
  TrustView,
  TrustSummary,
  TrustAward,
  AdminTrustGrant,
  TrustHistoryEntry,
  TrustTimeline
} from '@/types/trust.types';

export class TrustService {
  private readonly basePath = '/api/v1/communities';

  async getCommunityTrustUsers(
    communityId: string,
    page?: number,
    limit?: number
  ): Promise<TrustView[]> {
    const params = new URLSearchParams();
    if (page !== undefined) params.append('page', page.toString());
    if (limit !== undefined) params.append('limit', limit.toString());

    const url = `${this.basePath}/${communityId}/trust/users?${params.toString()}`;
    return apiClient.get(url);
  }

  async getTrustViewForUser(
    communityId: string,
    userId: string
  ): Promise<TrustView | null> {
    const url = `${this.basePath}/${communityId}/trust/users/${userId}`;
    try {
      return apiClient.get(url);
    } catch (error) {
      if ((error as any).response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async getMyTrustSummary(communityId: string): Promise<TrustSummary> {
    const url = `${this.basePath}/${communityId}/trust/me`;
    return apiClient.get(url);
  }

  // Trust Award Methods
  async awardTrust(communityId: string, toUserId: string): Promise<void> {
    const url = `${this.basePath}/${communityId}/trust/awards/${toUserId}`;
    await apiClient.post(url, {});
  }

  async removeTrust(communityId: string, toUserId: string): Promise<void> {
    const url = `${this.basePath}/${communityId}/trust/awards/${toUserId}`;
    await apiClient.delete(url);
  }

  async getMyTrustAwards(communityId: string): Promise<TrustAward[]> {
    const url = `${this.basePath}/${communityId}/trust/awards`;
    return apiClient.get(url);
  }

  async getAwardsToUser(communityId: string, userId: string): Promise<TrustAward[]> {
    const url = `${this.basePath}/${communityId}/trust/awards/${userId}`;
    return apiClient.get(url);
  }

  async getTrustHistory(communityId: string, userId: string): Promise<TrustHistoryEntry[]> {
    const url = `${this.basePath}/${communityId}/trust/history/${userId}`;
    return apiClient.get(url);
  }

  // Admin Grant Methods
  async getAdminGrants(communityId: string): Promise<AdminTrustGrant[]> {
    const url = `${this.basePath}/${communityId}/trust/admin/grants`;
    return apiClient.get(url);
  }

  async setAdminGrant(communityId: string, toUserId: string, amount: number): Promise<void> {
    const url = `${this.basePath}/${communityId}/trust/admin/grants/${toUserId}`;
    // Backend handles upsert logic - just use PUT
    // This avoids making an extra admin-privileged API call (getAdminGrants)
    // during the mutation which could fail if OpenFGA roles are temporarily inconsistent
    await apiClient.put(url, { amount });
  }

  async deleteAdminGrant(communityId: string, toUserId: string): Promise<void> {
    const url = `${this.basePath}/${communityId}/trust/admin/grants/${toUserId}`;
    await apiClient.delete(url);
  }

  // Trust Timeline
  async getTrustTimeline(communityId: string): Promise<TrustTimeline> {
    const url = `${this.basePath}/${communityId}/trust/timeline`;
    return apiClient.get(url);
  }
}

export const trustService = new TrustService();
