/**
 * DisputePrivacyControl Component
 * Location per architecture: /components/features/disputes (feature component)
 */

import { Component, createSignal, Show } from 'solid-js';
import { useUpdateDisputePrivacyMutation } from '@/hooks/queries/useDisputes';
import { Button } from '@/components/common/Button';
import { makeTranslator } from '@/i18n/makeTranslator';
import { disputesDict } from './disputes.i18n';
import type { DisputePrivacyType } from '@/types/dispute.types';

interface DisputePrivacyControlProps {
  communityId: string;
  disputeId: string;
  currentPrivacyType: DisputePrivacyType;
  canUpdatePrivacy: boolean;
}

export const DisputePrivacyControl: Component<DisputePrivacyControlProps> = (props) => {
  const t = makeTranslator(disputesDict, 'disputes');
  const updateMutation = useUpdateDisputePrivacyMutation();
  const [showChangeDialog, setShowChangeDialog] = createSignal(false);

  const getPrivacyLabel = (type: DisputePrivacyType) => {
    return type === 'open' ? t('privacyTypeOpen') : t('privacyTypeAnonymous');
  };

  const getPrivacyColor = (type: DisputePrivacyType) => {
    return type === 'open'
      ? 'bg-sky-100 dark:bg-sky-900 text-sky-800 dark:text-sky-200'
      : 'bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-200';
  };

  const handleChangePrivacy = async () => {
    if (!confirm(t('confirmPrivacyChange'))) {
      setShowChangeDialog(false);
      return;
    }

    const newType: DisputePrivacyType = props.currentPrivacyType === 'open' ? 'anonymous' : 'open';

    try {
      await updateMutation.mutateAsync({
        communityId: props.communityId,
        disputeId: props.disputeId,
        dto: { privacyType: newType },
      });
      setShowChangeDialog(false);
    } catch (err) {
      console.error('Failed to update privacy type:', err);
    }
  };

  return (
    <div class="flex items-center gap-2">
      <span class={`px-3 py-1 rounded-md text-xs font-medium ${getPrivacyColor(props.currentPrivacyType)}`}>
        {getPrivacyLabel(props.currentPrivacyType)}
      </span>

      <Show when={props.canUpdatePrivacy}>
        <Show
          when={!showChangeDialog()}
          fallback={
            <div class="flex items-center gap-2">
              <select
                class="text-xs rounded-md border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:border-ocean-500 focus:ring-ocean-500"
                value={props.currentPrivacyType}
              >
                <option value="open">{t('privacyTypeOpen')}</option>
                <option value="anonymous">{t('privacyTypeAnonymous')}</option>
              </select>
              <Button
                size="sm"
                variant="primary"
                onClick={handleChangePrivacy}
                loading={updateMutation.isPending}
              >
                {t('changePrivacyType')}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setShowChangeDialog(false)}
              >
                {t('cancel')}
              </Button>
            </div>
          }
        >
          <button
            onClick={() => setShowChangeDialog(true)}
            class="text-xs text-ocean-600 dark:text-ocean-400 hover:text-ocean-700 dark:hover:text-ocean-300"
            type="button"
          >
            {t('changePrivacyType')}
          </button>
        </Show>
      </Show>
    </div>
  );
};
