import type { Dict } from '@/i18n/makeTranslator';

export const memberRoleEditFormDict: Dict = {
  en: {
    memberRoleEditForm: {
      title: 'Edit Member Role',
      memberName: 'Member',
      selectRole: 'Select Role',
      baseRole: 'Base Role',
      currentRoles: 'Current roles',
      memberRole: 'Member',
      memberDescription: 'Standard community member with basic permissions',
      adminRole: 'Admin',
      adminDescription: 'Full community management and oversight capabilities',
      roleAlreadyAssigned: 'This member already has the selected role',
      updateFailed: 'Failed to update member role',
      featureRoleUpdateFailed: 'Failed to update feature roles',
      saving: 'Saving...',
      saveChanges: 'Save Changes',
      cancel: 'Cancel',
      featureRoles: 'Feature Roles',
      featureRolesActive: '{{count}} active',
      categories: {
        trust: 'Trust',
        wealth: 'Wealth',
        polls: 'Polls',
        disputes: 'Disputes',
        pools: 'Pools',
        councils: 'Councils',
        forum: 'Forum',
        items: 'Items',
        analytics: 'Analytics',
        needs: 'Needs'
      },
      roles: {
        trust_viewer: {
          name: 'Viewer',
          description: 'View trust information'
        },
        trust_granter: {
          name: 'Granter',
          description: 'Award trust to others'
        },
        wealth_viewer: {
          name: 'Viewer',
          description: 'View wealth items'
        },
        wealth_creator: {
          name: 'Creator',
          description: 'Create and share wealth'
        },
        poll_viewer: {
          name: 'Viewer',
          description: 'View polls'
        },
        poll_creator: {
          name: 'Creator',
          description: 'Create polls'
        },
        dispute_viewer: {
          name: 'Viewer',
          description: 'View disputes'
        },
        dispute_handler: {
          name: 'Handler',
          description: 'Handle and resolve disputes'
        },
        pool_viewer: {
          name: 'Viewer',
          description: 'View pools'
        },
        pool_creator: {
          name: 'Creator',
          description: 'Create pools'
        },
        council_viewer: {
          name: 'Viewer',
          description: 'View councils'
        },
        council_creator: {
          name: 'Creator',
          description: 'Create councils'
        },
        forum_viewer: {
          name: 'Viewer',
          description: 'View forum'
        },
        forum_manager: {
          name: 'Manager',
          description: 'Manage forum content'
        },
        thread_creator: {
          name: 'Thread Creator',
          description: 'Create forum threads'
        },
        attachment_uploader: {
          name: 'Attachment Uploader',
          description: 'Upload attachments'
        },
        content_flagger: {
          name: 'Content Flagger',
          description: 'Flag inappropriate content'
        },
        flag_reviewer: {
          name: 'Flag Reviewer',
          description: 'Review flagged content'
        },
        item_viewer: {
          name: 'Viewer',
          description: 'View items'
        },
        item_manager: {
          name: 'Manager',
          description: 'Manage community items'
        },
        analytics_viewer: {
          name: 'Viewer',
          description: 'View analytics'
        },
        needs_viewer: {
          name: 'Viewer',
          description: 'View needs'
        },
        needs_publisher: {
          name: 'Publisher',
          description: 'Publish needs'
        }
      }
    }
  },
  es: {
    memberRoleEditForm: {
      title: 'Editar Rol del Miembro',
      memberName: 'Miembro',
      selectRole: 'Seleccionar Rol',
      baseRole: 'Rol Base',
      currentRoles: 'Roles actuales',
      memberRole: 'Miembro',
      memberDescription: 'Miembro estandar de la comunidad con permisos basicos',
      adminRole: 'Administrador',
      adminDescription: 'Capacidades completas de gestion y supervision de la comunidad',
      roleAlreadyAssigned: 'Este miembro ya tiene el rol seleccionado',
      updateFailed: 'Error al actualizar el rol del miembro',
      featureRoleUpdateFailed: 'Error al actualizar los roles de funcionalidad',
      saving: 'Guardando...',
      saveChanges: 'Guardar Cambios',
      cancel: 'Cancelar',
      featureRoles: 'Roles de Funcionalidad',
      featureRolesActive: '{{count}} activos',
      categories: {
        trust: 'Confianza',
        wealth: 'Riqueza',
        polls: 'Encuestas',
        disputes: 'Disputas',
        pools: 'Fondos',
        councils: 'Consejos',
        forum: 'Foro',
        items: 'Articulos',
        analytics: 'Analiticas',
        needs: 'Necesidades'
      },
      roles: {
        trust_viewer: {
          name: 'Visor',
          description: 'Ver informacion de confianza'
        },
        trust_granter: {
          name: 'Otorgador',
          description: 'Otorgar confianza a otros'
        },
        wealth_viewer: {
          name: 'Visor',
          description: 'Ver articulos de riqueza'
        },
        wealth_creator: {
          name: 'Creador',
          description: 'Crear y compartir riqueza'
        },
        poll_viewer: {
          name: 'Visor',
          description: 'Ver encuestas'
        },
        poll_creator: {
          name: 'Creador',
          description: 'Crear encuestas'
        },
        dispute_viewer: {
          name: 'Visor',
          description: 'Ver disputas'
        },
        dispute_handler: {
          name: 'Manejador',
          description: 'Manejar y resolver disputas'
        },
        pool_viewer: {
          name: 'Visor',
          description: 'Ver fondos'
        },
        pool_creator: {
          name: 'Creador',
          description: 'Crear fondos'
        },
        council_viewer: {
          name: 'Visor',
          description: 'Ver consejos'
        },
        council_creator: {
          name: 'Creador',
          description: 'Crear consejos'
        },
        forum_viewer: {
          name: 'Visor',
          description: 'Ver foro'
        },
        forum_manager: {
          name: 'Gestor',
          description: 'Gestionar contenido del foro'
        },
        thread_creator: {
          name: 'Creador de Hilos',
          description: 'Crear hilos en el foro'
        },
        attachment_uploader: {
          name: 'Cargador de Archivos',
          description: 'Subir archivos adjuntos'
        },
        content_flagger: {
          name: 'Marcador de Contenido',
          description: 'Marcar contenido inapropiado'
        },
        flag_reviewer: {
          name: 'Revisor de Marcas',
          description: 'Revisar contenido marcado'
        },
        item_viewer: {
          name: 'Visor',
          description: 'Ver articulos'
        },
        item_manager: {
          name: 'Gestor',
          description: 'Gestionar articulos de la comunidad'
        },
        analytics_viewer: {
          name: 'Visor',
          description: 'Ver analiticas'
        },
        needs_viewer: {
          name: 'Visor',
          description: 'Ver necesidades'
        },
        needs_publisher: {
          name: 'Publicador',
          description: 'Publicar necesidades'
        }
      }
    }
  },
  hi: {
    memberRoleEditForm: {
      title: 'सदस्य भूमिका संपादित करें',
      memberName: 'सदस्य',
      selectRole: 'भूमिका चुनें',
      baseRole: 'आधार भूमिका',
      currentRoles: 'वर्तमान भूमिकाएं',
      memberRole: 'सदस्य',
      memberDescription: 'बुनियादी अनुमतियों के साथ मानक समुदाय सदस्य',
      adminRole: 'व्यवस्थापक',
      adminDescription: 'पूर्ण समुदाय प्रबंधन और निरीक्षण क्षमताएं',
      roleAlreadyAssigned: 'इस सदस्य के पास पहले से चयनित भूमिका है',
      updateFailed: 'सदस्य भूमिका अपडेट करने में विफल',
      featureRoleUpdateFailed: 'सुविधा भूमिकाएं अपडेट करने में विफल',
      saving: 'सहेजा जा रहा है...',
      saveChanges: 'परिवर्तन सहेजें',
      cancel: 'रद्द करें',
      featureRoles: 'सुविधा भूमिकाएं',
      featureRolesActive: '{{count}} सक्रिय',
      categories: {
        trust: 'विश्वास',
        wealth: 'धन',
        polls: 'मतदान',
        disputes: 'विवाद',
        pools: 'पूल',
        councils: 'परिषद',
        forum: 'फोरम',
        items: 'वस्तुएं',
        analytics: 'विश्लेषण',
        needs: 'आवश्यकताएं'
      },
      roles: {
        trust_viewer: {
          name: 'दर्शक',
          description: 'विश्वास जानकारी देखें'
        },
        trust_granter: {
          name: 'प्रदाता',
          description: 'दूसरों को विश्वास प्रदान करें'
        },
        wealth_viewer: {
          name: 'दर्शक',
          description: 'धन वस्तुएं देखें'
        },
        wealth_creator: {
          name: 'निर्माता',
          description: 'धन बनाएं और साझा करें'
        },
        poll_viewer: {
          name: 'दर्शक',
          description: 'मतदान देखें'
        },
        poll_creator: {
          name: 'निर्माता',
          description: 'मतदान बनाएं'
        },
        dispute_viewer: {
          name: 'दर्शक',
          description: 'विवाद देखें'
        },
        dispute_handler: {
          name: 'संचालक',
          description: 'विवाद संभालें और हल करें'
        },
        pool_viewer: {
          name: 'दर्शक',
          description: 'पूल देखें'
        },
        pool_creator: {
          name: 'निर्माता',
          description: 'पूल बनाएं'
        },
        council_viewer: {
          name: 'दर्शक',
          description: 'परिषद देखें'
        },
        council_creator: {
          name: 'निर्माता',
          description: 'परिषद बनाएं'
        },
        forum_viewer: {
          name: 'दर्शक',
          description: 'फोरम देखें'
        },
        forum_manager: {
          name: 'प्रबंधक',
          description: 'फोरम सामग्री प्रबंधित करें'
        },
        thread_creator: {
          name: 'थ्रेड निर्माता',
          description: 'फोरम थ्रेड बनाएं'
        },
        attachment_uploader: {
          name: 'अटैचमेंट अपलोडर',
          description: 'अटैचमेंट अपलोड करें'
        },
        content_flagger: {
          name: 'सामग्री फ्लैगर',
          description: 'अनुचित सामग्री फ्लैग करें'
        },
        flag_reviewer: {
          name: 'फ्लैग समीक्षक',
          description: 'फ्लैग की गई सामग्री की समीक्षा करें'
        },
        item_viewer: {
          name: 'दर्शक',
          description: 'वस्तुएं देखें'
        },
        item_manager: {
          name: 'प्रबंधक',
          description: 'समुदाय वस्तुएं प्रबंधित करें'
        },
        analytics_viewer: {
          name: 'दर्शक',
          description: 'विश्लेषण देखें'
        },
        needs_viewer: {
          name: 'दर्शक',
          description: 'आवश्यकताएं देखें'
        },
        needs_publisher: {
          name: 'प्रकाशक',
          description: 'आवश्यकताएं प्रकाशित करें'
        }
      }
    }
  }
} as const;
