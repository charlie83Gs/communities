import { Component, Show, For, createMemo } from 'solid-js';
import { A } from '@solidjs/router';
import { useCommunity } from '@/contexts/CommunityContext';
import { useCommunityStatsSummaryQuery } from '@/hooks/queries/useCommunityStats';
import { useCommunityWealthQuery } from '@/hooks/queries/useWealth';
import { usePools } from '@/hooks/queries/usePools';
import { useCanManageItemsQuery } from '@/hooks/queries/useCanManageItemsQuery';
import { makeTranslator } from '@/i18n/makeTranslator';
import { resourcesTabDict } from './ResourcesTab.i18n';
import { InfoTooltip } from '@/components/common/InfoTooltip';

interface ResourcesTabProps {
  communityId: string;
}

export const ResourcesTab: Component<ResourcesTabProps> = (props) => {
  const t = makeTranslator(resourcesTabDict, 'resourcesTab');
  const community = useCommunity();

  // Fetch stats
  const statsQuery = useCommunityStatsSummaryQuery(() => props.communityId);

  // Fetch recent items (limited)
  const wealthQuery = useCommunityWealthQuery(() => props.communityId);
  const poolsQuery = usePools(() => props.communityId);

  // Check items management permission
  const canManageItemsQuery = useCanManageItemsQuery(() => props.communityId);

  // Get recent items (first 3), excluding pool contributions
  const recentWealth = createMemo(() => {
    const items = wealthQuery.data || [];
    // Filter out wealth items where sharingTarget === 'pool'
    const nonPoolItems = items.filter(item => item.sharingTarget !== 'pool');
    return nonPoolItems.slice(0, 3);
  });

  const recentPools = createMemo(() => {
    const pools = poolsQuery.data || [];
    return pools.slice(0, 3);
  });

  // Helper for count formatting
  const formatCount = (template: string, count: number): string => {
    return template.replace('{{count}}', String(count));
  };

  return (
    <div class="space-y-6">
      {/* Resource Cards Grid */}
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Wealth Card */}
        <div class="p-4 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg">
          <div class="flex items-center gap-2 mb-3">
            <span class="text-lg">📦</span>
            <h3 class="text-sm font-semibold text-stone-900 dark:text-stone-100">
              {t('wealthTitle')}
            </h3>
            <InfoTooltip text={t('tooltips.wealth')} position="right" iconSize="xs" />
          </div>
          <div class="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-1">
            <Show when={!statsQuery.isLoading} fallback={<span class="text-sm text-stone-400">...</span>}>
              {formatCount(t('itemsCount'), statsQuery.data?.wealthCount || 0)}
            </Show>
          </div>
          <p class="text-xs text-stone-500 dark:text-stone-400 mb-4">
            {t('wealthDesc')}
          </p>
          <div class="flex gap-2">
            <Show when={community.canCreateWealth()}>
              <A
                href={`/communities/${props.communityId}/wealth/create`}
                class="px-3 py-1.5 text-xs bg-ocean-600 text-white rounded hover:bg-ocean-700"
              >
                + {t('share')}
              </A>
            </Show>
            <A
              href={`/communities/${props.communityId}/wealth`}
              class="px-3 py-1.5 text-xs bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 rounded hover:bg-stone-300 dark:hover:bg-stone-600"
            >
              {t('viewAll')}
            </A>
          </div>
        </div>

        {/* Pools Card */}
        <Show
          when={community.isPoolsEnabled()}
          fallback={
            <div class="p-4 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg opacity-50">
              <div class="flex items-center gap-2 mb-3">
                <span class="text-lg">📥</span>
                <h3 class="text-sm font-semibold text-stone-500 dark:text-stone-400">
                  {t('poolsTitle')}
                </h3>
                <InfoTooltip text={t('tooltips.pools')} position="right" iconSize="xs" />
              </div>
              <p class="text-xs text-stone-500 dark:text-stone-400">
                {t('poolsDisabled')}
              </p>
            </div>
          }
        >
          <div class="p-4 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg">
            <div class="flex items-center gap-2 mb-3">
              <span class="text-lg">📥</span>
              <h3 class="text-sm font-semibold text-stone-900 dark:text-stone-100">
                {t('poolsTitle')}
              </h3>
              <InfoTooltip text={t('tooltips.pools')} position="right" iconSize="xs" />
            </div>
            <div class="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-1">
              <Show when={!statsQuery.isLoading} fallback={<span class="text-sm text-stone-400">...</span>}>
                {formatCount(t('poolsCount'), statsQuery.data?.poolCount || 0)}
              </Show>
            </div>
            <p class="text-xs text-stone-500 dark:text-stone-400 mb-4">
              {t('poolsDesc')}
            </p>
            <div class="flex gap-2">
              <Show when={community.canCreatePools()}>
                <A
                  href={`/communities/${props.communityId}/pools/create`}
                  class="px-3 py-1.5 text-xs bg-ocean-600 text-white rounded hover:bg-ocean-700"
                >
                  + {t('create')}
                </A>
              </Show>
              <A
                href={`/communities/${props.communityId}/pools`}
                class="px-3 py-1.5 text-xs bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 rounded hover:bg-stone-300 dark:hover:bg-stone-600"
              >
                {t('viewAll')}
              </A>
            </div>
          </div>
        </Show>

        {/* Needs Card */}
        <Show
          when={community.isNeedsEnabled()}
          fallback={
            <div class="p-4 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg opacity-50">
              <div class="flex items-center gap-2 mb-3">
                <span class="text-lg">📋</span>
                <h3 class="text-sm font-semibold text-stone-500 dark:text-stone-400">
                  {t('needsTitle')}
                </h3>
                <InfoTooltip text={t('tooltips.needs')} position="right" iconSize="xs" />
              </div>
              <p class="text-xs text-stone-500 dark:text-stone-400">
                {t('needsDisabled')}
              </p>
            </div>
          }
        >
          <div class="p-4 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg">
            <div class="flex items-center gap-2 mb-3">
              <span class="text-lg">📋</span>
              <h3 class="text-sm font-semibold text-stone-900 dark:text-stone-100">
                {t('needsTitle')}
              </h3>
              <InfoTooltip text={t('tooltips.needs')} position="right" iconSize="xs" />
            </div>
            <div class="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-1">
              <Show when={!statsQuery.isLoading} fallback={<span class="text-sm text-stone-400">...</span>}>
                {formatCount(t('needsCount'), statsQuery.data?.needsCount || 0)}
              </Show>
            </div>
            <p class="text-xs text-stone-500 dark:text-stone-400 mb-4">
              {t('needsDesc')}
            </p>
            <div class="flex gap-2">
              <Show when={community.canPublishNeeds()}>
                <A
                  href={`/communities/${props.communityId}/needs/create`}
                  class="px-3 py-1.5 text-xs bg-ocean-600 text-white rounded hover:bg-ocean-700"
                >
                  + {t('create')}
                </A>
              </Show>
              <A
                href={`/communities/${props.communityId}/needs`}
                class="px-3 py-1.5 text-xs bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 rounded hover:bg-stone-300 dark:hover:bg-stone-600"
              >
                {t('viewAll')}
              </A>
            </div>
          </div>
        </Show>

        {/* Items Card - Only shown to users who can manage items */}
        <Show when={canManageItemsQuery.data?.canManage}>
          <div class="p-4 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg">
            <div class="flex items-center gap-2 mb-3">
              <span class="text-lg">🏷️</span>
              <h3 class="text-sm font-semibold text-stone-900 dark:text-stone-100">
                {t('itemsTitle')}
              </h3>
              <InfoTooltip text={t('tooltips.items')} position="right" iconSize="xs" />
            </div>
            <p class="text-xs text-stone-500 dark:text-stone-400 mb-4">
              {t('itemsDesc')}
            </p>
            <div class="flex gap-2">
              <A
                href={`/communities/${props.communityId}/items`}
                class="px-3 py-1.5 text-xs bg-ocean-600 text-white rounded hover:bg-ocean-700"
              >
                {t('manage')}
              </A>
            </div>
          </div>
        </Show>
      </div>

      {/* Recent Items Preview */}
      <div class="space-y-6">
        {/* Recent Wealth Items */}
        <div class="p-4 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg">
          <h3 class="text-sm font-semibold text-stone-900 dark:text-stone-100 mb-4">
            {t('recentWealth')}
          </h3>
          <Show
            when={!wealthQuery.isLoading}
            fallback={
              <div class="text-sm text-stone-500 dark:text-stone-400">{t('loading')}</div>
            }
          >
            <Show
              when={recentWealth().length > 0}
              fallback={
                <div class="text-sm text-stone-500 dark:text-stone-400">{t('noRecentWealth')}</div>
              }
            >
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <For each={recentWealth()}>
                  {(item) => (
                    <A
                      href={`/wealth/${item.id}`}
                      class="p-3 bg-stone-50 dark:bg-stone-900 rounded border border-stone-200 dark:border-stone-700 hover:border-ocean-400 dark:hover:border-ocean-500 transition-colors"
                    >
                      <div class="font-medium text-sm text-stone-900 dark:text-stone-100 truncate">
                        {item.title}
                      </div>
                      <div class="text-xs text-stone-500 dark:text-stone-400 mt-1">
                        {item.unitsAvailable != null
                          ? formatCount(t('unitsAvailable'), item.unitsAvailable)
                          : ''}
                      </div>
                    </A>
                  )}
                </For>
              </div>
            </Show>
          </Show>
        </div>

        {/* Recent Pools */}
        <Show when={community.isPoolsEnabled()}>
          <div class="p-4 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg">
            <h3 class="text-sm font-semibold text-stone-900 dark:text-stone-100 mb-4">
              {t('recentPools')}
            </h3>
            <Show
              when={!poolsQuery.isLoading}
              fallback={
                <div class="text-sm text-stone-500 dark:text-stone-400">{t('loading')}</div>
              }
            >
              <Show
                when={recentPools().length > 0}
                fallback={
                  <div class="text-sm text-stone-500 dark:text-stone-400">{t('noRecentPools')}</div>
                }
              >
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <For each={recentPools()}>
                    {(pool) => (
                      <A
                        href={`/communities/${props.communityId}/pools/${pool.id}`}
                        class="p-3 bg-stone-50 dark:bg-stone-900 rounded border border-stone-200 dark:border-stone-700 hover:border-ocean-400 dark:hover:border-ocean-500 transition-colors"
                      >
                        <div class="font-medium text-sm text-stone-900 dark:text-stone-100 truncate">
                          {pool.name}
                        </div>
                        <div class="text-xs text-stone-500 dark:text-stone-400 mt-1">
                          {pool.inventory && pool.inventory.length > 0
                            ? formatCount(
                                t('totalUnits'),
                                pool.inventory.reduce((sum, inv) => sum + inv.unitsAvailable, 0)
                              )
                            : ''}
                        </div>
                      </A>
                    )}
                  </For>
                </div>
              </Show>
            </Show>
          </div>
        </Show>
      </div>
    </div>
  );
};
