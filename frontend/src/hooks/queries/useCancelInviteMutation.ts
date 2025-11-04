import { createMutation, useQueryClient } from '@tanstack/solid-query';
import { invitesService } from '@/services/api/invites.service';

export const useCancelInviteMutation = () => {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationKey: ['invites', 'cancel'],
    mutationFn: (inviteId: string): Promise<void> =>
      invitesService.cancelInvite(inviteId),
    onSuccess: (_data, _inviteId, _ctx) => {
      // Invalidate any community invite lists and user invites so UI reflects latest
      void queryClient.invalidateQueries({ queryKey: ['community'], exact: false });
      void queryClient.invalidateQueries({ queryKey: ['users', 'invites'], exact: false });
    },
  }));
};