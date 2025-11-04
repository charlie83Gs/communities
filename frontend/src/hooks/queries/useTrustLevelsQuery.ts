import { createQuery } from '@tanstack/solid-query';
import { Accessor } from 'solid-js';
import { trustLevelsService } from '@/services/api/trustLevels.service';
import type { TrustLevel } from '@/types/community.types';

export const useTrustLevelsQuery = (
  communityId: Accessor<string | undefined>
) => {
  return createQuery(() => ({
    queryKey: ['trustLevels', communityId()],
    queryFn: () => trustLevelsService.listTrustLevels(communityId()!),
    enabled: !!communityId(),
  }));
};
