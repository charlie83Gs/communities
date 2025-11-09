import { Component, createSignal, Show, For } from 'solid-js';
import { useParams, A } from '@solidjs/router';
import { Meta, Title } from '@solidjs/meta';
import { usePools } from '@/hooks/queries/usePools';
import { PoolCard } from '@/components/features/pools/PoolCard';
import { Button } from '@/components/common/Button';
import { Icon } from '@/components/common/Icon';
import { makeTranslator } from '@/i18n/makeTranslator';
import { poolsIndexDict } from './index.i18n';

const PoolsIndexPage: Component = () => {
  const params = useParams<{ id: string }>();
  const t = makeTranslator(poolsIndexDict, 'poolsIndex');

  const [councilFilter, setCouncilFilter] = createSignal<string | undefined>(undefined);
  const [itemFilter, setItemFilter] = createSignal<string | undefined>(undefined);

  const pools = usePools(
    () => params.id,
    () => ({
      councilId: councilFilter(),
      itemId: itemFilter(),
    })
  );

  return (
    <>
      <Title>{t('title')}</Title>
      <Meta name="description" content={t('subtitle')} />

      <div class="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div class="flex items-center justify-between mb-6">
          <div>
            <h1 class="text-3xl font-bold text-stone-900 dark:text-stone-100">{t('title')}</h1>
            <p class="text-stone-600 dark:text-stone-400 mt-1">{t('subtitle')}</p>
          </div>
          <A href={`/communities/${params.id}/pools/create`}>
            <Button>
              <Icon name="plus" size={20} class="mr-2" />
              {t('createPool')}
            </Button>
          </A>
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
                <A href={`/communities/${params.id}/pools/create`}>
                  <Button variant="secondary">
                    <Icon name="plus" size={20} class="mr-2" />
                    {t('createPool')}
                  </Button>
                </A>
              </div>
            }
          >
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <For each={pools.data}>
                {(pool) => <PoolCard pool={pool} communityId={params.id} />}
              </For>
            </div>
          </Show>
        </Show>
      </div>
    </>
  );
};

export default PoolsIndexPage;
