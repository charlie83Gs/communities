import { createMutation, useQueryClient } from '@tanstack/solid-query';
import { invitesService } from '@/services/api/invites.service';
import type { CommunityInvite, CreateUserInviteDto } from '@/types/community.types';

export const useInviteUserMutation = () => {
  const queryClient = useQueryClient();
  return createMutation(() => ({
    mutationKey: ['invites', 'user'],
    mutationFn: (vars: { communityId: string; data: CreateUserInviteDto }): Promise<CommunityInvite> =>
      invitesService.createUserInvite(vars.communityId, vars.data),
    onSuccess: (_data, vars) => {
      // Refresh invite lists for this community
      void queryClient.invalidateQueries({ queryKey: ['community', vars.communityId, 'userInvites'] });
      // Also refresh members in case the API auto-adds members on certain invite flows
      void queryClient.invalidateQueries({ queryKey: ['community', vars.communityId, 'members'] });
    },
  }));
};
