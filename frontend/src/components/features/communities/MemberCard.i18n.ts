import type { Dict } from '@/i18n/makeTranslator';

export const memberCardDict: Dict = {
  en: {
    memberCard: {
      role: 'Role',
      trust: 'Trust',
      trustScore: 'Trust Score',
      peerAwards: 'peer awards',
      adminGrant: 'admin grant',
      total: 'total',
      awardTrust: 'Award trust',
      removeTrust: 'Remove trust',
      remove: 'Remove',
      editRole: 'Edit role',
      editRoleTooltip: 'Edit this member\'s role',
      removeTooltip: 'Remove this member from the community'
    }
  },
  es: {
    memberCard: {
      role: 'Rol',
      trust: 'Confianza',
      trustScore: 'Puntuación de Confianza',
      peerAwards: 'premios de pares',
      adminGrant: 'subvención de administrador',
      total: 'total',
      awardTrust: 'Otorgar confianza',
      removeTrust: 'Quitar confianza',
      remove: 'Eliminar',
      editRole: 'Editar rol',
      editRoleTooltip: 'Editar el rol de este miembro',
      removeTooltip: 'Eliminar este miembro de la comunidad'
    }
  },
  hi: {
    memberCard: {
      role: 'भूमिका',
      trust: 'विश्वास',
      trustScore: 'विश्वास स्कोर',
      peerAwards: 'साथी पुरस्कार',
      adminGrant: 'व्यवस्थापक अनुदान',
      total: 'कुल',
      awardTrust: 'विश्वास प्रदान करें',
      removeTrust: 'विश्वास हटाएं',
      remove: 'हटाएं',
      editRole: 'भूमिका संपादित करें',
      editRoleTooltip: 'इस सदस्य की भूमिका संपादित करें',
      removeTooltip: 'इस सदस्य को समुदाय से हटाएं'
    }
  }
} as const;
