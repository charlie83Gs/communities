// Value Recognition System Types

export type VerificationStatus =
  | 'auto_verified'
  | 'pending'
  | 'verified'
  | 'disputed';

export type SourceType =
  | 'system_logged'
  | 'peer_grant'
  | 'self_reported';

// Recognized Contribution
export interface RecognizedContribution {
  id: string;
  communityId: string;
  contributorId: string;
  itemId: string;
  itemName: string; // From items.translations
  itemKind: 'object' | 'service';
  units: number;
  valuePerUnit: number; // From items.wealthValue
  totalValue: number;
  description: string;
  verificationStatus: VerificationStatus;
  verifiedBy?: string;
  verifiedAt?: string;
  beneficiaryIds?: string[];
  witnessIds?: string[];
  testimonial?: string;
  sourceType: SourceType;
  sourceId?: string;
  createdAt: string;
}

// Log Contribution DTO
export interface LogContributionDto {
  itemId: string;
  units: number;
  description: string;
  beneficiaryIds?: string[];
  witnessIds?: string[];
}

// Verify Contribution DTO
export interface VerifyContributionDto {
  testimonial?: string;
}

// Dispute Contribution DTO
export interface DisputeContributionDto {
  reason: string;
}

// Contribution Summary
export interface ContributionSummary {
  id: string;
  communityId: string;
  userId: string;
  totalValue6Months: number;
  totalValueLifetime: number;
  categoryBreakdown: Record<string, number>; // { "Item Name": 180, ... } - breakdown by item name
  lastContributionAt?: string;
  lastCalculatedAt: string;
}

// Contribution Profile (expanded view)
export interface ContributionProfile {
  userId: string;
  displayName?: string;
  email?: string;
  profileImage?: string;
  totalValue6Months: number;
  totalValueLifetime: number;
  categoryBreakdown: Record<string, number>; // Breakdown by item name
  recentContributions: RecognizedContribution[];
  testimonials: string[]; // Unique testimonials from beneficiaries
}

// Peer Recognition Grant
export interface PeerRecognitionGrant {
  id: string;
  communityId: string;
  fromUserId: string;
  toUserId: string;
  valueUnits: number;
  description: string;
  createdAt: string;
  monthYear: string; // 'YYYY-MM'
}

// Grant Peer Recognition DTO
export interface GrantPeerRecognitionDto {
  toUserId: string;
  valueUnits: number;
  description: string;
}

// Peer Recognition Limits
export interface PeerRecognitionLimits {
  monthlyLimit: number;
  samePersonLimit: number;
  usedThisMonth: number;
  grantsToUserThisMonth: Record<string, number>; // { userId: count }
}

// Value Calibration History (for item wealthValue changes)
export interface ValueCalibrationHistory {
  id: string;
  communityId: string;
  itemId: string;
  itemName: string;
  oldValuePerUnit: number;
  newValuePerUnit: number;
  reason?: string;
  proposedBy?: string;
  decidedAt: string;
  effectiveDate: string;
}

// Community Value Recognition Settings (subset of community settings)
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

// Pending Verifications (for user's verification queue)
export interface PendingVerification {
  contribution: RecognizedContribution;
  contributorName: string;
  contributorImage?: string;
}
