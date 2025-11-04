/**
 * 404 Not Found page i18n dictionary kept close to the page.
 */
export const notFoundDict = {
  en: {
    notFound: {
      title: '404: Not Found',
      message: "It's gone 😞",
    },
  },
  es: {
    notFound: {
      title: '404: No encontrado',
      message: 'Ya no está aquí 😞',
    },
  },
  hi: {
    notFound: {
      title: '404: नहीं मिला',
      message: 'यह चला गया 😞',
    },
  },
} as const;

export type NotFoundDict = typeof notFoundDict['en']['notFound'];
