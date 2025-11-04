import { createQuery, CreateQueryResult } from '@tanstack/solid-query';
import { Accessor } from 'solid-js';
import { itemsService } from '@/services/api/items.service';

export const useCanManageItemsQuery = (
  communityId: Accessor<string | undefined>
): CreateQueryResult<{ canManage: boolean }, Error> => {
  return createQuery(() => {
    const id = communityId();
    const isValidUUID = id && id !== 'undefined' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);

    return {
      queryKey: ['community', id, 'permissions', 'can-manage-items'],
      queryFn: () => itemsService.canManageItems(id!),
      enabled: !!isValidUUID,
      staleTime: 30000, // 30 seconds - permissions don't change often
      gcTime: 300000, // 5 minutes
    };
  }) as ReturnType<typeof createQuery<{ canManage: boolean }, Error>>;
};
