import { Component, Show, For, createSignal } from 'solid-js';
import { useParams, useNavigate } from '@solidjs/router';
import { usePollDetailQuery, useVotePollMutation, useClosePollMutation } from '@/hooks/queries/usePolls';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { PollComments } from './PollComments';
import { makeTranslator } from '@/i18n/makeTranslator';
import { pollsDict } from './polls.i18n';

interface PollDetailProps {
  communityId: string;
  pollId: string;
  currentUserId?: string;
  isAdmin?: boolean;
}

export const PollDetail: Component<PollDetailProps> = (props) => {
  const t = makeTranslator(pollsDict, 'polls');
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = createSignal<string>('');

  const pollQuery = usePollDetailQuery(
    () => props.communityId,
    () => props.pollId
  );
  const voteMutation = useVotePollMutation();
  const closeMutation = useClosePollMutation();

  const handleVote = async () => {
    const optionId = selectedOption();
    if (!optionId) return;

    try {
      await voteMutation.mutateAsync({
        communityId: props.communityId,
        pollId: props.pollId,
        optionId,
      });
      setSelectedOption('');
    } catch (err) {
      console.error('Failed to vote:', err);
    }
  };

  const handleClose = async () => {
    if (!confirm('Are you sure you want to close this poll?')) return;

    try {
      await closeMutation.mutateAsync({
        communityId: props.communityId,
        pollId: props.pollId,
      });
    } catch (err) {
      console.error('Failed to close poll:', err);
    }
  };

  const formatTimeRemaining = () => {
    const data = pollQuery.data;
    if (!data) return null;

    const now = new Date();
    const endsAt = new Date(data.endsAt);
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

  const canClosePoll = () => {
    const data = pollQuery.data;
    if (!data || data.status === 'closed') return false;
    return props.isAdmin || data.createdBy === props.currentUserId;
  };

  const canVote = () => {
    const data = pollQuery.data;
    if (!data) return false;
    return data.status === 'active' && !data.userVote;
  };

  const hasVoted = () => {
    return !!pollQuery.data?.userVote;
  };

  const getCreatorLabel = () => {
    const data = pollQuery.data;
    if (!data) return '';
    if (data.creatorType === 'council') return t('creatorCouncil');
    if (data.creatorType === 'pool') return t('creatorPool');
    return t('creatorUser');
  };

  return (
    <Show
      when={!pollQuery.isLoading}
      fallback={
        <div class="text-center py-8 text-stone-500 dark:text-stone-400">{t('loading')}</div>
      }
    >
      <Show when={pollQuery.data}>
        {(data) => (
          <div class="space-y-6">
            {/* Back button */}
            <button
              onClick={() => navigate(`/communities/${props.communityId}`)}
              class="text-sm text-ocean-600 dark:text-ocean-400 hover:text-ocean-700 dark:hover:text-ocean-300"
            >
              ← Back to community
            </button>

            {/* Poll header */}
            <Card>
              <div class="flex items-start justify-between mb-4">
                <div class="flex-1">
                  <h1 class="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-2">
                    {data().title}
                  </h1>
                  <div class="flex items-center gap-3 text-sm text-stone-600 dark:text-stone-400">
                    <span>{t('createdBy')}: {getCreatorLabel()}</span>
                    <span>•</span>
                    <Show when={data().status === 'active' && formatTimeRemaining()}>
                      <span class="text-ocean-600 dark:text-ocean-400 font-medium">
                        {t('endsIn')}: {formatTimeRemaining()}
                      </span>
                    </Show>
                    <Show when={data().status === 'closed'}>
                      <span class="text-stone-500 dark:text-stone-400">{t('closed')}</span>
                    </Show>
                  </div>
                </div>

                <Show when={canClosePoll()}>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={handleClose}
                    loading={closeMutation.isPending}
                  >
                    {closeMutation.isPending ? t('closingPoll') : t('closePoll')}
                  </Button>
                </Show>
              </div>

              <Show when={data().description}>
                <div class="mb-4 p-4 bg-stone-50 dark:bg-stone-900 rounded-lg">
                  <h3 class="text-sm font-semibold text-stone-900 dark:text-stone-100 mb-1">
                    {t('description')}
                  </h3>
                  <p class="text-sm text-stone-700 dark:text-stone-300">{data().description}</p>
                </div>
              </Show>

              {/* Voting section */}
              <div class="space-y-3">
                <h3 class="text-lg font-semibold text-stone-900 dark:text-stone-100">
                  {hasVoted() ? t('results') : t('vote')}
                </h3>

                <Show when={hasVoted()}>
                  <div class="text-sm text-success-600 dark:text-success-400 mb-2">
                    {t('voted')}:{' '}
                    {data().options.find((opt) => opt.id === data().userVote?.optionId)?.optionText}
                  </div>
                </Show>

                <For each={data().options}>
                  {(option) => {
                    const result = data().results.find((r) => r.optionId === option.id);
                    const votes = result?.votes || 0;
                    const percentage = result?.percentage || 0;

                    return (
                      <div class="relative">
                        {/* Progress bar background */}
                        <div class="absolute inset-0 bg-ocean-100 dark:bg-ocean-900 rounded-lg opacity-50">
                          <div
                            class="h-full bg-ocean-500 dark:bg-ocean-600 rounded-lg transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>

                        {/* Option content */}
                        <div class="relative p-3 flex items-center justify-between">
                          <div class="flex items-center gap-3">
                            <Show when={canVote()}>
                              <input
                                type="radio"
                                name="poll-option"
                                value={option.id}
                                checked={selectedOption() === option.id}
                                onChange={() => setSelectedOption(option.id)}
                                class="h-4 w-4 text-ocean-600 focus:ring-ocean-500 border-stone-300"
                              />
                            </Show>
                            <span class="font-medium text-stone-900 dark:text-stone-100">
                              {option.optionText}
                            </span>
                          </div>
                          <div class="text-sm font-semibold text-stone-700 dark:text-stone-300">
                            {percentage.toFixed(1)}% ({votes} {t('votesCount')})
                          </div>
                        </div>
                      </div>
                    );
                  }}
                </For>

                <Show when={canVote()}>
                  <div class="flex justify-end mt-4">
                    <Button
                      onClick={handleVote}
                      disabled={!selectedOption()}
                      loading={voteMutation.isPending}
                    >
                      {voteMutation.isPending ? t('posting') : t('vote')}
                    </Button>
                  </div>
                </Show>
              </div>
            </Card>

            {/* Comments section */}
            <Card>
              <PollComments
                communityId={props.communityId}
                pollId={props.pollId}
                currentUserId={props.currentUserId}
              />
            </Card>
          </div>
        )}
      </Show>
    </Show>
  );
};
