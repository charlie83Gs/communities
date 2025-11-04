import { Component, Show, For, createSignal } from 'solid-js';
import { usePollsListQuery } from '@/hooks/queries/usePolls';
import { PollCard } from './PollCard';
import { Button } from '@/components/common/Button';
import { makeTranslator } from '@/i18n/makeTranslator';
import { pollsDict } from './polls.i18n';
import type { PollStatus, PollCreatorType } from '@/types/poll.types';

interface PollsListProps {
  communityId: string;
  onCreateClick?: () => void;
  canCreatePoll?: boolean;
}

export const PollsList: Component<PollsListProps> = (props) => {
  const t = makeTranslator(pollsDict, 'polls');
  const [statusFilter, setStatusFilter] = createSignal<PollStatus | undefined>(undefined);
  const [creatorFilter, setCreatorFilter] = createSignal<PollCreatorType | undefined>(undefined);

  const pollsQuery = usePollsListQuery(
    () => props.communityId,
    {
      status: statusFilter,
      creatorType: creatorFilter,
    }
  );

  return (
    <div class="space-y-4">
      {/* Header with filters */}
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 class="text-2xl font-bold text-stone-900 dark:text-stone-100">{t('title')}</h2>

        <Show when={props.canCreatePoll}>
          <Button onClick={props.onCreateClick}>
            {t('createPoll')}
          </Button>
        </Show>
      </div>

      {/* Filters */}
      <div class="flex flex-col sm:flex-row gap-3">
        <div class="flex-1">
          <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
            {t('filterByStatus')}
          </label>
          <select
            value={statusFilter() || ''}
            onChange={(e) => setStatusFilter(e.target.value as PollStatus | undefined || undefined)}
            class="block w-full rounded-md border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-sm focus:border-ocean-500 focus:ring-ocean-500 sm:text-sm"
          >
            <option value="">{t('filterAll')}</option>
            <option value="active">{t('filterActive')}</option>
            <option value="closed">{t('filterClosed')}</option>
          </select>
        </div>

        <div class="flex-1">
          <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
            {t('filterByCreator')}
          </label>
          <select
            value={creatorFilter() || ''}
            onChange={(e) => setCreatorFilter(e.target.value as PollCreatorType | undefined || undefined)}
            class="block w-full rounded-md border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-sm focus:border-ocean-500 focus:ring-ocean-500 sm:text-sm"
          >
            <option value="">{t('creatorAll')}</option>
            <option value="user">{t('creatorUser')}</option>
            <option value="council">{t('creatorCouncil')}</option>
            <option value="pool">{t('creatorPool')}</option>
          </select>
        </div>
      </div>

      {/* Polls list */}
      <Show
        when={!pollsQuery.isLoading}
        fallback={
          <div class="text-center py-8 text-stone-500 dark:text-stone-400">
            {t('loading')}
          </div>
        }
      >
        <Show
          when={pollsQuery.data?.polls && pollsQuery.data.polls.length > 0}
          fallback={
            <div class="text-center py-12 bg-stone-50 dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-700">
              <p class="text-stone-500 dark:text-stone-400">{t('noPollsFound')}</p>
            </div>
          }
        >
          <div class="space-y-3">
            <For each={pollsQuery.data?.polls}>
              {(poll) => <PollCard poll={poll} communityId={props.communityId} />}
            </For>
          </div>
        </Show>
      </Show>
    </div>
  );
};
