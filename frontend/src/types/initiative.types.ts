export interface Initiative {
  id: string;
  councilId: string;
  communityId: string;
  title: string;
  description: string;
  createdBy: string | null;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  upvotes?: number;
  downvotes?: number;
  userVote?: 'upvote' | 'downvote' | null;
}

export interface InitiativeReport {
  id: string;
  initiativeId: string;
  title: string;
  content: string;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInitiativeDto {
  title: string;
  description: string;
}

export interface CreateInitiativeReportDto {
  title: string;
  content: string;
}

export interface VoteInitiativeDto {
  voteType: 'upvote' | 'downvote';
}

export interface InitiativeComment {
  id: string;
  initiativeId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReportComment {
  id: string;
  reportId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentDto {
  content: string;
}

export interface InitiativesListResponse {
  initiatives: Initiative[];
  total: number;
  page: number;
  limit: number;
}

export interface ReportsListResponse {
  reports: InitiativeReport[];
  total: number;
}

export interface CommentsListResponse {
  comments: InitiativeComment[] | ReportComment[];
  total: number;
}
