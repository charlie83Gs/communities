export interface ForumCategory {
  id: string;
  name: string;
  description: string | null;
  displayOrder: number;
  createdAt: Date;
  threadCount: number;
  lastActivity: Date | null;
}

export interface ForumThread {
  id: string;
  categoryId: string;
  title: string;
  isPinned: boolean;
  isLocked: boolean;
  createdAt: Date;
  authorId: string;
  authorName: string;
  postCount: number;
  lastActivity: Date | null;
  upvotes: number;
  downvotes: number;
  tags: string[];
}

export interface ForumThreadDetail {
  id: string;
  categoryId: string;
  title: string;
  content: string;
  isPinned: boolean;
  isLocked: boolean;
  createdAt: Date;
  authorId: string;
  authorName: string;
  upvotes: number;
  downvotes: number;
  tags: string[];
  bestAnswerPostId: string | null;
}

export interface ForumPost {
  id: string;
  threadId: string;
  content: string;
  createdAt: Date;
  authorId: string;
  authorName: string;
  upvotes: number;
  downvotes: number;
  isBestAnswer: boolean;
}

export interface CreateCategoryDto {
  name: string;
  description: string;
}

export interface CreateThreadDto {
  title: string;
  content: string;
  tags?: string[];
}

export interface CreatePostDto {
  content: string;
}

export interface VoteDto {
  voteType: 'up' | 'down' | 'remove';
}

export interface SetBestAnswerDto {
  postId: string;
}

export interface PinThreadDto {
  isPinned: boolean;
}

export interface LockThreadDto {
  isLocked: boolean;
}

export interface ThreadListParams {
  page?: number;
  limit?: number;
  sort?: 'newest' | 'popular' | 'mostUpvoted';
}

export interface ThreadListResponse {
  threads: ForumThread[];
  total: number;
  page: number;
  limit: number;
}

export interface ThreadDetailResponse {
  thread: ForumThreadDetail;
  posts: ForumPost[];
}
