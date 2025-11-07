import { createQuery } from '@tanstack/solid-query';
import { Accessor } from 'solid-js';
import { communitiesService } from '@/services/api/communities.service';
import type { Community } from '@/types/community.types';

export const useCommunityQuery = (
  communityId: Accessor<string | undefined>
) => {
  return createQuery(() => {
    const id = communityId();
    const isValidUUID = id && id !== 'undefined' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);

    return {
      queryKey: ['community', id],
      queryFn: () => communitiesService.getCommunity(id!),
      enabled: !!isValidUUID,
      staleTime: 30000, // 30 seconds - communities don't change often
      gcTime: 300000, // 5 minutes
      // Allow refetch on mount/focus for fresh data (respects staleTime)
    };
  });
};
