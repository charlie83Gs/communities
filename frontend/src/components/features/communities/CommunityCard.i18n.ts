export const communityCardDict = {
  en: {
    communityCard: {
      noDescription: 'No description available',
      createdOn: 'Created on {{date}}',
      trustScore: 'Trust',
    },
  },
  es: {
    communityCard: {
      noDescription: 'No hay descripción disponible',
      createdOn: 'Creado el {{date}}',
      trustScore: 'Confianza',
    },
  },
  hi: {
    communityCard: {
      noDescription: 'कोई विवरण उपलब्ध नहीं',
      createdOn: '{{date}} को बनाया गया',
      trustScore: 'विश्वास',
    },
  },
} as const;

export type CommunityCardDict = typeof communityCardDict['en']['communityCard'];
