import { Component, For, Show, createSignal } from 'solid-js';
import { A } from '@solidjs/router';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { useAuth } from '@/hooks/useAuth';
import {
  useWealthCommentsQuery,
  useCreateWealthCommentMutation,
  useDeleteWealthCommentMutation,
} from '@/hooks/queries/useWealthComments';
import { useUserQuery } from '@/hooks/queries/useUserQuery';
import type { WealthComment } from '@/types/wealth.types';
import { makeTranslator } from '@/i18n/makeTranslator';
import { wealthCommentsDict } from '@/components/features/wealth/WealthComments.i18n';

interface WealthCommentsProps {
  wealthId: string;
}

// Renders author name with link to user page
const CommentAuthor: Component<{ userId: string; dateISO: string }> = (props) => {
  const userQuery = useUserQuery(() => props.userId);
  const t = makeTranslator(wealthCommentsDict, 'wealthComments');
  return (
    <span class="mt-1 text-xs text-stone-500 dark:text-stone-400">
      {t('by')}{' '}
      <Show when={!userQuery.isLoading && userQuery.data} fallback={props.userId.slice(0, 8)}>
        {(u) => (
          <A href={`/users/${u().id}`} class="text-blue-600 hover:underline">
            {u().username || u().displayName || u().email || u().id.slice(0, 8)}
          </A>
        )}
      </Show>
      {' '}&bull; {new Date(props.dateISO).toLocaleString()}
    </span>
  );
};

export const WealthComments: Component<WealthCommentsProps> = (props) => {
  const { user, isAuthenticated } = useAuth();
  const t = makeTranslator(wealthCommentsDict, 'wealthComments');

  // Fetch comments
  const commentsQuery = useWealthCommentsQuery(() => props.wealthId);

  // Mutations
  const createMutation = useCreateWealthCommentMutation();
  const deleteMutation = useDeleteWealthCommentMutation();

  // Form state
  const [content, setContent] = createSignal('');
  const [error, setError] = createSignal<string | null>(null);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError(null);
    const trimmed = content().trim();
    if (!trimmed) {
      setError(t('errors.empty'));
      return;
    }
    await createMutation.mutateAsync({
      wealthId: props.wealthId,
      dto: { content: trimmed },
    });
    setContent('');
  };

  const canDelete = (c: WealthComment) => {
    const me = user();
    if (!me) return false;
    return c.authorId === me.id; // backend also allows share owner; keeping minimal for now
  };

  return (
    <div class="space-y-3">
      <h3 class="text-lg font-semibold">{t('title')}</h3>

      <Card class="p-3">
        <Show when={isAuthenticated()} fallback={<p class="text-sm text-stone-600 dark:text-stone-400">{t('signinToSee')}</p>}>
          <Show when={!commentsQuery.isLoading} fallback={<p>{t('loading')}</p>}>
            <Show when={(commentsQuery.data?.length ?? 0) > 0} fallback={<p class="text-sm text-stone-500 dark:text-stone-400">{t('empty')}</p>}>
              <ul class="space-y-3">
                <For each={commentsQuery.data}>
                  {(c) => (
                    <li class="border rounded p-3">
                      <div class="flex items-start justify-between gap-3">
                        <div class="min-w-0">
                          <p class="text-sm whitespace-pre-wrap break-words">{c.content}</p>
                          <CommentAuthor userId={c.authorId} dateISO={c.createdAt} />
                        </div>
                        <Show when={canDelete(c)}>
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={deleteMutation.isPending}
                            onClick={() => deleteMutation.mutateAsync({ wealthId: props.wealthId, commentId: c.id })}
                          >
                            {deleteMutation.isPending ? t('deleting') : t('delete')}
                          </Button>
                        </Show>
                      </div>
                    </li>
                  )}
                </For>
              </ul>
            </Show>
          </Show>
        </Show>
      </Card>

      <Show when={isAuthenticated()}>
        <Card class="p-3">
          <form class="space-y-2" onSubmit={handleSubmit}>
            <Show when={error()}>
              <p class="text-sm text-red-600">{error()}</p>
            </Show>
            <div>
              <label class="block text-sm font-medium mb-1">{t('addLabel')}</label>
              <textarea
                class="w-full border rounded px-3 py-2"
                rows={3}
                placeholder={t('placeholder')}
                value={content()}
                onInput={(e) => setContent((e.target as HTMLTextAreaElement).value)}
              />
            </div>
            <div class="flex gap-2">
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? t('posting') : t('post')}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setContent('');
                  setError(null);
                }}
                disabled={createMutation.isPending}
              >
                {t('clear')}
              </Button>
            </div>
          </form>
        </Card>
      </Show>
    </div>
  );
};