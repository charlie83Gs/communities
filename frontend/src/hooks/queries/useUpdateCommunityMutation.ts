import { createMutation, useQueryClient } from '@tanstack/solid-query';
import { communitiesService } from '@/services/api/communities.service';
import type { UpdateCommunityDto } from '@/types/community.types';

export const useUpdateCommunityMutation = () => {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationFn: async (data: { id: string; dto: UpdateCommunityDto }) => {
      return communitiesService.updateCommunity(data.id, data.dto);
    },
    onSuccess: (_data, vars) => {
      // Refresh this community details and any community search/listing caches
      void queryClient.invalidateQueries({ queryKey: ['community', vars.id] });
      void queryClient.invalidateQueries({ queryKey: ['communities'], exact: false });
    },
  }));
};
