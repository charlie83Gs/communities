import type { Dict } from '@/i18n/makeTranslator';

export const membersListDict: Dict = {
  en: {
    membersList: {
      members: 'Members',
      updating: 'Updating...',
      loadingMembers: 'Loading members...',
      noMembers: 'No members yet.',
      failedToLoad: 'Failed to load members',
      refresh: 'Refresh',
      trustScore: 'Trust Score',
      roleAlreadyExists: 'User already has the {{role}} role',
      updateRoleError: 'Failed to update role. Please try again.',
      editMemberRole: 'Edit Member Role'
    }
  },
  es: {
    membersList: {
      members: 'Miembros',
      updating: 'Actualizando...',
      loadingMembers: 'Cargando miembros...',
      noMembers: 'Aún no hay miembros.',
      failedToLoad: 'Error al cargar miembros',
      refresh: 'Actualizar',
      trustScore: 'Puntuación de Confianza',
      roleAlreadyExists: 'El usuario ya tiene el rol de {{role}}',
      updateRoleError: 'Error al actualizar el rol. Por favor, inténtalo de nuevo.',
      editMemberRole: 'Editar Rol del Miembro'
    }
  },
  hi: {
    membersList: {
      members: 'सदस्य',
      updating: 'अपडेट हो रहा है...',
      loadingMembers: 'सदस्य लोड हो रहे हैं...',
      noMembers: 'अभी तक कोई सदस्य नहीं।',
      failedToLoad: 'सदस्य लोड करने में विफल',
      refresh: 'ताज़ा करें',
      trustScore: 'विश्वास स्कोर',
      roleAlreadyExists: 'उपयोगकर्ता के पास पहले से ही {{role}} भूमिका है',
      updateRoleError: 'भूमिका अपडेट करने में विफल। कृपया पुनः प्रयास करें।',
      editMemberRole: 'सदस्य भूमिका संपादित करें'
    }
  }
} as const;
