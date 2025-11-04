import { apiClient } from './client';
import type { WealthHealthData, TrustHealthData, TimeRange, WealthOverview, WealthItemStats, TrustOverview, TrustDistribution } from '@/types/health.types';

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
}

export const healthService = new HealthService();
