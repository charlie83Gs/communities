export const wealthCardDict = {
  en: {
    wealthCard: {
      badges: {
        kind: 'kind',
        time: 'time',
        type: 'type',
        status: 'status',
      },
      timebound: 'time-bound',
      unlimited: 'unlimited',
      unit_based: 'unit-based',
      request_based: 'request-based',
      unitsAvailable: 'Units available',
      maxPerUser: 'Max per user',
      statuses: {
        active: 'active',
        fulfilled: 'fulfilled',
        paused: 'paused',
        archived: 'archived',
        draft: 'draft',
      },
    },
  },
  es: {
    wealthCard: {
      badges: {
        kind: 'tipo',
        time: 'tiempo',
        type: 'modalidad',
        status: 'estado',
      },
      timebound: 'con límite de tiempo',
      unlimited: 'ilimitado',
      unit_based: 'por unidades',
      request_based: 'por solicitud',
      unitsAvailable: 'Unidades disponibles',
      maxPerUser: 'Máx por usuario',
      statuses: {
        active: 'activo',
        fulfilled: 'completado',
        paused: 'pausado',
        archived: 'archivado',
        draft: 'borrador',
      },
    },
  },
  hi: {
    wealthCard: {
      badges: {
        kind: 'प्रकार',
        time: 'समय',
        type: 'वितरण',
        status: 'स्थिति',
      },
      timebound: 'समय-सीमित',
      unlimited: 'असीमित',
      unit_based: 'यूनिट-आधारित',
      request_based: 'अनुरोध-आधारित',
      unitsAvailable: 'उपलब्ध इकाइयाँ',
      maxPerUser: 'प्रति उपयोगकर्ता अधिकतम',
      statuses: {
        active: 'सक्रिय',
        fulfilled: 'पूर्ण',
        paused: 'रुका हुआ',
        archived: 'संग्रहीत',
        draft: 'ड्राफ्ट',
      },
    },
  },
} as const;

export type WealthCardDict = typeof wealthCardDict['en']['wealthCard'];
