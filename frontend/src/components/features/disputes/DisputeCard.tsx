/**
 * DisputeCard Component
 * Location per architecture: /components/features/disputes (feature component)
 */

import { Component, Show } from 'solid-js';
import { A } from '@solidjs/router';
import { Card } from '@/components/common/Card';
import { makeTranslator } from '@/i18n/makeTranslator';
import { disputesDict } from './disputes.i18n';
import type { DisputeListItem } from '@/types/dispute.types';
import { formatDistanceToNow } from '@/utils/dateUtils';

interface DisputeCardProps {
  dispute: DisputeListItem;
  communityId: string;
}

export const DisputeCard: Component<DisputeCardProps> = (props) => {
  const t = makeTranslator(disputesDict, 'disputes');

  const getStatusLabel = () => {
    switch (props.dispute.status) {
      case 'open':
        return t('statusOpen');
      case 'in_mediation':
        return t('statusInMediation');
      case 'resolved':
        return t('statusResolved');
      case 'closed':
        return t('statusClosed');
      default:
        return props.dispute.status;
    }
  };

  const getStatusColor = () => {
    switch (props.dispute.status) {
      case 'open':
        return 'bg-warning-100 dark:bg-warning-900 text-warning-800 dark:text-warning-200';
      case 'in_mediation':
        return 'bg-ocean-100 dark:bg-ocean-900 text-ocean-800 dark:text-ocean-200';
      case 'resolved':
        return 'bg-success-100 dark:bg-success-900 text-success-800 dark:text-success-200';
      case 'closed':
        return 'bg-stone-100 dark:bg-stone-700 text-stone-800 dark:text-stone-200';
      default:
        return 'bg-stone-100 dark:bg-stone-700 text-stone-800 dark:text-stone-200';
    }
  };

  return (
    <Card>
      <div class="space-y-3">
        {/* Header */}
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <A
              href={`/communities/${props.communityId}/disputes/${props.dispute.id}`}
              class="text-lg font-semibold text-stone-900 dark:text-stone-100 hover:text-ocean-600 dark:hover:text-ocean-400 no-underline"
            >
              {props.dispute.title}
            </A>
          </div>
          <span class={`px-2 py-1 rounded-md text-xs font-medium ${getStatusColor()}`}>
            {getStatusLabel()}
          </span>
        </div>

        {/* Metadata */}
        <div class="flex flex-wrap items-center gap-3 text-sm text-stone-600 dark:text-stone-400">
          <span>
            {t('participants')}: {props.dispute.participantCount}
          </span>
          <span>•</span>
          <span>
            {t('mediators')}: {props.dispute.acceptedMediatorCount} {t('accepted')}
            <Show when={props.dispute.proposedMediatorCount > 0}>
              , {props.dispute.proposedMediatorCount} {t('proposed')}
            </Show>
          </span>
          <span>•</span>
          <span>{formatDistanceToNow(new Date(props.dispute.createdAt))}</span>
        </div>

        {/* Badges */}
        <div class="flex flex-wrap gap-2">
          <Show when={props.dispute.isParticipant}>
            <span class="px-2 py-1 rounded-md text-xs font-medium bg-forest-100 dark:bg-forest-900 text-forest-800 dark:text-forest-200">
              {t('youAreParticipant')}
            </span>
          </Show>
          <Show when={props.dispute.isMediator}>
            <span class="px-2 py-1 rounded-md text-xs font-medium bg-ocean-100 dark:bg-ocean-900 text-ocean-800 dark:text-ocean-200">
              {t('youAreMediator')}
            </span>
          </Show>
          <Show when={props.dispute.hasResolution}>
            <span class="px-2 py-1 rounded-md text-xs font-medium bg-success-100 dark:bg-success-900 text-success-800 dark:text-success-200">
              {t('hasResolution')}
            </span>
          </Show>
        </div>

        {/* View button */}
        <div class="pt-2">
          <A
            href={`/communities/${props.communityId}/disputes/${props.dispute.id}`}
            class="text-sm text-ocean-600 dark:text-ocean-400 hover:text-ocean-700 dark:hover:text-ocean-300 font-medium no-underline"
          >
            {t('viewDetails')} →
          </A>
        </div>
      </div>
    </Card>
  );
};
