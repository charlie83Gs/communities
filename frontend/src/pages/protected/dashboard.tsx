import { Component, createSignal, createMemo, Show, For } from 'solid-js';
import { Title } from '@solidjs/meta';
import { A } from '@solidjs/router';
import { useQueryClient } from '@tanstack/solid-query';
import { useDashboardSummaryQuery } from '@/hooks/queries/useDashboardSummary';
import { useManageRequestMutations } from '@/hooks/queries/useWealth';
import { useRedeemInviteMutation } from '@/hooks/queries/useRedeemInviteMutation';
import { useMarkAsReadMutation } from '@/hooks/queries/useNotifications';
import { useCreateCommunity } from '@/hooks/queries/useCreateCommunity';
import { useAuth } from '@/hooks/useAuth';
import { CreateCommunityForm } from '@/components/features/communities/CreateCommunityForm';
import { Button } from '@/components/common/Button';
import { makeTranslator } from '@/i18n/makeTranslator';
import { dashboardDict } from './dashboard.i18n';
import { InfoTooltip } from '@/components/common/InfoTooltip';
import type {
  DashboardCommunitySummary,
  DashboardIncomingRequest,
  DashboardAcceptedOutgoing,
  DashboardPoolDistribution,
  DashboardInvite,
  DashboardNotification,
} from '@/types/user.types';

