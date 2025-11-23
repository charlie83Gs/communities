import { userDashboardRepository } from '@/repositories/userDashboard.repository';
import type { UserCommunitiesSummaryResponse } from '@/types/user.types';

class UserDashboardService {
  /**
   * Get aggregated dashboard data for a user's communities and pending actions
   * @param userId - The authenticated user's ID
   * @returns Summary of communities, pending actions, and invites
   */
  async getCommunitiesSummary(userId: string): Promise<UserCommunitiesSummaryResponse> {
    // Fetch all data in parallel for better performance
    const [
      communities,
      incomingRequests,
      acceptedOutgoing,
      poolDistributions,
      invites,
      notifications,
    ] = await Promise.all([
      userDashboardRepository.getCommunitiesWithStats(userId),
      userDashboardRepository.getIncomingRequests(userId),
      userDashboardRepository.getAcceptedOutgoingRequests(userId),
      userDashboardRepository.getPoolDistributionRequests(userId),
      userDashboardRepository.getPendingInvites(userId),
      userDashboardRepository.getUnreadNotifications(userId),
    ]);

    return {
      communities,
      pendingActions: {
        incomingRequests,
        acceptedOutgoing,
        poolDistributions,
      },
      invites,
      notifications,
    };
  }
}

export const userDashboardService = new UserDashboardService();
