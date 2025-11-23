import type { Dict } from '@/i18n/makeTranslator';

export const skillsBadgeListDict = {
  en: {
    skillsBadgeList: {
      viewAll: 'View all skills',
      noSkills: 'No skills',
      endorsements: 'endorsement',
      endorsements_plural: 'endorsements',
    },
  },
  es: {
    skillsBadgeList: {
      viewAll: 'Ver todas las habilidades',
      noSkills: 'Sin habilidades',
      endorsements: 'endoso',
      endorsements_plural: 'endorsos',
    },
  },
  hi: {
    skillsBadgeList: {
      viewAll: 'सभी कौशल देखें',
      noSkills: 'कोई कौशल नहीं',
      endorsements: 'समर्थन',
      endorsements_plural: 'समर्थन',
    },
  },
} as const satisfies Dict;
