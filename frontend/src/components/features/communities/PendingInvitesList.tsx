import { Component, For, Show, createSignal, createMemo } from 'solid-js';
import { createQuery } from '@tanstack/solid-query';
import { useCommunityUserInvitesQuery } from '@/hooks/queries/useCommunityUserInvitesQuery';
import { useCommunityLinkInvitesQuery } from '@/hooks/queries/useCommunityLinkInvitesQuery';
import { useCancelInviteMutation } from '@/hooks/queries/useCancelInviteMutation';
import { usersService } from '@/services/api/users.service';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { makeTranslator } from '@/i18n/makeTranslator';
import { pendingInvitesListDict } from './PendingInvitesList.i18n';
import type { CommunityInvite } from '@/types/community.types';

interface PendingInvitesListProps {
  communityId: string;
}

interface CombinedInvite extends CommunityInvite {
  inviteType: 'user' | 'link';
}

const getRelativeTime = (date: Date): string => {
  const now = Date.now();
  const diff = now - date.getTime();
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor(diff / 60000);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'just now';
};

const getExpiresIn = (date: Date | null | undefined): string => {
  if (!date) return '—';
  const dateObj = date instanceof Date ? date : new Date(date);
  const diff = dateObj.getTime() - Date.now();
  if (diff < 0) return 'expired';
  const days = Math.ceil(diff / 86400000);
  if (days === 0) return 'today';
  if (days === 1) return 'tomorrow';
  return `in ${days}d`;
};

