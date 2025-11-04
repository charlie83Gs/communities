import type { Dict } from '@/i18n/makeTranslator';

export const inviteListDict = {
  en: {
    inviteList: {
      title: 'Pending User Invites',
      loadingInvites: 'Loading invites...',
      thUser: 'User',
      thRole: 'Role',
      thCreated: 'Created',
      thActions: 'Actions',
      cancel: 'Cancel',
      empty: 'No pending user invites.',
      loadingUser: 'Loading user...',
      errorUser: 'Error loading user',
      confirmCancel: 'Cancel invite for {{user}}?',
    },
  },
  es: {
    inviteList: {
      title: 'Invitaciones de usuario pendientes',
      loadingInvites: 'Cargando invitaciones...',
      thUser: 'Usuario',
      thRole: 'Rol',
      thCreated: 'Creado',
      thActions: 'Acciones',
      cancel: 'Cancelar',
      empty: 'No hay invitaciones de usuario pendientes.',
      loadingUser: 'Cargando usuario...',
      errorUser: 'Error al cargar el usuario',
      confirmCancel: '¿Cancelar invitación para {{user}}?',
    },
  },
  hi: {
    inviteList: {
      title: 'लंबित उपयोगकर्ता निमंत्रण',
      loadingInvites: 'निमंत्रण लोड हो रहे हैं...',
      thUser: 'उपयोगकर्ता',
      thRole: 'भूमिका',
      thCreated: 'बनाया गया',
      thActions: 'क्रियाएँ',
      cancel: 'रद्द करें',
      empty: 'कोई लंबित उपयोगकर्ता निमंत्रण नहीं है।',
      loadingUser: 'उपयोगकर्ता लोड हो रहा है...',
      errorUser: 'उपयोगकर्ता लोड करने में त्रुटि',
      confirmCancel: '{{user}} के लिए निमंत्रण रद्द करें?',
    },
  },
} as const satisfies Dict;