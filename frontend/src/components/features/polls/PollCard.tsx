import { Component, Show } from 'solid-js';
import { A } from '@solidjs/router';
import type { Poll } from '@/types/poll.types';
import { makeTranslator } from '@/i18n/makeTranslator';
import { pollsDict } from './polls.i18n';

interface PollCardProps {
  poll: Poll;
  communityId: string;
}

export const PollCard: Component<PollCardProps> = (props) => {
  const t = makeTranslator(pollsDict, 'polls');

  const formatTimeRemaining = () => {
    const now = new Date();
    const endsAt = new Date(props.poll.endsAt);
    const diff = endsAt.getTime() - now.getTime();

    if (diff <= 0) return null;

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days} ${days === 1 ? t('day') : t('days')}`;
    } else if (hours > 0) {
      return `${hours} ${hours === 1 ? t('hour') : t('hours')}`;
    } else {
      const minutes = Math.floor(diff / (1000 * 60));
      return `${minutes} ${minutes === 1 ? t('minute') : t('minutes')}`;
    }
  };

  const formatEndDate = () => {
    return new Date(props.poll.endsAt).toLocaleDateString();
  };

  const getStatusBadge = () => {
    if (props.poll.status === 'active') {
      return (
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200">
          {t('active')}
        </span>
      );
    } else {
      return (
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-800 dark:bg-stone-700 dark:text-stone-200">
          {t('closed')}
        </span>
      );
    }
  };

  const getCreatorLabel = () => {
    if (props.poll.creatorType === 'council') {
      return t('creatorCouncil');
    } else if (props.poll.creatorType === 'pool') {
      return t('creatorPool');
    } else {
      return t('creatorUser');
    }
  };

  return (
    <A
      href={`/communities/${props.communityId}/polls/${props.poll.id}`}
      class="block bg-white dark:bg-stone-800 rounded-lg shadow-sm border border-stone-200 dark:border-stone-700 hover:shadow-md transition-shadow p-4"
    >
      <div class="flex items-start justify-between mb-3">
        <h3 class="text-lg font-semibold text-stone-900 dark:text-stone-100 flex-1">
          {props.poll.title}
        </h3>
        {getStatusBadge()}
      </div>

      <Show when={props.poll.description}>
        <p class="text-sm text-stone-600 dark:text-stone-400 mb-3 line-clamp-2">
          {props.poll.description}
        </p>
      </Show>

      <div class="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
        <div class="flex items-center gap-4">
          <span>
            {t('createdBy')}: {getCreatorLabel()}
          </span>
          <Show when={props.poll.status === 'active' && formatTimeRemaining()}>
            <span class="text-ocean-600 dark:text-ocean-400 font-medium">
              {t('endsIn')}: {formatTimeRemaining()}
            </span>
          </Show>
          <Show when={props.poll.status === 'closed'}>
            <span>
              {t('endedOn')}: {formatEndDate()}
            </span>
          </Show>
        </div>
      </div>
    </A>
  );
};
