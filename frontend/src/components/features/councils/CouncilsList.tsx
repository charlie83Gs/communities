import { Component, Show, For, createSignal } from 'solid-js';
import { useCouncilsListQuery } from '@/hooks/queries/useCouncils';
import { CouncilCard } from './CouncilCard';
import { Button } from '@/components/common/Button';
import { makeTranslator } from '@/i18n/makeTranslator';
import { councilsDict } from './councils.i18n';

interface CouncilsListProps {
  communityId: string;
  onCreateClick?: () => void;
  onViewDetails: (councilId: string) => void;
  canCreateCouncil?: boolean;
}

export const CouncilsList: Component<CouncilsListProps> = (props) => {
  const t = makeTranslator(councilsDict, 'councils');
  const [sortBy, setSortBy] = createSignal<'trustScore' | 'createdAt'>('trustScore');
  const [order, setOrder] = createSignal<'desc' | 'asc'>('desc');

  const councilsQuery = useCouncilsListQuery(
    () => props.communityId,
    {
      sortBy: sortBy,
      order: order,
    }
  );

  return (
    <div class="space-y-4">
      {/* Header with filters */}
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 class="text-2xl font-bold text-stone-900 dark:text-stone-100">{t('title')}</h2>

        <Show when={props.canCreateCouncil}>
          <Button onClick={props.onCreateClick}>{t('createCouncil')}</Button>
        </Show>
      </div>

      {/* Sorting controls */}
      <div class="flex flex-col sm:flex-row gap-3">
        <div class="flex-1">
          <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
            {t('sortByTrust')}
          </label>
          <select
            value={sortBy()}
            onChange={(e) =>
              setSortBy(e.target.value as 'trustScore' | 'createdAt')
            }
            class="block w-full rounded-md border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-sm focus:border-ocean-500 focus:ring-ocean-500 sm:text-sm"
          >
            <option value="trustScore">{t('sortByTrust')}</option>
            <option value="createdAt">{t('sortByDate')}</option>
          </select>
        </div>

        <div class="flex-1">
          <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
            {t('orderDesc')}
          </label>
          <select
            value={order()}
            onChange={(e) => setOrder(e.target.value as 'desc' | 'asc')}
            class="block w-full rounded-md border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-sm focus:border-ocean-500 focus:ring-ocean-500 sm:text-sm"
          >
            <option value="desc">{t('orderDesc')}</option>
            <option value="asc">{t('orderAsc')}</option>
          </select>
        </div>
      </div>

      {/* Councils list */}
      <Show
        when={!councilsQuery.isLoading}
        fallback={
          <div class="text-center py-8 text-stone-500 dark:text-stone-400">
            {t('loading')}
          </div>
        }
      >
        <Show
          when={councilsQuery.data?.councils && councilsQuery.data.councils.length > 0}
          fallback={
            <div class="text-center py-12 bg-stone-50 dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-700">
              <p class="text-stone-500 dark:text-stone-400">{t('noCouncilsFound')}</p>
            </div>
          }
        >
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <For each={councilsQuery.data?.councils}>
              {(council) => (
                <CouncilCard
                  council={council}
                  communityId={props.communityId}
                  onViewDetails={props.onViewDetails}
                />
              )}
            </For>
          </div>
        </Show>
      </Show>
    </div>
  );
};
