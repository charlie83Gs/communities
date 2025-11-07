import { createMutation, useQueryClient } from '@tanstack/solid-query';
import { invitesService } from '@/services/api/invites.service';
import type { CommunityInvite, CreateLinkInviteDto } from '@/types/community.types';

export const useCreateLinkInviteMutation = () => {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationKey: ['invites', 'link'],
    mutationFn: (vars: { communityId: string; data: CreateLinkInviteDto }): Promise<CommunityInvite> =>
      invitesService.createLinkInvite(vars.communityId, vars.data),
    onSuccess: (_data, vars) => {
      // Refresh link invite lists for this community
      void queryClient.invalidateQueries({ queryKey: ['community', vars.communityId, 'linkInvites'] });
    },
  }));
};
