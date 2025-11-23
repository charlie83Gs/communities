export interface User {
  id: string;
  email: string;
  username?: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  createdAt: string;
  updatedAt: string;
  preferences?: {
    description?: string;
  };
}

export interface UserPreferences {
  displayName?: string;
  description?: string;
  profileImage?: string;
}

export interface SavedImage {
  filename: string;
}

export interface UpdateUserPreferencesDto {
  displayName?: string;
  description?: string;
}

// Search users
export interface SearchUser {
  id: string;
  displayName: string;
  username: string;
  email: string;
  profileImage?: string;
}

export type SearchUsersParams = {
  q: string;
  limit?: number;
};

export type SearchUsersResponse = SearchUser[];

export interface MyInvite {
  id: string;
  communityId: string;
  role: string;
  status: 'pending' | 'redeemed' | 'cancelled' | 'expired';
  createdBy: string;
  createdAt: string;
}

export type MyInvitesResponse = MyInvite[];

// Trust Timeline
export interface TrustTimelineEvent {
  timestamp: string;
  type: 'award' | 'remove' | 'admin_grant';
  fromUserId: string | null;
  fromUserDisplayName: string | null;
  amount: number;
  cumulativeTrust: number;
  communityId: string;
  communityName: string;
}

export type TrustTimelineResponse = TrustTimelineEvent[];

export interface TrustSummary {
  totalTrustPoints: number;
  totalAwardsReceived: number;
  totalAwardsRemoved: number;
  trustByCommunity: {
    communityId: string;
    communityName: string;
    trustPoints: number;
  }[];
}

// Dashboard Summary Types
export interface DashboardCommunitySummary {
  id: string;
  name: string;
  description?: string;
  userTrustScore: number;
  memberCount: number;
  pendingIncoming: number;
  pendingOutgoing: number;
  lastActivityAt?: string;
}

export interface DashboardIncomingRequest {
  id: string;
  wealthId: string;
  wealthTitle: string;
  communityId: string;
  communityName: string;
  requesterDisplayName: string;
  unitsRequested?: number;
  createdAt: string;
}

export interface DashboardAcceptedOutgoing {
  id: string;
  wealthId: string;
  wealthTitle: string;
  communityId: string;
  communityName: string;
  unitsRequested?: number;
  createdAt: string;
}

export interface DashboardPoolDistribution {
  id: string;
  wealthId: string;
  wealthTitle: string;
  poolId: string;
  poolName: string;
  communityId: string;
  communityName: string;
  unitsRequested?: number;
  createdAt: string;
}

export interface DashboardPendingActions {
  incomingRequests: DashboardIncomingRequest[];
  acceptedOutgoing: DashboardAcceptedOutgoing[];
  poolDistributions: DashboardPoolDistribution[];
}

export interface DashboardInvite {
  id: string;
  communityId: string;
  communityName: string;
  inviterDisplayName: string;
  createdAt: string;
}

export interface DashboardNotification {
  id: string;
  type: string;  // 'wealth_request_message', 'wealth_request_status', etc.
  title: string;
  message?: string;
  communityId: string;
  communityName?: string;
  resourceType: string;
  resourceId: string;
  actionUrl: string;  // e.g., '/wealth/uuid-here'
  createdAt: string;
}

export interface DashboardSummaryResponse {
  communities: DashboardCommunitySummary[];
  pendingActions: DashboardPendingActions;
  invites: DashboardInvite[];
  notifications: DashboardNotification[];
}
