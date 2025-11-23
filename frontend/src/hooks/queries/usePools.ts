import {
  createQuery,
  createMutation,
  useQueryClient,
} from '@tanstack/solid-query';
import { Accessor } from 'solid-js';
import { poolsService } from '@/services/api/pools.service';
import type {
  Pool,
  CreatePoolRequest,
  UpdatePoolRequest,
  ContributeToPoolRequest,
  ManualDistributeRequest,
  MassDistributeRequest,
  MassDistributePreviewResponse,
  PoolInventoryItem,
  PendingContribution,
  PoolDistribution,
  PoolNeedsResponse,
} from '@/types/pools.types';
import type { Wealth } from '@/types/wealth.types';

/**
 * Query: List all pools in a community
 */
export const usePools = (
  communityId: Accessor<string | undefined>,
  filters?: Accessor<{ councilId?: string; itemId?: string } | undefined>
) => {
  return createQuery(() => ({
    queryKey: ['communities', communityId(), 'pools', filters?.()],
    queryFn: () => poolsService.listPools(communityId()!, filters?.()),
    enabled: !!communityId(),
    staleTime: 30_000,
    gcTime: 5 * 60 * 1000,
  }));
};

/**
 * Query: Get single pool details
 */
export const usePool = (
  communityId: Accessor<string | undefined>,
  poolId: Accessor<string | undefined>
) => {
  return createQuery(() => ({
    queryKey: ['communities', communityId(), 'pools', poolId()],
    queryFn: () => poolsService.getPool(communityId()!, poolId()!),
    enabled: !!communityId() && !!poolId(),
    staleTime: 30_000,
    gcTime: 5 * 60 * 1000,
  }));
};

/**
 * Query: Get pool inventory
 */
export const usePoolInventory = (
  communityId: Accessor<string | undefined>,
  poolId: Accessor<string | undefined>
) => {
  return createQuery(() => ({
    queryKey: ['communities', communityId(), 'pools', poolId(), 'inventory'],
    queryFn: () => poolsService.getInventory(communityId()!, poolId()!),
    enabled: !!communityId() && !!poolId(),
    staleTime: 30_000,
    gcTime: 5 * 60 * 1000,
  }));
};

/**
 * Query: List pending contributions to pool
 */
export const usePendingContributions = (
  communityId: Accessor<string | undefined>,
  poolId: Accessor<string | undefined>
) => {
  return createQuery(() => ({
    queryKey: ['communities', communityId(), 'pools', poolId(), 'contributions', 'pending'],
    queryFn: () => poolsService.listPendingContributions(communityId()!, poolId()!),
    enabled: !!communityId() && !!poolId(),
    staleTime: 30_000,
    gcTime: 5 * 60 * 1000,
  }));
};

/**
 * Query: List distributions from pool
 */
export const usePoolDistributions = (
  communityId: Accessor<string | undefined>,
  poolId: Accessor<string | undefined>,
  params?: Accessor<{ limit?: number; offset?: number } | undefined>
) => {
  return createQuery(() => ({
    queryKey: ['communities', communityId(), 'pools', poolId(), 'distributions', params?.()],
    queryFn: () => poolsService.listDistributions(communityId()!, poolId()!, params?.()),
    enabled: !!communityId() && !!poolId(),
    staleTime: 30_000,
    gcTime: 5 * 60 * 1000,
  }));
};

/**
 * Query: Preview needs for mass distribution
 */
export const useNeedsPreview = (
  communityId: Accessor<string | undefined>,
  poolId: Accessor<string | undefined>,
  params: Accessor<{
    itemId: string;
    fulfillmentStrategy: 'full' | 'partial' | 'equal';
    maxUnitsPerUser?: number;
    selectedUserIds?: string[];
  } | undefined>
) => {
  return createQuery(() => ({
    queryKey: ['communities', communityId(), 'pools', poolId(), 'needs-preview', params()],
    queryFn: () => poolsService.previewNeeds(communityId()!, poolId()!, params()!),
    enabled: !!communityId() && !!poolId() && !!params()?.itemId,
    staleTime: 30_000,
    gcTime: 5 * 60 * 1000,
  }));
};

/**
 * Query: Get pool needs breakdown (for council members)
 */
export const usePoolNeeds = (
  communityId: Accessor<string | undefined>,
  poolId: Accessor<string | undefined>
) => {
  return createQuery(() => ({
    queryKey: ['communities', communityId(), 'pools', poolId(), 'needs'],
    queryFn: () => poolsService.getPoolNeeds(communityId()!, poolId()!),
    enabled: !!communityId() && !!poolId(),
    staleTime: 30_000,
    gcTime: 5 * 60 * 1000,
  }));
};

/**
 * Mutation: Create a new pool
 */
