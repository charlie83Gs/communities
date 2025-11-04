export const trustStatisticsDict = {
  en: {
    trustStats: {
      // Time range options
      range7d: '7 Days',
      range30d: '30 Days',
      range90d: '90 Days',
      range1y: '1 Year',

      // Overview cards
      totalTrust: 'Total Trust',
      totalTrustSubtitle: 'All members combined',
      averageTrust: 'Average Trust',
      averageTrustSubtitle: 'Per member',
      trustPerDay: 'Trust Per Day',
      trustPerDaySubtitle: 'Average daily growth',

      // Chart
      chartTitle: 'Trust Activity Over Time',
      awarded: 'Awarded',
      removed: 'Removed',
      net: 'Net Change',
      trustPoints: 'Trust Points',

      // Distribution table
      distributionTableTitle: 'Trust Level Distribution',
      distributionTableSubtitle: 'Member count by trust level',
      trustLevel: 'Trust Level',
      scoreRange: 'Score Range',
      userCount: 'Members',
      percentage: 'Percentage',
      noData: 'No trust data available',

      // Errors
      errorLoading: 'Error loading trust statistics',
      accessDeniedTitle: 'Access Restricted',
      accessDeniedMessage: 'You do not have permission to view trust analytics. This requires administrator privileges or a sufficient trust score.',
    },
  },
  es: {
    trustStats: {
      range7d: '7 Días',
      range30d: '30 Días',
      range90d: '90 Días',
      range1y: '1 Año',

      totalTrust: 'Confianza Total',
      totalTrustSubtitle: 'Todos los miembros combinados',
      averageTrust: 'Confianza Promedio',
      averageTrustSubtitle: 'Por miembro',
      trustPerDay: 'Confianza por Día',
      trustPerDaySubtitle: 'Crecimiento diario promedio',

      chartTitle: 'Actividad de Confianza a lo Largo del Tiempo',
      awarded: 'Otorgado',
      removed: 'Eliminado',
      net: 'Cambio Neto',
      trustPoints: 'Puntos de Confianza',

      distributionTableTitle: 'Distribución de Nivel de Confianza',
      distributionTableSubtitle: 'Recuento de miembros por nivel de confianza',
      trustLevel: 'Nivel de Confianza',
      scoreRange: 'Rango de Puntuación',
      userCount: 'Miembros',
      percentage: 'Porcentaje',
      noData: 'No hay datos de confianza disponibles',

      errorLoading: 'Error al cargar estadísticas de confianza',
      accessDeniedTitle: 'Acceso Restringido',
      accessDeniedMessage: 'No tiene permiso para ver análisis de confianza. Esto requiere privilegios de administrador o una puntuación de confianza suficiente.',
    },
  },
  hi: {
    trustStats: {
      range7d: '7 दिन',
      range30d: '30 दिन',
      range90d: '90 दिन',
      range1y: '1 वर्ष',

      totalTrust: 'कुल विश्वास',
      totalTrustSubtitle: 'सभी सदस्य संयुक्त',
      averageTrust: 'औसत विश्वास',
      averageTrustSubtitle: 'प्रति सदस्य',
      trustPerDay: 'प्रति दिन विश्वास',
      trustPerDaySubtitle: 'औसत दैनिक वृद्धि',

      chartTitle: 'समय के साथ विश्वास गतिविधि',
      awarded: 'प्रदान किया',
      removed: 'हटाया गया',
      net: 'नेट परिवर्तन',
      trustPoints: 'विश्वास अंक',

      distributionTableTitle: 'विश्वास स्तर वितरण',
      distributionTableSubtitle: 'विश्वास स्तर द्वारा सदस्य गणना',
      trustLevel: 'विश्वास स्तर',
      scoreRange: 'स्कोर रेंज',
      userCount: 'सदस्य',
      percentage: 'प्रतिशत',
      noData: 'कोई विश्वास डेटा उपलब्ध नहीं',

      errorLoading: 'विश्वास सांख्यिकी लोड करने में त्रुटि',
      accessDeniedTitle: 'पहुंच प्रतिबंधित',
      accessDeniedMessage: 'आपको विश्वास विश्लेषण देखने की अनुमति नहीं है। इसके लिए प्रशासक विशेषाधिकार या पर्याप्त विश्वास स्कोर की आवश्यकता है।',
    },
  },
} as const;
