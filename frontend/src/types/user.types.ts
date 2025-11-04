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