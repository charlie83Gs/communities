import { Component, createSignal, Show, For } from 'solid-js';
import { useParams, A } from '@solidjs/router';
import { Meta, Title } from '@solidjs/meta';
import { usePools } from '@/hooks/queries/usePools';
import { PoolCard } from '@/components/features/pools/PoolCard';
import { Icon } from '@/components/common/Icon';
import { makeTranslator } from '@/i18n/makeTranslator';
import { poolsIndexDict } from './index.i18n';
import { CommunityProvider, useCommunity } from '@/contexts/CommunityContext';

const PoolsIndexPageContent: Component = () => {
  const params = useParams<{ id: string }>();
  const t = makeTranslator(poolsIndexDict, 'poolsIndex');
  const community = useCommunity();

  // Search and filter states
  const [searchQuery, setSearchQuery] = createSignal('');
  const [showFilters, setShowFilters] = createSignal(false);
  const [councilFilter, setCouncilFilter] = createSignal<string | undefined>(undefined);
  const [itemFilter, setItemFilter] = createSignal<string | undefined>(undefined);

  const pools = usePools(
    () => params.id,
    () => ({
      councilId: councilFilter(),
      itemId: itemFilter(),
    })
  );

  // Filter pools based on search
  const filteredPools = () => {
    let result = pools.data || [];

    // Search filter
    const query = searchQuery().toLowerCase();
    if (query) {
      result = result.filter(pool =>
        pool.name.toLowerCase().includes(query) ||
        pool.description?.toLowerCase().includes(query) ||
        pool.councilName?.toLowerCase().includes(query)
      );
    }

    return result;
  };

  return (
    <>
      <Title>{t('title')}</Title>
      <Meta name="description" content={t('subtitle')} />

      <div class="container mx-auto px-4 py-6 max-w-6xl">
        {/* Back Link */}
        <A
          href={`/communities/${params.id}/resources`}
          class="inline-flex items-center gap-1 text-sm text-ocean-600 dark:text-ocean-400 hover:text-ocean-700 dark:hover:text-ocean-300 mb-4"
        >
          <span>←</span> {t('backToResources')}
        </A>

        {/* Header */}
        <div class="flex items-center justify-between mb-4">
          <div>
            <h1 class="text-2xl font-bold text-stone-900 dark:text-stone-100">{t('title')}</h1>
            <p class="text-sm text-stone-600 dark:text-stone-400 mt-1">{t('subtitle')}</p>
          </div>
          <A href={`/communities/${params.id}/pools/create`}>
            <button class="px-4 py-2 text-sm bg-ocean-600 text-white rounded-lg hover:bg-ocean-700 flex items-center gap-2">
              <Icon name="plus" size={16} />
              {t('createPool')}
            </button>
          </A>
        </div>

        {/* Trust Requirement Info */}
        <Show when={community.community()?.minTrustForPoolCreation?.type === 'number'}>
          <div class="mb-4 px-3 py-2 bg-stone-100 dark:bg-stone-800 rounded-lg text-xs text-stone-600 dark:text-stone-400">
            {t('minTrustRequired')} <span class="font-medium text-stone-900 dark:text-stone-100">{community.community()?.minTrustForPoolCreation?.value} {t('trustPoints')}</span>
          </div>
        </Show>

        {/* Search and Filters */}
        <div class="p-4 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg mb-4">
          {/* Search Row */}
          <div class="flex gap-3">
            <div class="flex-1">
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchQuery()}
                onInput={(e) => setSearchQuery((e.currentTarget as HTMLInputElement).value)}
                class="w-full px-3 py-2 text-sm border border-stone-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
              />
            </div>
            <button
              type="button"
              class="px-4 py-2 text-sm bg-ocean-600 text-white rounded-lg hover:bg-ocean-700"
            >
              {t('search')}
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters())}
              class="px-3 py-2 text-sm border border-stone-300 dark:border-stone-600 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300"
            >
              {t('filters')} {showFilters() ? '▲' : '▼'}
            </button>
          </div>

          {/* Collapsible Filters */}
          <Show when={showFilters()}>
            <div class="mt-4 pt-4 border-t border-stone-200 dark:border-stone-700">
              <p class="text-xs text-stone-500 dark:text-stone-400">
                {t('filterByCouncil')} and {t('filterByItem')} coming soon...
              </p>
            </div>
          </Show>
        </div>

        {/* Loading State */}
        <Show when={pools.isLoading}>
          <div class="p-4 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-center text-stone-600 dark:text-stone-400">
            {t('loading')}
          </div>
        </Show>

        {/* Error State */}
        <Show when={pools.isError}>
          <div class="bg-danger-100 dark:bg-danger-900 text-danger-800 dark:text-danger-200 px-4 py-3 rounded-lg">
            {t('error')}
          </div>
        </Show>

        {/* Pools Grid */}
        <Show when={!pools.isLoading && !pools.isError}>
          <Show
            when={filteredPools().length > 0}
            fallback={
              <div class="text-center py-12 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg">
                <Icon name="inbox" size={48} class="mx-auto mb-4 text-stone-400" />
                <h3 class="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-2">
                  {t('noPools')}
                </h3>
                <p class="text-sm text-stone-600 dark:text-stone-400 mb-4">{t('noPoolsDescription')}</p>
                <A href={`/communities/${params.id}/pools/create`}>
                  <button class="px-4 py-2 text-sm border border-stone-300 dark:border-stone-600 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 inline-flex items-center gap-2">
                    <Icon name="plus" size={16} />
                    {t('createPool')}
                  </button>
                </A>
              </div>
            }
          >
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <For each={filteredPools()}>
                {(pool) => <PoolCard pool={pool} communityId={params.id} />}
              </For>
            </div>
          </Show>
        </Show>
      </div>
    </>
  );
};

const PoolsIndexPage: Component = () => {
  const params = useParams<{ id: string }>();

  return (
    <CommunityProvider communityId={params.id}>
      <PoolsIndexPageContent />
    </CommunityProvider>
  );
};

export default PoolsIndexPage;
