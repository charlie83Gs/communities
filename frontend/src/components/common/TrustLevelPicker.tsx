import { Component, createSignal, createEffect, Show, For } from 'solid-js';
import { useTrustLevelsQuery } from '@/hooks/queries/useTrustLevelsQuery';
import type { TrustLevelPickerValue } from '@/types/community.types';
import { makeTranslator } from '@/i18n/makeTranslator';
import { trustLevelPickerDict } from './TrustLevelPicker.i18n';

export interface TrustLevelPickerProps {
  communityId: string;
  value: TrustLevelPickerValue;
  onChange: (value: TrustLevelPickerValue) => void;
  label?: string;
  description?: string;
  error?: string;
}

export const TrustLevelPicker: Component<TrustLevelPickerProps> = (props) => {
  const t = makeTranslator(trustLevelPickerDict, 'trustLevelPicker');

  const [mode, setMode] = createSignal<'level' | 'custom'>(
    props.value.levelId ? 'level' : 'custom'
  );
  const [selectedLevelId, setSelectedLevelId] = createSignal<string>(
    props.value.levelId || ''
  );
  const [customValue, setCustomValue] = createSignal<number>(
    props.value.customValue
  );

  const trustLevels = useTrustLevelsQuery(() => props.communityId);

  // Update internal state when props change
  createEffect(() => {
    const newValue = props.value;
    if (newValue.levelId) {
      setMode('level');
      setSelectedLevelId(newValue.levelId);
    } else {
      setMode('custom');
    }
    setCustomValue(newValue.customValue);
  });

  // Emit changes to parent
  createEffect(() => {
    const currentMode = mode();
    const levelId = selectedLevelId();
    const custom = customValue();

    if (currentMode === 'level' && levelId && trustLevels.data) {
      // Find the selected level's threshold
      const level = trustLevels.data.find((l: { id: string }) => l.id === levelId);
      if (level) {
        props.onChange({
          customValue: level.threshold,
          levelId: levelId,
        });
      }
    } else if (currentMode === 'custom') {
      props.onChange({
        customValue: custom,
        levelId: undefined,
      });
    }
  });

  const handleModeChange = (newMode: 'level' | 'custom') => {
    setMode(newMode);
    if (newMode === 'level') {
      // When switching to level mode, select the first level if none selected
      if (!selectedLevelId() && trustLevels.data && trustLevels.data.length > 0) {
        setSelectedLevelId(trustLevels.data[0].id);
      }
    }
  };

  const handleLevelChange = (levelId: string) => {
    setSelectedLevelId(levelId);
  };

  const handleCustomChange = (value: number) => {
    setCustomValue(value);
  };

  // Get display text for the current selection
  const displayText = () => {
    if (mode() === 'level' && selectedLevelId() && trustLevels.data) {
      const level = trustLevels.data.find((l: { id: string }) => l.id === selectedLevelId());
      if (level) {
        return `${level.name} (${level.threshold})`;
      }
    }
    return `${t('custom')} (${customValue()})`;
  };

  return (
    <div class="mb-4">
      <Show when={props.label}>
        <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
          {props.label}
        </label>
      </Show>

      <Show when={props.description}>
        <p class="text-xs text-stone-600 dark:text-stone-400 mb-2">{props.description}</p>
      </Show>

      {/* Mode selector (checkbox) */}
      <div class="mb-3">
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={mode() === 'level'}
            onChange={(e) => handleModeChange(e.currentTarget.checked ? 'level' : 'custom')}
            class="text-forest-600 focus:ring-forest-500 rounded"
          />
          <span class="text-sm text-stone-700 dark:text-stone-300">{t('useTrustLevels')}</span>
        </label>
      </div>

      {/* Level dropdown (when mode is 'level') */}
      <Show when={mode() === 'level'}>
        <Show
          when={!trustLevels.isLoading && trustLevels.data}
          fallback={<p class="text-sm text-stone-500 dark:text-stone-400">{t('loading')}</p>}
        >
          <select
            value={selectedLevelId()}
            onChange={(e) => handleLevelChange(e.currentTarget.value)}
            class="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
          >
            <option value="">{t('selectLevel')}</option>
            <For each={trustLevels.data?.sort((a: { threshold: number }, b: { threshold: number }) => a.threshold - b.threshold)}>
              {(level) => (
                <option value={level.id}>
                  {level.name} ({level.threshold}+)
                </option>
              )}
            </For>
          </select>
        </Show>
      </Show>

      {/* Number input (when mode is 'custom') */}
      <Show when={mode() === 'custom'}>
        <input
          type="number"
          min="0"
          value={customValue()}
          onInput={(e) => handleCustomChange(parseInt(e.currentTarget.value, 10) || 0)}
          placeholder={t('customPlaceholder')}
          class="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
        />
      </Show>

      {/* Display current value */}
      <Show when={mode() === 'level' || customValue() >= 0}>
        <p class="mt-2 text-xs text-stone-600 dark:text-stone-400">
          {t('currentValue').replace('{{value}}', displayText())}
        </p>
      </Show>

      {/* Error message */}
      <Show when={props.error}>
        <p class="mt-1 text-sm text-danger-600 dark:text-danger-400">{props.error}</p>
      </Show>
    </div>
  );
};
