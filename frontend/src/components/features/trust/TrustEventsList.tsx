import { Component, Show, For } from 'solid-js';
import type { TrustTimelineEvent } from '@/types/user.types';
import { makeTranslator } from '@/i18n/makeTranslator';
import { myTrustDict } from '@/pages/protected/my-trust.i18n';

interface TrustEventsListProps {
  events: TrustTimelineEvent[];
  loading: boolean;
}

const getRelativeTime = (timestamp: string, t: (key: string) => string): string => {
  const now = new Date();
  const eventTime = new Date(timestamp);
  const diffMs = now.getTime() - eventTime.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffMinutes < 1) return t('justNow');
  if (diffMinutes < 60) return t('minutesAgo').replace('{count}', diffMinutes.toString());
  if (diffHours < 24) return t('hoursAgo').replace('{count}', diffHours.toString());
  if (diffDays < 30) return t('daysAgo').replace('{count}', diffDays.toString());
  if (diffMonths < 12) return t('monthsAgo').replace('{count}', diffMonths.toString());
  return t('yearsAgo').replace('{count}', diffYears.toString());
};

const getEventIcon = (type: string): string => {
  switch (type) {
    case 'award':
      return '+';
    case 'remove':
      return '-';
    case 'admin_grant':
      return '⭐';
    default:
      return '•';
  }
};

const getEventColor = (type: string): string => {
  switch (type) {
    case 'award':
      return 'text-green-600 bg-green-100';
    case 'remove':
      return 'text-red-600 bg-red-100';
    case 'admin_grant':
      return 'text-yellow-600 bg-yellow-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
};

export const TrustEventsList: Component<TrustEventsListProps> = (props) => {
  const t = makeTranslator(myTrustDict, 'myTrust');

  return (
    <div class="bg-white dark:bg-stone-800 rounded-lg shadow-md p-6 border border-stone-200 dark:border-stone-700">
      <h2 class="text-xl font-semibold mb-6 text-stone-900 dark:text-stone-100">{t('eventsTitle')}</h2>

      <Show
        when={!props.loading && props.events.length > 0}
        fallback={
          <Show when={props.loading} fallback={
            <div class="text-center py-12">
              <div class="text-stone-700 dark:text-stone-300 text-lg mb-2">{t('noData')}</div>
              <div class="text-sm text-stone-600 dark:text-stone-400">{t('noDataDescription')}</div>
            </div>
          }>
            <div class="space-y-4">
              <For each={[1, 2, 3, 4, 5]}>
                {() => <div class="animate-pulse bg-stone-200 dark:bg-stone-700 h-20 rounded" />}
              </For>
            </div>
          </Show>
        }
      >
        <div class="space-y-3 max-h-[600px] overflow-y-auto">
          <For each={props.events}>
            {(event) => (
              <div class="flex items-start gap-4 p-4 bg-stone-50 dark:bg-stone-700/50 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-700/70 transition-colors border border-stone-200 dark:border-stone-600">
                {/* Event Icon */}
                <div class={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${getEventColor(event.type)}`}>
                  {getEventIcon(event.type)}
                </div>

                {/* Event Details */}
                <div class="flex-1 min-w-0">
                  <div class="flex items-start justify-between gap-2">
                    <div class="flex-1">
                      <div class="text-sm text-stone-900 dark:text-stone-100">
                        <Show
                          when={event.type === 'award'}
                          fallback={
                            <Show
                              when={event.type === 'admin_grant'}
                              fallback={
                                <span>
                                  <span class="font-semibold">{event.fromUserDisplayName || 'Unknown'}</span> {t('eventRemoved')}
                                </span>
                              }
                            >
                              <span>{t('eventAdminGrant')}</span>
                            </Show>
                          }
                        >
                          <span>
                            <span class="font-semibold">{event.fromUserDisplayName || 'Unknown'}</span> {t('eventAwarded')}
                          </span>
                        </Show>
                      </div>
                      <div class="text-xs text-stone-600 dark:text-stone-400 mt-1">
                        {event.communityName} • {getRelativeTime(event.timestamp, t)}
                      </div>
                    </div>

                    {/* Points Badge */}
                    <div class="flex-shrink-0 text-right">
                      <div class={`text-sm font-semibold ${event.amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {event.amount > 0 ? '+' : ''}{event.amount} {t('points')}
                      </div>
                      <div class="text-xs text-stone-600 dark:text-stone-400 mt-1">
                        {t('totalPoints')}: {event.cumulativeTrust}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </For>
        </div>
      </Show>
    </div>
  );
};
