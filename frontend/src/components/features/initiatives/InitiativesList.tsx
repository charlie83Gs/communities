import { Component, Show, For, createSignal } from 'solid-js';
import { useCouncilInitiativesQuery } from '@/hooks/queries/useInitiatives';
import { InitiativeDetail } from './InitiativeDetail';
import { makeTranslator } from '@/i18n/makeTranslator';
import { initiativesDict } from './initiatives.i18n';

interface InitiativesListProps {
  communityId: string;
  councilId: string;
  canCreateReport?: boolean;
}

export const InitiativesList: Component<InitiativesListProps> = (props) => {
  const t = makeTranslator(initiativesDict, 'initiatives');
  const [selectedInitiativeId, setSelectedInitiativeId] = createSignal<string | null>(null);

  const initiativesQuery = useCouncilInitiativesQuery(
    () => props.communityId,
    () => props.councilId
  );

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadgeClass = (status: 'active' | 'completed' | 'cancelled') => {
    switch (status) {
      case 'active':
        return 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200';
      case 'completed':
        return 'bg-ocean-100 text-ocean-800 dark:bg-ocean-900 dark:text-ocean-200';
      case 'cancelled':
        return 'bg-stone-100 text-stone-800 dark:bg-stone-700 dark:text-stone-200';
      default:
        return 'bg-stone-100 text-stone-800 dark:bg-stone-700 dark:text-stone-200';
    }
  };

  const getStatusLabel = (status: 'active' | 'completed' | 'cancelled') => {
    switch (status) {
      case 'active':
        return t('statusActive');
      case 'completed':
        return t('statusCompleted');
      case 'cancelled':
        return t('statusCancelled');
      default:
        return status;
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <>
      <div class="space-y-4">
        <Show
          when={!initiativesQuery.isLoading}
          fallback={
            <p class="text-sm text-stone-500 dark:text-stone-400">{t('loading')}</p>
          }
        >
          <Show
            when={
              initiativesQuery.data?.initiatives && initiativesQuery.data.initiatives.length > 0
            }
            fallback={
              <div class="text-center py-12">
                <p class="text-stone-500 dark:text-stone-400 italic">{t('noInitiatives')}</p>
              </div>
            }
          >
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <For each={initiativesQuery.data?.initiatives}>
                {(initiative) => (
                  <button
                    onClick={() => setSelectedInitiativeId(initiative.id)}
                    class="p-4 bg-white dark:bg-stone-900 rounded-lg border border-stone-200 dark:border-stone-700 hover:border-ocean-500 dark:hover:border-ocean-500 transition-colors text-left"
                  >
                    {/* Header */}
                    <div class="flex items-start justify-between mb-3">
                      <h3 class="text-lg font-semibold text-stone-900 dark:text-stone-100 flex-1 pr-2">
                        {initiative.title}
                      </h3>
                      <span
                        class={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${getStatusBadgeClass(
                          initiative.status
                        )}`}
                      >
                        {getStatusLabel(initiative.status)}
                      </span>
                    </div>

                    {/* Description preview */}
                    <p class="text-sm text-stone-600 dark:text-stone-400 mb-3 line-clamp-2">
                      {truncateText(initiative.description, 150)}
                    </p>

                    {/* Footer */}
                    <div class="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                      <div class="flex items-center gap-4">
                        <div class="flex items-center gap-1">
                          <svg
                            class="w-4 h-4 text-success-600 dark:text-success-400"
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
                          <span>{initiative.upvotes || 0}</span>
                        </div>
                        <div class="flex items-center gap-1">
                          <svg
                            class="w-4 h-4 text-danger-600 dark:text-danger-400"
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
                          <span>{initiative.downvotes || 0}</span>
                        </div>
                      </div>
                      <div>{formatDateTime(initiative.createdAt)}</div>
                    </div>
                  </button>
                )}
              </For>
            </div>
          </Show>
        </Show>
      </div>

      {/* Detail modal */}
      <Show when={selectedInitiativeId()}>
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <InitiativeDetail
            communityId={props.communityId}
            initiativeId={selectedInitiativeId()!}
            onClose={() => setSelectedInitiativeId(null)}
            canCreateReport={props.canCreateReport}
          />
        </div>
      </Show>
    </>
  );
};
