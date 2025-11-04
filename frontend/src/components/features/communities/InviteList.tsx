import { Component, For, Show, createMemo } from 'solid-js';
import { useCommunity } from '@/contexts/CommunityContext';
import { useCommunityUserInvitesQuery } from '@/hooks/queries/useCommunityUserInvitesQuery';
import { useCancelInviteMutation } from '@/hooks/queries/useCancelInviteMutation';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import type { CommunityInvite } from '@/types/community.types';
import { usersService } from '@/services/api/users.service';
import { createQuery } from '@tanstack/solid-query';
import type { SearchUser } from '@/types/user.types';
import { makeTranslator } from '@/i18n/makeTranslator';
import { inviteListDict } from './InviteList.i18n';

interface InviteListProps {
  communityId: string;
}

const InviteList: Component<InviteListProps> = (props) => {
  const t = makeTranslator(inviteListDict, 'inviteList');

  const { isAdmin } = useCommunity();
  const invitesQuery = useCommunityUserInvitesQuery(() => props.communityId);
  const cancelMutation = useCancelInviteMutation();

  const pendingInvites = createMemo(() =>
    invitesQuery.data?.filter(invite => invite.status === 'pending') || []
  );

  // No need for getUserQuery function, we'll create queries inline

  const handleCancel = (invite: CommunityInvite) => {
    if (confirm(t('confirmCancel').replace('{{user}}', String(invite.invitedUserId)))) {
      cancelMutation.mutate(invite.id, {
        onSuccess: () => {
          invitesQuery.refetch();
        },
      });
    }
  };

  return (
    <Show when={isAdmin()}>
      <Card class="max-w-5xl mx-auto">
        <div class="p-6">
          <h2 class="text-2xl font-bold mb-4 text-stone-900 dark:text-stone-100">{t('title')}</h2>
          <Show when={!invitesQuery.isLoading} fallback={<div>{t('loadingInvites')}</div>}>
            <Show when={pendingInvites().length > 0}>
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-stone-200 dark:divide-stone-700">
                  <thead class="bg-stone-50 dark:bg-stone-800">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">{t('thUser')}</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">{t('thRole')}</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">{t('thCreated')}</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">{t('thActions')}</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white dark:bg-stone-800 divide-y divide-stone-200 dark:divide-stone-700">
                    <For each={pendingInvites()}>
                      {(invite) => {
                        const userQuery = createQuery(() => ({
                          queryKey: ['user', invite.invitedUserId],
                          queryFn: () => usersService.getUser(invite.invitedUserId!),
                          enabled: !!invite.invitedUserId,
                        }));

                        return (
                          <tr>
                            <td class="px-6 py-4 whitespace-nowrap">
                              <div class="text-sm font-medium text-stone-900 dark:text-stone-100">
                                <Show when={userQuery.isSuccess && userQuery.data}>
                                  <div>
                                    <div class="text-sm font-medium text-stone-900 dark:text-stone-100">{userQuery.data?.displayName || userQuery.data?.username}</div>
                                    <div class="text-sm text-stone-500 dark:text-stone-400">{userQuery.data?.username}</div>
                                  </div>
                                </Show>
                                <Show when={userQuery.isLoading}>
                                  <div class="text-sm text-stone-500 dark:text-stone-400">{t('loadingUser')}</div>
                                </Show>
                                <Show when={userQuery.isError}>
                                  <div class="text-sm text-red-500 dark:text-red-400">{t('errorUser')}</div>
                                </Show>
                              </div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                              <Badge variant="secondary">{invite.role}</Badge>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-stone-500 dark:text-stone-400">
                              {new Date(invite.createdAt).toLocaleDateString()}
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleCancel(invite)}
                                disabled={cancelMutation.isPending}
                              >
                                {t('cancel')}
                              </Button>
                            </td>
                          </tr>
                        );
                      }}
                    </For>
                  </tbody>
                </table>
              </div>
            </Show>
            <Show when={pendingInvites().length === 0}>
              <p class="text-stone-500 dark:text-stone-400">{t('empty')}</p>
            </Show>
          </Show>
        </div>
      </Card>
    </Show>
  );
};

export default InviteList;