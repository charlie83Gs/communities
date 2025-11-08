export interface TrustView {
  userId: string;
  communityId: string;
  points: number; // total = peer awards + admin grants
  peerAwards: number; // count of trust_awards
  adminGrant: number; // admin_trust_grants.trust_amount
  updatedAt: string;
}

export interface TrustSummary {
  trusted: boolean;
  trustThreshold?: number; // Legacy field, may not be returned by backend
  points: number;
  roles: string[];

  // Trust permissions
  canViewTrust: boolean;
  canAwardTrust: boolean;

  // Wealth permissions
  canViewWealth: boolean;
  canCreateWealth: boolean;

  // Items permissions
  canViewItems: boolean;
  canManageItems: boolean;

  // Disputes permissions
  canViewDisputes: boolean;
  canHandleDisputes: boolean;

  // Polls permissions
  canViewPolls: boolean;
  canCreatePolls: boolean;

  // Pools permissions
  canViewPools: boolean;
  canCreatePools: boolean;

  // Councils permissions
  canViewCouncils: boolean;
  canCreateCouncils: boolean;

  // Forum permissions
  canViewForum: boolean;
  canManageForum: boolean;
  canCreateThreads: boolean;
  canUploadAttachments: boolean;
  canFlagContent: boolean;
  canReviewFlags: boolean;

  // Analytics permissions
  canViewAnalytics: boolean;

  // Legacy field for backward compatibility
  canAccessWealth?: boolean;
}

export interface TrustAward {
  id: string;
  communityId: string;
  fromUserId: string;
  toUserId: string;
  createdAt: string;
}

export interface AdminTrustGrant {
  id: string;
  communityId: string;
  adminUserId: string;
  toUserId: string;
  trustAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface TrustHistoryEntry {
  id: string;
  communityId: string;
  fromUserId: string | null;
  toUserId: string;
  action: 'award' | 'remove' | 'admin_grant';
  pointsDelta: number;
  createdAt: string;
}

export interface TrustTimelineItem {
  threshold: number;
  trustLevel: {
    name: string;
    id: string;
  } | null;
  permissions: string[];
  unlocked: boolean;
}

export interface TrustTimeline {
  userTrustScore: number;
  timeline: TrustTimelineItem[];
}
