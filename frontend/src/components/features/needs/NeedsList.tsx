import { Component, createSignal, For, Show, createMemo, onMount } from 'solid-js';
import { A } from '@solidjs/router';
import { useCommunityNeedsQuery, useDeleteNeedMutation } from '@/hooks/queries/useNeeds';
import type { NeedPriority, NeedStatus } from '@/types/needs.types';
import { makeTranslator } from '@/i18n/makeTranslator';
import { needsListDict } from '@/components/features/needs/NeedsList.i18n';
import { useAuth } from '@/hooks/useAuth';
import { InfoTooltip } from '@/components/common/InfoTooltip';

interface NeedsListProps {
  communityId: string;
  onEdit?: (needId: string) => void;
}

export const NeedsList: Component<NeedsListProps> = (props) => {
  const t = makeTranslator(needsListDict, 'needsList');
  const { user } = useAuth();

  // Mount guard to ensure query only runs after component is fully mounted
  // This prevents reactive scope issues when component is inside Show/Match
  const [isMounted, setIsMounted] = createSignal(false);
  onMount(() => setIsMounted(true));

  // Search and filter states
  const [searchQuery, setSearchQuery] = createSignal('');
  const [showFilters, setShowFilters] = createSignal(false);
  const [statusFilter, setStatusFilter] = createSignal<NeedStatus | undefined>('active');
  const [priorityFilter, setPriorityFilter] = createSignal<NeedPriority | undefined>(undefined);
  const [recurringFilter, setRecurringFilter] = createSignal<boolean | undefined>(undefined);
  const [ownerFilter, setOwnerFilter] = createSignal<'all' | 'mine'>('all');

  const needsQuery = useCommunityNeedsQuery(
    () => isMounted() ? props.communityId : undefined,
    {
      status: statusFilter,
      priority: priorityFilter,
      isRecurring: recurringFilter,
    }
  );

  const deleteMutation = useDeleteNeedMutation();

  // Filter needs based on owner selection and search query
  const filteredNeeds = createMemo(() => {
    let needs = needsQuery.data || [];
    const currentUserId = user()?.id;

    // Owner filter
    if (ownerFilter() === 'mine' && currentUserId) {
      needs = needs.filter(need => need.createdBy === currentUserId);
    }

    // Search filter
    const query = searchQuery().toLowerCase();
    if (query) {
      needs = needs.filter(need =>
        need.title.toLowerCase().includes(query) ||
        need.description?.toLowerCase().includes(query) ||
        need.item?.name?.toLowerCase().includes(query)
      );
    }

    return needs;
  });

  const handleDelete = async (needId: string) => {
    if (!confirm(t('deleteConfirm'))) return;
    try {
      await deleteMutation.mutateAsync({ id: needId, communityId: props.communityId });
    } catch (error) {
      console.error('Failed to delete need:', error);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  const getRecurrenceLabel = (isRecurring: boolean, recurrence?: string) => {
    if (!isRecurring) return t('oneTime');
    if (recurrence === 'daily') return t('daily');
    if (recurrence === 'weekly') return t('weekly');
    if (recurrence === 'monthly') return t('monthly');
    return '';
  };

  const getPriorityBadgeClass = (priority: NeedPriority) => {
    return priority === 'need'
      ? 'bg-danger-100 dark:bg-danger-900 text-danger-700 dark:text-danger-300'
      : 'bg-ocean-100 dark:bg-ocean-900 text-ocean-700 dark:text-ocean-300';
  };

  const getStatusBadgeClass = (status: NeedStatus) => {
    if (status === 'active')
      return 'bg-success-100 dark:bg-success-900 text-success-700 dark:text-success-300';
    if (status === 'fulfilled')
      return 'bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300';
    if (status === 'cancelled')
      return 'bg-warning-100 dark:bg-warning-900 text-warning-700 dark:text-warning-300';
    if (status === 'expired')
      return 'bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400';
    return 'bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300';
  };

  const getItemKindIcon = (kind?: 'object' | 'service') => {
    if (kind === 'object') return '📦';
    if (kind === 'service') return '🛠️';
    return '❓';
  };

  return (
    <div class="space-y-4">
      {/* Search and Filters */}
      <div class="p-4 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg">
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
            {t('advancedSearch')} {showFilters() ? '▲' : '▼'}
          </button>
        </div>

        {/* Collapsible Filters */}
        <Show when={showFilters()}>
          <div class="mt-4 pt-4 border-t border-stone-200 dark:border-stone-700">
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              <div>
                <label class="block text-xs font-medium mb-1 text-stone-700 dark:text-stone-300 flex items-center gap-1">
                  {t('statusLabel')}
                  <InfoTooltip text={t('tooltips.status')} position="bottom" iconSize="xs" />
                </label>
                <select
                  class="w-full px-3 py-2 text-sm border border-stone-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
                  value={statusFilter() || ''}
                  onChange={(e) => {
                    const val = (e.target as HTMLSelectElement).value;
                    setStatusFilter(val ? (val as NeedStatus) : undefined);
                  }}
                >
                  <option value="">{t('allStatuses')}</option>
                  <option value="active">{t('active')}</option>
                  <option value="fulfilled">{t('fulfilled')}</option>
                  <option value="cancelled">{t('cancelled')}</option>
                  <option value="expired">{t('expired')}</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-medium mb-1 text-stone-700 dark:text-stone-300 flex items-center gap-1">
                  {t('priorityLabel')}
                  <InfoTooltip text={t('tooltips.priority')} position="bottom" iconSize="xs" />
                </label>
                <select
                  class="w-full px-3 py-2 text-sm border border-stone-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
                  value={priorityFilter() || ''}
                  onChange={(e) => {
                    const val = (e.target as HTMLSelectElement).value;
                    setPriorityFilter(val ? (val as NeedPriority) : undefined);
                  }}
                >
                  <option value="">{t('allPriorities')}</option>
                  <option value="need">{t('need')}</option>
                  <option value="want">{t('want')}</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-medium mb-1 text-stone-700 dark:text-stone-300 flex items-center gap-1">
                  {t('recurrenceLabel')}
                  <InfoTooltip text={t('tooltips.recurrence')} position="bottom" iconSize="xs" />
                </label>
                <select
                  class="w-full px-3 py-2 text-sm border border-stone-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
                  value={
                    recurringFilter() === undefined ? '' : recurringFilter() ? 'recurring' : 'onetime'
                  }
                  onChange={(e) => {
                    const val = (e.target as HTMLSelectElement).value;
                    setRecurringFilter(
                      val === '' ? undefined : val === 'recurring' ? true : false
                    );
                  }}
                >
                  <option value="">{t('allRecurrences')}</option>
                  <option value="recurring">{t('recurringOnly')}</option>
                  <option value="onetime">{t('oneTimeOnly')}</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-medium mb-1 text-stone-700 dark:text-stone-300">
                  {t('ownerLabel')}
                </label>
                <select
                  class="w-full px-3 py-2 text-sm border border-stone-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100"
                  value={ownerFilter()}
                  onChange={(e) => {
                    const val = (e.target as HTMLSelectElement).value as 'all' | 'mine';
                    setOwnerFilter(val);
                  }}
                >
                  <option value="all">{t('allNeeds')}</option>
                  <option value="mine">{t('myNeeds')}</option>
                </select>
              </div>
            </div>
          </div>
        </Show>
      </div>

      {/* Needs List */}
      <Show
        when={!needsQuery.isLoading}
        fallback={
          <div class="p-4 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg text-center text-stone-600 dark:text-stone-400">
            {t('loadingMessage')}
          </div>
        }
      >
        <Show
          when={filteredNeeds() && filteredNeeds().length > 0}
          fallback={
            <div class="p-6 text-center text-stone-500 dark:text-stone-400 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg">
              <h4 class="text-sm font-semibold mb-1 text-stone-900 dark:text-stone-100">
                {t('emptyTitle')}
              </h4>
              <p class="text-xs">{t('emptyMessage')}</p>
            </div>
          }
        >
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <For each={filteredNeeds()}>
              {(need) => (
                <div class="p-3 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg hover:border-ocean-400 dark:hover:border-ocean-600 transition-colors">
                  {/* Header with title, icon, and badges */}
                  <div class="flex items-start justify-between gap-2 mb-2">
                    <div class="flex items-center gap-2 min-w-0 flex-1">
                      <span class="text-sm flex-shrink-0">
                        {getItemKindIcon(need.item?.kind)}
                      </span>
                      <h4
                        class="text-sm font-medium text-stone-900 dark:text-stone-100 truncate"
                        title={need.title}
                      >
                        {need.title}
                      </h4>
                    </div>
                    <div class="flex gap-1 flex-shrink-0">
                      <span class={`px-1.5 py-0.5 text-xs rounded ${getPriorityBadgeClass(need.priority)}`}>
                        {need.priority === 'need' ? t('need') : t('want')}
                      </span>
                      <span class={`px-1.5 py-0.5 text-xs rounded ${getStatusBadgeClass(need.status)}`}>
                        {need.status}
                      </span>
                    </div>
                  </div>

                  {/* Item name */}
                  <Show when={need.item}>
                    <p class="text-xs text-stone-600 dark:text-stone-400 truncate mb-2">
                      {need.item!.name}
                    </p>
                  </Show>

                  {/* Key info */}
                  <div class="text-xs text-stone-500 dark:text-stone-400 space-y-0.5">
                    <div class="font-medium text-ocean-600 dark:text-ocean-400">
                      {need.unitsNeeded} {t('unitsLabel')}
                    </div>
                    <div class="flex items-center gap-2">
                      <span>{getRecurrenceLabel(need.isRecurring, need.recurrence)}</span>
                      <Show when={need.nextFulfillmentDate}>
                        <span>•</span>
                        <span>{formatDate(need.nextFulfillmentDate)}</span>
                      </Show>
                    </div>
                  </div>

                  {/* Actions for owner */}
                  <Show when={user()?.id === need.createdBy}>
                    <div class="flex gap-1 mt-2 pt-2 border-t border-stone-200 dark:border-stone-700">
                      <Show when={props.onEdit}>
                        <button
                          onClick={() => props.onEdit?.(need.id)}
                          class="px-2 py-1 text-xs border border-stone-300 dark:border-stone-600 rounded hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300"
                        >
                          {t('editButton')}
                        </button>
                      </Show>
                      <button
                        onClick={() => handleDelete(need.id)}
                        disabled={deleteMutation.isPending}
                        class="px-2 py-1 text-xs bg-danger-600 text-white rounded hover:bg-danger-700 disabled:opacity-50"
                      >
                        {t('deleteButton')}
                      </button>
                    </div>
                  </Show>
                </div>
              )}
            </For>
          </div>
        </Show>
      </Show>
    </div>
  );
};

export default NeedsList;
