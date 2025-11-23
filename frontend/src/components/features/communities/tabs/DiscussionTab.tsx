import { Component, createSignal, Show, For, createMemo, JSX, createEffect } from 'solid-js';
import { useNavigate, useSearchParams } from '@solidjs/router';
import { makeTranslator } from '@/i18n/makeTranslator';
import { discussionTabDict } from './DiscussionTab.i18n';
import { useCommunity } from '@/contexts/CommunityContext';
import { useForumCategoriesQuery, useForumThreadsQuery, useCreateThreadMutation, useCreateCategoryMutation } from '@/hooks/queries/useForumQueries';
import { ForumThreadDetail } from '@/components/features/forum/ForumThreadDetail';
import type { CreateThreadDto, CreateCategoryDto } from '@/types/forum.types';
import { usePollsListQuery } from '@/hooks/queries/usePolls';
import { useDisputesListQuery } from '@/hooks/queries/useDisputes';
import type { ForumThread } from '@/types/forum.types';
import type { Poll } from '@/types/poll.types';
import type { DisputeListItem, DisputeStatus } from '@/types/dispute.types';

interface DiscussionTabProps {
  communityId: string;
}

type SubTab = 'forum' | 'polls' | 'disputes';

export function DiscussionTab(props: DiscussionTabProps): JSX.Element {
  const t = makeTranslator(discussionTabDict, 'discussionTab');
  const navigate = useNavigate();
  const community = useCommunity();

  // Compute available sub-tabs based on feature flags
  const availableSubTabs = createMemo(() => {
    const tabs: { id: SubTab; label: string; visible: boolean }[] = [
      { id: 'forum', label: t('tabForum'), visible: community.isForumEnabled() },
      { id: 'polls', label: t('tabPolls'), visible: community.isPollsEnabled() },
      { id: 'disputes', label: t('tabDisputes'), visible: community.isDisputesEnabled() },
    ];
    return tabs.filter(tab => tab.visible);
  });

  // Get first available sub-tab as default
  const defaultSubTab = createMemo(() => {
    const tabs = availableSubTabs();
    return tabs.length > 0 ? tabs[0].id : 'forum';
  });

  const [activeSubTab, setActiveSubTab] = createSignal<SubTab>(defaultSubTab());

  // Reset to first available tab if current selection becomes unavailable
  createEffect(() => {
    const tabs = availableSubTabs();
    const currentTab = activeSubTab();
    if (!tabs.find(t => t.id === currentTab)) {
      const firstTab = tabs[0];
      if (firstTab) {
        setActiveSubTab(firstTab.id);
      }
    }
  });

  return (
    <div class="space-y-4">
      {/* Sub-tab Navigation */}
      <div class="flex gap-1 border-b border-stone-200 dark:border-stone-700">
        <For each={availableSubTabs()}>
          {(tab) => (
            <SubTabButton
              active={activeSubTab() === tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              label={tab.label}
            />
          )}
        </For>
      </div>

      {/* Sub-tab Content */}
      <Show when={activeSubTab() === 'forum'}>
        <ForumSubTab communityId={props.communityId} />
      </Show>
      <Show when={activeSubTab() === 'polls'}>
        <PollsSubTab communityId={props.communityId} />
      </Show>
      <Show when={activeSubTab() === 'disputes'}>
        <DisputesSubTab communityId={props.communityId} />
      </Show>
    </div>
  );
}

// Sub-tab button component
interface SubTabButtonProps {
  active: boolean;
  onClick: () => void;
  label: string;
}

const SubTabButton: Component<SubTabButtonProps> = (props) => {
  return (
    <button
      onClick={props.onClick}
      class={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
        props.active
          ? 'text-ocean-600 dark:text-ocean-400 border-ocean-600 dark:border-ocean-400'
          : 'text-stone-500 dark:text-stone-400 border-transparent hover:text-stone-700 dark:hover:text-stone-300'
      }`}
    >
      {props.label}
    </button>
  );
};

// Forum Sub-tab
const ForumSubTab: Component<{ communityId: string }> = (props) => {
  const t = makeTranslator(discussionTabDict, 'discussionTab');
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const community = useCommunity();
  const [selectedCategoryId, setSelectedCategoryId] = createSignal<string | undefined>(undefined);
  const [showCreateModal, setShowCreateModal] = createSignal(false);
  const [showCreateCategoryModal, setShowCreateCategoryModal] = createSignal(false);
  const [threadTitle, setThreadTitle] = createSignal('');
  const [threadContent, setThreadContent] = createSignal('');
  const [threadTags, setThreadTags] = createSignal('');
  const [categoryName, setCategoryName] = createSignal('');
  const [categoryDescription, setCategoryDescription] = createSignal('');

  // Get thread ID from URL query params
  const selectedThreadId = () => searchParams.thread as string | undefined;

  const categoriesQuery = useForumCategoriesQuery(() => props.communityId);
  const threadsQuery = useForumThreadsQuery(
    () => props.communityId,
    () => selectedCategoryId(),
    () => ({ limit: 10, sort: 'newest' })
  );

  // Auto-select first category when categories are loaded
  createEffect(() => {
    const cats = categoriesQuery.data?.categories;
    if (cats && cats.length > 0 && !selectedCategoryId()) {
      setSelectedCategoryId(cats[0].id);
    }
  });

  const createThreadMutation = useCreateThreadMutation();
  const createCategoryMutation = useCreateCategoryMutation();

  const handleCreateCategory = async (e: Event) => {
    e.preventDefault();

    const data: CreateCategoryDto = {
      name: categoryName(),
      description: categoryDescription() || '',
    };

    try {
      await createCategoryMutation.mutateAsync({ communityId: props.communityId, data });
      setShowCreateCategoryModal(false);
      setCategoryName('');
      setCategoryDescription('');
    } catch (error) {
      console.error('Error creating category:', error);
    }
  };

  // Check feature flag and permissions
  if (!community.isForumEnabled()) {
    return (
      <div class="text-center py-8 text-stone-500 dark:text-stone-400">
        {t('featureDisabledForum')}
      </div>
    );
  }

  if (!community.canViewForum()) {
    return (
      <div class="text-center py-8 text-stone-500 dark:text-stone-400">
        {t('noAccessForum')}
      </div>
    );
  }

  const handleCreateThread = async (e: Event) => {
    e.preventDefault();

    const catId = selectedCategoryId();
    if (!catId) {
      console.error('No category selected');
      return;
    }

    const tags = threadTags()
      .split(',')
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    const data: CreateThreadDto = {
      title: threadTitle(),
      content: threadContent(),
      tags: tags.length > 0 ? tags : undefined,
    };

    try {
      const result = await createThreadMutation.mutateAsync({
        communityId: props.communityId,
        categoryId: catId,
        data,
      });
      setShowCreateModal(false);
      setThreadTitle('');
      setThreadContent('');
      setThreadTags('');
      // Navigate to the new thread
      navigate(`/communities/${props.communityId}/discussion?thread=${result.thread.id}`);
    } catch (error) {
      console.error('Error creating thread:', error);
    }
  };

  const handleThreadClick = (thread: ForumThread) => {
    setSearchParams({ thread: thread.id });
  };

  const handleBackToList = () => {
    setSearchParams({ thread: undefined });
  };

  return (
    <Show
      when={!selectedThreadId()}
      fallback={
        <ForumThreadDetail
          communityId={props.communityId}
          threadId={selectedThreadId()!}
          categoryId={selectedCategoryId()!}
          onBackClick={handleBackToList}
        />
      }
    >
    <div class="space-y-4">
      {/* Header with category selector and create button */}
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <h3 class="text-sm font-semibold text-stone-900 dark:text-stone-100">
            {t('forumTitle')}
          </h3>
          <Show when={categoriesQuery.data?.categories && categoriesQuery.data.categories.length > 0}>
            <select
              value={selectedCategoryId() || ''}
              onChange={(e) => setSelectedCategoryId(e.target.value || undefined)}
              class="text-xs px-2 py-1 border border-stone-300 dark:border-stone-600 rounded bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300"
            >
              <For each={categoriesQuery.data?.categories}>
                {(category) => (
                  <option value={category.id}>{category.name}</option>
                )}
              </For>
            </select>
          </Show>
        </div>
        <div class="flex items-center gap-2">
          <Show when={community.canManageForum()}>
            <button
              onClick={() => setShowCreateCategoryModal(true)}
              class="text-xs px-3 py-1.5 bg-stone-200 hover:bg-stone-300 dark:bg-stone-700 dark:hover:bg-stone-600 text-stone-700 dark:text-stone-300 rounded-md transition-colors"
            >
              {t('createCategory')}
            </button>
          </Show>
          <Show when={community.canCreateThreads() && categoriesQuery.data?.categories && categoriesQuery.data.categories.length > 0}>
            <button
              onClick={() => setShowCreateModal(true)}
              class="text-xs px-3 py-1.5 bg-ocean-600 hover:bg-ocean-700 text-white rounded-md transition-colors"
            >
              {t('createThread')}
            </button>
          </Show>
        </div>
      </div>

      {/* Threads list */}
      <Show
        when={!threadsQuery.isLoading}
        fallback={
          <div class="text-center py-4 text-sm text-stone-500 dark:text-stone-400">
            {t('loading')}
          </div>
        }
      >
        <Show
          when={threadsQuery.data?.threads && threadsQuery.data.threads.length > 0}
          fallback={
            <div class="text-center py-8">
              <p class="text-sm text-stone-500 dark:text-stone-400">{t('noThreads')}</p>
              <p class="text-xs text-stone-400 dark:text-stone-500 mt-1">{t('noThreadsDesc')}</p>
            </div>
          }
        >
          <div class="space-y-2">
            <For each={threadsQuery.data?.threads}>
              {(thread) => (
                <ThreadItem thread={thread} onClick={() => handleThreadClick(thread)} />
              )}
            </For>
          </div>
        </Show>
      </Show>

      {/* Create Thread Modal */}
      <Show when={showCreateModal()}>
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div class="bg-stone-50 dark:bg-stone-800 p-6 rounded-lg max-w-2xl w-full mx-4 my-8 border border-stone-200 dark:border-stone-700">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold text-stone-900 dark:text-stone-100">{t('createThreadTitle')}</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                class="text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-300"
              >
                {t('close')}
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
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  class="px-4 py-2 text-sm font-medium text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-700 rounded-md hover:bg-stone-200 dark:hover:bg-stone-600 transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={createThreadMutation.isPending}
                  onClick={(e) => {
                    // Fallback if form submit doesn't trigger
                    if (e.currentTarget.form) {
                      e.currentTarget.form.requestSubmit();
                    }
                  }}
                  class="px-4 py-2 text-sm font-medium text-white bg-ocean-600 rounded-md hover:bg-ocean-700 transition-colors disabled:opacity-50"
                >
                  {createThreadMutation.isPending ? t('creating') : t('create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Show>

      {/* Create Category Modal */}
      <Show when={showCreateCategoryModal()}>
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div class="bg-stone-50 dark:bg-stone-800 p-6 rounded-lg max-w-md w-full mx-4 border border-stone-200 dark:border-stone-700">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-semibold text-stone-900 dark:text-stone-100">{t('createCategoryTitle')}</h3>
              <button
                onClick={() => setShowCreateCategoryModal(false)}
                class="text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-300"
              >
                {t('close')}
              </button>
            </div>

            <form onSubmit={handleCreateCategory} class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                  {t('categoryNameLabel')}
                </label>
                <input
                  type="text"
                  value={categoryName()}
                  onInput={(e) => setCategoryName(e.currentTarget.value)}
                  placeholder={t('categoryNamePlaceholder')}
                  required
                  class="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-md bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                  {t('categoryDescriptionLabel')}
                </label>
                <textarea
                  value={categoryDescription()}
                  onInput={(e) => setCategoryDescription(e.currentTarget.value)}
                  placeholder={t('categoryDescriptionPlaceholder')}
                  rows={3}
                  class="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-md bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                />
              </div>

              <div class="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowCreateCategoryModal(false)}
                  class="px-4 py-2 text-sm font-medium text-stone-700 dark:text-stone-300 bg-stone-100 dark:bg-stone-700 rounded-md hover:bg-stone-200 dark:hover:bg-stone-600 transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={createCategoryMutation.isPending}
                  class="px-4 py-2 text-sm font-medium text-white bg-ocean-600 rounded-md hover:bg-ocean-700 transition-colors disabled:opacity-50"
                >
                  {createCategoryMutation.isPending ? t('creating') : t('create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Show>
    </div>
    </Show>
  );
};

// Thread item component
const ThreadItem: Component<{ thread: ForumThread; onClick: () => void }> = (props) => {
  const t = makeTranslator(discussionTabDict, 'discussionTab');
  const replyCount = () => props.thread.postCount - 1; // Exclude the original post
  const replyText = () => replyCount() === 1 ? t('reply') : t('replies');

  return (
    <button
      onClick={props.onClick}
      class="w-full text-left p-3 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg hover:border-ocean-400 dark:hover:border-ocean-600 transition-colors"
    >
      <div class="flex justify-between items-start mb-1">
        <div class="flex items-center gap-2">
          <h4 class="text-sm font-medium text-stone-900 dark:text-stone-100">
            {props.thread.title}
          </h4>
          <Show when={props.thread.isPinned}>
            <span class="text-xs px-1.5 py-0.5 bg-ocean-100 dark:bg-ocean-900 text-ocean-700 dark:text-ocean-300 rounded">
              {t('pinned')}
            </span>
          </Show>
          <Show when={props.thread.isLocked}>
            <span class="text-xs px-1.5 py-0.5 bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-400 rounded">
              {t('locked')}
            </span>
          </Show>
        </div>
        <span class="text-xs text-stone-500 dark:text-stone-400">
          {replyCount()} {replyText()}
        </span>
      </div>
      <p class="text-xs text-stone-500 dark:text-stone-400">
        {formatTimeAgo(props.thread.lastActivity || props.thread.createdAt)}
      </p>
    </button>
  );
};

// Polls Sub-tab
const PollsSubTab: Component<{ communityId: string }> = (props) => {
  const t = makeTranslator(discussionTabDict, 'discussionTab');
  const navigate = useNavigate();
  const community = useCommunity();

  const pollsQuery = usePollsListQuery(() => props.communityId);

  // Separate active and past polls
  const activePolls = createMemo(() => {
    const polls = pollsQuery.data?.polls || [];
    return polls.filter((p: Poll) => p.status === 'active');
  });

  const pastPolls = createMemo(() => {
    const polls = pollsQuery.data?.polls || [];
    return polls.filter((p: Poll) => p.status === 'closed');
  });

  // Check feature flag and permissions
  if (!community.isPollsEnabled()) {
    return (
      <div class="text-center py-8 text-stone-500 dark:text-stone-400">
        {t('featureDisabledPolls')}
      </div>
    );
  }

  if (!community.canViewPolls()) {
    return (
      <div class="text-center py-8 text-stone-500 dark:text-stone-400">
        {t('noAccessPolls')}
      </div>
    );
  }

  const handleCreatePoll = () => {
    navigate(`/communities/${props.communityId}/polls/new`);
  };

  const handlePollClick = (poll: Poll) => {
    navigate(`/communities/${props.communityId}/polls/${poll.id}`);
  };

  return (
    <div class="space-y-4">
      {/* Header */}
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-semibold text-stone-900 dark:text-stone-100">
          {t('pollsTitle')}
        </h3>
        <Show when={community.canCreatePolls()}>
          <button
            onClick={handleCreatePoll}
            class="text-xs px-3 py-1.5 bg-ocean-600 hover:bg-ocean-700 text-white rounded-md transition-colors"
          >
            {t('createPoll')}
          </button>
        </Show>
      </div>

      <Show
        when={!pollsQuery.isLoading}
        fallback={
          <div class="text-center py-4 text-sm text-stone-500 dark:text-stone-400">
            {t('loading')}
          </div>
        }
      >
        <Show
          when={pollsQuery.data?.polls && pollsQuery.data.polls.length > 0}
          fallback={
            <div class="text-center py-8">
              <p class="text-sm text-stone-500 dark:text-stone-400">{t('noPolls')}</p>
              <p class="text-xs text-stone-400 dark:text-stone-500 mt-1">{t('noPollsDesc')}</p>
            </div>
          }
        >
          {/* Active Polls */}
          <Show when={activePolls().length > 0}>
            <div class="space-y-2">
              <h4 class="text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wide">
                {t('activePolls')}
              </h4>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <For each={activePolls()}>
                  {(poll) => (
                    <PollCard poll={poll} onClick={() => handlePollClick(poll)} />
                  )}
                </For>
              </div>
            </div>
          </Show>

          {/* Past Polls */}
          <Show when={pastPolls().length > 0}>
            <div class="space-y-2 mt-4">
              <h4 class="text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wide">
                {t('pastPolls')}
              </h4>
              <div class="space-y-1">
                <For each={pastPolls().slice(0, 5)}>
                  {(poll) => (
                    <button
                      onClick={() => handlePollClick(poll)}
                      class="w-full text-left flex items-center justify-between py-2 px-3 hover:bg-stone-50 dark:hover:bg-stone-800 rounded transition-colors"
                    >
                      <span class="text-sm text-stone-700 dark:text-stone-300 truncate">
                        {poll.title}
                      </span>
                      <span class="text-xs text-stone-500 dark:text-stone-400">
                        {t('completed')}
                      </span>
                    </button>
                  )}
                </For>
              </div>
            </div>
          </Show>
        </Show>
      </Show>
    </div>
  );
};

// Poll card component
const PollCard: Component<{ poll: Poll; onClick: () => void }> = (props) => {
  const t = makeTranslator(discussionTabDict, 'discussionTab');
  const timeRemaining = createMemo(() => {
    const endDate = new Date(props.poll.endsAt);
    const now = new Date();
    const diffMs = endDate.getTime() - now.getTime();

    if (diffMs <= 0) return t('completed');

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffDays > 0) {
      return `${t('endsIn')} ${diffDays} ${t('days')}`;
    }
    return `${t('endsIn')} ${diffHours} ${t('hours')}`;
  });

  return (
    <button
      onClick={props.onClick}
      class="w-full text-left p-3 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg hover:border-ocean-400 dark:hover:border-ocean-600 transition-colors"
    >
      <h4 class="text-sm font-medium text-stone-900 dark:text-stone-100 mb-1 line-clamp-2">
        {props.poll.title}
      </h4>
      <p class="text-xs text-stone-500 dark:text-stone-400">
        {timeRemaining()}
      </p>
    </button>
  );
};

// Disputes Sub-tab
const DisputesSubTab: Component<{ communityId: string }> = (props) => {
  const t = makeTranslator(discussionTabDict, 'discussionTab');
  const navigate = useNavigate();
  const community = useCommunity();

  const disputesQuery = useDisputesListQuery(() => props.communityId);

  // Separate open and resolved disputes
  const openDisputes = createMemo(() => {
    const disputes = disputesQuery.data?.disputes || [];
    return disputes.filter((d: DisputeListItem) =>
      d.status === 'open' || d.status === 'in_mediation'
    );
  });

  const resolvedDisputes = createMemo(() => {
    const disputes = disputesQuery.data?.disputes || [];
    return disputes.filter((d: DisputeListItem) =>
      d.status === 'resolved' || d.status === 'closed'
    );
  });

  // Check feature flag and permissions
  if (!community.isDisputesEnabled()) {
    return (
      <div class="text-center py-8 text-stone-500 dark:text-stone-400">
        {t('featureDisabledDisputes')}
      </div>
    );
  }

  if (!community.canViewDisputes()) {
    return (
      <div class="text-center py-8 text-stone-500 dark:text-stone-400">
        {t('noAccessDisputes')}
      </div>
    );
  }

  const handleCreateDispute = () => {
    navigate(`/communities/${props.communityId}/disputes/new`);
  };

  const handleDisputeClick = (dispute: DisputeListItem) => {
    navigate(`/communities/${props.communityId}/disputes/${dispute.id}`);
  };

  const getStatusColor = (status: DisputeStatus) => {
    switch (status) {
      case 'open':
        return 'bg-warning-100 dark:bg-warning-900 text-warning-700 dark:text-warning-300';
      case 'in_mediation':
        return 'bg-ocean-100 dark:bg-ocean-900 text-ocean-700 dark:text-ocean-300';
      case 'resolved':
        return 'bg-success-100 dark:bg-success-900 text-success-700 dark:text-success-300';
      case 'closed':
        return 'bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-400';
      default:
        return 'bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-400';
    }
  };

  const getStatusLabel = (status: DisputeStatus) => {
    switch (status) {
      case 'open':
        return t('statusOpen');
      case 'in_mediation':
        return t('statusInMediation');
      case 'resolved':
        return t('statusResolved');
      case 'closed':
        return t('statusClosed');
      default:
        return status;
    }
  };

  return (
    <div class="space-y-4">
      {/* Header */}
      <div class="flex items-center justify-between">
        <h3 class="text-sm font-semibold text-stone-900 dark:text-stone-100">
          {t('disputesTitle')}
        </h3>
        <Show when={community.canHandleDisputes()}>
          <button
            onClick={handleCreateDispute}
            class="text-xs px-3 py-1.5 bg-ocean-600 hover:bg-ocean-700 text-white rounded-md transition-colors"
          >
            {t('createDispute')}
          </button>
        </Show>
      </div>

      <Show
        when={!disputesQuery.isLoading}
        fallback={
          <div class="text-center py-4 text-sm text-stone-500 dark:text-stone-400">
            {t('loading')}
          </div>
        }
      >
        <Show
          when={disputesQuery.data?.disputes && disputesQuery.data.disputes.length > 0}
          fallback={
            <div class="text-center py-8">
              <p class="text-sm text-stone-500 dark:text-stone-400">{t('noDisputes')}</p>
              <p class="text-xs text-stone-400 dark:text-stone-500 mt-1">{t('noDisputesDesc')}</p>
            </div>
          }
        >
          {/* Open Disputes */}
          <Show when={openDisputes().length > 0}>
            <div class="space-y-2">
              <h4 class="text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wide">
                {t('openDisputes')}
              </h4>
              <div class="space-y-2">
                <For each={openDisputes()}>
                  {(dispute) => (
                    <button
                      onClick={() => handleDisputeClick(dispute)}
                      class="w-full text-left p-3 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg hover:border-ocean-400 dark:hover:border-ocean-600 transition-colors"
                    >
                      <div class="flex justify-between items-start mb-1">
                        <h4 class="text-sm font-medium text-stone-900 dark:text-stone-100">
                          {dispute.title}
                        </h4>
                        <span class={`text-xs px-1.5 py-0.5 rounded ${getStatusColor(dispute.status)}`}>
                          {getStatusLabel(dispute.status)}
                        </span>
                      </div>
                      <p class="text-xs text-stone-500 dark:text-stone-400">
                        {t('createdAgo')} {formatTimeAgo(dispute.createdAt)}
                      </p>
                    </button>
                  )}
                </For>
              </div>
            </div>
          </Show>

          {/* Resolved Disputes */}
          <Show when={resolvedDisputes().length > 0}>
            <div class="space-y-2 mt-4">
              <h4 class="text-xs font-semibold text-stone-700 dark:text-stone-300 uppercase tracking-wide">
                {t('resolvedDisputes')}
              </h4>
              <div class="space-y-1">
                <For each={resolvedDisputes().slice(0, 5)}>
                  {(dispute) => (
                    <button
                      onClick={() => handleDisputeClick(dispute)}
                      class="w-full text-left flex items-center justify-between py-2 px-3 hover:bg-stone-50 dark:hover:bg-stone-800 rounded transition-colors"
                    >
                      <span class="text-sm text-stone-700 dark:text-stone-300 truncate">
                        {dispute.title}
                      </span>
                      <span class={`text-xs px-1.5 py-0.5 rounded ${getStatusColor(dispute.status)}`}>
                        {getStatusLabel(dispute.status)}
                      </span>
                    </button>
                  )}
                </For>
              </div>
            </div>
          </Show>
        </Show>
      </Show>
    </div>
  );
};

// Utility function to format time ago
function formatTimeAgo(date: Date | string): string {
  const now = new Date();
  const past = typeof date === 'string' ? new Date(date) : date;
  const diffMs = now.getTime() - past.getTime();

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) {
    return 'just now';
  } else if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else {
    return `${diffDays}d ago`;
  }
}

export default DiscussionTab;
