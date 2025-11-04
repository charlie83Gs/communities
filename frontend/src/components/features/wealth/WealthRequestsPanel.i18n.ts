export const wealthRequestsPanelDict = {
  en: {
    wealthRequestsPanel: {
      title: 'Requests',
      loading: 'Loading...',
      noRequests: 'No requests yet.',
      noEmail: 'No email',
      units: 'Units: {{units}}',
      status: 'Status: {{status}}',
      accepting: 'Accepting...',
      accept: 'Accept',
      rejecting: 'Rejecting...',
      reject: 'Reject',
    },
  },
  es: {
    wealthRequestsPanel: {
      title: 'Solicitudes',
      loading: 'Cargando...',
      noRequests: 'Aún no hay solicitudes.',
      noEmail: 'Sin correo electrónico',
      units: 'Unidades: {{units}}',
      status: 'Estado: {{status}}',
      accepting: 'Aceptando...',
      accept: 'Aceptar',
      rejecting: 'Rechazando...',
      reject: 'Rechazar',
    },
  },
  hi: {
    wealthRequestsPanel: {
      title: 'अनुरोध',
      loading: 'लोड हो रहा है...',
      noRequests: 'अभी तक कोई अनुरोध नहीं।',
      noEmail: 'कोई ईमेल नहीं',
      units: 'इकाइयाँ: {{units}}',
      status: 'स्थिति: {{status}}',
      accepting: 'स्वीकार कर रहे हैं...',
      accept: 'स्वीकार करें',
      rejecting: 'अस्वीकार कर रहे हैं...',
      reject: 'अस्वीकार करें',
    },
  },
} as const;

export type WealthRequestsPanelDict = typeof wealthRequestsPanelDict['en']['wealthRequestsPanel'];
