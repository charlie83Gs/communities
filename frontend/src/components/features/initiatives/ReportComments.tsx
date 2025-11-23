import { Component, Show, For, createSignal } from 'solid-js';
import {
  useReportCommentsQuery,
  useCreateReportCommentMutation,
} from '@/hooks/queries/useInitiatives';
import { makeTranslator } from '@/i18n/makeTranslator';
import { initiativesDict } from './initiatives.i18n';
import { Button } from '@/components/common/Button';

interface ReportCommentsProps {
  communityId: string;
  councilId: string;
  initiativeId: string;
  reportId: string;
}

export const ReportComments: Component<ReportCommentsProps> = (props) => {
  const t = makeTranslator(initiativesDict, 'initiatives');
  const [commentText, setCommentText] = createSignal('');

  const commentsQuery = useReportCommentsQuery(
    () => props.communityId,
    () => props.councilId,
    () => props.initiativeId,
    () => props.reportId
  );
  const createCommentMutation = useCreateReportCommentMutation();

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    const content = commentText().trim();
    if (!content) return;

    try {
      await createCommentMutation.mutateAsync({
        communityId: props.communityId,
        councilId: props.councilId,
        initiativeId: props.initiativeId,
        reportId: props.reportId,
        dto: { content },
      });
      setCommentText('');
    } catch (error) {
      console.error('Failed to create comment:', error);
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div class="space-y-4">
      <h4 class="text-md font-semibold text-stone-900 dark:text-stone-100">
        {t('commentsSection')}
      </h4>

      {/* Comment form */}
      <form onSubmit={handleSubmit} class="space-y-3">
        <textarea
          value={commentText()}
          onInput={(e) => setCommentText(e.currentTarget.value)}
          placeholder={t('commentPlaceholder')}
          rows={3}
          class="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded-md focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 resize-vertical"
        />
        <div class="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            size="sm"
            loading={createCommentMutation.isPending}
            disabled={!commentText().trim()}
          >
            {createCommentMutation.isPending ? t('submitting') : t('addComment')}
          </Button>
        </div>
      </form>

      {/* Comments list */}
      <Show
        when={!commentsQuery.isLoading}
        fallback={
          <p class="text-sm text-stone-500 dark:text-stone-400">{t('loading')}</p>
        }
      >
        <Show
          when={commentsQuery.data && commentsQuery.data.length > 0}
          fallback={
            <p class="text-sm text-stone-500 dark:text-stone-400 italic">
              {t('noComments')}
            </p>
          }
        >
          <div class="space-y-3">
            <For each={commentsQuery.data}>
              {(comment) => (
                <div class="p-3 bg-stone-50 dark:bg-stone-800 rounded-md border border-stone-200 dark:border-stone-700">
                  <div class="flex items-start justify-between mb-2">
                    <div class="font-medium text-sm text-stone-900 dark:text-stone-100">
                      {comment.authorName}
                    </div>
                    <div class="text-xs text-stone-500 dark:text-stone-400">
                      {formatDateTime(comment.createdAt)}
                    </div>
                  </div>
                  <div class="text-sm text-stone-700 dark:text-stone-300 whitespace-pre-wrap">
                    {comment.content}
                  </div>
                </div>
              )}
            </For>
          </div>
        </Show>
      </Show>
    </div>
  );
};
