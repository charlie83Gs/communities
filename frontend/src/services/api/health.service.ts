import { apiClient } from './client';
import type { WealthHealthData, TrustHealthData, NeedsHealthData, TimeRange, WealthOverview, WealthItemStats, TrustOverview, TrustDistribution, NeedsOverview, NeedsItemStats } from '@/types/health.types';

// API Response Types (what the backend actually returns)
interface ApiWealthOverviewResponse {
  openShares: number;
  totalShares: number;
  activeCategories: number;
  timeSeriesData: Array<{
    date: string;
    shares: number;
    requests: number;
    fulfilled: number;
  }>;
}

interface ApiWealthItemResponse {
  categoryName: string;
  subcategoryName: string;
  itemName: string;
  shareCount: number;
  valuePoints: number;
  trend: Array<{
    date: string;
    count: number;
  }>;
}

interface ApiTrustOverviewResponse {
  totalTrust: number;
  averageTrust: number;
  trustPerDay: number;
  timeSeriesData: Array<{
    date: string;
    trustAwarded: number;
    trustRemoved: number;
    netTrust: number;
  }>;
}

interface ApiTrustDistributionResponse {
  distribution: Array<{
    trustLevel: string;
    minScore: number;
    maxScore: number;
    userCount: number;
  }>;
}

interface ApiNeedsOverviewResponse {
  totalActiveNeeds: number;
  totalActiveWants: number;
  activeMembers: number;
  activeCouncils: number;
  objectsVsServices: {
    objects: number;
    services: number;
  };
  timeSeriesData: Array<{
    date: string;
    needs: number;
    wants: number;
  }>;
}

interface ApiNeedsItemResponse {
  categoryName: string;
  itemName: string;
  priority: 'need' | 'want';
  recurrence: 'one-time' | 'daily' | 'weekly' | 'monthly';
  totalUnitsNeeded: number;
  memberCount: number;
  source: 'member' | 'council' | 'both';
}

class HealthService {
  private readonly basePath = '/api/v1/communities';

  async getWealthOverview(communityId: string, range: TimeRange = '30d'): Promise<WealthHealthData['overview']> {
    const params = new URLSearchParams({ range });
    const response = await apiClient.get<ApiWealthOverviewResponse>(
      `${this.basePath}/${communityId}/health/wealth/overview?${params}`
    );

    // Transform API response to match frontend types
    return {
      openShares: response.openShares,
      totalShares: response.totalShares,
      activeCategories: response.activeCategories,
      timeSeries: {
        shares: response.timeSeriesData.map(d => ({ date: d.date, value: d.shares })),
        requests: response.timeSeriesData.map(d => ({ date: d.date, value: d.requests })),
        fulfilled: response.timeSeriesData.map(d => ({ date: d.date, value: d.fulfilled })),
      },
    };
  }

  async getWealthItems(communityId: string, range: TimeRange = '30d'): Promise<WealthHealthData['items']> {
    const params = new URLSearchParams({ range });
    const response = await apiClient.get<{ items: ApiWealthItemResponse[] }>(
      `${this.basePath}/${communityId}/health/wealth/items?${params}`
    );

    // Transform API response to match frontend types
    return response.items.map(item => ({
      category: item.categoryName,
      subcategory: item.subcategoryName,
      shareCount: item.shareCount,
      valuePoints: item.valuePoints,
      trend: item.trend.map(t => t.count), // Extract just the count values
    }));
  }

  async getTrustOverview(communityId: string, range: TimeRange = '30d'): Promise<TrustHealthData['overview']> {
    const params = new URLSearchParams({ range });
    const response = await apiClient.get<ApiTrustOverviewResponse>(
      `${this.basePath}/${communityId}/health/trust/overview?${params}`
    );

    // Transform API response to match frontend types
    return {
      totalTrust: response.totalTrust,
      averageTrust: response.averageTrust,
      trustPerDay: response.trustPerDay,
      timeSeries: {
        awarded: response.timeSeriesData.map(d => ({ date: d.date, value: d.trustAwarded })),
        removed: response.timeSeriesData.map(d => ({ date: d.date, value: d.trustRemoved })),
        net: response.timeSeriesData.map(d => ({ date: d.date, value: d.netTrust })),
      },
    };
  }

  async getTrustDistribution(communityId: string): Promise<TrustHealthData['distribution']> {
    const response = await apiClient.get<ApiTrustDistributionResponse>(
      `${this.basePath}/${communityId}/health/trust/distribution`
    );

    // Transform API response to match frontend types
    return response.distribution.map(item => ({
      levelName: item.trustLevel,
      scoreRange: item.maxScore === 999999
        ? `${item.minScore}+`
        : `${item.minScore}-${item.maxScore}`,
      userCount: item.userCount,
    }));
  }

  async getNeedsOverview(communityId: string, range: TimeRange = '30d'): Promise<NeedsHealthData['overview']> {
    const params = new URLSearchParams({ timeRange: range });
    const response = await apiClient.get<ApiNeedsOverviewResponse>(
      `${this.basePath}/${communityId}/health/needs/overview?${params}`
    );

    // Transform API response to match frontend types
    return {
      totalActiveNeeds: response.totalActiveNeeds,
      totalActiveWants: response.totalActiveWants,
      activeMembers: response.activeMembers,
      activeCouncils: response.activeCouncils,
      objectsVsServices: response.objectsVsServices,
      timeSeries: {
        needs: response.timeSeriesData.map(d => ({ date: d.date, value: d.needs })),
        wants: response.timeSeriesData.map(d => ({ date: d.date, value: d.wants })),
      },
    };
  }

  async getNeedsItems(communityId: string, range: TimeRange = '30d'): Promise<NeedsHealthData['items']> {
    const params = new URLSearchParams({ timeRange: range });
    const response = await apiClient.get<{ items: ApiNeedsItemResponse[] }>(
      `${this.basePath}/${communityId}/health/needs/items?${params}`
    );

    // Return items as-is since they already match our types
    return response.items;
  }

  async getAggregatedNeeds(communityId: string): Promise<import('@/types/health.types').AggregatedNeedsData[]> {
    const response = await apiClient.get<import('@/types/health.types').AggregatedNeedsData[]>(
      `${this.basePath}/${communityId}/health/needs/aggregated`
    );

    // Response is an array of aggregated data groups
    return response;
  }

  async getAggregatedWealth(communityId: string): Promise<import('@/types/health.types').AggregatedWealthData[]> {
    const response = await apiClient.get<import('@/types/health.types').AggregatedWealthData[]>(
      `${this.basePath}/${communityId}/health/wealth/aggregated`
    );

    // Response is an array of aggregated wealth items
    return response;
  }
}

export const healthService = new HealthService();
