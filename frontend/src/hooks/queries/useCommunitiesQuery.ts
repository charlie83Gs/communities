import { createQuery } from '@tanstack/solid-query';
import { Accessor } from 'solid-js';
import { communitiesService } from '@/services/api/communities.service';
import type { PaginatedCommunities } from '@/types/community.types';

interface UseCommunitiesQueryOptions {
  page?: Accessor<number>;
  limit?: Accessor<number>;
}

export const useCommunitiesQuery = (
  options: UseCommunitiesQueryOptions = {}
) => {
  const page = options.page ?? (() => 1);
  const limit = options.limit ?? (() => 10);

  return createQuery(() => ({
    queryKey: ['communities', page(), limit()],
    queryFn: () => communitiesService.listCommunities(page(), limit()),
  }));
};