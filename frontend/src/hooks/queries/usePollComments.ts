import { createQuery, createMutation, useQueryClient } from '@tanstack/solid-query';
import type { Accessor } from 'solid-js';
import { pollsService } from '@/services/api/polls.service';
import type { PollComment, CreatePollCommentDto, UpdatePollCommentDto } from '@/types/poll.types';

/**
 * Queries and mutations for Poll Comments
 * Location per architecture: /hooks/queries (data-fetching/query hooks)
 */

export const usePollCommentsQuery = (
  communityId: Accessor<string | undefined>,
  pollId: Accessor<string | undefined>
) => {
  return createQuery(() => ({
    queryKey: ['polls', 'comments', communityId(), pollId()],
    queryFn: () => pollsService.getComments(communityId()!, pollId()!),
    enabled: !!communityId() && !!pollId(),
  }));
};

export const useCreatePollCommentMutation = () => {
  const qc = useQueryClient();
  return createMutation(() => ({
    mutationFn: (vars: { communityId: string; pollId: string; dto: CreatePollCommentDto }) =>
      pollsService.createComment(vars.communityId, vars.pollId, vars.dto),
    onSuccess: (_data, vars) => {
      // Invalidate comments list
      void qc.invalidateQueries({
        queryKey: ['polls', 'comments', vars.communityId, vars.pollId],
      });
    },
  }));
};

export const useUpdatePollCommentMutation = () => {
  const qc = useQueryClient();
  return createMutation(() => ({
    mutationFn: (vars: {
      communityId: string;
      pollId: string;
      commentId: string;
      dto: UpdatePollCommentDto;
    }) => pollsService.updateComment(vars.communityId, vars.pollId, vars.commentId, vars.dto),
    onSuccess: (_data, vars) => {
      // Invalidate comments list
      void qc.invalidateQueries({
        queryKey: ['polls', 'comments', vars.communityId, vars.pollId],
      });
    },
  }));
};

export const useDeletePollCommentMutation = () => {
  const qc = useQueryClient();
  return createMutation(() => ({
    mutationFn: (vars: { communityId: string; pollId: string; commentId: string }) =>
      pollsService.deleteComment(vars.communityId, vars.pollId, vars.commentId),
    onSuccess: (_data, vars) => {
      // Invalidate comments list
      void qc.invalidateQueries({
        queryKey: ['polls', 'comments', vars.communityId, vars.pollId],
      });
    },
  }));
};
