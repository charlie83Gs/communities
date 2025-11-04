import { Component, Show, createSignal } from 'solid-js';
import { useInitiativeDetailQuery } from '@/hooks/queries/useInitiatives';
import { VoteButtons } from './VoteButtons';
import { InitiativeComments } from './InitiativeComments';
import { ReportsList } from './ReportsList';
import { CreateReportModal } from './CreateReportModal';
import { renderMarkdown } from '@/utils/markdown';
import { Button } from '@/components/common/Button';
import { makeTranslator } from '@/i18n/makeTranslator';
import { initiativesDict } from './initiatives.i18n';

interface InitiativeDetailProps {
  communityId: string;
  initiativeId: string;
  onClose?: () => void;
  canCreateReport?: boolean;
}

export const InitiativeDetail: Component<InitiativeDetailProps> = (props) => {
  const t = makeTranslator(initiativesDict, 'initiatives');
  const [showCreateReport, setShowCreateReport] = createSignal(false);

  const initiativeQuery = useInitiativeDetailQuery(
    () => props.communityId,
    () => props.initiativeId
  );

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadgeClass = (status: 'active' | 'completed' | 'cancelled') => {
    switch (status) {
      case 'active':
        return 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200';
      case 'completed':
        return 'bg-ocean-100 text-ocean-800 dark:bg-ocean-900 dark:text-ocean-200';
      case 'cancelled':
        return 'bg-stone-100 text-stone-800 dark:bg-stone-700 dark:text-stone-200';
      default:
        return 'bg-stone-100 text-stone-800 dark:bg-stone-700 dark:text-stone-200';
    }
  };

  const getStatusLabel = (status: 'active' | 'completed' | 'cancelled') => {
    switch (status) {
      case 'active':
        return t('statusActive');
      case 'completed':
        return t('statusCompleted');
      case 'cancelled':
        return t('statusCancelled');
      default:
        return status;
    }
  };

  return (
    <>
      <div class="bg-stone-50 dark:bg-stone-800 rounded-lg max-w-5xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-stone-200 dark:border-stone-700">
        <Show
          when={!initiativeQuery.isLoading}
          fallback={
            <div class="p-6 text-center text-stone-500 dark:text-stone-400">
              {t('loading')}
            </div>
          }
        >
          <Show when={initiativeQuery.data}>
            {(initiative) => (
              <>
                {/* Header */}
                <div class="sticky top-0 bg-stone-50 dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700 p-6 z-10">
                  <div class="flex justify-between items-start mb-4">
                    <div class="flex-1">
                      <div class="flex items-center gap-3 mb-2">
                        <h2 class="text-2xl font-bold text-stone-900 dark:text-stone-100">
                          {initiative().title}
                        </h2>
                        <span
                          class={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(
                            initiative().status
                          )}`}
                        >
                          {getStatusLabel(initiative().status)}
                        </span>
                      </div>
                      <div class="flex flex-wrap gap-4 text-xs text-stone-500 dark:text-stone-400">
                        <div>
                          {t('createdBy')}: {initiative().createdBy || 'Unknown'}
                        </div>
                        <div>{t('createdAt')}: {formatDateTime(initiative().createdAt)}</div>
                      </div>
                    </div>
                    <Show when={props.onClose}>
                      <button
                        onClick={props.onClose}
                        class="text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-300 text-sm font-medium"
                      >
                        ✕
                      </button>
                    </Show>
                  </div>

                  {/* Vote buttons */}
                  <div class="flex items-center gap-4">
                    <VoteButtons
                      communityId={props.communityId}
                      initiativeId={props.initiativeId}
                      upvotes={initiative().upvotes || 0}
                      downvotes={initiative().downvotes || 0}
                      userVote={initiative().userVote}
                    />
                  </div>
                </div>

                {/* Content */}
                <div class="p-6 space-y-6">
                  {/* Description */}
                  <div>
                    <div
                      class="prose dark:prose-invert max-w-none"
                      innerHTML={renderMarkdown(initiative().description)}
                    />
                  </div>

                  {/* Reports section */}
                  <div class="border-t border-stone-200 dark:border-stone-700 pt-6">
                    <div class="flex items-center justify-between mb-4">
                      <h3 class="text-lg font-semibold text-stone-900 dark:text-stone-100">
                        {t('reportsSection')}
                      </h3>
                      <Show when={props.canCreateReport}>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setShowCreateReport(true)}
                        >
                          {t('createReport')}
                        </Button>
                      </Show>
                    </div>
                    <ReportsList
                      communityId={props.communityId}
                      initiativeId={props.initiativeId}
                    />
                  </div>

                  {/* Comments section */}
                  <div class="border-t border-stone-200 dark:border-stone-700 pt-6">
                    <InitiativeComments
                      communityId={props.communityId}
                      initiativeId={props.initiativeId}
                    />
                  </div>
                </div>
              </>
            )}
          </Show>
        </Show>
      </div>

      {/* Create report modal */}
      <CreateReportModal
        communityId={props.communityId}
        initiativeId={props.initiativeId}
        isOpen={showCreateReport()}
        onClose={() => setShowCreateReport(false)}
      />
    </>
  );
};
