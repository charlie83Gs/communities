import { Component, For, Show, createMemo } from 'solid-js';
import { useCommunity } from '@/contexts/CommunityContext';
import { useCommunityLinkInvitesQuery } from '@/hooks/queries/useCommunityLinkInvitesQuery';
import { useCancelInviteMutation } from '@/hooks/queries/useCancelInviteMutation';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import type { CommunityInvite } from '@/types/community.types';
import { makeTranslator } from '@/i18n/makeTranslator';
import { inviteLinksListDict } from './InviteLinksList.i18n';

interface InviteLinksListProps {
  communityId: string;
}

const InviteLinksList: Component<InviteLinksListProps> = (props) => {
  const t = makeTranslator(inviteLinksListDict, 'inviteLinksList');

  const { isAdmin } = useCommunity();
  const invitesQuery = useCommunityLinkInvitesQuery(() => props.communityId);
  const cancelMutation = useCancelInviteMutation();

  const activeInvites = createMemo(() => 
    invitesQuery.data?.filter(invite => invite.status === 'pending') || []
  );

  const handleCancel = (invite: CommunityInvite) => {
    if (confirm(t('cancelConfirm').replace('{{secret}}', invite.secret?.slice(-4) || ''))) {
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
          <Show when={!invitesQuery.isLoading} fallback={<div>{t('loading')}</div>}>
            <Show when={activeInvites().length > 0}>
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-stone-200 dark:divide-stone-700">
                  <thead class="bg-stone-50 dark:bg-stone-800">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">{t('titleCol')}</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">{t('linkSecretCol')}</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">{t('roleCol')}</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">{t('expiresCol')}</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">{t('createdCol')}</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">{t('actionsCol')}</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white dark:bg-stone-800 divide-y divide-stone-200 dark:divide-stone-700">
                    <For each={activeInvites()}>
                      {(invite) => (
                        <tr>
                          <td class="px-6 py-4 whitespace-nowrap">
                            <div class="text-sm font-medium text-stone-900 dark:text-stone-100">
                              {invite.title || t('untitled')}
                            </div>
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap">
                            <div class="text-sm font-medium text-stone-900 dark:text-stone-100">
                              {invite.secret ? `*******${invite.secret.slice(-4)}` : 'N/A'}
                            </div>
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap">
                            <Badge variant="secondary">{invite.role}</Badge>
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap text-sm text-stone-500 dark:text-stone-400">
                            {invite.expiresAt ? new Date(invite.expiresAt).toLocaleDateString() : t('noExpiration')}
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
                      )}
                    </For>
                  </tbody>
                </table>
              </div>
            </Show>
            <Show when={activeInvites().length === 0}>
              <p class="text-stone-500 dark:text-stone-400">{t('noInvites')}</p>
            </Show>
          </Show>
        </div>
      </Card>
    </Show>
  );
};

export default InviteLinksList;