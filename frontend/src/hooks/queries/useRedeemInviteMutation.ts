import { createMutation, useQueryClient } from '@tanstack/solid-query';
import { invitesService } from '@/services/api/invites.service';

export const useRedeemInviteMutation = () => {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationKey: ['invites', 'redeem'],
    mutationFn: (inviteId: string) => invitesService.redeemUserInvite(inviteId),
    onSuccess: (data) => {
      // Refresh any cached "my invites" lists
      void queryClient.invalidateQueries({ queryKey: ['users', 'invites'], exact: false });

      // Invalidate user's community list to show the newly joined community
      void queryClient.invalidateQueries({ queryKey: ['communities', 'search'], exact: false });

      // Invalidate the specific community's member list to include the new member
      if (data.communityId) {
        void queryClient.invalidateQueries({
          queryKey: ['community', data.communityId, 'members'],
          exact: false,
        });
      }
    },
  }));
};