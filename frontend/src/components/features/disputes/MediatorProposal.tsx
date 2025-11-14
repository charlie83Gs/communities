/**
 * MediatorProposal Component
 * Location per architecture: /components/features/disputes (feature component)
 */

import { Component, Show, For, createMemo } from 'solid-js';
import { useProposeAsMediatorMutation, useRespondToMediatorMutation } from '@/hooks/queries/useDisputes';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { makeTranslator } from '@/i18n/makeTranslator';
import { disputesDict } from './disputes.i18n';
import type { DisputeMediator } from '@/types/dispute.types';

interface MediatorProposalProps {
  communityId: string;
  disputeId: string;
  mediators: DisputeMediator[];
  canProposeAsMediator: boolean;
  canAcceptMediator: boolean;
  currentUserId?: string;
}

export const MediatorProposal: Component<MediatorProposalProps> = (props) => {
  const t = makeTranslator(disputesDict, 'disputes');
  const proposeMutation = useProposeAsMediatorMutation();
  const respondMutation = useRespondToMediatorMutation();

  const proposedMediators = createMemo(() =>
    props.mediators.filter((m) => m.status === 'proposed')
  );

  const acceptedMediators = createMemo(() =>
    props.mediators.filter((m) => m.status === 'accepted')
  );

  const rejectedMediators = createMemo(() =>
    props.mediators.filter((m) => m.status === 'rejected')
  );

  const handlePropose = async () => {
    try {
      await proposeMutation.mutateAsync({
        communityId: props.communityId,
        disputeId: props.disputeId,
      });
    } catch (err) {
      console.error('Failed to propose as mediator:', err);
    }
  };

  const handleRespond = async (mediatorId: string, accept: boolean) => {
    try {
      await respondMutation.mutateAsync({
        communityId: props.communityId,
        disputeId: props.disputeId,
        mediatorId,
        dto: { accept },
      });
    } catch (err) {
      console.error('Failed to respond to mediator proposal:', err);
    }
  };

  const getUserDisplay = (mediator: DisputeMediator) => {
    return mediator.user?.displayName || mediator.user?.username || 'Unknown User';
  };

  return (
    <div class="space-y-4">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold text-stone-900 dark:text-stone-100">
          {t('mediatorsSection')}
        </h3>
        <Show when={props.canProposeAsMediator}>
          <Button
            size="sm"
            onClick={handlePropose}
            loading={proposeMutation.isPending}
          >
            {proposeMutation.isPending ? t('proposingAsMediator') : t('proposeAsMediator')}
          </Button>
        </Show>
      </div>

      {/* Accepted Mediators */}
      <Show when={acceptedMediators().length > 0}>
        <div>
          <h4 class="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">
            {t('acceptedMediators')}
          </h4>
          <div class="space-y-2">
            <For each={acceptedMediators()}>
              {(mediator) => (
                <Card>
                  <div class="flex items-center justify-between">
                    <div class="flex-1">
                      <div class="font-medium text-stone-900 dark:text-stone-100">
                        {getUserDisplay(mediator)}
                      </div>
                      <div class="text-xs text-stone-500 dark:text-stone-400">
                        {t('mediatorAcceptedBy')}{' '}
                        {mediator.respondedAt ? new Date(mediator.respondedAt).toLocaleDateString() : ''}
                      </div>
                    </div>
                    <span class="px-2 py-1 bg-success-100 dark:bg-success-900 text-success-800 dark:text-success-200 rounded text-xs font-medium">
                      {t('accepted')}
                    </span>
                  </div>
                </Card>
              )}
            </For>
          </div>
        </div>
      </Show>

      {/* Proposed Mediators */}
      <Show when={proposedMediators().length > 0}>
        <div>
          <h4 class="text-sm font-semibold text-stone-700 dark:text-stone-300 mb-2">
            {t('proposedMediators')}
          </h4>
          <div class="space-y-2">
            <For each={proposedMediators()}>
              {(mediator) => (
                <Card>
                  <div class="flex items-center justify-between">
                    <div class="flex-1">
                      <div class="font-medium text-stone-900 dark:text-stone-100">
                        {getUserDisplay(mediator)}
                      </div>
                      <div class="text-xs text-stone-500 dark:text-stone-400">
                        {t('mediatorProposedBy')}{' '}
                        {new Date(mediator.proposedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <Show when={props.canAcceptMediator}>
                      <div class="flex gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleRespond(mediator.id, true)}
                          loading={respondMutation.isPending}
                        >
                          {t('acceptMediator')}
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleRespond(mediator.id, false)}
                          loading={respondMutation.isPending}
                        >
                          {t('rejectMediator')}
                        </Button>
                      </div>
                    </Show>
                  </div>
                </Card>
              )}
            </For>
          </div>
        </div>
      </Show>

      {/* Show message if no mediators */}
      <Show when={acceptedMediators().length === 0 && proposedMediators().length === 0}>
        <div class="text-center py-8 bg-stone-50 dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-700">
          <p class="text-stone-500 dark:text-stone-400">{t('noProposedMediators')}</p>
        </div>
      </Show>

      {/* Rejected Mediators (collapsed by default) */}
      <Show when={rejectedMediators().length > 0}>
        <details class="text-sm">
          <summary class="cursor-pointer text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100">
            {t('rejectedMediators')} ({rejectedMediators().length})
          </summary>
          <div class="mt-2 space-y-2">
            <For each={rejectedMediators()}>
              {(mediator) => (
                <div class="text-stone-500 dark:text-stone-400 pl-4">
                  {getUserDisplay(mediator)}
                </div>
              )}
            </For>
          </div>
        </details>
      </Show>
    </div>
  );
};
