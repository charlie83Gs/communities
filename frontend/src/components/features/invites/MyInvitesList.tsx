import { Component, For } from 'solid-js';
import type { MyInvite } from '@/types/user.types';
import InviteItem from './InviteItem';
import { makeTranslator } from '@/i18n/makeTranslator';
import { myInvitesListDict } from './MyInvitesList.i18n';

interface MyInvitesListProps {
  invites: MyInvite[];
  isLoading?: boolean;
  isError?: boolean;
}

const MyInvitesList: Component<MyInvitesListProps> = (props) => {
  const t = makeTranslator(myInvitesListDict, 'myInvitesList');

  const { invites, isLoading = false, isError = false } = props;

  if (isError) {
    return (
      <div class="p-4 text-center">
        <p class="text-red-500">{t('loadError')}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div class="p-4 text-center">
        <p class="text-stone-500 dark:text-stone-400">{t('loading')}</p>
      </div>
    );
  }

  if (invites.length === 0) {
    return (
      <div class="p-4 text-center">
        <p class="text-stone-500 dark:text-stone-400">{t('empty')}</p>
      </div>
    );
  }

  return (
    <div class="space-y-4">
      <For each={invites}>
        {(invite) => <InviteItem invite={invite} />}
      </For>
    </div>
  );
};

export default MyInvitesList;