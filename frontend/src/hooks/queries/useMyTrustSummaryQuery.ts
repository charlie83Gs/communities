import { createQuery } from '@tanstack/solid-query';
import { Accessor } from 'solid-js';
import { trustService } from '@/services/api/trust.service';
import type { TrustSummary } from '@/types/trust.types';

export const useMyTrustSummaryQuery = (
  communityId: Accessor<string | undefined>
) => {
  return createQuery(() => ({
    queryKey: ['trust', 'me', communityId()],
    queryFn: () => trustService.getMyTrustSummary(communityId()!),
    enabled: !!communityId(),
  })) as ReturnType<typeof createQuery<TrustSummary, Error>>;
};
