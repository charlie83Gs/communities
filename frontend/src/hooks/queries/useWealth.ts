import { createQuery, createMutation, useQueryClient } from '@tanstack/solid-query';
import type { Accessor } from 'solid-js';
import { wealthService } from '@/services/api/wealth.service';
import type {
  Wealth,
  WealthListItem,
  WealthStatus,
  CreateWealthDto,
  UpdateWealthDto,
  WealthRequest,
  WealthRequestStatus,
  CreateWealthRequestDto,
  PoolDistributionRequest,
  WealthRequestMessage,
} from '@/types/wealth.types';

/**
 - Queries and mutations for Wealth feature
 - Location per architecture: /hooks/queries (data-fetching/query hooks)
*/

export const useCommunityWealthQuery = (communityId: Accessor<string | undefined>, status?: Accessor<WealthStatus | undefined>) => {
  return createQuery(() => ({
    queryKey: ['wealth', 'community', communityId(), status?.()],
    queryFn: async () => {
      const cid = communityId();
      if (!cid) return [] as WealthListItem[];
      return wealthService.listWealth({ communityId: cid, status: status?.() });
    },
    enabled: !!communityId(),
  }));
};

export const useWealthQuery = (wealthId: Accessor<string | undefined>) => {
  return createQuery(() => ({
    queryKey: ['wealth', 'detail', wealthId()],
    queryFn: () => wealthService.getWealth(wealthId()!),
    enabled: !!wealthId(),
  }));
};

export const useCreateWealthMutation = () => {
  const qc = useQueryClient();
  return createMutation(() => ({
    mutationFn: (dto: CreateWealthDto) => wealthService.createWealth(dto),
    // Optimistically add the wealth to the community list
    onMutate: async (dto) => {
      const listKey = ['wealth', 'community', dto.communityId];
      await qc.cancelQueries({ queryKey: listKey });

      const previous = qc.getQueryData<WealthListItem[]>(listKey) || [];

      const optimisticWealth: Wealth = {
        id: `optimistic-${Date.now()}`,
        communityId: dto.communityId,
        createdBy: 'optimistic',
        title: dto.title,
        description: dto.description,
        durationType: dto.durationType,
        endDate: dto.endDate,
        distributionType: dto.distributionType ?? 'unit_based',
        unitsAvailable: dto.unitsAvailable ?? null,
        maxUnitsPerUser: dto.maxUnitsPerUser ?? null,
        automationEnabled: dto.automationEnabled ?? false,
        status: 'active',
        itemId: dto.itemId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      qc.setQueryData<WealthListItem[]>(listKey, [optimisticWealth as WealthListItem, ...previous]);

      return { listKey, previous };
    },
    onError: (_err, _dto, ctx) => {
      if (ctx?.listKey) {
        qc.setQueryData(ctx.listKey, ctx.previous);
      }
    },
    onSuccess: (created, dto, ctx) => {
      // Replace optimistic entry by invalidating the list
      qc.invalidateQueries({ queryKey: ['wealth', 'community', created.communityId] });
    },
  }));
};

export const useUpdateWealthMutation = () => {
  const qc = useQueryClient();
  return createMutation(() => ({
    mutationFn: (args: { id: string; dto: UpdateWealthDto }) => wealthService.updateWealth(args.id, args.dto),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: ['wealth', 'detail', updated.id] });
      qc.invalidateQueries({ queryKey: ['wealth', 'community', updated.communityId] });
    },
  }));
};

