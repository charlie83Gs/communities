export const communityHealthDict = {
  en: {
    communityHealth: {
      // Page title and meta
      titleTag: 'Community Health Analytics',
      pageTitle: 'Community Health',
      pageDescription: 'View wealth and trust analytics for your community',

      // Loading and errors
      loading: 'Loading...',
      errorPrefix: 'Error:',
      invalidId: 'Invalid community ID',

      // Access control
      accessDeniedTitle: 'Access Restricted',
      accessDeniedMessage: 'You do not have permission to view health analytics. This requires administrator privileges or a sufficient trust score.',

      // Tabs
      wealthTab: 'Wealth Statistics',
      trustTab: 'Trust Statistics',
    },
  },
  es: {
    communityHealth: {
      titleTag: 'Análisis de Salud de la Comunidad',
      pageTitle: 'Salud de la Comunidad',
      pageDescription: 'Ver análisis de riqueza y confianza para su comunidad',

      loading: 'Cargando...',
      errorPrefix: 'Error:',
      invalidId: 'ID de comunidad inválido',

      accessDeniedTitle: 'Acceso Restringido',
      accessDeniedMessage: 'No tiene permiso para ver análisis de salud. Esto requiere privilegios de administrador o una puntuación de confianza suficiente.',

      wealthTab: 'Estadísticas de Riqueza',
      trustTab: 'Estadísticas de Confianza',
    },
  },
  hi: {
    communityHealth: {
      titleTag: 'समुदाय स्वास्थ्य विश्लेषण',
      pageTitle: 'समुदाय स्वास्थ्य',
      pageDescription: 'अपने समुदाय के लिए धन और विश्वास विश्लेषण देखें',

      loading: 'लोड हो रहा है...',
      errorPrefix: 'त्रुटि:',
      invalidId: 'अमान्य समुदाय आईडी',

      accessDeniedTitle: 'पहुंच प्रतिबंधित',
      accessDeniedMessage: 'आपको स्वास्थ्य विश्लेषण देखने की अनुमति नहीं है। इसके लिए प्रशासक विशेषाधिकार या पर्याप्त विश्वास स्कोर की आवश्यकता है।',

      wealthTab: 'धन सांख्यिकी',
      trustTab: 'विश्वास सांख्यिकी',
    },
  },
} as const;
