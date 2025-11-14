/**
 * ResolutionDisplay Component
 * Location per architecture: /components/features/disputes (feature component)
 */

import { Component, Show } from 'solid-js';
import { Card } from '@/components/common/Card';
import { makeTranslator } from '@/i18n/makeTranslator';
import { disputesDict } from './disputes.i18n';
import { formatDateTime } from '@/utils/dateUtils';
import type { DisputeResolution } from '@/types/dispute.types';

interface ResolutionDisplayProps {
  resolution: DisputeResolution;
  canView: boolean;
}

export const ResolutionDisplay: Component<ResolutionDisplayProps> = (props) => {
  const t = makeTranslator(disputesDict, 'disputes');

  const getResolutionTypeLabel = () => {
    return props.resolution.resolutionType === 'open'
      ? t('resolutionTypeOpen')
      : t('resolutionTypeClosed');
  };

  const getResolutionTypeColor = () => {
    return props.resolution.resolutionType === 'open'
      ? 'bg-success-100 dark:bg-success-900 text-success-800 dark:text-success-200'
      : 'bg-stone-100 dark:bg-stone-700 text-stone-800 dark:text-stone-200';
  };

  const getUserDisplay = () => {
    return props.resolution.creator?.displayName || props.resolution.creator?.username || 'Unknown User';
  };

  return (
    <Show
      when={props.canView}
      fallback={
        <Card>
          <div class="text-center py-8">
            <p class="text-stone-500 dark:text-stone-400">
              {t('accessDeniedMessage')}
            </p>
          </div>
        </Card>
      }
    >
      <Card>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-stone-900 dark:text-stone-100">
              {t('resolutionSection')}
            </h3>
            <span class={`px-2 py-1 rounded-md text-xs font-medium ${getResolutionTypeColor()}`}>
              {getResolutionTypeLabel()}
            </span>
          </div>

          <div class="p-4 bg-stone-50 dark:bg-stone-900 rounded-lg">
            <p class="text-stone-900 dark:text-stone-100 whitespace-pre-wrap">
              {props.resolution.resolution}
            </p>
          </div>

          <div class="flex items-center gap-4 text-sm text-stone-600 dark:text-stone-400">
            <span>
              {t('resolutionCreatedBy')}: <span class="font-medium">{getUserDisplay()}</span>
            </span>
            <span>•</span>
            <span>
              {t('resolutionCreatedAt')}: {formatDateTime(new Date(props.resolution.createdAt))}
            </span>
          </div>

          <Show when={props.resolution.resolutionType === 'open'}>
            <div class="p-3 bg-ocean-50 dark:bg-ocean-950 border border-ocean-200 dark:border-ocean-800 rounded-lg">
              <p class="text-sm text-ocean-800 dark:text-ocean-200">
                {t('resolutionTypeOpenDesc')}
              </p>
            </div>
          </Show>
        </div>
      </Card>
    </Show>
  );
};
