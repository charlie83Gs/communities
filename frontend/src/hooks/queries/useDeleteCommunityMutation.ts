import { createMutation, useQueryClient } from '@tanstack/solid-query';
import { communitiesService } from '@/services/api/communities.service';
import { useNavigate } from '@solidjs/router';

export const useDeleteCommunityMutation = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  return createMutation(() => ({
    mutationFn: async (id: string) => {
      return communitiesService.deleteCommunity(id);
    },
    onSuccess: (_data, id) => {
      // Refresh community lists and any search caches
      void queryClient.invalidateQueries({ queryKey: ['communities'], exact: false });
      // Also clear the deleted community cache entry
      void queryClient.removeQueries({ queryKey: ['community', id] });
      navigate('/communities');
    },
  }));
};
