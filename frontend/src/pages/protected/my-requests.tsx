import { Component, For, Show, createSignal, createMemo } from 'solid-js';
import { Title } from '@solidjs/meta';
import { A } from '@solidjs/router';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Tabs } from '@/components/common/Tabs';
import { useUserRequestsQuery, useIncomingRequestsQuery, useManageRequestMutations, useWealthQuery } from '@/hooks/queries/useWealth';
import type { WealthRequest, WealthRequestStatus } from '@/types/wealth.types';
import { makeTranslator } from '@/i18n/makeTranslator';
import { myRequestsDict } from './my-requests.i18n';

const MyRequestsPage: Component = () => {
  const t = makeTranslator(myRequestsDict, 'myRequests');

  const [activeTab, setActiveTab] = createSignal<'my-requests' | 'incoming'>('my-requests');
  const [statusFilter, setStatusFilter] = createSignal<WealthRequestStatus | 'all'>('all');
  const [error, setError] = createSignal<string | null>(null);
  const [successMessage, setSuccessMessage] = createSignal<string | null>(null);

  const statusesParam = createMemo(() => {
    const filter = statusFilter();
    if (filter === 'all') return undefined;
    return filter;
  });

  const myRequestsQuery = useUserRequestsQuery(statusesParam);
  const incomingRequestsQuery = useIncomingRequestsQuery(statusesParam);
  const { accept: acceptMutation, reject: rejectMutation, cancel: cancelMutation, confirm: confirmMutation, fail: failMutation } = useManageRequestMutations();

  const tabs = [
    { id: 'my-requests', label: t('tabs.myRequests') },
    { id: 'incoming', label: t('tabs.incoming') },
  ];

  const handleCancel = async (req: WealthRequest) => {
    setError(null);
    setSuccessMessage(null);
    try {
      await cancelMutation.mutateAsync({ wealthId: req.wealthId, requestId: req.id });
      setSuccessMessage(t('cancelSuccess'));
      myRequestsQuery.refetch();
    } catch (e: any) {
      setError(e?.message ?? t('cancelError'));
    }
  };

  const handleAccept = async (req: WealthRequest) => {
    setError(null);
    setSuccessMessage(null);
    try {
      await acceptMutation.mutateAsync({ wealthId: req.wealthId, requestId: req.id });
      setSuccessMessage(t('acceptSuccess'));
      incomingRequestsQuery.refetch();
    } catch (e: any) {
      setError(e?.message ?? t('acceptError'));
    }
  };

  const handleReject = async (req: WealthRequest) => {
    setError(null);
    setSuccessMessage(null);
    try {
      await rejectMutation.mutateAsync({ wealthId: req.wealthId, requestId: req.id });
      setSuccessMessage(t('rejectSuccess'));
      incomingRequestsQuery.refetch();
    } catch (e: any) {
      setError(e?.message ?? t('rejectError'));
    }
  };

  const handleConfirm = async (req: WealthRequest) => {
    setError(null);
    setSuccessMessage(null);
    try {
      await confirmMutation.mutateAsync({ wealthId: req.wealthId, requestId: req.id });
      setSuccessMessage(t('confirmSuccess'));
      myRequestsQuery.refetch();
    } catch (e: any) {
      setError(e?.message ?? t('confirmError'));
    }
  };

  const handleFail = async (req: WealthRequest) => {
    setError(null);
    setSuccessMessage(null);
    try {
      await failMutation.mutateAsync({ wealthId: req.wealthId, requestId: req.id });
      setSuccessMessage(t('failSuccess'));
      myRequestsQuery.refetch();
    } catch (e: any) {
      setError(e?.message ?? t('failError'));
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
    <div class="p-4 max-w-6xl mx-auto space-y-4 min-h-screen bg-gradient-to-br from-ocean-50 via-stone-50 to-sky-100 dark:from-stone-900 dark:via-stone-800 dark:to-ocean-950">
      <Title>{t('titleTag')}</Title>

      <Card class="p-6">
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h1 class="text-2xl font-bold text-stone-900 dark:text-stone-100">{t('title')}</h1>
          </div>

          {/* Tabs */}
          <Tabs
            tabs={tabs}
            activeTab={activeTab()}
            onTabChange={(tabId) => setActiveTab(tabId as 'my-requests' | 'incoming')}
          />

          {/* Filter buttons */}
          <div class="flex flex-wrap gap-2">
            <Button
              variant={statusFilter() === 'all' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setStatusFilter('all')}
            >
              {t('filter.all')}
            </Button>
            <Button
              variant={statusFilter() === 'pending' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setStatusFilter('pending')}
            >
              {t('filter.pending')}
            </Button>
            <Button
              variant={statusFilter() === 'accepted' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setStatusFilter('accepted')}
            >
              {t('filter.accepted')}
            </Button>
            <Button
              variant={statusFilter() === 'rejected' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setStatusFilter('rejected')}
            >
              {t('filter.rejected')}
            </Button>
            <Button
              variant={statusFilter() === 'cancelled' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setStatusFilter('cancelled')}
            >
              {t('filter.cancelled')}
            </Button>
            <Button
              variant={statusFilter() === 'fulfilled' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setStatusFilter('fulfilled')}
            >
              {t('filter.fulfilled')}
            </Button>
            <Button
              variant={statusFilter() === 'failed' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setStatusFilter('failed')}
            >
              {t('filter.failed')}
            </Button>
          </div>

          {/* Messages */}
          <Show when={error()}>
            <div class="p-3 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded border border-red-300 dark:border-red-700">
              {error()}
            </div>
          </Show>
          <Show when={successMessage()}>
            <div class="p-3 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded border border-green-300 dark:border-green-700">
              {successMessage()}
            </div>
          </Show>

          {/* My Requests Tab */}
          <Show when={activeTab() === 'my-requests'}>
            <Show when={myRequestsQuery.isLoading}>
              <div class="text-stone-600 dark:text-stone-300">{t('loading')}</div>
            </Show>

            <Show when={!myRequestsQuery.isLoading}>
              <Show when={myRequestsQuery.data && myRequestsQuery.data.length > 0} fallback={
                <div class="text-center py-8 text-stone-500 dark:text-stone-400">
                  {t('noRequests')}
                </div>
              }>
                <div class="space-y-4">
                  <For each={myRequestsQuery.data}>
                    {(req) => {
                      const wealthQuery = useWealthQuery(() => req.wealthId);
                      const wealth = () => wealthQuery.data;

                      return (
                        <Card class="p-4">
                          <div class="space-y-3">
                            {/* Header with wealth title and status */}
                            <div class="flex items-start justify-between gap-4">
                              <div class="flex-1 min-w-0">
                                <Show when={!wealthQuery.isLoading && wealth()}>
                                  <A
                                    href={`/wealth/${req.wealthId}`}
                                    class="text-lg font-semibold text-ocean-600 dark:text-ocean-400 hover:underline block truncate"
                                  >
                                    {wealth()!.title}
                                  </A>
                                </Show>
                                <Show when={wealthQuery.isLoading}>
                                  <div class="text-lg font-semibold text-stone-600 dark:text-stone-400 animate-pulse">
                                    Loading...
                                  </div>
                                </Show>
                              </div>
                              <Badge variant={getStatusBadgeVariant(req.status)}>
                                {getStatusLabel(req.status)}
                              </Badge>
                            </div>

                            {/* Request details */}
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <Show when={req.message}>
                                <div>
                                  <p class="text-xs text-stone-500 dark:text-stone-400">{t('card.message')}</p>
                                  <p class="text-sm text-stone-700 dark:text-stone-300">{req.message}</p>
                                </div>
                              </Show>
                              <Show when={req.unitsRequested != null}>
                                <div>
                                  <p class="text-xs text-stone-500 dark:text-stone-400">{t('card.units')}</p>
                                  <p class="text-sm font-medium text-stone-900 dark:text-stone-100">{req.unitsRequested}</p>
                                </div>
                              </Show>
                              <div>
                                <p class="text-xs text-stone-500 dark:text-stone-400">{t('card.createdAt')}</p>
                                <p class="text-sm text-stone-700 dark:text-stone-300">
                                  {new Date(req.createdAt).toLocaleString()}
                                </p>
                              </div>
                            </div>

                            {/* Helper text for accepted requests */}
                            <Show when={req.status === 'accepted'}>
                              <div class="p-3 bg-ocean-50 dark:bg-ocean-900 rounded border border-ocean-200 dark:border-ocean-700">
                                <p class="text-sm text-ocean-800 dark:text-ocean-200">
                                  {t('card.acceptedHelperText')}
                                </p>
                              </div>
                            </Show>

                            {/* Actions */}
                            <div class="flex items-center gap-2 pt-2">
                              <A href={`/wealth/${req.wealthId}`}>
                                <Button variant="secondary" size="sm">
                                  {t('card.viewShare')}
                                </Button>
                              </A>
                              <Show when={req.status === 'pending'}>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() => handleCancel(req)}
                                  disabled={cancelMutation.isPending}
                                >
                                  {cancelMutation.isPending ? t('card.cancelling') : t('card.cancel')}
                                </Button>
                              </Show>
                              <Show when={req.status === 'accepted'}>
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => handleConfirm(req)}
                                  disabled={confirmMutation.isPending}
                                >
                                  {confirmMutation.isPending ? t('card.confirming') : t('card.confirmReceipt')}
                                </Button>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() => handleFail(req)}
                                  disabled={failMutation.isPending}
                                >
                                  {failMutation.isPending ? t('card.marking') : t('card.markAsFailed')}
                                </Button>
                              </Show>
                            </div>
                          </div>
                        </Card>
                      );
                    }}
                  </For>
                </div>
              </Show>
            </Show>
          </Show>

          {/* Incoming Requests Tab */}
          <Show when={activeTab() === 'incoming'}>
            <Show when={incomingRequestsQuery.isLoading}>
              <div class="text-stone-600 dark:text-stone-300">{t('loading')}</div>
            </Show>

            <Show when={!incomingRequestsQuery.isLoading}>
              <Show when={incomingRequestsQuery.data && incomingRequestsQuery.data.length > 0} fallback={
                <div class="text-center py-8 text-stone-500 dark:text-stone-400">
                  {t('noIncomingRequests')}
                </div>
              }>
                <div class="space-y-4">
                  <For each={incomingRequestsQuery.data}>
                    {(req) => {
                      return (
                        <Card class="p-4">
                          <div class="space-y-3">
                            {/* Header with wealth title and status */}
                            <div class="flex items-start justify-between gap-4">
                              <div class="flex-1 min-w-0">
                                <Show when={req.wealthTitle}>
                                  <A
                                    href={`/wealth/${req.wealthId}`}
                                    class="text-lg font-semibold text-ocean-600 dark:text-ocean-400 hover:underline block truncate"
                                  >
                                    {req.wealthTitle}
                                  </A>
                                </Show>
                              </div>
                              <Badge variant={getStatusBadgeVariant(req.status)}>
                                {getStatusLabel(req.status)}
                              </Badge>
                            </div>

                            {/* Request details */}
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <Show when={req.requesterDisplayName}>
                                <div>
                                  <p class="text-xs text-stone-500 dark:text-stone-400">{t('card.requester')}</p>
                                  <p class="text-sm font-medium text-stone-900 dark:text-stone-100">{req.requesterDisplayName}</p>
                                </div>
                              </Show>
                              <Show when={req.message}>
                                <div>
                                  <p class="text-xs text-stone-500 dark:text-stone-400">{t('card.message')}</p>
                                  <p class="text-sm text-stone-700 dark:text-stone-300">{req.message}</p>
                                </div>
                              </Show>
                              <Show when={req.unitsRequested != null}>
                                <div>
                                  <p class="text-xs text-stone-500 dark:text-stone-400">{t('card.units')}</p>
                                  <p class="text-sm font-medium text-stone-900 dark:text-stone-100">{req.unitsRequested}</p>
                                </div>
                              </Show>
                              <div>
                                <p class="text-xs text-stone-500 dark:text-stone-400">{t('card.createdAt')}</p>
                                <p class="text-sm text-stone-700 dark:text-stone-300">
                                  {new Date(req.createdAt).toLocaleString()}
                                </p>
                              </div>
                            </div>

                            {/* Actions */}
                            <div class="flex items-center gap-2 pt-2">
                              <A href={`/wealth/${req.wealthId}`}>
                                <Button variant="secondary" size="sm">
                                  {t('card.viewShare')}
                                </Button>
                              </A>
                              <Show when={req.status === 'pending'}>
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => handleAccept(req)}
                                  disabled={acceptMutation.isPending}
                                >
                                  {acceptMutation.isPending ? t('card.accepting') : t('card.accept')}
                                </Button>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() => handleReject(req)}
                                  disabled={rejectMutation.isPending}
                                >
                                  {rejectMutation.isPending ? t('card.rejecting') : t('card.reject')}
                                </Button>
                              </Show>
                            </div>
                          </div>
                        </Card>
                      );
                    }}
                  </For>
                </div>
              </Show>
            </Show>
          </Show>
        </div>
      </Card>
    </div>
  );
};

export default MyRequestsPage;
