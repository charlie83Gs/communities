import { Component, Show, createMemo } from 'solid-js';
import { A } from '@solidjs/router';
import type { Wealth } from '@/types/wealth.types';
import { makeTranslator } from '@/i18n/makeTranslator';
import { wealthCardDict } from '@/components/features/wealth/WealthCard.i18n';

interface WealthCardProps {
  wealth: Wealth;
}

export const WealthCard: Component<WealthCardProps> = (props) => {
  const t = makeTranslator(wealthCardDict, 'wealthCard');

  const isActive = createMemo(() => props.wealth.status === 'active');
  const isUnitBased = createMemo(() => props.wealth.distributionType === 'unit_based');

  const timeLabel = () =>
    props.wealth.durationType === 'timebound' ? t('timebound') : t('unlimited');

  const distLabel = () =>
    props.wealth.distributionType === 'unit_based' ? t('unit_based') : t('request_based');

  const statusBadgeClass = () => {
    if (isActive()) return 'bg-success-100 dark:bg-success-900 text-success-700 dark:text-success-300';
    if (props.wealth.status === 'fulfilled') return 'bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300';
    return 'bg-warning-100 dark:bg-warning-900 text-warning-700 dark:text-warning-300';
  };

  const statusLabel = () => {
    const key = props.wealth.status as keyof typeof wealthCardDict.en.wealthCard.statuses;
    return t(`statuses.${key}`, props.wealth.status);
  };

  return (
    <A
      href={`/wealth/${props.wealth.id}`}
      class="block p-3 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg hover:border-ocean-400 dark:hover:border-ocean-600 transition-colors"
    >
      {/* Header with title and status */}
      <div class="flex items-start justify-between gap-2 mb-2">
        <div class="flex items-center gap-2 min-w-0 flex-1">
          <span class="text-sm flex-shrink-0">
            {props.wealth.item?.kind === 'object' ? '📦' : '🛠️'}
          </span>
          <h3
            class="text-sm font-medium text-stone-900 dark:text-stone-100 truncate"
            title={props.wealth.title}
          >
            {props.wealth.title}
          </h3>
        </div>
        <span class={`px-1.5 py-0.5 text-xs rounded flex-shrink-0 ${statusBadgeClass()}`}>
          {statusLabel()}
        </span>
      </div>

      {/* Item name */}
      <Show when={props.wealth.item}>
        <p class="text-xs text-stone-600 dark:text-stone-400 truncate mb-2">
          {props.wealth.item?.name}
        </p>
      </Show>

      {/* Key info */}
      <div class="text-xs text-stone-500 dark:text-stone-400 space-y-0.5">
        <Show when={isUnitBased()}>
          <div class="font-medium text-ocean-600 dark:text-ocean-400">
            {props.wealth.unitsAvailable ?? 0} {t('unitsAvailable')}
          </div>
        </Show>
        <div class="flex items-center gap-2">
          <span>{timeLabel()}</span>
          <span>•</span>
          <span>{distLabel()}</span>
        </div>
      </div>
    </A>
  );
};

export default WealthCard;
