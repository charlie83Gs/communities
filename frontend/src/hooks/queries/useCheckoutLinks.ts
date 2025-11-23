import {
  createQuery,
  createMutation,
  useQueryClient,
} from '@tanstack/solid-query';
import { Accessor } from 'solid-js';
import { checkoutLinksService } from '@/services/api/checkoutLinks.service';
import type {
  PoolCheckoutLink,
  ShareCheckoutLink,
  CheckoutLinkDetails,
  CheckoutResult,
  CreatePoolCheckoutLinkDto,
  CreateShareCheckoutLinkDto,
  CompleteCheckoutDto,
  RevokePoolCheckoutLinkDto,
} from '@/types/checkoutLinks.types';

// ========================================
// Pool Checkout Links - Queries
// ========================================

/**
 * Query: Get all checkout links for a pool
 */
export const usePoolCheckoutLinks = (
  communityId: Accessor<string | undefined>,
  poolId: Accessor<string | undefined>
) => {
  return createQuery(() => ({
    queryKey: ['communities', communityId(), 'pools', poolId(), 'checkout-links'],
    queryFn: () =>
      checkoutLinksService.getPoolCheckoutLinks(communityId()!, poolId()!),
    enabled: !!communityId() && !!poolId(),
    staleTime: 30_000,
    gcTime: 5 * 60 * 1000,
  }));
};

// ========================================
// Pool Checkout Links - Mutations
// ========================================

/**
 * Mutation: Create pool checkout link
 */
export const useCreatePoolCheckoutLink = () => {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationFn: ({
      communityId,
      poolId,
      dto,
    }: {
      communityId: string;
      poolId: string;
      dto: CreatePoolCheckoutLinkDto;
    }) => checkoutLinksService.createPoolCheckoutLink(communityId, poolId, dto),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: [
          'communities',
          variables.communityId,
          'pools',
          variables.poolId,
          'checkout-links',
        ],
      });
    },
  }));
};

/**
 * Mutation: Revoke pool checkout link
 */
export const useRevokePoolCheckoutLink = () => {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationFn: ({
      communityId,
      poolId,
      linkId,
      dto,
    }: {
      communityId: string;
      poolId: string;
      linkId: string;
      dto?: RevokePoolCheckoutLinkDto;
    }) =>
      checkoutLinksService.revokePoolCheckoutLink(
        communityId,
        poolId,
        linkId,
        dto
      ),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: [
          'communities',
          variables.communityId,
          'pools',
          variables.poolId,
          'checkout-links',
        ],
      });
    },
  }));
};

/**
 * Mutation: Regenerate pool checkout link
 */
export const useRegeneratePoolCheckoutLink = () => {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationFn: ({
      communityId,
      poolId,
      linkId,
    }: {
      communityId: string;
      poolId: string;
      linkId: string;
    }) =>
      checkoutLinksService.regeneratePoolCheckoutLink(
        communityId,
        poolId,
        linkId
      ),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: [
          'communities',
          variables.communityId,
          'pools',
          variables.poolId,
          'checkout-links',
        ],
      });
    },
  }));
};

// ========================================
// Share Checkout Links - Queries
// ========================================

/**
 * Query: Get share checkout link
 */
export const useShareCheckoutLink = (shareId: Accessor<string | undefined>) => {
  return createQuery(() => ({
    queryKey: ['wealth', shareId(), 'checkout-link'],
    queryFn: () => checkoutLinksService.getShareCheckoutLink(shareId()!),
    enabled: !!shareId(),
    staleTime: 30_000,
    gcTime: 5 * 60 * 1000,
  }));
};

// ========================================
// Share Checkout Links - Mutations
// ========================================

/**
 * Mutation: Create share checkout link
 */
export const useCreateShareCheckoutLink = () => {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationFn: ({
      shareId,
      dto,
    }: {
      shareId: string;
      dto: CreateShareCheckoutLinkDto;
    }) => checkoutLinksService.createShareCheckoutLink(shareId, dto),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ['wealth', variables.shareId, 'checkout-link'],
      });
      // Also invalidate the wealth item itself to update UI
      void queryClient.invalidateQueries({
        queryKey: ['wealth', variables.shareId],
      });
    },
  }));
};

/**
 * Mutation: Revoke share checkout link
 */
export const useRevokeShareCheckoutLink = () => {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationFn: ({ shareId }: { shareId: string }) =>
      checkoutLinksService.revokeShareCheckoutLink(shareId),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({
        queryKey: ['wealth', variables.shareId, 'checkout-link'],
      });
      void queryClient.invalidateQueries({
        queryKey: ['wealth', variables.shareId],
      });
    },
  }));
};

// ========================================
// Public Checkout - Queries
// ========================================

/**
 * Query: Get checkout link details (public endpoint)
 */
export const useCheckoutLinkDetails = (linkCode: Accessor<string | undefined>) => {
  return createQuery(() => ({
    queryKey: ['checkout', linkCode()],
    queryFn: () => checkoutLinksService.getCheckoutLinkDetails(linkCode()!),
    enabled: !!linkCode(),
    staleTime: 10_000, // Shorter stale time for public checkout
    gcTime: 2 * 60 * 1000,
  }));
};

// ========================================
// Public Checkout - Mutations
// ========================================

/**
 * Mutation: Complete checkout
 */
export const useCompleteCheckout = () => {
  const queryClient = useQueryClient();

  return createMutation(() => ({
    mutationFn: ({
      linkCode,
      dto,
    }: {
      linkCode: string;
      dto: CompleteCheckoutDto;
    }) => checkoutLinksService.completeCheckout(linkCode, dto),
    onSuccess: (_data, variables) => {
      // Invalidate checkout link details to get updated availability
      void queryClient.invalidateQueries({
        queryKey: ['checkout', variables.linkCode],
      });
      // Invalidate user's requests
      void queryClient.invalidateQueries({
        queryKey: ['wealth', 'requests', 'me'],
        exact: false,
      });
      // Invalidate pool checkout links (if pool) for updated stats
      void queryClient.invalidateQueries({
        queryKey: ['communities'],
        exact: false,
      });
      // Invalidate wealth shares (if share) for updated units
      void queryClient.invalidateQueries({
        queryKey: ['wealth'],
        exact: false,
      });
    },
  }));
};
