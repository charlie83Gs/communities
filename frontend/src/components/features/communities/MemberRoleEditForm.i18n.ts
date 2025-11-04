import type { Dict } from '@/i18n/makeTranslator';

export const memberRoleEditFormDict: Dict = {
  en: {
    memberRoleEditForm: {
      title: 'Edit Member Role',
      memberName: 'Member',
      selectRole: 'Select Role',
      currentRoles: 'Current roles',
      memberRole: 'Member',
      memberDescription: 'Standard community member with basic permissions',
      adminRole: 'Admin',
      adminDescription: 'Full community management and oversight capabilities',
      roleAlreadyAssigned: 'This member already has the selected role',
      updateFailed: 'Failed to update member role',
      saving: 'Saving...',
      saveChanges: 'Save Changes',
      cancel: 'Cancel'
    }
  },
  es: {
    memberRoleEditForm: {
      title: 'Editar Rol del Miembro',
      memberName: 'Miembro',
      selectRole: 'Seleccionar Rol',
      currentRoles: 'Roles actuales',
      memberRole: 'Miembro',
      memberDescription: 'Miembro estándar de la comunidad con permisos básicos',
      adminRole: 'Administrador',
      adminDescription: 'Capacidades completas de gestión y supervisión de la comunidad',
      roleAlreadyAssigned: 'Este miembro ya tiene el rol seleccionado',
      updateFailed: 'Error al actualizar el rol del miembro',
      saving: 'Guardando...',
      saveChanges: 'Guardar Cambios',
      cancel: 'Cancelar'
    }
  },
  hi: {
    memberRoleEditForm: {
      title: 'सदस्य भूमिका संपादित करें',
      memberName: 'सदस्य',
      selectRole: 'भूमिका चुनें',
      currentRoles: 'वर्तमान भूमिकाएं',
      memberRole: 'सदस्य',
      memberDescription: 'बुनियादी अनुमतियों के साथ मानक समुदाय सदस्य',
      adminRole: 'व्यवस्थापक',
      adminDescription: 'पूर्ण समुदाय प्रबंधन और निरीक्षण क्षमताएं',
      roleAlreadyAssigned: 'इस सदस्य के पास पहले से चयनित भूमिका है',
      updateFailed: 'सदस्य भूमिका अपडेट करने में विफल',
      saving: 'सहेजा जा रहा है...',
      saveChanges: 'परिवर्तन सहेजें',
      cancel: 'रद्द करें'
    }
  }
} as const;
