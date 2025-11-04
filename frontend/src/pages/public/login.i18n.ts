export const loginDict = {
  en: {
    login: {
      redirecting: 'Redirecting to login...',
      redirectingMessage: 'You will be redirected to the secure login page.',
    },
  },
  es: {
    login: {
      redirecting: 'Redirigiendo al inicio de sesión...',
      redirectingMessage: 'Serás redirigido a la página de inicio de sesión segura.',
    },
  },
  hi: {
    login: {
      redirecting: 'लॉगिन पर रीडायरेक्ट कर रहे हैं...',
      redirectingMessage: 'आपको सुरक्षित लॉगिन पृष्ठ पर रीडायरेक्ट किया जाएगा।',
    },
  },
} as const;

export type LoginDict = typeof loginDict['en']['login'];