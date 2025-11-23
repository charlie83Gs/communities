import { Component, For, Show, createSignal, createMemo } from 'solid-js';
import { Title } from '@solidjs/meta';
import { A } from '@solidjs/router';
import { useAuth } from '@/hooks/useAuth';
import { useUserRequestsQuery, useIncomingRequestsQuery, usePoolDistributionRequestsQuery, useManageRequestMutations, useWealthQuery } from '@/hooks/queries/useWealth';
import type { WealthRequest, WealthRequestStatus, PoolDistributionRequest } from '@/types/wealth.types';

// Extended type for incoming requests that includes wealth title
type IncomingWealthRequest = WealthRequest & { wealthTitle?: string };
import { makeTranslator } from '@/i18n/makeTranslator';
import { myRequestsDict } from './my-requests.i18n';

const MyRequestsPage: Component = () => {
  const t = makeTranslator(myRequestsDict, 'myRequests');
  const { user } = useAuth();

  // State
  const [activeTab, setActiveTab] = createSignal<'outgoing' | 'incoming' | 'pool'>('outgoing');
  const [statusFilter, setStatusFilter] = createSignal<WealthRequestStatus | 'all'>('pending');
  const [message, setMessage] = createSignal<{ type: 'success' | 'error'; text: string } | null>(null);

  const statusesParam = createMemo(() => {
    const filter = statusFilter();
    if (filter === 'all') return undefined;
    return filter;
  });

  // Queries
  const myRequestsQuery = useUserRequestsQuery(statusesParam);
  const poolDistributionsQuery = usePoolDistributionRequestsQuery(statusesParam);
  const incomingRequestsQuery = useIncomingRequestsQuery(statusesParam);

  // Mutations
  const { accept: acceptMutation, reject: rejectMutation, cancel: cancelMutation, confirm: confirmMutation, fail: failMutation } = useManageRequestMutations();

  // Computed counts
  const outgoingCount = createMemo(() => myRequestsQuery.data?.length || 0);
  const incomingCount = createMemo(() => incomingRequestsQuery.data?.length || 0);
  const poolCount = createMemo(() => poolDistributionsQuery.data?.length || 0);

  // Message helpers
  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  // Handlers
  const handleCancel = async (req: WealthRequest) => {
    try {
      await cancelMutation.mutateAsync({ wealthId: req.wealthId, requestId: req.id });
      showMessage('success', t('cancelSuccess'));
      myRequestsQuery.refetch();
    } catch (e: any) {
      showMessage('error', e?.message ?? t('cancelError'));
    }
  };

  const handleAccept = async (req: WealthRequest) => {
    try {
      await acceptMutation.mutateAsync({ wealthId: req.wealthId, requestId: req.id });
      showMessage('success', t('acceptSuccess'));
      incomingRequestsQuery.refetch();
    } catch (e: any) {
      showMessage('error', e?.message ?? t('acceptError'));
    }
  };

  const handleReject = async (req: WealthRequest) => {
    try {
      await rejectMutation.mutateAsync({ wealthId: req.wealthId, requestId: req.id });
      showMessage('success', t('rejectSuccess'));
      incomingRequestsQuery.refetch();
    } catch (e: any) {
      showMessage('error', e?.message ?? t('rejectError'));
    }
  };

  const handleConfirm = async (req: WealthRequest | PoolDistributionRequest) => {
    try {
      await confirmMutation.mutateAsync({ wealthId: req.wealthId, requestId: req.id });
      showMessage('success', t('confirmSuccess'));
      myRequestsQuery.refetch();
      poolDistributionsQuery.refetch();
    } catch (e: any) {
      showMessage('error', e?.message ?? t('confirmError'));
    }
  };

  const handleFail = async (req: WealthRequest | PoolDistributionRequest) => {
    try {
      await failMutation.mutateAsync({ wealthId: req.wealthId, requestId: req.id });
      showMessage('success', t('failSuccess'));
      myRequestsQuery.refetch();
      poolDistributionsQuery.refetch();
    } catch (e: any) {
      showMessage('error', e?.message ?? t('failError'));
    }
  };

  // Status badge styling
  const getStatusClasses = (status: WealthRequestStatus): string => {
    switch (status) {
      case 'fulfilled':
        return 'bg-success-100 dark:bg-success-900 text-success-700 dark:text-success-300';
      case 'accepted':
        return 'bg-ocean-100 dark:bg-ocean-900 text-ocean-700 dark:text-ocean-300';
      case 'pending':
        return 'bg-warning-100 dark:bg-warning-900 text-warning-700 dark:text-warning-300';
      case 'failed':
      case 'rejected':
        return 'bg-danger-100 dark:bg-danger-900 text-danger-700 dark:text-danger-300';
      case 'cancelled':
        return 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400';
      default:
        return 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400';
    }
  };

  const getStatusLabel = (status: WealthRequestStatus): string => {
    switch (status) {
      case 'pending': return t('statusLabels.pending');
      case 'accepted': return t('statusLabels.accepted');
      case 'fulfilled': return t('statusLabels.fulfilled');
      case 'failed': return t('statusLabels.failed');
      case 'rejected': return t('statusLabels.rejected');
      case 'cancelled': return t('statusLabels.cancelled');
      default: return status;
    }
  };

  // Request item component for outgoing requests
  const OutgoingRequestItem = (props: { request: WealthRequest }) => {
    const wealthQuery = useWealthQuery(() => props.request.wealthId);

    return (
      <div class="p-3 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg">
        <div class="flex items-start justify-between gap-2 mb-2">
          <div class="flex-1 min-w-0">
            <Show when={!wealthQuery.isLoading && wealthQuery.data} fallback={
              <div class="text-sm text-stone-400 animate-pulse">Loading...</div>
            }>
              <A
                href={`/wealth/${props.request.wealthId}`}
                class="text-sm font-medium text-ocean-600 dark:text-ocean-400 hover:underline truncate block"
              >
                {wealthQuery.data!.title}
              </A>
            </Show>
          </div>
          <span class={`px-1.5 py-0.5 text-xs rounded ${getStatusClasses(props.request.status)}`}>
            {getStatusLabel(props.request.status)}
          </span>
        </div>

        <div class="text-xs text-stone-500 dark:text-stone-400 mb-2 space-y-0.5">
          <Show when={props.request.unitsRequested != null}>
            <div>{props.request.unitsRequested} {t('card.units')}</div>
          </Show>
          <div>{new Date(props.request.createdAt).toLocaleDateString()}</div>
        </div>

        <Show when={props.request.status === 'accepted'}>
          <div class="text-xs text-ocean-600 dark:text-ocean-400 mb-2">
            {t('card.acceptedHelperText')}
          </div>
        </Show>

        <div class="flex items-center gap-1.5">
          <Show when={props.request.status === 'pending'}>
            <button
              onClick={() => handleCancel(props.request)}
              disabled={cancelMutation.isPending}
              class="px-2 py-1 text-xs bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300 rounded hover:bg-stone-200 dark:hover:bg-stone-600 disabled:opacity-50"
            >
              {t('card.cancel')}
            </button>
          </Show>
          <Show when={props.request.status === 'accepted'}>
            <button
              onClick={() => handleConfirm(props.request)}
              disabled={confirmMutation.isPending}
              class="px-2 py-1 text-xs bg-ocean-600 text-white rounded hover:bg-ocean-700 disabled:opacity-50"
            >
              {t('card.confirmReceipt')}
            </button>
            <button
              onClick={() => handleFail(props.request)}
              disabled={failMutation.isPending}
              class="px-2 py-1 text-xs bg-danger-100 dark:bg-danger-900 text-danger-700 dark:text-danger-300 rounded hover:bg-danger-200 dark:hover:bg-danger-800 disabled:opacity-50"
            >
              {t('card.markAsFailed')}
            </button>
          </Show>
        </div>
      </div>
    );
  };

  // Request item component for incoming requests
  const IncomingRequestItem = (props: { request: IncomingWealthRequest }) => (
    <div class="p-3 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg">
      <div class="flex items-start justify-between gap-2 mb-2">
        <div class="flex-1 min-w-0">
          <A
            href={`/wealth/${props.request.wealthId}`}
            class="text-sm font-medium text-ocean-600 dark:text-ocean-400 hover:underline truncate block"
          >
            {props.request.wealthTitle}
          </A>
        </div>
        <span class={`px-1.5 py-0.5 text-xs rounded ${getStatusClasses(props.request.status)}`}>
          {getStatusLabel(props.request.status)}
        </span>
      </div>

      <div class="text-xs text-stone-500 dark:text-stone-400 mb-2 space-y-0.5">
        <Show when={props.request.requesterDisplayName}>
          <div>{t('card.requester')}: {props.request.requesterDisplayName}</div>
        </Show>
        <Show when={props.request.unitsRequested != null}>
          <div>{props.request.unitsRequested} {t('card.units')}</div>
        </Show>
        <div>{new Date(props.request.createdAt).toLocaleDateString()}</div>
      </div>

      <div class="flex items-center gap-1.5">
        <Show when={props.request.status === 'pending'}>
          <button
            onClick={() => handleAccept(props.request)}
            disabled={acceptMutation.isPending}
            class="px-2 py-1 text-xs bg-ocean-600 text-white rounded hover:bg-ocean-700 disabled:opacity-50"
          >
            {t('card.accept')}
          </button>
          <button
            onClick={() => handleReject(props.request)}
            disabled={rejectMutation.isPending}
            class="px-2 py-1 text-xs bg-danger-100 dark:bg-danger-900 text-danger-700 dark:text-danger-300 rounded hover:bg-danger-200 dark:hover:bg-danger-800 disabled:opacity-50"
          >
            {t('card.reject')}
          </button>
        </Show>
      </div>
    </div>
  );

  // Request item component for pool distributions
  const PoolRequestItem = (props: { request: PoolDistributionRequest }) => (
    <div class="p-3 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg">
      <div class="flex items-start justify-between gap-2 mb-2">
        <div class="flex-1 min-w-0">
          <A
            href={`/wealth/${props.request.wealthId}`}
            class="text-sm font-medium text-ocean-600 dark:text-ocean-400 hover:underline truncate block"
          >
            {props.request.wealthTitle}
          </A>
          <A
            href={`/community/pools/${props.request.sourcePoolId}`}
            class="text-xs text-forest-600 dark:text-forest-400 hover:underline"
          >
            {props.request.poolName}
          </A>
        </div>
        <span class={`px-1.5 py-0.5 text-xs rounded ${getStatusClasses(props.request.status)}`}>
          {getStatusLabel(props.request.status)}
        </span>
      </div>

      <div class="text-xs text-stone-500 dark:text-stone-400 mb-2 space-y-0.5">
        <Show when={props.request.unitsRequested != null}>
          <div>{props.request.unitsRequested} {t('card.units')}</div>
        </Show>
        <div>{new Date(props.request.createdAt).toLocaleDateString()}</div>
      </div>

      <Show when={props.request.status === 'accepted'}>
        <div class="text-xs text-ocean-600 dark:text-ocean-400 mb-2">
          {t('card.acceptedHelperText')}
        </div>
      </Show>

      <div class="flex items-center gap-1.5">
        <Show when={props.request.status === 'accepted'}>
          <button
            onClick={() => handleConfirm(props.request)}
            disabled={confirmMutation.isPending}
            class="px-2 py-1 text-xs bg-ocean-600 text-white rounded hover:bg-ocean-700 disabled:opacity-50"
          >
            {t('card.confirmReceipt')}
          </button>
          <button
            onClick={() => handleFail(props.request)}
            disabled={failMutation.isPending}
            class="px-2 py-1 text-xs bg-danger-100 dark:bg-danger-900 text-danger-700 dark:text-danger-300 rounded hover:bg-danger-200 dark:hover:bg-danger-800 disabled:opacity-50"
          >
            {t('card.markAsFailed')}
          </button>
        </Show>
      </div>
    </div>
  );

  return (
    <>
      <Title>{t('titleTag')}</Title>

      <div class="min-h-screen bg-stone-100 dark:bg-stone-900">
        {/* Compact Header with gradient */}
        <header class="h-12 bg-gradient-to-r from-ocean-100 to-forest-100 dark:from-ocean-900 dark:to-forest-900 border-b border-stone-200 dark:border-stone-700 px-4 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <h1 class="text-sm font-semibold text-stone-900 dark:text-stone-100">
              {t('title')}
            </h1>
          </div>
          {/* Status filter */}
          <select
            value={statusFilter()}
            onInput={(e) => setStatusFilter(e.currentTarget.value as WealthRequestStatus | 'all')}
            class="px-2 py-1 text-xs rounded border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-ocean-400"
          >
            <option value="all">{t('filter.all')}</option>
            <option value="pending">{t('filter.pending')}</option>
            <option value="accepted">{t('filter.accepted')}</option>
            <option value="fulfilled">{t('filter.fulfilled')}</option>
            <option value="rejected">{t('filter.rejected')}</option>
            <option value="cancelled">{t('filter.cancelled')}</option>
            <option value="failed">{t('filter.failed')}</option>
          </select>
        </header>

        {/* Message Toast */}
        <Show when={message()}>
          <div
            class={`fixed top-14 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded shadow-lg z-50 text-sm ${
              message()!.type === 'success'
                ? 'bg-success-100 dark:bg-success-900 text-success-800 dark:text-success-200'
                : 'bg-danger-100 dark:bg-danger-900 text-danger-800 dark:text-danger-200'
            }`}
          >
            {message()!.text}
          </div>
        </Show>

        {/* Tab Navigation - Desktop */}
        <div class="hidden sm:block border-b border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800">
          <div class="flex">
            <button
              onClick={() => setActiveTab('outgoing')}
              class={`flex-1 px-4 py-2 text-sm font-medium relative ${
                activeTab() === 'outgoing'
                  ? 'text-ocean-600 dark:text-ocean-400 border-b-2 border-ocean-600'
                  : 'text-stone-500 dark:text-stone-400'
              }`}
            >
              {t('sections.myRequests')}
              <Show when={outgoingCount() > 0}>
                <span class="ml-1 text-xs">({outgoingCount()})</span>
              </Show>
            </button>
            <button
              onClick={() => setActiveTab('incoming')}
              class={`flex-1 px-4 py-2 text-sm font-medium relative ${
                activeTab() === 'incoming'
                  ? 'text-ocean-600 dark:text-ocean-400 border-b-2 border-ocean-600'
                  : 'text-stone-500 dark:text-stone-400'
              }`}
            >
              {t('sections.incoming')}
              <Show when={incomingCount() > 0}>
                <span class="ml-1 text-xs">({incomingCount()})</span>
              </Show>
            </button>
            <button
              onClick={() => setActiveTab('pool')}
              class={`flex-1 px-4 py-2 text-sm font-medium relative ${
                activeTab() === 'pool'
                  ? 'text-ocean-600 dark:text-ocean-400 border-b-2 border-ocean-600'
                  : 'text-stone-500 dark:text-stone-400'
              }`}
            >
              {t('sections.fromPool')}
              <Show when={poolCount() > 0}>
                <span class="ml-1 text-xs">({poolCount()})</span>
              </Show>
            </button>
          </div>
        </div>

        {/* Tab Navigation - Mobile dropdown */}
        <div class="sm:hidden border-b border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 px-4 py-2">
          <select
            value={activeTab()}
            onInput={(e) => setActiveTab(e.currentTarget.value as 'outgoing' | 'incoming' | 'pool')}
            class="w-full px-3 py-2 text-sm rounded border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-ocean-400"
          >
            <option value="outgoing">
              {t('sections.myRequests')} {outgoingCount() > 0 ? `(${outgoingCount()})` : ''}
            </option>
            <option value="incoming">
              {t('sections.incoming')} {incomingCount() > 0 ? `(${incomingCount()})` : ''}
            </option>
            <option value="pool">
              {t('sections.fromPool')} {poolCount() > 0 ? `(${poolCount()})` : ''}
            </option>
          </select>
        </div>

        {/* Content */}
        <div class="p-4 h-[calc(100vh-48px-41px)] overflow-y-auto">
          {/* Outgoing Requests */}
          <Show when={activeTab() === 'outgoing'}>
            <Show when={myRequestsQuery.isLoading}>
              <div class="text-center py-8 text-sm text-stone-500 dark:text-stone-400">
                {t('loading')}
              </div>
            </Show>
            <Show when={!myRequestsQuery.isLoading}>
              <Show when={myRequestsQuery.data && myRequestsQuery.data.length > 0} fallback={
                <div class="text-center py-8 text-sm text-stone-500 dark:text-stone-400">
                  {t('noRequests')}
                </div>
              }>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  <For each={myRequestsQuery.data}>
                    {(req) => <OutgoingRequestItem request={req} />}
                  </For>
                </div>
              </Show>
            </Show>
          </Show>

          {/* Incoming Requests */}
          <Show when={activeTab() === 'incoming'}>
            <Show when={incomingRequestsQuery.isLoading}>
              <div class="text-center py-8 text-sm text-stone-500 dark:text-stone-400">
                {t('loading')}
              </div>
            </Show>
            <Show when={!incomingRequestsQuery.isLoading}>
              <Show when={incomingRequestsQuery.data && incomingRequestsQuery.data.length > 0} fallback={
                <div class="text-center py-8 text-sm text-stone-500 dark:text-stone-400">
                  {t('noIncomingRequests')}
                </div>
              }>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  <For each={incomingRequestsQuery.data}>
                    {(req) => <IncomingRequestItem request={req} />}
                  </For>
                </div>
              </Show>
            </Show>
          </Show>

          {/* Pool Distributions */}
          <Show when={activeTab() === 'pool'}>
            <Show when={poolDistributionsQuery.isLoading}>
              <div class="text-center py-8 text-sm text-stone-500 dark:text-stone-400">
                {t('loading')}
              </div>
            </Show>
            <Show when={!poolDistributionsQuery.isLoading}>
              <Show when={poolDistributionsQuery.data && poolDistributionsQuery.data.length > 0} fallback={
                <div class="text-center py-8 text-sm text-stone-500 dark:text-stone-400">
                  {t('noPoolRequests')}
                </div>
              }>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  <For each={poolDistributionsQuery.data}>
                    {(req) => <PoolRequestItem request={req} />}
                  </For>
                </div>
              </Show>
            </Show>
          </Show>
        </div>
      </div>
    </>
  );
};

export default MyRequestsPage;
