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
      heading: 'Dashboard',
      welcome: 'Welcome',
      logout: 'Logout',
      yourInvites: 'Your Invites',
      myCommunities: 'My Communities',
      btnCancel: 'Cancel',
      btnCreateCommunity: 'Create Community',
      creatingOverlay: 'Creating community...',
    },
  },
  es: {
    dashboard: {
      title: 'Panel de Control',
      heading: 'Panel de Control',
      welcome: 'Bienvenido',
      logout: 'Cerrar Sesión',
      yourInvites: 'Tus Invitaciones',
      myCommunities: 'Mis Comunidades',
      btnCancel: 'Cancelar',
      btnCreateCommunity: 'Crear comunidad',
      creatingOverlay: 'Creando comunidad...',
    },
  },
  hi: {
    dashboard: {
      title: 'डैशबोर्ड',
      heading: 'डैशबोर्ड',
      welcome: 'स्वागत है',
      logout: 'लॉगआउट',
      yourInvites: 'आपके निमंत्रण',
      myCommunities: 'मेरे समुदाय',
      btnCancel: 'रद्द करें',
      btnCreateCommunity: 'समुदाय बनाएं',
      creatingOverlay: 'समुदाय बनाया जा रहा है...',
    },
  },
} as const;

export type DashboardDict = typeof dashboardDict['en']['dashboard'];
