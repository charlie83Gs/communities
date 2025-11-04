import { createQuery, CreateQueryResult } from '@tanstack/solid-query';
import { Accessor } from 'solid-js';
import { communityMembersService } from '@/services/api/communityMembers.service';
import { useAuth } from '@/hooks/useAuth';
import type { CommunityMember } from '@/types/community.types';

export const useMyCommunityRoleQuery = (
  communityId: Accessor<string | undefined>
) => {
  const { user } = useAuth();

  return createQuery(() => {
    const id = communityId();
    const currentUser = user();
    const isValidUUID = id && id !== 'undefined' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
    const hasUser = !!currentUser?.id;

    return {
      queryKey: ['community', id, 'my-role', currentUser?.id],
      queryFn: () => communityMembersService.getMemberRole(id!, currentUser!.id),
      enabled: !!isValidUUID && hasUser,
      staleTime: 30000, // 30 seconds - roles don't change often
      gcTime: 300000, // 5 minutes
      // Allow refetch on mount/focus for fresh data (respects staleTime)
    };
  }) as ReturnType<typeof createQuery<CommunityMember, Error>>;
};