import { Component, Show, For } from 'solid-js';
import { A } from '@solidjs/router';
import { useCouncilPoolsQuery } from '@/hooks/queries/useCouncils';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Icon } from '@/components/common/Icon';
import { makeTranslator } from '@/i18n/makeTranslator';
import { councilPoolsDict } from './CouncilPoolsList.i18n';

interface CouncilPoolsListProps {
  communityId: string;
  councilId: string;
  isManager?: boolean;
}

export const CouncilPoolsList: Component<CouncilPoolsListProps> = (props) => {
  const t = makeTranslator(councilPoolsDict, 'councilPools');

  const poolsQuery = useCouncilPoolsQuery(
    () => props.communityId,
    () => props.councilId
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div class="space-y-4">
      {/* Header with create button */}
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold text-stone-900 dark:text-stone-100">
          {t('title')}
        </h3>
        <Show when={props.isManager}>
          <A
            href={`/communities/${props.communityId}/pools/create?councilId=${props.councilId}`}
            class="inline-flex"
          >
            <Button variant="primary" size="sm">
              <Icon name="plus" size={16} class="mr-1" />
              {t('createPool')}
            </Button>
          </A>
        </Show>
      </div>

      {/* Loading state */}
      <Show when={poolsQuery.isLoading}>
        <div class="text-center py-8">
          <p class="text-stone-500 dark:text-stone-400">{t('loading')}</p>
        </div>
      </Show>

      {/* Error state */}
      <Show when={poolsQuery.isError}>
        <div class="bg-danger-100 dark:bg-danger-900 text-danger-800 dark:text-danger-200 px-4 py-3 rounded-md">
          {t('error')}
        </div>
      </Show>

      {/* Empty state */}
      <Show when={!poolsQuery.isLoading && poolsQuery.data?.pools.length === 0}>
        <div class="text-center py-8">
          <Icon
            name="pools"
            size={48}
            class="mx-auto mb-4 text-stone-300 dark:text-stone-600"
          />
          <p class="text-stone-500 dark:text-stone-400 italic">{t('noPools')}</p>
          <Show when={props.isManager}>
            <p class="text-sm text-stone-400 dark:text-stone-500 mt-2">
              {t('createPoolHint')}
            </p>
          </Show>
        </div>
      </Show>

      {/* Pools list */}
      <Show when={poolsQuery.data?.pools && poolsQuery.data.pools.length > 0}>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <For each={poolsQuery.data!.pools}>
            {(pool) => (
              <A
                href={`/communities/${props.communityId}/pools/${pool.id}`}
                class="block"
              >
                <Card class="h-full hover:border-ocean-500 dark:hover:border-ocean-500 transition-colors cursor-pointer">
                  <div class="p-4">
                    {/* Pool header */}
                    <div class="mb-3">
                      <h4 class="text-lg font-semibold text-stone-900 dark:text-stone-100">
                        {pool.name}
                      </h4>
                    </div>

                    {/* Description */}
                    <Show when={pool.description}>
                      <p class="text-sm text-stone-600 dark:text-stone-400 mb-3 line-clamp-2">
                        {pool.description}
                      </p>
                    </Show>

                    {/* Inventory summary */}
                    <div class="flex items-center gap-4 text-sm text-stone-500 dark:text-stone-400 mb-3">
                      <span class="flex items-center gap-1">
                        <Icon name="wealth" size={14} />
                        {pool.inventorySummary.totalItems} {t('items')}
                      </span>
                      <span class="flex items-center gap-1">
                        <Icon name="items" size={14} />
                        {pool.inventorySummary.totalQuantity} {t('total')}
                      </span>
                    </div>

                    {/* Allowed items */}
                    <Show when={pool.allowedItems.length > 0}>
                      <div class="mb-3">
                        <p class="text-xs text-stone-500 dark:text-stone-400 mb-1">
                          {t('allowedItems')}:
                        </p>
                        <div class="flex flex-wrap gap-1">
                          <For each={pool.allowedItems.slice(0, 3)}>
                            {(item) => (
                              <span class="text-xs px-2 py-0.5 bg-stone-100 dark:bg-stone-700 rounded">
                                {item.itemName}
                              </span>
                            )}
                          </For>
                          <Show when={pool.allowedItems.length > 3}>
                            <span class="text-xs px-2 py-0.5 bg-stone-100 dark:bg-stone-700 rounded">
                              +{pool.allowedItems.length - 3}
                            </span>
                          </Show>
                        </div>
                      </div>
                    </Show>

                    {/* Footer */}
                    <div class="text-xs text-stone-400 dark:text-stone-500">
                      {t('created')}: {formatDate(pool.createdAt)}
                    </div>
                  </div>
                </Card>
              </A>
            )}
          </For>
        </div>
      </Show>
    </div>
  );
};
