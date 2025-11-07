import { createSignal, createEffect, createRoot } from 'solid-js';

export type Locale = 'en' | 'es' | 'hi';

const STORAGE_KEY = 'app.locale';

const navigatorDefault = ((): Locale => {
  if (typeof navigator !== 'undefined') {
    const lang = navigator.language?.toLowerCase() || '';
    if (lang.startsWith('es')) return 'es';
    if (lang.startsWith('hi')) return 'hi';
  }
  return 'en';
})();

const initial = ((): Locale => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'en' || saved === 'es' || saved === 'hi') return saved;
  } catch {
    // ignore
  }
  return navigatorDefault;
})();

const [locale, setLocale] = createSignal<Locale>(initial);

// Wrap the effect in createRoot to avoid "computations created outside a createRoot" warning
createRoot(() => {
  createEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, locale());
    } catch {
      // ignore
    }
  });
});

export const i18nLocale = {
  locale,
  setLocale: (l: Locale) => setLocale(l),
  supported: ['en', 'es', 'hi'] as const,
};
