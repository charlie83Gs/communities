import { createQuery, CreateQueryResult } from '@tanstack/solid-query';
import { Accessor } from 'solid-js';
import { healthService } from '@/services/api/health.service';
import type { WealthHealthData, TrustHealthData, NeedsHealthData, TimeRange } from '@/types/health.types';

export const useWealthOverviewQuery = (
  communityId: Accessor<string | undefined>,
  range: Accessor<TimeRange>
): CreateQueryResult<WealthHealthData['overview'], Error> => {
  return createQuery(() => ({
    queryKey: ['community', communityId(), 'health', 'wealth', 'overview', range()],
    queryFn: () => healthService.getWealthOverview(communityId()!, range()),
    enabled: !!communityId(),
    staleTime: 60000, // 1 minute
  }));
};

export const useWealthItemsQuery = (
  communityId: Accessor<string | undefined>,
  range: Accessor<TimeRange>
): CreateQueryResult<WealthHealthData['items'], Error> => {
  return createQuery(() => ({
    queryKey: ['community', communityId(), 'health', 'wealth', 'items', range()],
    queryFn: () => healthService.getWealthItems(communityId()!, range()),
    enabled: !!communityId(),
    staleTime: 60000, // 1 minute
  }));
};

export const useTrustOverviewQuery = (
  communityId: Accessor<string | undefined>,
  range: Accessor<TimeRange>
): CreateQueryResult<TrustHealthData['overview'], Error> => {
  return createQuery(() => ({
    queryKey: ['community', communityId(), 'health', 'trust', 'overview', range()],
    queryFn: () => healthService.getTrustOverview(communityId()!, range()),
    enabled: !!communityId(),
    staleTime: 60000, // 1 minute
  }));
};

export const useTrustDistributionQuery = (
  communityId: Accessor<string | undefined>
): CreateQueryResult<TrustHealthData['distribution'], Error> => {
  return createQuery(() => ({
    queryKey: ['community', communityId(), 'health', 'trust', 'distribution'],
    queryFn: () => healthService.getTrustDistribution(communityId()!),
    enabled: !!communityId(),
    staleTime: 60000, // 1 minute
  }));
};

export const useNeedsOverviewQuery = (
  communityId: Accessor<string | undefined>,
  range: Accessor<TimeRange>
): CreateQueryResult<NeedsHealthData['overview'], Error> => {
  return createQuery(() => ({
    queryKey: ['community', communityId(), 'health', 'needs', 'overview', range()],
    queryFn: () => healthService.getNeedsOverview(communityId()!, range()),
    enabled: !!communityId(),
    staleTime: 60000, // 1 minute
  }));
};

export const useNeedsItemsQuery = (
  communityId: Accessor<string | undefined>,
  range: Accessor<TimeRange>
): CreateQueryResult<NeedsHealthData['items'], Error> => {
  return createQuery(() => ({
    queryKey: ['community', communityId(), 'health', 'needs', 'items', range()],
    queryFn: () => healthService.getNeedsItems(communityId()!, range()),
    enabled: !!communityId(),
    staleTime: 60000, // 1 minute
  }));
};

export const useAggregatedNeedsQuery = (
  communityId: Accessor<string | undefined>
): CreateQueryResult<import('@/types/health.types').AggregatedNeedsData[], Error> => {
  return createQuery(() => ({
    queryKey: ['community', communityId(), 'health', 'needs', 'aggregated'],
    queryFn: () => healthService.getAggregatedNeeds(communityId()!),
    enabled: !!communityId(),
    staleTime: 60000, // 1 minute
  }));
};

export const useAggregatedWealthQuery = (
  communityId: Accessor<string | undefined>
): CreateQueryResult<import('@/types/health.types').AggregatedWealthData[], Error> => {
  return createQuery(() => ({
    queryKey: ['community', communityId(), 'health', 'wealth', 'aggregated'],
    queryFn: () => healthService.getAggregatedWealth(communityId()!),
    enabled: !!communityId(),
    staleTime: 60000, // 1 minute
  }));
};
