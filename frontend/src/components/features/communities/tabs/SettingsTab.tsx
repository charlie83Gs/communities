import { Component, Show } from 'solid-js';
import { makeTranslator } from '@/i18n/makeTranslator';
import { settingsTabDict } from './SettingsTab.i18n';
import { useCommunity } from '@/contexts/CommunityContext';
import { CommunitySettings } from '@/components/features/communities/CommunitySettings';

interface SettingsTabProps {
  communityId: string;
}

export const SettingsTab: Component<SettingsTabProps> = (props) => {
  const t = makeTranslator(settingsTabDict, 'settingsTab');
  const { isAdmin } = useCommunity();

  return (
    <Show
      when={isAdmin()}
      fallback={
        <div class="text-center py-8">
          <p class="text-sm text-stone-500 dark:text-stone-400">
            {t('noAccess')}
          </p>
        </div>
      }
    >
      <div class="space-y-4">
        <CommunitySettings communityId={props.communityId} />
      </div>
    </Show>
  );
};

export default SettingsTab;
