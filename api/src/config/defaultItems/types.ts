/**
 * Shared types for default items
 */

export interface DefaultItemTranslation {
  name: string;
  description?: string;
}

export interface DefaultItemTemplate {
  kind: 'object' | 'service';
  wealthValue: number;
  category: string;
  translations: {
    en: DefaultItemTranslation;
    es: DefaultItemTranslation;
    hi: DefaultItemTranslation;
  };
}

export const DEFAULT_ITEM_LANGUAGE = 'en' as const;
export const SUPPORTED_LANGUAGES = ['en', 'es', 'hi'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];
