import type { Dict } from '@/i18n/makeTranslator';

export const wealthIndexDict = {
  en: {
    wealthIndex: {
      title: 'Wealth Items',
      subtitle: 'Browse and manage shared resources in this community',
      createWealth: 'Share Wealth',
      backToResources: 'Back to Resources',
      loading: 'Loading wealth items...',
      error: 'Failed to load wealth items',
      minTrustRequired: 'Minimum trust to share wealth:',
      trustPoints: 'points',
    },
  },
  es: {
    wealthIndex: {
      title: 'Items de Riqueza',
      subtitle: 'Explora y administra recursos compartidos en esta comunidad',
      createWealth: 'Compartir Riqueza',
      backToResources: 'Volver a Recursos',
      loading: 'Cargando items de riqueza...',
      error: 'Error al cargar items de riqueza',
      minTrustRequired: 'Confianza minima para compartir riqueza:',
      trustPoints: 'puntos',
    },
  },
  hi: {
    wealthIndex: {
      title: 'संपत्ति आइटम',
      subtitle: 'इस समुदाय में साझा संसाधनों को ब्राउज़ और प्रबंधित करें',
      createWealth: 'संपत्ति साझा करें',
      backToResources: 'संसाधनों पर वापस',
      loading: 'संपत्ति आइटम लोड हो रहे हैं...',
      error: 'संपत्ति आइटम लोड करने में विफल',
      minTrustRequired: 'संपत्ति साझा करने के लिए न्यूनतम विश्वास:',
      trustPoints: 'अंक',
    },
  },
} as const satisfies Dict;
