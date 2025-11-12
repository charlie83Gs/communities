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
    const response: ApiWealthOverviewResponse = await apiClient.get(
      `${this.basePath}/${communityId}/health/wealth/overview?${params}`
    );

    // Transform API response to match frontend types
    return {
      openShares: response.openShares,
      totalShares: response.totalShares,
      activeCategories: response.activeCategories,
      timeSeries: {
        shares: response.timeSeriesData.map((d: { date: string; shares: number }) => ({ date: d.date, value: d.shares })),
        requests: response.timeSeriesData.map((d: { date: string; requests: number }) => ({ date: d.date, value: d.requests })),
        fulfilled: response.timeSeriesData.map((d: { date: string; fulfilled: number }) => ({ date: d.date, value: d.fulfilled })),
      },
    };
  }

  async getWealthItems(communityId: string, range: TimeRange = '30d'): Promise<WealthHealthData['items']> {
    const params = new URLSearchParams({ range });
    const response: { items: ApiWealthItemResponse[] } = await apiClient.get(
      `${this.basePath}/${communityId}/health/wealth/items?${params}`
    );

    // Transform API response to match frontend types
    return response.items.map((item: ApiWealthItemResponse) => ({
      category: item.categoryName,
      subcategory: item.subcategoryName,
      shareCount: item.shareCount,
      valuePoints: item.valuePoints,
      trend: item.trend.map((t: { date: string; count: number }) => t.count), // Extract just the count values
    }));
  }

  async getTrustOverview(communityId: string, range: TimeRange = '30d'): Promise<TrustHealthData['overview']> {
    const params = new URLSearchParams({ range });
    const response: ApiTrustOverviewResponse = await apiClient.get(
      `${this.basePath}/${communityId}/health/trust/overview?${params}`
    );

    // Transform API response to match frontend types
    return {
      totalTrust: response.totalTrust,
      averageTrust: response.averageTrust,
      trustPerDay: response.trustPerDay,
      timeSeries: {
        awarded: response.timeSeriesData.map((d: { date: string; trustAwarded: number }) => ({ date: d.date, value: d.trustAwarded })),
        removed: response.timeSeriesData.map((d: { date: string; trustRemoved: number }) => ({ date: d.date, value: d.trustRemoved })),
        net: response.timeSeriesData.map((d: { date: string; netTrust: number }) => ({ date: d.date, value: d.netTrust })),
      },
    };
  }

  async getTrustDistribution(communityId: string): Promise<TrustHealthData['distribution']> {
    const response: ApiTrustDistributionResponse = await apiClient.get(
      `${this.basePath}/${communityId}/health/trust/distribution`
    );

    // Transform API response to match frontend types
    return response.distribution.map((item: { trustLevel: string; minScore: number; maxScore: number; userCount: number }) => ({
      levelName: item.trustLevel,
      scoreRange: item.maxScore === 999999
        ? `${item.minScore}+`
        : `${item.minScore}-${item.maxScore}`,
      userCount: item.userCount,
    }));
  }

  async getNeedsOverview(communityId: string, range: TimeRange = '30d'): Promise<NeedsHealthData['overview']> {
    const params = new URLSearchParams({ timeRange: range });
    const response: ApiNeedsOverviewResponse = await apiClient.get(
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
        needs: response.timeSeriesData.map((d: { date: string; needs: number }) => ({ date: d.date, value: d.needs })),
        wants: response.timeSeriesData.map((d: { date: string; wants: number }) => ({ date: d.date, value: d.wants })),
      },
    };
  }

  async getNeedsItems(communityId: string, range: TimeRange = '30d'): Promise<NeedsHealthData['items']> {
    const params = new URLSearchParams({ timeRange: range });
    const response: { items: ApiNeedsItemResponse[] } = await apiClient.get(
      `${this.basePath}/${communityId}/health/needs/items?${params}`
    );

    // Return items as-is since they already match our types
    return response.items;
  }

  async getAggregatedNeeds(communityId: string): Promise<import('@/types/health.types').AggregatedNeedsData[]> {
    return apiClient.get(
      `${this.basePath}/${communityId}/health/needs/aggregated`
    );
  }

  async getAggregatedWealth(communityId: string): Promise<import('@/types/health.types').AggregatedWealthData[]> {
    return apiClient.get(
      `${this.basePath}/${communityId}/health/wealth/aggregated`
    );
  }
}

export const healthService = new HealthService();