export const PendingInvitesList: Component<PendingInvitesListProps> = (props) => {
  const t = makeTranslator(pendingInvitesListDict, 'pendingInvitesList');
  const [copiedId, setCopiedId] = createSignal<string | null>(null);

  const userInvitesQuery = useCommunityUserInvitesQuery(() => props.communityId);
  const linkInvitesQuery = useCommunityLinkInvitesQuery(() => props.communityId);
  const cancelMutation = useCancelInviteMutation();

  const pendingUserInvites = createMemo(() =>
    (userInvitesQuery.data?.filter(invite => invite.status === 'pending') || []).map(inv => ({
      ...inv,
      inviteType: 'user' as const,
    }))
  );

  const pendingLinkInvites = createMemo(() =>
    (linkInvitesQuery.data?.filter(invite => invite.status === 'pending') || []).map(inv => ({
      ...inv,
      inviteType: 'link' as const,
    }))
  );

  const combinedInvites = createMemo(() => {
    const all: CombinedInvite[] = [...pendingUserInvites(), ...pendingLinkInvites()];
    // Sort by created date, newest first
    return all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  });

  const userCount = createMemo(() => pendingUserInvites().length);
  const linkCount = createMemo(() => pendingLinkInvites().length);
  const isLoading = () => userInvitesQuery.isLoading || linkInvitesQuery.isLoading;

  const copyToClipboard = async (text: string, inviteId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(inviteId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleCancel = (invite: CombinedInvite, displayName?: string) => {
    let confirmMessage: string;
    if (invite.inviteType === 'user') {
      confirmMessage = t('confirmCancelUser').replace('{{user}}', displayName || String(invite.invitedUserId));
    } else {
      confirmMessage = t('confirmCancelLink').replace('{{secret}}', invite.secret?.slice(-4) || '');
    }

    if (confirm(confirmMessage)) {
      cancelMutation.mutate(invite.id);
    }
  };

  const getTitle = () => {
    if (userCount() === 0 && linkCount() === 0) {
      return t('title');
    }
    return t('titleWithCounts')
      .replace('{{userCount}}', String(userCount()))
      .replace('{{linkCount}}', String(linkCount()));
  };

  return (
    <Card>
      <div class="p-6">
        <h2 class="text-xl font-bold mb-4 text-stone-900 dark:text-stone-100">
          {getTitle()}
        </h2>

        <Show when={!isLoading()} fallback={<div class="text-stone-500 dark:text-stone-400">{t('loading')}</div>}>
          <Show
            when={combinedInvites().length > 0}
            fallback={
              <div class="text-center py-8">
                <div class="text-4xl mb-2">📭</div>
                <p class="text-stone-600 dark:text-stone-400 font-medium">{t('empty')}</p>
                <p class="text-sm text-stone-500 dark:text-stone-500">{t('emptyDescription')}</p>
              </div>
            }
          >
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-stone-200 dark:divide-stone-700">
                <thead class="bg-stone-50 dark:bg-stone-800">
                  <tr>
                    <th class="px-4 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                      {t('thType')}
                    </th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                      {t('thTarget')}
                    </th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                      {t('thRole')}
                    </th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                      {t('thCreated')}
                    </th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                      {t('thExpires')}
                    </th>
                    <th class="px-4 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                      {t('thActions')}
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white dark:bg-stone-800 divide-y divide-stone-200 dark:divide-stone-700">
                  <For each={combinedInvites()}>
                    {(invite) => {
                      // For user invites, fetch user info
                      const userQuery = invite.inviteType === 'user'
                        ? createQuery(() => ({
                            queryKey: ['user', invite.invitedUserId],
                            queryFn: () => usersService.getUser(invite.invitedUserId!),
                            enabled: !!invite.invitedUserId,
                          }))
                        : null;

                      return (
                        <tr>
                          {/* Type Icon */}
                          <td class="px-4 py-4 whitespace-nowrap">
                            <span class="text-lg" title={invite.inviteType === 'user' ? 'User invite' : 'Link invite'}>
                              {invite.inviteType === 'user' ? '👤' : '🔗'}
                            </span>
                          </td>

                          {/* Target / Title */}
                          <td class="px-4 py-4 whitespace-nowrap">
                            <Show when={invite.inviteType === 'user' && userQuery}>
                              <Show when={userQuery!.isSuccess && userQuery!.data}>
                                <div>
                                  <div class="text-sm font-medium text-stone-900 dark:text-stone-100">
                                    {userQuery!.data?.displayName || userQuery!.data?.username}
                                  </div>
                                  <div class="text-sm text-stone-500 dark:text-stone-400">
                                    {userQuery!.data?.username}
                                  </div>
                                </div>
                              </Show>
                              <Show when={userQuery!.isLoading}>
                                <div class="text-sm text-stone-500 dark:text-stone-400">{t('loadingUser')}</div>
                              </Show>
                              <Show when={userQuery!.isError}>
                                <div class="text-sm text-red-500 dark:text-red-400">{t('errorUser')}</div>
                              </Show>
                            </Show>
                            <Show when={invite.inviteType === 'link'}>
                              <div class="text-sm font-medium text-stone-900 dark:text-stone-100">
                                {invite.title || t('untitled')}
                              </div>
                            </Show>
                          </td>

                          {/* Role */}
                          <td class="px-4 py-4 whitespace-nowrap">
                            <Badge variant="secondary">{invite.role}</Badge>
                          </td>

                          {/* Created */}
                          <td class="px-4 py-4 whitespace-nowrap text-sm text-stone-500 dark:text-stone-400">
                            {getRelativeTime(new Date(invite.createdAt))}
                          </td>

                          {/* Expires */}
                          <td class="px-4 py-4 whitespace-nowrap text-sm text-stone-500 dark:text-stone-400">
                            {invite.inviteType === 'user' ? '—' : getExpiresIn(invite.expiresAt)}
                          </td>

                          {/* Actions */}
                          <td class="px-4 py-4 whitespace-nowrap text-sm font-medium">
                            <div class="flex gap-2">
                              <Show when={invite.inviteType === 'link' && invite.secret}>
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => copyToClipboard(
                                    `${window.location.origin}/invite/${invite.secret}`,
                                    invite.id
                                  )}
                                >
                                  {copiedId() === invite.id ? t('copied') : t('copy')}
                                </Button>
                              </Show>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleCancel(
                                  invite,
                                  invite.inviteType === 'user' && userQuery?.data
                                    ? userQuery.data.displayName || userQuery.data.username
                                    : undefined
                                )}
                                disabled={cancelMutation.isPending}
                              >
                                {t('cancel')}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    }}
                  </For>
                </tbody>
              </table>
            </div>
          </Show>
        </Show>
      </div>
    </Card>
  );
};
