import { Component, For, Show, createMemo, createSignal } from 'solid-js';
import { useAuth } from '@/hooks/useAuth';
import { makeTranslator } from '@/i18n/makeTranslator';
import { membersListDict } from './MembersList.i18n';
import { useCommunityMembersQuery } from '@/hooks/queries/useCommunityMembersQuery';
import { useCommunityTrustUsersQuery } from '@/hooks/queries/useCommunityTrustUsersQuery';
import { useMyTrustSummaryQuery } from '@/hooks/queries/useMyTrustSummaryQuery';
import { useMyTrustAwardsQuery, useAwardTrustMutation, useRemoveTrustMutation, useDecayingEndorsementsQuery, useRecertifyTrustMutation } from '@/hooks/queries/useTrust';
import { useTrustLevelsQuery } from '@/hooks/queries/useTrustLevelsQuery';
import { communityMembersService } from '@/services/api/communityMembers.service';
import { MemberRoleEditForm } from './MemberRoleEditForm';
import { CredentialedImage } from '@/components/common/CredentialedImage';
import { Icon } from '@/components/common/Icon';
import { Modal } from '@/components/common/Modal';
import { SkillsBadgeList } from '@/components/features/skills/SkillsBadgeList';
import { createDebouncedSignal } from '@/utils/debounce';
import type { CommunityMember } from '@/types/community.types';
import type { TrustView, DecayingEndorsement } from '@/types/trust.types';

interface MembersListProps {
  communityId: string;
  showActions?: boolean;
  canRemoveMembers?: boolean;
  canUpdateRoles?: boolean;
  onChanged?: () => void;
}

interface MergedMember extends CommunityMember {
  trustView?: TrustView;
  peerAwards: number;
  adminGrant: number;
  totalPoints: number;
}

type SortField = 'name' | 'trust' | 'peer';

