import { Component, Show, createMemo } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import type { Wealth } from '@/types/wealth.types';
import { makeTranslator } from '@/i18n/makeTranslator';
import { wealthCardDict } from '@/components/features/wealth/WealthCard.i18n';

interface WealthCardProps {
  wealth: Wealth;
}

export const WealthCard: Component<WealthCardProps> = (props) => {
  const navigate = useNavigate();
  const t = makeTranslator(wealthCardDict, 'wealthCard');

  const isActive = createMemo(() => props.wealth.status === 'active');
  const isUnitBased = createMemo(() => props.wealth.distributionType === 'unit_based');

  const timeLabel = () =>
    props.wealth.durationType === 'timebound' ? t('timebound') : t('unlimited');

  const distLabel = () =>
    props.wealth.distributionType === 'unit_based' ? t('unit_based') : t('request_based');

  const statusVariant = () =>
    isActive() ? 'success' : props.wealth.status === 'fulfilled' ? 'secondary' : 'warning';

  const statusLabel = () => {
    const key = props.wealth.status as keyof typeof wealthCardDict.en.wealthCard.statuses;
    return t(`statuses.${key}`, props.wealth.status);
  };

  return (
    <Card
      class="w-full h-64 overflow-hidden cursor-pointer hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors relative group"
      onClick={() => navigate(`/wealth/${props.wealth.id}`)}
    >
      <div class="p-4 space-y-3 h-full flex flex-col">
        <div class="flex items-center gap-2 mb-1">
          <div class="w-8 h-8 bg-ocean-100 dark:bg-ocean-900 rounded-full flex items-center justify-center flex-shrink-0">
            <span class="text-sm">{props.wealth.item?.kind === 'object' ? '📦' : '🛠️'}</span>
          </div>
          <h4 class="text-lg font-semibold text-stone-900 dark:text-stone-100">
            {props.wealth.title}
          </h4>
        </div>

        <Show when={props.wealth.item}>
          <div class="flex items-center gap-1 text-sm text-stone-600 dark:text-stone-400">
            <span>{props.wealth.item?.name}</span>
            <Badge variant={props.wealth.item?.kind === 'object' ? 'ocean' : 'forest'} class="text-xs">
              {props.wealth.item?.kind}
            </Badge>
          </div>
        </Show>

        <div class="flex flex-wrap gap-2">
          <Badge class="bg-sage-100 dark:bg-sage-900 text-sage-800 dark:text-sage-200">
            {t('badges.time')}: {timeLabel()}
          </Badge>
          <Badge class="bg-sky-100 dark:bg-sky-900 text-sky-800 dark:text-sky-200">
            {t('badges.type')}: {distLabel()}
          </Badge>
          <Badge variant={statusVariant()}>
            {t('badges.status')}: {statusLabel()}
          </Badge>
        </div>

        <Show when={props.wealth.description}>
          <p class="text-sm text-stone-600 dark:text-stone-300 overflow-hidden text-ellipsis line-clamp-3">{props.wealth.description}</p>
        </Show>

        <Show when={isUnitBased()}>
          <p class="text-xs text-stone-500 dark:text-stone-400">
            {t('unitsAvailable')}: {props.wealth.unitsAvailable ?? '-'}
            {props.wealth.maxUnitsPerUser ? ` • ${t('maxPerUser')}: ${props.wealth.maxUnitsPerUser}` : ''}
          </p>
        </Show>

        {/* Actions and requests moved to Wealth Details page */}
        <div class="pt-2 mt-auto"></div>
      </div>
    </Card>
  );
};

export default WealthCard;