export const useWealthActionMutations = () => {
  const qc = useQueryClient();

  const cancelWealth = createMutation(() => ({
    mutationFn: (id: string) => wealthService.cancelWealth(id),
    onMutate: async (id: string) => {
      const detailKey = ['wealth', 'detail', id];
      await qc.cancelQueries({ queryKey: detailKey });
      const previous = qc.getQueryData<Wealth>(detailKey);
      if (previous) {
        qc.setQueryData<Wealth>(detailKey, { ...previous, status: 'cancelled' });
      }
      return { detailKey, previous };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.detailKey) {
        qc.setQueryData(ctx.detailKey, ctx.previous);
      }
    },
    onSuccess: (updated) => {
      // Ensure lists are refreshed
      qc.invalidateQueries({ queryKey: ['wealth', 'community', updated.communityId] });
    },
  }));

  const fulfillWealth = createMutation(() => ({
    mutationFn: (id: string) => wealthService.fulfillWealth(id),
    onMutate: async (id: string) => {
      const detailKey = ['wealth', 'detail', id];
      await qc.cancelQueries({ queryKey: detailKey });
      const previous = qc.getQueryData<Wealth>(detailKey);
      if (previous) {
        qc.setQueryData<Wealth>(detailKey, { ...previous, status: 'fulfilled' });
      }
      return { detailKey, previous };
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.detailKey) {
        qc.setQueryData(ctx.detailKey, ctx.previous);
      }
    },
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: ['wealth', 'community', updated.communityId] });
    },
  }));

  return { cancelWealth, fulfillWealth };
};

export const useWealthRequestsQuery = (wealthId: Accessor<string | undefined>) => {
  return createQuery(() => ({
    queryKey: ['wealth', 'requests', wealthId()],
    queryFn: () => wealthService.getWealthRequests(wealthId()!),
    enabled: !!wealthId(),
  }));
};

export const useWealthRequestMutation = () => {
  const qc = useQueryClient();
  return createMutation(() => ({
    mutationFn: (args: { wealthId: string; dto: CreateWealthRequestDto }) => wealthService.requestWealth(args.wealthId, args.dto),
    onSuccess: (req) => {
      // Refresh requests for this wealth and the wealth detail
      qc.invalidateQueries({ queryKey: ['wealth', 'requests', req.wealthId] });
      qc.invalidateQueries({ queryKey: ['wealth', 'detail', req.wealthId] });
    },
  }));
};

export const useManageRequestMutations = () => {
  const qc = useQueryClient();

  const accept = createMutation(() => ({
    mutationFn: (args: { wealthId: string; requestId: string }) => wealthService.acceptRequest(args.wealthId, args.requestId),
    onMutate: async ({ wealthId, requestId }) => {
      const key = ['wealth', 'requests', wealthId];
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<WealthRequest[]>(key) || [];
      const updated = previous.map((r) => (r.id === requestId ? { ...r, status: 'accepted' as const } : r));
      qc.setQueryData<WealthRequest[]>(key, updated);
      return { key, previous };
    },
    onError: (_e, _vars, ctx) => {
      if (ctx?.key) qc.setQueryData(ctx.key, ctx.previous);
    },
    onSuccess: (req) => {
      qc.invalidateQueries({ queryKey: ['wealth', 'detail', req.wealthId] });
    },
  }));

  const reject = createMutation(() => ({
    mutationFn: (args: { wealthId: string; requestId: string }) => wealthService.rejectRequest(args.wealthId, args.requestId),
    onMutate: async ({ wealthId, requestId }) => {
      const key = ['wealth', 'requests', wealthId];
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<WealthRequest[]>(key) || [];
      const updated = previous.map((r) => (r.id === requestId ? { ...r, status: 'rejected' as const } : r));
      qc.setQueryData<WealthRequest[]>(key, updated);
      return { key, previous };
    },
    onError: (_e, _vars, ctx) => {
      if (ctx?.key) qc.setQueryData(ctx.key, ctx.previous);
    },
    onSuccess: (req) => {
      qc.invalidateQueries({ queryKey: ['wealth', 'detail', req.wealthId] });
    },
  }));

  const cancel = createMutation(() => ({
    mutationFn: (args: { wealthId: string; requestId: string }) => wealthService.cancelRequest(args.wealthId, args.requestId),
    onMutate: async ({ wealthId, requestId }) => {
      const key = ['wealth', 'requests', wealthId];
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<WealthRequest[]>(key) || [];
      const updated = previous.map((r) => (r.id === requestId ? { ...r, status: 'cancelled' as const } : r));
      qc.setQueryData<WealthRequest[]>(key, updated);
      return { key, previous };
    },
    onError: (_e, _vars, ctx) => {
      if (ctx?.key) qc.setQueryData(ctx.key, ctx.previous);
    },
    onSuccess: (req) => {
      qc.invalidateQueries({ queryKey: ['wealth', 'detail', req.wealthId] });
    },
  }));

  const confirm = createMutation(() => ({
    mutationFn: (args: { wealthId: string; requestId: string }) => wealthService.confirmRequest(args.wealthId, args.requestId),
    onMutate: async ({ wealthId, requestId }) => {
      const key = ['wealth', 'requests', wealthId];
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<WealthRequest[]>(key) || [];
      const updated = previous.map((r) => (r.id === requestId ? { ...r, status: 'fulfilled' as const } : r));
      qc.setQueryData<WealthRequest[]>(key, updated);
      return { key, previous };
    },
    onError: (_e, _vars, ctx) => {
      if (ctx?.key) qc.setQueryData(ctx.key, ctx.previous);
    },
    onSuccess: (req) => {
      qc.invalidateQueries({ queryKey: ['wealth', 'detail', req.wealthId] });
      qc.invalidateQueries({ queryKey: ['wealth', 'requests', 'me'] });
      qc.invalidateQueries({ queryKey: ['wealth', 'requests', 'incoming'] });
    },
  }));

  const fail = createMutation(() => ({
    mutationFn: (args: { wealthId: string; requestId: string }) => wealthService.failRequest(args.wealthId, args.requestId),
    onMutate: async ({ wealthId, requestId }) => {
      const key = ['wealth', 'requests', wealthId];
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<WealthRequest[]>(key) || [];
      const updated = previous.map((r) => (r.id === requestId ? { ...r, status: 'failed' as const } : r));
      qc.setQueryData<WealthRequest[]>(key, updated);
      return { key, previous };
    },
    onError: (_e, _vars, ctx) => {
      if (ctx?.key) qc.setQueryData(ctx.key, ctx.previous);
    },
    onSuccess: (req) => {
      qc.invalidateQueries({ queryKey: ['wealth', 'detail', req.wealthId] });
      qc.invalidateQueries({ queryKey: ['wealth', 'requests', 'me'] });
      qc.invalidateQueries({ queryKey: ['wealth', 'requests', 'incoming'] });
    },
  }));

  return { accept, reject, cancel, confirm, fail };
};

