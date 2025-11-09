import { Component, For, Show } from 'solid-js';
import { useAggregatedNeedsQuery } from '@/hooks/queries/useNeeds';
import type { NeedAggregation } from '@/types/needs.types';
import { Card } from '@/components/common/Card';
import { makeTranslator } from '@/i18n/makeTranslator';
import { needsAggregationDict } from '@/components/features/needs/NeedsAggregationView.i18n';

interface NeedsAggregationViewProps {
  communityId: string;
}

export const NeedsAggregationView: Component<NeedsAggregationViewProps> = (props) => {
  const t = makeTranslator(needsAggregationDict, 'needsAggregation');

  const aggregatedQuery = useAggregatedNeedsQuery(() => props.communityId);

  const getRecurrenceLabel = (recurrence: string) => {
    if (recurrence === 'daily') return t('daily');
    if (recurrence === 'weekly') return t('weekly');
    if (recurrence === 'monthly') return t('monthly');
    if (recurrence === 'one-time') return t('oneTime');
    return recurrence;
  };

  const getMemberLabel = (count: number) => {
    return count === 1 ? t('members') : t('membersPlural');
  };

  const getItemKindIcon = (kind: 'object' | 'service') => {
    return kind === 'object' ? '📦' : '🛠️';
  };

  const getRecurrenceBadgeClass = (recurrence: string) => {
    if (recurrence === 'one-time')
      return 'bg-stone-100 dark:bg-stone-700 text-stone-800 dark:text-stone-200';
    return 'bg-leaf-100 dark:bg-leaf-900 text-leaf-800 dark:text-leaf-200';
  };

  const AggregationItem: Component<{ item: NeedAggregation }> = (itemProps) => (
    <Card class="p-4 hover:shadow-lg transition-shadow">
      <div class="flex items-start gap-4">
        {/* Item Icon */}
        <div class="text-4xl">{getItemKindIcon(itemProps.item.itemKind)}</div>

        {/* Main Content */}
        <div class="flex-1">
          <div class="flex items-start justify-between mb-2">
            <div>
              <h4 class="text-lg font-semibold text-stone-900 dark:text-stone-100">
                {itemProps.item.itemName}
              </h4>
              <span
                class={`inline-block mt-1 px-2 py-1 text-xs rounded-full font-semibold ${getRecurrenceBadgeClass(itemProps.item.recurrence)}`}
              >
                {getRecurrenceLabel(itemProps.item.recurrence)}
              </span>
            </div>
            {/* Total Units - Large and Prominent */}
            <div class="text-right">
              <div class="text-3xl font-bold text-ocean-700 dark:text-ocean-300">
                {itemProps.item.totalUnitsNeeded}
              </div>
              <div class="text-xs text-stone-600 dark:text-stone-400">{t('unitsLabel')}</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div class="w-full bg-stone-200 dark:bg-stone-700 rounded-full h-2 mb-2">
            <div
              class="bg-ocean-600 dark:bg-ocean-400 h-2 rounded-full transition-all"
              style={{ width: `${Math.min(100, (itemProps.item.totalUnitsNeeded / 100) * 100)}%` }}
            />
          </div>

          {/* Member Count */}
          <p class="text-sm text-stone-600 dark:text-stone-400">
            <span class="font-semibold text-stone-900 dark:text-stone-100">
              {itemProps.item.memberCount}
            </span>{' '}
            {getMemberLabel(itemProps.item.memberCount)} {t('requesting')}
          </p>
        </div>
      </div>
    </Card>
  );

  return (
    <div class="space-y-6">
      <Show
        when={!aggregatedQuery.isLoading}
        fallback={
          <Card class="p-4">
            <p class="text-center text-stone-600 dark:text-stone-400">{t('loading')}</p>
          </Card>
        }
      >
        <Show when={aggregatedQuery.data}>
          {/* Essential Needs Section */}
          <div>
            <h3 class="text-xl font-bold mb-4 text-danger-700 dark:text-danger-400">
              {t('needsSection')}
            </h3>
            <Show
              when={aggregatedQuery.data!.needs.length > 0}
              fallback={
                <Card class="p-6 text-center">
                  <p class="text-stone-600 dark:text-stone-400">{t('emptyNeeds')}</p>
                </Card>
              }
            >
              <div class="space-y-3">
                <For each={aggregatedQuery.data!.needs}>
                  {(item) => <AggregationItem item={item} />}
                </For>
              </div>
            </Show>
          </div>

          {/* Desired Items Section */}
          <div>
            <h3 class="text-xl font-bold mb-4 text-ocean-700 dark:text-ocean-400">
              {t('wantsSection')}
            </h3>
            <Show
              when={aggregatedQuery.data!.wants.length > 0}
              fallback={
                <Card class="p-6 text-center">
                  <p class="text-stone-600 dark:text-stone-400">{t('emptyWants')}</p>
                </Card>
              }
            >
              <div class="space-y-3">
                <For each={aggregatedQuery.data!.wants}>
                  {(item) => <AggregationItem item={item} />}
                </For>
              </div>
            </Show>
          </div>
        </Show>
      </Show>
    </div>
  );
};

export default NeedsAggregationView;
