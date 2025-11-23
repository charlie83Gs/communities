/**
 * Forum types for the API
 */

// Request types for homepage pin feature
export interface HomepagePinRequest {
  isPinned: boolean;
  priority?: number; // 0-100, higher = appears first. Default: 0
}

// Response type for homepage pinned threads
export interface HomepagePinnedThread {
  id: string;
  title: string;
  postCount: number;
  authorId: string;
  authorDisplayName: string;
  priority: number;
  createdAt: string;
}

// Response type for get homepage pinned threads endpoint
export interface GetHomepagePinnedThreadsResponse {
  threads: HomepagePinnedThread[];
}
