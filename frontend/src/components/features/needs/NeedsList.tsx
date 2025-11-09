import { Component, createSignal, For, Show, createMemo } from 'solid-js';
import { useNavigate } from '@solidjs/router';
import { useCommunityNeedsQuery, useDeleteNeedMutation } from '@/hooks/queries/useNeeds';
import type { NeedPriority, NeedStatus } from '@/types/needs.types';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { makeTranslator } from '@/i18n/makeTranslator';
import { needsListDict } from '@/components/features/needs/NeedsList.i18n';
import { useAuth } from '@/hooks/useAuth';
import { useCommunity } from '@/contexts/CommunityContext';

interface NeedsListProps {
  communityId: string;
  onEdit?: (needId: string) => void;
}

export const NeedsList: Component<NeedsListProps> = (props) => {
  const t = makeTranslator(needsListDict, 'needsList');
  const { user } = useAuth();
  const { canPublishNeeds } = useCommunity();
  const navigate = useNavigate();

  // Filter states
  const [statusFilter, setStatusFilter] = createSignal<NeedStatus | undefined>('active');
  const [priorityFilter, setPriorityFilter] = createSignal<NeedPriority | undefined>(undefined);
  const [recurringFilter, setRecurringFilter] = createSignal<boolean | undefined>(undefined);
  const [ownerFilter, setOwnerFilter] = createSignal<'all' | 'mine'>('all');

  const needsQuery = useCommunityNeedsQuery(
    () => props.communityId,
    {
      status: statusFilter,
      priority: priorityFilter,
      isRecurring: recurringFilter,
    }
  );

  const deleteMutation = useDeleteNeedMutation();

  // Filter needs based on owner selection
  const filteredNeeds = createMemo(() => {
    const needs = needsQuery.data || [];
    const currentUserId = user()?.id;

    if (ownerFilter() === 'mine' && currentUserId) {
      return needs.filter(need => need.createdBy === currentUserId);
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
      ? 'bg-danger-100 dark:bg-danger-900 text-danger-800 dark:text-danger-200'
      : 'bg-ocean-100 dark:bg-ocean-900 text-ocean-800 dark:text-ocean-200';
  };

  const getStatusBadgeClass = (status: NeedStatus) => {
    if (status === 'active')
      return 'bg-success-100 dark:bg-success-900 text-success-800 dark:text-success-200';
    if (status === 'fulfilled')
      return 'bg-stone-100 dark:bg-stone-700 text-stone-800 dark:text-stone-200';
    if (status === 'cancelled')
      return 'bg-warning-100 dark:bg-warning-900 text-warning-800 dark:text-warning-200';
    if (status === 'expired')
      return 'bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400';
    return 'bg-stone-100 dark:bg-stone-700 text-stone-800 dark:text-stone-200';
  };

  const getItemKindIcon = (kind?: 'object' | 'service') => {
    if (kind === 'object') return '📦';
    if (kind === 'service') return '🛠️';
    return '❓';
  };

  return (
    <div class="space-y-4">
      {/* Create Need Button */}
      <Show when={canPublishNeeds()}>
        <div class="flex justify-end">
          <Button
            onClick={() => navigate(`/communities/${props.communityId}/needs/create`)}
            class="flex items-center gap-2"
          >
            <span class="text-lg">+</span>
            {t('createNeed')}
          </Button>
        </div>
      </Show>

      {/* Filters */}
      <Card class="p-4">
        <h4 class="text-sm font-semibold mb-3 text-stone-900 dark:text-stone-100">
          {t('filterLabel')}
        </h4>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label class="block text-xs font-medium mb-1 text-stone-900 dark:text-stone-100">
              {t('statusLabel')}
            </label>
            <select
              class="w-full border rounded px-2 py-1 text-sm border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
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
            <label class="block text-xs font-medium mb-1 text-stone-900 dark:text-stone-100">
              {t('priorityLabel')}
            </label>
            <select
              class="w-full border rounded px-2 py-1 text-sm border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
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
            <label class="block text-xs font-medium mb-1 text-stone-900 dark:text-stone-100">
              {t('recurrenceLabel')}
            </label>
            <select
              class="w-full border rounded px-2 py-1 text-sm border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
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
            <label class="block text-xs font-medium mb-1 text-stone-900 dark:text-stone-100">
              {t('ownerLabel')}
            </label>
            <select
              class="w-full border rounded px-2 py-1 text-sm border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
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
      </Card>

      {/* Needs List */}
      <Show
        when={!needsQuery.isLoading}
        fallback={
          <Card class="p-4">
            <p class="text-center text-stone-600 dark:text-stone-400">{t('loadingMessage')}</p>
          </Card>
        }
      >
        <Show
          when={filteredNeeds() && filteredNeeds().length > 0}
          fallback={
            <Card class="p-8 text-center">
              <h4 class="text-lg font-semibold mb-2 text-stone-900 dark:text-stone-100">
                {t('emptyTitle')}
              </h4>
              <p class="text-stone-600 dark:text-stone-400">{t('emptyMessage')}</p>
            </Card>
          }
        >
          <div class="space-y-3">
            <For each={filteredNeeds()}>
              {(need) => (
                <Card class="p-4 hover:shadow-lg transition-shadow">
                  <div class="flex items-start gap-4">
                    {/* Item Icon */}
                    <div class="text-3xl">{getItemKindIcon(need.item?.kind)}</div>

                    {/* Main Content */}
                    <div class="flex-1">
                      {/* Title and Badges */}
                      <div class="flex items-start justify-between mb-2">
                        <div>
                          <h4 class="text-lg font-semibold text-stone-900 dark:text-stone-100">
                            {need.title}
                          </h4>
                          <Show when={need.item}>
                            <p class="text-sm text-stone-600 dark:text-stone-400">
                              {need.item!.name}
                            </p>
                          </Show>
                        </div>
                        <div class="flex gap-2">
                          <span
                            class={`px-2 py-1 text-xs rounded-full font-semibold ${getPriorityBadgeClass(need.priority)}`}
                          >
                            {need.priority === 'need' ? t('need') : t('want')}
                          </span>
                          <span
                            class={`px-2 py-1 text-xs rounded-full font-semibold ${getStatusBadgeClass(need.status)}`}
                          >
                            {need.status}
                          </span>
                        </div>
                      </div>

                      {/* Description */}
                      <Show when={need.description}>
                        <p class="text-sm text-stone-700 dark:text-stone-300 mb-2">
                          {need.description}
                        </p>
                      </Show>

                      {/* Units and Recurrence */}
                      <div class="flex items-center gap-4 text-sm text-stone-600 dark:text-stone-400 mb-2">
                        <span class="font-semibold text-ocean-700 dark:text-ocean-300">
                          {need.unitsNeeded} {t('unitsLabel')}
                        </span>
                        <Show when={need.isRecurring}>
                          <span class="px-2 py-1 bg-leaf-100 dark:bg-leaf-900 text-leaf-800 dark:text-leaf-200 rounded text-xs font-semibold">
                            {getRecurrenceLabel(need.isRecurring, need.recurrence)}
                          </span>
                        </Show>
                        <Show when={need.nextFulfillmentDate}>
                          <span class="text-xs">
                            {t('nextFulfillment')}: {formatDate(need.nextFulfillmentDate)}
                          </span>
                        </Show>
                      </div>

                      {/* Creator and Actions */}
                      <div class="flex items-center justify-between mt-3 pt-3 border-t border-stone-200 dark:border-stone-700">
                        <p class="text-xs text-stone-500 dark:text-stone-400">
                          {t('createdBy')}: {need.createdBy}
                        </p>
                        <Show when={user()?.id === need.createdBy}>
                          <div class="flex gap-2">
                            <Show when={props.onEdit}>
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => props.onEdit?.(need.id)}
                              >
                                {t('editButton')}
                              </Button>
                            </Show>
                            <Button
                              size="sm"
                              variant="danger"
                              onClick={() => handleDelete(need.id)}
                              disabled={deleteMutation.isPending}
                            >
                              {t('deleteButton')}
                            </Button>
                          </div>
                        </Show>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </For>
          </div>
        </Show>
      </Show>
    </div>
  );
};

export default NeedsList;
