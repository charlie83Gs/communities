import { createQuery } from '@tanstack/solid-query';
import { usersService } from '@/services/api/users.service';
import type { UserPreferences } from '@/types/user.types';

export const useUserPreferencesQuery = () => {
  return createQuery(() => ({
    queryKey: ['userPreferences'],
    queryFn: () => usersService.getPreferences(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })) as ReturnType<typeof createQuery<UserPreferences, Error>>;
};