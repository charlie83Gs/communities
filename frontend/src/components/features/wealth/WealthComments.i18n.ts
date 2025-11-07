export const wealthCommentsDict = {
  en: {
    wealthComments: {
      title: 'Comments',
      signinToSee: 'Sign in to view and add comments.',
      loading: 'Loading comments...',
      empty: 'No comments yet.',
      delete: 'Delete',
      deleting: 'Deleting...',
      by: 'by',
      addLabel: 'Add a comment',
      placeholder: 'Write your comment...',
      posting: 'Posting...',
      post: 'Post Comment',
      clear: 'Clear',
      errors: {
        empty: 'Comment cannot be empty',
      },
    },
  },
  es: {
    wealthComments: {
      title: 'Comentarios',
      signinToSee: 'Inicia sesión para ver y agregar comentarios.',
      loading: 'Cargando comentarios...',
      empty: 'Aún no hay comentarios.',
      delete: 'Eliminar',
      deleting: 'Eliminando...',
      by: 'por',
      addLabel: 'Agregar un comentario',
      placeholder: 'Escribe tu comentario...',
      posting: 'Publicando...',
      post: 'Publicar comentario',
      clear: 'Limpiar',
      errors: {
        empty: 'El comentario no puede estar vacío',
      },
    },
  },
  hi: {
    wealthComments: {
      title: 'टिप्पणियाँ',
      signinToSee: 'टिप्पणियाँ देखने और जोड़ने के लिए साइन इन करें।',
      loading: 'टिप्पणियाँ लोड हो रही हैं...',
      empty: 'अभी तक कोई टिप्पणी नहीं है।',
      delete: 'हटाएँ',
      deleting: 'हटा रहे हैं...',
      by: 'द्वारा',
      addLabel: 'एक टिप्पणी जोड़ें',
      placeholder: 'अपनी टिप्पणी लिखें...',
      posting: 'पोस्ट हो रहा है...',
      post: 'टिप्पणी पोस्ट करें',
      clear: 'साफ़ करें',
      errors: {
        empty: 'टिप्पणी खाली नहीं हो सकती',
      },
    },
  },
} as const;

export type WealthCommentsDict = typeof wealthCommentsDict['en']['wealthComments'];
