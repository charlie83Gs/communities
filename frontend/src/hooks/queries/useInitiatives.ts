import { createQuery, createMutation, useQueryClient } from '@tanstack/solid-query';
import type { Accessor } from 'solid-js';
import { initiativesService } from '@/services/api/initiatives.service';
import type {
  Initiative,
  InitiativeReport,
  CreateInitiativeDto,
  CreateInitiativeReportDto,
  VoteInitiativeDto,
  CreateCommentDto,
} from '@/types/initiative.types';

/**
 * Queries and mutations for Initiatives feature
 * Location per architecture: /hooks/queries (data-fetching/query hooks)
 */

export const useCouncilInitiativesQuery = (
  communityId: Accessor<string | undefined>,
  councilId: Accessor<string | undefined>,
  params?: {
    page?: Accessor<number | undefined>;
    limit?: Accessor<number | undefined>;
    status?: Accessor<'active' | 'completed' | 'cancelled' | undefined>;
  }
) => {
  return createQuery(() => ({
    queryKey: [
      'councils',
      councilId(),
      'initiatives',
      params?.page?.(),
      params?.limit?.(),
      params?.status?.(),
    ],
    queryFn: async () => {
      const cid = communityId();
      const cnid = councilId();
      if (!cid || !cnid) return { initiatives: [], total: 0, page: 1, limit: 20 };
      return initiativesService.listInitiatives(cid, cnid, {
        page: params?.page?.(),
        limit: params?.limit?.(),
        status: params?.status?.(),
      });
    },
    enabled: !!communityId() && !!councilId(),
    staleTime: 30000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  }));
};

export const useInitiativeDetailQuery = (
  communityId: Accessor<string | undefined>,
  councilId: Accessor<string | undefined>,
  initiativeId: Accessor<string | undefined>
) => {
  return createQuery(() => ({
    queryKey: ['initiatives', 'detail', communityId(), councilId(), initiativeId()],
    queryFn: () => initiativesService.getInitiative(communityId()!, councilId()!, initiativeId()!),
    enabled: !!communityId() && !!councilId() && !!initiativeId(),
    staleTime: 30000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  }));
};

export const useInitiativeReportsQuery = (
  communityId: Accessor<string | undefined>,
  councilId: Accessor<string | undefined>,
  initiativeId: Accessor<string | undefined>,
  params?: {
    page?: Accessor<number | undefined>;
    limit?: Accessor<number | undefined>;
  }
) => {
  return createQuery(() => ({
    queryKey: [
      'initiatives',
      councilId(),
      initiativeId(),
      'reports',
      params?.page?.(),
      params?.limit?.(),
    ],
    queryFn: () =>
      initiativesService.listReports(communityId()!, councilId()!, initiativeId()!, {
        page: params?.page?.(),
        limit: params?.limit?.(),
      }),
    enabled: !!communityId() && !!councilId() && !!initiativeId(),
    staleTime: 30000, // 30 seconds
  }));
};

export const useInitiativeCommentsQuery = (
  communityId: Accessor<string | undefined>,
  councilId: Accessor<string | undefined>,
  initiativeId: Accessor<string | undefined>
) => {
  return createQuery(() => ({
    queryKey: ['initiatives', councilId(), initiativeId(), 'comments'],
    queryFn: () => initiativesService.listInitiativeComments(communityId()!, councilId()!, initiativeId()!),
    enabled: !!communityId() && !!councilId() && !!initiativeId(),
    staleTime: 30000, // 30 seconds
  }));
};

export const useReportCommentsQuery = (
  communityId: Accessor<string | undefined>,
  councilId: Accessor<string | undefined>,
  initiativeId: Accessor<string | undefined>,
  reportId: Accessor<string | undefined>
) => {
  return createQuery(() => ({
    queryKey: ['reports', councilId(), initiativeId(), reportId(), 'comments'],
    queryFn: () => initiativesService.listReportComments(communityId()!, councilId()!, initiativeId()!, reportId()!),
    enabled: !!communityId() && !!councilId() && !!initiativeId() && !!reportId(),
    staleTime: 30000, // 30 seconds
  }));
};

export const useCreateInitiativeMutation = () => {
  const qc = useQueryClient();
  return createMutation(() => ({
    mutationFn: (vars: { communityId: string; councilId: string; dto: CreateInitiativeDto }) =>
      initiativesService.createInitiative(vars.communityId, vars.councilId, vars.dto),
    onSuccess: (_data, vars) => {
      // Invalidate initiatives list for the council
      void qc.invalidateQueries({
        queryKey: ['councils', vars.councilId, 'initiatives'],
        exact: false,
      });
    },
  }));
};

