import { createQuery } from '@tanstack/solid-query';
import { usersService } from '@/services/api/users.service';
import type { SearchUsersParams, SearchUsersResponse } from '@/types/user.types';

import { Accessor } from 'solid-js';

export const useSearchUsersQuery = (
  paramsAccessor: Accessor<SearchUsersParams | undefined>
) => {
  return createQuery(() => {
    const params = paramsAccessor();
    return {
      queryKey: ['users', 'search', params],
      queryFn: () => usersService.searchUsers(params!),
      enabled: !!params && !!params.q,
    };
  }) as ReturnType<typeof createQuery<SearchUsersResponse, Error>>;
};