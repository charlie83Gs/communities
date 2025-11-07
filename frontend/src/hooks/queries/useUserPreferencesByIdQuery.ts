import { createQuery, type UseQueryResult } from '@tanstack/solid-query';
import { Accessor } from 'solid-js';
import { usersService } from '@/services/api/users.service';
import type { UserPreferences } from '@/types/user.types';

export const useUserPreferencesByIdQuery = (
  userId: Accessor<string | undefined>
): UseQueryResult<UserPreferences, Error> => {
  return createQuery(() => ({
    queryKey: ['user', userId(), 'preferences'],
    queryFn: () => usersService.getUserPreferences(userId()!),
    enabled: !!userId(),
  })) as UseQueryResult<UserPreferences, Error>;
};
