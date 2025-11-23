import { Component, createSignal, Show, For, onMount } from 'solid-js';
import { usePools } from '@/hooks/queries/usePools';
import { PoolCard } from './PoolCard';
import { Button } from '@/components/common/Button';
import { Icon } from '@/components/common/Icon';
import { makeTranslator } from '@/i18n/makeTranslator';
import { poolsListDict } from './PoolsList.i18n';

interface PoolsListProps {
  communityId: string;
  canCreatePool?: boolean;
  onCreateClick: () => void;
}

export const PoolsList: Component<PoolsListProps> = (props) => {
  const t = makeTranslator(poolsListDict, 'poolsList');

  // Mount guard to ensure query only runs after component is fully mounted
  // This prevents reactive scope issues when component is inside Show/Match
  const [isMounted, setIsMounted] = createSignal(false);
  onMount(() => setIsMounted(true));

  const [councilFilter, setCouncilFilter] = createSignal<string | undefined>(undefined);
  const [itemFilter, setItemFilter] = createSignal<string | undefined>(undefined);

  const pools = usePools(
    () => isMounted() ? props.communityId : undefined,
    () => ({
      councilId: councilFilter(),
      itemId: itemFilter(),
    })
  );

  return (
    <div class="space-y-6">
      {/* Header with Create Button */}
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-bold text-stone-900 dark:text-stone-100">{t('title')}</h2>
          <p class="text-stone-600 dark:text-stone-400 mt-1">{t('subtitle')}</p>
        </div>
        <Show when={props.canCreatePool}>
          <Button onClick={props.onCreateClick}>
            <Icon name="plus" size={20} class="mr-2" />
            {t('createPool')}
          </Button>
        </Show>
      </div>

      {/* Loading State */}
      <Show when={pools.isLoading}>
        <div class="text-center py-12">
          <p class="text-stone-600 dark:text-stone-400">{t('loading')}</p>
        </div>
      </Show>

      {/* Error State */}
      <Show when={pools.isError}>
        <div class="bg-danger-100 dark:bg-danger-900 text-danger-800 dark:text-danger-200 px-4 py-3 rounded-md">
          {t('error')}
        </div>
      </Show>

      {/* Pools Grid */}
      <Show when={pools.data}>
        <Show
          when={pools.data!.length > 0}
          fallback={
            <div class="text-center py-12">
              <Icon name="inbox" size={48} class="mx-auto mb-4 text-stone-400" />
              <h3 class="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-2">
                {t('noPools')}
              </h3>
              <p class="text-stone-600 dark:text-stone-400 mb-4">{t('noPoolsDescription')}</p>
              <Show when={props.canCreatePool}>
                <Button variant="secondary" onClick={props.onCreateClick}>
                  <Icon name="plus" size={20} class="mr-2" />
                  {t('createFirstPool')}
                </Button>
              </Show>
            </div>
          }
        >
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <For each={pools.data}>
              {(pool) => <PoolCard pool={pool} communityId={props.communityId} />}
            </For>
          </div>
        </Show>
      </Show>
    </div>
  );
};
