/**
 * DisputeMessages Component
 * Location per architecture: /components/features/disputes (feature component)
 */

import { Component, Show, For, createSignal } from 'solid-js';
import { useDisputeMessagesQuery, useCreateMessageMutation } from '@/hooks/queries/useDisputes';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { makeTranslator } from '@/i18n/makeTranslator';
import { disputesDict } from './disputes.i18n';
import { formatDistanceToNow } from '@/utils/dateUtils';
import type { CreateDisputeMessageDto } from '@/types/dispute.types';

interface DisputeMessagesProps {
  communityId: string;
  disputeId: string;
  currentUserId?: string;
  canMessage: boolean;
}

export const DisputeMessages: Component<DisputeMessagesProps> = (props) => {
  const t = makeTranslator(disputesDict, 'disputes');
  const messagesQuery = useDisputeMessagesQuery(
    () => props.communityId,
    () => props.disputeId
  );
  const createMessageMutation = useCreateMessageMutation();

  const [message, setMessage] = createSignal('');
  const [visibleToParticipants, setVisibleToParticipants] = createSignal(true);
  const [visibleToMediators, setVisibleToMediators] = createSignal(true);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();

    if (!message().trim()) return;

    try {
      const dto: CreateDisputeMessageDto = {
        message: message().trim(),
        visibleToParticipants: visibleToParticipants(),
        visibleToMediators: visibleToMediators(),
      };

      await createMessageMutation.mutateAsync({
        communityId: props.communityId,
        disputeId: props.disputeId,
        dto,
      });

      setMessage('');
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  const getUserDisplay = (msg: any) => {
    return msg.user?.displayName || msg.user?.username || 'Unknown User';
  };

  return (
    <div class="space-y-4">
      <h3 class="text-lg font-semibold text-stone-900 dark:text-stone-100">
        {t('messagesSection')}
      </h3>

      {/* Messages list */}
      <Show
        when={!messagesQuery.isLoading}
        fallback={
          <div class="text-center py-4 text-stone-500 dark:text-stone-400">
            {t('loading')}
          </div>
        }
      >
        <Show
          when={messagesQuery.data?.messages && messagesQuery.data.messages.length > 0}
          fallback={
            <div class="text-center py-8 bg-stone-50 dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-700">
              <p class="text-stone-500 dark:text-stone-400">{t('noMessages')}</p>
            </div>
          }
        >
          <div class="space-y-3 max-h-96 overflow-y-auto">
            <For each={messagesQuery.data?.messages}>
              {(msg) => (
                <Card>
                  <div class="space-y-2">
                    <div class="flex items-start justify-between">
                      <div class="font-medium text-stone-900 dark:text-stone-100">
                        {getUserDisplay(msg)}
                      </div>
                      <div class="text-xs text-stone-500 dark:text-stone-400">
                        {formatDistanceToNow(new Date(msg.createdAt))}
                      </div>
                    </div>
                    <p class="text-sm text-stone-700 dark:text-stone-300 whitespace-pre-wrap">
                      {msg.message}
                    </p>
                    <div class="flex gap-2 text-xs text-stone-500 dark:text-stone-400">
                      <Show when={msg.visibleToParticipants}>
                        <span class="px-2 py-0.5 bg-forest-100 dark:bg-forest-900 text-forest-800 dark:text-forest-200 rounded">
                          {t('visibleToParticipants')}
                        </span>
                      </Show>
                      <Show when={msg.visibleToMediators}>
                        <span class="px-2 py-0.5 bg-ocean-100 dark:bg-ocean-900 text-ocean-800 dark:text-ocean-200 rounded">
                          {t('visibleToMediators')}
                        </span>
                      </Show>
                    </div>
                  </div>
                </Card>
              )}
            </For>
          </div>
        </Show>
      </Show>

      {/* Message form */}
      <Show when={props.canMessage}>
        <form onSubmit={handleSubmit} class="space-y-3">
          <div>
            <textarea
              value={message()}
              onInput={(e) => setMessage(e.currentTarget.value)}
              placeholder={t('messagePlaceholder')}
              rows={3}
              class="block w-full rounded-md border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-sm focus:border-ocean-500 focus:ring-ocean-500 sm:text-sm"
            />
          </div>

          <div class="space-y-2">
            <label class="block text-sm font-medium text-stone-700 dark:text-stone-300">
              {t('visibilityLabel')}
            </label>
            <div class="flex gap-4">
              <label class="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={visibleToParticipants()}
                  onChange={(e) => setVisibleToParticipants(e.currentTarget.checked)}
                  class="rounded border-stone-300 dark:border-stone-600 text-ocean-600 focus:ring-ocean-500"
                />
                <span class="text-sm text-stone-700 dark:text-stone-300">
                  {t('visibleToParticipants')}
                </span>
              </label>
              <label class="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={visibleToMediators()}
                  onChange={(e) => setVisibleToMediators(e.currentTarget.checked)}
                  class="rounded border-stone-300 dark:border-stone-600 text-ocean-600 focus:ring-ocean-500"
                />
                <span class="text-sm text-stone-700 dark:text-stone-300">
                  {t('visibleToMediators')}
                </span>
              </label>
            </div>
          </div>

          <div class="flex justify-end">
            <Button type="submit" loading={createMessageMutation.isPending} disabled={!message().trim()}>
              {createMessageMutation.isPending ? t('sendingMessage') : t('sendMessage')}
            </Button>
          </div>
        </form>
      </Show>
    </div>
  );
};
