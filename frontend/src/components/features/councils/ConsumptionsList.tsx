import { Component, Show, For, createSignal } from 'solid-js';
import {
  useConsumptionsQuery,
  useDeleteConsumptionMutation,
  useLinkToReportMutation,
} from '@/hooks/queries/useConsumptions';
import { useUsageReportsQuery } from '@/hooks/queries/useUsageReports';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Icon } from '@/components/common/Icon';
import { makeTranslator } from '@/i18n/makeTranslator';
import { consumptionsDict } from './ConsumptionsList.i18n';
import type { PoolConsumption } from '@/types/consumption.types';

interface ConsumptionsListProps {
  communityId: string;
  councilId: string;
  isManager?: boolean;
  onCreateConsumption?: () => void;
}

export const ConsumptionsList: Component<ConsumptionsListProps> = (props) => {
  const t = makeTranslator(consumptionsDict, 'consumptions');

  const [deletingId, setDeletingId] = createSignal<string | null>(null);
  const [linkingId, setLinkingId] = createSignal<string | null>(null);

  const consumptionsQuery = useConsumptionsQuery(
    () => props.communityId,
    () => props.councilId
  );

  const reportsQuery = useUsageReportsQuery(
    () => props.communityId,
    () => props.councilId
  );

  const deleteMutation = useDeleteConsumptionMutation();
  const linkMutation = useLinkToReportMutation();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleDelete = async (consumption: PoolConsumption) => {
    if (!confirm(t('confirmDelete'))) return;

    setDeletingId(consumption.id);
    try {
      await deleteMutation.mutateAsync({
        communityId: props.communityId,
        councilId: props.councilId,
        consumptionId: consumption.id,
      });
    } catch (error) {
      console.error('Failed to delete consumption:', error);
    } finally {
      setDeletingId(null);
    }
  };

  const handleLinkToReport = async (consumption: PoolConsumption, reportId: string) => {
    setLinkingId(consumption.id);
    try {
      await linkMutation.mutateAsync({
        communityId: props.communityId,
        councilId: props.councilId,
        dto: {
          consumptionIds: [consumption.id],
          reportId,
        },
      });
    } catch (error) {
      console.error('Failed to link to report:', error);
    } finally {
      setLinkingId(null);
    }
  };

  return (
    <div class="space-y-4">
      {/* Header with create button */}
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold text-stone-900 dark:text-stone-100">
          {t('title')}
        </h3>
        <Show when={props.isManager && props.onCreateConsumption}>
          <Button variant="primary" size="sm" onClick={props.onCreateConsumption}>
            <Icon name="plus" size={16} class="mr-1" />
            {t('createConsumption')}
          </Button>
        </Show>
      </div>

      {/* Description */}
      <p class="text-sm text-stone-600 dark:text-stone-400">{t('description')}</p>

      {/* Loading state */}
      <Show when={consumptionsQuery.isLoading}>
        <div class="text-center py-8">
          <p class="text-stone-500 dark:text-stone-400">{t('loading')}</p>
        </div>
      </Show>

      {/* Error state */}
      <Show when={consumptionsQuery.isError}>
        <div class="bg-danger-100 dark:bg-danger-900 text-danger-800 dark:text-danger-200 px-4 py-3 rounded-md">
          {t('error')}
        </div>
      </Show>

      {/* Empty state */}
      <Show when={!consumptionsQuery.isLoading && consumptionsQuery.data?.consumptions.length === 0}>
        <div class="text-center py-8">
          <Icon
            name="items"
            size={48}
            class="mx-auto mb-4 text-stone-300 dark:text-stone-600"
          />
          <p class="text-stone-500 dark:text-stone-400 italic">{t('noConsumptions')}</p>
          <Show when={props.isManager}>
            <p class="text-sm text-stone-400 dark:text-stone-500 mt-2">{t('createHint')}</p>
          </Show>
        </div>
      </Show>

      {/* Consumptions table */}
      <Show when={consumptionsQuery.data?.consumptions && consumptionsQuery.data.consumptions.length > 0}>
        <Card>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-stone-200 dark:divide-stone-700">
              <thead class="bg-stone-50 dark:bg-stone-800">
                <tr>
                  <th class="px-4 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                    {t('pool')}
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                    {t('item')}
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                    {t('units')}
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                    {t('description_label')}
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                    {t('report')}
                  </th>
                  <th class="px-4 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                    {t('date')}
                  </th>
                  <Show when={props.isManager}>
                    <th class="px-4 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                      {t('actions')}
                    </th>
                  </Show>
                </tr>
              </thead>
              <tbody class="bg-white dark:bg-stone-900 divide-y divide-stone-200 dark:divide-stone-700">
                <For each={consumptionsQuery.data!.consumptions}>
                  {(consumption) => (
                    <tr class="hover:bg-stone-50 dark:hover:bg-stone-800">
                      <td class="px-4 py-3 whitespace-nowrap text-sm text-stone-900 dark:text-stone-100">
                        {consumption.poolName}
                      </td>
                      <td class="px-4 py-3 whitespace-nowrap text-sm text-stone-900 dark:text-stone-100">
                        {consumption.itemName}
                      </td>
                      <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-stone-900 dark:text-stone-100">
                        {consumption.units}
                      </td>
                      <td class="px-4 py-3 text-sm text-stone-600 dark:text-stone-400 max-w-xs truncate">
                        {consumption.description}
                      </td>
                      <td class="px-4 py-3 whitespace-nowrap text-sm">
                        <Show
                          when={consumption.reportTitle}
                          fallback={
                            <Show
                              when={props.isManager && !consumption.reportId}
                              fallback={
                                <span class="text-stone-400 dark:text-stone-500 italic">
                                  {t('noReport')}
                                </span>
                              }
                            >
                              <select
                                class="text-sm border border-stone-300 dark:border-stone-600 rounded px-2 py-1 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                                onChange={(e) => {
                                  const val = e.currentTarget.value;
                                  if (val) handleLinkToReport(consumption, val);
                                }}
                                disabled={linkingId() === consumption.id}
                              >
                                <option value="">{t('linkToReport')}</option>
                                <For each={reportsQuery.data?.reports || []}>
                                  {(report) => (
                                    <option value={report.id}>{report.title}</option>
                                  )}
                                </For>
                              </select>
                            </Show>
                          }
                        >
                          <span class="text-ocean-600 dark:text-ocean-400">
                            {consumption.reportTitle}
                          </span>
                        </Show>
                      </td>
                      <td class="px-4 py-3 whitespace-nowrap text-sm text-stone-500 dark:text-stone-400">
                        {formatDate(consumption.createdAt)}
                      </td>
                      <Show when={props.isManager}>
                        <td class="px-4 py-3 whitespace-nowrap text-sm">
                          <div class="flex items-center gap-2">
                            <button
                              onClick={() => handleDelete(consumption)}
                              disabled={deletingId() === consumption.id}
                              class="p-1 text-danger-500 hover:text-danger-700 dark:hover:text-danger-400 disabled:opacity-50"
                              title={t('delete')}
                            >
                              <Icon name="trash" size={16} />
                            </button>
                          </div>
                        </td>
                      </Show>
                    </tr>
                  )}
                </For>
              </tbody>
            </table>
          </div>
        </Card>
      </Show>
    </div>
  );
};
