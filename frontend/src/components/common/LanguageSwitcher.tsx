import { Component } from 'solid-js';
import { i18nLocale } from '@/stores/i18n.store';
import { makeTranslator } from '@/i18n/makeTranslator';
import { languageSwitcherDict } from './LanguageSwitcher.i18n';

export const LanguageSwitcher: Component = () => {
  const { locale, setLocale, supported } = i18nLocale;
  const t = makeTranslator(languageSwitcherDict, 'langSwitcher');

  return (
    <div class="flex items-center gap-2">
      <label class="text-sm text-stone-600">{t('label')}</label>
      <select
        class="border border-stone-300 rounded px-2 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-ocean-500 focus:border-ocean-500"
        value={locale()}
        onInput={(e) => setLocale((e.currentTarget.value as typeof supported[number]))}
      >
        <option value="en">{t('en')}</option>
        <option value="es">{t('es')}</option>
        <option value="hi">{t('hi')}</option>
      </select>
    </div>
  );
};