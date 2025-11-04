import { Component, Show, For } from 'solid-js';
import type { TrustSummary } from '@/types/user.types';
import { makeTranslator } from '@/i18n/makeTranslator';
import { myTrustDict } from '@/pages/protected/my-trust.i18n';

interface TrustSummaryCardProps {
  summary: TrustSummary | undefined;
  loading: boolean;
}

export const TrustSummaryCard: Component<TrustSummaryCardProps> = (props) => {
  const t = makeTranslator(myTrustDict, 'myTrust');

  return (
    <div class="bg-white dark:bg-stone-800 rounded-lg shadow-lg p-6 border border-stone-200 dark:border-stone-700">
      <h2 class="text-xl font-semibold mb-6 text-stone-900 dark:text-stone-100">{t('summaryTitle')}</h2>

      <Show when={!props.loading && props.summary} fallback={
        <div class="space-y-4">
          <div class="animate-pulse bg-stone-200 dark:bg-stone-700 h-16 rounded" />
          <div class="animate-pulse bg-stone-200 dark:bg-stone-700 h-16 rounded" />
          <div class="animate-pulse bg-stone-200 dark:bg-stone-700 h-16 rounded" />
        </div>
      }>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Total Trust */}
          <div class="bg-ocean-50 dark:bg-ocean-900/30 rounded-lg p-4 border border-ocean-200 dark:border-ocean-700">
            <div class="text-sm text-stone-600 dark:text-stone-400 mb-1">{t('totalTrust')}</div>
            <div class="text-3xl font-bold text-ocean-600 dark:text-ocean-400">{props.summary?.totalTrustPoints ?? 0}</div>
          </div>

          {/* Awards Received */}
          <div class="bg-stone-100 dark:bg-stone-700/50 rounded-lg p-4 border border-stone-200 dark:border-stone-600">
            <div class="text-sm text-stone-600 dark:text-stone-400 mb-1">{t('awardsReceived')}</div>
            <div class="text-3xl font-bold text-stone-900 dark:text-stone-100">{props.summary?.totalAwardsReceived ?? 0}</div>
          </div>

          {/* Awards Removed */}
          <div class="bg-stone-100 dark:bg-stone-700/50 rounded-lg p-4 border border-stone-200 dark:border-stone-600">
            <div class="text-sm text-stone-600 dark:text-stone-400 mb-1">{t('awardsRemoved')}</div>
            <div class="text-3xl font-bold text-sunset-600 dark:text-sunset-400">{props.summary?.totalAwardsRemoved ?? 0}</div>
          </div>
        </div>

        {/* By Community Breakdown */}
        <Show when={props.summary?.trustByCommunity && props.summary.trustByCommunity.length > 0}>
          <div class="border-t border-stone-200 dark:border-stone-700 pt-4">
            <h3 class="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-3">{t('byCommunity')}</h3>
            <div class="space-y-2">
              <For each={props.summary?.trustByCommunity}>
                {(community) => (
                  <div class="flex items-center justify-between p-3 bg-stone-100 dark:bg-stone-700/50 rounded-lg border border-stone-200 dark:border-stone-600">
                    <span class="text-sm text-stone-900 dark:text-stone-100">{community.communityName}</span>
                    <span class="text-sm font-semibold text-ocean-600 dark:text-ocean-400">{community.trustPoints} {t('points')}</span>
                  </div>
                )}
              </For>
            </div>
          </div>
        </Show>
      </Show>
    </div>
  );
};
