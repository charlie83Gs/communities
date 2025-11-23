import { createQuery, createMutation, useQueryClient } from '@tanstack/solid-query';
import type { Accessor } from 'solid-js';
import { notificationService } from '@/services/api/notification.service';

/**
 * Queries and mutations for Notifications feature
 * Location per architecture: /hooks/queries (data-fetching/query hooks)
 */

export const useNotificationsQuery = (
  communityId?: Accessor<string | undefined>,
  unreadOnly?: Accessor<boolean | undefined>
) => {
  return createQuery(() => ({
    queryKey: ['notifications', communityId?.(), unreadOnly?.()],
    queryFn: () => notificationService.list({
      communityId: communityId?.(),
      unreadOnly: unreadOnly?.(),
    }),
  }));
};

export const useUnreadCountQuery = (communityId?: Accessor<string | undefined>) => {
  return createQuery(() => ({
    queryKey: ['notifications', 'unread-count', communityId?.()],
    queryFn: () => notificationService.getUnreadCount(communityId?.()),
    // Refresh every 30 seconds to keep the count updated
    refetchInterval: 30000,
  }));
};

export const useMarkAsReadMutation = () => {
  const qc = useQueryClient();
  return createMutation(() => ({
    mutationFn: (notificationId: string) => notificationService.markAsRead(notificationId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  }));
};

export const useMarkAllAsReadMutation = () => {
  const qc = useQueryClient();
  return createMutation(() => ({
    mutationFn: (communityId?: string) => notificationService.markAllAsRead(communityId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  }));
};
