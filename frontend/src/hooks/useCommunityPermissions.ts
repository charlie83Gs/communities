import { createResource, Accessor, createMemo } from 'solid-js';
import { useAuth } from './useAuth';
import { communityMembersService } from '@/services/api/communityMembers.service';
import type { CommunityMember } from '@/types/community.types';

export interface CommunityPermissions {
  isAdmin: () => boolean;
  canInviteMembers: () => boolean;
  canRemoveMembers: () => boolean;
  canUpdateMemberRoles: () => boolean;
  isLoading: () => boolean;
}

export const useCommunityPermissions = (communityId: Accessor<string | undefined>): CommunityPermissions => {
  const { user, isAuthenticated } = useAuth();

  const [role] = createResource(
    () => ({
      userId: user()?.id,
      communityId: communityId(),
      isAuthenticated: isAuthenticated()
    }),
    async ({ userId, communityId, isAuthenticated }) => {
      if (!isAuthenticated || !userId || !communityId) {
        return null;
      }

      try {
        return await communityMembersService.getMemberRole(communityId, userId);
      } catch (error) {
        console.error('Failed to fetch user role in community:', error);
        return null;
      }
    },
    { deferStream: true }
  );

  const isAdmin = createMemo(() => role()?.roles?.includes('admin') || false);
  const canInviteMembers = createMemo(() => isAdmin());
  const canRemoveMembers = createMemo(() => isAdmin());
  const canUpdateMemberRoles = createMemo(() => isAdmin());

  return {
    isAdmin,
    canInviteMembers,
    canRemoveMembers,
    canUpdateMemberRoles,
    isLoading: () => role.loading
  };
};