const Dashboard: Component = () => {
  const t = makeTranslator(dashboardDict, 'dashboard');
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // State
  const [activeTab, setActiveTab] = createSignal<'communities' | 'activity'>('communities');
  const [showCreateModal, setShowCreateModal] = createSignal(false);
  const [invitesExpanded, setInvitesExpanded] = createSignal(false);
  const [message, setMessage] = createSignal<{ type: 'success' | 'error'; text: string } | null>(null);
  const [searchQuery, setSearchQuery] = createSignal('');

  // Queries
  const summaryQuery = useDashboardSummaryQuery();

  // Mutations
  const { accept: acceptMutation, reject: rejectMutation, confirm: confirmMutation, fail: failMutation } = useManageRequestMutations();
  const redeemInviteMutation = useRedeemInviteMutation();
  const createCommunity = useCreateCommunity();
  const markAsReadMutation = useMarkAsReadMutation();

  // Computed values
  const totalPendingCount = createMemo(() => {
    const data = summaryQuery.data;
    if (!data) return 0;
    return (
      data.pendingActions.incomingRequests.length +
      data.pendingActions.acceptedOutgoing.length +
      data.pendingActions.poolDistributions.length +
      data.invites.length +
      (data.notifications?.length || 0)
    );
  });

  const hasNeedsAttention = createMemo(() => {
    const data = summaryQuery.data;
    if (!data) return false;
    return (
      data.pendingActions.incomingRequests.length > 0 ||
      data.pendingActions.acceptedOutgoing.length > 0 ||
      data.pendingActions.poolDistributions.length > 0 ||
      (data.notifications?.length || 0) > 0
    );
  });

  const sortedCommunities = createMemo(() => {
    const data = summaryQuery.data;
    if (!data) return [];

    const query = searchQuery().toLowerCase().trim();

    return [...data.communities]
      .filter((c) => !query || c.name.toLowerCase().includes(query))
      .sort((a, b) => {
        // First sort by total pending actions
        const aPending = a.pendingIncoming + a.pendingOutgoing;
        const bPending = b.pendingIncoming + b.pendingOutgoing;
        if (bPending !== aPending) return bPending - aPending;

        // Then by last activity
        if (a.lastActivityAt && b.lastActivityAt) {
          return new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime();
        }
        if (a.lastActivityAt) return -1;
        if (b.lastActivityAt) return 1;

        // Finally by name
        return a.name.localeCompare(b.name);
      });
  });

  // Handlers
  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleAcceptRequest = async (req: DashboardIncomingRequest) => {
    try {
      await acceptMutation.mutateAsync({ wealthId: req.wealthId, requestId: req.id });
      showMessage('success', t('messages.acceptSuccess'));
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'summary'] });
    } catch {
      showMessage('error', t('messages.acceptError'));
    }
  };

  const handleRejectRequest = async (req: DashboardIncomingRequest) => {
    try {
      await rejectMutation.mutateAsync({ wealthId: req.wealthId, requestId: req.id });
      showMessage('success', t('messages.rejectSuccess'));
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'summary'] });
    } catch {
      showMessage('error', t('messages.rejectError'));
    }
  };

  const handleConfirmReceipt = async (req: DashboardAcceptedOutgoing | DashboardPoolDistribution) => {
    try {
      await confirmMutation.mutateAsync({ wealthId: req.wealthId, requestId: req.id });
      showMessage('success', t('messages.confirmSuccess'));
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'summary'] });
    } catch {
      showMessage('error', t('messages.confirmError'));
    }
  };

  const handleMarkFailed = async (req: DashboardAcceptedOutgoing | DashboardPoolDistribution) => {
    try {
      await failMutation.mutateAsync({ wealthId: req.wealthId, requestId: req.id });
      showMessage('success', t('messages.failSuccess'));
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'summary'] });
    } catch {
      showMessage('error', t('messages.failError'));
    }
  };

  const handleAcceptInvite = async (invite: DashboardInvite) => {
    try {
      await redeemInviteMutation.mutateAsync(invite.id);
      showMessage('success', t('messages.inviteAccepted'));
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'summary'] });
    } catch {
      showMessage('error', t('messages.inviteError'));
    }
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    queryClient.invalidateQueries({ queryKey: ['dashboard', 'summary'] });
    queryClient.invalidateQueries({ queryKey: ['communities', 'search'] });
  };

  // Helper to render trust bar
  const renderTrustBar = (score: number) => {
    const maxTrust = 50; // Scale: 0-50 trust
    const percentage = Math.min(100, (score / maxTrust) * 100);
    return (
      <div class="flex items-center gap-1.5" title={`Trust: ${score}`}>
        <div class="w-12 h-1.5 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
          <div
            class="h-full bg-forest-500 dark:bg-forest-400 rounded-full transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span class="text-xs text-stone-500 dark:text-stone-400 tabular-nums">{score}</span>
      </div>
    );
  };

  // Community Card Component
  const CommunityCard = (props: { community: DashboardCommunitySummary }) => (
    <A
      href={`/communities/${props.community.id}`}
      class="block p-3 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg hover:border-ocean-400 dark:hover:border-ocean-600 transition-colors"
    >
      <div class="flex items-start justify-between gap-2 mb-1">
        <h3 class="text-sm font-semibold text-stone-900 dark:text-stone-100 truncate flex-1">
          {props.community.name}
        </h3>
        {renderTrustBar(props.community.userTrustScore)}
      </div>
      <div class="text-xs text-stone-500 dark:text-stone-400 mb-1">
        {props.community.memberCount} {t('communities.members')}
      </div>
      <Show when={props.community.pendingIncoming > 0 || props.community.pendingOutgoing > 0}>
        <div class="text-xs">
          <Show when={props.community.pendingIncoming > 0}>
            <span class="text-ocean-600 dark:text-ocean-400 mr-2">
              {props.community.pendingIncoming} {t('communities.incoming')}
            </span>
          </Show>
          <Show when={props.community.pendingOutgoing > 0}>
            <span class="text-forest-600 dark:text-forest-400">
              {props.community.pendingOutgoing} {t('communities.outgoing')}
            </span>
          </Show>
        </div>
      </Show>
    </A>
  );

  // Action Item Components
  const IncomingRequestItem = (props: { request: DashboardIncomingRequest }) => (
    <div class="flex items-center gap-2 p-2 bg-stone-50 dark:bg-stone-900 rounded text-xs">
      <span class="text-ocean-600 dark:text-ocean-400 flex items-center">
        ↓
        <InfoTooltip text={t('actions.tooltips.incoming')} position="right" iconSize="xs" />
      </span>
      <div class="flex-1 min-w-0">
        <A href={`/wealth/${props.request.wealthId}`} class="font-medium text-stone-900 dark:text-stone-100 hover:text-ocean-600 truncate block">
          {props.request.wealthTitle}
        </A>
        <span class="text-stone-500 dark:text-stone-400">
          {props.request.requesterDisplayName} · {props.request.communityName}
          <Show when={props.request.unitsRequested}>
            {' · '}{props.request.unitsRequested} {t('actions.units')}
          </Show>
        </span>
      </div>
      <div class="flex gap-1">
        <button
          onClick={() => handleAcceptRequest(props.request)}
          disabled={acceptMutation.isPending}
          class="px-2 py-1 text-xs bg-success-600 text-white rounded hover:bg-success-700 disabled:opacity-50"
        >
          {acceptMutation.isPending ? '...' : t('actions.accept')}
        </button>
        <button
          onClick={() => handleRejectRequest(props.request)}
          disabled={rejectMutation.isPending}
          class="px-2 py-1 text-xs bg-stone-300 dark:bg-stone-600 text-stone-700 dark:text-stone-200 rounded hover:bg-stone-400 dark:hover:bg-stone-500 disabled:opacity-50"
        >
          {rejectMutation.isPending ? '...' : t('actions.reject')}
        </button>
      </div>
    </div>
  );

  const AcceptedOutgoingItem = (props: { request: DashboardAcceptedOutgoing }) => (
    <div class="flex items-center gap-2 p-2 bg-stone-50 dark:bg-stone-900 rounded text-xs">
      <span class="text-forest-600 dark:text-forest-400 flex items-center">
        ↑
        <InfoTooltip text={t('actions.tooltips.outgoing')} position="right" iconSize="xs" />
      </span>
      <div class="flex-1 min-w-0">
        <A href={`/wealth/${props.request.wealthId}`} class="font-medium text-stone-900 dark:text-stone-100 hover:text-ocean-600 truncate block">
          {props.request.wealthTitle}
        </A>
        <span class="text-stone-500 dark:text-stone-400">
          {t('actions.acceptedOutgoing')} · {props.request.communityName}
          <Show when={props.request.unitsRequested}>
            {' · '}{props.request.unitsRequested} {t('actions.units')}
          </Show>
        </span>
      </div>
      <div class="flex gap-1">
        <button
          onClick={() => handleConfirmReceipt(props.request)}
          disabled={confirmMutation.isPending}
          class="px-2 py-1 text-xs bg-success-600 text-white rounded hover:bg-success-700 disabled:opacity-50"
        >
          {confirmMutation.isPending ? '...' : t('actions.confirmReceipt')}
        </button>
        <button
          onClick={() => handleMarkFailed(props.request)}
          disabled={failMutation.isPending}
          class="px-2 py-1 text-xs bg-danger-600 text-white rounded hover:bg-danger-700 disabled:opacity-50"
        >
          {failMutation.isPending ? '...' : t('actions.markFailed')}
        </button>
      </div>
    </div>
  );

  const PoolDistributionItem = (props: { request: DashboardPoolDistribution }) => (
    <div class="flex items-center gap-2 p-2 bg-stone-50 dark:bg-stone-900 rounded text-xs">
      <span class="text-sage-600 dark:text-sage-400 flex items-center">
        ⊕
        <InfoTooltip text={t('actions.tooltips.pool')} position="right" iconSize="xs" />
      </span>
      <div class="flex-1 min-w-0">
        <A href={`/wealth/${props.request.wealthId}`} class="font-medium text-stone-900 dark:text-stone-100 hover:text-ocean-600 truncate block">
          {props.request.wealthTitle}
        </A>
        <span class="text-stone-500 dark:text-stone-400">
          {t('actions.poolDistribution')} {props.request.poolName} · {props.request.communityName}
          <Show when={props.request.unitsRequested}>
            {' · '}{props.request.unitsRequested} {t('actions.units')}
          </Show>
        </span>
      </div>
      <div class="flex gap-1">
        <button
          onClick={() => handleConfirmReceipt(props.request)}
          disabled={confirmMutation.isPending}
          class="px-2 py-1 text-xs bg-success-600 text-white rounded hover:bg-success-700 disabled:opacity-50"
        >
          {confirmMutation.isPending ? '...' : t('actions.confirmReceipt')}
        </button>
        <button
          onClick={() => handleMarkFailed(props.request)}
          disabled={failMutation.isPending}
          class="px-2 py-1 text-xs bg-danger-600 text-white rounded hover:bg-danger-700 disabled:opacity-50"
        >
          {failMutation.isPending ? '...' : t('actions.markFailed')}
        </button>
      </div>
    </div>
  );

  const InviteItem = (props: { invite: DashboardInvite }) => (
    <div class="flex items-center gap-2 p-2 bg-stone-50 dark:bg-stone-900 rounded text-xs">
      <span class="text-ocean-600 dark:text-ocean-400 flex items-center">
        ✉
        <InfoTooltip text={t('actions.tooltips.invite')} position="right" iconSize="xs" />
      </span>
      <div class="flex-1 min-w-0">
        <span class="font-medium text-stone-900 dark:text-stone-100">
          {props.invite.communityName}
        </span>
        <span class="text-stone-500 dark:text-stone-400 ml-1">
          {t('invites.from')} {props.invite.inviterDisplayName}
        </span>
      </div>
      <div class="flex gap-1">
        <button
          onClick={() => handleAcceptInvite(props.invite)}
          disabled={redeemInviteMutation.isPending}
          class="px-2 py-1 text-xs bg-success-600 text-white rounded hover:bg-success-700 disabled:opacity-50"
        >
          {redeemInviteMutation.isPending ? '...' : t('invites.acceptInvite')}
        </button>
      </div>
    </div>
  );

  // Helper to get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'wealth_request_message':
        return (
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        );
      case 'wealth_request_status':
        return (
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
        );
      default:
        return (
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        );
    }
  };

  const NotificationItem = (props: { notification: DashboardNotification }) => {
    const handleDismiss = async () => {
      try {
        await markAsReadMutation.mutateAsync(props.notification.id);
        // Refetch dashboard summary to update the list
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'summary'] });
      } catch (e) {
        console.error('Failed to dismiss notification:', e);
      }
    };

    return (
      <div class="flex items-start gap-2 p-2 bg-stone-50 dark:bg-stone-900 rounded text-xs">
        <span class="flex-shrink-0 text-ocean-600 dark:text-ocean-400 mt-0.5">
          {getNotificationIcon(props.notification.type)}
        </span>
        <div class="flex-1 min-w-0">
          <p class="font-medium text-stone-900 dark:text-stone-100 truncate">
            {props.notification.title}
          </p>
          <Show when={props.notification.message}>
            <p class="text-stone-500 dark:text-stone-400 truncate">
              {props.notification.message}
            </p>
          </Show>
          <Show when={props.notification.communityName}>
            <p class="text-stone-400 dark:text-stone-500 text-[10px]">
              {props.notification.communityName}
            </p>
          </Show>
        </div>
        <div class="flex gap-1 flex-shrink-0">
          <A
            href={props.notification.actionUrl}
            class="px-2 py-1 text-xs bg-ocean-600 text-white rounded hover:bg-ocean-700"
          >
            {t('activity.viewNotification')}
          </A>
          <button
            onClick={handleDismiss}
            disabled={markAsReadMutation.isPending}
            class="px-2 py-1 text-xs bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300 rounded hover:bg-stone-300 dark:hover:bg-stone-600 disabled:opacity-50"
            title={t('activity.dismissNotification')}
          >
            ✕
          </button>
        </div>
      </div>
    );
  };

  // Activity Panel Component
  const ActivityPanel = () => (
    <div class="space-y-3">
      {/* Needs Attention Section */}
      <Show when={hasNeedsAttention()}>
        <div>
          <h3 class="text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wide mb-2">
            {t('activity.needsAttention')}
          </h3>
          <div class="space-y-2">
            <For each={summaryQuery.data?.pendingActions.incomingRequests}>
              {(req) => <IncomingRequestItem request={req} />}
            </For>
            <For each={summaryQuery.data?.pendingActions.acceptedOutgoing}>
              {(req) => <AcceptedOutgoingItem request={req} />}
            </For>
            <For each={summaryQuery.data?.pendingActions.poolDistributions}>
              {(req) => <PoolDistributionItem request={req} />}
            </For>
            <For each={summaryQuery.data?.notifications}>
              {(notification) => <NotificationItem notification={notification} />}
            </For>
          </div>
        </div>
      </Show>

      <Show when={!hasNeedsAttention()}>
        <div class="text-xs text-stone-500 dark:text-stone-400 text-center py-4">
          {t('activity.noActions')}
        </div>
      </Show>

      {/* Pending Invites Section */}
      <Show when={summaryQuery.data?.invites && summaryQuery.data.invites.length > 0}>
        <div>
          <button
            onClick={() => setInvitesExpanded(!invitesExpanded())}
            class="flex items-center justify-between w-full text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wide mb-2"
          >
            <span>{t('activity.pendingInvites')} ({summaryQuery.data?.invites.length})</span>
            <svg
              class={`w-4 h-4 transform transition-transform ${invitesExpanded() ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <Show when={invitesExpanded()}>
            <div class="space-y-2">
              <For each={summaryQuery.data?.invites}>
                {(invite) => <InviteItem invite={invite} />}
              </For>
            </div>
          </Show>
        </div>
      </Show>
    </div>
  );

  return (
    <>
      <Title>{t('title')}</Title>

      <div class="min-h-screen bg-stone-100 dark:bg-stone-900">
        {/* Compact Header with gradient accent */}
        <header class="h-12 bg-gradient-to-r from-ocean-100 to-forest-100 dark:from-ocean-900 dark:to-forest-900 border-b border-stone-200 dark:border-stone-700 px-4 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <h1 class="text-sm font-medium text-ocean-600 dark:text-ocean-400">
              {t('header.welcome')},
            </h1>
            <span class="text-sm font-semibold text-stone-900 dark:text-stone-100">
              {user()?.displayName || user()?.username || 'User'}
            </span>
          </div>
          <Show when={totalPendingCount() > 0}>
            <span class="px-2 py-0.5 text-xs font-medium bg-danger-100 dark:bg-danger-900 text-danger-700 dark:text-danger-300 rounded-full">
              {totalPendingCount()}
            </span>
          </Show>
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

        {/* Loading State */}
        <Show when={summaryQuery.isLoading}>
          <div class="flex items-center justify-center h-64">
            <span class="text-sm text-stone-500 dark:text-stone-400">{t('loading')}</span>
          </div>
        </Show>

        {/* Error State */}
        <Show when={summaryQuery.isError}>
          <div class="flex items-center justify-center h-64">
            <span class="text-sm text-danger-600 dark:text-danger-400">{t('error')}</span>
          </div>
        </Show>

        {/* Main Content */}
        <Show when={!summaryQuery.isLoading && !summaryQuery.isError}>
          {/* Mobile Tabs */}
          <div class="md:hidden border-b border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800">
            <div class="flex">
              <button
                onClick={() => setActiveTab('communities')}
                class={`flex-1 px-4 py-2 text-sm font-medium ${
                  activeTab() === 'communities'
                    ? 'text-ocean-600 dark:text-ocean-400 border-b-2 border-ocean-600'
                    : 'text-stone-500 dark:text-stone-400'
                }`}
              >
                {t('tabs.communities')}
              </button>
              <button
                onClick={() => setActiveTab('activity')}
                class={`flex-1 px-4 py-2 text-sm font-medium relative ${
                  activeTab() === 'activity'
                    ? 'text-ocean-600 dark:text-ocean-400 border-b-2 border-ocean-600'
                    : 'text-stone-500 dark:text-stone-400'
                }`}
              >
                {t('tabs.activity')}
                <Show when={totalPendingCount() > 0}>
                  <span class="absolute top-1 right-4 w-2 h-2 bg-danger-500 rounded-full" />
                </Show>
              </button>
            </div>
          </div>

          {/* Desktop Layout */}
          <div class="hidden md:flex h-[calc(100vh-48px-56px)]">
            {/* Communities Panel (60%) */}
            <div class="w-3/5 border-r border-stone-200 dark:border-stone-700 overflow-y-auto p-4">
              {/* Search bar */}
              <Show when={summaryQuery.data && summaryQuery.data.communities.length > 3}>
                <div class="mb-3">
                  <input
                    type="text"
                    placeholder={t('communities.searchPlaceholder')}
                    value={searchQuery()}
                    onInput={(e) => setSearchQuery(e.currentTarget.value)}
                    class="w-full px-3 py-1.5 text-sm bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded focus:outline-none focus:border-ocean-400 dark:focus:border-ocean-600 text-stone-900 dark:text-stone-100 placeholder-stone-400"
                  />
                </div>
              </Show>
              <Show when={sortedCommunities().length === 0}>
                <div class="text-center py-8 text-sm text-stone-500 dark:text-stone-400">
                  {searchQuery() ? `No communities match "${searchQuery()}"` : t('communities.empty')}
                </div>
              </Show>
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <For each={sortedCommunities()}>
                  {(community) => <CommunityCard community={community} />}
                </For>
              </div>
            </div>

            {/* Activity Panel (40%) */}
            <div class="w-2/5 overflow-y-auto p-4">
              <ActivityPanel />
            </div>
          </div>

          {/* Mobile Content */}
          <div class="md:hidden h-[calc(100vh-48px-40px-56px)] overflow-y-auto p-4">
            <Show when={activeTab() === 'communities'}>
              {/* Search bar */}
              <Show when={summaryQuery.data && summaryQuery.data.communities.length > 3}>
                <div class="mb-3">
                  <input
                    type="text"
                    placeholder={t('communities.searchPlaceholder')}
                    value={searchQuery()}
                    onInput={(e) => setSearchQuery(e.currentTarget.value)}
                    class="w-full px-3 py-1.5 text-sm bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded focus:outline-none focus:border-ocean-400 dark:focus:border-ocean-600 text-stone-900 dark:text-stone-100 placeholder-stone-400"
                  />
                </div>
              </Show>
              <Show when={sortedCommunities().length === 0}>
                <div class="text-center py-8 text-sm text-stone-500 dark:text-stone-400">
                  {searchQuery() ? `No communities match "${searchQuery()}"` : t('communities.empty')}
                </div>
              </Show>
              <div class="grid grid-cols-1 gap-3">
                <For each={sortedCommunities()}>
                  {(community) => <CommunityCard community={community} />}
                </For>
              </div>
            </Show>
            <Show when={activeTab() === 'activity'}>
              <ActivityPanel />
            </Show>
          </div>
        </Show>

        {/* Footer */}
        <footer class="fixed bottom-0 left-0 right-0 h-14 bg-white dark:bg-stone-800 border-t border-stone-200 dark:border-stone-700 px-4 flex items-center justify-center">
          <button
            onClick={() => setShowCreateModal(true)}
            class="px-6 py-2 text-sm bg-ocean-600 text-white rounded hover:bg-ocean-700 transition-colors"
          >
            + {t('footer.createCommunity')}
          </button>
        </footer>

        {/* Create Community Modal */}
        <Show when={showCreateModal()}>
          <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div class="bg-white dark:bg-stone-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div class="flex items-center justify-between p-4 border-b border-stone-200 dark:border-stone-700">
                <h2 class="text-lg font-semibold text-stone-900 dark:text-stone-100">
                  {t('createModal.title')}
                </h2>
                <button
                  onClick={() => setShowCreateModal(false)}
                  class="text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
                >
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div class="p-4">
                <CreateCommunityForm onSuccess={handleCreateSuccess} />
              </div>
            </div>
          </div>
        </Show>

        {/* Creating Overlay */}
        <Show when={createCommunity.isPending}>
          <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white dark:bg-stone-800 p-4 rounded-lg border border-stone-200 dark:border-stone-700 text-stone-900 dark:text-stone-100 text-sm">
              {t('createModal.creating')}
            </div>
          </div>
        </Show>
      </div>
    </>
  );
};

export default Dashboard;