export const useCreatePool = () => {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationFn: ({ communityId, councilId, dto }: { communityId: string; councilId: string; dto: CreatePoolRequest }) =>
      poolsService.createPool(communityId, councilId, dto),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ['communities', variables.communityId, 'pools'],
        exact: false,
      });
    },
  }));
};

/**
 * Mutation: Update pool settings
 */
export const useUpdatePool = () => {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationFn: ({ communityId, poolId, dto }: { communityId: string; poolId: string; dto: UpdatePoolRequest }) =>
      poolsService.updatePool(communityId, poolId, dto),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ['communities', variables.communityId, 'pools', variables.poolId],
      });
      void queryClient.invalidateQueries({
        queryKey: ['communities', variables.communityId, 'pools'],
        exact: false,
      });
    },
  }));
};

/**
 * Mutation: Delete a pool
 */
export const useDeletePool = () => {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationFn: ({ communityId, poolId }: { communityId: string; poolId: string }) =>
      poolsService.deletePool(communityId, poolId),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ['communities', variables.communityId, 'pools'],
        exact: false,
      });
      void queryClient.removeQueries({
        queryKey: ['communities', variables.communityId, 'pools', variables.poolId],
      });
    },
  }));
};

/**
 * Mutation: Contribute to pool (creates wealth share)
 */
export const useContributeToPool = () => {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationFn: ({ communityId, poolId, dto }: { communityId: string; poolId: string; dto: ContributeToPoolRequest }) =>
      poolsService.contributeToPool(communityId, poolId, dto),
    onSuccess: (_data, variables) => {
      // Invalidate pending contributions
      void queryClient.invalidateQueries({
        queryKey: ['communities', variables.communityId, 'pools', variables.poolId, 'contributions'],
        exact: false,
      });
      // Invalidate wealth queries (since this creates a wealth share)
      void queryClient.invalidateQueries({
        queryKey: ['wealth'],
        exact: false,
      });
    },
  }));
};

/**
 * Mutation: Confirm contribution
 */
export const useConfirmContribution = () => {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationFn: ({ communityId, poolId, wealthId }: { communityId: string; poolId: string; wealthId: string }) =>
      poolsService.confirmContribution(communityId, poolId, wealthId),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ['communities', variables.communityId, 'pools', variables.poolId, 'contributions'],
        exact: false,
      });
      void queryClient.invalidateQueries({
        queryKey: ['communities', variables.communityId, 'pools', variables.poolId, 'inventory'],
      });
      void queryClient.invalidateQueries({
        queryKey: ['communities', variables.communityId, 'pools', variables.poolId],
      });
      void queryClient.invalidateQueries({
        queryKey: ['wealth'],
        exact: false,
      });
    },
  }));
};

/**
 * Mutation: Reject contribution
 */
export const useRejectContribution = () => {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationFn: ({ communityId, poolId, wealthId }: { communityId: string; poolId: string; wealthId: string }) =>
      poolsService.rejectContribution(communityId, poolId, wealthId),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ['communities', variables.communityId, 'pools', variables.poolId, 'contributions'],
        exact: false,
      });
      void queryClient.invalidateQueries({
        queryKey: ['wealth'],
        exact: false,
      });
    },
  }));
};

/**
 * Mutation: Manual distribution from pool
 */
export const useManualDistribute = () => {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationFn: ({ communityId, poolId, dto }: { communityId: string; poolId: string; dto: ManualDistributeRequest }) =>
      poolsService.distributeManually(communityId, poolId, dto),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ['communities', variables.communityId, 'pools', variables.poolId, 'distributions'],
        exact: false,
      });
      void queryClient.invalidateQueries({
        queryKey: ['communities', variables.communityId, 'pools', variables.poolId, 'inventory'],
      });
      void queryClient.invalidateQueries({
        queryKey: ['communities', variables.communityId, 'pools', variables.poolId],
      });
      void queryClient.invalidateQueries({
        queryKey: ['wealth'],
        exact: false,
      });
    },
  }));
};

/**
 * Mutation: Mass distribution from pool
 */
export const useMassDistribute = () => {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationFn: ({ communityId, poolId, dto }: { communityId: string; poolId: string; dto: MassDistributeRequest }) =>
      poolsService.distributeMass(communityId, poolId, dto),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ['communities', variables.communityId, 'pools', variables.poolId, 'distributions'],
        exact: false,
      });
      void queryClient.invalidateQueries({
        queryKey: ['communities', variables.communityId, 'pools', variables.poolId, 'inventory'],
      });
      void queryClient.invalidateQueries({
        queryKey: ['communities', variables.communityId, 'pools', variables.poolId],
      });
      void queryClient.invalidateQueries({
        queryKey: ['wealth'],
        exact: false,
      });
    },
  }));
};
