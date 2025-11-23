import { Component, createSignal, createMemo, Show, For } from 'solid-js';
import { usePoolNeeds } from '@/hooks/queries/usePools';
import { Badge } from '@/components/common/Badge';
import { makeTranslator } from '@/i18n/makeTranslator';
import { poolNeedsTableDict } from './PoolNeedsTable.i18n';

type RecurrenceFilter = 'all' | 'oneTime' | 'daily' | 'weekly' | 'monthly';

interface PoolNeedsTableProps {
  communityId: string;
  poolId: string;
}

export const PoolNeedsTable: Component<PoolNeedsTableProps> = (props) => {
  const t = makeTranslator(poolNeedsTableDict, 'poolNeedsTable');
  const [recurrenceFilter, setRecurrenceFilter] = createSignal<RecurrenceFilter>('all');

  const needsQuery = usePoolNeeds(
    () => props.communityId,
    () => props.poolId
  );

  // Calculate filtered data based on recurrence
  const filteredItems = createMemo(() => {
    if (!needsQuery.data?.items) return [];

    const filter = recurrenceFilter();

    return needsQuery.data.items.map((item) => {
      let needsCount = 0;
      let wantsCount = 0;
      let needsUnits = 0;
      let wantsUnits = 0;

      if (filter === 'all') {
        needsCount = item.totalNeedsCount;
        wantsCount = item.totalWantsCount;
        needsUnits = item.totalNeedsUnits;
        wantsUnits = item.totalWantsUnits;
      } else {
        const breakdown = item.recurrenceBreakdown;
        const key = filter === 'oneTime' ? 'oneTime' : filter;
        needsCount = breakdown[key]?.needs ?? 0;
        wantsCount = breakdown[key]?.wants ?? 0;
        // For filtered view, count equals units for simplicity
        needsUnits = needsCount;
        wantsUnits = wantsCount;
      }

      return {
        ...item,
        filteredNeedsCount: needsCount,
        filteredWantsCount: wantsCount,
        filteredNeedsUnits: needsUnits,
        filteredWantsUnits: wantsUnits,
        deficit: Math.max(0, needsUnits - item.poolInventoryUnits),
      };
    }).filter((item) => item.filteredNeedsCount > 0 || item.filteredWantsCount > 0);
  });

  const getStatusBadge = (item: { filteredNeedsUnits: number; poolInventoryUnits: number }) => {
    if (item.poolInventoryUnits === 0) {
      return { label: t('noStock'), variant: 'danger' as const };
    }
    if (item.poolInventoryUnits >= item.filteredNeedsUnits) {
      return { label: t('sufficient'), variant: 'success' as const };
    }
    return { label: t('insufficient'), variant: 'warning' as const };
  };

  const getRowClass = (item: { filteredNeedsUnits: number; poolInventoryUnits: number }) => {
    if (item.poolInventoryUnits === 0 && item.filteredNeedsUnits > 0) {
      return 'bg-danger-50/30 dark:bg-danger-900/20';
    }
    if (item.filteredNeedsUnits > item.poolInventoryUnits) {
      return 'bg-warning-50/30 dark:bg-warning-900/20';
    }
    return '';
  };

  const filterOptions: { label: string; value: RecurrenceFilter }[] = [
    { label: t('filterAll'), value: 'all' },
    { label: t('filterOneTime'), value: 'oneTime' },
    { label: t('filterDaily'), value: 'daily' },
    { label: t('filterWeekly'), value: 'weekly' },
    { label: t('filterMonthly'), value: 'monthly' },
  ];

  return (
    <div class="space-y-4">
      {/* Header */}
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 class="text-lg font-semibold text-stone-900 dark:text-stone-100">
            {t('title')}
          </h3>
          <p class="text-sm text-stone-600 dark:text-stone-400 mt-1">
            {t('subtitle')}
          </p>
        </div>

        {/* Recurrence Filter */}
        <div class="flex flex-wrap gap-2">
          <For each={filterOptions}>
            {(option) => (
              <button
                onClick={() => setRecurrenceFilter(option.value)}
                class={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  recurrenceFilter() === option.value
                    ? 'bg-ocean-600 text-white'
                    : 'bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-600'
                }`}
              >
                {option.label}
              </button>
            )}
          </For>
        </div>
      </div>

      {/* Loading State */}
      <Show when={needsQuery.isLoading}>
        <div class="bg-stone-100 dark:bg-stone-700 rounded-lg h-48 animate-pulse flex items-center justify-center">
          <p class="text-stone-500 dark:text-stone-400">{t('loading')}</p>
        </div>
      </Show>

      {/* Error State */}
      <Show when={needsQuery.isError}>
        <div class="bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-lg p-4">
          <p class="text-danger-700 dark:text-danger-300">{t('error')}</p>
        </div>
      </Show>

      {/* Table */}
      <Show when={!needsQuery.isLoading && !needsQuery.isError}>
        <div class="bg-white dark:bg-stone-800 rounded-lg shadow-md border border-stone-200 dark:border-stone-700 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full">
              <thead class="bg-stone-50 dark:bg-stone-900">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                    {t('itemName')}
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                    {t('category')}
                  </th>
                  <th class="px-4 py-3 text-right text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                    {t('needsCount')}
                  </th>
                  <th class="px-4 py-3 text-right text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                    {t('wantsCount')}
                  </th>
                  <th class="px-4 py-3 text-right text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                    {t('inventory')}
                  </th>
                  <th class="px-4 py-3 text-right text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                    {t('deficit')}
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-stone-200 dark:divide-stone-700">
                <Show
                  when={filteredItems().length > 0}
                  fallback={
                    <tr>
                      <td colspan="6" class="px-4 py-8 text-center text-stone-500 dark:text-stone-400">
                        <div class="flex flex-col items-center gap-2">
                          <span class="text-2xl">📦</span>
                          <p>{t('noNeeds')}</p>
                        </div>
                      </td>
                    </tr>
                  }
                >
                  <For each={filteredItems()}>
                    {(item) => (
                      <tr class={`hover:bg-stone-50 dark:hover:bg-stone-700/50 transition-colors ${getRowClass(item)}`}>
                        <td class="px-4 py-3 text-sm">
                          <div class="flex flex-col">
                            <span class="font-medium text-stone-900 dark:text-stone-100">
                              {item.itemName}
                            </span>
                          </div>
                        </td>
                        <td class="px-4 py-3 text-sm text-stone-600 dark:text-stone-400">
                          {item.categoryName}
                        </td>
                        <td class="px-4 py-3 text-right">
                          <div class="flex flex-col items-end">
                            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-success-100 dark:bg-success-900 text-success-800 dark:text-success-200">
                              {item.filteredNeedsCount}
                            </span>
                            <span class="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                              {item.filteredNeedsUnits} {t('units')}
                            </span>
                          </div>
                        </td>
                        <td class="px-4 py-3 text-right">
                          <div class="flex flex-col items-end">
                            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-ocean-100 dark:bg-ocean-900 text-ocean-800 dark:text-ocean-200">
                              {item.filteredWantsCount}
                            </span>
                            <span class="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                              {item.filteredWantsUnits} {t('units')}
                            </span>
                          </div>
                        </td>
                        <td class="px-4 py-3 text-right">
                          <span class="text-sm font-medium text-stone-900 dark:text-stone-100">
                            {item.poolInventoryUnits}
                          </span>
                        </td>
                        <td class="px-4 py-3 text-right">
                          <div class="flex flex-col items-end gap-1">
                            <Show
                              when={item.deficit > 0}
                              fallback={
                                <Badge variant="success">
                                  {getStatusBadge(item).label}
                                </Badge>
                              }
                            >
                              <span class="text-sm font-bold text-danger-600 dark:text-danger-400">
                                -{item.deficit}
                              </span>
                              <Badge variant={getStatusBadge(item).variant}>
                                {getStatusBadge(item).label}
                              </Badge>
                            </Show>
                          </div>
                        </td>
                      </tr>
                    )}
                  </For>
                </Show>
              </tbody>
            </table>
          </div>
        </div>
      </Show>
    </div>
  );
};
