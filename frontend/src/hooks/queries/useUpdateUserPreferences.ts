import { createMutation, useQueryClient } from '@tanstack/solid-query';
import { apiClient } from '@/services/api/client';
import type { UpdateUserPreferencesDto, UserPreferences } from '@/types/user.types';

export const useUpdateUserPreferences = () => {
  const queryClient = useQueryClient();

  return createMutation<UserPreferences, Error, UpdateUserPreferencesDto>(() => ({
    mutationFn: async (data: UpdateUserPreferencesDto) => {
      const response = await apiClient.put('/api/v1/users/preferences', data);
      return response;
    },
    onSuccess: () => {
      // Invalidate user preferences to reflect the update
      void queryClient.invalidateQueries({ queryKey: ['userPreferences'] });
    },
  }));
};