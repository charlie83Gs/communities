import { createQuery, CreateQueryResult } from '@tanstack/solid-query';
import { Accessor } from 'solid-js';
import { invitesService } from '@/services/api/invites.service';
import type { CommunityInvite } from '@/types/community.types';

export const useCommunityLinkInvitesQuery = (
  communityId: Accessor<string | undefined>
) => {
  return createQuery(() => ({
    queryKey: ['community', communityId(), 'linkInvites'],
    queryFn: () => invitesService.getLinkInvites(communityId()!),
    enabled: !!communityId(),
  }));
};