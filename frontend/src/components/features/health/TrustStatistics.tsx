import { Component, createSignal, For, Show } from 'solid-js';
import { StatCard } from '@/components/common/StatCard';
import { AreaChart } from '@/components/common/AreaChart';
import { useTrustOverviewQuery, useTrustDistributionQuery } from '@/hooks/queries/useHealthQueries';
import type { TimeRange } from '@/types/health.types';
import { makeTranslator } from '@/i18n/makeTranslator';
import { trustStatisticsDict } from './TrustStatistics.i18n';

interface TrustStatisticsProps {
  communityId: string;
}

export const TrustStatistics: Component<TrustStatisticsProps> = (props) => {
  const t = makeTranslator(trustStatisticsDict, 'trustStats');
  const [timeRange, setTimeRange] = createSignal<TimeRange>('30d');

  const overviewQuery = useTrustOverviewQuery(
    () => props.communityId,
    timeRange
  );

  const distributionQuery = useTrustDistributionQuery(
    () => props.communityId
  );

  const timeRangeOptions: { label: string; value: TimeRange }[] = [
    { label: t('range7d'), value: '7d' },
    { label: t('range30d'), value: '30d' },
    { label: t('range90d'), value: '90d' },
    { label: t('range1y'), value: '1y' },
  ];

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
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title={t('totalTrust')}
            value={overviewQuery.data!.totalTrust}
            subtitle={t('totalTrustSubtitle')}
            icon={<span class="text-2xl">🤝</span>}
          />
          <StatCard
            title={t('peerTrust')}
            value={overviewQuery.data!.totalPeerTrust}
            subtitle={t('peerTrustSubtitle')}
            icon={<span class="text-2xl">👥</span>}
          />
          <StatCard
            title={t('adminTrust')}
            value={overviewQuery.data!.totalAdminTrust}
            subtitle={t('adminTrustSubtitle')}
            icon={<span class="text-2xl">🛡️</span>}
          />
          <StatCard
            title={t('averageTrust')}
            value={overviewQuery.data!.averageTrust.toFixed(1)}
            subtitle={t('averageTrustSubtitle')}
            icon={<span class="text-2xl">📈</span>}
          />
          <StatCard
            title={t('trustPerDay')}
            value={overviewQuery.data!.trustPerDay.toFixed(1)}
            subtitle={t('trustPerDaySubtitle')}
            icon={<span class="text-2xl">⚡</span>}
          />
        </div>
      </Show>

      {/* Time Series Chart */}
      <Show when={!overviewQuery.isLoading && overviewQuery.data}>
        <AreaChart
          title={t('chartTitle')}
          datasets={[
            {
              label: t('peerTrustLine'),
              data: overviewQuery.data!.timeSeries.cumulativePeerTrust,
              color: '#16a34a', // forest-600
            },
            {
              label: t('adminTrustLine'),
              data: overviewQuery.data!.timeSeries.cumulativeAdminTrust,
              color: '#8b5cf6', // purple-500
            },
          ]}
          yAxisLabel={t('trustPoints')}
          height={300}
          loading={overviewQuery.isLoading}
          stacked={true}
        />
      </Show>

      {/* Distribution Table */}
      <Show when={!distributionQuery.isLoading && distributionQuery.data}>
        <div class="bg-white dark:bg-stone-800 rounded-lg shadow-md border border-stone-200 dark:border-stone-700 overflow-hidden">
          <div class="p-6 border-b border-stone-200 dark:border-stone-700">
            <h3 class="text-lg font-semibold text-stone-900 dark:text-stone-100">
              {t('distributionTableTitle')}
            </h3>
            <p class="text-sm text-stone-600 dark:text-stone-400 mt-1">
              {t('distributionTableSubtitle')}
            </p>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-stone-50 dark:bg-stone-900">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                    {t('trustLevel')}
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                    {t('scoreRange')}
                  </th>
                  <th class="px-6 py-3 text-right text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                    {t('userCount')}
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                    {t('percentage')}
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white dark:bg-stone-800 divide-y divide-stone-200 dark:divide-stone-700">
                <Show
                  when={distributionQuery.data && distributionQuery.data.length > 0}
                  fallback={
                    <tr>
                      <td colspan="4" class="px-6 py-4 text-center text-stone-500 dark:text-stone-400">
                        {t('noData')}
                      </td>
                    </tr>
                  }
                >
                  <For each={distributionQuery.data}>
                    {(level: { levelName: string; scoreRange: string; userCount: number }) => {
                      const totalUsers = distributionQuery.data!.reduce(
                        (sum: number, l: { userCount: number }) => sum + l.userCount,
                        0
                      );
                      const percentage = totalUsers > 0
                        ? ((level.userCount / totalUsers) * 100).toFixed(1)
                        : '0.0';

                      return (
                        <tr class="hover:bg-stone-50 dark:hover:bg-stone-700/50 transition-colors">
                          <td class="px-6 py-4 whitespace-nowrap">
                            <div class="flex items-center gap-2">
                              <div class="w-3 h-3 rounded-full bg-gradient-to-br from-forest-500 to-ocean-500" />
                              <span class="text-sm font-medium text-stone-900 dark:text-stone-100">
                                {level.levelName}
                              </span>
                            </div>
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap text-sm text-stone-600 dark:text-stone-400">
                            {level.scoreRange}
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-stone-900 dark:text-stone-100">
                            {level.userCount}
                          </td>
                          <td class="px-6 py-4 whitespace-nowrap">
                            <div class="flex items-center gap-2">
                              <div class="flex-1 bg-stone-200 dark:bg-stone-700 rounded-full h-2 max-w-[200px]">
                                <div
                                  class="bg-gradient-to-r from-forest-500 to-ocean-500 h-2 rounded-full transition-all"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span class="text-sm text-stone-600 dark:text-stone-400 min-w-[3rem] text-right">
                                {percentage}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    }}
                  </For>
                </Show>
              </tbody>
            </table>
          </div>
        </div>
      </Show>

      {/* Distribution Loading State */}
      <Show when={distributionQuery.isLoading}>
        <div class="bg-stone-100 dark:bg-stone-700 rounded-lg h-64 animate-pulse" />
      </Show>
    </div>
  );
};
