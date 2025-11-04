export const locationSelectorDict = {
  en: {
    locationSelector: {
      country: 'Country',
      stateProvince: 'State/Province',
      city: 'City',
      selectCountry: 'Select country',
      any: 'Any',
    },
  },
  es: {
    locationSelector: {
      country: 'País',
      stateProvince: 'Estado/Provincia',
      city: 'Ciudad',
      selectCountry: 'Seleccionar país',
      any: 'Cualquiera',
    },
  },
  hi: {
    locationSelector: {
      country: 'देश',
      stateProvince: 'राज्य/प्रांत',
      city: 'शहर',
      selectCountry: 'देश चुनें',
      any: 'कोई भी',
    },
  },
} as const;

export type LocationSelectorDict = typeof locationSelectorDict['en']['locationSelector'];
