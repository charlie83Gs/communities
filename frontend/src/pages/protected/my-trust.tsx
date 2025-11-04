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

      <div class="min-h-screen bg-gradient-to-br from-ocean-50 via-stone-50 to-sky-100 dark:from-stone-900 dark:via-stone-800 dark:to-ocean-950">
        <div class="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <div class="mb-8">
            <h1 class="text-4xl font-bold text-stone-900 dark:text-stone-100 mb-2">{t('title')}</h1>
            <p class="text-lg text-stone-700 dark:text-stone-300">{t('subtitle')}</p>
          </div>

          {/* Community Filter */}
          <Show when={communities().length > 1}>
            <div class="mb-6">
              <label class="block text-sm font-medium text-stone-900 dark:text-stone-100 mb-2">
                {t('filterLabel')}
              </label>
              <select
                class="w-full md:w-64 px-4 py-2 bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-600 rounded-lg focus:ring-2 focus:ring-ocean-500 dark:focus:ring-ocean-400 focus:border-transparent text-stone-900 dark:text-stone-100"
                value={selectedCommunityId() || ''}
                onChange={(e) => setSelectedCommunityId(e.target.value || undefined)}
              >
                <option value="">{t('allCommunities')}</option>
                {communities().map((community) => (
                  <option value={community.id}>{community.name}</option>
                ))}
              </select>
            </div>
          </Show>

          {/* Error State */}
          <Show when={timelineQuery.isError || summaryQuery.isError}>
            <div class="bg-sunset-50 dark:bg-sunset-900/20 border border-sunset-500 dark:border-sunset-700 text-sunset-700 dark:text-sunset-300 rounded-lg p-4 mb-6">
              {t('error')}
            </div>
          </Show>

          {/* Main Content - Vertical Layout */}
          <div class="space-y-6">
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
      </div>
    </>
  );
};

export default MyTrust;
