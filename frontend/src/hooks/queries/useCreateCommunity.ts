import { createMutation, useQueryClient } from '@tanstack/solid-query';
import { communitiesService } from '@/services/api/communities.service';
import type { CreateCommunityDto, Community } from '@/types/community.types';

export const useCreateCommunity = () => {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationFn: (data: CreateCommunityDto) => communitiesService.createCommunity(data),
    onSuccess: (created: Community) => {
      // Invalidate all community searches to show the new community
      void queryClient.invalidateQueries({ queryKey: ['communities'], exact: false });

      // Set the new community data directly in cache
      queryClient.setQueryData(['community', created.id], created);
    },
  }));
};