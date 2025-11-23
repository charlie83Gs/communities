import { createQuery } from '@tanstack/solid-query';
import type { Accessor } from 'solid-js';
import { communitiesService } from '@/services/api/communities.service';
import type { CommunityStatsSummary, CommunityPendingActions } from '@/types/community.types';

/**
 * Queries for Community Statistics feature
 * Location per architecture: /hooks/queries (data-fetching/query hooks)
 */

export const useCommunityStatsSummaryQuery = (communityId: Accessor<string | undefined>) => {
  return createQuery(() => ({
    queryKey: ['community', communityId(), 'stats', 'summary'],
    queryFn: () => communitiesService.getCommunityStatsSummary(communityId()!),
    enabled: !!communityId(),
  }));
};

export const useCommunityPendingActionsQuery = (communityId: Accessor<string | undefined>) => {
  return createQuery(() => ({
    queryKey: ['community', communityId(), 'stats', 'pending-actions'],
    queryFn: () => communitiesService.getCommunityPendingActions(communityId()!),
    enabled: !!communityId(),
  }));
};
