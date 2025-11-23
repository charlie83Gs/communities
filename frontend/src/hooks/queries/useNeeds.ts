import { createQuery, createMutation, useQueryClient } from '@tanstack/solid-query';
import type { Accessor } from 'solid-js';
import { needsService } from '@/services/api/needs.service';
import type {
  Need,
  NeedStatus,
  NeedPriority,
  CreateNeedDto,
  UpdateNeedDto,
} from '@/types/needs.types';

/**
 * Queries and mutations for Needs feature
 * Location per architecture: /hooks/queries (data-fetching/query hooks)
 */

// ========================================
// MEMBER NEEDS QUERIES
// ========================================

export const useCommunityNeedsQuery = (
  communityId: Accessor<string | undefined>,
  filters?: {
    status?: Accessor<NeedStatus | undefined>;
    priority?: Accessor<NeedPriority | undefined>;
    isRecurring?: Accessor<boolean | undefined>;
  }
) => {
  return createQuery(() => ({
    queryKey: [
      'needs',
      'community',
      communityId(),
      filters?.status?.(),
      filters?.priority?.(),
      filters?.isRecurring?.(),
    ],
    queryFn: async () => {
      const cid = communityId();
      if (!cid) return [] as Need[];
      return needsService.listNeeds({
        communityId: cid,
        status: filters?.status?.(),
        priority: filters?.priority?.(),
        isRecurring: filters?.isRecurring?.(),
      });
    },
    enabled: !!communityId(),
  }));
};

export const useNeedQuery = (needId: Accessor<string | undefined>) => {
  return createQuery(() => ({
    queryKey: ['needs', 'detail', needId()],
    queryFn: () => needsService.getNeed(needId()!),
    enabled: !!needId(),
  }));
};

export const useAggregatedNeedsQuery = (communityId: Accessor<string | undefined>) => {
  return createQuery(() => ({
    queryKey: ['needs', 'aggregated', communityId()],
    queryFn: () => needsService.getAggregatedNeeds(communityId()!),
    enabled: !!communityId(),
  }));
};

// ========================================
// MEMBER NEEDS MUTATIONS
// ========================================

export const useCreateNeedMutation = () => {
  const qc = useQueryClient();
  return createMutation(() => ({
    mutationFn: (dto: CreateNeedDto) => needsService.createNeed(dto),
    onSuccess: (created) => {
      // Invalidate all related queries
      void qc.invalidateQueries({ queryKey: ['needs', 'community', created.communityId] });
      void qc.invalidateQueries({ queryKey: ['needs', 'aggregated', created.communityId] });
    },
  }));
};

export const useUpdateNeedMutation = () => {
  const qc = useQueryClient();
  return createMutation(() => ({
    mutationFn: (args: { id: string; dto: UpdateNeedDto }) =>
      needsService.updateNeed(args.id, args.dto),
    onSuccess: (updated) => {
      void qc.invalidateQueries({ queryKey: ['needs', 'detail', updated.id] });
      void qc.invalidateQueries({ queryKey: ['needs', 'community', updated.communityId] });
      void qc.invalidateQueries({ queryKey: ['needs', 'aggregated', updated.communityId] });
    },
  }));
};

export const useDeleteNeedMutation = () => {
  const qc = useQueryClient();
  return createMutation(() => ({
    mutationFn: (args: { id: string; communityId: string }) => needsService.deleteNeed(args.id),
    onSuccess: (_result, vars) => {
      void qc.invalidateQueries({ queryKey: ['needs', 'community', vars.communityId] });
      void qc.invalidateQueries({ queryKey: ['needs', 'aggregated', vars.communityId] });
      void qc.removeQueries({ queryKey: ['needs', 'detail', vars.id] });
    },
  }));
};
