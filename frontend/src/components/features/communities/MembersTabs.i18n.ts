import type { Dict } from '@/i18n/makeTranslator';

export const membersTabsDict = {
  en: {
    membersTabs: {
      tabMembers: 'Members',
      tabInvites: 'Invites',
      tabTrustGrants: 'Trust Grants',
      noAccess: 'You do not have access to this section.',
      noAccessMembers: 'You do not have permission to view members in this community.',
      noAccessInvites: 'You do not have permission to manage invites in this community.',
      noAccessTrustGrants: 'You must be an admin to manage trust grants.',
    },
  },
  es: {
    membersTabs: {
      tabMembers: 'Miembros',
      tabInvites: 'Invitaciones',
      tabTrustGrants: 'Subvenciones de Confianza',
      noAccess: 'No tienes acceso a esta sección.',
      noAccessMembers: 'No tienes permiso para ver miembros en esta comunidad.',
      noAccessInvites: 'No tienes permiso para administrar invitaciones en esta comunidad.',
      noAccessTrustGrants: 'Debes ser administrador para administrar subvenciones de confianza.',
    },
  },
  hi: {
    membersTabs: {
      tabMembers: 'सदस्य',
      tabInvites: 'निमंत्रण',
      tabTrustGrants: 'विश्वास अनुदान',
      noAccess: 'आपके पास इस अनुभाग तक पहुंच नहीं है।',
      noAccessMembers: 'आपके पास इस समुदाय में सदस्यों को देखने की अनुमति नहीं है।',
      noAccessInvites: 'आपके पास इस समुदाय में निमंत्रण प्रबंधित करने की अनुमति नहीं है।',
      noAccessTrustGrants: 'विश्वास अनुदान प्रबंधित करने के लिए आपको व्यवस्थापक होना चाहिए।',
    },
  },
} as const satisfies Dict;
