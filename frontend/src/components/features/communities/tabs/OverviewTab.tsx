import { Component, createSignal, Show, For, createMemo } from 'solid-js';
import { A } from '@solidjs/router';
import { makeTranslator } from '@/i18n/makeTranslator';
import { overviewTabDict } from './OverviewTab.i18n';
import { useCommunity } from '@/contexts/CommunityContext';
import {
  useCommunityStatsSummaryQuery,
  useCommunityPendingActionsQuery,
} from '@/hooks/queries/useCommunityStats';
import { useTrustTimelineQuery } from '@/hooks/queries/useTrustTimelineQuery';
import { useCanManageItemsQuery } from '@/hooks/queries/useCanManageItemsQuery';
import { usePollsListQuery } from '@/hooks/queries/usePolls';
import { useHomepagePinnedThreadsQuery } from '@/hooks/queries/useForumQueries';
import { useMyContributionProfileQuery } from '@/hooks/queries/useContributions';
import { HealthAnalyticsPanel } from '@/components/features/health/HealthAnalyticsPanel';
import { InfoTooltip } from '@/components/common/InfoTooltip';

type OverviewSubTab = 'summary' | 'myTrust' | 'analytics';

interface OverviewTabProps {
  communityId: string;
}

export const OverviewTab: Component<OverviewTabProps> = (props) => {
  const t = makeTranslator(overviewTabDict, 'overviewTab');
  const [activeSubTab, setActiveSubTab] = createSignal<OverviewSubTab>('summary');

  return (
    <div>
      {/* Sub-tab Navigation */}
      <div class="flex border-b border-stone-200 dark:border-stone-700 mb-4">
        <button
          onClick={() => setActiveSubTab('summary')}
          class={`px-4 py-2 text-xs font-medium transition-colors flex items-center gap-1 ${
            activeSubTab() === 'summary'
              ? 'text-ocean-600 dark:text-ocean-400 border-b-2 border-ocean-600 dark:border-ocean-400'
              : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300'
          }`}
        >
          {t('subTabs.summary')}
          <InfoTooltip text={t('tooltips.summary')} position="bottom" iconSize="xs" />
        </button>
        <button
          onClick={() => setActiveSubTab('myTrust')}
          class={`px-4 py-2 text-xs font-medium transition-colors flex items-center gap-1 ${
            activeSubTab() === 'myTrust'
              ? 'text-ocean-600 dark:text-ocean-400 border-b-2 border-ocean-600 dark:border-ocean-400'
              : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300'
          }`}
        >
          {t('subTabs.myTrust')}
          <InfoTooltip text={t('tooltips.myTrust')} position="bottom" iconSize="xs" />
        </button>
        <button
          onClick={() => setActiveSubTab('analytics')}
          class={`px-4 py-2 text-xs font-medium transition-colors flex items-center gap-1 ${
            activeSubTab() === 'analytics'
              ? 'text-ocean-600 dark:text-ocean-400 border-b-2 border-ocean-600 dark:border-ocean-400'
              : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300'
          }`}
        >
          {t('subTabs.analytics')}
          <InfoTooltip text={t('tooltips.analytics')} position="bottom" iconSize="xs" />
        </button>
      </div>

      {/* Sub-tab Content */}
      <Show when={activeSubTab() === 'summary'}>
        <SummaryContent communityId={props.communityId} />
      </Show>
      <Show when={activeSubTab() === 'myTrust'}>
        <MyTrustContent communityId={props.communityId} />
      </Show>
      <Show when={activeSubTab() === 'analytics'}>
        <HealthAnalyticsPanel communityId={props.communityId} />
      </Show>
    </div>
  );
};

