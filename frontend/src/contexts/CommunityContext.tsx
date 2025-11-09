import { createContext, useContext, ParentProps, JSX, createMemo } from 'solid-js';
import { useCommunityQuery } from '@/hooks/queries/useCommunityQuery';
import { useMyCommunityRoleQuery } from '@/hooks/queries/useMyCommunityRoleQuery';
import { useMyTrustSummaryQuery } from '@/hooks/queries/useMyTrustSummaryQuery';
import type { Community } from '@/types/community.types';
import type { CommunityMember } from '@/types/community.types';
import type { TrustSummary } from '@/types/trust.types';

interface CommunityContextValue {
  community: () => Community | undefined;
  role: () => CommunityMember | undefined;
  trustMe: () => TrustSummary | undefined;
  isLoading: () => boolean;
  error: () => Error | null;
  isAdmin: () => boolean;
  canInviteMembers: () => boolean;
  canRemoveMembers: () => boolean;
  canUpdateMemberRoles: () => boolean;

  // Trust permissions
  canViewTrust: () => boolean;
  canAwardTrust: () => boolean;

  // Wealth permissions
  canViewWealth: () => boolean;
  canCreateWealth: () => boolean;

  // Items permissions
  canViewItems: () => boolean;
  canManageItems: () => boolean;

  // Disputes permissions
  canViewDisputes: () => boolean;
  canHandleDisputes: () => boolean;

  // Polls permissions
  canViewPolls: () => boolean;
  canCreatePolls: () => boolean;

  // Pools permissions
  canViewPools: () => boolean;
  canCreatePools: () => boolean;

  // Councils permissions
  canViewCouncils: () => boolean;
  canCreateCouncils: () => boolean;

  // Forum permissions
  canViewForum: () => boolean;
  canManageForum: () => boolean;
  canCreateThreads: () => boolean;
  canUploadAttachments: () => boolean;
  canFlagContent: () => boolean;
  canReviewFlags: () => boolean;

  // Analytics permissions
  canViewAnalytics: () => boolean;

  // Needs permissions
  canViewNeeds: () => boolean;
  canPublishNeeds: () => boolean;
}

const CommunityContext = createContext<CommunityContextValue>();

export const CommunityProvider = (props: ParentProps<{ communityId: string }>) => {
  const communityQuery = useCommunityQuery(() => props.communityId);
  const roleQuery = useMyCommunityRoleQuery(() => props.communityId);
  const trustMeQuery = useMyTrustSummaryQuery(() => props.communityId);

  const isAdmin = createMemo(() => roleQuery.data?.roles?.includes('admin') || false);
  const canInviteMembers = createMemo(() => isAdmin());
  const canRemoveMembers = createMemo(() => isAdmin());
  const canUpdateMemberRoles = createMemo(() => isAdmin());

  // Permission accessors from trustMe query
  const canViewTrust = createMemo(() => trustMeQuery.data?.canViewTrust || false);
  const canAwardTrust = createMemo(() => trustMeQuery.data?.canAwardTrust || false);

  const canViewWealth = createMemo(() => trustMeQuery.data?.canViewWealth || false);
  const canCreateWealth = createMemo(() => trustMeQuery.data?.canCreateWealth || false);

  const canViewItems = createMemo(() => trustMeQuery.data?.canViewItems || false);
  const canManageItems = createMemo(() => trustMeQuery.data?.canManageItems || false);

  const canViewDisputes = createMemo(() => trustMeQuery.data?.canViewDisputes || false);
  const canHandleDisputes = createMemo(() => trustMeQuery.data?.canHandleDisputes || false);

  const canViewPolls = createMemo(() => trustMeQuery.data?.canViewPolls || false);
  const canCreatePolls = createMemo(() => trustMeQuery.data?.canCreatePolls || false);

  const canViewPools = createMemo(() => trustMeQuery.data?.canViewPools || false);
  const canCreatePools = createMemo(() => trustMeQuery.data?.canCreatePools || false);

  const canViewCouncils = createMemo(() => trustMeQuery.data?.canViewCouncils || false);
  const canCreateCouncils = createMemo(() => trustMeQuery.data?.canCreateCouncils || false);

  const canViewForum = createMemo(() => trustMeQuery.data?.canViewForum || false);
  const canManageForum = createMemo(() => trustMeQuery.data?.canManageForum || false);
  const canCreateThreads = createMemo(() => trustMeQuery.data?.canCreateThreads || false);
  const canUploadAttachments = createMemo(() => trustMeQuery.data?.canUploadAttachments || false);
  const canFlagContent = createMemo(() => trustMeQuery.data?.canFlagContent || false);
  const canReviewFlags = createMemo(() => trustMeQuery.data?.canReviewFlags || false);

  const canViewAnalytics = createMemo(() => trustMeQuery.data?.canViewAnalytics || false);

  const canViewNeeds = createMemo(() => trustMeQuery.data?.canViewNeeds || false);
  const canPublishNeeds = createMemo(() => trustMeQuery.data?.canPublishNeeds || false);

  const value: CommunityContextValue = {
    community: () => communityQuery.data,
    role: () => roleQuery.data,
    trustMe: () => trustMeQuery.data,
    // Important: don't block the entire page on role query when it is disabled (no user yet).
    // Treat only the community query as the page loading gate to prevent "stuck loading" on navigation.
    isLoading: () => communityQuery.isLoading,
    error: () => communityQuery.error || roleQuery.error || trustMeQuery.error,
    isAdmin,
    canInviteMembers,
    canRemoveMembers,
    canUpdateMemberRoles,

    // Expose all permissions
    canViewTrust,
    canAwardTrust,
    canViewWealth,
    canCreateWealth,
    canViewItems,
    canManageItems,
    canViewDisputes,
    canHandleDisputes,
    canViewPolls,
    canCreatePolls,
    canViewPools,
    canCreatePools,
    canViewCouncils,
    canCreateCouncils,
    canViewForum,
    canManageForum,
    canCreateThreads,
    canUploadAttachments,
    canFlagContent,
    canReviewFlags,
    canViewAnalytics,
    canViewNeeds,
    canPublishNeeds,
  };

  return (
    <CommunityContext.Provider value={value}>
      {props.children}
    </CommunityContext.Provider>
  );
};

export const useCommunity = () => {
  const context = useContext(CommunityContext);
  if (!context) {
    throw new Error('useCommunity must be used within a CommunityProvider');
  }
  return context;
};
