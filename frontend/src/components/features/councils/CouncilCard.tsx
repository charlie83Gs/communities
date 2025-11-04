import { Component, Show } from 'solid-js';
import type { Council } from '@/types/council.types';
import { makeTranslator } from '@/i18n/makeTranslator';
import { councilsDict } from './councils.i18n';
import {
  useCouncilTrustStatusQuery,
  useAwardCouncilTrustMutation,
  useRemoveCouncilTrustMutation,
} from '@/hooks/queries/useCouncils';

interface CouncilCardProps {
  council: Council;
  communityId: string;
  onViewDetails: (councilId: string) => void;
}

export const CouncilCard: Component<CouncilCardProps> = (props) => {
  const t = makeTranslator(councilsDict, 'councils');

  const trustStatusQuery = useCouncilTrustStatusQuery(
    () => props.communityId,
    () => props.council.id
  );

  const awardTrustMutation = useAwardCouncilTrustMutation();
  const removeTrustMutation = useRemoveCouncilTrustMutation();

  const handleToggleTrust = async (e: MouseEvent) => {
    e.stopPropagation();
    const userHasTrusted = trustStatusQuery.data?.userHasTrusted;

    try {
      if (userHasTrusted) {
        await removeTrustMutation.mutateAsync({
          communityId: props.communityId,
          councilId: props.council.id,
        });
      } else {
        await awardTrustMutation.mutateAsync({
          communityId: props.communityId,
          councilId: props.council.id,
        });
      }
    } catch (error) {
      console.error('Trust operation failed:', error);
    }
  };

  const userHasTrusted = () => trustStatusQuery.data?.userHasTrusted || false;
  const canAwardTrust = () => trustStatusQuery.data?.canAwardTrust || false;
  const isLoading = () =>
    trustStatusQuery.isLoading ||
    awardTrustMutation.isPending ||
    removeTrustMutation.isPending;

  const formatDate = () => {
    return new Date(props.council.createdAt).toLocaleDateString();
  };

  const getMemberCountText = () => {
    const count = props.council.memberCount;
    return `${count} ${count === 1 ? t('manager') : t('managers')}`;
  };

  return (
    <div class="bg-white dark:bg-stone-800 rounded-lg shadow-sm border border-stone-200 dark:border-stone-700 hover:shadow-md transition-shadow p-5">
      {/* Header */}
      <div class="flex items-start justify-between mb-3">
        <div class="flex-1">
          <h3 class="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-1">
            {props.council.name}
          </h3>
        </div>

        {/* Trust Score Badge */}
        <div class="flex flex-col items-center gap-1 ml-4">
          <div class="relative">
            <div class="w-16 h-16 rounded-full bg-gradient-to-br from-forest-500 via-ocean-500 to-sage-600 p-0.5 shadow-md">
              <div class="w-full h-full rounded-full bg-white dark:bg-stone-900 flex flex-col items-center justify-center">
                <span class="text-2xl font-bold bg-gradient-to-br from-forest-600 to-ocean-600 dark:from-forest-400 dark:to-ocean-400 bg-clip-text text-transparent">
                  {props.council.trustScore}
                </span>
              </div>
            </div>
          </div>
          <span class="text-xs font-medium text-stone-600 dark:text-stone-400 uppercase tracking-wide">
            {t('trustScore')}
          </span>
        </div>
      </div>

      {/* Description */}
      <Show when={props.council.description}>
        <p class="text-sm text-stone-600 dark:text-stone-400 mb-3 line-clamp-2">
          {props.council.description}
        </p>
      </Show>

      {/* Footer */}
      <div class="flex items-center justify-between pt-3 border-t border-stone-200 dark:border-stone-700">
        <div class="flex flex-col gap-1 text-xs text-stone-500 dark:text-stone-400">
          <div class="flex items-center gap-1">
            <span class="font-medium">{getMemberCountText()}</span>
          </div>
          <div>
            {t('createdAt')}: {formatDate()}
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button
            onClick={() => props.onViewDetails(props.council.id)}
            class="px-4 py-2 text-sm font-medium text-ocean-700 dark:text-ocean-300 bg-ocean-50 dark:bg-ocean-900/30 hover:bg-ocean-100 dark:hover:bg-ocean-900/50 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-ocean-500"
          >
            {t('viewDetails')}
          </button>

          <Show when={canAwardTrust()}>
            <button
              onClick={handleToggleTrust}
              disabled={isLoading()}
              class={`p-2 rounded transition-colors ${
                userHasTrusted()
                  ? 'text-forest-600 hover:text-forest-700 dark:text-forest-500 dark:hover:text-forest-400'
                  : 'text-stone-400 hover:text-stone-600 dark:text-stone-500 dark:hover:text-stone-400'
              } ${isLoading() ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={userHasTrusted() ? t('removeTrust') : t('trustCouncil')}
              aria-label={userHasTrusted() ? t('removeTrust') : t('trustCouncil')}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="w-5 h-5"
                viewBox="0 0 24 24"
                fill={userHasTrusted() ? 'currentColor' : 'none'}
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
              </svg>
            </button>
          </Show>
        </div>
      </div>
    </div>
  );
};