// Summary Sub-tab Content
const SummaryContent: Component<{ communityId: string }> = (props) => {
  const t = makeTranslator(overviewTabDict, 'overviewTab');
  const community = useCommunity();
  const statsQuery = useCommunityStatsSummaryQuery(() => props.communityId);
  const pendingQuery = useCommunityPendingActionsQuery(() => props.communityId);
  const canManageItemsQuery = useCanManageItemsQuery(() => props.communityId);
  const contributionProfileQuery = useMyContributionProfileQuery(() => props.communityId);

  // Query for active polls
  const activeStatus = () => 'active' as const;
  const pollsQuery = usePollsListQuery(() => props.communityId, { status: activeStatus });

  // Query for homepage pinned threads
  const pinnedThreadsQuery = useHomepagePinnedThreadsQuery(() => props.communityId);

  // Get active polls (limit to 5 for display)
  const activePolls = createMemo(() => {
    const polls = pollsQuery.data?.polls || [];
    return polls.slice(0, 5);
  });

  return (
    <div class="space-y-4">
      {/* Community Statistics */}
      <div>
        <h3 class="text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wide mb-2">
          {t('summary.statsTitle')}
        </h3>
        <Show
          when={!statsQuery.isLoading}
          fallback={
            <div class="p-4 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg animate-pulse">
              <div class="flex flex-wrap gap-6">
                <For each={[1, 2, 3, 4, 5]}>
                  {() => (
                    <div class="flex items-center gap-2">
                      <div class="h-3 bg-stone-200 dark:bg-stone-700 rounded w-16" />
                      <div class="h-5 bg-stone-200 dark:bg-stone-700 rounded w-8" />
                    </div>
                  )}
                </For>
              </div>
            </div>
          }
        >
          <div class="p-4 bg-gradient-to-br from-ocean-50 to-ocean-100 dark:from-ocean-900/50 dark:to-ocean-800/50 border border-ocean-200 dark:border-ocean-700 rounded-lg">
            <div class="flex gap-6 justify-between">
              <div class="flex flex-col items-center">
                <span class="text-xs text-ocean-600 dark:text-ocean-300 font-medium mb-1">
                  {t('summary.members')}
                </span>
                <span class="text-lg font-bold text-ocean-700 dark:text-ocean-200">
                  {statsQuery.data?.memberCount ?? 0}
                </span>
              </div>
              <div class="flex flex-col items-center">
                <span class="text-xs text-ocean-600 dark:text-ocean-300 font-medium mb-1">
                  {t('summary.avgTrust')}
                </span>
                <span class="text-lg font-bold text-ocean-700 dark:text-ocean-200">
                  {statsQuery.data?.avgTrustScore ?? 0}
                </span>
              </div>
              <div class="flex flex-col items-center">
                <span class="text-xs text-ocean-600 dark:text-ocean-300 font-medium mb-1">
                  {t('summary.sharedWealth')}
                </span>
                <span class="text-lg font-bold text-ocean-700 dark:text-ocean-200">
                  {statsQuery.data?.wealthCount ?? 0}
                </span>
              </div>
              <div class="flex flex-col items-center">
                <span class="text-xs text-ocean-600 dark:text-ocean-300 font-medium mb-1">
                  {t('summary.pools')}
                </span>
                <span class="text-lg font-bold text-ocean-700 dark:text-ocean-200">
                  {statsQuery.data?.poolCount ?? 0}
                </span>
              </div>
              <div class="flex flex-col items-center">
                <span class="text-xs text-ocean-600 dark:text-ocean-300 font-medium mb-1">
                  {t('summary.needs')}
                </span>
                <span class="text-lg font-bold text-ocean-700 dark:text-ocean-200">
                  {statsQuery.data?.needsCount ?? 0}
                </span>
              </div>
            </div>
          </div>
        </Show>
      </div>

      {/* Compact Resource Cards */}
      <div>
        <h3 class="text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wide mb-2">
          {t('summary.resources')}
        </h3>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {/* Wealth Card - Compact */}
          <div class="p-3 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg">
            <div class="flex items-center gap-1.5 mb-2">
              <span class="text-sm">📦</span>
              <span class="text-xs font-medium text-stone-900 dark:text-stone-100">
                {t('summary.wealthTitle')}
              </span>
            </div>
            <div class="text-lg font-bold text-stone-900 dark:text-stone-100 mb-2">
              {statsQuery.data?.wealthCount ?? 0}
            </div>
            <div class="flex flex-wrap gap-1">
              <Show when={community.canCreateWealth()}>
                <A
                  href={`/communities/${props.communityId}/wealth/create`}
                  class="px-2 py-1 text-xs bg-ocean-600 text-white rounded hover:bg-ocean-700"
                >
                  +
                </A>
              </Show>
              <A
                href={`/communities/${props.communityId}/wealth`}
                class="px-2 py-1 text-xs bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 rounded hover:bg-stone-300 dark:hover:bg-stone-600"
              >
                {t('summary.viewAll')}
              </A>
            </div>
          </div>

          {/* Pools Card - Compact */}
          <Show
            when={community.isPoolsEnabled()}
            fallback={
              <div class="p-3 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg opacity-50">
                <div class="flex items-center gap-1.5 mb-2">
                  <span class="text-sm">📥</span>
                  <span class="text-xs font-medium text-stone-500 dark:text-stone-400">
                    {t('summary.poolsTitle')}
                  </span>
                </div>
                <p class="text-xs text-stone-500 dark:text-stone-400">
                  {t('summary.featureDisabled')}
                </p>
              </div>
            }
          >
            <div class="p-3 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg">
              <div class="flex items-center gap-1.5 mb-2">
                <span class="text-sm">📥</span>
                <span class="text-xs font-medium text-stone-900 dark:text-stone-100">
                  {t('summary.poolsTitle')}
                </span>
              </div>
              <div class="text-lg font-bold text-stone-900 dark:text-stone-100 mb-2">
                {statsQuery.data?.poolCount ?? 0}
              </div>
              <div class="flex flex-wrap gap-1">
                <Show when={community.canCreatePools()}>
                  <A
                    href={`/communities/${props.communityId}/pools/create`}
                    class="px-2 py-1 text-xs bg-ocean-600 text-white rounded hover:bg-ocean-700"
                  >
                    +
                  </A>
                </Show>
                <A
                  href={`/communities/${props.communityId}/pools`}
                  class="px-2 py-1 text-xs bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 rounded hover:bg-stone-300 dark:hover:bg-stone-600"
                >
                  {t('summary.viewAll')}
                </A>
              </div>
            </div>
          </Show>

          {/* Needs Card - Compact */}
          <Show
            when={community.isNeedsEnabled()}
            fallback={
              <div class="p-3 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg opacity-50">
                <div class="flex items-center gap-1.5 mb-2">
                  <span class="text-sm">📋</span>
                  <span class="text-xs font-medium text-stone-500 dark:text-stone-400">
                    {t('summary.needsTitle')}
                  </span>
                </div>
                <p class="text-xs text-stone-500 dark:text-stone-400">
                  {t('summary.featureDisabled')}
                </p>
              </div>
            }
          >
            <div class="p-3 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg">
              <div class="flex items-center gap-1.5 mb-2">
                <span class="text-sm">📋</span>
                <span class="text-xs font-medium text-stone-900 dark:text-stone-100">
                  {t('summary.needsTitle')}
                </span>
              </div>
              <div class="text-lg font-bold text-stone-900 dark:text-stone-100 mb-2">
                {statsQuery.data?.needsCount ?? 0}
              </div>
              <div class="flex flex-wrap gap-1">
                <Show when={community.canPublishNeeds()}>
                  <A
                    href={`/communities/${props.communityId}/needs/create`}
                    class="px-2 py-1 text-xs bg-ocean-600 text-white rounded hover:bg-ocean-700"
                  >
                    +
                  </A>
                </Show>
                <A
                  href={`/communities/${props.communityId}/needs`}
                  class="px-2 py-1 text-xs bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 rounded hover:bg-stone-300 dark:hover:bg-stone-600"
                >
                  {t('summary.viewAll')}
                </A>
              </div>
            </div>
          </Show>

          {/* Items Card - Compact (only for users who can manage items) */}
          <Show when={canManageItemsQuery.data?.canManage}>
            <div class="p-3 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg">
              <div class="flex items-center gap-1.5 mb-2">
                <span class="text-sm">🏷️</span>
                <span class="text-xs font-medium text-stone-900 dark:text-stone-100">
                  {t('summary.itemsTitle')}
                </span>
              </div>
              <p class="text-xs text-stone-500 dark:text-stone-400 mb-2">
                {t('summary.itemsDesc')}
              </p>
              <A
                href={`/communities/${props.communityId}/items`}
                class="px-2 py-1 text-xs bg-ocean-600 text-white rounded hover:bg-ocean-700"
              >
                {t('summary.manage')}
              </A>
            </div>
          </Show>

          {/* Contributions Card - Compact */}
          <Show
            when={community.isContributionsEnabled()}
            fallback={
              <div class="p-3 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg opacity-50">
                <div class="flex items-center gap-1.5 mb-2">
                  <span class="text-sm">⭐</span>
                  <span class="text-xs font-medium text-stone-500 dark:text-stone-400">
                    {t('summary.contributionsTitle')}
                  </span>
                </div>
                <p class="text-xs text-stone-500 dark:text-stone-400">
                  {t('summary.featureDisabled')}
                </p>
              </div>
            }
          >
            <div class="p-3 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg">
              <div class="flex items-center gap-1.5 mb-2">
                <span class="text-sm">⭐</span>
                <span class="text-xs font-medium text-stone-900 dark:text-stone-100">
                  {t('summary.contributionsTitle')}
                </span>
              </div>
              <div class="text-lg font-bold text-stone-900 dark:text-stone-100 mb-2">
                {contributionProfileQuery.data?.totalValueLifetime ?? 0}
              </div>
              <div class="flex flex-wrap gap-1">
                <A
                  href={`/communities/${props.communityId}/contributions`}
                  class="px-2 py-1 text-xs bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 rounded hover:bg-stone-300 dark:hover:bg-stone-600"
                >
                  {t('summary.viewAll')}
                </A>
              </div>
            </div>
          </Show>
        </div>
      </div>

      {/* Pending Actions */}
      <div class="p-3 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg">
        <h3 class="text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wide mb-2">
          {t('summary.pendingActions')}
        </h3>
        <Show
          when={!pendingQuery.isLoading}
          fallback={
            <div class="space-y-2">
              <div class="h-4 bg-stone-100 dark:bg-stone-700 rounded animate-pulse" />
              <div class="h-4 bg-stone-100 dark:bg-stone-700 rounded animate-pulse w-3/4" />
            </div>
          }
        >
          <Show
            when={
              pendingQuery.data &&
              (pendingQuery.data.incomingRequests > 0 ||
                pendingQuery.data.outgoingRequests > 0 ||
                pendingQuery.data.poolDistributions > 0 ||
                pendingQuery.data.openDisputes > 0)
            }
            fallback={
              <div class="text-sm text-stone-500 dark:text-stone-400">
                {t('summary.noPendingActions')}
              </div>
            }
          >
            <ul class="space-y-1.5 text-sm">
              <Show when={pendingQuery.data && pendingQuery.data.incomingRequests > 0}>
                <li class="flex items-center gap-2">
                  <span class="text-ocean-600 dark:text-ocean-400 font-medium">
                    {pendingQuery.data!.incomingRequests}
                  </span>
                  <span class="text-stone-600 dark:text-stone-400">
                    {t('summary.incomingRequests')}
                  </span>
                </li>
              </Show>
              <Show when={pendingQuery.data && pendingQuery.data.outgoingRequests > 0}>
                <li class="flex items-center gap-2">
                  <span class="text-forest-600 dark:text-forest-400 font-medium">
                    {pendingQuery.data!.outgoingRequests}
                  </span>
                  <span class="text-stone-600 dark:text-stone-400">
                    {t('summary.outgoingRequests')}
                  </span>
                </li>
              </Show>
              <Show when={pendingQuery.data && pendingQuery.data.poolDistributions > 0}>
                <li class="flex items-center gap-2">
                  <span class="text-sage-600 dark:text-sage-400 font-medium">
                    {pendingQuery.data!.poolDistributions}
                  </span>
                  <span class="text-stone-600 dark:text-stone-400">
                    {t('summary.poolDistributions')}
                  </span>
                </li>
              </Show>
              <Show when={pendingQuery.data && pendingQuery.data.openDisputes > 0}>
                <li class="flex items-center gap-2">
                  <span class="text-warning-600 dark:text-warning-400 font-medium">
                    {pendingQuery.data!.openDisputes}
                  </span>
                  <span class="text-stone-600 dark:text-stone-400">
                    {t('summary.openDisputes')}
                  </span>
                </li>
              </Show>
            </ul>
          </Show>
        </Show>
      </div>

      {/* Active Polls */}
      <Show when={community.isPollsEnabled()}>
        <div class="p-3 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wide">
              {t('summary.activePolls')}
            </h3>
            <A
              href={`/communities/${props.communityId}/polls`}
              class="text-xs text-ocean-600 dark:text-ocean-400 hover:text-ocean-700 dark:hover:text-ocean-300"
            >
              {t('summary.viewAllPolls')}
            </A>
          </div>
          <Show
            when={!pollsQuery.isLoading}
            fallback={
              <div class="text-sm text-stone-500 dark:text-stone-400">{t('loading')}</div>
            }
          >
            <Show
              when={activePolls().length > 0}
              fallback={
                <div class="text-sm text-stone-500 dark:text-stone-400">{t('summary.noActivePolls')}</div>
              }
            >
              <div class="space-y-2">
                <For each={activePolls()}>
                  {(poll) => {
                    const endsAt = new Date(poll.endsAt);
                    const now = new Date();
                    const hoursLeft = Math.max(0, Math.ceil((endsAt.getTime() - now.getTime()) / (1000 * 60 * 60)));
                    const daysLeft = Math.floor(hoursLeft / 24);

                    return (
                      <A
                        href={`/communities/${props.communityId}/polls/${poll.id}`}
                        class="block p-2 bg-stone-50 dark:bg-stone-900 rounded border border-stone-200 dark:border-stone-700 hover:border-ocean-400 dark:hover:border-ocean-500 transition-colors"
                      >
                        <div class="flex items-start justify-between gap-2">
                          <div class="flex-1 min-w-0">
                            <div class="font-medium text-xs text-stone-900 dark:text-stone-100 truncate">
                              {poll.title}
                            </div>
                            <div class="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                              {daysLeft > 0
                                ? `${daysLeft}d ${hoursLeft % 24}h ${t('summary.remaining')}`
                                : `${hoursLeft}h ${t('summary.remaining')}`
                              }
                            </div>
                          </div>
                          <span class="px-1.5 py-0.5 text-xs bg-ocean-100 dark:bg-ocean-900 text-ocean-700 dark:text-ocean-300 rounded">
                            {t('summary.vote')}
                          </span>
                        </div>
                      </A>
                    );
                  }}
                </For>
              </div>
            </Show>
          </Show>
        </div>
      </Show>

      {/* Pinned Threads */}
      <Show when={community.isForumEnabled() && community.canViewForum()}>
        <div class="p-3 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wide">
              {t('summary.pinnedThreads')}
            </h3>
            <A
              href={`/communities/${props.communityId}/forum`}
              class="text-xs text-ocean-600 dark:text-ocean-400 hover:text-ocean-700 dark:hover:text-ocean-300"
            >
              {t('summary.viewDiscussion')}
            </A>
          </div>
          <Show
            when={!pinnedThreadsQuery.isLoading}
            fallback={
              <div class="space-y-2">
                <div class="h-4 bg-stone-100 dark:bg-stone-700 rounded animate-pulse" />
                <div class="h-4 bg-stone-100 dark:bg-stone-700 rounded animate-pulse w-3/4" />
              </div>
            }
          >
            <Show
              when={pinnedThreadsQuery.data?.threads && pinnedThreadsQuery.data.threads.length > 0}
              fallback={
                <div class="text-sm text-stone-500 dark:text-stone-400">
                  {t('summary.noPinnedThreads')}
                </div>
              }
            >
              <div class="space-y-2">
                <For each={pinnedThreadsQuery.data?.threads}>
                  {(thread) => (
                    <A
                      href={`/communities/${props.communityId}/discussion?thread=${thread.id}`}
                      class="flex items-center justify-between p-2 bg-stone-50 dark:bg-stone-900 rounded border border-stone-200 dark:border-stone-700 hover:border-ocean-400 dark:hover:border-ocean-500 transition-colors"
                    >
                      <span class="text-xs text-stone-900 dark:text-stone-100 truncate flex-1 mr-2">
                        {thread.title}
                      </span>
                      <span class="text-xs text-stone-500 dark:text-stone-400 flex-shrink-0">
                        {thread.postCount} {t('summary.posts')}
                      </span>
                    </A>
                  )}
                </For>
              </div>
            </Show>
          </Show>
        </div>
      </Show>
    </div>
  );
};

