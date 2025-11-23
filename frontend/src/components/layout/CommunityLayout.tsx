import { Component, JSX, Show, For, createMemo } from 'solid-js';
import { A, useNavigate } from '@solidjs/router';
import { useCommunity } from '@/contexts/CommunityContext';
import { makeTranslator } from '@/i18n/makeTranslator';
import { communityLayoutDict } from './CommunityLayout.i18n';

export type CommunityTab = 'overview' | 'members' | 'discussion' | 'settings';

interface CommunityLayoutProps {
  communityId: string;
  activeTab: CommunityTab;
  children: JSX.Element;
}

/**
 * Compact layout component for community pages.
 * Provides consistent header with back navigation, community name, trust score,
 * and tab navigation (horizontal on desktop, dropdown on mobile).
 */
export const CommunityLayout: Component<CommunityLayoutProps> = (props) => {
  const t = makeTranslator(communityLayoutDict, 'communityLayout');
  const navigate = useNavigate();
  const {
    community,
    trustMe,
    isLoading,
    isAdmin,
    isForumEnabled,
    isPollsEnabled,
    isDisputesEnabled,
  } = useCommunity();

  const tabs = createMemo(() => [
    { id: 'overview' as CommunityTab, label: t('tabs.overview'), path: '' },
    { id: 'members' as CommunityTab, label: t('tabs.members'), path: '/members' },
    { id: 'discussion' as CommunityTab, label: t('tabs.discussion'), path: '/discussion' },
    { id: 'settings' as CommunityTab, label: t('tabs.settings'), path: '/settings' },
  ]);

  const visibleTabs = createMemo(() => {
    return tabs().filter(tab => {
      // Settings tab only visible to admins
      if (tab.id === 'settings') {
        return isAdmin();
      }
      // Discussion tab hidden if forum, polls, and disputes are all disabled
      if (tab.id === 'discussion') {
        return isForumEnabled() || isPollsEnabled() || isDisputesEnabled();
      }
      return true;
    });
  });

  const handleTabChange = (tabId: CommunityTab) => {
    const tab = tabs().find(t => t.id === tabId);
    if (tab) {
      navigate(`/communities/${props.communityId}${tab.path}`);
    }
  };

  const handleMobileTabChange = (e: Event) => {
    const select = e.currentTarget as HTMLSelectElement;
    handleTabChange(select.value as CommunityTab);
  };

  return (
    <div class="min-h-screen bg-stone-100 dark:bg-stone-900">
      {/* Compact Header - 48px height */}
      <header class="h-12 bg-gradient-to-r from-ocean-100 to-forest-100 dark:from-ocean-900 dark:to-forest-900 border-b border-stone-200 dark:border-stone-700 px-4 flex items-center justify-between">
        <div class="flex items-center gap-3 min-w-0 flex-1">
          {/* Back button */}
          <A
            href="/dashboard"
            class="flex items-center gap-1 text-sm text-stone-600 dark:text-stone-400 hover:text-ocean-600 dark:hover:text-ocean-400 transition-colors shrink-0"
            aria-label={t('backAriaLabel')}
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span class="hidden sm:inline">{t('back')}</span>
          </A>

          {/* Community name */}
          <Show when={!isLoading() && community()} fallback={
            <span class="text-sm text-stone-400 animate-pulse">{t('loading')}</span>
          }>
            <h1 class="text-sm font-semibold text-stone-900 dark:text-stone-100 truncate">
              {community()!.name}
            </h1>
          </Show>
        </div>

        <div class="flex items-center gap-3 shrink-0">
          {/* Trust score badge */}
          <Show when={trustMe()}>
            <div class="flex items-center gap-1.5">
              <span class="text-xs text-stone-500 dark:text-stone-400">{t('trustLabel')}</span>
              <span class="text-sm font-medium text-forest-600 dark:text-forest-400">
                {trustMe()!.points}
              </span>
            </div>
          </Show>

          {/* Settings cog icon - only show if admin */}
          <Show when={isAdmin()}>
            <A
              href={`/communities/${props.communityId}/settings`}
              class="p-1.5 text-stone-500 dark:text-stone-400 hover:text-ocean-600 dark:hover:text-ocean-400 transition-colors rounded-md hover:bg-stone-200 dark:hover:bg-stone-700"
              aria-label={t('settingsAriaLabel')}
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </A>
          </Show>
        </div>
      </header>

      {/* Tab Navigation - Desktop: horizontal tabs (41px height) */}
      <div class="hidden sm:block border-b border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800">
        <div class="flex">
          <For each={visibleTabs()}>
            {(tab) => (
              <button
                onClick={() => handleTabChange(tab.id)}
                class={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${
                  props.activeTab === tab.id
                    ? 'text-ocean-700 dark:text-ocean-300 border-b-2 border-ocean-600'
                    : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                }`}
              >
                {tab.label}
              </button>
            )}
          </For>
        </div>
      </div>

      {/* Tab Navigation - Mobile: dropdown select */}
      <div class="sm:hidden border-b border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 px-4 py-2">
        <select
          value={props.activeTab}
          onChange={handleMobileTabChange}
          class="w-full px-3 py-2 text-sm rounded border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-ocean-400 dark:focus:border-ocean-500"
        >
          <For each={visibleTabs()}>
            {(tab) => (
              <option value={tab.id}>{tab.label}</option>
            )}
          </For>
        </select>
      </div>

      {/* Main Content Area */}
      <div class="h-[calc(100vh-48px-41px)] overflow-y-auto p-4">
        {props.children}
      </div>
    </div>
  );
};

export default CommunityLayout;
