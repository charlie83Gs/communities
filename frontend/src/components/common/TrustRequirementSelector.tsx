import { Component, createSignal, createEffect, Show, For } from 'solid-js';
import { useTrustLevelsQuery } from '@/hooks/queries/useTrustLevelsQuery';
import type { TrustRequirement } from '@/types/community.types';
import { makeTranslator } from '@/i18n/makeTranslator';
import { trustRequirementSelectorDict } from './TrustRequirementSelector.i18n';

export interface TrustRequirementSelectorProps {
  communityId: string;
  value?: TrustRequirement;
  onChange?: (value: TrustRequirement) => void;
  label?: string;
  error?: string;
}

export const TrustRequirementSelector: Component<TrustRequirementSelectorProps> = (props) => {
  const t = makeTranslator(trustRequirementSelectorDict, 'trustRequirementSelector');

  const [type, setType] = createSignal<'level' | 'number'>(props.value?.type || 'level');
  const [levelValue, setLevelValue] = createSignal<string>(
    props.value?.type === 'level' ? String(props.value.value) : ''
  );
  const [numberValue, setNumberValue] = createSignal<number>(
    props.value?.type === 'number' ? Number(props.value.value) : 0
  );

  const trustLevels = useTrustLevelsQuery(() => props.communityId);

  // Emit changes to parent
  createEffect(() => {
    if (type() === 'level' && levelValue()) {
      props.onChange?.({ type: 'level', value: levelValue() });
    } else if (type() === 'number') {
      props.onChange?.({ type: 'number', value: numberValue() });
    }
  });

  // Compute resolved numeric value for display
  const resolvedValue = () => {
    if (type() === 'number') {
      return numberValue();
    } else if (type() === 'level' && levelValue() && trustLevels.data) {
      const level = trustLevels.data.find((l: { name: string }) => l.name === levelValue());
      return level?.threshold;
    }
    return undefined;
  };

  return (
    <div class="mb-4">
      <Show when={props.label}>
        <label class="block text-sm font-medium text-stone-700 mb-2">{props.label}</label>
      </Show>

      {/* Type selector (radio buttons) */}
      <div class="flex gap-4 mb-3">
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name={`trust-req-type-${props.communityId}`}
            checked={type() === 'level'}
            onChange={() => setType('level')}
            class="text-forest-600 focus:ring-forest-500"
          />
          <span class="text-sm text-stone-700">{t('useTrustLevel')}</span>
        </label>
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name={`trust-req-type-${props.communityId}`}
            checked={type() === 'number'}
            onChange={() => setType('number')}
            class="text-forest-600 focus:ring-forest-500"
          />
          <span class="text-sm text-stone-700">{t('useCustomNumber')}</span>
        </label>
      </div>

      {/* Level dropdown (when type is 'level') */}
      <Show when={type() === 'level'}>
        <Show
          when={!trustLevels.isLoading && trustLevels.data}
          fallback={<p class="text-sm text-stone-500">{t('loading')}</p>}
        >
          <select
            value={levelValue()}
            onChange={(e) => setLevelValue(e.currentTarget.value)}
            class="w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
          >
            <option value="">{t('selectLevel')}</option>
            <For each={trustLevels.data?.sort((a: { threshold: number }, b: { threshold: number }) => a.threshold - b.threshold)}>
              {(level) => (
                <option value={level.name}>
                  {level.name} ({level.threshold}+)
                </option>
              )}
            </For>
          </select>
        </Show>
      </Show>

      {/* Number input (when type is 'number') */}
      <Show when={type() === 'number'}>
        <input
          type="number"
          min="0"
          value={numberValue()}
          onInput={(e) => setNumberValue(parseInt(e.currentTarget.value, 10) || 0)}
          placeholder={t('customThreshold')}
          class="w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
        />
      </Show>

      {/* Resolved value display */}
      <Show when={resolvedValue() !== undefined}>
        <p class="mt-2 text-xs text-stone-600">
          {t('resolvedValue').replace('{{value}}', String(resolvedValue()))}
        </p>
      </Show>

      {/* Error message */}
      <Show when={props.error}>
        <p class="mt-1 text-sm text-danger-600">{props.error}</p>
      </Show>
    </div>
  );
};