export const useUserRequestsQuery = (statuses?: Accessor<WealthRequestStatus | WealthRequestStatus[] | undefined>) => {
  return createQuery(() => ({
    queryKey: ['wealth', 'requests', 'me', statuses?.()],
    queryFn: () => wealthService.getUserRequests(statuses?.()),
  }));
};

export const useIncomingRequestsQuery = (statuses?: Accessor<WealthRequestStatus | WealthRequestStatus[] | undefined>) => {
  return createQuery(() => ({
    queryKey: ['wealth', 'requests', 'incoming', statuses?.()],
    queryFn: () => wealthService.getIncomingRequests(statuses?.()),
  }));
};

export const usePoolDistributionRequestsQuery = (statuses?: Accessor<WealthRequestStatus | WealthRequestStatus[] | undefined>) => {
  return createQuery(() => ({
    queryKey: ['wealth', 'requests', 'pool-distributions', statuses?.()],
    queryFn: () => wealthService.getPoolDistributionRequests(statuses?.()),
  }));
};

// Request Messages

export const useRequestMessagesQuery = (
  wealthId: Accessor<string | undefined>,
  requestId: Accessor<string | undefined>
) => {
  return createQuery(() => ({
    queryKey: ['wealth', 'messages', wealthId(), requestId()],
    queryFn: async () => {
      const wId = wealthId();
      const rId = requestId();
      if (!wId || !rId) return { messages: [] as WealthRequestMessage[] };
      return wealthService.getRequestMessages(wId, rId);
    },
    enabled: !!wealthId() && !!requestId(),
  }));
};

export const useSendRequestMessageMutation = () => {
  const qc = useQueryClient();
  return createMutation(() => ({
    mutationFn: (args: { wealthId: string; requestId: string; content: string }) =>
      wealthService.createRequestMessage(args.wealthId, args.requestId, args.content),
    onSuccess: (message, vars) => {
      // Invalidate messages for this request
      qc.invalidateQueries({ queryKey: ['wealth', 'messages', vars.wealthId, vars.requestId] });
      // Also invalidate notifications as there might be new unread counts
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  }));
};
