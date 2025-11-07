import { createQuery } from '@tanstack/solid-query';
import type { Accessor } from 'solid-js';
import { communitiesService } from '@/services/api/communities.service';
import type { SearchCommunitiesParams, SearchCommunitiesResponse } from '@/types/community.types';

/**
 * Search Communities Query Hook
 * - Location per architecture: /hooks/queries
 * - Uses /api/v1/communities/search with all supported filters + pagination
 *
 * Usage:
 * const params = createMemo<SearchCommunitiesParams>(() => ({ q: search(), page: 1, limit: 10 }));
 * const query = useSearchCommunitiesQuery(params);
 */
export const useSearchCommunitiesQuery = (
  paramsAccessor: Accessor<SearchCommunitiesParams | undefined>
) => {
  return createQuery(() => {
    const params = paramsAccessor();

    return {
      queryKey: ['communities', 'search', params],
      queryFn: () => communitiesService.searchCommunities(params!),
      enabled: !!params, // enable when params are provided
      // Keep previous results during refetch for smoother UX
      placeholderData: (prev) => prev as SearchCommunitiesResponse | undefined,
    };
  }) as ReturnType<typeof createQuery<SearchCommunitiesResponse, Error>>;
};
