import { Component, createSignal, Show, For, createMemo } from 'solid-js';
import { useCreateItemMutation } from '@/hooks/queries/useItems';
import type { ItemKind, Item, ItemTranslations } from '@/types/items.types';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { makeTranslator } from '@/i18n/makeTranslator';
import { itemsDict } from './items.i18n';
import type { Locale } from '@/stores/i18n.store';
import { i18nLocale } from '@/stores/i18n.store';

interface ItemCreateFormProps {
  communityId: string;
  initialKind?: ItemKind;
  onSuccess: (item: Item) => void;
  onCancel: () => void;
}

const languages: Locale[] = ['en', 'es', 'hi'];

export const ItemCreateForm: Component<ItemCreateFormProps> = (props) => {
  const t = makeTranslator(itemsDict, 'items.createForm');
  const [activeTab, setActiveTab] = createSignal<Locale>(i18nLocale.locale());
  const [translations, setTranslations] = createSignal<ItemTranslations>({});
  const [kind, setKind] = createSignal<ItemKind>(props.initialKind || 'object');
  const [wealthValue, setWealthValue] = createSignal('1.0');
  const [error, setError] = createSignal<string | null>(null);

  const createMutation = useCreateItemMutation();

  const filledLanguagesCount = createMemo(() => {
    const trans = translations();
    return languages.filter(lang => trans[lang]?.name?.trim()).length;
  });

  const validateWealthValue = (value: string): string | null => {
    if (!value || value.trim() === '') {
      return t('errors.wealthValueRequired');
    }

    const pattern = /^\d+(\.\d{1,2})?$/;
    if (!pattern.test(value)) {
      return t('errors.wealthValueInvalid');
    }

    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      return t('errors.wealthValueInvalid');
    }

    if (numValue <= 0) {
      return t('errors.wealthValuePositive');
    }

    if (numValue > 10000) {
      return t('errors.wealthValueMax');
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

    const trans = translations();
    const hasAnyLanguage = languages.some(lang => trans[lang]?.name?.trim());

    if (!hasAnyLanguage) {
      setError(t('errors.atLeastOneLanguage'));
      return;
    }

    // Check name length for each filled language
    for (const lang of languages) {
      if (trans[lang]?.name && trans[lang]!.name.length > 200) {
        setError(t('errors.nameTooLong'));
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

      const result = await createMutation.mutateAsync({
        communityId: props.communityId,
        translations: cleanedTranslations,
        kind: kind(),
        wealthValue: wealthValue(),
      });

      props.onSuccess(result);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to create item');
    }
  };

  return (
    <Card class="p-4">
      <form onSubmit={onSubmit} class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">{t('title')}</h3>
          <span class="text-sm text-stone-500">
            {filledLanguagesCount()}/3 {t('hints.filledLanguages')}
          </span>
        </div>

        <Show when={error()}>
          <div class="text-danger-600 text-sm">{error()}</div>
        </Show>

        {/* Language Tabs */}
        <div>
          <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
            {t('labels.translations')}
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
                    {t(`languageTabs.${lang}`)}
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
            {t('hints.atLeastOne')}
          </p>

          {/* Translation Fields for Active Tab */}
          <For each={languages}>
            {(lang) => (
              <Show when={activeTab() === lang}>
                <div class="space-y-3">
                  <Input
                    label={t('labels.name')}
                    placeholder={t('placeholders.name')}
                    value={translations()[lang]?.name || ''}
                    onInput={(e) => setTranslationField(lang, 'name', (e.target as HTMLInputElement).value)}
                  />
                  <div>
                    <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                      {t('labels.description')}
                    </label>
                    <textarea
                      class="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
                      rows={3}
                      placeholder={t('placeholders.description')}
                      value={translations()[lang]?.description || ''}
                      onInput={(e) => setTranslationField(lang, 'description', (e.target as HTMLTextAreaElement).value)}
                    />
                  </div>
                </div>
              </Show>
            )}
          </For>
        </div>

        <div>
          <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
            {t('labels.kind')}
          </label>
          <select
            class="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100"
            value={kind()}
            onChange={(e) => setKind((e.target as HTMLSelectElement).value as ItemKind)}
          >
            <option value="object">{t('kindOptions.object')}</option>
            <option value="service">{t('kindOptions.service')}</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
            <span class="flex items-center gap-1">
              <span>{t('labels.wealthValue')}</span>
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
            required
          />
          <p class="text-xs text-stone-500 dark:text-stone-400 mt-1">
            {t('hints.wealthValue')}
          </p>
        </div>

        <div class="flex gap-2">
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? t('buttons.creating') : t('buttons.create')}
          </Button>
          <Button type="button" variant="secondary" onClick={props.onCancel}>
            {t('buttons.cancel')}
          </Button>
        </div>
      </form>
    </Card>
  );
};
