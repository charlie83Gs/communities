import { Component, For, Show, createSignal } from 'solid-js';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { CredentialedImage } from '@/components/common/CredentialedImage';
import { useManageRequestMutations, useWealthRequestsQuery } from '@/hooks/queries/useWealth';
import { useUserQuery } from '@/hooks/queries/useUserQuery';
import type { WealthRequest, WealthRequestStatus } from '@/types/wealth.types';
import type { SearchUser } from '@/types/user.types';
import { makeTranslator } from '@/i18n/makeTranslator';
import { wealthRequestsPanelDict } from '@/components/features/wealth/WealthRequestsPanel.i18n';

interface WealthRequestsPanelProps {
  wealthId: string;
}

export const WealthRequestsPanel: Component<WealthRequestsPanelProps> = (props) => {
  const t = makeTranslator(wealthRequestsPanelDict, 'wealthRequestsPanel');

  const requests = useWealthRequestsQuery(() => props.wealthId);
  const { accept, reject, cancel } = useManageRequestMutations();
  const [error, setError] = createSignal<string | null>(null);

  const handleAccept = async (req: WealthRequest) => {
    setError(null);
    try {
      await accept.mutateAsync({ wealthId: req.wealthId, requestId: req.id });
      requests.refetch();
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
        <div class="flex items-center justify-between">
          <h5 class="font-semibold">{t('title')}</h5>
          <Show when={requests.isLoading}><span class="text-sm text-stone-500 dark:text-stone-400">{t('loading')}</span></Show>
        </div>

        <Show when={error()}>
          <div class="text-sm text-red-600">{error()}</div>
        </Show>

        <Show when={requests.data && (requests.data as WealthRequest[]).length > 0} fallback={
          <div class="text-sm text-stone-500 dark:text-stone-400">{t('noRequests')}</div>
        }>
          <div class="divide-y">
            <For each={requests.data as WealthRequest[]}>
              {(req) => {
                const userQuery = useUserQuery(() => req.requesterId);
                const user = () => userQuery.data;
                const baseUrl = import.meta.env.VITE_API_URL as string;

                return (
                  <div class="py-3 flex items-start justify-between gap-4">
                    <div class="flex items-center gap-4 flex-1">
                      <Show when={!userQuery.isLoading}>
                        <Show when={user()?.profileImage}>
                          <CredentialedImage
                            src={`${baseUrl}/api/v1/images/${user()!.profileImage}`}
                            alt="Profile"
                            class="w-10 h-10 rounded-full object-cover"
                            fallbackText="?"
                          />
                        </Show>
                        <Show when={!user()?.profileImage}>
                          <div class="w-10 h-10 bg-stone-200 dark:bg-stone-700 rounded-full flex items-center justify-center">
                            {user()?.displayName?.charAt(0).toUpperCase() || '?'}
                          </div>
                        </Show>
                      </Show>
                      <Show when={userQuery.isLoading}>
                        <div class="w-10 h-10 bg-stone-200 dark:bg-stone-700 rounded-full animate-pulse"></div>
                      </Show>
                      <div class="min-w-0 flex-1">
                        <a href={`/users/${req.requesterId}`} class="font-medium hover:underline block truncate">
                          {user()?.displayName || req.requesterDisplayName || req.requesterId}
                        </a>
                        <p class="text-sm text-stone-500 dark:text-stone-400 truncate">{user()?.email || t('noEmail')}</p>
                      </div>
                    </div>
                    <div class="flex flex-col items-end gap-2 min-w-0 flex-shrink-0">
                      <Show when={req.message}>
                        <p class="text-sm text-stone-600 dark:text-stone-400 text-right max-w-xs break-words">{req.message}</p>
                      </Show>
                      <Show when={req.unitsRequested != null}>
                        <p class="text-xs text-stone-500 dark:text-stone-400">{t('units').replace('{{units}}', String(req.unitsRequested))}</p>
                      </Show>
                      <Badge variant={getStatusBadgeVariant(req.status)}>
                        {getStatusLabel(req.status)}
                      </Badge>
                      <Show when={req.status === 'pending'}>
                        <div class="flex gap-2">
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleAccept(req)}
                            disabled={accept.isPending || requests.isLoading || userQuery.isLoading}
                          >
                            {accept.isPending ? t('accepting') : t('accept')}
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => handleReject(req)}
                            disabled={reject.isPending || requests.isLoading || userQuery.isLoading}
                          >
                            {reject.isPending ? t('rejecting') : t('reject')}
                          </Button>
                        </div>
                      </Show>
                    </div>
                  </div>
                );
              }}
            </For>
          </div>
        </Show>
      </div>
    </Card>
  );
};

export default WealthRequestsPanel;