import { createQuery } from '@tanstack/solid-query';
import type { Accessor } from 'solid-js';
import { communityMembersService } from '@/services/api/communityMembers.service';
import type { CommunityMember } from '@/types/community.types';

export const useCommunityMembersQuery = (
  communityId: Accessor<string | undefined>,
  search?: Accessor<string | undefined>
) => {
  return createQuery(() => ({
    queryKey: ['community', communityId(), 'members', search?.()],
    queryFn: () => communityMembersService.getMembers(communityId()!, search?.()),
    enabled: !!communityId(),
    staleTime: 30000, // 30 seconds
  })) as ReturnType<typeof createQuery<CommunityMember[], Error>>;
};