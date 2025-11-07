import { Component, For, Show, createMemo, createSignal } from 'solid-js';
import { useAuth } from '@/hooks/useAuth';
import { makeTranslator } from '@/i18n/makeTranslator';
import { membersListDict } from './MembersList.i18n';
import { useCommunityMembersQuery } from '@/hooks/queries/useCommunityMembersQuery';
import { useCommunityTrustUsersQuery } from '@/hooks/queries/useCommunityTrustUsersQuery';
import { useMyTrustSummaryQuery } from '@/hooks/queries/useMyTrustSummaryQuery';
import { useMyTrustAwardsQuery, useAwardTrustMutation, useRemoveTrustMutation } from '@/hooks/queries/useTrust';
import { communityMembersService } from '@/services/api/communityMembers.service';
import { MemberCard } from './MemberCard';
import { MemberRoleEditForm } from './MemberRoleEditForm';
import type { CommunityMember } from '@/types/community.types';
import type { TrustView } from '@/types/trust.types';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';

interface MembersListProps {
  communityId: string;
  showActions?: boolean;
  canRemoveMembers?: boolean;
  canUpdateRoles?: boolean;
  onChanged?: () => void;
}

interface MergedMember extends CommunityMember {
  trustView?: TrustView;
}

export const MembersList: Component<MembersListProps> = (props) => {
  const t = makeTranslator(membersListDict, 'membersList');
  const { user } = useAuth();
  const currentUserId = () => user()?.id;

  const membersQuery = useCommunityMembersQuery(() => props.communityId);
  const trustUsersQuery = useCommunityTrustUsersQuery(() => props.communityId);
  const myTrustSummaryQuery = useMyTrustSummaryQuery(() => props.communityId);
  const myAwardsQuery = useMyTrustAwardsQuery(() => props.communityId);
  const awardTrustMutation = useAwardTrustMutation();
  const removeTrustMutation = useRemoveTrustMutation();

  const [isBusy, setBusy] = createSignal(false);
  const [editingMember, setEditingMember] = createSignal<CommunityMember | null>(null);

  const handleRemove = async (userId: string) => {
    try {
      setBusy(true);
      await communityMembersService.removeMember(props.communityId, userId);
      await membersQuery.refetch();
      props.onChanged?.();
    } finally {
      setBusy(false);
    }
  };

  const handleEditRole = (userId: string) => {
    const member = membersQuery.data?.find(m => m.userId === userId);
    if (member) {
      setEditingMember(member);
    }
  };

  const handleUpdateRole = async (userId: string, role: string) => {
    await communityMembersService.updateMemberRole(props.communityId, userId, role);
    await membersQuery.refetch();
    props.onChanged?.();
  };

  const handleEditSuccess = () => {
    setEditingMember(null);
  };

  const handleToggleTrust = (userId: string, currentlyAwarded: boolean) => {
    if (currentlyAwarded) {
      removeTrustMutation.mutate({ communityId: props.communityId, toUserId: userId });
    } else {
      awardTrustMutation.mutate({ communityId: props.communityId, toUserId: userId });
    }
  };

  const mergedMembers = createMemo((): MergedMember[] => {
    const members = membersQuery.data || [];
    const trustUsers = trustUsersQuery.data || [];
    return members.map((m) => {
      const trust = trustUsers.find((t: TrustView) => t.userId === m.userId);
      return {
        ...m,
        trustView: trust,
      };
    });
  });

  const data = () => mergedMembers() as MergedMember[];

  const canAwardTrust = () => {
    return myTrustSummaryQuery.data?.canAwardTrust || false;
  };

  const hasAwardedTrustTo = (userId: string) => {
    const awards = myAwardsQuery.data || [];
    return awards.some(award => award.toUserId === userId);
  };

  return (
    <div class="p-4 border border-stone-200 dark:border-stone-700 rounded-lg bg-white dark:bg-stone-800">
      {/* Modal for editing member role */}
      <Modal
        isOpen={!!editingMember()}
        onClose={() => setEditingMember(null)}
        title={t('editMemberRole')}
        size="md"
      >
        <Show when={editingMember()}>
          <MemberRoleEditForm
            member={editingMember()!}
            communityId={props.communityId}
            onSuccess={handleEditSuccess}
            onCancel={() => setEditingMember(null)}
            onUpdateRole={handleUpdateRole}
          />
        </Show>
      </Modal>

      <div class="flex items-center justify-between mb-3">
        <h3 class="font-semibold text-stone-900 dark:text-stone-100">{t('members')}</h3>
        <Show when={membersQuery.isFetching || trustUsersQuery.isFetching || myAwardsQuery.isFetching || isBusy()}>
          <span class="text-sm text-stone-500 dark:text-stone-400">{t('updating')}</span>
        </Show>
      </div>

      <Show when={!membersQuery.isLoading && !trustUsersQuery.isLoading && !myAwardsQuery.isLoading} fallback={<div>{t('loadingMembers')}</div>}>
        <Show when={data().length > 0} fallback={<div class="text-sm text-stone-500 dark:text-stone-400">{t('noMembers')}</div>}>
          <div class="space-y-2">
            <For each={data()}>
              {(m) => (
                <MemberCard
                  member={m}
                  isAdmin={!!props.showActions}
                  canAwardTrust={canAwardTrust()}
                  hasAwardedTrust={hasAwardedTrustTo(m.userId)}
                  currentUserId={currentUserId()}
                  onRemove={props.canRemoveMembers ? handleRemove : undefined}
                  onEditRole={props.canUpdateRoles ? handleEditRole : undefined}
                  onToggleTrust={handleToggleTrust}
                />
              )}
            </For>
          </div>
        </Show>
      </Show>

      <Show when={membersQuery.isError || trustUsersQuery.isError || myAwardsQuery.isError}>
        <div class="text-red-500 text-sm mt-2">{t('failedToLoad')}</div>
      </Show>

      <div class="mt-3">
        <Button size="sm" variant="secondary" onClick={() => {
          membersQuery.refetch();
          trustUsersQuery.refetch();
          myAwardsQuery.refetch();
        }} disabled={membersQuery.isFetching || trustUsersQuery.isFetching}>
          {t('refresh')}
        </Button>
      </div>
    </div>
  );
};
