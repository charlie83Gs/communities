import { Component, Show } from 'solid-js';
import type { ItemListItem } from '@/types/items.types';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Icon } from '@/components/common/Icon';
import { Tooltip } from '@/components/common/Tooltip';
import { makeTranslator } from '@/i18n/makeTranslator';
import { itemsDict } from './items.i18n';
import { i18nLocale } from '@/stores/i18n.store';

interface ItemCardProps {
  item: ItemListItem;
  canManageItems: boolean;
  onEdit: (item: ItemListItem) => void;
  onDelete: (itemId: string) => void;
}

export const ItemCard: Component<ItemCardProps> = (props) => {
  const t = makeTranslator(itemsDict, 'items.card');
  const hasWealthReferences = () => (props.item._count?.wealthEntries ?? 0) > 0;
  const canDelete = () => !props.item.isDefault && !hasWealthReferences();

  return (
    <Card class="p-4 hover:shadow-lg transition-shadow relative">
      <Show when={props.canManageItems}>
        <div class="absolute top-4 right-4 flex gap-2">
          <button
            onClick={() => props.onEdit(props.item)}
            class="p-2 rounded-md text-stone-600 hover:text-ocean-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:text-ocean-400 dark:hover:bg-stone-700 transition-colors"
            aria-label={t('actions.edit')}
          >
            <Icon name="edit" size={18} />
          </button>

          <Tooltip
            content={
              props.item.isDefault
                ? t('deleteTooltips.cannotDeleteDefault')
                : hasWealthReferences()
                ? t('deleteTooltips.cannotDeleteWithShares')
                : t('deleteTooltips.canDelete')
            }
            disabled={canDelete()}
          >
            <button
              disabled={!canDelete()}
              onClick={() => props.onDelete(props.item.id)}
              class="p-2 rounded-md text-stone-600 hover:text-danger-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:text-danger-400 dark:hover:bg-stone-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:text-stone-600 disabled:hover:bg-transparent dark:disabled:hover:text-stone-400 dark:disabled:hover:bg-transparent"
              aria-label={t('actions.delete')}
            >
              <Icon name="trash" size={18} />
            </button>
          </Tooltip>
        </div>
      </Show>

      <div class="pr-20">
        <div class="flex items-center gap-2 mb-2">
          <h3 class="text-lg font-semibold text-stone-900 dark:text-stone-100">
            {props.item.name}
          </h3>
          <Badge variant={props.item.kind === 'object' ? 'ocean' : 'forest'}>
            {t(`kindLabels.${props.item.kind}`)}
          </Badge>
          <Show when={props.item.isDefault}>
            <Badge variant="warning">{t('badges.default')}</Badge>
          </Show>
        </div>

        <Show when={props.item.description}>
          <p class="text-sm text-stone-600 dark:text-stone-400 mb-2">
            {props.item.description}
          </p>
        </Show>

        <div class="flex items-center gap-4 text-xs text-stone-500 dark:text-stone-500">
          <span class="flex items-center gap-1">
            <span class="text-base">📊</span>
            <span class="font-semibold text-stone-700 dark:text-stone-300">
              {t('value')}: {props.item.wealthValue}
            </span>
          </span>
          <span>
            {props.item._count?.wealthEntries ?? 0} {t('wealthShares')}
          </span>
        </div>
      </div>
    </Card>
  );
};
