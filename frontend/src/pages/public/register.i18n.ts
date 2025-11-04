import type { Dict } from '@/i18n/makeTranslator';

export const registerDict = {
  en: {
    register: {
      redirecting: 'Redirecting to registration...',
      redirectingMessage: 'You will be redirected to the secure registration page.',
    },
  },
  es: {
    register: {
      redirecting: 'Redirigiendo al registro...',
      redirectingMessage: 'Serás redirigido a la página de registro segura.',
    },
  },
  hi: {
    register: {
      redirecting: 'पंजीकरण पर रीडायरेक्ट कर रहे हैं...',
      redirectingMessage: 'आपको सुरक्षित पंजीकरण पृष्ठ पर रीडायरेक्ट किया जाएगा।',
    },
  },
} as const satisfies Dict;