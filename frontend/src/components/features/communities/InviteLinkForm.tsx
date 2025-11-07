import { Component, createSignal, Show } from 'solid-js';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { useCreateLinkInviteMutation } from '@/hooks/queries/useCreateLinkInviteMutation';
import type { CreateLinkInviteDto, CommunityInvite } from '@/types/community.types';
import { makeTranslator } from '@/i18n/makeTranslator';
import { inviteLinkFormDict } from './InviteLinkForm.i18n';

interface InviteLinkFormProps {
  communityId: string;
  onSuccess?: () => void;
}

export const InviteLinkForm: Component<InviteLinkFormProps> = (props) => {
  const t = makeTranslator(inviteLinkFormDict, 'inviteLinkForm');

  const tomorrow = new Date(Date.now() + 86400000);
  const [selectedDate, setSelectedDate] = createSignal(tomorrow.toISOString().split('T')[0]);
  const [role, setRole] = createSignal<'member' | 'admin'>('member');
  const [title, setTitle] = createSignal('');
  const inviteMutation = useCreateLinkInviteMutation();

  const handleInvite = () => {
    const data: CreateLinkInviteDto = {
      role: role(),
      title: title() || undefined,
      expiresAt: `${selectedDate()}T23:59:59Z`,
    };
    // variables object must match mutationFn signature
    inviteMutation.mutate({ communityId: props.communityId, data });
  };

  const created = () => inviteMutation.data as CommunityInvite | undefined;

  return (
    <div class="p-4 border border-stone-200 dark:border-stone-700 rounded-lg bg-white dark:bg-stone-800">
      <h3 class="font-semibold mb-4 text-stone-900 dark:text-stone-100">{t('title')}</h3>
      <div class="space-y-3">
        <Input
          label={t('inviteTitleLabel')}
          placeholder={t('inviteTitlePlaceholder')}
          value={title()}
          onInput={(e) => setTitle(e.currentTarget.value)}
        />
        <select
          value={role()}
          onChange={(e) => setRole(e.currentTarget.value as 'member' | 'admin')}
          class="w-full p-2 border border-stone-300 dark:border-stone-600 rounded bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-ocean-500 dark:focus:ring-ocean-400"
        >
          <option value="member">{t('member')}</option>
          <option value="admin">{t('admin')}</option>
        </select>
        <input
          type="date"
          value={selectedDate()}
          min={new Date().toISOString().split('T')[0]}
          onChange={(e) => setSelectedDate(e.currentTarget.value)}
          class="w-full p-2 border border-stone-300 dark:border-stone-600 rounded bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-ocean-500 dark:focus:ring-ocean-400"
        />
        <p class="text-sm text-stone-600 dark:text-stone-400">
          {t('expiresIn').replace('{{days}}', String(Math.ceil((new Date(`${selectedDate()}T23:59:59Z`).getTime() - Date.now()) / 86400000)))}
        </p>
        <Button onClick={handleInvite} disabled={inviteMutation.isPending}>
          {inviteMutation.isPending ? t('generating') : t('generateLink')}
        </Button>
        <Show when={inviteMutation.isError}>
          <p class="text-red-500 dark:text-red-400 text-sm">{t('error').replace('{{message}}', inviteMutation.error?.message || '')}</p>
        </Show>
        <Show when={inviteMutation.isSuccess}>
          <div class="mt-4 p-3 bg-stone-100 dark:bg-stone-700 rounded-lg">
            <p class="text-green-500 dark:text-green-400 text-sm mb-2">{t('success')}</p>
            <Show when={created()?.secret}>
              <code class="block bg-stone-800 dark:bg-stone-900 text-white px-3 py-1 rounded text-sm font-mono break-all">
                {`${window.location.origin}/invite/${created()!.secret}`}
              </code>
            </Show>
          </div>
        </Show>
      </div>
    </div>
  );
};
