import { Component, For, Show, createSignal, createMemo } from 'solid-js';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { CredentialedImage } from '@/components/common/CredentialedImage';
import { useManageRequestMutations, useWealthRequestsQuery, useWealthQuery } from '@/hooks/queries/useWealth';
import { useUserQuery } from '@/hooks/queries/useUserQuery';
import { useNotificationsQuery } from '@/hooks/queries/useNotifications';
import { useMyTrustSummaryQuery } from '@/hooks/queries/useMyTrustSummaryQuery';
import { RequestMessageThread } from '@/components/features/wealth/RequestMessageThread';
import { SkillEndorsementModal } from '@/components/features/skills/SkillEndorsementModal';
import type { WealthRequest, WealthRequestStatus } from '@/types/wealth.types';
import type { SearchUser } from '@/types/user.types';
import { makeTranslator } from '@/i18n/makeTranslator';
import { wealthRequestsPanelDict } from '@/components/features/wealth/WealthRequestsPanel.i18n';

interface WealthRequestsPanelProps {
  wealthId: string;
  wealthOwnerId?: string;
  communityId?: string;
}

export const WealthRequestsPanel: Component<WealthRequestsPanelProps> = (props) => {
  const t = makeTranslator(wealthRequestsPanelDict, 'wealthRequestsPanel');

  const requests = useWealthRequestsQuery(() => props.wealthId);
  const wealthQuery = useWealthQuery(() => props.wealthId);
  const trustSummaryQuery = useMyTrustSummaryQuery(() => props.communityId);
  const { accept, reject, cancel } = useManageRequestMutations();
  const [error, setError] = createSignal<string | null>(null);
  const [statusFilter, setStatusFilter] = createSignal<WealthRequestStatus | 'all'>('all');
  // Track which request's messages are expanded
  const [expandedMessageId, setExpandedMessageId] = createSignal<string | null>(null);
  // Track endorsement modal state
  const [endorsementModalOpen, setEndorsementModalOpen] = createSignal(false);
  const [endorsementTargetUser, setEndorsementTargetUser] = createSignal<{ id: string; name: string } | null>(null);

  // Query for unread notifications to show activity indicators
  const notifications = useNotificationsQuery(
    () => props.communityId,
    () => true // unreadOnly
  );

  // Check if a request has unread messages
  const hasUnreadMessages = (requestId: string): boolean => {
    const notifs = notifications.data?.notifications || [];
    return notifs.some(
      n => n.type === 'wealth_request_message' &&
           n.resourceType === 'wealth_request' &&
           n.resourceId === requestId &&
           !n.isRead
    );
  };

  const toggleMessages = (requestId: string) => {
    setExpandedMessageId(prev => prev === requestId ? null : requestId);
  };

  const handleAccept = async (req: WealthRequest, requesterName: string) => {
    setError(null);
    try {
      await accept.mutateAsync({ wealthId: req.wealthId, requestId: req.id });
      requests.refetch();

      // Show endorsement modal if user has permission
      const canEndorse = trustSummaryQuery.data?.canAwardTrust || false;
      if (canEndorse && props.communityId) {
        setEndorsementTargetUser({ id: req.requesterId, name: requesterName });
        setEndorsementModalOpen(true);
      }
    } catch (e: any) {
      setError(e?.message ?? 'Failed to accept request');
    }
  };

  const handleReject = async (req: WealthRequest) => {
    setError(null);
    try {
      await reject.mutateAsync({ wealthId: req.wealthId, requestId: req.id });
      requests.refetch();
    } catch (e: any) {
      setError(e?.message ?? 'Failed to reject request');
    }
  };

  // Filter requests based on selected status
  const filteredRequests = createMemo(() => {
    const allRequests = requests.data as WealthRequest[] | undefined;
    if (!allRequests) return [];

    const filter = statusFilter();
    if (filter === 'all') return allRequests;

    return allRequests.filter(req => req.status === filter);
  });

  const getStatusBadgeVariant = (status: WealthRequestStatus): 'success' | 'warning' | 'danger' | 'secondary' | 'ocean' => {
    switch (status) {
      case 'fulfilled':
        return 'success';
      case 'accepted':
        return 'ocean';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'danger';
      case 'rejected':
      case 'cancelled':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const getStatusLabel = (status: WealthRequestStatus): string => {
    switch (status) {
      case 'pending':
        return t('statusLabels.pending');
      case 'accepted':
        return t('statusLabels.accepted');
      case 'fulfilled':
        return t('statusLabels.fulfilled');
      case 'failed':
        return t('statusLabels.failed');
      case 'rejected':
        return t('statusLabels.rejected');
      case 'cancelled':
        return t('statusLabels.cancelled');
      default:
        return status;
    }
  };

  return (
    <Card class="mt-3">
      <div class="p-4 space-y-3">
        <div class="flex items-center justify-between gap-4 flex-wrap">
          <h5 class="font-semibold">{t('title')}</h5>
          <div class="flex items-center gap-3 flex-1 justify-end">
            <div class="flex items-center gap-2">
              <label class="text-sm text-stone-700 dark:text-stone-300 whitespace-nowrap">
                {t('filterLabel')}:
              </label>
              <select
                class="border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded px-2 py-1 text-sm"
                value={statusFilter()}
                onInput={(e) => setStatusFilter((e.currentTarget as HTMLSelectElement).value as WealthRequestStatus | 'all')}
              >
                <option value="all">{t('filterOptions.all')}</option>
                <option value="pending">{t('filterOptions.pending')}</option>
                <option value="accepted">{t('filterOptions.accepted')}</option>
                <option value="fulfilled">{t('filterOptions.fulfilled')}</option>
                <option value="rejected">{t('filterOptions.rejected')}</option>
                <option value="cancelled">{t('filterOptions.cancelled')}</option>
                <option value="failed">{t('filterOptions.failed')}</option>
              </select>
            </div>
            <Show when={requests.isLoading}>
              <span class="text-sm text-stone-500 dark:text-stone-400">{t('loading')}</span>
            </Show>
          </div>
        </div>

        <Show when={error()}>
          <div class="text-sm text-red-600">{error()}</div>
        </Show>

        <Show when={requests.data && filteredRequests().length > 0} fallback={
          <div class="text-sm text-stone-500 dark:text-stone-400">{t('noRequests')}</div>
        }>
          <div class="divide-y">
            <For each={filteredRequests()}>
              {(req) => {
                const userQuery = useUserQuery(() => req.requesterId);
                const user = () => userQuery.data;
                const baseUrl = import.meta.env.VITE_API_URL as string;

                return (
                  <div class="py-3 space-y-3">
                    {/* User info row */}
                    <div class="flex items-center gap-3">
                      <Show when={!userQuery.isLoading}>
                        <Show when={user()?.profileImage}>
                          <CredentialedImage
                            src={`${baseUrl}/api/v1/images/${user()!.profileImage}`}
                            alt="Profile"
                            class="w-10 h-10 rounded-full object-cover flex-shrink-0"
                            fallbackText="?"
                          />
                        </Show>
                        <Show when={!user()?.profileImage}>
                          <div class="w-10 h-10 bg-stone-200 dark:bg-stone-700 rounded-full flex items-center justify-center flex-shrink-0">
                            {user()?.displayName?.charAt(0).toUpperCase() || '?'}
                          </div>
                        </Show>
                      </Show>
                      <Show when={userQuery.isLoading}>
                        <div class="w-10 h-10 bg-stone-200 dark:bg-stone-700 rounded-full animate-pulse flex-shrink-0"></div>
                      </Show>
                      <div class="min-w-0 flex-1">
                        <a href={`/users/${req.requesterId}`} class="font-medium hover:underline block truncate">
                          {user()?.displayName || req.requesterDisplayName || req.requesterId}
                        </a>
                        <p class="text-sm text-stone-500 dark:text-stone-400 truncate">{user()?.email || t('noEmail')}</p>
                      </div>
                      <Badge variant={getStatusBadgeVariant(req.status)} class="flex-shrink-0">
                        {getStatusLabel(req.status)}
                      </Badge>
                    </div>

                    {/* Request details */}
                    <Show when={req.message || req.unitsRequested != null}>
                      <div class="pl-13 space-y-1">
                        <Show when={req.message}>
                          <p class="text-sm text-stone-600 dark:text-stone-400 break-words">{req.message}</p>
                        </Show>
                        <Show when={req.unitsRequested != null}>
                          <p class="text-xs text-stone-500 dark:text-stone-400">{t('units').replace('{{units}}', String(req.unitsRequested))}</p>
                        </Show>
                      </div>
                    </Show>

                    {/* Action buttons */}
                    <Show when={req.status === 'pending'}>
                      <div class="flex flex-wrap gap-2 sm:pl-13">
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() => handleAccept(req, user()?.displayName || user()?.email || req.requesterDisplayName || 'User')}
                          disabled={accept.isPending || requests.isLoading || userQuery.isLoading}
                          class="flex-1 sm:flex-none"
                        >
                          {accept.isPending ? t('accepting') : t('accept')}
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleReject(req)}
                          disabled={reject.isPending || requests.isLoading || userQuery.isLoading}
                          class="flex-1 sm:flex-none"
                        >
                          {reject.isPending ? t('rejecting') : t('reject')}
                        </Button>
                      </div>
                    </Show>

                    {/* Messages toggle button */}
                    <div class="sm:pl-13">
                      <button
                        type="button"
                        onClick={() => toggleMessages(req.id)}
                        class="flex items-center gap-1 text-sm text-ocean-600 dark:text-ocean-400 hover:text-ocean-700 dark:hover:text-ocean-300"
                      >
                        <svg
                          class={`w-4 h-4 transition-transform ${expandedMessageId() === req.id ? 'rotate-90' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                        </svg>
                        {expandedMessageId() === req.id ? t('hideMessages') : t('showMessages')}
                        {/* Activity indicator for unread messages */}
                        <Show when={hasUnreadMessages(req.id)}>
                          <span class="ml-1 w-2 h-2 bg-ocean-500 rounded-full animate-pulse" title="New messages" />
                        </Show>
                      </button>
                    </div>

                    {/* Expandable message thread */}
                    <Show when={expandedMessageId() === req.id}>
                      <div class="mt-3 sm:pl-13 border-t border-stone-200 dark:border-stone-700 pt-3">
                        <RequestMessageThread
                          wealthId={props.wealthId}
                          requestId={req.id}
                          wealthOwnerId={props.wealthOwnerId || ''}
                          requestStatus={req.status}
                        />
                      </div>
                    </Show>
                  </div>
                );
              }}
            </For>
          </div>
        </Show>
      </div>

      {/* Skills Endorsement Modal */}
      <Show when={endorsementModalOpen() && endorsementTargetUser() && props.communityId}>
        <SkillEndorsementModal
          isOpen={endorsementModalOpen()}
          onClose={() => {
            setEndorsementModalOpen(false);
            setEndorsementTargetUser(null);
          }}
          userId={endorsementTargetUser()!.id}
          userName={endorsementTargetUser()!.name}
          communityId={props.communityId!}
          itemId={wealthQuery.data?.itemId}
          canEndorseSkills={trustSummaryQuery.data?.canAwardTrust || false}
        />
      </Show>
    </Card>
  );
};

export default WealthRequestsPanel;
