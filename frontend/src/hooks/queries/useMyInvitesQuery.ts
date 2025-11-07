import { createQuery } from '@tanstack/solid-query';
import { usersService } from '@/services/api/users.service';
import type { MyInvitesResponse } from '@/types/user.types';

import { Accessor } from 'solid-js';

export const useMyInvitesQuery = (
  userIdAccessor: Accessor<string | undefined>
) => {
  return createQuery(() => {
    const userId = userIdAccessor();
    return {
      queryKey: ['users', 'invites', userId],
      queryFn: () => usersService.getMyInvites(userId!),
      enabled: !!userId,
    };
  }) as ReturnType<typeof createQuery<MyInvitesResponse, Error>>;
};
