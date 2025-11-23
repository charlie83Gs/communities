/**
 * AddParticipant Component
 * Location per architecture: /components/features/disputes (feature component)
 */

import { Component, createSignal, Show, createMemo } from 'solid-js';
import { useAddParticipantMutation } from '@/hooks/queries/useDisputes';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { CommunityMemberSelector } from '@/components/common/CommunityMemberSelector';
import { makeTranslator } from '@/i18n/makeTranslator';
import { disputesDict } from './disputes.i18n';
import type { DisputeParticipant } from '@/types/dispute.types';

interface AddParticipantProps {
  communityId: string;
  disputeId: string;
  currentParticipants: DisputeParticipant[];
  canAddParticipants: boolean;
}

export const AddParticipant: Component<AddParticipantProps> = (props) => {
  const t = makeTranslator(disputesDict, 'disputes');
  const [isAdding, setIsAdding] = createSignal(false);
  const [selectedUserId, setSelectedUserId] = createSignal<string>('');

  const addParticipantMutation = useAddParticipantMutation();

  // Get IDs of current participants to exclude from selector
  const excludeIds = createMemo(() => {
    return props.currentParticipants.map(p => p.userId);
  });

  const handleSelectUser = (userId: string) => {
    setSelectedUserId(userId);
  };

  const handleDeselectUser = (userId: string) => {
    if (selectedUserId() === userId) {
      setSelectedUserId('');
    }
  };

  const handleAddParticipant = async () => {
    const userId = selectedUserId();
    if (!userId) return;

    try {
      await addParticipantMutation.mutateAsync({
        communityId: props.communityId,
        disputeId: props.disputeId,
        dto: { userId },
      });

      // Reset state
      setSelectedUserId('');
      setIsAdding(false);
    } catch (err) {
      console.error('Failed to add participant:', err);
    }
  };

  return (
    <Show when={props.canAddParticipants}>
      <Card>
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-stone-900 dark:text-stone-100">
              {t('addParticipant')}
            </h3>
            <Show when={!isAdding()}>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setIsAdding(true)}
              >
                {t('addParticipant')}
              </Button>
            </Show>
          </div>

          <Show when={isAdding()}>
            <div class="space-y-3">
              <CommunityMemberSelector
                communityId={props.communityId}
                mode="single"
                selectedIds={selectedUserId() ? [selectedUserId()] : []}
                onSelect={handleSelectUser}
                onDeselect={handleDeselectUser}
                excludeIds={excludeIds()}
                placeholder={t('addParticipantPlaceholder')}
              />

              <div class="flex gap-2">
                <Button
                  onClick={handleAddParticipant}
                  disabled={!selectedUserId() || addParticipantMutation.isPending}
                  loading={addParticipantMutation.isPending}
                  size="sm"
                >
                  Add
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setIsAdding(false);
                    setSelectedUserId('');
                  }}
                  size="sm"
                >
                  {t('cancel')}
                </Button>
              </div>

              <Show when={addParticipantMutation.isError}>
                <p class="text-sm text-danger-600 dark:text-danger-400">
                  Failed to add participant. Please try again.
                </p>
              </Show>
            </div>
          </Show>
        </div>
      </Card>
    </Show>
  );
};
