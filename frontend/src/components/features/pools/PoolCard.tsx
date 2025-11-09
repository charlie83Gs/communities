import { Component, For, Show } from 'solid-js';
import { A } from '@solidjs/router';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Icon } from '@/components/common/Icon';
import type { Pool } from '@/types/pools.types';
import { makeTranslator } from '@/i18n/makeTranslator';
import { poolCardDict } from './PoolCard.i18n';

interface PoolCardProps {
  pool: Pool;
  communityId: string;
}

export const PoolCard: Component<PoolCardProps> = (props) => {
  const t = makeTranslator(poolCardDict, 'poolCard');

  const totalItems = () => props.pool.inventory.reduce((sum, item) => sum + item.unitsAvailable, 0);

  return (
    <Card class="hover:shadow-lg transition-shadow">
      <div class="p-4 space-y-3">
        {/* Header */}
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-stone-900 dark:text-stone-100">
              {props.pool.name}
            </h3>
            <p class="text-sm text-stone-600 dark:text-stone-400 mt-1">
              {t('managedBy')}: {props.pool.councilName}
            </p>
          </div>
          <Badge
            variant={props.pool.distributionType === 'needs_based' ? 'success' : 'default'}
            class="ml-2"
          >
            {props.pool.distributionType === 'needs_based' ? t('needsBased') : t('manual')}
          </Badge>
        </div>

        {/* Description */}
        <Show when={props.pool.description}>
          <p class="text-sm text-stone-700 dark:text-stone-300 line-clamp-2">
            {props.pool.description}
          </p>
        </Show>

        {/* Primary Item */}
        <Show when={props.pool.primaryItem}>
          <div class="flex items-center gap-2 text-sm">
            <Icon name="tag" size={16} class="text-ocean-600 dark:text-ocean-400" />
            <span class="text-stone-600 dark:text-stone-400">{t('primaryItem')}:</span>
            <span class="font-medium text-stone-900 dark:text-stone-100">
              {props.pool.primaryItem!.name}
            </span>
          </div>
        </Show>

        {/* Inventory Summary */}
        <div class="border-t border-stone-200 dark:border-stone-700 pt-3 mt-3">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-stone-700 dark:text-stone-300">
              {t('inventory')}
            </span>
            <span class="text-sm text-stone-600 dark:text-stone-400">
              {totalItems()} {t('items')}
            </span>
          </div>

          <Show
            when={props.pool.inventory.length > 0}
            fallback={
              <p class="text-xs text-stone-500 dark:text-stone-400 italic">
                {t('emptyInventory')}
              </p>
            }
          >
            <div class="space-y-1">
              <For each={props.pool.inventory.slice(0, 3)}>
                {(item) => (
                  <div class="flex items-center justify-between text-xs">
                    <span class="text-stone-700 dark:text-stone-300">{item.itemName}</span>
                    <span class="font-medium text-ocean-600 dark:text-ocean-400">
                      {item.unitsAvailable}
                    </span>
                  </div>
                )}
              </For>
              <Show when={props.pool.inventory.length > 3}>
                <p class="text-xs text-stone-500 dark:text-stone-400 italic">
                  +{props.pool.inventory.length - 3} more...
                </p>
              </Show>
            </div>
          </Show>
        </div>

        {/* View Details Link */}
        <div class="pt-2">
          <A
            href={`/communities/${props.communityId}/pools/${props.pool.id}`}
            class="inline-flex items-center gap-2 text-sm font-medium text-ocean-600 dark:text-ocean-400 hover:text-ocean-700 dark:hover:text-ocean-300 transition-colors"
          >
            {t('viewDetails')}
            <Icon name="arrow-right" size={16} />
          </A>
        </div>
      </div>
    </Card>
  );
};
