import type { Dict } from '@/i18n/makeTranslator';

export const inviteItemDict = {
  en: {
    inviteItem: {
      titlePrefix: 'Invite to join as',
      communityIdLabel: 'Community ID',
      createdLabel: 'Created',
      accept: 'Accept',
    },
  },
  es: {
    inviteItem: {
      titlePrefix: 'Invitación para unirse como',
      communityIdLabel: 'ID de la comunidad',
      createdLabel: 'Creado',
      accept: 'Aceptar',
    },
  },
  hi: {
    inviteItem: {
      titlePrefix: 'शामिल होने का निमंत्रण, भूमिका',
      communityIdLabel: 'समुदाय आईडी',
      createdLabel: 'बनाया गया',
      accept: 'स्वीकार करें',
    },
  },
} as const satisfies Dict;
