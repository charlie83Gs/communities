import { createQuery, createMutation, useQueryClient } from '@tanstack/solid-query';
import { Accessor } from 'solid-js';
import { contributionsService } from '@/services/api/contributions.service';
import type {
  RecognizedContribution,
  LogContributionDto,
  VerifyContributionDto,
  DisputeContributionDto,
  ContributionProfile,
  PeerRecognitionGrant,
  GrantPeerRecognitionDto,
  PeerRecognitionLimits,
  ValueCalibrationHistory,
  PendingVerification,
} from '@/types/contributions.types';

// ========== Contributions Queries ==========

export const useMyContributionsQuery = (
  communityId: Accessor<string | undefined>,
  page?: Accessor<number | undefined>,
  limit?: Accessor<number | undefined>
) => {
  return createQuery(() => ({
    queryKey: ['contributions', 'my', communityId(), page?.(), limit?.()],
    queryFn: () => contributionsService.getMyContributions(communityId()!, page?.(), limit?.()),
    enabled: !!communityId(),
  })) as ReturnType<typeof createQuery<RecognizedContribution[], Error>>;
};

export const useContributionQuery = (
  communityId: Accessor<string | undefined>,
  contributionId: Accessor<string | undefined>
) => {
  return createQuery(() => ({
    queryKey: ['contribution', communityId(), contributionId()],
    queryFn: () => contributionsService.getContribution(communityId()!, contributionId()!),
    enabled: !!communityId() && !!contributionId(),
  })) as ReturnType<typeof createQuery<RecognizedContribution, Error>>;
};

export const useContributionProfileQuery = (
  communityId: Accessor<string | undefined>,
  userId: Accessor<string | undefined>
) => {
  return createQuery(() => ({
    queryKey: ['contribution-profile', communityId(), userId()],
    queryFn: () => contributionsService.getContributionProfile(communityId()!, userId()!),
    enabled: !!communityId() && !!userId(),
  })) as ReturnType<typeof createQuery<ContributionProfile, Error>>;
};

export const useMyContributionProfileQuery = (communityId: Accessor<string | undefined>) => {
  return createQuery(() => ({
    queryKey: ['contribution-profile', 'my', communityId()],
    queryFn: () => contributionsService.getMyProfile(communityId()!),
    enabled: !!communityId(),
  })) as ReturnType<typeof createQuery<ContributionProfile, Error>>;
};

// ========== Contributions Mutations ==========

export const useLogContributionMutation = () => {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationFn: ({
      communityId,
      data,
    }: {
      communityId: string;
      data: LogContributionDto;
    }) => contributionsService.logContribution(communityId, data),
    onSuccess: (_, variables) => {
      // Invalidate all contribution-related queries
      void queryClient.invalidateQueries({
        queryKey: ['contributions', 'my', variables.communityId],
      });
      void queryClient.invalidateQueries({
        queryKey: ['contribution-profile', 'my', variables.communityId],
      });
      void queryClient.invalidateQueries({
        queryKey: ['pending-verifications', variables.communityId],
      });
    },
  }));
};

export const useVerifyContributionMutation = () => {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationFn: ({
      communityId,
      contributionId,
      data,
    }: {
      communityId: string;
      contributionId: string;
      data: VerifyContributionDto;
    }) => contributionsService.verifyContribution(communityId, contributionId, data),
    onSuccess: (result, variables) => {
      // Invalidate verification queue
      void queryClient.invalidateQueries({
        queryKey: ['pending-verifications', variables.communityId],
      });
      // Invalidate contribution profile for the contributor
      void queryClient.invalidateQueries({
        queryKey: ['contribution-profile', variables.communityId, result.contributorId],
      });
      // Update the specific contribution
      void queryClient.invalidateQueries({
        queryKey: ['contribution', variables.communityId, variables.contributionId],
      });
    },
  }));
};

export const useDisputeContributionMutation = () => {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationFn: ({
      communityId,
      contributionId,
      data,
    }: {
      communityId: string;
      contributionId: string;
      data: DisputeContributionDto;
    }) => contributionsService.disputeContribution(communityId, contributionId, data),
    onSuccess: (result, variables) => {
      // Invalidate verification queue
      void queryClient.invalidateQueries({
        queryKey: ['pending-verifications', variables.communityId],
      });
      // Invalidate contribution profile for the contributor
      void queryClient.invalidateQueries({
        queryKey: ['contribution-profile', variables.communityId, result.contributorId],
      });
      // Update the specific contribution
      void queryClient.invalidateQueries({
        queryKey: ['contribution', variables.communityId, variables.contributionId],
      });
    },
  }));
};

// ========== Peer Recognition Queries ==========

export const useMyPeerGrantsQuery = (
  communityId: Accessor<string | undefined>,
  monthYear?: Accessor<string | undefined>
) => {
  return createQuery(() => ({
    queryKey: ['peer-grants', 'my', communityId(), monthYear?.()],
    queryFn: () => contributionsService.getMyPeerGrants(communityId()!, monthYear?.()),
    enabled: !!communityId(),
  })) as ReturnType<typeof createQuery<PeerRecognitionGrant[], Error>>;
};

export const usePeerRecognitionLimitsQuery = (communityId: Accessor<string | undefined>) => {
  return createQuery(() => ({
    queryKey: ['peer-recognition-limits', communityId()],
    queryFn: () => contributionsService.getPeerRecognitionLimits(communityId()!),
    enabled: !!communityId(),
  })) as ReturnType<typeof createQuery<PeerRecognitionLimits, Error>>;
};

// ========== Peer Recognition Mutations ==========

export const useGrantPeerRecognitionMutation = () => {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationFn: ({
      communityId,
      data,
    }: {
      communityId: string;
      data: GrantPeerRecognitionDto;
    }) => contributionsService.grantPeerRecognition(communityId, data),
    onSuccess: (_, variables) => {
      // Invalidate limits (usage has changed)
      void queryClient.invalidateQueries({
        queryKey: ['peer-recognition-limits', variables.communityId],
      });
      // Invalidate my grants
      void queryClient.invalidateQueries({
        queryKey: ['peer-grants', 'my', variables.communityId],
      });
      // Invalidate the recipient's profile
      void queryClient.invalidateQueries({
        queryKey: ['contribution-profile', variables.communityId, variables.data.toUserId],
      });
    },
  }));
};

// ========== Verification Queue ==========

export const usePendingVerificationsQuery = (communityId: Accessor<string | undefined>) => {
  return createQuery(() => ({
    queryKey: ['pending-verifications', communityId()],
    queryFn: () => contributionsService.getPendingVerifications(communityId()!),
    enabled: !!communityId(),
  })) as ReturnType<typeof createQuery<PendingVerification[], Error>>;
};

// ========== Calibration History ==========

export const useCalibrationHistoryQuery = (
  communityId: Accessor<string | undefined>,
  itemId?: Accessor<string | undefined>
) => {
  return createQuery(() => ({
    queryKey: ['calibration-history', communityId(), itemId?.()],
    queryFn: () => contributionsService.getCalibrationHistory(communityId()!, itemId?.()),
    enabled: !!communityId(),
  })) as ReturnType<typeof createQuery<ValueCalibrationHistory[], Error>>;
};
