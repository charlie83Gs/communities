/**
 * Disputes System Types
 * Location per architecture: /types (shared type/interface/schema)
 */

export type DisputeStatus = 'open' | 'in_mediation' | 'resolved' | 'closed';
export type DisputeParticipantRole = 'initiator' | 'participant';
export type MediatorStatus = 'proposed' | 'accepted' | 'rejected' | 'withdrawn';
export type ResolutionType = 'open' | 'closed';

export interface Dispute {
  id: string;
  communityId: string;
  title: string;
  description: string;
  status: DisputeStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
}

export interface DisputeParticipant {
  id: string;
  disputeId: string;
  userId: string;
  role: DisputeParticipantRole;
  addedAt: string;
  addedBy: string;
  user?: {
    id: string;
    username: string;
    displayName?: string;
  };
}

export interface DisputeMediator {
  id: string;
  disputeId: string;
  userId: string;
  status: MediatorStatus;
  proposedAt: string;
  respondedAt: string | null;
  respondedBy: string | null;
  user?: {
    id: string;
    username: string;
    displayName?: string;
  };
}

export interface DisputeResolution {
  id: string;
  disputeId: string;
  resolutionType: ResolutionType;
  resolution: string;
  createdBy: string;
  createdAt: string;
  isPublic: boolean;
  creator?: {
    id: string;
    username: string;
    displayName?: string;
  };
}

export interface DisputeMessage {
  id: string;
  disputeId: string;
  userId: string;
  message: string;
  createdAt: string;
  visibleToParticipants: boolean;
  visibleToMediators: boolean;
  user?: {
    id: string;
    username: string;
    displayName?: string;
  };
}

export interface DisputeHistoryEntry {
  id: string;
  disputeId: string;
  action: string;
  performedBy: string;
  performedAt: string;
  metadata: Record<string, any>;
  user?: {
    id: string;
    username: string;
    displayName?: string;
  };
}

export interface DisputeDetail extends Dispute {
  participants: DisputeParticipant[];
  mediators: DisputeMediator[];
  resolution: DisputeResolution | null;
  participantCount: number;
  acceptedMediatorCount: number;
  proposedMediatorCount: number;
  // Permission flags
  canView: boolean;
  canEdit: boolean;
  isParticipant: boolean;
  isMediator: boolean;
  isMediatorAccepted: boolean;
  canProposeAsMediator: boolean;
  canAcceptMediator: boolean;
  canCreateResolution: boolean;
  canViewResolution: boolean;
}

export interface DisputeListItem extends Dispute {
  participantCount: number;
  acceptedMediatorCount: number;
  proposedMediatorCount: number;
  hasResolution: boolean;
  isParticipant: boolean;
  isMediator: boolean;
}

export interface CreateDisputeDto {
  title: string;
  description: string;
  additionalParticipantIds?: string[];
}

export interface AddDisputeParticipantDto {
  userId: string;
}

export interface CreateMediatorProposalDto {
  // No body needed - user proposing themselves
}

export interface RespondToMediatorDto {
  accept: boolean;
}

export interface CreateDisputeResolutionDto {
  resolutionType: ResolutionType;
  resolution: string;
}

export interface CreateDisputeMessageDto {
  message: string;
  visibleToParticipants: boolean;
  visibleToMediators: boolean;
}

export interface UpdateDisputeStatusDto {
  status: DisputeStatus;
}

export interface DisputesListResponse {
  disputes: DisputeListItem[];
  total: number;
}

export interface DisputeMessagesResponse {
  messages: DisputeMessage[];
  total: number;
}
