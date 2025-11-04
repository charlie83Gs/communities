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

export interface Community {
  id: string;
  name: string;
  description: string | null;

  // Trust System Configuration
  minTrustToAwardTrust: TrustRequirement;
  trustTitles: { titles: TrustTitle[] } | null;

  // Wealth Access Configuration
  minTrustForWealth: TrustRequirement;

  // Dispute Handling Configuration
  minTrustForDisputes: TrustRequirement | null;
  disputeResolutionRole: string | null;
  disputeHandlingCouncils: string[] | null; // Array of council IDs

  // Polling Permissions
  pollCreatorUsers: string[] | null; // Array of user IDs
  minTrustForPolls: TrustRequirement | null;

  // Forum Configuration
  minTrustForThreadCreation: TrustRequirement | null;
  minTrustForForumModeration: TrustRequirement | null;

  // Analytics Configuration
  nonContributionThresholdDays: number | null;
  dashboardRefreshInterval: number | null; // in seconds
  metricVisibilitySettings: MetricVisibilitySettings | null;

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
  trustTitles?: { titles: TrustTitle[] };

  // Wealth Access Configuration
  minTrustForWealth?: TrustRequirement;

  // Dispute Handling Configuration
  minTrustForDisputes?: TrustRequirement;
  disputeResolutionRole?: string;
  disputeHandlingCouncils?: string[];

  // Polling Permissions
  pollCreatorUsers?: string[];
  minTrustForPolls?: TrustRequirement;

  // Forum Configuration
  minTrustForThreadCreation?: TrustRequirement;
  minTrustForForumModeration?: TrustRequirement;

  // Analytics Configuration
  nonContributionThresholdDays?: number;
  dashboardRefreshInterval?: number;
  metricVisibilitySettings?: MetricVisibilitySettings;
}

export interface UpdateCommunityDto {
  name?: string;
  description?: string;

  // Trust System Configuration
  minTrustToAwardTrust?: TrustRequirement;
  trustTitles?: { titles: TrustTitle[] };

  // Wealth Access Configuration
  minTrustForWealth?: TrustRequirement;

  // Dispute Handling Configuration
  minTrustForDisputes?: TrustRequirement;
  disputeResolutionRole?: string;
  disputeHandlingCouncils?: string[];

  // Polling Permissions
  pollCreatorUsers?: string[];
  minTrustForPolls?: TrustRequirement;

  // Forum Configuration
  minTrustForThreadCreation?: TrustRequirement;
  minTrustForForumModeration?: TrustRequirement;

  // Analytics Configuration
  nonContributionThresholdDays?: number;
  dashboardRefreshInterval?: number;
  metricVisibilitySettings?: MetricVisibilitySettings;
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