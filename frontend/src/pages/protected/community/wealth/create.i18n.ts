import type { Dict } from '@/i18n/makeTranslator';

export const wealthCreateDict = {
  en: {
    wealthCreate: {
      title: 'Share Wealth',
      subtitle: 'Share resources with your community',
      backToWealth: 'Back to Wealth Items',
    },
  },
  es: {
    wealthCreate: {
      title: 'Compartir Riqueza',
      subtitle: 'Comparte recursos con tu comunidad',
      backToWealth: 'Volver a Items de Riqueza',
    },
  },
  hi: {
    wealthCreate: {
      title: 'संपत्ति साझा करें',
      subtitle: 'अपने समुदाय के साथ संसाधन साझा करें',
      backToWealth: 'संपत्ति आइटम पर वापस',
    },
  },
} as const satisfies Dict;
