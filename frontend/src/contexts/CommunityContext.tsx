import { createContext, useContext, ParentProps, JSX, createMemo } from 'solid-js';
import { useCommunityQuery } from '@/hooks/queries/useCommunityQuery';
import { useMyCommunityRoleQuery } from '@/hooks/queries/useMyCommunityRoleQuery';
import { useCanManageItemsQuery } from '@/hooks/queries/useCanManageItemsQuery';
import type { Community } from '@/types/community.types';
import type { CommunityMember } from '@/types/community.types';

interface CommunityContextValue {
  community: () => Community | undefined;
  role: () => CommunityMember | undefined;
  isLoading: () => boolean;
  error: () => Error | null;
  isAdmin: () => boolean;
  canInviteMembers: () => boolean;
  canRemoveMembers: () => boolean;
  canUpdateMemberRoles: () => boolean;
  canManageItems: () => boolean;
}

const CommunityContext = createContext<CommunityContextValue>();

export const CommunityProvider = (props: ParentProps<{ communityId: string }>) => {
  const communityQuery = useCommunityQuery(() => props.communityId);
  const roleQuery = useMyCommunityRoleQuery(() => props.communityId);
  const canManageItemsQuery = useCanManageItemsQuery(() => props.communityId);

  const isAdmin = createMemo(() => roleQuery.data?.roles?.includes('admin') || false);
  const canInviteMembers = createMemo(() => isAdmin());
  const canRemoveMembers = createMemo(() => isAdmin());
  const canUpdateMemberRoles = createMemo(() => isAdmin());
  const canManageItems = createMemo(() => canManageItemsQuery.data?.canManage || false);

  const value: CommunityContextValue = {
    community: () => communityQuery.data,
    role: () => roleQuery.data,
    // Important: don't block the entire page on role query when it is disabled (no user yet).
    // Treat only the community query as the page loading gate to prevent "stuck loading" on navigation.
    isLoading: () => communityQuery.isLoading,
    error: () => communityQuery.error || roleQuery.error,
    isAdmin,
    canInviteMembers,
    canRemoveMembers,
    canUpdateMemberRoles,
    canManageItems,
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