// My Trust Sub-tab Content
const MyTrustContent: Component<{ communityId: string }> = (props) => {
  const t = makeTranslator(overviewTabDict, 'overviewTab');
  const { trustMe } = useCommunity();
  const timelineQuery = useTrustTimelineQuery(() => props.communityId);

  // Calculate progress percentage (max 50 for visualization)
  const trustPercentage = createMemo(() => {
    const points = trustMe()?.points ?? 0;
    const maxTrust = 50;
    return Math.min(100, (points / maxTrust) * 100);
  });

  // Find next milestone
  const nextMilestone = createMemo(() => {
    const timeline = timelineQuery.data?.timeline ?? [];
    const currentPoints = trustMe()?.points ?? 0;
    return timeline.find((item) => item.threshold > currentPoints);
  });

  return (
    <div class="space-y-4">
      {/* Trust Score Card */}
      <div class="p-4 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg">
        <h3 class="text-sm font-semibold text-stone-900 dark:text-stone-100 mb-3">
          {t('myTrust.title')}
        </h3>

        {/* Score Display */}
        <div class="flex items-center gap-4 mb-4">
          <div class="text-3xl font-bold text-ocean-600 dark:text-ocean-400">
            {trustMe()?.points ?? 0}
          </div>
          <div class="text-sm text-stone-500 dark:text-stone-400">
            {t('myTrust.points')}
          </div>
        </div>

        {/* Progress Bar */}
        <div class="mb-2">
          <div class="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 mb-1">
            <span>{t('myTrust.trustProgress')}</span>
            <span>{Math.round(trustPercentage())}%</span>
          </div>
          <div class="w-full h-2 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
            <div
              class="h-full bg-forest-500 dark:bg-forest-400 rounded-full transition-all"
              style={{ width: `${trustPercentage()}%` }}
            />
          </div>
        </div>

        {/* Next Milestone */}
        <Show when={nextMilestone()}>
          <div class="text-xs text-stone-500 dark:text-stone-400">
            {t('myTrust.nextMilestone')} {nextMilestone()!.threshold}
            <Show when={nextMilestone()!.trustLevel}>
              {' '}({nextMilestone()!.trustLevel!.name})
            </Show>
          </div>
        </Show>
      </div>

      {/* Trust Timeline */}
      <div class="p-4 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg">
        <h3 class="text-sm font-semibold text-stone-900 dark:text-stone-100 mb-3">
          {t('myTrust.timeline')}
        </h3>

        <Show
          when={!timelineQuery.isLoading}
          fallback={
            <div class="space-y-3">
              <For each={[1, 2, 3]}>
                {() => (
                  <div class="flex items-center gap-3 animate-pulse">
                    <div class="w-6 h-6 bg-stone-200 dark:bg-stone-700 rounded-full" />
                    <div class="flex-1">
                      <div class="h-3 bg-stone-200 dark:bg-stone-700 rounded w-24 mb-1" />
                      <div class="h-2 bg-stone-200 dark:bg-stone-700 rounded w-32" />
                    </div>
                  </div>
                )}
              </For>
            </div>
          }
        >
          <Show
            when={timelineQuery.data?.timeline && timelineQuery.data.timeline.length > 0}
            fallback={
              <div class="text-sm text-stone-500 dark:text-stone-400 text-center py-4">
                {t('myTrust.noTrustYet')}
              </div>
            }
          >
            <div class="space-y-4">
              <For each={timelineQuery.data?.timeline}>
                {(item) => (
                  <div class="flex items-start gap-3">
                    {/* Milestone indicator */}
                    <div
                      class={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        item.unlocked
                          ? 'bg-forest-100 dark:bg-forest-900 text-forest-600 dark:text-forest-400'
                          : 'bg-stone-100 dark:bg-stone-700 text-stone-400 dark:text-stone-500'
                      }`}
                    >
                      <Show
                        when={item.unlocked}
                        fallback={
                          <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fill-rule="evenodd"
                              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                              clip-rule="evenodd"
                            />
                          </svg>
                        }
                      >
                        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fill-rule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clip-rule="evenodd"
                          />
                        </svg>
                      </Show>
                    </div>

                    {/* Milestone content */}
                    <div class="flex-1 min-w-0">
                      {/* Threshold and points */}
                      <div class="flex items-center gap-2 mb-1">
                        <span class="text-xs font-medium text-stone-500 dark:text-stone-400">
                          {item.threshold} {t('myTrust.points')}
                        </span>
                      </div>

                      {/* Member Title section - only if trust level exists */}
                      <Show when={item.trustLevel}>
                        <div class="mb-2">
                          <div class="flex items-center gap-1.5">
                            <span
                              class={`text-sm font-bold ${
                                item.unlocked
                                  ? 'text-forest-600 dark:text-forest-400'
                                  : 'text-stone-400 dark:text-stone-500'
                              }`}
                            >
                              {item.trustLevel!.name}
                            </span>
                          </div>
                          <span
                            class={`text-xs ${
                              item.unlocked
                                ? 'text-forest-500 dark:text-forest-500'
                                : 'text-stone-400 dark:text-stone-500'
                            }`}
                          >
                            {item.unlocked ? t('myTrust.titleAchieved') : t('myTrust.nextTitle')}
                          </span>
                        </div>
                      </Show>

                      {/* Permissions section */}
                      <Show when={item.permissions && item.permissions.length > 0}>
                        <div>
                          <div class="text-xs text-stone-500 dark:text-stone-400 mb-1">
                            {item.unlocked
                              ? t('myTrust.permissionsUnlocked')
                              : t('myTrust.permissionsToUnlock')}
                            :
                          </div>
                          <div class="flex flex-wrap gap-1">
                            <For each={item.permissions}>
                              {(permission) => (
                                <span
                                  class={`text-xs px-1.5 py-0.5 rounded inline-flex items-center gap-1 ${
                                    item.unlocked
                                      ? 'bg-forest-100 dark:bg-forest-900 text-forest-700 dark:text-forest-300'
                                      : 'bg-stone-100 dark:bg-stone-700 text-stone-500 dark:text-stone-400'
                                  }`}
                                >
                                  <Show when={item.unlocked}>
                                    <span class="text-[10px]">⭐</span>
                                  </Show>
                                  {permission}
                                </span>
                              )}
                            </For>
                          </div>
                        </div>
                      </Show>
                    </div>
                  </div>
                )}
              </For>
            </div>
          </Show>
        </Show>
      </div>
    </div>
  );
};

export default OverviewTab;
