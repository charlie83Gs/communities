export const communityListDict = {
  en: {
    communityList: {
      searchLabel: 'Search',
      searchPlaceholder: 'Search communities...',
      searching: 'Searching...',
      search: 'Search',
      advancedSearch: 'Advanced Search',
      perPageLabel: 'Per page',
      loading: 'Loading communities...',
      noCommunitiesFound: 'No communities found.',
      pageInfo: 'Page {{page}} • {{limit}} per page',
      totalInfo: '{{total}} total',
      previous: 'Previous',
      next: 'Next',
    },
  },
  es: {
    communityList: {
      searchLabel: 'Buscar',
      searchPlaceholder: 'Buscar comunidades...',
      searching: 'Buscando...',
      search: 'Buscar',
      advancedSearch: 'Búsqueda avanzada',
      perPageLabel: 'Por página',
      loading: 'Cargando comunidades...',
      noCommunitiesFound: 'No se encontraron comunidades.',
      pageInfo: 'Página {{page}} • {{limit}} por página',
      totalInfo: '{{total}} total',
      previous: 'Anterior',
      next: 'Siguiente',
    },
  },
  hi: {
    communityList: {
      searchLabel: 'खोजें',
      searchPlaceholder: 'समुदाय खोजें...',
      searching: 'खोज रहे हैं...',
      search: 'खोजें',
      advancedSearch: 'उन्नत खोज',
      perPageLabel: 'प्रति पृष्ठ',
      loading: 'समुदाय लोड हो रहे हैं...',
      noCommunitiesFound: 'कोई समुदाय नहीं मिला।',
      pageInfo: 'पृष्ठ {{page}} • {{limit}} प्रति पृष्ठ',
      totalInfo: '{{total}} कुल',
      previous: 'पिछला',
      next: 'अगला',
    },
  },
} as const;

export type CommunityListDict = typeof communityListDict['en']['communityList'];
