/**
 * Initiative entity with vote counts and user vote status
 */
export interface Initiative {
  id: string;
  councilId: string;
  communityId: string;
  title: string;
  description: string;
  createdBy: string | null;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
  upvotes?: number;
  downvotes?: number;
  userVote?: 'upvote' | 'downvote' | null;
}

/**
 * Initiative report entity
 */
export interface InitiativeReport {
  id: string;
  initiativeId: string;
  title: string;
  content: string;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Initiative comment entity
 */
export interface InitiativeComment {
  id: string;
  initiativeId: string;
  authorId: string;
  authorName?: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Initiative report comment entity
 */
export interface InitiativeReportComment {
  id: string;
  reportId: string;
  authorId: string;
  authorName?: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * DTO for creating an initiative
 */
export interface CreateInitiativeDto {
  title: string;
  description: string;
}

/**
 * DTO for updating an initiative
 */
export interface UpdateInitiativeDto {
  title?: string;
  description?: string;
  status?: 'active' | 'completed' | 'cancelled';
}

/**
 * DTO for creating an initiative report
 */
export interface CreateInitiativeReportDto {
  title: string;
  content: string;
}

/**
 * DTO for voting on an initiative
 */
export interface VoteInitiativeDto {
  voteType: 'upvote' | 'downvote';
}

/**
 * DTO for creating an initiative comment
 */
export interface CreateInitiativeCommentDto {
  content: string;
}

/**
 * DTO for creating a report comment
 */
export interface CreateReportCommentDto {
  content: string;
}
