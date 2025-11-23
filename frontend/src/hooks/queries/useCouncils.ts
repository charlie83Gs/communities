import { createQuery, createMutation, useQueryClient } from '@tanstack/solid-query';
import type { Accessor } from 'solid-js';
import { councilsService } from '@/services/api/councils.service';
import type {
  Council,
  CouncilDetail,
  CreateCouncilDto,
  UpdateCouncilDto,
} from '@/types/council.types';

/**
 * Queries and mutations for Councils feature
 * Location per architecture: /hooks/queries (data-fetching/query hooks)
 */

export const useCouncilsListQuery = (
  communityId: Accessor<string | undefined>,
  params?: {
    page?: Accessor<number | undefined>;
    limit?: Accessor<number | undefined>;
    sortBy?: Accessor<'trustScore' | 'createdAt' | undefined>;
    order?: Accessor<'desc' | 'asc' | undefined>;
  }
) => {
  return createQuery(() => ({
    queryKey: [
      'councils',
      'community',
      communityId(),
      params?.page?.(),
      params?.limit?.(),
      params?.sortBy?.(),
      params?.order?.(),
    ],
    queryFn: async () => {
      const cid = communityId();
      if (!cid) return { councils: [], total: 0, page: 1, limit: 20 };
      return councilsService.listCouncils(cid, {
        page: params?.page?.(),
        limit: params?.limit?.(),
        sortBy: params?.sortBy?.(),
        order: params?.order?.(),
      });
    },
    enabled: !!communityId(),
    staleTime: 30000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  }));
};

export const useManagedCouncilsQuery = (
  communityId: Accessor<string | undefined>
) => {
  return createQuery(() => ({
    queryKey: ['councils', 'managed', communityId()],
    queryFn: async () => {
      const cid = communityId();
      if (!cid) return { councils: [], total: 0, page: 1, limit: 20 };
      return councilsService.getManagedCouncils(cid);
    },
    enabled: !!communityId(),
    staleTime: 30000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  }));
};

export const useCouncilDetailQuery = (
  communityId: Accessor<string | undefined>,
  councilId: Accessor<string | undefined>
) => {
  return createQuery(() => ({
    queryKey: ['councils', 'detail', communityId(), councilId()],
    queryFn: () => councilsService.getCouncil(communityId()!, councilId()!),
    enabled: !!communityId() && !!councilId(),
    staleTime: 30000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  }));
};

export const useCouncilTrustStatusQuery = (
  communityId: Accessor<string | undefined>,
  councilId: Accessor<string | undefined>
) => {
  return createQuery(() => ({
    queryKey: ['councils', 'trust-status', communityId(), councilId()],
    queryFn: () => councilsService.getTrustStatus(communityId()!, councilId()!),
    enabled: !!communityId() && !!councilId(),
    staleTime: 30000, // 30 seconds
  }));
};

export const useCreateCouncilMutation = () => {
  const qc = useQueryClient();
  return createMutation(() => ({
    mutationFn: (vars: { communityId: string; dto: CreateCouncilDto }) =>
      councilsService.createCouncil(vars.communityId, vars.dto),
    onSuccess: (_data, vars) => {
      // Invalidate councils list for the community
      void qc.invalidateQueries({
        queryKey: ['councils', 'community', vars.communityId],
        exact: false,
      });
    },
  }));
};

export const useUpdateCouncilMutation = () => {
  const qc = useQueryClient();
  return createMutation(() => ({
    mutationFn: (vars: { communityId: string; councilId: string; dto: UpdateCouncilDto }) =>
      councilsService.updateCouncil(vars.communityId, vars.councilId, vars.dto),
    onSuccess: (_data, vars) => {
      // Invalidate council detail and list
      void qc.invalidateQueries({
        queryKey: ['councils', 'detail', vars.communityId, vars.councilId],
      });
      void qc.invalidateQueries({
        queryKey: ['councils', 'community', vars.communityId],
        exact: false,
      });
    },
  }));
};

export const useDeleteCouncilMutation = () => {
  const qc = useQueryClient();
  return createMutation(() => ({
    mutationFn: (vars: { communityId: string; councilId: string }) =>
      councilsService.deleteCouncil(vars.communityId, vars.councilId),
    onSuccess: (_data, vars) => {
      // Invalidate councils list and remove detail from cache
      void qc.invalidateQueries({
        queryKey: ['councils', 'community', vars.communityId],
        exact: false,
      });
      void qc.removeQueries({
        queryKey: ['councils', 'detail', vars.communityId, vars.councilId],
      });
    },
  }));
};

export const useAwardCouncilTrustMutation = () => {
  const qc = useQueryClient();
  return createMutation(() => ({
    mutationFn: (vars: { communityId: string; councilId: string }) =>
      councilsService.awardTrust(vars.communityId, vars.councilId),
    onSuccess: (_data, vars) => {
      // Invalidate trust status, council detail, and councils list
      void qc.invalidateQueries({
        queryKey: ['councils', 'trust-status', vars.communityId, vars.councilId],
      });
      void qc.invalidateQueries({
        queryKey: ['councils', 'detail', vars.communityId, vars.councilId],
      });
      void qc.invalidateQueries({
        queryKey: ['councils', 'community', vars.communityId],
        exact: false,
      });
    },
  }));
};

export const useRemoveCouncilTrustMutation = () => {
  const qc = useQueryClient();
  return createMutation(() => ({
    mutationFn: (vars: { communityId: string; councilId: string }) =>
      councilsService.removeTrust(vars.communityId, vars.councilId),
    onSuccess: (_data, vars) => {
      // Invalidate trust status, council detail, and councils list
      void qc.invalidateQueries({
        queryKey: ['councils', 'trust-status', vars.communityId, vars.councilId],
      });
      void qc.invalidateQueries({
        queryKey: ['councils', 'detail', vars.communityId, vars.councilId],
      });
      void qc.invalidateQueries({
        queryKey: ['councils', 'community', vars.communityId],
        exact: false,
      });
    },
  }));
};

export const useAddCouncilManagerMutation = () => {
  const qc = useQueryClient();
  return createMutation(() => ({
    mutationFn: (vars: { communityId: string; councilId: string; userId: string }) =>
      councilsService.addManager(vars.communityId, vars.councilId, vars.userId),
    onSuccess: (_data, vars) => {
      // Invalidate council detail to refresh managers list
      void qc.invalidateQueries({
        queryKey: ['councils', 'detail', vars.communityId, vars.councilId],
      });
    },
  }));
};

export const useRemoveCouncilManagerMutation = () => {
  const qc = useQueryClient();
  return createMutation(() => ({
    mutationFn: (vars: { communityId: string; councilId: string; userId: string }) =>
      councilsService.removeManager(vars.communityId, vars.councilId, vars.userId),
    onSuccess: (_data, vars) => {
      // Invalidate council detail to refresh managers list
      void qc.invalidateQueries({
        queryKey: ['councils', 'detail', vars.communityId, vars.councilId],
      });
    },
  }));
};

export const useCouncilPoolsQuery = (
  communityId: Accessor<string | undefined>,
  councilId: Accessor<string | undefined>
) => {
  return createQuery(() => ({
    queryKey: ['councils', councilId(), 'pools'],
    queryFn: () => councilsService.getCouncilPools(communityId()!, councilId()!),
    enabled: !!communityId() && !!councilId(),
    staleTime: 30000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  }));
};
