/**
 * DisputesList Component
 * Location per architecture: /components/features/disputes (feature component)
 */

import { Component, Show, For, createSignal } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { useDisputesListQuery } from '@/hooks/queries/useDisputes';
import { DisputeCard } from './DisputeCard';
import { Button } from '@/components/common/Button';
import { makeTranslator } from '@/i18n/makeTranslator';
import { disputesDict } from './disputes.i18n';
import type { DisputeStatus } from '@/types/dispute.types';

interface DisputesListProps {
  communityId: string;
  onCreateClick?: () => void;
  canCreateDispute?: boolean;
}

export const DisputesList: Component<DisputesListProps> = (props) => {
  const t = makeTranslator(disputesDict, 'disputes');
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = createSignal<DisputeStatus | undefined>(undefined);

  const disputesQuery = useDisputesListQuery(
    () => props.communityId,
    {
      status: statusFilter,
    }
  );

  const handleCreateClick = () => {
    if (props.onCreateClick) {
      props.onCreateClick();
    } else {
      navigate(`/communities/${props.communityId}/disputes/new`);
    }
  };

  return (
    <div class="space-y-4">
      {/* Header with filters */}
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 class="text-2xl font-bold text-stone-900 dark:text-stone-100">{t('title')}</h2>

        <Show when={props.canCreateDispute}>
          <Button onClick={handleCreateClick}>
            {t('createDispute')}
          </Button>
        </Show>
      </div>

      {/* Status Filter */}
      <div class="flex flex-col sm:flex-row gap-3">
        <div class="flex-1">
          <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
            {t('filterByStatus')}
          </label>
          <select
            value={statusFilter() || ''}
            onChange={(e) => setStatusFilter(e.target.value as DisputeStatus | undefined || undefined)}
            class="block w-full rounded-md border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-sm focus:border-ocean-500 focus:ring-ocean-500 sm:text-sm"
          >
            <option value="">{t('filterAll')}</option>
            <option value="open">{t('filterOpen')}</option>
            <option value="in_mediation">{t('filterInMediation')}</option>
            <option value="resolved">{t('filterResolved')}</option>
            <option value="closed">{t('filterClosed')}</option>
          </select>
        </div>
      </div>

      {/* Disputes list */}
      <Show
        when={!disputesQuery.isLoading}
        fallback={
          <div class="text-center py-8 text-stone-500 dark:text-stone-400">
            {t('loading')}
          </div>
        }
      >
        <Show
          when={disputesQuery.data?.disputes && disputesQuery.data.disputes.length > 0}
          fallback={
            <div class="text-center py-12 bg-stone-50 dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-700">
              <p class="text-stone-500 dark:text-stone-400">{t('noDisputesFound')}</p>
            </div>
          }
        >
          <div class="space-y-3">
            <For each={disputesQuery.data?.disputes}>
              {(dispute) => <DisputeCard dispute={dispute} communityId={props.communityId} />}
            </For>
          </div>
        </Show>
      </Show>
    </div>
  );
};
