import { Component, Show, For, createSignal, createMemo } from 'solid-js';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { useCommunity } from '@/contexts/CommunityContext';
import {
  useForumThreadDetailQuery,
  useCreatePostMutation,
  useDeleteThreadMutation,
  useDeletePostMutation,
  usePinThreadMutation,
  useLockThreadMutation,
  useVoteOnThreadMutation,
  useVoteOnPostMutation,
  useSetBestAnswerMutation,
} from '@/hooks/queries/useForumQueries';
import { authStore } from '@/stores/auth.store';
import { makeTranslator } from '@/i18n/makeTranslator';
import { forumDict } from '@/pages/protected/community/forum.i18n';
import { renderMarkdown } from '@/utils/markdown';
import type { CreatePostDto } from '@/types/forum.types';

interface ForumThreadDetailProps {
  communityId: string;
  threadId: string;
  categoryId: string;
  onBackClick: () => void;
}

export const ForumThreadDetail: Component<ForumThreadDetailProps> = (props) => {
  const t = makeTranslator(forumDict, 'forum');
  const { isAdmin, role } = useCommunity();
  const [replyContent, setReplyContent] = createSignal('');
  const [showDeleteThreadConfirm, setShowDeleteThreadConfirm] = createSignal(false);
  const [deletingPostId, setDeletingPostId] = createSignal<string | null>(null);

  const threadQuery = useForumThreadDetailQuery(() => props.communityId, () => props.threadId);
  const createPostMutation = useCreatePostMutation();
  const deleteThreadMutation = useDeleteThreadMutation();
  const deletePostMutation = useDeletePostMutation();
  const pinThreadMutation = usePinThreadMutation();
  const lockThreadMutation = useLockThreadMutation();
  const voteOnThreadMutation = useVoteOnThreadMutation();
  const voteOnPostMutation = useVoteOnPostMutation();
  const setBestAnswerMutation = useSetBestAnswerMutation();

  const isThreadAuthor = createMemo(() => {
    const thread = threadQuery.data?.thread;
    const user = authStore.user;
    return thread && user && thread.authorId === user.id;
  });

  const canModerate = createMemo(() => isAdmin());

  const handleReply = async (e: Event) => {
    e.preventDefault();
    if (!replyContent().trim()) return;

    const data: CreatePostDto = {
      content: replyContent(),
    };

    try {
      await createPostMutation.mutateAsync({
        communityId: props.communityId,
        threadId: props.threadId,
        data,
      });
      setReplyContent('');
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleDeleteThread = async () => {
    try {
      await deleteThreadMutation.mutateAsync({
        communityId: props.communityId,
        threadId: props.threadId,
        categoryId: props.categoryId,
      });
      props.onBackClick();
    } catch (error) {
      console.error('Error deleting thread:', error);
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await deletePostMutation.mutateAsync({
        communityId: props.communityId,
        postId,
        threadId: props.threadId,
      });
      setDeletingPostId(null);
    } catch (error) {
      console.error('Error deleting post:', error);
    }
  };

  const handlePinThread = async () => {
    const thread = threadQuery.data?.thread;
    if (!thread) return;

    try {
      await pinThreadMutation.mutateAsync({
        communityId: props.communityId,
        threadId: props.threadId,
        isPinned: !thread.isPinned,
        categoryId: thread.categoryId,
      });
    } catch (error) {
      console.error('Error pinning thread:', error);
    }
  };

  const handleLockThread = async () => {
    const thread = threadQuery.data?.thread;
    if (!thread) return;

    try {
      await lockThreadMutation.mutateAsync({
        communityId: props.communityId,
        threadId: props.threadId,
        isLocked: !thread.isLocked,
      });
    } catch (error) {
      console.error('Error locking thread:', error);
    }
  };

  const handleVoteOnThread = async (voteType: 'up' | 'down' | 'remove') => {
    try {
      await voteOnThreadMutation.mutateAsync({
        communityId: props.communityId,
        threadId: props.threadId,
        voteType,
      });
    } catch (error) {
      console.error('Error voting on thread:', error);
    }
  };

  const handleVoteOnPost = async (postId: string, voteType: 'up' | 'down' | 'remove') => {
    try {
      await voteOnPostMutation.mutateAsync({
        communityId: props.communityId,
        postId,
        threadId: props.threadId,
        voteType,
      });
    } catch (error) {
      console.error('Error voting on post:', error);
    }
  };

  const handleSetBestAnswer = async (postId: string) => {
    try {
      await setBestAnswerMutation.mutateAsync({
        communityId: props.communityId,
        threadId: props.threadId,
        postId,
      });
    } catch (error) {
      console.error('Error setting best answer:', error);
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const isPostAuthor = (postAuthorId: string) => {
    const user = authStore.user;
    return user && postAuthorId === user.id;
  };

  return (
    <div>
      {/* Header */}
      <Show when={threadQuery.data?.thread}>
        {(thread) => (
          <div>
            <div class="mb-6">
              <button
                onClick={props.onBackClick}
                class="text-ocean-600 dark:text-ocean-400 hover:underline mb-2 inline-block"
              >
                ← {t('backToThreadList')}
              </button>

              {/* Thread Card */}
              <Card class="p-6">
                <div class="flex items-start gap-2 mb-3">
                  <Show when={thread().isPinned}>
                    <span class="px-2 py-0.5 bg-ocean-100 dark:bg-ocean-900 text-ocean-800 dark:text-ocean-200 text-xs font-semibold rounded">
                      📌 {t('pinnedBadge')}
                    </span>
                  </Show>
                  <Show when={thread().isLocked}>
                    <span class="px-2 py-0.5 bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-semibold rounded">
                      🔒 {t('lockedBadge')}
                    </span>
                  </Show>
                </div>

                <h2 class="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-4">{thread().title}</h2>

                <div class="flex items-center gap-4 text-sm text-stone-500 dark:text-stone-400 mb-4">
                  <span>
                    {t('authorLabel')} {thread().authorName}
                  </span>
                  <span>{t('postedAt').replace('{{time}}', formatTimeAgo(thread().createdAt))}</span>
                </div>

                <Show when={thread().tags && thread().tags.length > 0}>
                  <div class="flex gap-2 mb-4">
                    <For each={thread().tags}>
                      {(tag) => (
                        <span class="px-2 py-0.5 bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 text-xs rounded">
                          #{tag}
                        </span>
                      )}
                    </For>
                  </div>
                </Show>

                <div
                  class="prose dark:prose-invert max-w-none mb-4 text-stone-800 dark:text-stone-200"
                  innerHTML={renderMarkdown(thread().content)}
                />

                {/* Thread Actions */}
                <div class="flex items-center gap-4 pt-4 border-t border-stone-200 dark:border-stone-700">
                  <div class="flex items-center gap-2">
                    <Button size="sm" variant="secondary" onClick={() => handleVoteOnThread('up')}>
                      👍 {thread().upvotes}
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => handleVoteOnThread('down')}>
                      👎 {thread().downvotes}
                    </Button>
                  </div>

                  <Show when={canModerate()}>
                    <Button size="sm" variant="secondary" onClick={handlePinThread}>
                      {thread().isPinned ? t('unpinThreadButton') : t('pinThreadButton')}
                    </Button>
                    <Button size="sm" variant="secondary" onClick={handleLockThread}>
                      {thread().isLocked ? t('unlockThreadButton') : t('lockThreadButton')}
                    </Button>
                  </Show>

                  <Show when={isThreadAuthor() || canModerate()}>
                    <Button size="sm" variant="danger" onClick={() => setShowDeleteThreadConfirm(true)}>
                      {t('deleteThreadButton')}
                    </Button>
                  </Show>
                </div>
              </Card>
            </div>

            {/* Posts */}
            <div class="space-y-4 mb-6">
              <Show
                when={threadQuery.data?.posts && threadQuery.data.posts.length > 0}
                fallback={
                  <Card class="p-6 text-center text-stone-500 dark:text-stone-400">
                    {t('noPostsMessage')}
                  </Card>
                }
              >
                <For each={threadQuery.data?.posts}>
                  {(post) => (
                    <Card class="p-6">
                      <Show when={post.isBestAnswer}>
                        <div class="mb-3">
                          <span class="px-3 py-1 bg-success-100 dark:bg-success-900 text-success-800 dark:text-success-200 text-sm font-semibold rounded">
                            ✓ {t('bestAnswerBadge')}
                          </span>
                        </div>
                      </Show>

                      <div class="flex items-center gap-4 text-sm text-stone-500 dark:text-stone-400 mb-3">
                        <span class="font-semibold">{post.authorName}</span>
                        <span>{t('postedAt').replace('{{time}}', formatTimeAgo(post.createdAt))}</span>
                      </div>

                      <div
                        class="prose dark:prose-invert max-w-none mb-4 text-stone-800 dark:text-stone-200"
                        innerHTML={renderMarkdown(post.content)}
                      />

                      <div class="flex items-center gap-4 pt-4 border-t border-stone-200 dark:border-stone-700">
                        <div class="flex items-center gap-2">
                          <Button size="sm" variant="secondary" onClick={() => handleVoteOnPost(post.id, 'up')}>
                            👍 {post.upvotes}
                          </Button>
                          <Button size="sm" variant="secondary" onClick={() => handleVoteOnPost(post.id, 'down')}>
                            👎 {post.downvotes}
                          </Button>
                        </div>

                        <Show when={isThreadAuthor() && !post.isBestAnswer}>
                          <Button size="sm" variant="secondary" onClick={() => handleSetBestAnswer(post.id)}>
                            {t('markAsBestAnswer')}
                          </Button>
                        </Show>

                        <Show when={isPostAuthor(post.authorId) || canModerate()}>
                          <Button size="sm" variant="danger" onClick={() => setDeletingPostId(post.id)}>
                            {t('deletePostButton')}
                          </Button>
                        </Show>
                      </div>
                    </Card>
                  )}
                </For>
              </Show>
            </div>

            {/* Reply Form */}
            <Show when={role()}>
              <Card class="p-6">
                <Show
                  when={!thread().isLocked}
                  fallback={
                    <div class="text-center text-stone-500 dark:text-stone-400">
                      {t('threadLockedMessage')}
                    </div>
                  }
                >
                  <form onSubmit={handleReply} class="space-y-4">
                    <div>
                      <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                        {t('replyButton')}
                      </label>
                      <textarea
                        value={replyContent()}
                        onInput={(e) => setReplyContent(e.currentTarget.value)}
                        placeholder={t('replyPlaceholder')}
                        required
                        rows={6}
                        class="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-md bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 font-mono text-sm"
                      />
                    </div>
                    <Button type="submit" loading={createPostMutation.isPending}>
                      {t('replySubmit')}
                    </Button>
                  </form>
                </Show>
              </Card>
            </Show>
          </div>
        )}
      </Show>

      <Show when={threadQuery.isLoading}>
        <Card class="p-6">
          <div class="text-stone-600 dark:text-stone-300">{t('loading')}</div>
        </Card>
      </Show>

      <Show when={threadQuery.isError}>
        <Card class="p-6 bg-danger-50 dark:bg-danger-900 border-danger-200 dark:border-danger-700">
          <p class="text-danger-800 dark:text-danger-200">{t('errorLoadingThread')}</p>
        </Card>
      </Show>

      {/* Delete Thread Confirmation */}
      <Show when={showDeleteThreadConfirm()}>
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-stone-50 dark:bg-stone-800 p-6 rounded-lg max-w-md w-full mx-4 border border-stone-200 dark:border-stone-700">
            <h3 class="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-4">{t('confirmDeleteThread')}</h3>
            <div class="flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => setShowDeleteThreadConfirm(false)}>
                {t('confirmNo')}
              </Button>
              <Button variant="danger" onClick={handleDeleteThread} loading={deleteThreadMutation.isPending}>
                {t('confirmYes')}
              </Button>
            </div>
          </div>
        </div>
      </Show>

      {/* Delete Post Confirmation */}
      <Show when={deletingPostId()}>
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-stone-50 dark:bg-stone-800 p-6 rounded-lg max-w-md w-full mx-4 border border-stone-200 dark:border-stone-700">
            <h3 class="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-4">{t('confirmDeletePost')}</h3>
            <div class="flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => setDeletingPostId(null)}>
                {t('confirmNo')}
              </Button>
              <Button
                variant="danger"
                onClick={() => handleDeletePost(deletingPostId()!)}
                loading={deletePostMutation.isPending}
              >
                {t('confirmYes')}
              </Button>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
};
