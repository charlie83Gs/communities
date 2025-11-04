import { Component, Show } from 'solid-js';
import { useVoteInitiativeMutation, useRemoveVoteMutation } from '@/hooks/queries/useInitiatives';
import { makeTranslator } from '@/i18n/makeTranslator';
import { initiativesDict } from './initiatives.i18n';

interface VoteButtonsProps {
  communityId: string;
  initiativeId: string;
  upvotes: number;
  downvotes: number;
  userVote?: 'upvote' | 'downvote' | null;
}

export const VoteButtons: Component<VoteButtonsProps> = (props) => {
  const t = makeTranslator(initiativesDict, 'initiatives');
  const voteMutation = useVoteInitiativeMutation();
  const removeVoteMutation = useRemoveVoteMutation();

  const handleUpvote = async () => {
    if (props.userVote === 'upvote') {
      // Remove upvote
      await removeVoteMutation.mutateAsync({
        communityId: props.communityId,
        initiativeId: props.initiativeId,
      });
    } else {
      // Add upvote (or change from downvote)
      await voteMutation.mutateAsync({
        communityId: props.communityId,
        initiativeId: props.initiativeId,
        dto: { voteType: 'upvote' },
      });
    }
  };

  const handleDownvote = async () => {
    if (props.userVote === 'downvote') {
      // Remove downvote
      await removeVoteMutation.mutateAsync({
        communityId: props.communityId,
        initiativeId: props.initiativeId,
      });
    } else {
      // Add downvote (or change from upvote)
      await voteMutation.mutateAsync({
        communityId: props.communityId,
        initiativeId: props.initiativeId,
        dto: { voteType: 'downvote' },
      });
    }
  };

  const isPending = () => voteMutation.isPending || removeVoteMutation.isPending;

  return (
    <div class="flex items-center gap-2">
      {/* Upvote button */}
      <button
        onClick={handleUpvote}
        disabled={isPending()}
        class={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors border ${
          props.userVote === 'upvote'
            ? 'bg-success-100 text-success-800 border-success-300 dark:bg-success-900 dark:text-success-200 dark:border-success-700'
            : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50 dark:bg-stone-800 dark:text-stone-300 dark:border-stone-600 dark:hover:bg-stone-700'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
        title={t('upvote')}
      >
        <svg
          class="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 15l7-7 7 7"
          />
        </svg>
        <span>{props.upvotes || 0}</span>
      </button>

      {/* Downvote button */}
      <button
        onClick={handleDownvote}
        disabled={isPending()}
        class={`inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors border ${
          props.userVote === 'downvote'
            ? 'bg-danger-100 text-danger-800 border-danger-300 dark:bg-danger-900 dark:text-danger-200 dark:border-danger-700'
            : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50 dark:bg-stone-800 dark:text-stone-300 dark:border-stone-600 dark:hover:bg-stone-700'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
        title={t('downvote')}
      >
        <svg
          class="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
        <span>{props.downvotes || 0}</span>
      </button>
    </div>
  );
};
