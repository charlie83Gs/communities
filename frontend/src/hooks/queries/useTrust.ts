import { createQuery, createMutation, useQueryClient } from '@tanstack/solid-query';
import { Accessor } from 'solid-js';
import { trustService } from '@/services/api/trust.service';
import type {
  TrustAward,
  AdminTrustGrant,
  TrustHistoryEntry,
  DecayingEndorsement,
  TrustDecayStatus
} from '@/types/trust.types';

// Trust Award Queries
export const useMyTrustAwardsQuery = (
  communityId: Accessor<string | undefined>
) => {
  return createQuery(() => ({
    queryKey: ['trust', 'awards', 'my', communityId()],
    queryFn: () => trustService.getMyTrustAwards(communityId()!),
    enabled: !!communityId(),
  })) as ReturnType<typeof createQuery<TrustAward[], Error>>;
};

export const useAwardsToUserQuery = (
  communityId: Accessor<string | undefined>,
  userId: Accessor<string | undefined>
) => {
  return createQuery(() => ({
    queryKey: ['trust', 'awards', 'to-user', communityId(), userId()],
    queryFn: () => trustService.getAwardsToUser(communityId()!, userId()!),
    enabled: !!communityId() && !!userId(),
  })) as ReturnType<typeof createQuery<TrustAward[], Error>>;
};

export const useTrustHistoryQuery = (
  communityId: Accessor<string | undefined>,
  userId: Accessor<string | undefined>
) => {
  return createQuery(() => ({
    queryKey: ['trust', 'history', communityId(), userId()],
    queryFn: () => trustService.getTrustHistory(communityId()!, userId()!),
    enabled: !!communityId() && !!userId(),
  })) as ReturnType<typeof createQuery<TrustHistoryEntry[], Error>>;
};

// Trust Award Mutations
export const useAwardTrustMutation = () => {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationFn: ({ communityId, toUserId }: { communityId: string; toUserId: string }) =>
      trustService.awardTrust(communityId, toUserId),
    onSuccess: (_, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['trust', 'awards', 'my', variables.communityId] });
      queryClient.invalidateQueries({ queryKey: ['trust', 'awards', 'to-user', variables.communityId, variables.toUserId] });
      queryClient.invalidateQueries({ queryKey: ['trust', 'users', variables.communityId] });
      queryClient.invalidateQueries({ queryKey: ['trust', 'history', variables.communityId, variables.toUserId] });
    },
  }));
};

export const useRemoveTrustMutation = () => {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationFn: ({ communityId, toUserId }: { communityId: string; toUserId: string }) =>
      trustService.removeTrust(communityId, toUserId),
    onSuccess: (_, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['trust', 'awards', 'my', variables.communityId] });
      queryClient.invalidateQueries({ queryKey: ['trust', 'awards', 'to-user', variables.communityId, variables.toUserId] });
      queryClient.invalidateQueries({ queryKey: ['trust', 'users', variables.communityId] });
      queryClient.invalidateQueries({ queryKey: ['trust', 'history', variables.communityId, variables.toUserId] });
    },
  }));
};

// Admin Grant Queries
export const useAdminGrantsQuery = (
  communityId: Accessor<string | undefined>
) => {
  return createQuery(() => ({
    queryKey: ['trust', 'admin', 'grants', communityId()],
    queryFn: () => trustService.getAdminGrants(communityId()!),
    enabled: !!communityId(),
  })) as ReturnType<typeof createQuery<AdminTrustGrant[], Error>>;
};

// Admin Grant Mutations
export const useSetAdminGrantMutation = () => {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationFn: ({
      communityId,
      toUserId,
      amount,
    }: {
      communityId: string;
      toUserId: string;
      amount: number;
    }) => trustService.setAdminGrant(communityId, toUserId, amount),
    onSuccess: (_, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['trust', 'admin', 'grants', variables.communityId] });
      queryClient.invalidateQueries({ queryKey: ['trust', 'users', variables.communityId] });
      queryClient.invalidateQueries({ queryKey: ['trust', 'history', variables.communityId, variables.toUserId] });
    },
  }));
};

export const useDeleteAdminGrantMutation = () => {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationFn: ({ communityId, toUserId }: { communityId: string; toUserId: string }) =>
      trustService.deleteAdminGrant(communityId, toUserId),
    onSuccess: (_, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['trust', 'admin', 'grants', variables.communityId] });
      queryClient.invalidateQueries({ queryKey: ['trust', 'users', variables.communityId] });
      queryClient.invalidateQueries({ queryKey: ['trust', 'history', variables.communityId, variables.toUserId] });
    },
  }));
};

// Trust Decay Queries
export const useDecayingEndorsementsQuery = (
  communityId: Accessor<string | undefined>
) => {
  return createQuery(() => ({
    queryKey: ['trust', 'decaying', communityId()],
    queryFn: () => trustService.getDecayingEndorsements(communityId()!),
    enabled: !!communityId(),
  })) as ReturnType<typeof createQuery<DecayingEndorsement[], Error>>;
};

export const useTrustDecayStatusQuery = (
  communityId: Accessor<string | undefined>,
  toUserId: Accessor<string | undefined>
) => {
  return createQuery(() => ({
    queryKey: ['trust', 'decay-status', communityId(), toUserId()],
    queryFn: () => trustService.getTrustDecayStatus(communityId()!, toUserId()!),
    enabled: !!communityId() && !!toUserId(),
  })) as ReturnType<typeof createQuery<TrustDecayStatus | null, Error>>;
};

// Trust Decay Mutations
export const useRecertifyTrustMutation = () => {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationFn: ({ communityId, userIds }: { communityId: string; userIds: string[] }) =>
      trustService.recertifyTrust(communityId, userIds),
    onSuccess: (_, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['trust', 'decaying', variables.communityId] });
      queryClient.invalidateQueries({ queryKey: ['trust', 'awards', 'my', variables.communityId] });
      queryClient.invalidateQueries({ queryKey: ['trust', 'users', variables.communityId] });
      // Invalidate decay status for each user
      variables.userIds.forEach((userId) => {
        queryClient.invalidateQueries({ queryKey: ['trust', 'decay-status', variables.communityId, userId] });
      });
    },
  }));
};
