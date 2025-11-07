import { createMemo } from 'solid-js';
import { i18nLocale, type Locale } from '@/stores/i18n.store';

// Simple deep getter by path "a.b.c"
function get(obj: any, path: string): any {
  const parts = path.split('.');
  let cur = obj;
  for (const p of parts) {
    if (cur == null) return undefined;
    cur = cur[p];
  }
  return cur;
}

export type Dict = Record<Locale, Record<string, any>>;

/**
 * Creates a reactive translator bound to the global locale.
 * Usage:
 *  const t = makeTranslator(homeDict, 'home');
 *  t('title')
 */
export function makeTranslator(dict: Dict, namespace?: string) {
  const currentDict = createMemo(() => dict[i18nLocale.locale()]);
  return (key: string, fallback?: string): string => {
    const fullKey = namespace ? `${namespace}.${key}` : key;
    const val = get(currentDict(), fullKey);
    if (val == null) {
      // try English as ultimate fallback when missing in active locale
      const alt = get(dict.en, fullKey);
      return (alt ?? fallback ?? fullKey) as string;
    }
    return val as string;
  };
}
