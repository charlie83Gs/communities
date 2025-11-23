import { Component, createSignal, Show } from 'solid-js';
import { Card } from '@/components/common/Card';
import { InviteUserForm } from '@/components/features/communities/InviteUserForm';
import { InviteLinkForm } from '@/components/features/communities/InviteLinkForm';
import { makeTranslator } from '@/i18n/makeTranslator';
import { inviteCreatePanelDict } from './InviteCreatePanel.i18n';

type InviteTab = 'direct-user' | 'share-link';

interface InviteCreatePanelProps {
  communityId: string;
}

export const InviteCreatePanel: Component<InviteCreatePanelProps> = (props) => {
  const t = makeTranslator(inviteCreatePanelDict, 'inviteCreatePanel');
  const [activeTab, setActiveTab] = createSignal<InviteTab>('direct-user');

  return (
    <Card>
      <div class="p-6">
        <h2 class="text-xl font-bold mb-4 text-stone-900 dark:text-stone-100">
          {t('title')}
        </h2>

        {/* Segmented Control */}
        <div class="flex mb-6 bg-stone-100 dark:bg-stone-700 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('direct-user')}
            class={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
              activeTab() === 'direct-user'
                ? 'bg-white dark:bg-stone-600 text-ocean-600 dark:text-ocean-400 shadow-sm'
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100'
            }`}
          >
            {t('tabDirectUser')}
          </button>
          <button
            onClick={() => setActiveTab('share-link')}
            class={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
              activeTab() === 'share-link'
                ? 'bg-white dark:bg-stone-600 text-ocean-600 dark:text-ocean-400 shadow-sm'
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100'
            }`}
          >
            {t('tabShareLink')}
          </button>
        </div>

        {/* Tab Content */}
        <Show when={activeTab() === 'direct-user'}>
          <InviteUserForm communityId={props.communityId} embedded={true} />
        </Show>
        <Show when={activeTab() === 'share-link'}>
          <InviteLinkForm communityId={props.communityId} embedded={true} />
        </Show>
      </div>
    </Card>
  );
};
