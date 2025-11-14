import { Component, Show, For, createMemo } from 'solid-js';
import { useContributionProfileQuery } from '@/hooks/queries/useContributions';
import { CredentialedImage } from '@/components/common/CredentialedImage';
import { makeTranslator } from '@/i18n/makeTranslator';
import { contributionProfileDict } from './ContributionProfile.i18n';
import type { VerificationStatus } from '@/types/contributions.types';

interface ContributionProfileProps {
  communityId: string;
  userId: string;
}

export const ContributionProfile: Component<ContributionProfileProps> = (props) => {
  const t = makeTranslator(contributionProfileDict, 'contributionProfile');
  const baseUrl = import.meta.env.VITE_API_URL as string;

  const profileQuery = useContributionProfileQuery(
    () => props.communityId,
    () => props.userId
  );

  const categoryBreakdownArray = createMemo(() => {
    const breakdown = profileQuery.data?.categoryBreakdown || {};
    return Object.entries(breakdown)
      .map(([category, value]) => ({ category, value }))
      .sort((a, b) => b.value - a.value);
  });

  const totalPercentage = createMemo(() => {
    const total = profileQuery.data?.totalValue6Months || 0;
    return total;
  });

  const getPercentage = (value: number) => {
    const total = totalPercentage();
    return total > 0 ? Math.round((value / total) * 100) : 0;
  };

  const getStatusColor = (status: VerificationStatus) => {
    switch (status) {
      case 'auto_verified':
      case 'verified':
        return 'text-success-600 dark:text-success-400';
      case 'pending':
        return 'text-warning-600 dark:text-warning-400';
      case 'disputed':
        return 'text-danger-600 dark:text-danger-400';
      default:
        return 'text-stone-600 dark:text-stone-400';
    }
  };

  const getStatusLabel = (status: VerificationStatus) => {
    return t(`status.${status}`);
  };

  return (
    <div class="space-y-6">
      <Show
        when={!profileQuery.isLoading}
        fallback={
          <div class="flex justify-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-ocean-600"></div>
          </div>
        }
      >
        <Show when={profileQuery.data}>
          {/* Header with User Info */}
          <div class="flex items-center space-x-4 p-6 bg-white dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700">
            <Show when={profileQuery.data!.profileImage}>
              <CredentialedImage
                src={`${baseUrl}/api/v1/images/${profileQuery.data!.profileImage}`}
                alt={profileQuery.data!.displayName || profileQuery.data!.email || t('userImage')}
                class="w-16 h-16 rounded-full object-cover"
              />
            </Show>
            <div class="flex-1">
              <h2 class="text-xl font-semibold text-stone-900 dark:text-stone-100">
                {profileQuery.data!.displayName || profileQuery.data!.email}
              </h2>
              <p class="text-sm text-stone-600 dark:text-stone-400">{t('recognizedContributions')}</p>
            </div>
          </div>

          {/* Summary Stats */}
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="p-6 bg-white dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700">
              <p class="text-sm text-stone-600 dark:text-stone-400 mb-1">{t('last6Months')}</p>
              <p class="text-3xl font-bold text-ocean-600 dark:text-ocean-400">
                {profileQuery.data!.totalValue6Months}
              </p>
              <p class="text-xs text-stone-500 dark:text-stone-500 mt-1">{t('valueUnits')}</p>
            </div>
            <div class="p-6 bg-white dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700">
              <p class="text-sm text-stone-600 dark:text-stone-400 mb-1">{t('lifetime')}</p>
              <p class="text-3xl font-bold text-forest-600 dark:text-forest-400">
                {profileQuery.data!.totalValueLifetime}
              </p>
              <p class="text-xs text-stone-500 dark:text-stone-500 mt-1">{t('valueUnits')}</p>
            </div>
          </div>

          {/* Item Breakdown */}
          <div class="p-6 bg-white dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700">
            <h3 class="text-lg font-semibold mb-4 text-stone-900 dark:text-stone-100">
              {t('itemBreakdown')}
            </h3>
            <div class="space-y-3">
              <For each={categoryBreakdownArray()}>
                {(item) => (
                  <div>
                    <div class="flex justify-between text-sm mb-1">
                      <span class="text-stone-700 dark:text-stone-300">{item.category}</span>
                      <span class="text-stone-600 dark:text-stone-400">
                        {item.value} {t('units')} ({getPercentage(item.value)}%)
                      </span>
                    </div>
                    <div class="w-full bg-stone-200 dark:bg-stone-700 rounded-full h-2">
                      <div
                        class="bg-ocean-600 dark:bg-ocean-500 h-2 rounded-full"
                        style={{ width: `${getPercentage(item.value)}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </For>
            </div>
          </div>

          {/* Recent Contributions */}
          <div class="p-6 bg-white dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700">
            <h3 class="text-lg font-semibold mb-4 text-stone-900 dark:text-stone-100">
              {t('recentContributions')}
            </h3>
            <div class="space-y-4">
              <For
                each={profileQuery.data!.recentContributions}
                fallback={
                  <p class="text-sm text-stone-500 dark:text-stone-500 italic">
                    {t('noContributions')}
                  </p>
                }
              >
                {(contribution) => (
                  <div class="border-l-4 border-ocean-500 pl-4 py-2">
                    <div class="flex justify-between items-start mb-2">
                      <div>
                        <div class="flex items-center gap-2">
                          <p class="font-medium text-stone-900 dark:text-stone-100">
                            {contribution.itemName}
                          </p>
                          <span class={`text-xs px-2 py-0.5 rounded ${
                            contribution.itemKind === 'object'
                              ? 'bg-ocean-100 dark:bg-ocean-900 text-ocean-800 dark:text-ocean-200'
                              : 'bg-forest-100 dark:bg-forest-900 text-forest-800 dark:text-forest-200'
                          }`}>
                            {contribution.itemKind}
                          </span>
                        </div>
                        <p class="text-sm text-stone-600 dark:text-stone-400">
                          {contribution.units} × {contribution.valuePerUnit} = {contribution.totalValue}{' '}
                          {t('valueUnits')}
                        </p>
                      </div>
                      <span class={`text-xs font-medium ${getStatusColor(contribution.verificationStatus)}`}>
                        {getStatusLabel(contribution.verificationStatus)}
                      </span>
                    </div>
                    <p class="text-sm text-stone-700 dark:text-stone-300 mb-2">
                      {contribution.description}
                    </p>
                    <Show when={contribution.testimonial}>
                      <div class="mt-2 p-3 bg-stone-50 dark:bg-stone-900 rounded-md border border-stone-200 dark:border-stone-700">
                        <p class="text-xs text-stone-600 dark:text-stone-400 italic">
                          "{contribution.testimonial}"
                        </p>
                      </div>
                    </Show>
                    <p class="text-xs text-stone-500 dark:text-stone-500 mt-2">
                      {new Date(contribution.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </For>
            </div>
          </div>

          {/* Testimonials Section */}
          <Show when={(profileQuery.data!.testimonials || []).length > 0}>
            <div class="p-6 bg-white dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700">
              <h3 class="text-lg font-semibold mb-4 text-stone-900 dark:text-stone-100">
                {t('communityTestimonials')}
              </h3>
              <div class="space-y-3">
                <For each={profileQuery.data!.testimonials}>
                  {(testimonial) => (
                    <div class="p-3 bg-stone-50 dark:bg-stone-900 rounded-md border border-stone-200 dark:border-stone-700">
                      <p class="text-sm text-stone-700 dark:text-stone-300 italic">
                        "{testimonial}"
                      </p>
                    </div>
                  )}
                </For>
              </div>
            </div>
          </Show>
        </Show>
      </Show>

      <Show when={profileQuery.isError}>
        <div class="p-6 bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-lg">
          <p class="text-sm text-danger-800 dark:text-danger-200">{t('errorLoading')}</p>
        </div>
      </Show>
    </div>
  );
};
