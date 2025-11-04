import { Component, Show, For, createMemo } from 'solid-js';
import { useTrustTimelineQuery } from '@/hooks/queries/useTrustTimelineQuery';
import { makeTranslator } from '@/i18n/makeTranslator';
import { trustTimelineDict } from './TrustTimeline.i18n';
import { Icon } from '@/components/common/Icon';

interface TrustTimelineProps {
  communityId: string;
}

export const TrustTimeline: Component<TrustTimelineProps> = (props) => {
  const t = makeTranslator(trustTimelineDict, 'trustTimeline');
  const timelineQuery = useTrustTimelineQuery(() => props.communityId);

  const progressPercentage = createMemo(() => {
    if (!timelineQuery.data) return 0;
    const total = timelineQuery.data.timeline.reduce((sum, item) => sum + item.permissions.length, 0);
    const unlocked = timelineQuery.data.timeline
      .filter((item) => item.unlocked)
      .reduce((sum, item) => sum + item.permissions.length, 0);
    return total > 0 ? Math.round((unlocked / total) * 100) : 0;
  });

  const totalUnlockedPermissions = createMemo(() => {
    if (!timelineQuery.data) return 0;
    return timelineQuery.data.timeline
      .filter((item) => item.unlocked)
      .reduce((sum, item) => sum + item.permissions.length, 0);
  });

  const totalPermissions = createMemo(() => {
    if (!timelineQuery.data) return 0;
    return timelineQuery.data.timeline.reduce((sum, item) => sum + item.permissions.length, 0);
  });

  return (
    <div class="space-y-6">
      {/* Header */}
      <div class="text-center space-y-2">
        <h2 class="text-3xl font-bold text-stone-900 dark:text-stone-100">
          {t('title')}
        </h2>
        <p class="text-stone-600 dark:text-stone-400">
          {t('subtitle')}
        </p>
      </div>

      <Show
        when={!timelineQuery.isLoading}
        fallback={
          <div class="flex items-center justify-center py-12">
            <div class="flex items-center gap-3 text-ocean-600 dark:text-ocean-400">
              <div class="animate-spin h-8 w-8 border-4 border-ocean-600 dark:border-ocean-400 border-t-transparent rounded-full"></div>
              <span class="text-lg">{t('loading')}</span>
            </div>
          </div>
        }
      >
        <Show
          when={timelineQuery.data}
          fallback={
            <div class="text-center py-8 text-danger-600 dark:text-danger-400">
              {t('error')}
            </div>
          }
        >
          {(data) => (
            <>
              {/* Trust Score Display */}
              <div class="bg-gradient-to-br from-ocean-50 to-forest-50 dark:from-ocean-950 dark:to-forest-950 rounded-2xl p-8 shadow-lg border border-ocean-200 dark:border-ocean-800">
                <div class="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div class="flex items-center gap-6">
                    {/* Score Circle */}
                    <div class="relative">
                      <div class="absolute inset-0 rounded-full bg-gradient-to-br from-forest-400 to-ocean-500 opacity-20 blur-xl animate-pulse"></div>
                      <div class="relative w-32 h-32 rounded-full bg-gradient-to-br from-forest-500 via-ocean-500 to-sage-600 p-1 shadow-2xl">
                        <div class="w-full h-full rounded-full bg-white dark:bg-stone-900 flex flex-col items-center justify-center">
                          <span class="text-5xl font-bold bg-gradient-to-br from-forest-600 to-ocean-600 dark:from-forest-400 dark:to-ocean-400 bg-clip-text text-transparent">
                            {data().userTrustScore}
                          </span>
                          <span class="text-xs font-medium text-stone-600 dark:text-stone-400 uppercase tracking-wide mt-1">
                            {t('trustPoints')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Progress Info */}
                    <div class="space-y-2">
                      <h3 class="text-xl font-semibold text-stone-900 dark:text-stone-100">
                        {t('yourTrustScore')}
                      </h3>
                      <p class="text-stone-600 dark:text-stone-400">
                        {totalUnlockedPermissions()} / {totalPermissions()} {t('ofPermissions')}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div class="w-full md:w-64 space-y-2">
                    <div class="flex items-center justify-between text-sm">
                      <span class="text-stone-600 dark:text-stone-400">{t('progressLabel')}</span>
                      <span class="font-semibold text-ocean-600 dark:text-ocean-400">
                        {progressPercentage()}%
                      </span>
                    </div>
                    <div class="h-4 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden shadow-inner">
                      <div
                        class="h-full bg-gradient-to-r from-forest-500 to-ocean-500 rounded-full transition-all duration-700 ease-out"
                        style={{ width: `${progressPercentage()}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div class="relative">
                {/* Vertical Line */}
                <div class="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-ocean-200 via-forest-200 to-sage-200 dark:from-ocean-800 dark:via-forest-800 dark:to-sage-800"></div>

                <div class="space-y-8">
                  <For each={data().timeline}>
                    {(item, index) => {
                      const isLast = index() === data().timeline.length - 1;
                      const isUnlocked = item.unlocked;

                      return (
                        <div class="relative pl-20 pb-8">
                          {/* Milestone Node */}
                          <div class={`absolute left-0 top-0 w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                            isUnlocked
                              ? 'bg-gradient-to-br from-forest-500 to-ocean-500 shadow-lg shadow-ocean-500/50 scale-110'
                              : 'bg-stone-300 dark:bg-stone-700 shadow-md'
                          }`}>
                            <Show
                              when={isUnlocked}
                              fallback={
                                <Icon
                                  name="lock"
                                  size={24}
                                  class="text-stone-500 dark:text-stone-400"
                                />
                              }
                            >
                              <Icon
                                name="check"
                                size={28}
                                class="text-white font-bold"
                              />
                            </Show>
                          </div>

                          {/* Content Card */}
                          <div class={`rounded-xl p-6 transition-all duration-300 ${
                            isUnlocked
                              ? 'bg-gradient-to-br from-forest-50 to-ocean-50 dark:from-forest-950 dark:to-ocean-950 border-2 border-forest-200 dark:border-forest-800 shadow-lg'
                              : 'bg-stone-50 dark:bg-stone-800 border-2 border-stone-200 dark:border-stone-700 opacity-70'
                          }`}>
                            {/* Header */}
                            <div class="flex items-start justify-between mb-4">
                              <div>
                                <div class="flex items-center gap-3 mb-1">
                                  <h3 class={`text-2xl font-bold ${
                                    isUnlocked
                                      ? 'text-forest-700 dark:text-forest-300'
                                      : 'text-stone-600 dark:text-stone-400'
                                  }`}>
                                    {item.threshold} {t('trustPoints')}
                                  </h3>
                                  <Show when={item.trustLevel}>
                                    <span class={`px-3 py-1 rounded-full text-sm font-medium ${
                                      isUnlocked
                                        ? 'bg-forest-100 dark:bg-forest-900 text-forest-700 dark:text-forest-300'
                                        : 'bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-400'
                                    }`}>
                                      {item.trustLevel!.name}
                                    </span>
                                  </Show>
                                </div>
                              </div>

                              <span class={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 ${
                                isUnlocked
                                  ? 'bg-success-100 dark:bg-success-900 text-success-700 dark:text-success-300'
                                  : 'bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-400'
                              }`}>
                                <Show
                                  when={isUnlocked}
                                  fallback={<Icon name="lock" size={16} />}
                                >
                                  <Icon name="check" size={16} />
                                </Show>
                                {isUnlocked ? t('unlocked') : t('locked')}
                              </span>
                            </div>

                            {/* Permissions List */}
                            <Show
                              when={item.permissions.length > 0}
                              fallback={
                                <p class="text-stone-500 dark:text-stone-400 italic">
                                  {t('noPermissions')}
                                </p>
                              }
                            >
                              <div class="space-y-2">
                                <h4 class={`text-sm font-semibold uppercase tracking-wide mb-3 ${
                                  isUnlocked
                                    ? 'text-ocean-600 dark:text-ocean-400'
                                    : 'text-stone-500 dark:text-stone-400'
                                }`}>
                                  {t('permissions')}
                                </h4>
                                <ul class="space-y-2">
                                  <For each={item.permissions}>
                                    {(permission) => (
                                      <li class="flex items-center gap-3">
                                        <div class={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                                          isUnlocked
                                            ? 'bg-ocean-100 dark:bg-ocean-900'
                                            : 'bg-stone-200 dark:bg-stone-700'
                                        }`}>
                                          <Icon
                                            name={isUnlocked ? 'check' : 'lock'}
                                            size={14}
                                            class={isUnlocked
                                              ? 'text-ocean-600 dark:text-ocean-400'
                                              : 'text-stone-500 dark:text-stone-400'
                                            }
                                          />
                                        </div>
                                        <span class={`text-sm ${
                                          isUnlocked
                                            ? 'text-stone-700 dark:text-stone-300 font-medium'
                                            : 'text-stone-500 dark:text-stone-400'
                                        }`}>
                                          {permission}
                                        </span>
                                      </li>
                                    )}
                                  </For>
                                </ul>
                              </div>
                            </Show>
                          </div>
                        </div>
                      );
                    }}
                  </For>
                </div>
              </div>

              {/* Encouragement Footer */}
              <div class="text-center py-6 bg-gradient-to-r from-ocean-50 to-forest-50 dark:from-ocean-950 dark:to-forest-950 rounded-xl border border-ocean-200 dark:border-ocean-800">
                <p class="text-lg font-medium text-stone-700 dark:text-stone-300">
                  {t('keepEarningTrust')}
                </p>
              </div>
            </>
          )}
        </Show>
      </Show>
    </div>
  );
};
