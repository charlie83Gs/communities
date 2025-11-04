/**
 * Poll types and interfaces
 */

export type PollStatus = 'active' | 'closed';
export type PollCreatorType = 'user' | 'council' | 'pool';

export interface Poll {
  id: string;
  communityId: string;
  title: string;
  description: string | null;
  creatorType: PollCreatorType;
  creatorId: string | null;
  createdBy: string;
  status: PollStatus;
  endsAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PollOption {
  id: string;
  pollId: string;
  optionText: string;
  displayOrder: number;
  createdAt: Date;
}

export interface PollVote {
  id: string;
  pollId: string;
  optionId: string;
  userId: string;
  createdAt: Date;
}

export interface PollResult {
  optionId: string;
  votes: number;
  percentage: number;
}

export interface CreatePollDto {
  communityId: string;
  title: string;
  description?: string;
  options: string[];
  duration: number; // Duration in hours
  creatorType: PollCreatorType;
  creatorId?: string; // Required for council/pool, null for user
}

export interface PollWithDetails extends Poll {
  options: PollOption[];
  userVote?: {
    optionId: string;
  };
  results: PollResult[];
}

export interface ListPollsQuery {
  status?: PollStatus;
  creatorType?: PollCreatorType;
}
