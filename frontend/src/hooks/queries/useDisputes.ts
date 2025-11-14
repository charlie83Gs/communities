/**
 * Disputes Queries and Mutations
 * Location per architecture: /hooks/queries (data-fetching/query hooks)
 */

import { createQuery, createMutation, useQueryClient } from '@tanstack/solid-query';
import type { Accessor } from 'solid-js';
import { disputesService } from '@/services/api/disputes.service';
import type {
  DisputeStatus,
  CreateDisputeDto,
  AddDisputeParticipantDto,
  RespondToMediatorDto,
  CreateDisputeResolutionDto,
  CreateDisputeMessageDto,
  UpdateDisputeStatusDto,
} from '@/types/dispute.types';

/**
 * List disputes in a community
 */
export const useDisputesListQuery = (
  communityId: Accessor<string | undefined>,
  params?: { status?: Accessor<DisputeStatus | undefined> }
) => {
  return createQuery(() => ({
    queryKey: ['disputes', 'community', communityId(), params?.status?.()],
    queryFn: async () => {
      const cid = communityId();
      if (!cid) return { disputes: [], total: 0 };
      return disputesService.listDisputes(cid, {
        status: params?.status?.(),
      });
    },
    enabled: !!communityId(),
  }));
};

/**
 * Get dispute details
 */
export const useDisputeDetailQuery = (
  communityId: Accessor<string | undefined>,
  disputeId: Accessor<string | undefined>
) => {
  return createQuery(() => ({
    queryKey: ['disputes', 'detail', communityId(), disputeId()],
    queryFn: () => disputesService.getDispute(communityId()!, disputeId()!),
    enabled: !!communityId() && !!disputeId(),
  }));
};

/**
 * List messages in a dispute
 */
export const useDisputeMessagesQuery = (
  communityId: Accessor<string | undefined>,
  disputeId: Accessor<string | undefined>
) => {
  return createQuery(() => ({
    queryKey: ['disputes', 'messages', communityId(), disputeId()],
    queryFn: () => disputesService.listMessages(communityId()!, disputeId()!),
    enabled: !!communityId() && !!disputeId(),
  }));
};

/**
 * Create a new dispute
 */
export const useCreateDisputeMutation = () => {
  const qc = useQueryClient();
  return createMutation(() => ({
    mutationFn: (vars: { communityId: string; dto: CreateDisputeDto }) =>
      disputesService.createDispute(vars.communityId, vars.dto),
    onSuccess: (_data, vars) => {
      // Invalidate disputes list for the community
      void qc.invalidateQueries({
        queryKey: ['disputes', 'community', vars.communityId],
        exact: false,
      });
    },
  }));
};

/**
 * Add a participant to a dispute
 */
export const useAddParticipantMutation = () => {
  const qc = useQueryClient();
  return createMutation(() => ({
    mutationFn: (vars: { communityId: string; disputeId: string; dto: AddDisputeParticipantDto }) =>
      disputesService.addParticipant(vars.communityId, vars.disputeId, vars.dto),
    onSuccess: (_data, vars) => {
      // Invalidate dispute detail to refresh participants list
      void qc.invalidateQueries({
        queryKey: ['disputes', 'detail', vars.communityId, vars.disputeId],
      });
    },
  }));
};

/**
 * Propose yourself as a mediator
 */
export const useProposeAsMediatorMutation = () => {
  const qc = useQueryClient();
  return createMutation(() => ({
    mutationFn: (vars: { communityId: string; disputeId: string }) =>
      disputesService.proposeAsMediator(vars.communityId, vars.disputeId),
    onSuccess: (_data, vars) => {
      // Invalidate dispute detail to refresh mediators list
      void qc.invalidateQueries({
        queryKey: ['disputes', 'detail', vars.communityId, vars.disputeId],
      });
      // Also invalidate list to update mediator counts
      void qc.invalidateQueries({
        queryKey: ['disputes', 'community', vars.communityId],
        exact: false,
      });
    },
  }));
};

/**
 * Respond to a mediator proposal (accept/reject)
 */
export const useRespondToMediatorMutation = () => {
  const qc = useQueryClient();
  return createMutation(() => ({
    mutationFn: (vars: {
      communityId: string;
      disputeId: string;
      mediatorId: string;
      dto: RespondToMediatorDto;
    }) =>
      disputesService.respondToMediator(
        vars.communityId,
        vars.disputeId,
        vars.mediatorId,
        vars.dto
      ),
    onSuccess: (_data, vars) => {
      // Invalidate dispute detail to refresh mediators status
      void qc.invalidateQueries({
        queryKey: ['disputes', 'detail', vars.communityId, vars.disputeId],
      });
      // Also invalidate list to update status/mediator counts
      void qc.invalidateQueries({
        queryKey: ['disputes', 'community', vars.communityId],
        exact: false,
      });
    },
  }));
};

/**
 * Create a resolution for a dispute
 */
export const useCreateResolutionMutation = () => {
  const qc = useQueryClient();
  return createMutation(() => ({
    mutationFn: (vars: {
      communityId: string;
      disputeId: string;
      dto: CreateDisputeResolutionDto;
    }) =>
      disputesService.createResolution(vars.communityId, vars.disputeId, vars.dto),
    onSuccess: (_data, vars) => {
      // Invalidate dispute detail to show resolution
      void qc.invalidateQueries({
        queryKey: ['disputes', 'detail', vars.communityId, vars.disputeId],
      });
      // Invalidate list to update status
      void qc.invalidateQueries({
        queryKey: ['disputes', 'community', vars.communityId],
        exact: false,
      });
    },
  }));
};

/**
 * Create a message in a dispute
 */
export const useCreateMessageMutation = () => {
  const qc = useQueryClient();
  return createMutation(() => ({
    mutationFn: (vars: {
      communityId: string;
      disputeId: string;
      dto: CreateDisputeMessageDto;
    }) =>
      disputesService.createMessage(vars.communityId, vars.disputeId, vars.dto),
    onSuccess: (_data, vars) => {
      // Invalidate messages to show new message
      void qc.invalidateQueries({
        queryKey: ['disputes', 'messages', vars.communityId, vars.disputeId],
      });
    },
  }));
};

/**
 * Update dispute status
 */
export const useUpdateDisputeStatusMutation = () => {
  const qc = useQueryClient();
  return createMutation(() => ({
    mutationFn: (vars: {
      communityId: string;
      disputeId: string;
      dto: UpdateDisputeStatusDto;
    }) =>
      disputesService.updateStatus(vars.communityId, vars.disputeId, vars.dto),
    onSuccess: (_data, vars) => {
      // Invalidate detail and list
      void qc.invalidateQueries({
        queryKey: ['disputes', 'detail', vars.communityId, vars.disputeId],
      });
      void qc.invalidateQueries({
        queryKey: ['disputes', 'community', vars.communityId],
        exact: false,
      });
    },
  }));
};
