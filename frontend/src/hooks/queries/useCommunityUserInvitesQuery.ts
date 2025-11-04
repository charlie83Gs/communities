import { createQuery, CreateQueryResult } from '@tanstack/solid-query';
import { Accessor } from 'solid-js';
import { invitesService } from '@/services/api/invites.service';
import type { CommunityInvite } from '@/types/community.types';

export const useCommunityUserInvitesQuery = (
  communityId: Accessor<string | undefined>
) => {
  return createQuery(() => ({
    queryKey: ['community', communityId(), 'userInvites'],
    queryFn: () => invitesService.getUserInvites(communityId()!),
    enabled: !!communityId(),
  }));
};