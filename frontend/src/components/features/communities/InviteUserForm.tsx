import { Component, createSignal, Show, For, createMemo } from 'solid-js';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { useInviteUserMutation } from '@/hooks/queries/useInviteUserMutation';
import { useSearchUsersQuery } from '@/hooks/queries/useSearchUsersQuery';
import { useCommunityMembersQuery } from '@/hooks/queries/useCommunityMembersQuery';
import { useCommunityUserInvitesQuery } from '@/hooks/queries/useCommunityUserInvitesQuery';
import { makeTranslator } from '@/i18n/makeTranslator';
import { inviteUserFormDict } from './InviteUserForm.i18n';
import { createDebouncedSignal } from '@/utils/debounce';
import type { CreateUserInviteDto } from '@/types/community.types';
import type { SearchUser } from '@/types/user.types';

interface InviteUserFormProps {
  communityId: string;
  onSuccess?: () => void;
}

export const InviteUserForm: Component<InviteUserFormProps> = (props) => {
  const t = makeTranslator(inviteUserFormDict, 'inviteUserForm');

  const [displayQuery, debouncedQuery, setSearchQuery] = createDebouncedSignal<string>('', 300);
  const [selectedUser, setSelectedUser] = createSignal<SearchUser | null>(null);
  const [role, setRole] = createSignal<'member' | 'admin'>('member');
  const inviteMutation = useInviteUserMutation();

  const searchQueryResult = useSearchUsersQuery(() => ({ q: debouncedQuery() }));
  const membersQuery = useCommunityMembersQuery(() => props.communityId);
  const invitesQuery = useCommunityUserInvitesQuery(() => props.communityId);

  const handleSearchInput = (e: InputEvent) => {
    const value = (e.currentTarget as HTMLInputElement).value;
    setSearchQuery(value);
    if (selectedUser()) {
      setSelectedUser(null); // Clear selection if typing again
    }
  };

  const handleUserSelect = (user: SearchUser) => {
    setSelectedUser(user);
    // Note: We don't populate the input to avoid confusion with debounced search
  };

  // Check if the selected user already has the selected role as a member
  const userCurrentRoles = createMemo(() => {
    const user = selectedUser();
    if (!user) return [];
    const member = membersQuery.data?.find(m => m.userId === user.id);
    return member?.roles || [];
  });

  // Check if the selected user has a pending invite with the selected role
  const userPendingInvites = createMemo(() => {
    const user = selectedUser();
    if (!user) return [];
    const invites = invitesQuery.data?.filter(
      inv => inv.invitedUserId === user.id && inv.status === 'pending'
    ) || [];
    return invites.map(inv => inv.role);
  });

  // Check if the selected role is already assigned (as member or pending invite)
  const hasRoleAlready = createMemo(() => {
    const selectedRole = role();
    return userCurrentRoles().includes(selectedRole) || userPendingInvites().includes(selectedRole);
  });

  // Get validation message
  const validationMessage = createMemo(() => {
    const selectedRole = role();
    if (userCurrentRoles().includes(selectedRole)) {
      return t('alreadyHasRole').replace('{{role}}', selectedRole);
    }
    if (userPendingInvites().includes(selectedRole)) {
      return t('pendingInviteExists').replace('{{role}}', selectedRole);
    }
    return '';
  });

  const handleInvite = () => {
    // Prevent double submission
    if (inviteMutation.isPending) {
      console.warn('[InviteUserForm] Attempted to submit while mutation is pending');
      return;
    }
    if (!selectedUser() || hasRoleAlready()) return;

    const data: CreateUserInviteDto = {
      invitedUserId: selectedUser()!.id,
      role: role(),
    };

    console.log('[InviteUserForm] Submitting invite:', data);
    inviteMutation.mutate(
      { communityId: props.communityId, data },
      {
        onSuccess: () => {
          console.log('[InviteUserForm] Invite creation successful');
          // Clear form after successful submission
          setSelectedUser(null);
          setSearchQuery('');
          setRole('member');
          // Call parent onSuccess callback if provided
          if (props.onSuccess) {
            props.onSuccess();
          }
        },
        onError: (error) => {
          console.error('[InviteUserForm] Invite creation failed:', error);
        },
      }
    );
  };

  return (
    <div class="p-4 border border-stone-200 dark:border-stone-700 rounded-lg bg-white dark:bg-stone-800">
      <h3 class="font-semibold mb-4 text-stone-900 dark:text-stone-100">{t('title')}</h3>
      <div class="space-y-3 relative">
        <Input
          placeholder={t('searchPlaceholder')}
          value={displayQuery()}
          onInput={handleSearchInput}
        />
        <Show when={displayQuery() && !selectedUser()}>
          <div class="absolute z-10 w-full bg-white dark:bg-stone-700 border border-stone-200 dark:border-stone-600 rounded mt-1 max-h-60 overflow-y-auto">
            <Show when={searchQueryResult.isLoading}>
              <div class="p-2 text-stone-500 dark:text-stone-400 text-sm">{t('searching')}</div>
            </Show>
            <Show when={!searchQueryResult.isLoading && searchQueryResult.data}>
              <For each={searchQueryResult.data}>
                {(user) => (
                  <div
                    class="p-2 hover:bg-stone-100 dark:hover:bg-stone-600 cursor-pointer border-b border-stone-200 dark:border-stone-600 last:border-b-0"
                    onClick={() => handleUserSelect(user)}
                  >
                    <div class="font-medium text-stone-900 dark:text-stone-100">{user.displayName}</div>
                    <div class="text-sm text-stone-600 dark:text-stone-400">{user.username}</div>
                  </div>
                )}
              </For>
            </Show>
            <Show when={!searchQueryResult.isLoading && !searchQueryResult.data?.length}>
              <div class="p-2 text-stone-500 dark:text-stone-400 text-sm">{t('noResults')}</div>
            </Show>
          </div>
        </Show>
        <Show when={selectedUser()}>
          <div class="space-y-2">
            <p class="text-sm text-stone-600 dark:text-stone-400">
              {t('selectedLabel')}: {selectedUser()!.displayName} ({selectedUser()!.username})
            </p>
            <Show when={userCurrentRoles().length > 0}>
              <p class="text-sm text-blue-600 dark:text-blue-400">
                {t('currentRoles')}: {userCurrentRoles().join(', ')}
              </p>
            </Show>
            <Show when={userPendingInvites().length > 0}>
              <p class="text-sm text-orange-600 dark:text-orange-400">
                {t('pendingRoles')}: {userPendingInvites().join(', ')}
              </p>
            </Show>
          </div>
        </Show>
        <select
          value={role()}
          onChange={(e) => setRole(e.currentTarget.value as 'member' | 'admin')}
          class="w-full p-2 border border-stone-300 dark:border-stone-600 rounded bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-ocean-500 dark:focus:ring-ocean-400"
          disabled={!selectedUser()}
        >
          <option value="member">{t('roleMember')}</option>
          <option value="admin">{t('roleAdmin')}</option>
        </select>

        <Show when={hasRoleAlready() && selectedUser()}>
          <p class="text-yellow-600 dark:text-yellow-400 text-sm font-medium bg-yellow-50 dark:bg-yellow-900/30 p-2 rounded border border-yellow-200 dark:border-yellow-700">
            {validationMessage()}
          </p>
        </Show>

        <Button
          onClick={handleInvite}
          disabled={inviteMutation.isPending || !selectedUser() || hasRoleAlready()}
        >
          {inviteMutation.isPending ? t('sending') : t('send')}
        </Button>

        <Show when={searchQueryResult.isError}>
          <p class="text-red-500 text-sm">{t('searchError')}</p>
        </Show>
        <Show when={inviteMutation.isError}>
          <p class="text-red-500 text-sm">
            {t('errorPrefix')} {inviteMutation.error?.message}
          </p>
        </Show>
        <Show when={inviteMutation.isSuccess}>
          <p class="text-green-500 text-sm">{t('success')}</p>
        </Show>
      </div>
    </div>
  );
};
