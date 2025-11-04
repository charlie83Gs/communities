import { createQuery, createMutation, useQueryClient } from '@tanstack/solid-query';
import type { Accessor } from 'solid-js';
import { wealthService } from '@/services/api/wealth.service';
import type {
  WealthComment,
  CreateWealthCommentDto,
  UpdateWealthCommentDto,
} from '@/types/wealth.types';

/**
 - Comments Query Hooks for Wealth
 - Location per architecture: /hooks/queries
 - Query keys:
   - ['wealth', 'comments', wealthId]
 */

export const useWealthCommentsQuery = (
  wealthId: Accessor<string | undefined>,
  params?: Accessor<{ limit?: number; offset?: number } | undefined>
) => {
  return createQuery(() => ({
    queryKey: ['wealth', 'comments', wealthId(), params?.()?.limit, params?.()?.offset],
    queryFn: () => wealthService.getComments(wealthId()!, params?.()),
    enabled: !!wealthId(),
  }));
};

export const useCreateWealthCommentMutation = () => {
  const qc = useQueryClient();
  return createMutation(() => ({
    mutationFn: (args: { wealthId: string; dto: CreateWealthCommentDto }) =>
      wealthService.createComment(args.wealthId, args.dto),
    onSuccess: (created) => {
      // Invalidate comment list for this wealth
      qc.invalidateQueries({ queryKey: ['wealth', 'comments', created.wealthId] });
    },
  }));
};

export const useUpdateWealthCommentMutation = () => {
  const qc = useQueryClient();
  return createMutation(() => ({
    mutationFn: (args: { wealthId: string; commentId: string; dto: UpdateWealthCommentDto }) =>
      wealthService.updateComment(args.wealthId, args.commentId, args.dto),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: ['wealth', 'comments', updated.wealthId] });
    },
  }));
};

export const useDeleteWealthCommentMutation = () => {
  const qc = useQueryClient();
  return createMutation(() => ({
    mutationFn: (args: { wealthId: string; commentId: string }) =>
      wealthService.deleteComment(args.wealthId, args.commentId),
    onSuccess: (_void, vars) => {
      qc.invalidateQueries({ queryKey: ['wealth', 'comments', vars.wealthId] });
    },
  }));
};