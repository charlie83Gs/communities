import { Component, createSignal, Show, For, createMemo } from 'solid-js';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { ItemSelector } from '@/components/features/items/ItemSelector';
import { useLogContributionMutation } from '@/hooks/queries/useContributions';
import { useSearchItems } from '@/hooks/queries/useItems';
import { useCommunityMembersQuery } from '@/hooks/queries/useCommunityMembersQuery';
import { makeTranslator } from '@/i18n/makeTranslator';
import { logContributionFormDict } from './LogContributionForm.i18n';
import type { LogContributionDto } from '@/types/contributions.types';

interface LogContributionFormProps {
  communityId: string;
  onSuccess?: () => void;
}

export const LogContributionForm: Component<LogContributionFormProps> = (props) => {
  const t = makeTranslator(logContributionFormDict, 'logContributionForm');

  const [itemId, setItemId] = createSignal<string>('');
  const [units, setUnits] = createSignal<number>(1);
  const [description, setDescription] = createSignal<string>('');
  const [selectedBeneficiaries, setSelectedBeneficiaries] = createSignal<string[]>([]);
  const [selectedWitnesses, setSelectedWitnesses] = createSignal<string[]>([]);
  const [showBeneficiarySelector, setShowBeneficiarySelector] = createSignal(false);
  const [showWitnessSelector, setShowWitnessSelector] = createSignal(false);

  const itemsQuery = useSearchItems(() => props.communityId, () => undefined, () => undefined);
  const membersQuery = useCommunityMembersQuery(() => props.communityId);
  const logMutation = useLogContributionMutation();

  const selectedItem = createMemo(() => {
    const items = itemsQuery.data || [];
    return items.find((item) => item.id === itemId());
  });

  const totalValue = createMemo(() => {
    const item = selectedItem();
    return item ? units() * parseFloat(item.wealthValue) : 0;
  });

  const availableMembers = createMemo(() => {
    return membersQuery.data || [];
  });

  const toggleBeneficiary = (userId: string) => {
    setSelectedBeneficiaries((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const toggleWitness = (userId: string) => {
    setSelectedWitnesses((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    if (logMutation.isPending) return;

    const data: LogContributionDto = {
      itemId: itemId(),
      units: units(),
      description: description(),
      beneficiaryIds: selectedBeneficiaries().length > 0 ? selectedBeneficiaries() : undefined,
      witnessIds: selectedWitnesses().length > 0 ? selectedWitnesses() : undefined,
    };

    logMutation.mutate(
      { communityId: props.communityId, data },
      {
        onSuccess: () => {
          // Reset form
          setItemId('');
          setUnits(1);
          setDescription('');
          setSelectedBeneficiaries([]);
          setSelectedWitnesses([]);
          setShowBeneficiarySelector(false);
          setShowWitnessSelector(false);

          if (props.onSuccess) {
            props.onSuccess();
          }
        },
      }
    );
  };

  const isFormValid = createMemo(() => {
    return itemId() !== '' && units() > 0 && description().trim() !== '';
  });

  return (
    <div class="p-6 border border-stone-200 dark:border-stone-700 rounded-lg bg-white dark:bg-stone-800">
      <h3 class="text-lg font-semibold mb-4 text-stone-900 dark:text-stone-100">
        {t('title')}
      </h3>

      <form onSubmit={handleSubmit} class="space-y-4">
        {/* Item Selection */}
        <div>
          <ItemSelector
            communityId={props.communityId}
            selectedItemId={itemId()}
            canManageItems={false}
            onChange={(id) => setItemId(id)}
          />
          <p class="mt-1 text-xs text-stone-600 dark:text-stone-400">
            {t('itemHelp')}
          </p>
        </div>

        {/* Units Input */}
        <div>
          <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
            {t('unitsLabel')}
          </label>
          <Input
            type="number"
            min="0.1"
            step="0.1"
            value={units()}
            onInput={(e) => setUnits(parseFloat(e.currentTarget.value) || 0)}
            required
          />
          <Show when={totalValue() > 0}>
            <p class="mt-1 text-sm text-forest-600 dark:text-forest-400">
              {t('totalValue')}: {totalValue()} {t('valueUnits')}
            </p>
          </Show>
        </div>

        {/* Description */}
        <div>
          <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
            {t('descriptionLabel')}
          </label>
          <textarea
            value={description()}
            onInput={(e) => setDescription(e.currentTarget.value)}
            rows={3}
            class="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-md bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
            placeholder={t('descriptionPlaceholder')}
            required
          />
        </div>

        {/* Beneficiaries Selection */}
        <div>
          <button
            type="button"
            onClick={() => setShowBeneficiarySelector(!showBeneficiarySelector())}
            class="text-sm text-ocean-600 dark:text-ocean-400 hover:underline"
          >
            {showBeneficiarySelector() ? t('hideBeneficiaries') : t('addBeneficiaries')}
          </button>
          <Show when={showBeneficiarySelector()}>
            <div class="mt-2 p-3 border border-stone-200 dark:border-stone-700 rounded-md max-h-48 overflow-y-auto">
              <p class="text-xs text-stone-600 dark:text-stone-400 mb-2">
                {t('beneficiariesHelp')}
              </p>
              <For each={availableMembers()}>
                {(member) => (
                  <label class="flex items-center space-x-2 py-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedBeneficiaries().includes(member.userId)}
                      onChange={() => toggleBeneficiary(member.userId)}
                      class="rounded text-ocean-600 focus:ring-ocean-500"
                    />
                    <span class="text-sm text-stone-900 dark:text-stone-100">
                      {member.displayName || member.email}
                    </span>
                  </label>
                )}
              </For>
            </div>
          </Show>
          <Show when={selectedBeneficiaries().length > 0}>
            <p class="mt-1 text-xs text-stone-600 dark:text-stone-400">
              {selectedBeneficiaries().length} {t('beneficiariesSelected')}
            </p>
          </Show>
        </div>

        {/* Witnesses Selection */}
        <div>
          <button
            type="button"
            onClick={() => setShowWitnessSelector(!showWitnessSelector())}
            class="text-sm text-ocean-600 dark:text-ocean-400 hover:underline"
          >
            {showWitnessSelector() ? t('hideWitnesses') : t('addWitnesses')}
          </button>
          <Show when={showWitnessSelector()}>
            <div class="mt-2 p-3 border border-stone-200 dark:border-stone-700 rounded-md max-h-48 overflow-y-auto">
              <p class="text-xs text-stone-600 dark:text-stone-400 mb-2">
                {t('witnessesHelp')}
              </p>
              <For each={availableMembers()}>
                {(member) => (
                  <label class="flex items-center space-x-2 py-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedWitnesses().includes(member.userId)}
                      onChange={() => toggleWitness(member.userId)}
                      class="rounded text-ocean-600 focus:ring-ocean-500"
                    />
                    <span class="text-sm text-stone-900 dark:text-stone-100">
                      {member.displayName || member.email}
                    </span>
                  </label>
                )}
              </For>
            </div>
          </Show>
          <Show when={selectedWitnesses().length > 0}>
            <p class="mt-1 text-xs text-stone-600 dark:text-stone-400">
              {selectedWitnesses().length} {t('witnessesSelected')}
            </p>
          </Show>
        </div>

        {/* Verification Notice */}
        <div class="bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 rounded-md p-3">
          <p class="text-sm text-sky-800 dark:text-sky-200">
            {t('verificationNotice')}
          </p>
        </div>

        {/* Error Display */}
        <Show when={logMutation.isError}>
          <div class="bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-md p-3">
            <p class="text-sm text-danger-800 dark:text-danger-200">
              {t('errorMessage')}
            </p>
          </div>
        </Show>

        {/* Submit Button */}
        <div class="flex justify-end space-x-3">
          <Button
            type="submit"
            variant="primary"
            disabled={!isFormValid() || logMutation.isPending}
          >
            {logMutation.isPending ? t('submitting') : t('submitButton')}
          </Button>
        </div>
      </form>
    </div>
  );
};
