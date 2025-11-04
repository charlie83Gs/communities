import type { Dict } from '@/i18n/makeTranslator';

export const trustLevelPickerDict = {
  en: {
    trustLevelPicker: {
      useTrustLevels: 'Use trust levels',
      selectLevel: 'Select a trust level',
      loading: 'Loading trust levels...',
      customPlaceholder: 'Enter custom trust value',
      custom: 'Custom',
      currentValue: 'Current value: {{value}}',
    },
  },
  es: {
    trustLevelPicker: {
      useTrustLevels: 'Usar niveles de confianza',
      selectLevel: 'Seleccionar un nivel de confianza',
      loading: 'Cargando niveles de confianza...',
      customPlaceholder: 'Ingrese valor de confianza personalizado',
      custom: 'Personalizado',
      currentValue: 'Valor actual: {{value}}',
    },
  },
  hi: {
    trustLevelPicker: {
      useTrustLevels: 'विश्वास स्तरों का उपयोग करें',
      selectLevel: 'विश्वास स्तर चुनें',
      loading: 'विश्वास स्तर लोड हो रहे हैं...',
      customPlaceholder: 'कस्टम विश्वास मूल्य दर्ज करें',
      custom: 'कस्टम',
      currentValue: 'वर्तमान मूल्य: {{value}}',
    },
  },
} as const satisfies Dict;
