import { Component, createSignal, Show, For, createMemo } from 'solid-js';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Textarea } from '@/components/common/Textarea';
import { useManualDistribute } from '@/hooks/queries/usePools';
import type { Pool, PoolInventoryItem } from '@/types/pools.types';
import { makeTranslator } from '@/i18n/makeTranslator';
import { manualDistributionModalDict } from './ManualDistributionModal.i18n';

interface ManualDistributionModalProps {
  pool: Pool;
  communityId: string;
  inventory: PoolInventoryItem[];
  members: Array<{ id: string; username: string; displayName?: string }>;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ManualDistributionModal: Component<ManualDistributionModalProps> = (props) => {
  const t = makeTranslator(manualDistributionModalDict, 'manualDistributionModal');

  const [recipientId, setRecipientId] = createSignal('');
  const [itemId, setItemId] = createSignal('');
  const [units, setUnits] = createSignal<number>(1);
  const [message, setMessage] = createSignal('');
  const [error, setError] = createSignal<string | null>(null);

  const distributeMutation = useManualDistribute();

  const selectedItem = createMemo(() => {
    const id = itemId();
    return props.inventory.find((item) => item.itemId === id);
  });

  const maxAvailable = createMemo(() => {
    const item = selectedItem();
    if (!item) return 0;

    // Check pool's max per user setting
    if (props.pool.maxUnitsPerUser) {
      return Math.min(item.unitsAvailable, props.pool.maxUnitsPerUser);
    }

    return item.unitsAvailable;
  });

  const resetForm = () => {
    setRecipientId('');
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
    if (!recipientId()) {
      setError(t('recipientRequired'));
      return;
    }

    if (!itemId()) {
      setError(t('itemRequired'));
      return;
    }

    if (!units() || units() < 1) {
      setError(t('unitsMin'));
      return;
    }

    const item = selectedItem();
    if (!item) {
      setError(t('itemRequired'));
      return;
    }

    if (units() > item.unitsAvailable) {
      setError(t('unitsMax').replace('{available}', String(item.unitsAvailable)));
      return;
    }

    if (props.pool.maxUnitsPerUser && units() > props.pool.maxUnitsPerUser) {
      setError(t('maxPerUserExceeded').replace('{max}', String(props.pool.maxUnitsPerUser)));
      return;
    }

    try {
      const title = `Distribution from ${props.pool.name}`;
      await distributeMutation.mutateAsync({
        communityId: props.communityId,
        poolId: props.pool.id,
        dto: {
          recipientId: recipientId(),
          itemId: itemId(),
          unitsDistributed: units(),
          title,
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

        {/* Recipient Selector */}
        <div>
          <label class="block text-sm font-medium mb-1 text-stone-700 dark:text-stone-300">
            {t('recipientLabel')} <span class="text-danger-600">*</span>
          </label>
          <select
            class="w-full border rounded-md px-3 py-2 border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
            value={recipientId()}
            onChange={(e) => setRecipientId((e.target as HTMLSelectElement).value)}
            required
          >
            <option value="">{t('recipientPlaceholder')}</option>
            <For each={props.members}>
              {(member) => (
                <option value={member.id}>
                  {member.displayName || member.username}
                </option>
              )}
            </For>
          </select>
        </div>

        {/* Item Selector */}
        <div>
          <label class="block text-sm font-medium mb-1 text-stone-700 dark:text-stone-300">
            {t('itemLabel')} <span class="text-danger-600">*</span>
          </label>
          <Show
            when={props.inventory.length > 0}
            fallback={
              <p class="text-sm text-stone-500 dark:text-stone-400 italic">
                {t('noInventory')}
              </p>
            }
          >
            <select
              class="w-full border rounded-md px-3 py-2 border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
              value={itemId()}
              onChange={(e) => setItemId((e.target as HTMLSelectElement).value)}
              required
            >
              <option value="">{t('itemPlaceholder')}</option>
              <For each={props.inventory}>
                {(item) => (
                  <option value={item.itemId}>
                    {item.itemName} ({item.unitsAvailable} available)
                  </option>
                )}
              </For>
            </select>
          </Show>
        </div>

        {/* Units Input */}
        <Show when={selectedItem()}>
          <div>
            <Input
              label={t('unitsLabel')}
              type="number"
              min="1"
              max={maxAvailable()}
              value={units()}
              onInput={(e) => setUnits(Number((e.target as HTMLInputElement).value))}
              placeholder={t('unitsPlaceholder')}
              required
            />
            <p class="text-xs text-stone-600 dark:text-stone-400 mt-1">
              {t('available').replace('{available}', String(selectedItem()!.unitsAvailable))}
              <Show when={props.pool.maxUnitsPerUser}>
                {' '}(Max per user: {props.pool.maxUnitsPerUser})
              </Show>
            </p>
          </div>
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
            disabled={distributeMutation.isPending || props.inventory.length === 0}
          >
            {distributeMutation.isPending ? t('distributing') : t('submit')}
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
