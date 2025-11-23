import { TrustRequirement } from './trustLevel.types';

export interface TrustTitle {
  name: string;
  minScore: number;
}

export interface MetricVisibilitySettings {
  showActiveMembers?: boolean;
  showWealthGeneration?: boolean;
  showTrustNetwork?: boolean;
  showCouncilActivity?: boolean;
  showNeedsFulfillment?: boolean;
  showDisputeRate?: boolean;
}

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

  // Trust System Configuration
  minTrustToAwardTrust: TrustRequirement;
  minTrustToViewTrust: TrustRequirement;
  trustTitles: { titles: TrustTitle[] } | null;

  // Wealth Access Configuration
  minTrustForWealth: TrustRequirement;
  minTrustToViewWealth: TrustRequirement;

  // Item Management Configuration
  minTrustForItemManagement: TrustRequirement;
  minTrustToViewItems: TrustRequirement;

  // Dispute Handling Configuration
  minTrustForDisputeVisibility: TrustRequirement;
  minTrustForDisputeParticipation: TrustRequirement;
  allowOpenResolutions: boolean;
  requireMultipleMediators: boolean;
  minMediatorsCount: number | null;

  // Polling Permissions
  pollCreatorUsers: string[] | null; // Array of user IDs
  minTrustForPolls: TrustRequirement | null;
  minTrustToViewPolls: TrustRequirement | null;

  // Pool Permissions
  minTrustForPoolCreation: TrustRequirement | null;
  minTrustToViewPools: TrustRequirement | null;

  // Checkout Links Permissions (FT-21: Sharing Markets)
  minTrustForCheckoutLinks: TrustRequirement;

  // Council Permissions
  minTrustForCouncilCreation: TrustRequirement | null;
  minTrustToViewCouncils: TrustRequirement | null;

  // Forum Configuration
  minTrustForThreadCreation: TrustRequirement | null;
  minTrustForAttachments: TrustRequirement | null;
  minTrustForFlagging: TrustRequirement | null;
  minTrustForFlagReview: TrustRequirement | null;
  minTrustForForumModeration: TrustRequirement | null;
  minTrustToViewForum: TrustRequirement | null;

  // Analytics Configuration
  nonContributionThresholdDays: number | null;
  minTrustForHealthAnalytics: TrustRequirement;
  dashboardRefreshInterval: number | null; // in seconds
  metricVisibilitySettings: MetricVisibilitySettings | null;

  // Feature Flags - toggles for optional features
  // Core features (wealth, items, members, trust-timeline, activity, invites, trust-grants, settings) are always enabled
  featureFlags: FeatureFlags;

  createdBy: string | null;
  createdAt: Date | null;

  // Runtime fields (not persisted in database)
  userTrustScore?: number | null;
}

export interface CreateCommunityDto {
  name: string;
  description?: string;

  // Trust System Configuration
  minTrustToAwardTrust?: TrustRequirement;
  minTrustToViewTrust?: TrustRequirement;
  trustTitles?: { titles: TrustTitle[] };

  // Wealth Access Configuration
  minTrustForWealth?: TrustRequirement;
  minTrustToViewWealth?: TrustRequirement;

  // Item Management Configuration
  minTrustForItemManagement?: TrustRequirement;
  minTrustToViewItems?: TrustRequirement;

  // Dispute Handling Configuration
  minTrustForDisputes?: TrustRequirement;
  minTrustToViewDisputes?: TrustRequirement;
  disputeResolutionRole?: string;
  disputeHandlingCouncils?: string[];

  // Polling Permissions
  pollCreatorUsers?: string[];
  minTrustForPolls?: TrustRequirement;
  minTrustToViewPolls?: TrustRequirement;

  // Pool Permissions
  minTrustForPoolCreation?: TrustRequirement;
  minTrustToViewPools?: TrustRequirement;

  // Checkout Links Permissions (FT-21: Sharing Markets)
  minTrustForCheckoutLinks?: TrustRequirement;

  // Council Permissions
  minTrustForCouncilCreation?: TrustRequirement;
  minTrustToViewCouncils?: TrustRequirement;

  // Forum Configuration
  minTrustForThreadCreation?: TrustRequirement;
  minTrustForAttachments?: TrustRequirement;
  minTrustForFlagging?: TrustRequirement;
  minTrustForFlagReview?: TrustRequirement;
  minTrustForForumModeration?: TrustRequirement;
  minTrustToViewForum?: TrustRequirement;

  // Analytics Configuration
  nonContributionThresholdDays?: number;
  minTrustForHealthAnalytics?: TrustRequirement;
  dashboardRefreshInterval?: number;
  metricVisibilitySettings?: MetricVisibilitySettings;

  // Feature Flags
  featureFlags?: FeatureFlags;
}

export interface UpdateCommunityDto {
  name?: string;
  description?: string;

  // Trust System Configuration
  minTrustToAwardTrust?: TrustRequirement;
  minTrustToViewTrust?: TrustRequirement;
  trustTitles?: { titles: TrustTitle[] };

  // Wealth Access Configuration
  minTrustForWealth?: TrustRequirement;
  minTrustToViewWealth?: TrustRequirement;

  // Item Management Configuration
  minTrustForItemManagement?: TrustRequirement;
  minTrustToViewItems?: TrustRequirement;

  // Dispute Handling Configuration
  minTrustForDisputes?: TrustRequirement;
  minTrustToViewDisputes?: TrustRequirement;
  disputeResolutionRole?: string;
  disputeHandlingCouncils?: string[];

  // Polling Permissions
  pollCreatorUsers?: string[];
  minTrustForPolls?: TrustRequirement;
  minTrustToViewPolls?: TrustRequirement;

  // Pool Permissions
  minTrustForPoolCreation?: TrustRequirement;
  minTrustToViewPools?: TrustRequirement;

  // Checkout Links Permissions (FT-21: Sharing Markets)
  minTrustForCheckoutLinks?: TrustRequirement;

  // Council Permissions
  minTrustForCouncilCreation?: TrustRequirement;
  minTrustToViewCouncils?: TrustRequirement;

  // Forum Configuration
  minTrustForThreadCreation?: TrustRequirement;
  minTrustForAttachments?: TrustRequirement;
  minTrustForFlagging?: TrustRequirement;
  minTrustForFlagReview?: TrustRequirement;
  minTrustForForumModeration?: TrustRequirement;
  minTrustToViewForum?: TrustRequirement;

  // Analytics Configuration
  nonContributionThresholdDays?: number;
  minTrustForHealthAnalytics?: TrustRequirement;
  dashboardRefreshInterval?: number;
  metricVisibilitySettings?: MetricVisibilitySettings;

  // Feature Flags
  featureFlags?: FeatureFlags;

  // Value Recognition Settings
  valueRecognitionSettings?: Partial<ValueRecognitionSettings>;
}

export interface PaginatedCommunities {
  data: Community[];
  total: number;
  page: number;
  limit: number;
}

export interface CommunityMember {
  id: string;
  communityId: string;
  userId: string;
  roles: Array<'member' | 'admin'>;
  joinedAt: Date;
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
