import { createQuery, CreateQueryResult } from '@tanstack/solid-query';
import { Accessor } from 'solid-js';
import { communityEventsService } from '@/services/api/communityEvents.service';
import type { CommunityEvent, ListEventsParams } from '@/types/communityEvents.types';

/**
 * Hook to fetch community events
 */
export const useCommunityEventsQuery = (
  communityId: Accessor<string | undefined>,
  params?: Accessor<ListEventsParams | undefined>
): CreateQueryResult<CommunityEvent[], Error> => {
  return createQuery(() => ({
    queryKey: ['community', communityId(), 'events', params?.()],
    queryFn: () => communityEventsService.getCommunityEvents(communityId()!, params?.()),
    enabled: !!communityId(),
    staleTime: 30000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  })) as CreateQueryResult<CommunityEvent[], Error>;
};

/**
 * Hook to fetch events for a specific user
 */
export const useUserEventsQuery = (
  communityId: Accessor<string | undefined>,
  targetUserId: Accessor<string | undefined>,
  limit?: Accessor<number | undefined>,
  offset?: Accessor<number | undefined>
): CreateQueryResult<CommunityEvent[], Error> => {
  return createQuery(() => ({
    queryKey: ['community', communityId(), 'events', 'user', targetUserId(), limit?.(), offset?.()],
    queryFn: () =>
      communityEventsService.getUserEvents(
        communityId()!,
        targetUserId()!,
        limit?.(),
        offset?.()
      ),
    enabled: !!communityId() && !!targetUserId(),
    staleTime: 30000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  })) as CreateQueryResult<CommunityEvent[], Error>;
};
