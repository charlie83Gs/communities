import type { Dict } from '@/i18n/makeTranslator';

export const membersTabDict = {
  en: {
    membersTab: {
      // Sub-tab labels
      tabAllMembers: 'All Members',
      tabInvites: 'Invites',
      tabTrustGrants: 'Trust Grants',
      tabCouncils: 'Councils',

      // Search
      searchPlaceholder: 'Search members...',
      inviteMember: 'Invite Member',

      // Member cards
      memberRole: 'Role',
      memberTrust: 'Trust',
      noMembers: 'No members found',
      loadingMembers: 'Loading members...',

      // Tab tooltips
      membersTooltip: 'View all community members with their trust scores and roles',
      invitesTooltip: 'Manage pending invitations and create invite links for new members',
      trustGrantsTooltip: 'Admin-granted trust scores that bootstrap new members (separate from peer trust)',
      councilsTooltip: 'Specialized groups that can hold resources, make decisions, or represent specific functions',
      createCouncil: 'Create Council',
      noCouncils: 'No councils found',

      // Access messages
      noAccess: 'You do not have access to this section.',
      noAccessMembers: 'You do not have permission to view members in this community.',
      noAccessInvites: 'You do not have permission to manage invites in this community.',
      noAccessTrustGrants: 'You must be an admin to manage trust grants.',
      noAccessCouncils: 'You do not have permission to view councils.',

      // Invite sub-tab
      inviteUserTitle: 'Invite User',
      inviteLinkTitle: 'Create Invite Link',
      pendingInvites: 'Pending Invites',
      inviteLinks: 'Invite Links',
    },
  },
  es: {
    membersTab: {
      // Sub-tab labels
      tabAllMembers: 'Todos los Miembros',
      tabInvites: 'Invitaciones',
      tabTrustGrants: 'Subvenciones de Confianza',
      tabCouncils: 'Consejos',

      // Search
      searchPlaceholder: 'Buscar miembros...',
      inviteMember: 'Invitar Miembro',

      // Member cards
      memberRole: 'Rol',
      memberTrust: 'Confianza',
      noMembers: 'No se encontraron miembros',
      loadingMembers: 'Cargando miembros...',

      // Tab tooltips
      membersTooltip: 'Ver todos los miembros de la comunidad con sus puntuaciones de confianza y roles',
      invitesTooltip: 'Gestionar invitaciones pendientes y crear enlaces de invitación para nuevos miembros',
      trustGrantsTooltip: 'Puntuaciones de confianza otorgadas por admin que inician nuevos miembros (separadas de la confianza entre pares)',
      councilsTooltip: 'Grupos especializados que pueden mantener recursos, tomar decisiones o representar funciones específicas',
      createCouncil: 'Crear Consejo',
      noCouncils: 'No se encontraron consejos',

      // Access messages
      noAccess: 'No tienes acceso a esta seccion.',
      noAccessMembers: 'No tienes permiso para ver miembros en esta comunidad.',
      noAccessInvites: 'No tienes permiso para administrar invitaciones en esta comunidad.',
      noAccessTrustGrants: 'Debes ser administrador para administrar subvenciones de confianza.',
      noAccessCouncils: 'No tienes permiso para ver consejos.',

      // Invite sub-tab
      inviteUserTitle: 'Invitar Usuario',
      inviteLinkTitle: 'Crear Enlace de Invitacion',
      pendingInvites: 'Invitaciones Pendientes',
      inviteLinks: 'Enlaces de Invitacion',
    },
  },
  hi: {
    membersTab: {
      // Sub-tab labels
      tabAllMembers: 'सभी सदस्य',
      tabInvites: 'निमंत्रण',
      tabTrustGrants: 'विश्वास अनुदान',
      tabCouncils: 'परिषदें',

      // Search
      searchPlaceholder: 'सदस्य खोजें...',
      inviteMember: 'सदस्य आमंत्रित करें',

      // Member cards
      memberRole: 'भूमिका',
      memberTrust: 'विश्वास',
      noMembers: 'कोई सदस्य नहीं मिला',
      loadingMembers: 'सदस्य लोड हो रहे हैं...',

      // Tab tooltips
      membersTooltip: 'सभी समुदाय सदस्यों को उनके विश्वास स्कोर और भूमिकाओं के साथ देखें',
      invitesTooltip: 'लंबित निमंत्रणों को प्रबंधित करें और नए सदस्यों के लिए निमंत्रण लिंक बनाएं',
      trustGrantsTooltip: 'एडमिन-प्रदत्त विश्वास स्कोर जो नए सदस्यों को शुरू करते हैं (सहकर्मी विश्वास से अलग)',
      councilsTooltip: 'विशेष समूह जो संसाधन रख सकते हैं, निर्णय ले सकते हैं, या विशिष्ट कार्यों का प्रतिनिधित्व कर सकते हैं',
      createCouncil: 'परिषद बनाएं',
      noCouncils: 'कोई परिषद नहीं मिली',

      // Access messages
      noAccess: 'आपके पास इस अनुभाग तक पहुंच नहीं है।',
      noAccessMembers: 'आपके पास इस समुदाय में सदस्यों को देखने की अनुमति नहीं है।',
      noAccessInvites: 'आपके पास इस समुदाय में निमंत्रण प्रबंधित करने की अनुमति नहीं है।',
      noAccessTrustGrants: 'विश्वास अनुदान प्रबंधित करने के लिए आपको व्यवस्थापक होना चाहिए।',
      noAccessCouncils: 'आपके पास परिषदें देखने की अनुमति नहीं है।',

      // Invite sub-tab
      inviteUserTitle: 'उपयोगकर्ता आमंत्रित करें',
      inviteLinkTitle: 'निमंत्रण लिंक बनाएं',
      pendingInvites: 'लंबित निमंत्रण',
      inviteLinks: 'निमंत्रण लिंक',
    },
  },
} as const satisfies Dict;
