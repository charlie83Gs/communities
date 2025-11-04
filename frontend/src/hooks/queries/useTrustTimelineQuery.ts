import { createQuery } from '@tanstack/solid-query';
import { Accessor } from 'solid-js';
import { trustService } from '@/services/api/trust.service';
import type { TrustTimeline } from '@/types/trust.types';

export const useTrustTimelineQuery = (
  communityId: Accessor<string | undefined>
) => {
  return createQuery(() => ({
    queryKey: ['trust', 'timeline', communityId()],
    queryFn: () => trustService.getTrustTimeline(communityId()!),
    enabled: !!communityId(),
    staleTime: 30000, // 30 seconds
  })) as ReturnType<typeof createQuery<TrustTimeline, Error>>;
};
