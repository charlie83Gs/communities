import { Component, createSignal, Show, For, createMemo, createEffect } from 'solid-js';
import { useCreateConsumptionMutation } from '@/hooks/queries/useConsumptions';
import { useCouncilPoolsQuery } from '@/hooks/queries/useCouncils';
import { usePool } from '@/hooks/queries/usePools';
import { useUsageReportsQuery } from '@/hooks/queries/useUsageReports';
import { Button } from '@/components/common/Button';
import { Icon } from '@/components/common/Icon';
import { makeTranslator } from '@/i18n/makeTranslator';
import { createConsumptionDict } from './CreateConsumptionModal.i18n';

interface CreateConsumptionModalProps {
  communityId: string;
  councilId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const CreateConsumptionModal: Component<CreateConsumptionModalProps> = (props) => {
  const t = makeTranslator(createConsumptionDict, 'createConsumption');

  const [selectedPoolId, setSelectedPoolId] = createSignal('');
  const [selectedItemId, setSelectedItemId] = createSignal('');
  const [units, setUnits] = createSignal(1);
  const [description, setDescription] = createSignal('');
  const [selectedReportId, setSelectedReportId] = createSignal('');
  const [error, setError] = createSignal('');

  const createMutation = useCreateConsumptionMutation();

  // Fetch pools for this council
  const poolsQuery = useCouncilPoolsQuery(
    () => props.communityId,
    () => props.councilId
  );

  // Fetch selected pool details (with inventory)
  const selectedPool = usePool(
    () => props.communityId,
    () => selectedPoolId() || undefined
  );

  // Fetch reports for linking
  const reportsQuery = useUsageReportsQuery(
    () => props.communityId,
    () => props.councilId
  );

  // Get available items from selected pool inventory
  const availableItems = createMemo(() => {
    const pool = selectedPool.data;
    if (!pool?.inventory) return [];
    return pool.inventory.filter((item) => item.unitsAvailable > 0);
  });

  // Get max units for selected item
  const maxUnits = createMemo(() => {
    const itemId = selectedItemId();
    if (!itemId) return 0;
    const item = availableItems().find((i) => i.itemId === itemId);
    return item?.unitsAvailable || 0;
  });

  // Reset item selection when pool changes
  createEffect(() => {
    const pool = selectedPoolId();
    if (pool) {
      setSelectedItemId('');
      setUnits(1);
    }
  });

  const resetForm = () => {
    setSelectedPoolId('');
    setSelectedItemId('');
    setUnits(1);
    setDescription('');
    setSelectedReportId('');
    setError('');
  };

  const handleClose = () => {
    resetForm();
    props.onClose();
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError('');

    const poolId = selectedPoolId();
    const itemId = selectedItemId();
    const unitsValue = units();
    const descValue = description().trim();

    if (!poolId) {
      setError(t('required'));
      return;
    }
    if (!itemId) {
      setError(t('required'));
      return;
    }
    if (!descValue) {
      setError(t('required'));
      return;
    }
    if (unitsValue > maxUnits()) {
      setError(t('exceedsAvailable'));
      return;
    }

    try {
      await createMutation.mutateAsync({
        communityId: props.communityId,
        councilId: props.councilId,
        dto: {
          poolId,
          itemId,
          units: unitsValue,
          description: descValue,
          reportId: selectedReportId() || undefined,
        },
      });
      handleClose();
    } catch (err) {
      console.error('Failed to create consumption:', err);
      setError(t('error'));
    }
  };

  return (
    <Show when={props.isOpen}>
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div class="bg-white dark:bg-stone-900 rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl">
          {/* Header */}
          <div class="sticky top-0 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-700 p-6 z-10">
            <div class="flex justify-between items-start">
              <div>
                <h2 class="text-xl font-bold text-stone-900 dark:text-stone-100">
                  {t('title')}
                </h2>
                <p class="text-sm text-stone-600 dark:text-stone-400 mt-1">
                  {t('subtitle')}
                </p>
              </div>
              <button
                onClick={handleClose}
                class="text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-300"
              >
                <Icon name="close" size={20} />
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} class="p-6 space-y-4">
            <Show when={error()}>
              <div class="p-3 bg-danger-50 dark:bg-danger-900/20 text-danger-800 dark:text-danger-200 rounded-md text-sm">
                {error()}
              </div>
            </Show>

            {/* Pool Selection */}
            <div>
              <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                {t('selectPool')} <span class="text-danger-600">*</span>
              </label>
              <select
                value={selectedPoolId()}
                onChange={(e) => setSelectedPoolId(e.currentTarget.value)}
                class="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded-md focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                disabled={poolsQuery.isLoading}
              >
                <option value="">{t('selectPoolPlaceholder')}</option>
                <For each={poolsQuery.data?.pools || []}>
                  {(pool) => <option value={pool.id}>{pool.name}</option>}
                </For>
              </select>
              <Show when={poolsQuery.data?.pools.length === 0}>
                <p class="text-sm text-stone-500 dark:text-stone-400 mt-1">
                  {t('noPoolsAvailable')}
                </p>
              </Show>
            </div>

            {/* Item Selection */}
            <div>
              <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                {t('selectItem')} <span class="text-danger-600">*</span>
              </label>
              <select
                value={selectedItemId()}
                onChange={(e) => setSelectedItemId(e.currentTarget.value)}
                class="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded-md focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                disabled={!selectedPoolId() || selectedPool.isLoading}
              >
                <option value="">{t('selectItemPlaceholder')}</option>
                <For each={availableItems()}>
                  {(item) => (
                    <option value={item.itemId}>
                      {item.itemName} ({item.unitsAvailable} {t('available')})
                    </option>
                  )}
                </For>
              </select>
              <Show when={selectedPoolId() && availableItems().length === 0 && !selectedPool.isLoading}>
                <p class="text-sm text-stone-500 dark:text-stone-400 mt-1">
                  {t('noItemsInPool')}
                </p>
              </Show>
            </div>

            {/* Units */}
            <div>
              <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                {t('units')} <span class="text-danger-600">*</span>
              </label>
              <div class="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max={maxUnits()}
                  value={units()}
                  onInput={(e) => setUnits(Math.max(1, parseInt(e.currentTarget.value) || 1))}
                  placeholder={t('unitsPlaceholder')}
                  class="flex-1 px-3 py-2 border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded-md focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
                  disabled={!selectedItemId()}
                />
                <Show when={selectedItemId() && maxUnits() > 0}>
                  <span class="text-sm text-stone-500 dark:text-stone-400">
                    / {maxUnits()} {t('available')}
                  </span>
                </Show>
              </div>
            </div>

            {/* Description */}
            <div>
              <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                {t('description')} <span class="text-danger-600">*</span>
              </label>
              <textarea
                value={description()}
                onInput={(e) => setDescription(e.currentTarget.value)}
                placeholder={t('descriptionPlaceholder')}
                rows={3}
                class="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded-md focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 resize-vertical"
              />
            </div>

            {/* Link to Report (optional) */}
            <div>
              <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                {t('linkToReport')}
              </label>
              <select
                value={selectedReportId()}
                onChange={(e) => setSelectedReportId(e.currentTarget.value)}
                class="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded-md focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
              >
                <option value="">{t('noReport')}</option>
                <For each={reportsQuery.data?.reports || []}>
                  {(report) => <option value={report.id}>{report.title}</option>}
                </For>
              </select>
            </div>

            {/* Actions */}
            <div class="flex justify-end gap-3 pt-4 border-t border-stone-200 dark:border-stone-700">
              <Button type="button" variant="secondary" onClick={handleClose}>
                {t('cancel')}
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={createMutation.isPending}
                disabled={!selectedPoolId() || !selectedItemId() || !description().trim()}
              >
                {createMutation.isPending ? t('submitting') : t('submit')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </Show>
  );
};
