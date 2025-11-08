import { Component, Show, For, createSignal, createMemo } from 'solid-js';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { useCommunity } from '@/contexts/CommunityContext';
import { useForumThreadsQuery, useCreateThreadMutation } from '@/hooks/queries/useForumQueries';
import { useMyTrustSummaryQuery } from '@/hooks/queries/useMyTrustSummaryQuery';
import { makeTranslator } from '@/i18n/makeTranslator';
import { forumDict } from '@/pages/protected/community/forum.i18n';
import type { CreateThreadDto, ThreadListParams } from '@/types/forum.types';

interface ForumThreadListProps {
  communityId: string;
  categoryId: string;
  onBackClick: () => void;
  onThreadClick: (threadId: string, categoryId: string) => void;
}

export const ForumThreadList: Component<ForumThreadListProps> = (props) => {
  const t = makeTranslator(forumDict, 'forum');
  const { community, isAdmin, role, canCreateThreads } = useCommunity();
  const [showCreateModal, setShowCreateModal] = createSignal(false);
  const [threadTitle, setThreadTitle] = createSignal('');
  const [threadContent, setThreadContent] = createSignal('');
  const [threadTags, setThreadTags] = createSignal('');
  const [currentPage, setCurrentPage] = createSignal(1);
  const [sortBy, setSortBy] = createSignal<'newest' | 'popular' | 'mostUpvoted'>('newest');

  const params = createMemo<ThreadListParams>(() => ({
    page: currentPage(),
    limit: 20,
    sort: sortBy(),
  }));

  const threadsQuery = useForumThreadsQuery(() => props.communityId, () => props.categoryId, params);
  const createThreadMutation = useCreateThreadMutation();

  const canCreateThread = createMemo(() => canCreateThreads());

  const handleCreateThread = async (e: Event) => {
    e.preventDefault();

    const tags = threadTags()
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const data: CreateThreadDto = {
      title: threadTitle(),
      content: threadContent(),
      tags: tags.length > 0 ? tags : undefined,
    };

    try {
      const result = await createThreadMutation.mutateAsync({
        communityId: props.communityId,
        categoryId: props.categoryId,
        data,
      });
      setShowCreateModal(false);
      setThreadTitle('');
      setThreadContent('');
      setThreadTags('');
      // Navigate to the new thread
      props.onThreadClick(result.thread.id, props.categoryId);
    } catch (error) {
      console.error('Error creating thread:', error);
    }
  };

  const formatTimeAgo = (date: Date | null) => {
    if (!date) return t('threadNoActivity');
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

  const totalPages = createMemo(() => {
    const total = threadsQuery.data?.total || 0;
    const limit = threadsQuery.data?.limit || 20;
    return Math.ceil(total / limit);
  });

  return (
    <div>
      {/* Header */}
      <div class="mb-6">
        <button
          onClick={props.onBackClick}
          class="text-ocean-600 dark:text-ocean-400 hover:underline mb-2 inline-block"
        >
          ← {t('backToCategories')}
        </button>
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-2xl font-bold text-stone-900 dark:text-stone-100">
            {t('threadsTitle').replace('{{categoryName}}', 'Category')}
          </h2>
          <Show when={role()}>
            <Show
              when={canCreateThread()}
              fallback={
                <div class="text-sm text-stone-500 dark:text-stone-400">
                  {t('insufficientTrustMessage')
                    .replace('{{minTrust}}', (community()?.minTrustForThreadCreation || 10).toString())
                    .replace('{{currentTrust}}', (trustSummaryQuery.data?.points || 0).toString())}
                </div>
              }
            >
              <Button onClick={() => setShowCreateModal(true)}>{t('createThreadButton')}</Button>
            </Show>
          </Show>
        </div>

        {/* Sort Options */}
        <div class="flex gap-2">
          <Button
            variant={sortBy() === 'newest' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setSortBy('newest')}
          >
            {t('sortNewest')}
          </Button>
          <Button
            variant={sortBy() === 'popular' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setSortBy('popular')}
          >
            {t('sortPopular')}
          </Button>
          <Button
            variant={sortBy() === 'mostUpvoted' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setSortBy('mostUpvoted')}
          >
            {t('sortMostUpvoted')}
          </Button>
        </div>
      </div>

      {/* Threads List */}
      <Show
        when={!threadsQuery.isLoading}
        fallback={
          <Card class="p-6">
            <div class="text-stone-600 dark:text-stone-300">{t('loading')}</div>
          </Card>
        }
      >
        <Show
          when={threadsQuery.data?.threads && threadsQuery.data.threads.length > 0}
          fallback={
            <Card class="p-8 text-center">
              <div class="text-stone-500 dark:text-stone-400">
                <h3 class="text-xl font-semibold mb-2">{t('noThreadsTitle')}</h3>
                <p>{t('noThreadsMessage')}</p>
              </div>
            </Card>
          }
        >
          <div class="space-y-3">
            <For each={threadsQuery.data?.threads}>
              {(thread) => (
                <button
                  onClick={() => props.onThreadClick(thread.id, props.categoryId)}
                  class="block w-full text-left"
                >
                  <Card class="p-6 hover:shadow-lg transition-all hover:scale-[1.01] cursor-pointer">
                    <div class="flex items-start gap-4">
                      <div class="flex-1">
                        <div class="flex items-center gap-2 mb-2">
                          <Show when={thread.isPinned}>
                            <span class="px-2 py-0.5 bg-ocean-100 dark:bg-ocean-900 text-ocean-800 dark:text-ocean-200 text-xs font-semibold rounded">
                              📌 {t('pinnedBadge')}
                            </span>
                          </Show>
                          <Show when={thread.isLocked}>
                            <span class="px-2 py-0.5 bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-semibold rounded">
                              🔒 {t('lockedBadge')}
                            </span>
                          </Show>
                        </div>
                        <h3 class="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-2">{thread.title}</h3>
                        <div class="flex items-center gap-4 text-sm text-stone-500 dark:text-stone-400 mb-2">
                          <span>By {thread.authorName}</span>
                          <span>{t('threadPostCount').replace('{{count}}', thread.postCount.toString())}</span>
                          <span>{t('threadLastActivity').replace('{{time}}', formatTimeAgo(thread.lastActivity))}</span>
                        </div>
                        <Show when={thread.tags && thread.tags.length > 0}>
                          <div class="flex gap-2">
                            <For each={thread.tags}>
                              {(tag) => (
                                <span class="px-2 py-0.5 bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300 text-xs rounded">
                                  #{tag}
                                </span>
                              )}
                            </For>
                          </div>
                        </Show>
                      </div>
                      <div class="text-center">
                        <div class="text-2xl font-bold text-forest-600 dark:text-forest-400">
                          {thread.upvotes - thread.downvotes}
                        </div>
                        <div class="text-xs text-stone-500 dark:text-stone-400">votes</div>
                      </div>
                    </div>
                  </Card>
                </button>
              )}
            </For>
          </div>

          {/* Pagination */}
          <Show when={totalPages() > 1}>
            <div class="flex items-center justify-center gap-4 mt-6">
              <Button
                variant="secondary"
                size="sm"
                disabled={currentPage() === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                {t('prevPage')}
              </Button>
              <span class="text-stone-600 dark:text-stone-300">
                {t('pagination')
                  .replace('{{page}}', currentPage().toString())
                  .replace('{{total}}', totalPages().toString())}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={currentPage() === totalPages()}
                onClick={() => setCurrentPage((p) => Math.min(totalPages(), p + 1))}
              >
                {t('nextPage')}
              </Button>
            </div>
          </Show>
        </Show>
      </Show>

      <Show when={threadsQuery.isError}>
        <Card class="p-6 bg-danger-50 dark:bg-danger-900 border-danger-200 dark:border-danger-700">
          <p class="text-danger-800 dark:text-danger-200">{t('errorLoadingThreads')}</p>
        </Card>
      </Show>

      {/* Create Thread Modal */}
      <Show when={showCreateModal()}>
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div class="bg-stone-50 dark:bg-stone-800 p-6 rounded-lg max-w-2xl w-full mx-4 my-8 border border-stone-200 dark:border-stone-700">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold text-stone-900 dark:text-stone-100">{t('createThreadModalTitle')}</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                class="text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-300"
              >
                {t('modalClose')}
              </button>
            </div>

            <form onSubmit={handleCreateThread} class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                  {t('threadTitleLabel')}
                </label>
                <input
                  type="text"
                  value={threadTitle()}
                  onInput={(e) => setThreadTitle(e.currentTarget.value)}
                  placeholder={t('threadTitlePlaceholder')}
                  required
                  class="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-md bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                  {t('threadContentLabel')}
                </label>
                <textarea
                  value={threadContent()}
                  onInput={(e) => setThreadContent(e.currentTarget.value)}
                  placeholder={t('threadContentPlaceholder')}
                  required
                  rows={8}
                  class="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-md bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 font-mono text-sm"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                  {t('threadTagsLabel')}
                </label>
                <input
                  type="text"
                  value={threadTags()}
                  onInput={(e) => setThreadTags(e.currentTarget.value)}
                  placeholder={t('threadTagsPlaceholder')}
                  class="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-md bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                />
              </div>

              <div class="flex gap-2 justify-end">
                <Button variant="secondary" onClick={() => setShowCreateModal(false)} type="button">
                  {t('modalCancel')}
                </Button>
                <Button type="submit" loading={createThreadMutation.isPending}>
                  {t('modalCreate')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </Show>
    </div>
  );
};