export const useUpdateInitiativeMutation = () => {
  const qc = useQueryClient();
  return createMutation(() => ({
    mutationFn: (vars: {
      communityId: string;
      councilId: string;
      initiativeId: string;
      dto: Partial<CreateInitiativeDto> & { status?: 'active' | 'completed' | 'cancelled' };
    }) => initiativesService.updateInitiative(vars.communityId, vars.councilId, vars.initiativeId, vars.dto),
    onSuccess: (_data, vars) => {
      // Invalidate initiative detail
      void qc.invalidateQueries({
        queryKey: ['initiatives', 'detail', vars.communityId, vars.councilId, vars.initiativeId],
      });
      // Invalidate all initiatives lists
      void qc.invalidateQueries({
        queryKey: ['councils'],
        exact: false,
      });
    },
  }));
};

export const useDeleteInitiativeMutation = () => {
  const qc = useQueryClient();
  return createMutation(() => ({
    mutationFn: (vars: { communityId: string; councilId: string; initiativeId: string }) =>
      initiativesService.deleteInitiative(vars.communityId, vars.councilId, vars.initiativeId),
    onSuccess: (_data, vars) => {
      // Invalidate initiatives lists
      void qc.invalidateQueries({
        queryKey: ['councils', vars.councilId, 'initiatives'],
        exact: false,
      });
      // Remove initiative detail from cache
      void qc.removeQueries({
        queryKey: ['initiatives', 'detail', vars.communityId, vars.councilId, vars.initiativeId],
      });
    },
  }));
};

export const useVoteInitiativeMutation = () => {
  const qc = useQueryClient();
  return createMutation(() => ({
    mutationFn: (vars: { communityId: string; councilId: string; initiativeId: string; dto: VoteInitiativeDto }) =>
      initiativesService.voteInitiative(vars.communityId, vars.councilId, vars.initiativeId, vars.dto),
    onSuccess: (_data, vars) => {
      // Invalidate initiative detail to refresh vote counts
      void qc.invalidateQueries({
        queryKey: ['initiatives', 'detail', vars.communityId, vars.councilId, vars.initiativeId],
      });
      // Invalidate initiatives lists to update vote counts in lists
      void qc.invalidateQueries({
        queryKey: ['councils'],
        exact: false,
      });
    },
  }));
};

export const useRemoveVoteMutation = () => {
  const qc = useQueryClient();
  return createMutation(() => ({
    mutationFn: (vars: { communityId: string; councilId: string; initiativeId: string }) =>
      initiativesService.removeVote(vars.communityId, vars.councilId, vars.initiativeId),
    onSuccess: (_data, vars) => {
      // Invalidate initiative detail to refresh vote counts
      void qc.invalidateQueries({
        queryKey: ['initiatives', 'detail', vars.communityId, vars.councilId, vars.initiativeId],
      });
      // Invalidate initiatives lists to update vote counts in lists
      void qc.invalidateQueries({
        queryKey: ['councils'],
        exact: false,
      });
    },
  }));
};

export const useCreateReportMutation = () => {
  const qc = useQueryClient();
  return createMutation(() => ({
    mutationFn: (vars: {
      communityId: string;
      councilId: string;
      initiativeId: string;
      dto: CreateInitiativeReportDto;
    }) => initiativesService.createReport(vars.communityId, vars.councilId, vars.initiativeId, vars.dto),
    onSuccess: (_data, vars) => {
      // Invalidate reports list for the initiative
      void qc.invalidateQueries({
        queryKey: ['initiatives', vars.councilId, vars.initiativeId, 'reports'],
        exact: false,
      });
    },
  }));
};

export const useCreateInitiativeCommentMutation = () => {
  const qc = useQueryClient();
  return createMutation(() => ({
    mutationFn: (vars: { communityId: string; councilId: string; initiativeId: string; dto: CreateCommentDto }) =>
      initiativesService.createInitiativeComment(vars.communityId, vars.councilId, vars.initiativeId, vars.dto),
    onSuccess: (_data, vars) => {
      // Invalidate comments list for the initiative
      void qc.invalidateQueries({
        queryKey: ['initiatives', vars.councilId, vars.initiativeId, 'comments'],
      });
    },
  }));
};

export const useCreateReportCommentMutation = () => {
  const qc = useQueryClient();
  return createMutation(() => ({
    mutationFn: (vars: { communityId: string; councilId: string; initiativeId: string; reportId: string; dto: CreateCommentDto }) =>
      initiativesService.createReportComment(vars.communityId, vars.councilId, vars.initiativeId, vars.reportId, vars.dto),
    onSuccess: (_data, vars) => {
      // Invalidate comments list for the report
      void qc.invalidateQueries({
        queryKey: ['reports', vars.councilId, vars.initiativeId, vars.reportId, 'comments'],
      });
    },
  }));
};
