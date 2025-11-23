/**
 * Dashboard page i18n dictionary.
 * Usage inside the page:
 *  const t = makeTranslator(dashboardDict, 'dashboard');
 *  t('title')
 */
export const dashboardDict = {
  en: {
    dashboard: {
      title: 'Dashboard',
      // Header
      header: {
        title: 'Dashboard',
        welcome: 'Welcome back',
      },
      // Tabs (mobile)
      tabs: {
        communities: 'Communities',
        activity: 'Activity',
      },
      // Communities section
      communities: {
        title: 'Communities',
        empty: 'No communities yet',
        members: 'members',
        pending: 'pending',
        incoming: 'in',
        outgoing: 'out',
        searchPlaceholder: 'Search communities...',
      },
      // Activity panel
      activity: {
        needsAttention: 'Needs Attention',
        pendingInvites: 'Pending Invites',
        notifications: 'Notifications',
        noActions: 'No pending actions',
        noInvites: 'No pending invites',
        viewNotification: 'View',
        dismissNotification: 'Dismiss',
      },
      // Action items
      actions: {
        // Incoming requests (to owner)
        incomingRequest: 'requests',
        accept: 'Accept',
        reject: 'Reject',
        accepting: 'Accepting...',
        rejecting: 'Rejecting...',
        // Accepted outgoing (requester needs to confirm)
        acceptedOutgoing: 'Ready for pickup',
        confirmReceipt: 'Confirm',
        markFailed: 'Failed',
        confirming: 'Confirming...',
        marking: 'Marking...',
        // Pool distributions
        poolDistribution: 'from pool',
        // Units
        units: 'units',
        // Tooltips
        tooltips: {
          incoming: 'Incoming wealth request from a member',
          outgoing: 'Your outgoing wealth was accepted',
          pool: 'Pool distribution awaiting your confirmation',
          invite: 'Community invitation pending your response',
        },
      },
      // Invites
      invites: {
        from: 'from',
        acceptInvite: 'Accept',
        declineInvite: 'Decline',
        accepting: 'Accepting...',
        declining: 'Declining...',
      },
      // Footer
      footer: {
        createCommunity: 'Create Community',
        searchCommunities: 'Search',
      },
      // Create community modal
      createModal: {
        title: 'Create Community',
        creating: 'Creating community...',
      },
      // Loading/Error states
      loading: 'Loading...',
      error: 'Failed to load dashboard',
      // Success/Error messages
      messages: {
        acceptSuccess: 'Request accepted',
        acceptError: 'Failed to accept request',
        rejectSuccess: 'Request rejected',
        rejectError: 'Failed to reject request',
        confirmSuccess: 'Receipt confirmed',
        confirmError: 'Failed to confirm receipt',
        failSuccess: 'Marked as failed',
        failError: 'Failed to mark as failed',
        inviteAccepted: 'Invite accepted',
        inviteDeclined: 'Invite declined',
        inviteError: 'Failed to process invite',
      },
    },
  },
  es: {
    dashboard: {
      title: 'Panel',
      header: {
        title: 'Panel',
        welcome: 'Bienvenido de nuevo',
      },
      tabs: {
        communities: 'Comunidades',
        activity: 'Actividad',
      },
      communities: {
        title: 'Comunidades',
        empty: 'Sin comunidades aun',
        members: 'miembros',
        pending: 'pendiente',
        incoming: 'ent',
        outgoing: 'sal',
        searchPlaceholder: 'Buscar comunidades...',
      },
      activity: {
        needsAttention: 'Requiere Atencion',
        pendingInvites: 'Invitaciones Pendientes',
        notifications: 'Notificaciones',
        noActions: 'Sin acciones pendientes',
        noInvites: 'Sin invitaciones pendientes',
        viewNotification: 'Ver',
        dismissNotification: 'Descartar',
      },
      actions: {
        incomingRequest: 'solicitudes',
        accept: 'Aceptar',
        reject: 'Rechazar',
        accepting: 'Aceptando...',
        rejecting: 'Rechazando...',
        acceptedOutgoing: 'Listo para recoger',
        confirmReceipt: 'Confirmar',
        markFailed: 'Fallido',
        confirming: 'Confirmando...',
        marking: 'Marcando...',
        poolDistribution: 'del fondo',
        units: 'unidades',
        tooltips: {
          incoming: 'Solicitud de riqueza entrante de un miembro',
          outgoing: 'Tu riqueza saliente fue aceptada',
          pool: 'Distribucion del fondo esperando tu confirmacion',
          invite: 'Invitacion a comunidad pendiente de tu respuesta',
        },
      },
      invites: {
        from: 'de',
        acceptInvite: 'Aceptar',
        declineInvite: 'Rechazar',
        accepting: 'Aceptando...',
        declining: 'Rechazando...',
      },
      footer: {
        createCommunity: 'Crear Comunidad',
        searchCommunities: 'Buscar',
      },
      createModal: {
        title: 'Crear Comunidad',
        creating: 'Creando comunidad...',
      },
      loading: 'Cargando...',
      error: 'Error al cargar el panel',
      messages: {
        acceptSuccess: 'Solicitud aceptada',
        acceptError: 'Error al aceptar solicitud',
        rejectSuccess: 'Solicitud rechazada',
        rejectError: 'Error al rechazar solicitud',
        confirmSuccess: 'Recepcion confirmada',
        confirmError: 'Error al confirmar recepcion',
        failSuccess: 'Marcado como fallido',
        failError: 'Error al marcar como fallido',
        inviteAccepted: 'Invitacion aceptada',
        inviteDeclined: 'Invitacion rechazada',
        inviteError: 'Error al procesar invitacion',
      },
    },
  },
  hi: {
    dashboard: {
      title: 'डैशबोर्ड',
      header: {
        title: 'डैशबोर्ड',
        welcome: 'वापस स्वागत है',
      },
      tabs: {
        communities: 'समुदाय',
        activity: 'गतिविधि',
      },
      communities: {
        title: 'समुदाय',
        empty: 'अभी कोई समुदाय नहीं',
        members: 'सदस्य',
        pending: 'लंबित',
        incoming: 'अंदर',
        outgoing: 'बाहर',
        searchPlaceholder: 'समुदाय खोजें...',
      },
      activity: {
        needsAttention: 'ध्यान देने योग्य',
        pendingInvites: 'लंबित निमंत्रण',
        notifications: 'सूचनाएं',
        noActions: 'कोई लंबित कार्य नहीं',
        noInvites: 'कोई लंबित निमंत्रण नहीं',
        viewNotification: 'देखें',
        dismissNotification: 'खारिज करें',
      },
      actions: {
        incomingRequest: 'अनुरोध',
        accept: 'स्वीकार करें',
        reject: 'अस्वीकार करें',
        accepting: 'स्वीकार किया जा रहा है...',
        rejecting: 'अस्वीकार किया जा रहा है...',
        acceptedOutgoing: 'लेने के लिए तैयार',
        confirmReceipt: 'पुष्टि करें',
        markFailed: 'असफल',
        confirming: 'पुष्टि की जा रही है...',
        marking: 'चिह्नित किया जा रहा है...',
        poolDistribution: 'पूल से',
        units: 'इकाइयां',
        tooltips: {
          incoming: 'एक सदस्य से आने वाला धन अनुरोध',
          outgoing: 'आपका जाने वाला धन स्वीकार किया गया',
          pool: 'पूल वितरण आपकी पुष्टि की प्रतीक्षा में',
          invite: 'समुदाय निमंत्रण आपकी प्रतिक्रिया की प्रतीक्षा में',
        },
      },
      invites: {
        from: 'से',
        acceptInvite: 'स्वीकार करें',
        declineInvite: 'अस्वीकार करें',
        accepting: 'स्वीकार किया जा रहा है...',
        declining: 'अस्वीकार किया जा रहा है...',
      },
      footer: {
        createCommunity: 'समुदाय बनाएं',
        searchCommunities: 'खोजें',
      },
      createModal: {
        title: 'समुदाय बनाएं',
        creating: 'समुदाय बनाया जा रहा है...',
      },
      loading: 'लोड हो रहा है...',
      error: 'डैशबोर्ड लोड करने में विफल',
      messages: {
        acceptSuccess: 'अनुरोध स्वीकृत',
        acceptError: 'अनुरोध स्वीकार करने में विफल',
        rejectSuccess: 'अनुरोध अस्वीकृत',
        rejectError: 'अनुरोध अस्वीकार करने में विफल',
        confirmSuccess: 'प्राप्ति पुष्टि',
        confirmError: 'प्राप्ति पुष्टि करने में विफल',
        failSuccess: 'असफल के रूप में चिह्नित',
        failError: 'असफल चिह्नित करने में विफल',
        inviteAccepted: 'निमंत्रण स्वीकृत',
        inviteDeclined: 'निमंत्रण अस्वीकृत',
        inviteError: 'निमंत्रण प्रक्रिया में विफल',
      },
    },
  },
} as const;

export type DashboardDict = typeof dashboardDict['en']['dashboard'];
