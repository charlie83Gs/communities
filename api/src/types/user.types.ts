export interface UpdateUserPreferencesDto {
  displayName?: string;
  description?: string;
  profileImage?: string;
}

export interface UserPreferencesResponse {
  displayName?: string;
  description?: string;
  profileImage?: string;
}

// User Communities Summary types
export interface CommunitySummaryItem {
  id: string;
  name: string;
  description?: string;
  userTrustScore: number;
  memberCount: number;
  pendingIncoming: number;
  pendingOutgoing: number;
  lastActivityAt?: string;
}

export interface IncomingRequestItem {
  id: string;
  wealthId: string;
  wealthTitle: string;
  communityId: string;
  communityName: string;
  requesterDisplayName: string;
  unitsRequested?: number;
  createdAt: string;
}

export interface AcceptedOutgoingItem {
  id: string;
  wealthId: string;
  wealthTitle: string;
  communityId: string;
  communityName: string;
  unitsRequested?: number;
  createdAt: string;
}

export interface PoolDistributionItem {
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

export interface PendingInviteItem {
  id: string;
  communityId: string;
  communityName: string;
  inviterDisplayName: string;
  createdAt: string;
}

export interface DashboardNotification {
  id: string;
  type: string;
  title: string;
  message?: string;
  communityId: string;
  communityName?: string;
  resourceType: string;
  resourceId: string;
  actionUrl: string;
  createdAt: string;
}

export interface PendingActionsData {
  incomingRequests: IncomingRequestItem[];
  acceptedOutgoing: AcceptedOutgoingItem[];
  poolDistributions: PoolDistributionItem[];
}

export interface UserCommunitiesSummaryResponse {
  communities: CommunitySummaryItem[];
  pendingActions: PendingActionsData;
  invites: PendingInviteItem[];
  notifications: DashboardNotification[];
}
