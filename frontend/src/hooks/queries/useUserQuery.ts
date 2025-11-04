import { createQuery, type UseQueryResult } from '@tanstack/solid-query';
import { Accessor } from 'solid-js';
import { usersService } from '@/services/api/users.service';
import type { SearchUser } from '@/types/user.types';

export const useUserQuery = (
  userId: Accessor<string | undefined>
): UseQueryResult<SearchUser, Error> => {
  return createQuery(() => ({
    queryKey: ['user', userId()],
    queryFn: () => usersService.getUser(userId()!),
    enabled: !!userId(),
  }));
};