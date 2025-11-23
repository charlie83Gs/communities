import { createQuery, createMutation, useQueryClient } from '@tanstack/solid-query';
import { Accessor } from 'solid-js';
import { forumService } from '@/services/api/forum.service';
import type {
  CreateCategoryDto,
  CreateThreadDto,
  CreatePostDto,
  ThreadListParams,
} from '@/types/forum.types';

// Categories
export const useForumCategoriesQuery = (communityId: Accessor<string | undefined>) => {
  return createQuery(() => {
    const id = communityId();
    const isValidUUID =
      id && id !== 'undefined' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);

    return {
      queryKey: ['forum', 'categories', id],
      queryFn: () => forumService.getCategories(id!),
      enabled: !!isValidUUID,
      staleTime: 30000,
      gcTime: 300000,
    };
  });
};

export const useCreateCategoryMutation = () => {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationFn: ({ communityId, data }: { communityId: string; data: CreateCategoryDto }) =>
      forumService.createCategory(communityId, data),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['forum', 'categories', variables.communityId] });
    },
  }));
};

// Threads
export const useForumThreadsQuery = (
  communityId: Accessor<string | undefined>,
  categoryId: Accessor<string | undefined>,
  params?: Accessor<ThreadListParams | undefined>
) => {
  return createQuery(() => {
    const commId = communityId();
    const catId = categoryId();
    const isValidCommunityUUID =
      commId &&
      commId !== 'undefined' &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(commId);
    const isValidCategoryUUID =
      catId &&
      catId !== 'undefined' &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(catId);

    return {
      queryKey: ['forum', 'threads', commId, catId, params?.()],
      queryFn: () => forumService.getThreads(commId!, catId!, params?.()),
      enabled: !!isValidCommunityUUID && !!isValidCategoryUUID,
      staleTime: 10000,
      gcTime: 300000,
    };
  });
};

export const useCreateThreadMutation = () => {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationFn: ({ communityId, categoryId, data }: { communityId: string; categoryId: string; data: CreateThreadDto }) =>
      forumService.createThread(communityId, categoryId, data),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['forum', 'threads', variables.communityId, variables.categoryId], exact: false });
      void queryClient.invalidateQueries({ queryKey: ['forum', 'categories', variables.communityId] });
    },
  }));
};

export const useDeleteThreadMutation = () => {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationFn: ({ communityId, threadId, categoryId }: { communityId: string; threadId: string; categoryId: string }) =>
      forumService.deleteThread(communityId, threadId),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['forum', 'threads', variables.communityId, variables.categoryId], exact: false });
      void queryClient.invalidateQueries({ queryKey: ['forum', 'categories', variables.communityId] });
      void queryClient.removeQueries({ queryKey: ['forum', 'thread', variables.communityId, variables.threadId] });
    },
  }));
};

// Thread Detail
export const useForumThreadDetailQuery = (communityId: Accessor<string | undefined>, threadId: Accessor<string | undefined>) => {
  return createQuery(() => {
    const commId = communityId();
    const thrId = threadId();
    const isValidCommunityUUID =
      commId &&
      commId !== 'undefined' &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(commId);
    const isValidThreadUUID =
      thrId &&
      thrId !== 'undefined' &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(thrId);

    return {
      queryKey: ['forum', 'thread', commId, thrId],
      queryFn: () => forumService.getThreadDetail(commId!, thrId!),
      enabled: !!isValidCommunityUUID && !!isValidThreadUUID,
      staleTime: 5000,
      gcTime: 300000,
    };
  });
};

// Posts
export const useCreatePostMutation = () => {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationFn: ({ communityId, threadId, data }: { communityId: string; threadId: string; data: CreatePostDto }) =>
      forumService.createPost(communityId, threadId, data),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['forum', 'thread', variables.communityId, variables.threadId] });
    },
  }));
};

export const useDeletePostMutation = () => {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationFn: ({ communityId, postId, threadId }: { communityId: string; postId: string; threadId: string }) =>
      forumService.deletePost(communityId, postId),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['forum', 'thread', variables.communityId, variables.threadId] });
    },
  }));
};

// Thread Actions
export const usePinThreadMutation = () => {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationFn: ({ communityId, threadId, isPinned, categoryId }: { communityId: string; threadId: string; isPinned: boolean; categoryId: string }) =>
      forumService.pinThread(communityId, threadId, isPinned),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['forum', 'thread', variables.communityId, variables.threadId] });
      void queryClient.invalidateQueries({ queryKey: ['forum', 'threads', variables.communityId, variables.categoryId], exact: false });
    },
  }));
};

export const useLockThreadMutation = () => {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationFn: ({ communityId, threadId, isLocked }: { communityId: string; threadId: string; isLocked: boolean }) =>
      forumService.lockThread(communityId, threadId, isLocked),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['forum', 'thread', variables.communityId, variables.threadId] });
    },
  }));
};

export const useVoteOnThreadMutation = () => {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationFn: ({ communityId, threadId, voteType }: { communityId: string; threadId: string; voteType: 'up' | 'down' | 'remove' }) =>
      forumService.voteOnThread(communityId, threadId, voteType),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['forum', 'thread', variables.communityId, variables.threadId] });
      void queryClient.invalidateQueries({ queryKey: ['forum', 'threads', variables.communityId], exact: false });
    },
  }));
};

export const useVoteOnPostMutation = () => {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationFn: ({ communityId, postId, threadId, voteType }: { communityId: string; postId: string; threadId: string; voteType: 'up' | 'down' | 'remove' }) =>
      forumService.voteOnPost(communityId, postId, voteType),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['forum', 'thread', variables.communityId, variables.threadId] });
    },
  }));
};

export const useSetBestAnswerMutation = () => {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationFn: ({ communityId, threadId, postId }: { communityId: string; threadId: string; postId: string }) =>
      forumService.setBestAnswer(communityId, threadId, postId),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['forum', 'thread', variables.communityId, variables.threadId] });
    },
  }));
};

// Homepage pinned threads
export const useHomepagePinnedThreadsQuery = (communityId: Accessor<string | undefined>) => {
  return createQuery(() => {
    const id = communityId();
    const isValidUUID =
      id && id !== 'undefined' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);

    return {
      queryKey: ['forum', 'homepage-pinned', id],
      queryFn: () => forumService.getHomepagePinnedThreads(id!),
      enabled: !!isValidUUID,
      staleTime: 30000,
      gcTime: 300000,
    };
  });
};

export const useUpdateHomepagePinMutation = () => {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationFn: ({
      communityId,
      threadId,
      isPinned,
      priority,
      categoryId,
    }: {
      communityId: string;
      threadId: string;
      isPinned: boolean;
      priority?: number;
      categoryId: string;
    }) => forumService.updateHomepagePin(communityId, threadId, isPinned, priority),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['forum', 'homepage-pinned', variables.communityId] });
      void queryClient.invalidateQueries({ queryKey: ['forum', 'thread', variables.communityId, variables.threadId] });
      void queryClient.invalidateQueries({ queryKey: ['forum', 'threads', variables.communityId, variables.categoryId], exact: false });
    },
  }));
};
