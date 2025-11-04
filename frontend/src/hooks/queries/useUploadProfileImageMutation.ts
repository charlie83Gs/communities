import { createMutation, useQueryClient } from '@tanstack/solid-query';
import { usersService } from '@/services/api/users.service';
import type { SavedImage } from '@/types/user.types';

export const useUploadProfileImageMutation = () => {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationFn: (image: File) => usersService.uploadProfileImage(image),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPreferences'] });
    },
  }));
};