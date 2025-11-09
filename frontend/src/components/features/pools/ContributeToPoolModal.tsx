import { Component, createSignal, Show } from 'solid-js';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Textarea } from '@/components/common/Textarea';
import { ItemSelector } from '@/components/features/items/ItemSelector';
import { useContributeToPool } from '@/hooks/queries/usePools';
import type { Pool } from '@/types/pools.types';
import { makeTranslator } from '@/i18n/makeTranslator';
import { contributeToPoolModalDict } from './ContributeToPoolModal.i18n';

interface ContributeToPoolModalProps {
  pool: Pool;
  communityId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ContributeToPoolModal: Component<ContributeToPoolModalProps> = (props) => {
  const t = makeTranslator(contributeToPoolModalDict, 'contributeToPoolModal');

  const [itemId, setItemId] = createSignal('');
  const [units, setUnits] = createSignal<number>(1);
  const [message, setMessage] = createSignal('');
  const [error, setError] = createSignal<string | null>(null);

  const contributeMutation = useContributeToPool();

  const resetForm = () => {
    setItemId('');
    setUnits(1);
    setMessage('');
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    props.onClose();
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!itemId()) {
      setError(t('itemRequired'));
      return;
    }

    if (!units() || units() < 1) {
      setError(t('unitsMin'));
      return;
    }

    // Check minimum contribution if set
    if (props.pool.minimumContribution && units() < props.pool.minimumContribution) {
      setError(t('minimumNotMet').replace('{minimum}', String(props.pool.minimumContribution)));
      return;
    }

    try {
      await contributeMutation.mutateAsync({
        communityId: props.communityId,
        poolId: props.pool.id,
        dto: {
          itemId: itemId(),
          unitsOffered: units(),
          message: message().trim() || undefined,
          title: `Contribution to ${props.pool.name}`,
          description: message().trim() || undefined,
        },
      });

      props.onSuccess?.();
      handleClose();
    } catch (err: any) {
      setError(err?.message ?? t('error'));
    }
  };

  return (
    <Modal
      isOpen={props.isOpen}
      onClose={handleClose}
      title={t('title')}
    >
      <form onSubmit={handleSubmit} class="space-y-4">
        <p class="text-sm text-stone-600 dark:text-stone-400">{t('subtitle')}</p>

        <Show when={error()}>
          <div class="bg-danger-100 dark:bg-danger-900 text-danger-800 dark:text-danger-200 px-4 py-3 rounded-md text-sm">
            {error()}
          </div>
        </Show>

        {/* Item Selector */}
        <div>
          <label class="block text-sm font-medium mb-2 text-stone-700 dark:text-stone-300">
            {t('itemLabel')} <span class="text-danger-600">*</span>
          </label>
          <ItemSelector
            communityId={props.communityId}
            selectedItemId={itemId()}
            onChange={(id) => setItemId(id || '')}
            canManageItems={false}
            error={error() && !itemId() ? t('itemRequired') : undefined}
          />
        </div>

        {/* Units Input */}
        <Input
          label={t('unitsLabel')}
          type="number"
          min="1"
          value={units()}
          onInput={(e) => setUnits(Number((e.target as HTMLInputElement).value))}
          placeholder={t('unitsPlaceholder')}
          required
        />

        <Show when={props.pool.minimumContribution}>
          <p class="text-xs text-stone-600 dark:text-stone-400">
            Minimum: {props.pool.minimumContribution} units
          </p>
        </Show>

        {/* Message */}
        <Textarea
          label={t('messageLabel')}
          value={message()}
          onInput={(e) => setMessage((e.target as HTMLTextAreaElement).value)}
          placeholder={t('messagePlaceholder')}
          rows={3}
        />

        {/* Actions */}
        <div class="flex gap-3 pt-4">
          <Button
            type="submit"
            disabled={contributeMutation.isPending}
          >
            {contributeMutation.isPending ? t('contributing') : t('submit')}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
          >
            {t('cancel')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
