import { apiClient } from './client';
import type {
  ForumCategory,
  ForumThread,
  ForumThreadDetail,
  ForumPost,
  CreateCategoryDto,
  CreateThreadDto,
  CreatePostDto,
  VoteDto,
  SetBestAnswerDto,
  PinThreadDto,
  LockThreadDto,
  ThreadListParams,
  ThreadListResponse,
  ThreadDetailResponse,
  HomepagePinnedThreadsResponse,
} from '@/types/forum.types';

class ForumService {
  // Categories
  async getCategories(communityId: string): Promise<{ categories: ForumCategory[] }> {
    const response = await apiClient.get(`/api/v1/communities/${communityId}/forum/categories`);
    // Transform date strings to Date objects
    return {
      categories: response.categories.map((cat: any) => ({
        ...cat,
        createdAt: new Date(cat.createdAt),
        lastActivity: cat.lastActivity ? new Date(cat.lastActivity) : null,
      })),
    };
  }

  async createCategory(communityId: string, data: CreateCategoryDto): Promise<{ category: ForumCategory }> {
    const response = await apiClient.post(`/api/v1/communities/${communityId}/forum/categories`, data);
    return {
      category: {
        ...response.category,
        createdAt: new Date(response.category.createdAt),
        lastActivity: response.category.lastActivity ? new Date(response.category.lastActivity) : null,
      },
    };
  }

  // Threads
  async getThreads(
    communityId: string,
    categoryId: string,
    params?: ThreadListParams
  ): Promise<ThreadListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.sort) queryParams.append('sort', params.sort);

    const query = queryParams.toString();
    const endpoint = `/api/v1/communities/${communityId}/forum/categories/${categoryId}/threads${query ? `?${query}` : ''}`;

    const response = await apiClient.get(endpoint);
    return {
      ...response,
      threads: response.threads.map((thread: any) => ({
        ...thread,
        createdAt: new Date(thread.createdAt),
        lastActivity: thread.lastActivity ? new Date(thread.lastActivity) : null,
      })),
    };
  }

  async createThread(
    communityId: string,
    categoryId: string,
    data: CreateThreadDto
  ): Promise<{ thread: ForumThread }> {
    const response = await apiClient.post(
      `/api/v1/communities/${communityId}/forum/categories/${categoryId}/threads`,
      data
    );
    return {
      thread: {
        ...response.thread,
        createdAt: new Date(response.thread.createdAt),
        lastActivity: response.thread.lastActivity ? new Date(response.thread.lastActivity) : null,
      },
    };
  }

  async getThreadDetail(communityId: string, threadId: string): Promise<ThreadDetailResponse> {
    const response = await apiClient.get(`/api/v1/communities/${communityId}/forum/threads/${threadId}`);
    return {
      thread: {
        ...response.thread,
        createdAt: new Date(response.thread.createdAt),
      },
      posts: response.posts.map((post: any) => ({
        ...post,
        createdAt: new Date(post.createdAt),
      })),
    };
  }

  async deleteThread(communityId: string, threadId: string): Promise<void> {
    await apiClient.delete(`/api/v1/communities/${communityId}/forum/threads/${threadId}`);
  }

  // Posts
  async createPost(communityId: string, threadId: string, data: CreatePostDto): Promise<{ post: ForumPost }> {
    const response = await apiClient.post(
      `/api/v1/communities/${communityId}/forum/threads/${threadId}/posts`,
      data
    );
    return {
      post: {
        ...response.post,
        createdAt: new Date(response.post.createdAt),
      },
    };
  }

  async deletePost(communityId: string, postId: string): Promise<void> {
    await apiClient.delete(`/api/v1/communities/${communityId}/forum/posts/${postId}`);
  }

  // Thread actions
  async pinThread(communityId: string, threadId: string, isPinned: boolean): Promise<void> {
    await apiClient.put(`/api/v1/communities/${communityId}/forum/threads/${threadId}/pin`, { isPinned });
  }

  async lockThread(communityId: string, threadId: string, isLocked: boolean): Promise<void> {
    await apiClient.put(`/api/v1/communities/${communityId}/forum/threads/${threadId}/lock`, { isLocked });
  }

  async voteOnThread(communityId: string, threadId: string, voteType: VoteDto['voteType']): Promise<void> {
    await apiClient.post(`/api/v1/communities/${communityId}/forum/threads/${threadId}/vote`, { voteType });
  }

  async voteOnPost(communityId: string, postId: string, voteType: VoteDto['voteType']): Promise<void> {
    await apiClient.post(`/api/v1/communities/${communityId}/forum/posts/${postId}/vote`, { voteType });
  }

  async setBestAnswer(communityId: string, threadId: string, postId: string): Promise<void> {
    await apiClient.put(`/api/v1/communities/${communityId}/forum/threads/${threadId}/best-answer`, { postId });
  }

  // Homepage pinned threads
  async getHomepagePinnedThreads(communityId: string): Promise<HomepagePinnedThreadsResponse> {
    const response = await apiClient.get(`/api/v1/communities/${communityId}/forum/homepage-pinned`);
    return response;
  }

  async updateHomepagePin(
    communityId: string,
    threadId: string,
    isPinned: boolean,
    priority?: number
  ): Promise<ForumThread> {
    const response = await apiClient.put(
      `/api/v1/communities/${communityId}/forum/threads/${threadId}/homepage-pin`,
      { isPinned, priority }
    );
    return {
      ...response.thread,
      createdAt: new Date(response.thread.createdAt),
      lastActivity: response.thread.lastActivity ? new Date(response.thread.lastActivity) : null,
    };
  }
}

export const forumService = new ForumService();
