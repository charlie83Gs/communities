export const inviteLinkFormDict = {
  en: {
    inviteLinkForm: {
      title: 'Invite by Link',
      inviteTitleLabel: 'Invite Title (optional)',
      inviteTitlePlaceholder: 'e.g., Launch Party Invite',
      member: 'Member',
      admin: 'Admin',
      expiresIn: 'Expires in: {{days}} days',
      generating: 'Generating...',
      generateLink: 'Generate Link',
      error: 'Error: {{message}}',
      success: 'Link invite created!',
      copyLink: 'Copy Link',
      copied: 'Copied!',
    },
  },
  es: {
    inviteLinkForm: {
      title: 'Invitar por enlace',
      inviteTitleLabel: 'Título de invitación (opcional)',
      inviteTitlePlaceholder: 'ej., Invitación a fiesta de lanzamiento',
      member: 'Miembro',
      admin: 'Administrador',
      expiresIn: 'Expira en: {{days}} días',
      generating: 'Generando...',
      generateLink: 'Generar enlace',
      error: 'Error: {{message}}',
      success: 'Enlace de invitacion creado',
      copyLink: 'Copiar Enlace',
      copied: 'Copiado!',
    },
  },
  hi: {
    inviteLinkForm: {
      title: 'लिंक द्वारा आमंत्रित करें',
      inviteTitleLabel: 'आमंत्रण शीर्षक (वैकल्पिक)',
      inviteTitlePlaceholder: 'उदा., लॉन्च पार्टी आमंत्रण',
      member: 'सदस्य',
      admin: 'व्यवस्थापक',
      expiresIn: 'समाप्ति: {{days}} दिन',
      generating: 'जनरेट हो रहा है...',
      generateLink: 'लिंक जनरेट करें',
      error: 'त्रुटि: {{message}}',
      success: 'लिंक आमंत्रण बनाया गया!',
      copyLink: 'लिंक कॉपी करें',
      copied: 'कॉपी हो गया!',
    },
  },
} as const;

export type InviteLinkFormDict = typeof inviteLinkFormDict['en']['inviteLinkForm'];
