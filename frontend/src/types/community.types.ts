export interface FeatureFlags {
  poolsEnabled: boolean;
  needsEnabled: boolean;
  pollsEnabled: boolean;
  councilsEnabled: boolean;
  forumEnabled: boolean;
  healthAnalyticsEnabled: boolean;
  disputesEnabled: boolean;
  contributionsEnabled: boolean;
}

export interface ValueRecognitionSettings {
  enabled: boolean;
  showAggregateStats: boolean;
  allowPeerGrants: boolean;
  peerGrantMonthlyLimit: number;
  peerGrantSamePersonLimit: number;
  requireVerification: boolean;
  autoVerifySystemActions: boolean;
  allowCouncilVerification: boolean;
  verificationReminderDays: number;
  softReciprocityNudges: boolean;
}

export interface Community {
  id: string;
  name: string;
  description: string | null;
  locationRestricted?: boolean;
  country?: string;
  stateProvince?: string;
  city?: string;
  minTrustToAwardTrust: TrustRequirement;
  minTrustForWealth: TrustRequirement;
  minTrustForDisputeVisibility: TrustRequirement | null;
  minTrustForDisputeParticipation: TrustRequirement | null;
  minTrustForPolls: TrustRequirement | null;
  minTrustForPoolCreation: TrustRequirement | null;
  minTrustForCouncilCreation: TrustRequirement | null;
  minTrustForForumModeration: TrustRequirement | null;
  minTrustForThreadCreation: TrustRequirement | null;
  minTrustForAttachments: TrustRequirement | null;
  minTrustForFlagging: TrustRequirement | null;
  minTrustForFlagReview: TrustRequirement | null;
  minTrustForHealthAnalytics: TrustRequirement | null;
  minTrustForNeeds: TrustRequirement | null;
  minTrustToViewTrust: TrustRequirement | null;
  minTrustToViewNeeds: TrustRequirement | null;
  minTrustToViewWealth: TrustRequirement | null;
  minTrustToViewItems: TrustRequirement | null;
  minTrustToViewPolls: TrustRequirement | null;
  minTrustToViewPools: TrustRequirement | null;
  minTrustToViewCouncils: TrustRequirement | null;
  minTrustToViewForum: TrustRequirement | null;
  featureFlags: FeatureFlags;
  valueRecognitionSettings?: ValueRecognitionSettings;
  createdBy: string | null;
  createdAt: Date | null;
  userTrustScore?: number | null;
}

export interface CreateCommunityDto {
  name: string;
  description?: string | null;
  minTrustToAwardTrust?: TrustRequirement;
  minTrustForWealth?: TrustRequirement;
  minTrustForDisputeVisibility?: TrustRequirement;
  minTrustForDisputeParticipation?: TrustRequirement;
  minTrustForPolls?: TrustRequirement;
  minTrustForPoolCreation?: TrustRequirement;
  minTrustForCouncilCreation?: TrustRequirement;
  minTrustForForumModeration?: TrustRequirement;
  minTrustForThreadCreation?: TrustRequirement;
  minTrustForAttachments?: TrustRequirement;
  minTrustForFlagging?: TrustRequirement;
  minTrustForFlagReview?: TrustRequirement;
  minTrustForHealthAnalytics?: TrustRequirement;
  minTrustForNeeds?: TrustRequirement;
  minTrustToViewTrust?: TrustRequirement;
  minTrustToViewNeeds?: TrustRequirement;
  minTrustToViewWealth?: TrustRequirement;
  minTrustToViewItems?: TrustRequirement;
  minTrustToViewPolls?: TrustRequirement;
  minTrustToViewPools?: TrustRequirement;
  minTrustToViewCouncils?: TrustRequirement;
  minTrustToViewForum?: TrustRequirement;
  featureFlags?: FeatureFlags;
}

export interface UpdateCommunityDto {
  name?: string;
  description?: string | null;
  minTrustToAwardTrust?: TrustRequirement;
  minTrustForWealth?: TrustRequirement;
  minTrustForDisputeVisibility?: TrustRequirement;
  minTrustForDisputeParticipation?: TrustRequirement;
  minTrustForPolls?: TrustRequirement;
  minTrustForPoolCreation?: TrustRequirement;
  minTrustForCouncilCreation?: TrustRequirement;
  minTrustForForumModeration?: TrustRequirement;
  minTrustForThreadCreation?: TrustRequirement;
  minTrustForAttachments?: TrustRequirement;
  minTrustForFlagging?: TrustRequirement;
  minTrustForFlagReview?: TrustRequirement;
  minTrustForHealthAnalytics?: TrustRequirement;
  minTrustForNeeds?: TrustRequirement;
  minTrustToViewTrust?: TrustRequirement;
  minTrustToViewNeeds?: TrustRequirement;
  minTrustToViewWealth?: TrustRequirement;
  minTrustToViewItems?: TrustRequirement;
  minTrustToViewPolls?: TrustRequirement;
  minTrustToViewPools?: TrustRequirement;
  minTrustToViewCouncils?: TrustRequirement;
  minTrustToViewForum?: TrustRequirement;
  featureFlags?: FeatureFlags;
  valueRecognitionSettings?: Partial<ValueRecognitionSettings>;
}

export interface PaginatedCommunities {
  data: Community[];
  total: number;
  page: number;
  limit: number;
}

// Invite types
export interface CommunityInvite {
  id: string;
  communityId: string;
  type: 'user' | 'link';
  role: string;
  invitedUserId?: string;
  title?: string;
  secret?: string;
  expiresAt?: Date | null;
  status: 'pending' | 'redeemed' | 'cancelled' | 'expired';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  redeemedBy?: string;
  redeemedAt?: Date | null;
  cancelledAt?: Date | null;
}

export interface CreateUserInviteDto {
  invitedUserId: string;
  role: string;
}

export interface CreateLinkInviteDto {
  role: string;
  title?: string;
  expiresAt: string;
}

// Member types
export interface CommunityMember {
  userId: string;
  roles: string[];
  displayName?: string | null;
  email?: string | null;
  profileImage?: string | null;
}
export interface SearchCommunitiesParams {
  q?: string;
  locationRestricted?: boolean;
  country?: string;
  stateProvince?: string;
  city?: string;
  page: number;
  limit: number;
}

export interface SearchCommunitiesResponse {
  items: Community[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

// Trust Level types
export interface TrustLevel {
  id: string;
  name: string;
  threshold: number;
  communityId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTrustLevelDto {
  name: string;
  threshold: number;
}

export interface UpdateTrustLevelDto {
  name?: string;
  threshold?: number;
}

export interface TrustRequirement {
  type: 'level' | 'number';
  value: string | number; // string (trust level name) when type is 'level', number when type is 'number'
}

export interface TrustLevelPickerValue {
  customValue: number;
  levelId?: string;
}

export interface CommunityStatsSummary {
  memberCount: number;
  avgTrustScore: number;
  wealthCount: number;
  poolCount: number;
  needsCount: number;
}

export interface CommunityPendingActions {
  incomingRequests: number;
  outgoingRequests: number;
  poolDistributions: number;
  openDisputes: number;
}
