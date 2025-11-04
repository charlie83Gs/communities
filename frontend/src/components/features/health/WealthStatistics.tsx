import { Component, createSignal, For, Show } from 'solid-js';
import { StatCard } from '@/components/common/StatCard';
import { LineChart } from '@/components/common/LineChart';
import { useWealthOverviewQuery, useWealthItemsQuery } from '@/hooks/queries/useHealthQueries';
import type { TimeRange } from '@/types/health.types';
import { makeTranslator } from '@/i18n/makeTranslator';
import { wealthStatisticsDict } from './WealthStatistics.i18n';

interface WealthStatisticsProps {
  communityId: string;
}

export const WealthStatistics: Component<WealthStatisticsProps> = (props) => {
  const t = makeTranslator(wealthStatisticsDict, 'wealthStats');
  const [timeRange, setTimeRange] = createSignal<TimeRange>('30d');

  const overviewQuery = useWealthOverviewQuery(
    () => props.communityId,
    timeRange
  );

  const itemsQuery = useWealthItemsQuery(
    () => props.communityId,
    timeRange
  );

  const timeRangeOptions: { label: string; value: TimeRange }[] = [
    { label: t('range7d'), value: '7d' },
    { label: t('range30d'), value: '30d' },
    { label: t('range90d'), value: '90d' },
    { label: t('range1y'), value: '1y' },
  ];

  const renderSparkline = (trend: number[]) => {
    if (!trend || trend.length === 0) return null;

    const max = Math.max(...trend, 1);
    const points = trend
      .map((value, index) => {
        const x = (index / (trend.length - 1)) * 100;
        const y = 100 - (value / max) * 100;
        return `${x},${y}`;
      })
      .join(' ');

    return (
      <svg class="w-16 h-8" viewBox="0 0 100 100" preserveAspectRatio="none">
        <polyline
          points={points}
          fill="none"
          stroke="currentColor"
          stroke-width="3"
          class="text-ocean-500"
        />
      </svg>
    );
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
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <For each={[1, 2, 3]}>
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
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title={t('openShares')}
            value={overviewQuery.data!.openShares}
            subtitle={t('openSharesSubtitle')}
            icon={<span class="text-2xl">📦</span>}
          />
          <StatCard
            title={t('totalShares')}
            value={overviewQuery.data!.totalShares}
            subtitle={t('totalSharesSubtitle')}
            icon={<span class="text-2xl">📊</span>}
          />
          <StatCard
            title={t('activeCategories')}
            value={overviewQuery.data!.activeCategories}
            subtitle={t('activeCategoriesSubtitle')}
            icon={<span class="text-2xl">🏷️</span>}
          />
        </div>
      </Show>

      {/* Time Series Chart */}
      <Show when={!overviewQuery.isLoading && overviewQuery.data}>
        <LineChart
          title={t('chartTitle')}
          datasets={[
            {
              label: t('shares'),
              data: overviewQuery.data!.timeSeries.shares,
              color: '#0284c7', // ocean-600
            },
            {
              label: t('requests'),
              data: overviewQuery.data!.timeSeries.requests,
              color: '#16a34a', // forest-600
            },
            {
              label: t('fulfilled'),
              data: overviewQuery.data!.timeSeries.fulfilled,
              color: '#059669', // success-600
            },
          ]}
          yAxisLabel={t('count')}
          height={300}
          loading={overviewQuery.isLoading}
        />
      </Show>

      {/* Items Table */}
      <Show when={!itemsQuery.isLoading && itemsQuery.data}>
        <div class="bg-white dark:bg-stone-800 rounded-lg shadow-md border border-stone-200 dark:border-stone-700 overflow-hidden">
          <div class="p-6 border-b border-stone-200 dark:border-stone-700">
            <h3 class="text-lg font-semibold text-stone-900 dark:text-stone-100">
              {t('itemsTableTitle')}
            </h3>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-stone-50 dark:bg-stone-900">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                    {t('category')}
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                    {t('subcategory')}
                  </th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                    {t('shareCount')}
                  </th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                    {t('valuePoints')}
                  </th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                    {t('trend')}
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white dark:bg-stone-800 divide-y divide-stone-200 dark:divide-stone-700">
                <Show
                  when={itemsQuery.data && itemsQuery.data.length > 0}
                  fallback={
                    <tr>
                      <td colspan="5" class="px-6 py-4 text-center text-stone-500 dark:text-stone-400">
                        {t('noData')}
                      </td>
                    </tr>
                  }
                >
                  <For each={itemsQuery.data}>
                    {(item) => (
                      <tr class="hover:bg-stone-50 dark:hover:bg-stone-700/50 transition-colors">
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-stone-900 dark:text-stone-100">
                          {item.category}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-stone-600 dark:text-stone-400">
                          {item.subcategory || '-'}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-right text-stone-900 dark:text-stone-100">
                          {item.shareCount}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-right text-stone-900 dark:text-stone-100">
                          {item.valuePoints}
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-right">
                          {renderSparkline(item.trend)}
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
    </div>
  );
};
