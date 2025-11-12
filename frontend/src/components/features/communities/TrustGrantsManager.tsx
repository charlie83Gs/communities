import { Component, For, Show, createSignal, createMemo, batch } from 'solid-js';
import { Button } from '@/components/common/Button';
import { CredentialedImage } from '@/components/common/CredentialedImage';
import { makeTranslator } from '@/i18n/makeTranslator';
import { trustGrantsManagerDict } from './TrustGrantsManager.i18n';
import { useCommunityMembersQuery } from '@/hooks/queries/useCommunityMembersQuery';
import { useCommunityTrustUsersQuery } from '@/hooks/queries/useCommunityTrustUsersQuery';
import { useAdminGrantsQuery, useSetAdminGrantMutation, useDeleteAdminGrantMutation } from '@/hooks/queries/useTrust';
import { createDebouncedSignal } from '@/utils/debounce';
import type { CommunityMember } from '@/types/community.types';
import type { TrustView, AdminTrustGrant } from '@/types/trust.types';

interface TrustGrantsManagerProps {
  communityId: string;
}

interface MemberWithTrust extends CommunityMember {
  trustView?: TrustView;
  adminGrant: number;
  peerAwards: number;
  totalPoints: number;
}

type SortField = 'name' | 'total' | 'peer' | 'grant';

