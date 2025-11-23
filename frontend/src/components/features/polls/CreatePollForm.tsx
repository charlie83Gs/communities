import { Component, createSignal, For, Show } from 'solid-js';
import { useCreatePollMutation } from '@/hooks/queries/usePolls';
import { Button } from '@/components/common/Button';
import { makeTranslator } from '@/i18n/makeTranslator';
import { pollsDict } from './polls.i18n';
import type { PollCreatorType } from '@/types/poll.types';

interface CreatePollFormProps {
  communityId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const CreatePollForm: Component<CreatePollFormProps> = (props) => {
  const t = makeTranslator(pollsDict, 'polls');
  const createPollMutation = useCreatePollMutation();

  const [title, setTitle] = createSignal('');
  const [description, setDescription] = createSignal('');
  const [creatorType, setCreatorType] = createSignal<PollCreatorType>('user');
  const [creatorId, setCreatorId] = createSignal('');
  const [options, setOptions] = createSignal<string[]>(['', '']);
  const [durationValue, setDurationValue] = createSignal(24);
  const [durationUnit, setDurationUnit] = createSignal<'hours' | 'days'>('hours');
  const [error, setError] = createSignal('');

  const addOption = () => {
    setOptions([...options(), '']);
  };

  const removeOption = (index: number) => {
    const newOptions = options().filter((_, i) => i !== index);
    setOptions(newOptions);
  };

  const updateOption = (index: number, value: string) => {
    setOptions((prev) => {
      const newOptions = [...prev];
      newOptions[index] = value;
      return newOptions;
    });
  };

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setError('');

    // Validation
    const validOptions = options().filter((opt) => opt.trim() !== '');
    if (validOptions.length < 2) {
      setError(t('minOptionsError'));
      return;
    }

    const duration = durationUnit() === 'days' ? durationValue() * 24 : durationValue();

    try {
      await createPollMutation.mutateAsync({
        communityId: props.communityId,
        dto: {
          title: title(),
          description: description() || undefined,
          options: validOptions,
          duration,
          creatorType: creatorType(),
          creatorId: creatorId() || undefined,
        },
      });

      // Reset form
      setTitle('');
      setDescription('');
      setCreatorType('user');
      setCreatorId('');
      setOptions(['', '']);
      setDurationValue(24);
      setDurationUnit('hours');

      props.onSuccess?.();
    } catch (err) {
      setError(t('errorMessage'));
    }
  };

  return (
    <form onSubmit={handleSubmit} class="space-y-4">
      <h3 class="text-xl font-semibold text-stone-900 dark:text-stone-100 mb-4">
        {t('createPollTitle')}
      </h3>

      {/* Title */}
      <div>
        <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
          {t('pollTitle')}
        </label>
        <input
          type="text"
          value={title()}
          onInput={(e) => setTitle(e.currentTarget.value)}
          placeholder={t('pollTitlePlaceholder')}
          required
          class="block w-full rounded-md border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-sm focus:border-ocean-500 focus:ring-ocean-500 sm:text-sm"
        />
      </div>

      {/* Description */}
      <div>
        <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
          {t('pollDescription')}
        </label>
        <textarea
          value={description()}
          onInput={(e) => setDescription(e.currentTarget.value)}
          placeholder={t('pollDescriptionPlaceholder')}
          rows={3}
          class="block w-full rounded-md border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-sm focus:border-ocean-500 focus:ring-ocean-500 sm:text-sm"
        />
      </div>

      {/* Creator Type */}
      <div>
        <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
          {t('creatorType')}
        </label>
        <select
          value={creatorType()}
          onChange={(e) => setCreatorType(e.currentTarget.value as PollCreatorType)}
          class="block w-full rounded-md border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-sm focus:border-ocean-500 focus:ring-ocean-500 sm:text-sm"
        >
          <option value="user">{t('creatorTypeUser')}</option>
          <option value="council">{t('creatorTypeCouncil')}</option>
          <option value="pool">{t('creatorTypePool')}</option>
        </select>
      </div>

      {/* Creator ID (for council/pool) */}
      <Show when={creatorType() === 'council' || creatorType() === 'pool'}>
        <div>
          <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
            {creatorType() === 'council' ? t('selectCouncil') : t('selectPool')}
          </label>
          <input
            type="text"
            value={creatorId()}
            onInput={(e) => setCreatorId(e.currentTarget.value)}
            placeholder="Enter ID"
            required
            class="block w-full rounded-md border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-sm focus:border-ocean-500 focus:ring-ocean-500 sm:text-sm"
          />
        </div>
      </Show>

      {/* Options */}
      <div>
        <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
          {t('options')}
        </label>
        <div class="space-y-2">
          <For each={options().map((_, i) => i)} fallback={null}>
            {(index) => (
              <div class="flex gap-2">
                <input
                  type="text"
                  value={options()[index]}
                  onInput={(e) => updateOption(index, e.currentTarget.value)}
                  placeholder={`${t('optionPlaceholder')} ${index + 1}`}
                  class="flex-1 rounded-md border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-sm focus:border-ocean-500 focus:ring-ocean-500 sm:text-sm"
                />
                <Show when={options().length > 2}>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => removeOption(index)}
                  >
                    {t('removeOption')}
                  </Button>
                </Show>
              </div>
            )}
          </For>
        </div>
        <Button type="button" variant="secondary" size="sm" onClick={addOption} class="mt-2">
          {t('addOption')}
        </Button>
      </div>

      {/* Duration */}
      <div>
        <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
          {t('duration')}
        </label>
        <div class="flex gap-2">
          <input
            type="number"
            value={durationValue()}
            onInput={(e) => setDurationValue(parseInt(e.currentTarget.value) || 1)}
            min="1"
            class="flex-1 rounded-md border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-sm focus:border-ocean-500 focus:ring-ocean-500 sm:text-sm"
          />
          <select
            value={durationUnit()}
            onChange={(e) => setDurationUnit(e.currentTarget.value as 'hours' | 'days')}
            class="rounded-md border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-sm focus:border-ocean-500 focus:ring-ocean-500 sm:text-sm"
          >
            <option value="hours">{t('durationHours')}</option>
            <option value="days">{t('durationDays')}</option>
          </select>
        </div>
      </div>

      {/* Error message */}
      <Show when={error()}>
        <div class="text-danger-600 dark:text-danger-400 text-sm">{error()}</div>
      </Show>

      {/* Actions */}
      <div class="flex justify-end gap-2 pt-4">
        <Show when={props.onCancel}>
          <Button type="button" variant="secondary" onClick={props.onCancel}>
            {t('cancel')}
          </Button>
        </Show>
        <Button type="submit" loading={createPollMutation.isPending}>
          {createPollMutation.isPending ? t('creating') : t('submit')}
        </Button>
      </div>
    </form>
  );
};
