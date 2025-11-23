import type { Dict } from '@/i18n/makeTranslator';

export const resourcesTabDict = {
  en: {
    resourcesTab: {
      // Card titles
      wealthTitle: 'Wealth',
      poolsTitle: 'Pools',
      needsTitle: 'Needs',
      itemsTitle: 'Items',
      // Card tooltips
      tooltips: {
        wealth: 'Items and resources shared within the community',
        pools: 'Council-managed resource aggregations for collective use',
        needs: 'Community members\' resource requirements and requests',
        items: 'Manage the item types available for wealth, pools, and needs',
      },
      // Descriptions
      wealthDesc: 'Items shared in this community',
      poolsDesc: 'Resource pools managed by councils',
      needsDesc: 'Active needs from members',
      itemsDesc: 'Define what can be shared',
      // Counts
      itemsCount: '{{count}} items',
      poolsCount: '{{count}} pools',
      needsCount: '{{count}} active',
      // Buttons
      create: 'Create',
      share: 'Share',
      viewAll: 'View All',
      showLess: 'Show Less',
      manage: 'Manage',
      // Recent sections
      recentWealth: 'Recent Wealth Items',
      allWealth: 'All Wealth Items',
      recentPools: 'Recent Pools',
      noRecentWealth: 'No wealth items yet',
      noRecentPools: 'No pools yet',
      // Units
      unitsAvailable: '{{count}} units available',
      totalUnits: '{{count}} total units',
      // Loading
      loading: 'Loading...',
      // Errors
      error: 'Failed to load data',
      // Feature disabled
      featureDisabled: 'This feature is not enabled',
      poolsDisabled: 'Pools feature is not enabled for this community',
      needsDisabled: 'Needs feature is not enabled for this community',
    },
  },
  es: {
    resourcesTab: {
      // Card titles
      wealthTitle: 'Riqueza',
      poolsTitle: 'Grupos',
      needsTitle: 'Necesidades',
      itemsTitle: 'Articulos',
      // Card tooltips
      tooltips: {
        wealth: 'Articulos y recursos compartidos dentro de la comunidad',
        pools: 'Agregaciones de recursos administradas por consejos para uso colectivo',
        needs: 'Requisitos y solicitudes de recursos de los miembros de la comunidad',
        items: 'Administrar los tipos de articulos disponibles para riqueza, grupos y necesidades',
      },
      // Descriptions
      wealthDesc: 'Items compartidos en esta comunidad',
      poolsDesc: 'Grupos de recursos administrados por consejos',
      needsDesc: 'Necesidades activas de los miembros',
      itemsDesc: 'Definir que se puede compartir',
      // Counts
      itemsCount: '{{count}} items',
      poolsCount: '{{count}} grupos',
      needsCount: '{{count}} activas',
      // Buttons
      create: 'Crear',
      share: 'Compartir',
      viewAll: 'Ver Todo',
      showLess: 'Ver Menos',
      manage: 'Administrar',
      // Recent sections
      recentWealth: 'Items Recientes de Riqueza',
      allWealth: 'Todos los Items de Riqueza',
      recentPools: 'Grupos Recientes',
      noRecentWealth: 'Sin items de riqueza aun',
      noRecentPools: 'Sin grupos aun',
      // Units
      unitsAvailable: '{{count}} unidades disponibles',
      totalUnits: '{{count}} unidades totales',
      // Loading
      loading: 'Cargando...',
      // Errors
      error: 'Error al cargar datos',
      // Feature disabled
      featureDisabled: 'Esta funcion no esta habilitada',
      poolsDisabled: 'La funcion de grupos no esta habilitada para esta comunidad',
      needsDisabled: 'La funcion de necesidades no esta habilitada para esta comunidad',
    },
  },
  hi: {
    resourcesTab: {
      // Card titles
      wealthTitle: 'संपत्ति',
      poolsTitle: 'पूल',
      needsTitle: 'आवश्यकताएं',
      itemsTitle: 'वस्तुएं',
      // Card tooltips
      tooltips: {
        wealth: 'समुदाय के भीतर साझा की गई वस्तुएं और संसाधन',
        pools: 'सामूहिक उपयोग के लिए परिषद-प्रबंधित संसाधन संग्रह',
        needs: 'समुदाय के सदस्यों की संसाधन आवश्यकताएं और अनुरोध',
        items: 'संपत्ति, पूल और आवश्यकताओं के लिए उपलब्ध वस्तु प्रकारों का प्रबंधन करें',
      },
      // Descriptions
      wealthDesc: 'इस समुदाय में साझा की गई वस्तुएं',
      poolsDesc: 'परिषदों द्वारा प्रबंधित संसाधन पूल',
      needsDesc: 'सदस्यों की सक्रिय आवश्यकताएं',
      itemsDesc: 'परिभाषित करें कि क्या साझा किया जा सकता है',
      // Counts
      itemsCount: '{{count}} आइटम',
      poolsCount: '{{count}} पूल',
      needsCount: '{{count}} सक्रिय',
      // Buttons
      create: 'बनाएं',
      share: 'साझा करें',
      viewAll: 'सभी देखें',
      showLess: 'कम दिखाएं',
      manage: 'प्रबंधित करें',
      // Recent sections
      recentWealth: 'हालिया संपत्ति आइटम',
      allWealth: 'सभी संपत्ति आइटम',
      recentPools: 'हालिया पूल',
      noRecentWealth: 'अभी तक कोई संपत्ति आइटम नहीं',
      noRecentPools: 'अभी तक कोई पूल नहीं',
      // Units
      unitsAvailable: '{{count}} इकाइयां उपलब्ध',
      totalUnits: '{{count}} कुल इकाइयां',
      // Loading
      loading: 'लोड हो रहा है...',
      // Errors
      error: 'डेटा लोड करने में विफल',
      // Feature disabled
      featureDisabled: 'यह सुविधा सक्षम नहीं है',
      poolsDisabled: 'इस समुदाय के लिए पूल सुविधा सक्षम नहीं है',
      needsDisabled: 'इस समुदाय के लिए आवश्यकताएं सुविधा सक्षम नहीं है',
    },
  },
} as const satisfies Dict;
