import type { Dict } from '@/i18n/makeTranslator';

export const myInvitesListDict = {
  en: {
    myInvitesList: {
      loadError: 'Failed to load invites. Please refresh the page.',
      loading: 'Loading invites...',
      empty: 'No pending invites.',
    },
  },
  es: {
    myInvitesList: {
      loadError: 'No se pudieron cargar las invitaciones. Por favor, recarga la página.',
      loading: 'Cargando invitaciones...',
      empty: 'No hay invitaciones pendientes.',
    },
  },
  hi: {
    myInvitesList: {
      loadError: 'निमंत्रण लोड करने में विफल। कृपया पेज को रिफ्रेश करें।',
      loading: 'निमंत्रण लोड हो रहे हैं...',
      empty: 'कोई लंबित निमंत्रण नहीं है।',
    },
  },
} as const satisfies Dict;