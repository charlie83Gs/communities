import { Component, createSignal, Show, createMemo } from 'solid-js';
import { WealthStatistics } from './WealthStatistics';
import { TrustStatistics } from './TrustStatistics';
import { useCommunity } from '@/contexts/CommunityContext';
import { useMyTrustSummaryQuery } from '@/hooks/queries/useMyTrustSummaryQuery';
import { makeTranslator } from '@/i18n/makeTranslator';
import { healthAnalyticsPanelDict } from './HealthAnalyticsPanel.i18n';

type HealthTab = 'wealth' | 'trust';

interface HealthAnalyticsPanelProps {
  communityId: string;
}

export const HealthAnalyticsPanel: Component<HealthAnalyticsPanelProps> = (props) => {
  const t = makeTranslator(healthAnalyticsPanelDict, 'healthAnalyticsPanel');
  const { isAdmin, community } = useCommunity();
  const trustSummaryQuery = useMyTrustSummaryQuery(() => props.communityId);
  const [activeTab, setActiveTab] = createSignal<HealthTab>('wealth');

  // Check if user has permission to view health analytics
  // Admins OR members with sufficient trust can view health analytics
  const canViewHealthAnalytics = createMemo(() => {
    if (isAdmin()) return true;
    const comm = community();
    const trust = trustSummaryQuery.data;
    if (!comm || !trust) return false;

    // Extract trust requirement value
    const minTrust = comm.minTrustForHealthAnalytics;
    if (!minTrust) return false;

    // Handle both number and level types
    if (minTrust.type === 'number') {
      return trust.points >= (minTrust.value as number);
    }
    // For 'level' type, we would need to resolve the level threshold
    // For now, default to 20 if type is level (this should be enhanced)
    return trust.points >= 20;
  });

  // Loading state while checking permissions
  const isCheckingPermissions = createMemo(() => {
    // If admin, no need to wait for trust data
    if (isAdmin()) return false;
    // If not admin, wait for trust data to load
    return trustSummaryQuery.isLoading;
  });

  return (
    <Show
      when={!isCheckingPermissions()}
      fallback={
        <div class="p-8 text-center">
          <div class="w-16 h-16 bg-ocean-100 dark:bg-ocean-900 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span class="text-3xl">⏳</span>
          </div>
          <h2 class="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-2">
            {t('checkingPermissions')}
          </h2>
        </div>
      }
    >
      <Show
        when={canViewHealthAnalytics()}
        fallback={
          <div class="p-8 text-center">
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
        }
      >
      <div>
        {/* Description */}
        <div class="mb-6">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 bg-ocean-100 dark:bg-ocean-900 rounded-full flex items-center justify-center">
              <span class="text-xl">📊</span>
            </div>
            <h2 class="text-2xl font-bold text-stone-900 dark:text-stone-100">
              {t('pageTitle')}
            </h2>
          </div>
          <p class="text-stone-600 dark:text-stone-400 ml-13">
            {t('pageDescription')}
          </p>
        </div>

        {/* Tab Navigation */}
        <div class="bg-stone-50 dark:bg-stone-900 rounded-lg shadow-sm border border-stone-200 dark:border-stone-700 mb-6">
          <div class="flex border-b border-stone-200 dark:border-stone-700">
            <button
              onClick={() => setActiveTab('wealth')}
              class={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab() === 'wealth'
                  ? 'text-ocean-600 dark:text-ocean-400 border-b-2 border-ocean-600 dark:border-ocean-400 bg-ocean-50/50 dark:bg-ocean-900/20'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-50 dark:hover:bg-stone-700/50'
              }`}
            >
              <div class="flex items-center justify-center gap-2">
                <span class="text-lg">💰</span>
                <span>{t('wealthTab')}</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('trust')}
              class={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab() === 'trust'
                  ? 'text-ocean-600 dark:text-ocean-400 border-b-2 border-ocean-600 dark:border-ocean-400 bg-ocean-50/50 dark:bg-ocean-900/20'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-50 dark:hover:bg-stone-700/50'
              }`}
            >
              <div class="flex items-center justify-center gap-2">
                <span class="text-lg">🤝</span>
                <span>{t('trustTab')}</span>
              </div>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <Show when={activeTab() === 'wealth'}>
          <WealthStatistics communityId={props.communityId} />
        </Show>
        <Show when={activeTab() === 'trust'}>
          <TrustStatistics communityId={props.communityId} />
        </Show>
      </div>
      </Show>
    </Show>
  );
};