export const MembersList: Component<MembersListProps> = (props) => {
  const t = makeTranslator(membersListDict, 'membersList');
  const { user } = useAuth();
  const currentUserId = () => user()?.id;
  const baseUrl = import.meta.env.VITE_API_URL as string;

  const membersQuery = useCommunityMembersQuery(() => props.communityId);
  const trustUsersQuery = useCommunityTrustUsersQuery(() => props.communityId);
  const myTrustSummaryQuery = useMyTrustSummaryQuery(() => props.communityId);
  const myAwardsQuery = useMyTrustAwardsQuery(() => props.communityId);
  const trustLevelsQuery = useTrustLevelsQuery(() => props.communityId);
  const awardTrustMutation = useAwardTrustMutation();
  const removeTrustMutation = useRemoveTrustMutation();
  const decayingEndorsementsQuery = useDecayingEndorsementsQuery(() => props.communityId);
  const recertifyTrustMutation = useRecertifyTrustMutation();

  const [isBusy, setBusy] = createSignal(false);
  const [editingMember, setEditingMember] = createSignal<CommunityMember | null>(null);
  const [displaySearchTerm, debouncedSearchTerm, setSearchTerm] = createDebouncedSignal('', 300);
  const [sortField, setSortField] = createSignal<SortField>('name');
  const [showOnlyDecaying, setShowOnlyDecaying] = createSignal(false);

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

  const handleRecertifyTrust = (userId: string) => {
    recertifyTrustMutation.mutate({ communityId: props.communityId, userIds: [userId] });
  };

  // Get decay info for a user I've awarded trust to
  const getDecayInfo = (userId: string): DecayingEndorsement | undefined => {
    const decaying = decayingEndorsementsQuery.data || [];
    return decaying.find((d) => d.recipientId === userId);
  };

  const mergedMembers = createMemo((): MergedMember[] => {
    const members = membersQuery.data || [];
    const trustUsers = trustUsersQuery.data || [];
    return members.map((m) => {
      const trust = trustUsers.find((t: TrustView) => t.userId === m.userId);
      return {
        ...m,
        trustView: trust,
        peerAwards: trust?.peerAwards ?? 0,
        adminGrant: trust?.adminGrant ?? 0,
        totalPoints: trust?.points ?? 0,
      };
    });
  });

  const filteredAndSortedMembers = createMemo(() => {
    let result = mergedMembers();

    // Filter by search term (using debounced value)
    const search = debouncedSearchTerm().toLowerCase();
    if (search) {
      result = result.filter((m) => {
        const name = m.displayName?.toLowerCase() || '';
        const email = m.email?.toLowerCase() || '';
        return name.includes(search) || email.includes(search);
      });
    }

    // Filter to only show members with decaying trust if checkbox is checked
    if (showOnlyDecaying()) {
      result = result.filter((m) => {
        const decayInfo = getDecayInfo(m.userId);
        return decayInfo?.isDecaying || decayInfo?.isExpired;
      });
    }

    // Sort
    result = [...result].sort((a, b) => {
      switch (sortField()) {
        case 'name':
          return (a.displayName || a.email || '').localeCompare(b.displayName || b.email || '');
        case 'trust':
          return b.totalPoints - a.totalPoints;
        case 'peer':
          return b.peerAwards - a.peerAwards;
        default:
          return 0;
      }
    });

    return result;
  });

  const canAwardTrust = () => {
    return myTrustSummaryQuery.data?.canAwardTrust || false;
  };

  const hasAwardedTrustTo = (userId: string) => {
    const awards = myAwardsQuery.data || [];
    return awards.some(award => award.toUserId === userId);
  };

  const isCurrentUser = (userId: string) => currentUserId() === userId;

  const getTrustBreakdown = (member: MergedMember) => {
    return `${member.peerAwards} ${t('peerAwards')} + ${member.adminGrant} ${t('adminGrant')} = ${member.totalPoints} ${t('total')}`;
  };

  // Get member's trust title based on their points
  const getMemberTitle = (points: number): string | null => {
    const levels = trustLevelsQuery.data || [];
    if (levels.length === 0) return null;

    // Sort levels by threshold descending and find the highest threshold the member meets
    const sortedLevels = [...levels].sort((a, b) => b.threshold - a.threshold);
    const matchedLevel = sortedLevels.find(level => points >= level.threshold);

    return matchedLevel?.name || null;
  };

  const isLoading = () => membersQuery.isLoading || trustUsersQuery.isLoading || myAwardsQuery.isLoading;
  const hasError = () => membersQuery.isError || trustUsersQuery.isError || myAwardsQuery.isError;

  return (
    <div class="p-6 bg-white dark:bg-stone-800 rounded-lg shadow border border-stone-200 dark:border-stone-700">
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

      <div class="flex items-center justify-between mb-4">
        <h2 class="text-2xl font-bold text-stone-900 dark:text-stone-100">{t('members')}</h2>
        <Show when={membersQuery.isFetching || trustUsersQuery.isFetching || myAwardsQuery.isFetching || isBusy()}>
          <span class="text-sm text-stone-500 dark:text-stone-400">{t('updating')}</span>
        </Show>
      </div>

      {/* Search and Sort Controls */}
      <div class="flex gap-4 mb-4 flex-wrap items-center">
        <input
          type="text"
          placeholder={t('searchPlaceholder')}
          value={displaySearchTerm()}
          onInput={(e) => setSearchTerm(e.currentTarget.value)}
          class="flex-1 min-w-48 px-4 py-2 border border-stone-300 dark:border-stone-600 rounded bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-ocean-500 dark:focus:ring-ocean-400"
        />
        <select
          value={sortField()}
          onChange={(e) => setSortField(e.currentTarget.value as SortField)}
          class="px-4 py-2 border border-stone-300 dark:border-stone-600 rounded bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-ocean-500 dark:focus:ring-ocean-400"
        >
          <option value="name">{t('sortByName')}</option>
          <option value="trust">{t('sortByTrust')}</option>
          <option value="peer">{t('sortByPeer')}</option>
        </select>
        <Show when={canAwardTrust()}>
          <label class="flex items-center gap-2 text-sm text-stone-700 dark:text-stone-300 cursor-pointer">
            <input
              type="checkbox"
              checked={showOnlyDecaying()}
              onChange={(e) => setShowOnlyDecaying(e.currentTarget.checked)}
              class="w-4 h-4 rounded border-stone-300 dark:border-stone-600 text-warning-500 focus:ring-warning-500"
            />
            {t('needsRecertification')}
          </label>
        </Show>
      </div>

      {/* Loading State */}
      <Show when={isLoading()}>
        <div class="text-center py-8 text-stone-500 dark:text-stone-400">{t('loadingMembers')}</div>
      </Show>

      {/* Error State */}
      <Show when={hasError()}>
        <div class="text-center py-8 text-red-500">{t('failedToLoad')}</div>
      </Show>

      {/* Table */}
      <Show when={!isLoading() && !hasError()}>
        <Show when={filteredAndSortedMembers().length > 0} fallback={
          <div class="text-center py-8 text-stone-500 dark:text-stone-400">{t('noMembers')}</div>
        }>
          <div class="overflow-x-auto">
            <table class="w-full border-collapse">
              <thead>
                <tr class="border-b border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-900">
                  <th class="text-left p-3 font-semibold text-stone-700 dark:text-stone-300">{t('displayName')}</th>
                  <th class="text-center p-3 font-semibold text-stone-700 dark:text-stone-300">{t('role')}</th>
                  <th class="text-center p-3 font-semibold text-stone-700 dark:text-stone-300">{t('trustScore')}</th>
                  <Show when={props.showActions || canAwardTrust()}>
                    <th class="text-center p-3 font-semibold text-stone-700 dark:text-stone-300">{t('actions')}</th>
                  </Show>
                </tr>
              </thead>
              <tbody>
                <For each={filteredAndSortedMembers()}>
                  {(member) => (
                    <tr class="border-b border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-700">
                      {/* Member Info */}
                      <td class="p-3">
                        <div class="flex items-center gap-3">
                          <Show when={member.profileImage}>
                            <CredentialedImage
                              src={`${baseUrl}/api/v1/images/${member.profileImage}`}
                              alt="Profile"
                              class="w-8 h-8 rounded-full object-cover"
                              fallbackText="?"
                            />
                          </Show>
                          <Show when={!member.profileImage}>
                            <div class="w-8 h-8 bg-stone-200 dark:bg-stone-700 rounded-full flex items-center justify-center text-xs">
                              {member.displayName?.charAt(0).toUpperCase() || '?'}
                            </div>
                          </Show>
                          <div class="flex-1 min-w-0">
                            <a href={`/users/${member.userId}`} class="font-medium hover:underline text-stone-900 dark:text-stone-100">
                              {member.displayName || member.email || member.userId}
                            </a>
                            <div class="text-sm text-stone-500 dark:text-stone-400">{member.email}</div>
                            {/* Skills badges */}
                            <div class="mt-1">
                              <SkillsBadgeList
                                userId={member.userId}
                                communityId={props.communityId}
                                maxSkills={3}
                              />
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Roles */}
                      <td class="p-3 text-center">
                        <div class="flex gap-1 flex-wrap justify-center">
                          <For each={member.roles}>
                            {(role) => (
                              <span class="px-2 py-0.5 text-xs font-medium rounded bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300">
                                {role}
                              </span>
                            )}
                          </For>
                        </div>
                      </td>

                      {/* Trust Score */}
                      <td class="p-3 text-center">
                        <div title={getTrustBreakdown(member)} class="cursor-help">
                          <div class="text-forest-600 dark:text-forest-400 text-xl font-bold">
                            {member.totalPoints}
                          </div>
                          <Show when={getMemberTitle(member.totalPoints)}>
                            <div class="text-xs font-medium text-forest-600 dark:text-forest-400 mt-0.5">
                              {getMemberTitle(member.totalPoints)}
                            </div>
                          </Show>
                        </div>
                      </td>

                      {/* Actions */}
                      <Show when={props.showActions || canAwardTrust()}>
                        <td class="p-3">
                          <div class="flex gap-2 justify-center">
                            {/* Award Trust Button - with decay states */}
                            <Show when={canAwardTrust() && !isCurrentUser(member.userId)}>
                              {(() => {
                                const awarded = hasAwardedTrustTo(member.userId);
                                const decayInfo = getDecayInfo(member.userId);
                                const isDecaying = decayInfo?.isDecaying && !decayInfo?.isExpired;

                                // Decaying state: show two buttons (recertify/remove)
                                if (isDecaying) {
                                  const decayTitle = t('monthsUntilExpiry').replace('{{months}}', String(Math.round(decayInfo.monthsUntilExpiry)));
                                  return (
                                    <div class="flex gap-1" title={decayTitle}>
                                      {/* Recertify button (thumbs up, orange) */}
                                      <button
                                        onClick={() => handleRecertifyTrust(member.userId)}
                                        class="p-2 rounded-md transition-colors text-warning-500 hover:text-warning-600 hover:bg-stone-100 dark:text-warning-400 dark:hover:text-warning-300 dark:hover:bg-stone-600"
                                        title={t('recertifyTrust')}
                                        aria-label={t('recertifyTrust')}
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
                                          <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                                        </svg>
                                      </button>
                                      {/* Remove button (thumbs down, orange) */}
                                      <button
                                        onClick={() => handleToggleTrust(member.userId, true)}
                                        class="p-2 rounded-md transition-colors text-warning-500 hover:text-warning-600 hover:bg-stone-100 dark:text-warning-400 dark:hover:text-warning-300 dark:hover:bg-stone-600"
                                        title={t('removeTrust')}
                                        aria-label={t('removeTrust')}
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2">
                                          <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3" />
                                        </svg>
                                      </button>
                                    </div>
                                  );
                                }

                                // Active trust (green) or no trust (gray outline)
                                return (
                                  <button
                                    onClick={() => handleToggleTrust(member.userId, awarded)}
                                    class={`p-2 rounded-md transition-colors ${
                                      awarded
                                        ? 'text-forest-600 hover:text-forest-700 hover:bg-stone-100 dark:text-forest-500 dark:hover:text-forest-400 dark:hover:bg-stone-600'
                                        : 'text-stone-400 hover:text-stone-600 hover:bg-stone-100 dark:text-stone-500 dark:hover:text-stone-400 dark:hover:bg-stone-600'
                                    }`}
                                    title={awarded ? t('removeTrust') : t('awardTrust')}
                                    aria-label={awarded ? t('removeTrust') : t('awardTrust')}
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill={awarded ? 'currentColor' : 'none'} stroke="currentColor" stroke-width="2">
                                      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                                    </svg>
                                  </button>
                                );
                              })()}
                            </Show>

                            {/* Admin Actions */}
                            <Show when={props.showActions && !isCurrentUser(member.userId)}>
                              {/* Edit Role */}
                              <Show when={props.canUpdateRoles}>
                                <button
                                  onClick={() => handleEditRole(member.userId)}
                                  class="p-2 rounded-md text-stone-600 hover:text-ocean-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:text-ocean-400 dark:hover:bg-stone-600 transition-colors"
                                  aria-label={t('editRole')}
                                  title={t('editRole')}
                                >
                                  <Icon name="edit" size={18} />
                                </button>
                              </Show>

                              {/* Remove Member */}
                              <Show when={props.canRemoveMembers}>
                                <button
                                  onClick={() => handleRemove(member.userId)}
                                  class="p-2 rounded-md text-stone-600 hover:text-danger-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:text-danger-400 dark:hover:bg-stone-600 transition-colors"
                                  aria-label={t('remove')}
                                  title={t('remove')}
                                >
                                  <Icon name="trash" size={18} />
                                </button>
                              </Show>
                            </Show>
                          </div>
                        </td>
                      </Show>
                    </tr>
                  )}
                </For>
              </tbody>
            </table>
          </div>
        </Show>
      </Show>
    </div>
  );
};
