import { createQuery, type UseQueryResult } from '@tanstack/solid-query';
import { Accessor } from 'solid-js';
import { usersService } from '@/services/api/users.service';
import type { Community } from '@/types/community.types';

export const useUserCommunitiesQuery = (
  userId: Accessor<string | undefined>
): UseQueryResult<Community[], Error> => {
  return createQuery(() => ({
    queryKey: ['user', userId(), 'communities'],
    queryFn: () => usersService.getUserCommunities(userId()!),
    enabled: !!userId(),
  })) as UseQueryResult<Community[], Error>;
};
