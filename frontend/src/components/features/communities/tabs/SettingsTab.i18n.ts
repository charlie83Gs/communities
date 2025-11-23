export const settingsTabDict = {
  en: {
    settingsTab: {
      noAccess: 'Only community administrators can access settings.',
    },
  },
  es: {
    settingsTab: {
      noAccess: 'Solo los administradores de la comunidad pueden acceder a la configuración.',
    },
  },
  hi: {
    settingsTab: {
      noAccess: 'केवल समुदाय प्रशासक ही सेटिंग्स तक पहुंच सकते हैं।',
    },
  },
} as const;

export type SettingsTabDict = typeof settingsTabDict['en']['settingsTab'];
