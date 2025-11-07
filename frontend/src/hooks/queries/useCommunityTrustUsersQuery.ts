import { createQuery } from '@tanstack/solid-query';
import type { CreateQueryResult } from '@tanstack/solid-query';
import { Accessor } from 'solid-js';
import { trustService } from '@/services/api/trust.service';
import type { TrustView } from '@/types/trust.types';

export const useCommunityTrustUsersQuery = (
  communityId: Accessor<string | undefined>
) => {
  return createQuery(() => ({
    queryKey: ['communityTrustUsers', communityId()],
    queryFn: () => trustService.getCommunityTrustUsers(communityId()!, 1, 100),
    enabled: !!communityId(),
  })) as ReturnType<typeof createQuery<TrustView[], unknown>>;
};
