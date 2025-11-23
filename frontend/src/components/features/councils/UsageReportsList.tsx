import { Component, Show, For, createSignal } from 'solid-js';
import { useUsageReportsQuery, useDeleteUsageReportMutation } from '@/hooks/queries/useUsageReports';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Icon } from '@/components/common/Icon';
import { renderMarkdown } from '@/utils/markdown';
import { makeTranslator } from '@/i18n/makeTranslator';
import { usageReportsDict } from './UsageReportsList.i18n';
import type { UsageReport } from '@/types/council.types';

interface UsageReportsListProps {
  communityId: string;
  councilId: string;
  isManager?: boolean;
  onCreateReport?: () => void;
}

export const UsageReportsList: Component<UsageReportsListProps> = (props) => {
  const t = makeTranslator(usageReportsDict, 'usageReports');

  const [expandedReportId, setExpandedReportId] = createSignal<string | null>(null);
  const [deletingId, setDeletingId] = createSignal<string | null>(null);

  const reportsQuery = useUsageReportsQuery(
    () => props.communityId,
    () => props.councilId
  );

  const deleteMutation = useDeleteUsageReportMutation();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const toggleExpand = (reportId: string) => {
    setExpandedReportId((prev) => (prev === reportId ? null : reportId));
  };

  const handleDelete = async (report: UsageReport) => {
    if (!confirm(t('confirmDelete'))) return;

    setDeletingId(report.id);
    try {
      await deleteMutation.mutateAsync({
        communityId: props.communityId,
        councilId: props.councilId,
        reportId: report.id,
      });
    } catch (error) {
      console.error('Failed to delete report:', error);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div class="space-y-4">
      {/* Header with create button */}
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold text-stone-900 dark:text-stone-100">
          {t('title')}
        </h3>
        <Show when={props.isManager && props.onCreateReport}>
          <Button variant="primary" size="sm" onClick={props.onCreateReport}>
            <Icon name="plus" size={16} class="mr-1" />
            {t('createReport')}
          </Button>
        </Show>
      </div>

      {/* Description */}
      <p class="text-sm text-stone-600 dark:text-stone-400">
        {t('description')}
      </p>

      {/* Loading state */}
      <Show when={reportsQuery.isLoading}>
        <div class="text-center py-8">
          <p class="text-stone-500 dark:text-stone-400">{t('loading')}</p>
        </div>
      </Show>

      {/* Error state */}
      <Show when={reportsQuery.isError}>
        <div class="bg-danger-100 dark:bg-danger-900 text-danger-800 dark:text-danger-200 px-4 py-3 rounded-md">
          {t('error')}
        </div>
      </Show>

      {/* Empty state */}
      <Show when={!reportsQuery.isLoading && reportsQuery.data?.reports.length === 0}>
        <div class="text-center py-8">
          <Icon
            name="document"
            size={48}
            class="mx-auto mb-4 text-stone-300 dark:text-stone-600"
          />
          <p class="text-stone-500 dark:text-stone-400 italic">{t('noReports')}</p>
          <Show when={props.isManager}>
            <p class="text-sm text-stone-400 dark:text-stone-500 mt-2">
              {t('createReportHint')}
            </p>
          </Show>
        </div>
      </Show>

      {/* Reports list */}
      <Show when={reportsQuery.data?.reports && reportsQuery.data.reports.length > 0}>
        <div class="space-y-4">
          <For each={reportsQuery.data!.reports}>
            {(report) => (
              <Card>
                <div class="p-4">
                  {/* Report header */}
                  <div class="flex items-start justify-between">
                    <div class="flex-1">
                      <button
                        onClick={() => toggleExpand(report.id)}
                        class="text-left w-full"
                      >
                        <h4 class="text-lg font-semibold text-stone-900 dark:text-stone-100 hover:text-ocean-600 dark:hover:text-ocean-400">
                          {report.title}
                        </h4>
                        <div class="flex items-center gap-3 mt-1 text-sm text-stone-500 dark:text-stone-400">
                          <span class="flex items-center gap-1">
                            <Icon name="members" size={14} />
                            {report.creatorName}
                          </span>
                          <span class="flex items-center gap-1">
                            <Icon name="activity" size={14} />
                            {formatDate(report.createdAt)}
                          </span>
                          <Show when={report.items && report.items.length > 0}>
                            <span class="flex items-center gap-1">
                              <Icon name="items" size={14} />
                              {report.items.length}
                            </span>
                          </Show>
                          <Show when={report.attachments.length > 0}>
                            <span class="flex items-center gap-1">
                              <Icon name="attachment" size={14} />
                              {report.attachments.length}
                            </span>
                          </Show>
                        </div>
                      </button>
                    </div>
                    <div class="flex items-center gap-2">
                      <button
                        onClick={() => toggleExpand(report.id)}
                        class="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
                      >
                        <Icon
                          name={expandedReportId() === report.id ? 'chevron-up' : 'chevron-down'}
                          size={20}
                        />
                      </button>
                      <Show when={props.isManager}>
                        <button
                          onClick={() => handleDelete(report)}
                          disabled={deletingId() === report.id}
                          class="p-1 text-danger-500 hover:text-danger-700 dark:hover:text-danger-400 disabled:opacity-50"
                        >
                          <Icon name="trash" size={16} />
                        </button>
                      </Show>
                    </div>
                  </div>

                  {/* Expanded content */}
                  <Show when={expandedReportId() === report.id}>
                    <div class="mt-4 pt-4 border-t border-stone-200 dark:border-stone-700">
                      {/* Markdown content */}
                      <div
                        class="prose dark:prose-invert max-w-none text-sm"
                        innerHTML={renderMarkdown(report.content)}
                      />

                      {/* Items Used */}
                      <Show when={report.items && report.items.length > 0}>
                        <div class="mt-4 pt-4 border-t border-stone-200 dark:border-stone-700">
                          <h5 class="text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                            {t('itemsUsed')}
                          </h5>
                          <div class="space-y-2">
                            <For each={report.items}>
                              {(item) => (
                                <div class="flex items-center gap-3 p-2 bg-stone-50 dark:bg-stone-800 rounded">
                                  <Icon name="items" size={16} class="text-stone-400" />
                                  <span class="flex-1 text-sm text-stone-900 dark:text-stone-100">
                                    {item.itemName}
                                  </span>
                                  <span class="text-sm font-medium text-stone-600 dark:text-stone-400">
                                    x{item.quantity}
                                  </span>
                                </div>
                              )}
                            </For>
                          </div>
                        </div>
                      </Show>

                      {/* Attachments */}
                      <Show when={report.attachments.length > 0}>
                        <div class="mt-4 pt-4 border-t border-stone-200 dark:border-stone-700">
                          <h5 class="text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                            {t('attachments')}
                          </h5>
                          <div class="space-y-2">
                            <For each={report.attachments}>
                              {(attachment) => (
                                <a
                                  href={attachment.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  class="flex items-center gap-3 p-2 bg-stone-50 dark:bg-stone-800 rounded hover:bg-stone-100 dark:hover:bg-stone-700"
                                >
                                  <Icon name="document" size={16} class="text-stone-400" />
                                  <div class="flex-1 min-w-0">
                                    <p class="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">
                                      {attachment.originalName}
                                    </p>
                                    <p class="text-xs text-stone-500 dark:text-stone-400">
                                      {formatFileSize(attachment.size)}
                                    </p>
                                  </div>
                                  <Icon name="download" size={16} class="text-ocean-500" />
                                </a>
                              )}
                            </For>
                          </div>
                        </div>
                      </Show>

                      {/* Updated timestamp */}
                      <Show when={report.updatedAt !== report.createdAt}>
                        <p class="mt-4 text-xs text-stone-400 dark:text-stone-500">
                          {t('lastUpdated')}: {formatDateTime(report.updatedAt)}
                        </p>
                      </Show>
                    </div>
                  </Show>
                </div>
              </Card>
            )}
          </For>
        </div>
      </Show>
    </div>
  );
};
