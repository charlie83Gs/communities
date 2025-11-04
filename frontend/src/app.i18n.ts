export const appDict = {
  en: {
    app: {
      nav: {
        home: 'Home',
        about: 'About',
        dashboard: 'Dashboard',
        myRequests: 'Wealth Requests',
        myTrust: 'My Trust',
        login: 'Login',
        register: 'Register',
        logout: 'Logout',
        welcome: 'Welcome, {{name}}',
        language: 'Language:',
      },
      userFallback: 'User',
    },
  },
  es: {
    app: {
      nav: {
        home: 'Inicio',
        about: 'Acerca de',
        dashboard: 'Panel',
        myRequests: 'Solicitudes de Riqueza',
        myTrust: 'Mi Confianza',
        login: 'Iniciar sesión',
        register: 'Registrarse',
        logout: 'Cerrar sesión',
        welcome: 'Bienvenido, {{name}}',
        language: 'Idioma:',
      },
      userFallback: 'Usuario',
    },
  },
  hi: {
    app: {
      nav: {
        home: 'होम',
        about: 'परिचय',
        dashboard: 'डैशबोर्ड',
        myRequests: 'धन अनुरोध',
        myTrust: 'मेरा विश्वास',
        login: 'लॉगिन',
        register: 'रजिस्टर',
        logout: 'लॉगआउट',
        welcome: 'स्वागत है, {{name}}',
        language: 'भाषा:',
      },
      userFallback: 'उपयोगकर्ता',
    },
  },
} as const;

export type AppDict = typeof appDict['en']['app'];