export const TrustGrantsManager: Component<TrustGrantsManagerProps> = (props) => {
  const t = makeTranslator(trustGrantsManagerDict, 'trustGrantsManager');
  const baseUrl = import.meta.env.VITE_API_URL as string;

  const membersQuery = useCommunityMembersQuery(() => props.communityId);
  const trustUsersQuery = useCommunityTrustUsersQuery(() => props.communityId);
  const adminGrantsQuery = useAdminGrantsQuery(() => props.communityId);
  const setGrantMutation = useSetAdminGrantMutation();
  const deleteGrantMutation = useDeleteAdminGrantMutation();

  const [displaySearchTerm, debouncedSearchTerm, setSearchTerm] = createDebouncedSignal('', 300);
  const [sortField, setSortField] = createSignal<SortField>('name');
  const [pendingChanges, setPendingChanges] = createSignal<Record<string, number>>({});
  const [successMessage, setSuccessMessage] = createSignal<string | null>(null);
  const [errorMessage, setErrorMessage] = createSignal<string | null>(null);

  const showMessage = (message: string, isError = false) => {
    if (isError) {
      setErrorMessage(message);
      setTimeout(() => setErrorMessage(null), 5000);
    } else {
      setSuccessMessage(message);
      setTimeout(() => setSuccessMessage(null), 5000);
    }
  };

  const membersWithTrust = createMemo((): MemberWithTrust[] => {
    const members = membersQuery.data || [];
    const trustUsers = trustUsersQuery.data || [];
    const grants = adminGrantsQuery.data || [];

    return members.map((m) => {
      const trust = trustUsers.find((t: TrustView) => t.userId === m.userId);
      const grant = grants.find((g: AdminTrustGrant) => g.toUserId === m.userId);

      return {
        ...m,
        trustView: trust,
        adminGrant: grant?.trustAmount ?? 0,
        peerAwards: trust?.peerAwards ?? 0,
        totalPoints: trust?.points ?? 0,
      };
    });
  });

  const filteredAndSortedMembers = createMemo(() => {
    let result = membersWithTrust();

    // Filter by search term (using debounced value)
    const search = debouncedSearchTerm().toLowerCase();
    if (search) {
      result = result.filter((m) => {
        const name = m.displayName?.toLowerCase() || '';
        const email = m.email?.toLowerCase() || '';
        return name.includes(search) || email.includes(search);
      });
    }

    // Sort
    result = [...result].sort((a, b) => {
      switch (sortField()) {
        case 'name':
          return (a.displayName || a.email || '').localeCompare(b.displayName || b.email || '');
        case 'total':
          return b.totalPoints - a.totalPoints;
        case 'peer':
          return b.peerAwards - a.peerAwards;
        case 'grant':
          return b.adminGrant - a.adminGrant;
        default:
          return 0;
      }
    });

    return result;
  });

  const handleGrantChange = (userId: string, value: string) => {
    batch(() => {
      const numValue = parseInt(value, 10);
      if (isNaN(numValue) || numValue < 0) {
        setPendingChanges({ ...pendingChanges(), [userId]: 0 });
      } else {
        setPendingChanges({ ...pendingChanges(), [userId]: numValue });
      }
    });
  };

  const handleSaveGrant = async (userId: string) => {
    const amount = pendingChanges()[userId];
    if (amount === undefined) {
      showMessage(t('noChanges'), true);
      return;
    }

    try {
      await setGrantMutation.mutateAsync({
        communityId: props.communityId,
        toUserId: userId,
        amount,
      });

      // Remove from pending changes
      const newPending = { ...pendingChanges() };
      delete newPending[userId];
      setPendingChanges(newPending);

      showMessage(t('successSave'));
    } catch (error) {
      console.error('Failed to save grant:', error);
      showMessage(t('errorSave'), true);
    }
  };

  const handleDeleteGrant = async (userId: string) => {
    try {
      await deleteGrantMutation.mutateAsync({
        communityId: props.communityId,
        toUserId: userId,
      });

      // Remove from pending changes if exists
      const newPending = { ...pendingChanges() };
      delete newPending[userId];
      setPendingChanges(newPending);

      showMessage(t('successDelete'));
    } catch (error) {
      console.error('Failed to delete grant:', error);
      showMessage(t('errorDelete'), true);
    }
  };

  const getCurrentGrantValue = (member: MemberWithTrust) => {
    return pendingChanges()[member.userId] !== undefined
      ? pendingChanges()[member.userId]
      : member.adminGrant;
  };

  const hasPendingChange = (userId: string) => {
    return pendingChanges()[userId] !== undefined;
  };

  const isLoading = () => membersQuery.isLoading || trustUsersQuery.isLoading || adminGrantsQuery.isLoading;
  const hasError = () => membersQuery.isError || trustUsersQuery.isError || adminGrantsQuery.isError;

  return (
    <div class="p-6 bg-white dark:bg-stone-800 rounded-lg shadow border border-stone-200 dark:border-stone-700">
      <h2 class="text-2xl font-bold mb-4 text-stone-900 dark:text-stone-100">{t('title')}</h2>

      {/* Success/Error Messages */}
      <Show when={successMessage()}>
        <div class="mb-4 p-3 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
          {successMessage()}
        </div>
      </Show>
      <Show when={errorMessage()}>
        <div class="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded">
          {errorMessage()}
        </div>
      </Show>

      {/* Search and Sort Controls */}
      <div class="flex gap-4 mb-4">
        <input
          type="text"
          placeholder={t('searchPlaceholder')}
          value={displaySearchTerm()}
          onInput={(e) => setSearchTerm(e.currentTarget.value)}
          class="flex-1 px-4 py-2 border border-stone-300 dark:border-stone-600 rounded bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-ocean-500 dark:focus:ring-ocean-400"
        />
        <select
          value={sortField()}
          onChange={(e) => setSortField(e.currentTarget.value as SortField)}
          class="px-4 py-2 border border-stone-300 dark:border-stone-600 rounded bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-ocean-500 dark:focus:ring-ocean-400"
        >
          <option value="name">{t('sortByName')}</option>
          <option value="total">{t('sortByTotal')}</option>
          <option value="peer">{t('sortByPeer')}</option>
          <option value="grant">{t('sortByGrant')}</option>
        </select>
      </div>

      {/* Loading State */}
      <Show when={isLoading()}>
        <div class="text-center py-8 text-stone-500 dark:text-stone-400">{t('loading')}</div>
      </Show>

      {/* Error State */}
      <Show when={hasError()}>
        <div class="text-center py-8 text-red-500">{t('error')}</div>
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
                  <th class="text-center p-3 font-semibold text-stone-700 dark:text-stone-300">{t('totalTrust')}</th>
                  <th class="text-center p-3 font-semibold text-stone-700 dark:text-stone-300">{t('peerAwards')}</th>
                  <th class="text-center p-3 font-semibold text-stone-700 dark:text-stone-300">{t('adminGrant')}</th>
                  <th class="text-center p-3 font-semibold text-stone-700 dark:text-stone-300">{t('actions')}</th>
                </tr>
              </thead>
              <tbody>
                <For each={filteredAndSortedMembers()}>
                  {(member) => (
                    <tr class="border-b border-stone-200 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-700">
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
                          <div>
                            <div class="font-medium text-stone-900 dark:text-stone-100">
                              {member.displayName || member.email || member.userId}
                            </div>
                            <div class="text-sm text-stone-500 dark:text-stone-400">{member.email}</div>
                          </div>
                        </div>
                      </td>
                      <td class="p-3 text-center font-semibold text-stone-900 dark:text-stone-100">{member.totalPoints}</td>
                      <td class="p-3 text-center text-stone-600 dark:text-stone-400">{member.peerAwards}</td>
                      <td class="p-3">
                        <input
                          type="number"
                          min="0"
                          value={getCurrentGrantValue(member)}
                          onInput={(e) => handleGrantChange(member.userId, e.currentTarget.value)}
                          class={`w-24 px-3 py-1 border rounded text-center bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 ${
                            hasPendingChange(member.userId) ? 'border-yellow-500 dark:border-yellow-400 bg-yellow-50 dark:bg-yellow-900/30' : 'border-stone-300 dark:border-stone-600'
                          }`}
                          placeholder={t('grantPlaceholder')}
                        />
                      </td>
                      <td class="p-3">
                        <div class="flex gap-2 justify-center">
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleSaveGrant(member.userId)}
                            disabled={!hasPendingChange(member.userId) || setGrantMutation.isPending}
                            loading={setGrantMutation.isPending}
                          >
                            {t('save')}
                          </Button>
                          <Show when={member.adminGrant > 0}>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleDeleteGrant(member.userId)}
                              disabled={deleteGrantMutation.isPending}
                              loading={deleteGrantMutation.isPending}
                            >
                              {t('delete')}
                            </Button>
                          </Show>
                        </div>
                      </td>
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
