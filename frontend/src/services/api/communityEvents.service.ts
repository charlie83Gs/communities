import { apiClient } from './client';
import type { CommunityEvent, ListEventsParams } from '@/types/communityEvents.types';

class CommunityEventsService {
  private readonly basePath = '/communities';

  /**
   * Get community events
   */
  async getCommunityEvents(
    communityId: string,
    params?: ListEventsParams
  ): Promise<CommunityEvent[]> {
    const queryParams = new URLSearchParams();
    if (params?.eventType) queryParams.append('eventType', params.eventType);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const queryString = queryParams.toString();
    const url = `${this.basePath}/${communityId}/events${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient.get<CommunityEvent[]>(url);
    return response.data;
  }

  /**
   * Get events for a specific user
   */
  async getUserEvents(
    communityId: string,
    targetUserId: string,
    limit?: number,
    offset?: number
  ): Promise<CommunityEvent[]> {
    const queryParams = new URLSearchParams();
    if (limit) queryParams.append('limit', limit.toString());
    if (offset) queryParams.append('offset', offset.toString());

    const queryString = queryParams.toString();
    const url = `${this.basePath}/${communityId}/events/user/${targetUserId}${queryString ? `?${queryString}` : ''}`;

    const response = await apiClient.get<CommunityEvent[]>(url);
    return response.data;
  }
}

export const communityEventsService = new CommunityEventsService();
