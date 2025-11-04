export type PollStatus = 'active' | 'closed';
export type PollCreatorType = 'user' | 'council' | 'pool';

export interface Poll {
  id: string;
  communityId: string;
  title: string;
  description: string | null;
  creatorType: PollCreatorType;
  creatorId: string | null;
  createdBy: string; // user ID
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

export interface PollDetail extends Poll {
  options: PollOption[];
  userVote?: { optionId: string };
  results: PollResult[];
}

export interface CreatePollDto {
  title: string;
  description?: string;
  options: string[];
  duration: number; // in hours
  creatorType: PollCreatorType;
  creatorId?: string; // required for council/pool
}

export interface PollComment {
  id: string;
  pollId: string;
  userId: string;
  userDisplayName: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePollCommentDto {
  content: string;
}

export interface UpdatePollCommentDto {
  content: string;
}
