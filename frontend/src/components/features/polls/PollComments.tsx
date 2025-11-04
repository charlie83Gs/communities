import { Component, Show, For, createSignal } from 'solid-js';
import {
  usePollCommentsQuery,
  useCreatePollCommentMutation,
  useDeletePollCommentMutation,
} from '@/hooks/queries/usePollComments';
import { Button } from '@/components/common/Button';
import { makeTranslator } from '@/i18n/makeTranslator';
import { pollsDict } from './polls.i18n';

interface PollCommentsProps {
  communityId: string;
  pollId: string;
  currentUserId?: string;
}

export const PollComments: Component<PollCommentsProps> = (props) => {
  const t = makeTranslator(pollsDict, 'polls');
  const [newComment, setNewComment] = createSignal('');

  const commentsQuery = usePollCommentsQuery(
    () => props.communityId,
    () => props.pollId
  );
  const createCommentMutation = useCreatePollCommentMutation();
  const deleteCommentMutation = useDeletePollCommentMutation();

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    const content = newComment().trim();
    if (!content) return;

    try {
      await createCommentMutation.mutateAsync({
        communityId: props.communityId,
        pollId: props.pollId,
        dto: { content },
      });
      setNewComment('');
    } catch (err) {
      console.error('Failed to post comment:', err);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm(t('confirmDelete'))) return;

    try {
      await deleteCommentMutation.mutateAsync({
        communityId: props.communityId,
        pollId: props.pollId,
        commentId,
      });
    } catch (err) {
      console.error('Failed to delete comment:', err);
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return t('justNow');
    if (minutes < 60) return `${minutes} ${minutes === 1 ? t('minute') : t('minutes')}`;
    if (hours < 24) return `${hours} ${hours === 1 ? t('hour') : t('hours')}`;
    if (days < 7) return `${days} ${days === 1 ? t('day') : t('days')}`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div class="space-y-4">
      <h3 class="text-lg font-semibold text-stone-900 dark:text-stone-100">{t('comments')}</h3>

      {/* Comment form */}
      <form onSubmit={handleSubmit} class="space-y-2">
        <textarea
          value={newComment()}
          onInput={(e) => setNewComment(e.currentTarget.value)}
          placeholder={t('commentPlaceholder')}
          rows={3}
          class="block w-full rounded-md border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-sm focus:border-ocean-500 focus:ring-ocean-500 sm:text-sm"
        />
        <div class="flex justify-end">
          <Button type="submit" loading={createCommentMutation.isPending} disabled={!newComment().trim()}>
            {createCommentMutation.isPending ? t('posting') : t('postComment')}
          </Button>
        </div>
      </form>

      {/* Comments list */}
      <Show
        when={!commentsQuery.isLoading}
        fallback={
          <div class="text-center py-4 text-stone-500 dark:text-stone-400">
            {t('loading')}
          </div>
        }
      >
        <Show
          when={commentsQuery.data?.comments && commentsQuery.data.comments.length > 0}
          fallback={
            <div class="text-center py-8 bg-stone-50 dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-700">
              <p class="text-stone-500 dark:text-stone-400">{t('noComments')}</p>
            </div>
          }
        >
          <div class="space-y-3">
            <For each={commentsQuery.data?.comments}>
              {(comment) => (
                <div class="bg-stone-50 dark:bg-stone-900 rounded-lg p-4 border border-stone-200 dark:border-stone-700">
                  <div class="flex items-start justify-between mb-2">
                    <div class="flex items-center gap-2">
                      <div class="w-8 h-8 rounded-full bg-ocean-100 dark:bg-ocean-900 flex items-center justify-center">
                        <span class="text-xs font-semibold text-ocean-700 dark:text-ocean-300">
                          {comment.userDisplayName?.charAt(0).toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div>
                        <div class="text-sm font-medium text-stone-900 dark:text-stone-100">
                          {comment.userDisplayName || 'Unknown User'}
                        </div>
                        <div class="text-xs text-stone-500 dark:text-stone-400">
                          {formatDate(comment.createdAt)}
                        </div>
                      </div>
                    </div>
                    <Show when={props.currentUserId === comment.userId}>
                      <button
                        onClick={() => handleDelete(comment.id)}
                        class="text-xs text-danger-600 dark:text-danger-400 hover:text-danger-700 dark:hover:text-danger-300"
                      >
                        {t('deleteComment')}
                      </button>
                    </Show>
                  </div>
                  <p class="text-sm text-stone-700 dark:text-stone-300 whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
              )}
            </For>
          </div>
        </Show>
      </Show>
    </div>
  );
};
