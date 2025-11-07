export const languageSwitcherDict = {
  en: {
    langSwitcher: {
      label: 'Language:',
      en: 'English',
      es: 'Spanish',
      hi: 'Hindi',
    },
  },
  es: {
    langSwitcher: {
      label: 'Idioma:',
      en: 'Inglés',
      es: 'Español',
      hi: 'Hindi',
    },
  },
  hi: {
    langSwitcher: {
      label: 'भाषा:',
      en: 'अंग्रेज़ी',
      es: 'स्पैनिश',
      hi: 'हिन्दी',
    },
  },
} as const;

export type LanguageSwitcherDict = typeof languageSwitcherDict['en']['langSwitcher'];
