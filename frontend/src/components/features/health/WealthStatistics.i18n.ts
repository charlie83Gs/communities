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

      // Charts
      openSharesChartTitle: 'Open Shares Over Time',
      openSharesLine: 'Open Shares',
      requestsChartTitle: 'Daily Requests & Fulfilled',
      requests: 'Requests',
      fulfilled: 'Fulfilled',
      count: 'Count',
      valueContributedChartTitle: 'Value Contributed Over Time',
      valueContributedLine: 'Value Points',
      valuePointsLabel: 'Value Points',

      // Items table
      itemsTableTitle: 'Wealth by Category',
      category: 'Category',
      subcategory: 'Subcategory',
      shareCount: 'Shares',
      valuePoints: 'Value Points',
      trend: 'Trend',
      noData: 'No wealth data available',

      // Aggregated section
      aggregatedTitle: 'Aggregated Wealth Shares',
      aggregatedDescription: 'Total active shares for each item across the community',
      activeSharesColumn: 'Active Shares',
      totalQuantityColumn: 'Total Quantity',
      sharersColumn: 'Sharers',
      valuePointsColumn: 'Value Points',
      noActiveShares: 'No active wealth shares in the community',

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

      openSharesChartTitle: 'Compartidos Abiertos a lo Largo del Tiempo',
      openSharesLine: 'Compartidos Abiertos',
      requestsChartTitle: 'Solicitudes y Cumplidos Diarios',
      requests: 'Solicitudes',
      fulfilled: 'Cumplidos',
      count: 'Cantidad',
      valueContributedChartTitle: 'Valor Contribuido a lo Largo del Tiempo',
      valueContributedLine: 'Puntos de Valor',
      valuePointsLabel: 'Puntos de Valor',

      itemsTableTitle: 'Riqueza por Categoría',
      category: 'Categoría',
      subcategory: 'Subcategoría',
      shareCount: 'Compartidos',
      valuePoints: 'Puntos de Valor',
      trend: 'Tendencia',
      noData: 'No hay datos de riqueza disponibles',

      aggregatedTitle: 'Compartidos de Riqueza Agregados',
      aggregatedDescription: 'Total de compartidos activos para cada artículo en la comunidad',
      activeSharesColumn: 'Compartidos Activos',
      totalQuantityColumn: 'Cantidad Total',
      sharersColumn: 'Compartidores',
      valuePointsColumn: 'Puntos de Valor',
      noActiveShares: 'No hay compartidos de riqueza activos en la comunidad',

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

      openSharesChartTitle: 'समय के साथ खुले शेयर',
      openSharesLine: 'खुले शेयर',
      requestsChartTitle: 'दैनिक अनुरोध और पूर्ण',
      requests: 'अनुरोध',
      fulfilled: 'पूर्ण',
      count: 'गिनती',
      valueContributedChartTitle: 'समय के साथ योगदान मूल्य',
      valueContributedLine: 'मूल्य अंक',
      valuePointsLabel: 'मूल्य अंक',

      itemsTableTitle: 'श्रेणी के अनुसार धन',
      category: 'श्रेणी',
      subcategory: 'उप-श्रेणी',
      shareCount: 'शेयर',
      valuePoints: 'मूल्य अंक',
      trend: 'प्रवृत्ति',
      noData: 'कोई धन डेटा उपलब्ध नहीं',

      aggregatedTitle: 'एकत्रित धन शेयर',
      aggregatedDescription: 'समुदाय में प्रत्येक वस्तु के लिए कुल सक्रिय शेयर',
      activeSharesColumn: 'सक्रिय शेयर',
      totalQuantityColumn: 'कुल मात्रा',
      sharersColumn: 'साझा करने वाले',
      valuePointsColumn: 'मूल्य अंक',
      noActiveShares: 'समुदाय में कोई सक्रिय धन शेयर नहीं',

      errorLoading: 'धन सांख्यिकी लोड करने में त्रुटि',
      accessDeniedTitle: 'पहुंच प्रतिबंधित',
      accessDeniedMessage: 'आपको धन विश्लेषण देखने की अनुमति नहीं है। इसके लिए प्रशासक विशेषाधिकार या पर्याप्त विश्वास स्कोर की आवश्यकता है।',
    },
  },
} as const;
