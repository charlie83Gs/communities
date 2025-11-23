import { createQuery } from '@tanstack/solid-query';
import { usersService } from '@/services/api/users.service';
import type { DashboardSummaryResponse } from '@/types/user.types';

/**
 * Query hook for fetching dashboard summary data
 * Includes communities, pending actions, and invites
 */
export const useDashboardSummaryQuery = () => {
  return createQuery(() => ({
    queryKey: ['dashboard', 'summary'],
    queryFn: () => usersService.getCommunitiesSummary(),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  }));
};
