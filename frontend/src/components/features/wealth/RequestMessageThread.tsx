import { Component, For, Show, createSignal, createMemo, createEffect, onMount } from 'solid-js';
import { Button } from '@/components/common/Button';
import { useAuth } from '@/hooks/useAuth';
import { useRequestMessagesQuery, useSendRequestMessageMutation } from '@/hooks/queries/useWealth';
import type { WealthRequestMessage, WealthRequestStatus } from '@/types/wealth.types';
import { makeTranslator } from '@/i18n/makeTranslator';
import { requestMessageThreadDict } from './RequestMessageThread.i18n';

interface RequestMessageThreadProps {
  wealthId: string;
  requestId: string;
  wealthOwnerId: string;
  requestStatus: WealthRequestStatus;
  onMessageSent?: () => void;
}

// Terminal states where messaging should be disabled
const TERMINAL_STATES: WealthRequestStatus[] = ['fulfilled', 'rejected', 'cancelled', 'failed'];

export const RequestMessageThread: Component<RequestMessageThreadProps> = (props) => {
  const t = makeTranslator(requestMessageThreadDict, 'requestMessageThread');
  const { user } = useAuth();

  // Query for messages
  const messagesQuery = useRequestMessagesQuery(
    () => props.wealthId,
    () => props.requestId
  );

  // Mutation for sending messages
  const sendMessageMutation = useSendRequestMessageMutation();

  // Form state
  const [messageContent, setMessageContent] = createSignal('');
  const [error, setError] = createSignal<string | null>(null);

  // Ref for auto-scrolling
  let messagesContainerRef: HTMLDivElement | undefined;

  // Check if messaging is disabled
  const isMessagingDisabled = createMemo(() => TERMINAL_STATES.includes(props.requestStatus));

  // Group messages by date
  const groupedMessages = createMemo(() => {
    const messages = messagesQuery.data?.messages || [];
    const groups: Map<string, WealthRequestMessage[]> = new Map();

    messages.forEach((msg) => {
      const date = new Date(msg.createdAt);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let dateKey: string;
      if (date.toDateString() === today.toDateString()) {
        dateKey = t('today');
      } else if (date.toDateString() === yesterday.toDateString()) {
        dateKey = t('yesterday');
      } else {
        dateKey = date.toLocaleDateString();
      }

      if (!groups.has(dateKey)) {
        groups.set(dateKey, []);
      }
      groups.get(dateKey)!.push(msg);
    });

    return Array.from(groups.entries());
  });

  // Auto-scroll to bottom when messages change
  createEffect(() => {
    const messages = messagesQuery.data?.messages;
    if (messages && messagesContainerRef) {
      setTimeout(() => {
        messagesContainerRef!.scrollTop = messagesContainerRef!.scrollHeight;
      }, 100);
    }
  });

  // Handle sending message
  const handleSend = async (e: Event) => {
    e.preventDefault();
    setError(null);

    const content = messageContent().trim();
    if (!content) return;

    try {
      await sendMessageMutation.mutateAsync({
        wealthId: props.wealthId,
        requestId: props.requestId,
        content,
      });
      setMessageContent('');
      props.onMessageSent?.();
    } catch (err) {
      setError(t('errorSending'));
    }
  };

  // Format time for message
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Check if message is from current user
  const isOwnMessage = (msg: WealthRequestMessage) => {
    return user()?.id === msg.authorId;
  };

  return (
    <div class="flex flex-col h-full">
      {/* Header */}
      <div class="flex items-center justify-between pb-3 border-b border-stone-200 dark:border-stone-700">
        <h4 class="font-semibold text-stone-900 dark:text-stone-100">{t('title')}</h4>
        <Show when={messagesQuery.isLoading}>
          <span class="text-xs text-stone-500 dark:text-stone-400">...</span>
        </Show>
      </div>

      {/* Messages area */}
      <div
        ref={messagesContainerRef}
        class="flex-1 overflow-y-auto py-4 space-y-4 min-h-[200px] max-h-[400px]"
      >
        <Show
          when={!messagesQuery.isLoading && groupedMessages().length > 0}
          fallback={
            <div class="flex flex-col items-center justify-center h-full text-center p-4">
              <p class="text-sm text-stone-500 dark:text-stone-400">{t('noMessages')}</p>
              <Show when={!isMessagingDisabled()}>
                <p class="text-xs text-stone-400 dark:text-stone-500 mt-1">
                  {t('startConversation')}
                </p>
              </Show>
            </div>
          }
        >
          <For each={groupedMessages()}>
            {([dateLabel, messages]) => (
              <div class="space-y-3">
                {/* Date separator */}
                <div class="flex items-center justify-center">
                  <span class="px-3 py-1 text-xs text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 rounded-full">
                    {dateLabel}
                  </span>
                </div>

                {/* Messages for this date */}
                <For each={messages}>
                  {(msg) => (
                    <div
                      class={`flex ${isOwnMessage(msg) ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        class={`max-w-[80%] rounded-lg px-3 py-2 ${
                          isOwnMessage(msg)
                            ? 'bg-ocean-100 dark:bg-ocean-900 text-ocean-900 dark:text-ocean-100'
                            : 'bg-stone-100 dark:bg-stone-700 text-stone-900 dark:text-stone-100'
                        }`}
                      >
                        {/* Author name for non-own messages */}
                        <Show when={!isOwnMessage(msg)}>
                          <p class="text-xs font-medium mb-1 text-stone-600 dark:text-stone-400">
                            {msg.author.displayName}
                          </p>
                        </Show>

                        {/* Message content - render as HTML for rich text */}
                        <div
                          class="text-sm break-words prose prose-sm dark:prose-invert max-w-none"
                          innerHTML={msg.content}
                        />

                        {/* Timestamp */}
                        <p
                          class={`text-xs mt-1 ${
                            isOwnMessage(msg)
                              ? 'text-ocean-600 dark:text-ocean-400'
                              : 'text-stone-500 dark:text-stone-400'
                          }`}
                        >
                          {formatTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  )}
                </For>
              </div>
            )}
          </For>
        </Show>
      </div>

      {/* Input area */}
      <Show
        when={!isMessagingDisabled()}
        fallback={
          <div class="pt-3 border-t border-stone-200 dark:border-stone-700">
            <p class="text-xs text-stone-500 dark:text-stone-400 text-center">
              {t('messagingDisabled')}
            </p>
          </div>
        }
      >
        <form onSubmit={handleSend} class="pt-3 border-t border-stone-200 dark:border-stone-700">
          <Show when={error()}>
            <p class="text-xs text-red-600 dark:text-red-400 mb-2">{error()}</p>
          </Show>
          <div class="flex gap-2">
            <input
              type="text"
              value={messageContent()}
              onInput={(e) => setMessageContent(e.currentTarget.value)}
              placeholder={t('placeholder')}
              class="flex-1 px-3 py-2 text-sm border border-stone-300 dark:border-stone-600 rounded-lg bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
              disabled={sendMessageMutation.isPending}
            />
            <Button
              type="submit"
              size="sm"
              disabled={sendMessageMutation.isPending || !messageContent().trim()}
            >
              {sendMessageMutation.isPending ? t('sending') : t('send')}
            </Button>
          </div>
        </form>
      </Show>
    </div>
  );
};

export default RequestMessageThread;
