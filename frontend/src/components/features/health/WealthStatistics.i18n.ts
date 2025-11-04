export const wealthStatisticsDict = {
  en: {
    wealthStats: {
      // Time range options
      range7d: '7 Days',
      range30d: '30 Days',
      range90d: '90 Days',
      range1y: '1 Year',

      // Overview cards
      openShares: 'Open Shares',
      openSharesSubtitle: 'Currently available',
      totalShares: 'Total Shares',
      totalSharesSubtitle: 'All time',
      activeCategories: 'Active Categories',
      activeCategoriesSubtitle: 'With shares',

      // Chart
      chartTitle: 'Wealth Activity Over Time',
      shares: 'Shares',
      requests: 'Requests',
      fulfilled: 'Fulfilled',
      count: 'Count',

      // Items table
      itemsTableTitle: 'Wealth by Category',
      category: 'Category',
      subcategory: 'Subcategory',
      shareCount: 'Shares',
      valuePoints: 'Value Points',
      trend: 'Trend',
      noData: 'No wealth data available',

      // Errors
      errorLoading: 'Error loading wealth statistics',
      accessDeniedTitle: 'Access Restricted',
      accessDeniedMessage: 'You do not have permission to view wealth analytics. This requires administrator privileges or a sufficient trust score.',
    },
  },
  es: {
    wealthStats: {
      range7d: '7 Días',
      range30d: '30 Días',
      range90d: '90 Días',
      range1y: '1 Año',

      openShares: 'Compartidos Abiertos',
      openSharesSubtitle: 'Actualmente disponible',
      totalShares: 'Total de Compartidos',
      totalSharesSubtitle: 'Todo el tiempo',
      activeCategories: 'Categorías Activas',
      activeCategoriesSubtitle: 'Con compartidos',

      chartTitle: 'Actividad de Riqueza a lo Largo del Tiempo',
      shares: 'Compartidos',
      requests: 'Solicitudes',
      fulfilled: 'Cumplidos',
      count: 'Cantidad',

      itemsTableTitle: 'Riqueza por Categoría',
      category: 'Categoría',
      subcategory: 'Subcategoría',
      shareCount: 'Compartidos',
      valuePoints: 'Puntos de Valor',
      trend: 'Tendencia',
      noData: 'No hay datos de riqueza disponibles',

      errorLoading: 'Error al cargar estadísticas de riqueza',
      accessDeniedTitle: 'Acceso Restringido',
      accessDeniedMessage: 'No tiene permiso para ver análisis de riqueza. Esto requiere privilegios de administrador o una puntuación de confianza suficiente.',
    },
  },
  hi: {
    wealthStats: {
      range7d: '7 दिन',
      range30d: '30 दिन',
      range90d: '90 दिन',
      range1y: '1 वर्ष',

      openShares: 'खुले शेयर',
      openSharesSubtitle: 'वर्तमान में उपलब्ध',
      totalShares: 'कुल शेयर',
      totalSharesSubtitle: 'सभी समय',
      activeCategories: 'सक्रिय श्रेणियाँ',
      activeCategoriesSubtitle: 'शेयरों के साथ',

      chartTitle: 'समय के साथ धन गतिविधि',
      shares: 'शेयर',
      requests: 'अनुरोध',
      fulfilled: 'पूर्ण',
      count: 'गिनती',

      itemsTableTitle: 'श्रेणी के अनुसार धन',
      category: 'श्रेणी',
      subcategory: 'उप-श्रेणी',
      shareCount: 'शेयर',
      valuePoints: 'मूल्य अंक',
      trend: 'प्रवृत्ति',
      noData: 'कोई धन डेटा उपलब्ध नहीं',

      errorLoading: 'धन सांख्यिकी लोड करने में त्रुटि',
      accessDeniedTitle: 'पहुंच प्रतिबंधित',
      accessDeniedMessage: 'आपको धन विश्लेषण देखने की अनुमति नहीं है। इसके लिए प्रशासक विशेषाधिकार या पर्याप्त विश्वास स्कोर की आवश्यकता है।',
    },
  },
} as const;
