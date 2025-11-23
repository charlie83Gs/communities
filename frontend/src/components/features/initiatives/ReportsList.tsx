import { Component, Show, For, createSignal } from 'solid-js';
import { useInitiativeReportsQuery } from '@/hooks/queries/useInitiatives';
import { ReportDetail } from './ReportDetail';
import { makeTranslator } from '@/i18n/makeTranslator';
import { initiativesDict } from './initiatives.i18n';

interface ReportsListProps {
  communityId: string;
  councilId: string;
  initiativeId: string;
}

export const ReportsList: Component<ReportsListProps> = (props) => {
  const t = makeTranslator(initiativesDict, 'initiatives');
  const [expandedReportId, setExpandedReportId] = createSignal<string | null>(null);

  const reportsQuery = useInitiativeReportsQuery(
    () => props.communityId,
    () => props.councilId,
    () => props.initiativeId
  );

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const toggleReport = (reportId: string) => {
    setExpandedReportId((current) => (current === reportId ? null : reportId));
  };

  return (
    <div class="space-y-3">
      <h3 class="text-lg font-semibold text-stone-900 dark:text-stone-100">
        {t('reportsSection')}
      </h3>

      <Show
        when={!reportsQuery.isLoading}
        fallback={
          <p class="text-sm text-stone-500 dark:text-stone-400">{t('loading')}</p>
        }
      >
        <Show
          when={reportsQuery.data?.reports && reportsQuery.data.reports.length > 0}
          fallback={
            <p class="text-sm text-stone-500 dark:text-stone-400 italic">
              {t('noReports')}
            </p>
          }
        >
          <div class="space-y-3">
            <For each={reportsQuery.data?.reports}>
              {(report) => (
                <div class="border border-stone-200 dark:border-stone-700 rounded-lg overflow-hidden">
                  {/* Report header - clickable to expand/collapse */}
                  <button
                    onClick={() => toggleReport(report.id)}
                    class="w-full p-4 bg-stone-50 dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors text-left"
                  >
                    <div class="flex items-start justify-between">
                      <div class="flex-1">
                        <h4 class="font-semibold text-stone-900 dark:text-stone-100 mb-1">
                          {report.title}
                        </h4>
                        <div class="text-xs text-stone-500 dark:text-stone-400">
                          {t('createdBy')}: {report.createdBy || 'Unknown'} •{' '}
                          {formatDateTime(report.createdAt)}
                        </div>
                      </div>
                      <svg
                        class={`w-5 h-5 text-stone-500 dark:text-stone-400 transition-transform ${
                          expandedReportId() === report.id ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </button>

                  {/* Report detail - expanded */}
                  <Show when={expandedReportId() === report.id}>
                    <div class="p-4 bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-700">
                      <ReportDetail
                        communityId={props.communityId}
                        councilId={props.councilId}
                        initiativeId={props.initiativeId}
                        report={report}
                      />
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
