import { Component } from 'solid-js';

interface CommunityActivityTimelineProps {
  communityId: string;
}

export const CommunityActivityTimeline: Component<CommunityActivityTimelineProps> = (props) => {
  return (
    <div class="flex flex-col items-center justify-center py-16 px-6">
      {/* Icon */}
      <div class="text-8xl mb-6">🚧</div>

      {/* Title */}
      <h2 class="text-3xl font-bold text-stone-900 dark:text-stone-100 mb-4 text-center">
        Activity Timeline Coming Soon
      </h2>

      {/* Description */}
      <p class="text-lg text-stone-600 dark:text-stone-400 max-w-2xl text-center mb-6">
        The Activity Timeline feature is currently under development. Soon you'll be able to view a comprehensive timeline of all community events including wealth sharing, needs, polls, forum activity, council updates, and trust changes.
      </p>

      {/* Additional Info */}
      <div class="bg-ocean-50 dark:bg-ocean-900/30 border border-ocean-200 dark:border-ocean-700 rounded-lg p-6 max-w-2xl">
        <h3 class="font-semibold text-stone-900 dark:text-stone-100 mb-3 flex items-center gap-2">
          <span>📋</span>
          Planned Features:
        </h3>
        <ul class="space-y-2 text-stone-700 dark:text-stone-300">
          <li class="flex items-start gap-2">
            <span class="text-forest-600 dark:text-forest-400 mt-0.5">✓</span>
            <span>Real-time community activity feed</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-forest-600 dark:text-forest-400 mt-0.5">✓</span>
            <span>Filterable event types (wealth, needs, polls, forum, councils, trust)</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-forest-600 dark:text-forest-400 mt-0.5">✓</span>
            <span>User actions and notifications</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-forest-600 dark:text-forest-400 mt-0.5">✓</span>
            <span>Interactive timeline navigation</span>
          </li>
        </ul>
      </div>
    </div>
  );
};
