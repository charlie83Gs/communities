import { Component, createSignal, Show, createMemo } from 'solid-js';
import { Title, Meta } from '@solidjs/meta';
import { createQuery } from '@tanstack/solid-query';
import { usersService } from '@/services/api/users.service';
import { makeTranslator } from '@/i18n/makeTranslator';
import { myTrustDict } from './my-trust.i18n';
import { TrustSummaryCard } from '@/components/features/trust/TrustSummaryCard';
import { TrustTimelineGraph } from '@/components/features/trust/TrustTimelineGraph';
import { TrustEventsList } from '@/components/features/trust/TrustEventsList';

const MyTrust: Component = () => {
  const t = makeTranslator(myTrustDict, 'myTrust');
  const [selectedCommunityId, setSelectedCommunityId] = createSignal<string | undefined>(undefined);

  // Fetch trust timeline
  const timelineQuery = createQuery(() => ({
    queryKey: ['myTrustTimeline', selectedCommunityId()],
    queryFn: () => usersService.getMyTrustTimeline(selectedCommunityId()),
  }));

  // Fetch trust summary
  const summaryQuery = createQuery(() => ({
    queryKey: ['myTrustSummary'],
    queryFn: () => usersService.getMyTrustSummary(),
  }));

  // Get unique communities from events
  const communities = createMemo(() => {
    if (!timelineQuery.data) return [];
    const uniqueCommunities = new Map<string, string>();
    timelineQuery.data.forEach((event) => {
      if (!uniqueCommunities.has(event.communityId)) {
        uniqueCommunities.set(event.communityId, event.communityName);
      }
    });
    return Array.from(uniqueCommunities.entries()).map(([id, name]) => ({ id, name }));
  });

  return (
    <>
      <Title>{t('title')}</Title>
      <Meta name="description" content={t('subtitle')} />

      <div class="min-h-screen bg-stone-100 dark:bg-stone-900">
        {/* Compact Header with gradient */}
        <header class="h-12 bg-gradient-to-r from-ocean-100 to-forest-100 dark:from-ocean-900 dark:to-forest-900 border-b border-stone-200 dark:border-stone-700 px-4 flex items-center justify-between">
          <h1 class="text-sm font-semibold text-stone-900 dark:text-stone-100">
            {t('title')}
          </h1>
          {/* Community Filter in header */}
          <Show when={communities().length > 1}>
            <select
              class="px-2 py-1 text-xs rounded border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:border-ocean-400"
              value={selectedCommunityId() || ''}
              onChange={(e) => setSelectedCommunityId(e.target.value || undefined)}
            >
              <option value="">{t('allCommunities')}</option>
              {communities().map((community) => (
                <option value={community.id}>{community.name}</option>
              ))}
            </select>
          </Show>
        </header>

        {/* Error State */}
        <Show when={timelineQuery.isError || summaryQuery.isError}>
          <div class="mx-4 mt-4 bg-sunset-50 dark:bg-sunset-900/20 border border-sunset-500 dark:border-sunset-700 text-sunset-700 dark:text-sunset-300 rounded-lg p-3 text-sm">
            {t('error')}
          </div>
        </Show>

        {/* Main Content */}
        <div class="p-4 space-y-4">
          {/* Summary Card */}
          <TrustSummaryCard
            summary={summaryQuery.data}
            loading={summaryQuery.isLoading}
          />

          {/* Timeline Graph */}
          <Show when={timelineQuery.data && timelineQuery.data.length > 0}>
            <TrustTimelineGraph
              events={timelineQuery.data || []}
              loading={timelineQuery.isLoading}
            />
          </Show>

          {/* Events List */}
          <TrustEventsList
            events={timelineQuery.data || []}
            loading={timelineQuery.isLoading}
          />
        </div>
      </div>
    </>
  );
};

export default MyTrust;
