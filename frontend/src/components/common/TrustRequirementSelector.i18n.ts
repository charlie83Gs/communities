import type { Dict } from '@/i18n/makeTranslator';

export const trustRequirementSelectorDict = {
  en: {
    trustRequirementSelector: {
      useTrustLevel: 'Use Trust Level',
      useCustomNumber: 'Use Custom Number',
      selectLevel: 'Select Trust Level',
      customThreshold: 'Custom Threshold',
      resolvedValue: 'Resolved: {{value}}+',
      loading: 'Loading levels...',
    },
  },
  es: {
    trustRequirementSelector: {
      useTrustLevel: 'Usar Nivel de Confianza',
      useCustomNumber: 'Usar Número Personalizado',
      selectLevel: 'Seleccionar Nivel de Confianza',
      customThreshold: 'Umbral Personalizado',
      resolvedValue: 'Resuelto: {{value}}+',
      loading: 'Cargando niveles...',
    },
  },
  hi: {
    trustRequirementSelector: {
      useTrustLevel: 'विश्वास स्तर का उपयोग करें',
      useCustomNumber: 'कस्टम नंबर का उपयोग करें',
      selectLevel: 'विश्वास स्तर चुनें',
      customThreshold: 'कस्टम थ्रेशोल्ड',
      resolvedValue: 'हल किया गया: {{value}}+',
      loading: 'स्तर लोड हो रहे हैं...',
    },
  },
} as const satisfies Dict;
