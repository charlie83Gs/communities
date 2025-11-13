import { Component, createSignal, Show, For, createMemo } from 'solid-js';
import { useUpdateItemMutation } from '@/hooks/queries/useItems';
import type { Item, ItemKind, ItemTranslations } from '@/types/items.types';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { makeTranslator } from '@/i18n/makeTranslator';
import { itemsDict } from './items.i18n';
import type { Locale } from '@/stores/i18n.store';
import { i18nLocale } from '@/stores/i18n.store';

interface ItemEditFormProps {
  item: Item;
  onSuccess: (item: Item) => void;
  onCancel: () => void;
}

const languages: Locale[] = ['en', 'es', 'hi'];

export const ItemEditForm: Component<ItemEditFormProps> = (props) => {
  const t = makeTranslator(itemsDict, 'items.editForm');
  const [activeTab, setActiveTab] = createSignal<Locale>(i18nLocale.locale());
  const [translations, setTranslations] = createSignal<ItemTranslations>(props.item.translations || {});
  const [kind, setKind] = createSignal<ItemKind>(props.item.kind);
  const [wealthValue, setWealthValue] = createSignal(props.item.wealthValue);
  const [error, setError] = createSignal<string | null>(null);

  const updateMutation = useUpdateItemMutation();

  const isDefault = () => props.item.isDefault;

  const filledLanguagesCount = createMemo(() => {
    const trans = translations();
    return languages.filter(lang => trans[lang]?.name?.trim()).length;
  });

  const validateWealthValue = (value: string): string | null => {
    if (!value || value.trim() === '') {
      return t('errors.wealthValueRequired', 'Wealth value is required');
    }

    const pattern = /^\d+(\.\d{1,2})?$/;
    if (!pattern.test(value)) {
      return t('errors.wealthValueInvalid', 'Please enter a valid number (max 2 decimal places)');
    }

    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      return t('errors.wealthValueInvalid', 'Please enter a valid number');
    }

    if (numValue <= 0) {
      return t('errors.wealthValuePositive', 'Wealth value must be greater than 0');
    }

    if (numValue > 10000) {
      return t('errors.wealthValueMax', 'Wealth value cannot exceed 10,000');
    }

    return null;
  };

  const setTranslationField = (lang: Locale, field: 'name' | 'description', value: string) => {
    setTranslations(prev => ({
      ...prev,
      [lang]: {
        ...prev[lang],
        [field]: value,
      },
    }));
  };

  const onSubmit = async (e: Event) => {
    e.preventDefault();
    setError(null);

    if (isDefault()) {
      setError(t('errors.cannotEditDefault'));
      return;
    }

    const trans = translations();
    const hasAnyLanguage = languages.some(lang => trans[lang]?.name?.trim());

    if (!hasAnyLanguage) {
      setError(t('errors.atLeastOneLanguage', 'At least one language must be provided'));
      return;
    }

    // Check name length for each filled language
    for (const lang of languages) {
      if (trans[lang]?.name && trans[lang]!.name.length > 200) {
        setError(t('errors.nameTooLong', 'Name must be 200 characters or less'));
        return;
      }
    }

    const wealthValidationError = validateWealthValue(wealthValue());
    if (wealthValidationError) {
      setError(wealthValidationError);
      return;
    }

    try {
      // Clean up translations - only send languages that have names
      const cleanedTranslations: ItemTranslations = {};
      for (const lang of languages) {
        if (trans[lang]?.name?.trim()) {
          cleanedTranslations[lang] = {
            name: trans[lang]!.name.trim(),
            description: trans[lang]?.description?.trim() || undefined,
          };
        }
      }

      const result = await updateMutation.mutateAsync({
        id: props.item.id,
        data: {
          translations: cleanedTranslations,
          kind: kind(),
          wealthValue: wealthValue(),
        },
      });

      props.onSuccess(result);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to update item');
    }
  };

  return (
    <Card class="p-4">
      <form onSubmit={onSubmit} class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">{t('title')}</h3>
          <Show when={!isDefault()}>
            <span class="text-sm text-stone-500">
              {filledLanguagesCount()}/3 {t('hints.filledLanguages', 'languages filled')}
            </span>
          </Show>
        </div>

        <Show when={isDefault()}>
          <div class="bg-warning-100 text-warning-800 px-4 py-2 rounded-md text-sm">
            {t('defaultItemWarning')}
          </div>
        </Show>

        <Show when={error()}>
          <div class="text-danger-600 text-sm">{error()}</div>
        </Show>

        {/* Language Tabs */}
        <Show when={!isDefault()}>
          <div>
            <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
              {t('labels.translations', 'Translations')}
            </label>
            <div class="flex gap-2 mb-3 border-b border-stone-200 dark:border-stone-700">
              <For each={languages}>
                {(lang) => {
                  const isFilled = () => !!translations()[lang]?.name?.trim();
                  const isActive = () => activeTab() === lang;
                  return (
                    <button
                      type="button"
                      onClick={() => setActiveTab(lang)}
                      class={`px-4 py-2 text-sm font-medium transition-colors relative ${
                        isActive()
                          ? 'text-ocean-600 dark:text-ocean-400'
                          : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
                      }`}
                    >
                      {t(`languageTabs.${lang}`, lang.toUpperCase())}
                      <Show when={isFilled()}>
                        <span class="ml-1 text-success-600">✓</span>
                      </Show>
                      <Show when={isActive()}>
                        <div class="absolute bottom-0 left-0 right-0 h-0.5 bg-ocean-600 dark:bg-ocean-400" />
                      </Show>
                    </button>
                  );
                }}
              </For>
            </div>

            <p class="text-xs text-stone-500 dark:text-stone-400 mb-3">
              {t('hints.atLeastOne', 'At least one language must be filled')}
            </p>

            {/* Translation Fields for Active Tab */}
            <For each={languages}>
              {(lang) => (
                <Show when={activeTab() === lang}>
                  <div class="space-y-3">
                    <Input
                      label={t('labels.name', 'Name')}
                      placeholder={t('placeholders.name', 'e.g., Carrots, Car Repair Service')}
                      value={translations()[lang]?.name || ''}
                      onInput={(e) => setTranslationField(lang, 'name', (e.target as HTMLInputElement).value)}
                    />
                    <div>
                      <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                        {t('labels.description', 'Description')}
                      </label>
                      <textarea
                        class="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                        rows={3}
                        placeholder={t('placeholders.description', 'Optional description')}
                        value={translations()[lang]?.description || ''}
                        onInput={(e) => setTranslationField(lang, 'description', (e.target as HTMLTextAreaElement).value)}
                      />
                    </div>
                  </div>
                </Show>
              )}
            </For>
          </div>
        </Show>

        <div>
          <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
            {t('labels.kind', 'Kind')}
          </label>
          <select
            class="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
            value={kind()}
            onChange={(e) => setKind((e.target as HTMLSelectElement).value as ItemKind)}
            disabled={isDefault()}
          >
            <option value="object">{t('kindOptions.object', 'Object')}</option>
            <option value="service">{t('kindOptions.service', 'Service')}</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
            <span class="flex items-center gap-1">
              <span>{t('labels.wealthValue', 'Wealth Value')}</span>
              <span class="text-lg">📊</span>
            </span>
          </label>
          <Input
            type="number"
            step="0.01"
            min="0.01"
            max="10000"
            placeholder="1.0"
            value={wealthValue()}
            onInput={(e) => {
              setWealthValue((e.target as HTMLInputElement).value);
            }}
            disabled={isDefault()}
            required
          />
          <p class="text-xs text-stone-500 dark:text-stone-400 mt-1">
            {t('hints.wealthValue', 'Numeric value for community wealth statistics (0.01 - 10,000, max 2 decimal places)')}
          </p>
        </div>

        <div class="flex gap-2">
          <Show when={!isDefault()}>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? t('buttons.saving') : t('buttons.save')}
            </Button>
          </Show>
          <Button type="button" variant="secondary" onClick={props.onCancel}>
            {isDefault() ? t('buttons.close') : t('buttons.cancel')}
          </Button>
        </div>
      </form>
    </Card>
  );
};
