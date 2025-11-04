import { createQuery } from '@tanstack/solid-query';
import type { Accessor } from 'solid-js';
import { wealthService } from '@/services/api/wealth.service';
import type { SearchWealthParams, SearchWealthResponse } from '@/types/wealth.types';

/**
 * Search Wealth Query Hook
 * - Location per architecture: /hooks/queries
 * - Uses /api/v1/wealth/search with all supported filters + pagination
 *
 * Usage:
 * const params = createMemo<SearchWealthParams>(() => ({ q: search(), communityId: id() ... }));
 * const query = useSearchWealthQuery(params);
 */
export const useSearchWealthQuery = (
  paramsAccessor: Accessor<SearchWealthParams | undefined>
) => {
  return createQuery(() => {
    const params = paramsAccessor();

    // Ensure we always pass a q (API requires q). Default to empty string.
    const safeParams: SearchWealthParams | undefined = params
      ? { ...params, q: params.q ?? '' }
      : undefined;

    return {
      queryKey: ['wealth', 'search', safeParams],
      queryFn: () => wealthService.searchWealth(safeParams!),
      enabled: !!safeParams, // enable when params are provided
      // Keep previous results during refetch for smoother UX
      placeholderData: (prev) => prev as SearchWealthResponse | undefined,
    };
  }) as ReturnType<typeof createQuery<SearchWealthResponse, Error>>;
};