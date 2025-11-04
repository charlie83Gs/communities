import { createQuery, createMutation, useQueryClient } from '@tanstack/solid-query';
import type { Accessor } from 'solid-js';
import { pollsService } from '@/services/api/polls.service';
import type {
  Poll,
  PollDetail,
  CreatePollDto,
  PollStatus,
  PollCreatorType,
} from '@/types/poll.types';

/**
 * Queries and mutations for Polls feature
 * Location per architecture: /hooks/queries (data-fetching/query hooks)
 */

export const usePollsListQuery = (
  communityId: Accessor<string | undefined>,
  params?: { status?: Accessor<PollStatus | undefined>; creatorType?: Accessor<PollCreatorType | undefined> }
) => {
  return createQuery(() => ({
    queryKey: ['polls', 'community', communityId(), params?.status?.(), params?.creatorType?.()],
    queryFn: async () => {
      const cid = communityId();
      if (!cid) return { polls: [] };
      return pollsService.listPolls(cid, {
        status: params?.status?.(),
        creatorType: params?.creatorType?.(),
      });
    },
    enabled: !!communityId(),
  }));
};

export const usePollDetailQuery = (
  communityId: Accessor<string | undefined>,
  pollId: Accessor<string | undefined>
) => {
  return createQuery(() => ({
    queryKey: ['polls', 'detail', communityId(), pollId()],
    queryFn: () => pollsService.getPoll(communityId()!, pollId()!),
    enabled: !!communityId() && !!pollId(),
  }));
};

export const useCreatePollMutation = () => {
  const qc = useQueryClient();
  return createMutation(() => ({
    mutationFn: (vars: { communityId: string; dto: CreatePollDto }) =>
      pollsService.createPoll(vars.communityId, vars.dto),
    onSuccess: (_data, vars) => {
      // Invalidate polls list for the community
      void qc.invalidateQueries({
        queryKey: ['polls', 'community', vars.communityId],
        exact: false,
      });
    },
  }));
};

export const useVotePollMutation = () => {
  const qc = useQueryClient();
  return createMutation(() => ({
    mutationFn: (vars: { communityId: string; pollId: string; optionId: string }) =>
      pollsService.votePoll(vars.communityId, vars.pollId, vars.optionId),
    onSuccess: (_data, vars) => {
      // Invalidate poll detail to refresh results and user vote
      void qc.invalidateQueries({
        queryKey: ['polls', 'detail', vars.communityId, vars.pollId],
      });
    },
  }));
};

export const useClosePollMutation = () => {
  const qc = useQueryClient();
  return createMutation(() => ({
    mutationFn: (vars: { communityId: string; pollId: string }) =>
      pollsService.closePoll(vars.communityId, vars.pollId),
    onSuccess: (_data, vars) => {
      // Invalidate both detail and list
      void qc.invalidateQueries({
        queryKey: ['polls', 'detail', vars.communityId, vars.pollId],
      });
      void qc.invalidateQueries({
        queryKey: ['polls', 'community', vars.communityId],
        exact: false,
      });
    },
  }));
};
