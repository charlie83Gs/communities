import type { Dict } from '@/i18n/makeTranslator';

export const inviteCreatePanelDict = {
  en: {
    inviteCreatePanel: {
      title: 'Create Invite',
      tabDirectUser: 'Direct User',
      tabShareLink: 'Share Link',
    },
  },
  es: {
    inviteCreatePanel: {
      title: 'Crear Invitacion',
      tabDirectUser: 'Usuario Directo',
      tabShareLink: 'Compartir Enlace',
    },
  },
  hi: {
    inviteCreatePanel: {
      title: 'निमंत्रण बनाएं',
      tabDirectUser: 'सीधे उपयोगकर्ता',
      tabShareLink: 'लिंक साझा करें',
    },
  },
} as const satisfies Dict;
