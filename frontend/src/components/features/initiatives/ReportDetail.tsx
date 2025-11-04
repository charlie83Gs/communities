import { Component } from 'solid-js';
import type { InitiativeReport } from '@/types/initiative.types';
import { ReportComments } from './ReportComments';
import { renderMarkdown } from '@/utils/markdown';
import { makeTranslator } from '@/i18n/makeTranslator';
import { initiativesDict } from './initiatives.i18n';

interface ReportDetailProps {
  communityId: string;
  report: InitiativeReport;
}

export const ReportDetail: Component<ReportDetailProps> = (props) => {
  const t = makeTranslator(initiativesDict, 'initiatives');

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div class="space-y-4">
      <div class="p-4 bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-700">
        {/* Report header */}
        <div class="mb-4">
          <h4 class="text-lg font-bold text-stone-900 dark:text-stone-100 mb-2">
            {props.report.title}
          </h4>
          <div class="flex flex-wrap gap-3 text-xs text-stone-500 dark:text-stone-400">
            <div>
              {t('createdBy')}: {props.report.createdBy || 'Unknown'}
            </div>
            <div>{t('createdAt')}: {formatDateTime(props.report.createdAt)}</div>
          </div>
        </div>

        {/* Report content (markdown) */}
        <div
          class="prose dark:prose-invert max-w-none text-sm"
          innerHTML={renderMarkdown(props.report.content)}
        />
      </div>

      {/* Comments section */}
      <ReportComments communityId={props.communityId} reportId={props.report.id} />
    </div>
  );
};
