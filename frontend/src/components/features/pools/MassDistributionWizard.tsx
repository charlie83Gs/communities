import { Component, createSignal, Show, For, createMemo, createEffect } from 'solid-js';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Badge } from '@/components/common/Badge';
import { useMassDistribute, useNeedsPreview } from '@/hooks/queries/usePools';
import type { Pool, PoolInventoryItem, FulfillmentStrategy } from '@/types/pools.types';
import { makeTranslator } from '@/i18n/makeTranslator';
import { massDistributionWizardDict } from './MassDistributionWizard.i18n';

interface MassDistributionWizardProps {
  pool: Pool;
  communityId: string;
  inventory: PoolInventoryItem[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const MassDistributionWizard: Component<MassDistributionWizardProps> = (props) => {
  const t = makeTranslator(massDistributionWizardDict, 'massDistributionWizard');

  const [step, setStep] = createSignal<1 | 2>(1);
  const [itemId, setItemId] = createSignal('');
  const [strategy, setStrategy] = createSignal<FulfillmentStrategy>('full');
  const [maxUnitsPerUser, setMaxUnitsPerUser] = createSignal<number | undefined>(props.pool.maxUnitsPerUser);
  const [error, setError] = createSignal<string | null>(null);

  const distributeMutation = useMassDistribute();

  // Fetch needs preview when item is selected
  const needsPreview = useNeedsPreview(
    () => props.communityId,
    () => props.pool.id,
    () => {
      const id = itemId();
      if (!id) return undefined;
      return {
        itemId: id,
        fulfillmentStrategy: strategy(),
        maxUnitsPerUser: maxUnitsPerUser(),
      };
    }
  );

  const selectedItem = createMemo(() => {
    const id = itemId();
    return props.inventory.find((item) => item.itemId === id);
  });

  const totalNeeded = createMemo(() => {
    if (!needsPreview.data) return 0;
    return needsPreview.data
      .filter((n: { priority: string }) => n.priority === 'need')
      .reduce((sum: number, n: { unitsNeeded: number }) => sum + n.unitsNeeded, 0);
  });

  const totalWanted = createMemo(() => {
    if (!needsPreview.data) return 0;
    return needsPreview.data
      .filter((n: { priority: string }) => n.priority === 'want')
      .reduce((sum: number, n: { unitsNeeded: number }) => sum + n.unitsNeeded, 0);
  });

  const resetForm = () => {
    setStep(1);
    setItemId('');
    setStrategy('full');
    setMaxUnitsPerUser(props.pool.maxUnitsPerUser);
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    props.onClose();
  };

  const handleNext = () => {
    setError(null);

    if (!itemId()) {
      setError(t('itemRequired'));
      return;
    }

    setStep(2);
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError(null);

    if (!itemId()) {
      setError(t('itemRequired'));
      return;
    }

    try {
      await distributeMutation.mutateAsync({
        communityId: props.communityId,
        poolId: props.pool.id,
        dto: {
          itemId: itemId(),
          fulfillmentStrategy: strategy(),
          maxUnitsPerUser: maxUnitsPerUser(),
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
      size="lg"
    >
      <div class="space-y-4">
        <p class="text-sm text-stone-600 dark:text-stone-400">{t('subtitle')}</p>

        <Show when={error()}>
          <div class="bg-danger-100 dark:bg-danger-900 text-danger-800 dark:text-danger-200 px-4 py-3 rounded-md text-sm">
            {error()}
          </div>
        </Show>

        {/* Step 1: Configuration */}
        <Show when={step() === 1}>
          <div class="space-y-4">
            {/* Item Selector */}
            <div>
              <label class="block text-sm font-medium mb-1 text-stone-700 dark:text-stone-300">
                {t('itemLabel')} <span class="text-danger-600">*</span>
              </label>
              <select
                class="w-full border rounded-md px-3 py-2 border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                value={itemId()}
                onChange={(e) => setItemId((e.target as HTMLSelectElement).value)}
              >
                <option value="">{t('itemPlaceholder')}</option>
                <For each={props.inventory}>
                  {(item) => (
                    <option value={item.itemId}>
                      {item.itemName} ({item.unitsAvailable} {t('units')})
                    </option>
                  )}
                </For>
              </select>
            </div>

            {/* Strategy */}
            <div>
              <label class="block text-sm font-medium mb-2 text-stone-700 dark:text-stone-300">
                {t('strategyLabel')}
              </label>
              <div class="space-y-2">
                <label class="flex items-start gap-2">
                  <input
                    type="radio"
                    name="strategy"
                    value="full"
                    checked={strategy() === 'full'}
                    onChange={() => setStrategy('full')}
                    class="mt-1 text-ocean-600 focus:ring-ocean-500"
                  />
                  <div>
                    <span class="text-sm font-medium text-stone-900 dark:text-stone-100">{t('full')}</span>
                    <p class="text-xs text-stone-600 dark:text-stone-400">
                      Prioritize meeting full needs before wants
                    </p>
                  </div>
                </label>
                <label class="flex items-start gap-2">
                  <input
                    type="radio"
                    name="strategy"
                    value="partial"
                    checked={strategy() === 'partial'}
                    onChange={() => setStrategy('partial')}
                    class="mt-1 text-ocean-600 focus:ring-ocean-500"
                  />
                  <div>
                    <span class="text-sm font-medium text-stone-900 dark:text-stone-100">{t('partial')}</span>
                    <p class="text-xs text-stone-600 dark:text-stone-400">
                      Distribute up to max limit per user
                    </p>
                  </div>
                </label>
                <label class="flex items-start gap-2">
                  <input
                    type="radio"
                    name="strategy"
                    value="equal"
                    checked={strategy() === 'equal'}
                    onChange={() => setStrategy('equal')}
                    class="mt-1 text-ocean-600 focus:ring-ocean-500"
                  />
                  <div>
                    <span class="text-sm font-medium text-stone-900 dark:text-stone-100">{t('equal')}</span>
                    <p class="text-xs text-stone-600 dark:text-stone-400">
                      Equal distribution to all
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Max Units Per User */}
            <Input
              label={t('maxUnitsLabel')}
              type="number"
              min="1"
              value={maxUnitsPerUser() ?? ''}
              onInput={(e) => {
                const val = (e.target as HTMLInputElement).value;
                setMaxUnitsPerUser(val ? Number(val) : undefined);
              }}
              placeholder={t('maxUnitsPlaceholder')}
            />

            {/* Actions */}
            <div class="flex gap-3 pt-4">
              <Button type="button" onClick={handleNext} disabled={!itemId()}>
                {t('next')}
              </Button>
              <Button type="button" variant="secondary" onClick={handleClose}>
                {t('cancel')}
              </Button>
            </div>
          </div>
        </Show>

        {/* Step 2: Preview */}
        <Show when={step() === 2}>
          <div class="space-y-4">
            <div class="bg-ocean-50 dark:bg-ocean-900 p-4 rounded-md">
              <h3 class="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-3">
                {t('previewTitle')}
              </h3>

              <Show when={needsPreview.isLoading}>
                <p class="text-sm text-stone-600 dark:text-stone-400">{t('loadingNeeds')}</p>
              </Show>

              <Show when={!needsPreview.isLoading}>
                <div class="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p class="text-xs text-stone-600 dark:text-stone-400">{t('totalAvailable')}</p>
                    <p class="text-xl font-bold text-ocean-700 dark:text-ocean-300">
                      {selectedItem()?.unitsAvailable ?? 0}
                    </p>
                  </div>
                  <div>
                    <p class="text-xs text-stone-600 dark:text-stone-400">{t('totalNeeded')}</p>
                    <p class="text-xl font-bold text-stone-900 dark:text-stone-100">
                      {totalNeeded()}
                    </p>
                  </div>
                  <div>
                    <p class="text-xs text-stone-600 dark:text-stone-400">{t('totalWanted')}</p>
                    <p class="text-xl font-bold text-stone-700 dark:text-stone-300">
                      {totalWanted()}
                    </p>
                  </div>
                </div>

                <Show when={(selectedItem()?.unitsAvailable ?? 0) >= totalNeeded()}>
                  <p class="text-sm text-success-700 dark:text-success-300 mb-2">
                    ✓ {t('canFullyMeet')}
                  </p>
                </Show>
                <Show when={(selectedItem()?.unitsAvailable ?? 0) < totalNeeded()}>
                  <p class="text-sm text-warning-700 dark:text-warning-300 mb-2">
                    ⚠ {t('cannotFullyMeet')}
                  </p>
                </Show>
              </Show>
            </div>

            {/* Recipients List */}
            <Show when={needsPreview.data && needsPreview.data.length > 0}>
              <div>
                <h4 class="text-sm font-semibold text-stone-900 dark:text-stone-100 mb-2">
                  {t('recipientsTitle').replace('{count}', String(needsPreview.data!.length))}
                </h4>
                <div class="max-h-64 overflow-y-auto border border-stone-200 dark:border-stone-700 rounded-md">
                  <For each={needsPreview.data}>
                    {(recipient) => (
                      <div class="flex items-center justify-between p-3 border-b border-stone-200 dark:border-stone-700 last:border-b-0">
                        <span class="text-sm font-medium text-stone-900 dark:text-stone-100">
                          {recipient.userName}
                        </span>
                        <div class="flex items-center gap-3">
                          <span class="text-sm text-stone-600 dark:text-stone-400">
                            {recipient.unitsNeeded} {t('units')}
                          </span>
                          <Badge
                            variant={recipient.priority === 'need' ? 'warning' : 'default'}
                            size="sm"
                          >
                            {recipient.priority === 'need' ? t('need') : t('want')}
                          </Badge>
                        </div>
                      </div>
                    )}
                  </For>
                </div>
              </div>
            </Show>

            <Show when={needsPreview.data && needsPreview.data.length === 0}>
              <p class="text-sm text-stone-600 dark:text-stone-400 text-center py-8">
                {t('noNeeds')}
              </p>
            </Show>

            {/* Actions */}
            <div class="flex gap-3 pt-4">
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={distributeMutation.isPending || !needsPreview.data || needsPreview.data.length === 0}
              >
                {distributeMutation.isPending ? t('distributing') : t('submit')}
              </Button>
              <Button type="button" variant="secondary" onClick={() => setStep(1)}>
                {t('back')}
              </Button>
              <Button type="button" variant="secondary" onClick={handleClose}>
                {t('cancel')}
              </Button>
            </div>
          </div>
        </Show>
      </div>
    </Modal>
  );
};
