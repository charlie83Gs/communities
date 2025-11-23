import { Component, createSignal, For, Show, createMemo } from 'solid-js';
import { StatCard } from '@/components/common/StatCard';
import { AreaChart } from '@/components/common/AreaChart';
import { useNeedsOverviewQuery, useNeedsItemsQuery, useAggregatedNeedsQuery } from '@/hooks/queries/useHealthQueries';
import type { TimeRange } from '@/types/health.types';
import { makeTranslator } from '@/i18n/makeTranslator';
import { needsStatisticsDict } from './NeedsStatistics.i18n';

interface NeedsStatisticsProps {
  communityId: string;
}

export const NeedsStatistics: Component<NeedsStatisticsProps> = (props) => {
  const t = makeTranslator(needsStatisticsDict, 'needsStats');
  const [timeRange, setTimeRange] = createSignal<TimeRange>('30d');
  const [selectedRecurrence, setSelectedRecurrence] = createSignal<'one-time' | 'daily' | 'weekly' | 'monthly'>('daily');

  const overviewQuery = useNeedsOverviewQuery(
    () => props.communityId,
    timeRange
  );

  const itemsQuery = useNeedsItemsQuery(
    () => props.communityId,
    timeRange
  );

  const aggregatedQuery = useAggregatedNeedsQuery(
    () => props.communityId
  );

  const currentRecurrenceData = createMemo(() => {
    return aggregatedQuery.data?.find((g: { recurrence: string }) => g.recurrence === selectedRecurrence());
  });

  const getRecurrenceCount = (recurrence: 'one-time' | 'daily' | 'weekly' | 'monthly') => {
    return aggregatedQuery.data?.find((g: { recurrence: string; items: unknown[] }) => g.recurrence === recurrence)?.items.length || 0;
  };

  const getRowClass = (item: { needsTotal: number; wantsTotal: number }) => {
    if (item.needsTotal > item.wantsTotal) {
      return 'bg-success-50/20 dark:bg-success-900/10';
    } else if (item.wantsTotal > item.needsTotal) {
      return 'bg-ocean-50/20 dark:bg-ocean-900/10';
    }
    return '';
  };

  const getEmptyMessage = () => {
    const recurrence = selectedRecurrence();
    const messages: Record<string, string> = {
      'one-time': t('noOneTimeNeeds'),
      'daily': t('noDailyNeeds'),
      'weekly': t('noWeeklyNeeds'),
      'monthly': t('noMonthlyNeeds'),
    };
    return messages[recurrence] || t('noData');
  };

  const timeRangeOptions: { label: string; value: TimeRange }[] = [
    { label: t('range7d'), value: '7d' },
    { label: t('range30d'), value: '30d' },
    { label: t('range90d'), value: '90d' },
    { label: t('range1y'), value: '1y' },
  ];

  const getPriorityBadgeClass = (priority: 'need' | 'want') => {
    return priority === 'need'
      ? 'bg-success-100 dark:bg-success-900 text-success-800 dark:text-success-200'
      : 'bg-ocean-100 dark:bg-ocean-900 text-ocean-800 dark:text-ocean-200';
  };

  const getRecurrenceBadgeClass = (recurrence: string) => {
    const classes: Record<string, string> = {
      'one-time': 'bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300',
      daily: 'bg-leaf-100 dark:bg-leaf-900 text-leaf-800 dark:text-leaf-200',
      weekly: 'bg-sky-100 dark:bg-sky-900 text-sky-800 dark:text-sky-200',
      monthly: 'bg-sage-100 dark:bg-sage-900 text-sage-800 dark:text-sage-200',
    };
    return classes[recurrence] || classes['one-time'];
  };

  const getSourceBadgeClass = (source: string) => {
    const classes: Record<string, string> = {
      member: 'bg-forest-100 dark:bg-forest-900 text-forest-800 dark:text-forest-200',
      council: 'bg-warning-100 dark:bg-warning-900 text-warning-800 dark:text-warning-200',
      both: 'bg-gradient-to-r from-forest-100 to-warning-100 dark:from-forest-900 dark:to-warning-900 text-stone-800 dark:text-stone-200',
    };
    return classes[source] || classes.member;
  };

  const getSourceLabel = (source: 'member' | 'council' | 'both') => {
    const labels: Record<string, string> = {
      member: t('members'),
      council: t('councils'),
      both: t('both'),
    };
    return labels[source];
  };

  const getRecurrenceLabel = (recurrence: string) => {
    const labels: Record<string, string> = {
      'one-time': t('oneTime'),
      daily: t('daily'),
      weekly: t('weekly'),
      monthly: t('monthly'),
    };
    return labels[recurrence] || recurrence;
  };

  return (
    <div class="space-y-6">
      {/* Time Range Selector */}
      <div class="flex justify-end gap-2">
        <For each={timeRangeOptions}>
          {(option) => (
            <button
              onClick={() => setTimeRange(option.value)}
              class={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange() === option.value
                  ? 'bg-ocean-600 text-white'
                  : 'bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-600'
              }`}
            >
              {option.label}
            </button>
          )}
        </For>
      </div>

      {/* Loading State */}
      <Show when={overviewQuery.isLoading}>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <For each={[1, 2, 3, 4]}>
            {() => (
              <div class="bg-stone-100 dark:bg-stone-700 rounded-lg h-32 animate-pulse" />
            )}
          </For>
        </div>
      </Show>

      {/* Error State */}
      <Show when={overviewQuery.error}>
        <Show
          when={overviewQuery.error?.message.includes('403')}
          fallback={
            <div class="bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-lg p-4">
              <p class="text-danger-700 dark:text-danger-300">
                {t('errorLoading')}: {overviewQuery.error?.message}
              </p>
            </div>
          }
        >
          <div class="bg-white dark:bg-stone-800 rounded-lg shadow-md border border-stone-200 dark:border-stone-700 p-8">
            <div class="text-center">
              <div class="w-16 h-16 bg-warning-100 dark:bg-warning-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span class="text-3xl">🔒</span>
              </div>
              <h2 class="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-2">
                {t('accessDeniedTitle')}
              </h2>
              <p class="text-stone-600 dark:text-stone-400">
                {t('accessDeniedMessage')}
              </p>
            </div>
          </div>
        </Show>
      </Show>

      {/* Overview Cards */}
      <Show when={!overviewQuery.isLoading && overviewQuery.data}>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title={t('totalNeeds')}
            value={overviewQuery.data!.totalActiveNeeds}
            subtitle={t('totalNeedsSubtitle')}
            icon={<span class="text-2xl">🎯</span>}
          />
          <StatCard
            title={t('totalWants')}
            value={overviewQuery.data!.totalActiveWants}
            subtitle={t('totalWantsSubtitle')}
            icon={<span class="text-2xl">💭</span>}
          />
          <StatCard
            title={t('activeMembers')}
            value={overviewQuery.data!.activeMembers}
            subtitle={t('activeMembersSubtitle')}
            icon={<span class="text-2xl">👥</span>}
          />
          <StatCard
            title={t('activeCouncils')}
            value={overviewQuery.data!.activeCouncils}
            subtitle={t('activeCouncilsSubtitle')}
            icon={<span class="text-2xl">🏛️</span>}
          />
        </div>

        {/* Objects vs Services Breakdown */}
        <div class="bg-white dark:bg-stone-800 rounded-lg shadow-md border border-stone-200 dark:border-stone-700 p-6">
          <h3 class="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-4">
            {t('objectsVsServices')}
          </h3>
          <div class="grid grid-cols-2 gap-4">
            <div class="text-center">
              <div class="text-3xl font-bold text-ocean-600 dark:text-ocean-400 mb-1">
                {overviewQuery.data!.objectsVsServices.objects}
              </div>
              <div class="text-sm text-stone-600 dark:text-stone-400">
                {t('objects')}
              </div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold text-forest-600 dark:text-forest-400 mb-1">
                {overviewQuery.data!.objectsVsServices.services}
              </div>
              <div class="text-sm text-stone-600 dark:text-stone-400">
                {t('services')}
              </div>
            </div>
          </div>
        </div>
      </Show>

      {/* Time Series Chart */}
      <Show when={!overviewQuery.isLoading && overviewQuery.data}>
        <AreaChart
          title={t('chartTitle')}
          datasets={[
            {
              label: t('needsLine'),
              data: overviewQuery.data!.timeSeries.cumulativeNeeds,
              color: '#059669', // success-600
            },
            {
              label: t('wantsLine'),
              data: overviewQuery.data!.timeSeries.cumulativeWants,
              color: '#0284c7', // ocean-600
            },
          ]}
          yAxisLabel={t('count')}
          height={300}
          loading={overviewQuery.isLoading}
          stacked={true}
        />
      </Show>

      {/* Items Table */}
      <Show when={!itemsQuery.isLoading && itemsQuery.data}>
        <div class="bg-white dark:bg-stone-800 rounded-lg shadow-md border border-stone-200 dark:border-stone-700 overflow-hidden">
          <div class="p-6 border-b border-stone-200 dark:border-stone-700">
            <h3 class="text-lg font-semibold text-stone-900 dark:text-stone-100">
              {t('itemsTableTitle')}
            </h3>
            <p class="text-sm text-stone-600 dark:text-stone-400 mt-1">
              {t('itemsTableSubtitle')}
            </p>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-stone-50 dark:bg-stone-900">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                    {t('itemName')}
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                    {t('category')}
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                    {t('priority')}
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                    {t('recurrence')}
                  </th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                    {t('unitsNeeded')}
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                    {t('source')}
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white dark:bg-stone-800 divide-y divide-stone-200 dark:divide-stone-700">
                <Show
                  when={itemsQuery.data && itemsQuery.data.length > 0}
                  fallback={
                    <tr>
                      <td colspan="6" class="px-6 py-4 text-center text-stone-500 dark:text-stone-400">
                        {t('noData')}
                      </td>
                    </tr>
                  }
                >
                  <For each={itemsQuery.data}>
                    {(item) => (
                      <tr class="hover:bg-stone-50 dark:hover:bg-stone-700/50 transition-colors">
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-stone-900 dark:text-stone-100">
                          {item.itemName}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-stone-600 dark:text-stone-400">
                          {item.categoryName}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <span class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityBadgeClass(item.priority)}`}>
                            {item.priority === 'need' ? t('need') : t('want')}
                          </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <span class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRecurrenceBadgeClass(item.recurrence)}`}>
                            {getRecurrenceLabel(item.recurrence)}
                          </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-right text-stone-900 dark:text-stone-100">
                          {item.totalUnitsNeeded}
                          <span class="text-xs text-stone-500 dark:text-stone-400 ml-1">
                            ({item.memberCount})
                          </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <span class={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSourceBadgeClass(item.source)}`}>
                            {getSourceLabel(item.source)}
                          </span>
                        </td>
                      </tr>
                    )}
                  </For>
                </Show>
              </tbody>
            </table>
          </div>
        </div>
      </Show>

      {/* Items Loading State */}
      <Show when={itemsQuery.isLoading}>
        <div class="bg-stone-100 dark:bg-stone-700 rounded-lg h-64 animate-pulse" />
      </Show>

      {/* Aggregated Needs by Recurrence */}
      <Show when={!aggregatedQuery.isLoading && aggregatedQuery.data}>
        <div class="bg-white dark:bg-stone-800 rounded-lg shadow-md border border-stone-200 dark:border-stone-700 overflow-hidden">
          <div class="p-6 border-b border-stone-200 dark:border-stone-700">
            <div class="flex items-start gap-3">
              <span class="text-2xl">📊</span>
              <div class="flex-1">
                <h3 class="text-lg font-semibold text-stone-900 dark:text-stone-100">
                  {t('aggregatedTitle')}
                </h3>
                <p class="text-sm text-stone-600 dark:text-stone-400 mt-1">
                  {t('aggregatedDescription')}
                </p>
              </div>
            </div>

            {/* Recurrence Filters */}
            <div class="flex flex-wrap gap-2 mt-4">
              <button
                onClick={() => setSelectedRecurrence('one-time')}
                class={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedRecurrence() === 'one-time'
                    ? 'bg-ocean-600 text-white'
                    : 'bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-600'
                }`}
              >
                {t('oneTimeFilter')}
                <span class="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs rounded-full bg-white/20">
                  {getRecurrenceCount('one-time')}
                </span>
              </button>
              <button
                onClick={() => setSelectedRecurrence('daily')}
                class={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedRecurrence() === 'daily'
                    ? 'bg-ocean-600 text-white'
                    : 'bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-600'
                }`}
              >
                {t('dailyFilter')}
                <span class="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs rounded-full bg-white/20">
                  {getRecurrenceCount('daily')}
                </span>
              </button>
              <button
                onClick={() => setSelectedRecurrence('weekly')}
                class={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedRecurrence() === 'weekly'
                    ? 'bg-ocean-600 text-white'
                    : 'bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-600'
                }`}
              >
                {t('weeklyFilter')}
                <span class="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs rounded-full bg-white/20">
                  {getRecurrenceCount('weekly')}
                </span>
              </button>
              <button
                onClick={() => setSelectedRecurrence('monthly')}
                class={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedRecurrence() === 'monthly'
                    ? 'bg-ocean-600 text-white'
                    : 'bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-600'
                }`}
              >
                {t('monthlyFilter')}
                <span class="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs rounded-full bg-white/20">
                  {getRecurrenceCount('monthly')}
                </span>
              </button>
            </div>
          </div>

          {/* Aggregated Table */}
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-stone-50 dark:bg-stone-900">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                    {t('itemName')}
                  </th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                    {t('needsColumn')}
                  </th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                    {t('wantsColumn')}
                  </th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                    {t('totalColumn')}
                  </th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                    {t('participantsColumn')}
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white dark:bg-stone-800 divide-y divide-stone-200 dark:divide-stone-700">
                <Show
                  when={currentRecurrenceData()?.items && currentRecurrenceData()!.items.length > 0}
                  fallback={
                    <tr>
                      <td colspan="5" class="px-6 py-8 text-center text-stone-500 dark:text-stone-400">
                        <div class="flex flex-col items-center gap-2">
                          <span class="text-2xl">✅</span>
                          <p>{getEmptyMessage()}</p>
                        </div>
                      </td>
                    </tr>
                  }
                >
                  <For each={currentRecurrenceData()!.items}>
                    {(item) => (
                      <tr class={`hover:bg-stone-50 dark:hover:bg-stone-700/50 transition-colors ${getRowClass(item)}`}>
                        <td class="px-6 py-4 text-sm">
                          <div class="flex flex-col">
                            <span class="font-medium text-stone-900 dark:text-stone-100">
                              {item.itemName}
                            </span>
                            <span class={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium w-fit mt-1 ${
                              item.categoryName === 'Objects'
                                ? 'bg-ocean-100 dark:bg-ocean-900 text-ocean-800 dark:text-ocean-200'
                                : 'bg-forest-100 dark:bg-forest-900 text-forest-800 dark:text-forest-200'
                            }`}>
                              {item.categoryName}
                            </span>
                          </div>
                        </td>
                        <td class="px-6 py-4 text-right text-sm">
                          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 dark:bg-success-900 text-success-800 dark:text-success-200">
                            {item.needsTotal}
                          </span>
                        </td>
                        <td class="px-6 py-4 text-right text-sm">
                          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-ocean-100 dark:bg-ocean-900 text-ocean-800 dark:text-ocean-200">
                            {item.wantsTotal}
                          </span>
                        </td>
                        <td class="px-6 py-4 text-right text-sm">
                          <span class="text-lg font-bold text-stone-900 dark:text-stone-100">
                            {item.totalUnits}
                          </span>
                        </td>
                        <td class="px-6 py-4 text-right text-sm text-stone-600 dark:text-stone-400">
                          <div class="flex items-center justify-end gap-1">
                            <span class="text-base">👥</span>
                            <span class="font-medium">{item.participantCount}</span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </For>
                </Show>
              </tbody>
            </table>
          </div>
        </div>
      </Show>

      {/* Aggregated Loading State */}
      <Show when={aggregatedQuery.isLoading}>
        <div class="bg-stone-100 dark:bg-stone-700 rounded-lg h-64 animate-pulse" />
      </Show>
    </div>
  );
};
