/**
 * Disputes i18n dictionary
 * Location per architecture: next to the component files
 */

export const disputesDict = {
  en: {
    disputes: {
      // List view
      title: 'Disputes',
      createDispute: 'Create Dispute',
      filterByStatus: 'Filter by Status',
      filterAll: 'All',
      filterOpen: 'Open',
      filterInMediation: 'In Mediation',
      filterResolved: 'Resolved',
      filterClosed: 'Closed',
      loading: 'Loading disputes...',
      noDisputesFound: 'No disputes found',

      // Card view
      status: 'Status',
      statusOpen: 'Open',
      statusInMediation: 'In Mediation',
      statusResolved: 'Resolved',
      statusClosed: 'Closed',
      participants: 'Participants',
      mediators: 'Mediators',
      proposed: 'proposed',
      accepted: 'accepted',
      youAreParticipant: 'You are a participant',
      youAreMediator: 'You are a mediator',
      hasResolution: 'Resolved',
      viewDetails: 'View Details',
      createdBy: 'Created by',
      createdAt: 'Created',

      // Detail view
      backToCommunity: 'Back to community',
      backToDisputes: 'Back to disputes',
      disputeInfo: 'Dispute Information',
      description: 'Description',
      accessDenied: 'Access Denied',
      accessDeniedMessage: 'You do not have permission to view this dispute. Only participants, accepted mediators, and community admins can view dispute details.',

      // Participants section
      participantsSection: 'Participants',
      initiator: 'Initiator',
      participant: 'Participant',
      addParticipant: 'Add Participant',
      addParticipantPlaceholder: 'Select a member to add...',

      // Mediators section
      mediatorsSection: 'Mediators',
      proposedMediators: 'Proposed Mediators',
      acceptedMediators: 'Accepted Mediators',
      rejectedMediators: 'Rejected Mediators',
      proposeAsMediator: 'Propose as Mediator',
      proposingAsMediator: 'Proposing...',
      acceptMediator: 'Accept',
      rejectMediator: 'Reject',
      acceptingMediator: 'Accepting...',
      rejectingMediator: 'Rejecting...',
      noProposedMediators: 'No mediator proposals yet',
      noAcceptedMediators: 'No accepted mediators yet',
      noRejectedMediators: 'No rejected mediators',
      mediatorProposedBy: 'Proposed by',
      mediatorAcceptedBy: 'Accepted by',
      mediatorRejectedBy: 'Rejected by',

      // Resolution section
      resolutionSection: 'Resolution',
      resolutionType: 'Resolution Type',
      resolutionTypeOpen: 'Open (Public)',
      resolutionTypeClosed: 'Closed (Private)',
      resolutionText: 'Resolution',
      createResolution: 'Create Resolution',
      creatingResolution: 'Creating...',
      resolutionCreatedBy: 'Resolved by',
      resolutionCreatedAt: 'Resolved on',
      resolutionPlaceholder: 'Enter the resolution details...',
      resolutionTypeLabel: 'Who can view this resolution?',
      resolutionTypeOpenDesc: 'Visible to the entire community for transparency and learning',
      resolutionTypeClosedDesc: 'Only visible to participants and mediators',
      noResolution: 'No resolution yet',

      // Messages section
      messagesSection: 'Messages',
      messagePlaceholder: 'Enter your message...',
      sendMessage: 'Send Message',
      sendingMessage: 'Sending...',
      noMessages: 'No messages yet',
      visibleToParticipants: 'Visible to participants',
      visibleToMediators: 'Visible to mediators',
      visibilityLabel: 'Message visibility',

      // Create form
      createDisputeTitle: 'Create Dispute',
      titleLabel: 'Title',
      titlePlaceholder: 'Brief description of the dispute',
      descriptionLabel: 'Description',
      descriptionPlaceholder: 'Detailed description of the situation...',
      additionalParticipantsLabel: 'Additional Participants',
      additionalParticipantsPlaceholder: 'Select members to include...',
      submit: 'Create Dispute',
      submitting: 'Creating...',
      cancel: 'Cancel',

      // Privacy
      privacyTypeLabel: 'Dispute Privacy',
      privacyTypeOpen: 'Open',
      privacyTypeAnonymous: 'Anonymous',
      privacyTypeOpenDesc: 'Participant identities are visible to everyone',
      privacyTypeAnonymousDesc: 'Participant identities are only visible to participants, mediators, and admins',
      changePrivacyType: 'Change Privacy Type',
      privacyUpdated: 'Privacy type updated successfully',
      confirmPrivacyChange: 'Are you sure you want to change the privacy type? This will affect who can see participant identities.',

      // Validation messages
      titleRequired: 'Title is required',
      descriptionRequired: 'Description is required',
      resolutionRequired: 'Resolution text is required',
      messageRequired: 'Message is required',

      // Success messages
      disputeCreated: 'Dispute created successfully',
      mediatorProposed: 'You have proposed yourself as a mediator',
      mediatorAccepted: 'Mediator accepted',
      mediatorRejected: 'Mediator rejected',
      resolutionCreated: 'Resolution created successfully',
      messageSent: 'Message sent',

      // Error messages
      errorLoadingDisputes: 'Failed to load disputes',
      errorLoadingDispute: 'Failed to load dispute details',
      errorCreatingDispute: 'Failed to create dispute',
      errorProposingMediator: 'Failed to propose as mediator',
      errorRespondingToMediator: 'Failed to respond to mediator proposal',
      errorCreatingResolution: 'Failed to create resolution',
      errorSendingMessage: 'Failed to send message',

      // Time formatting
      justNow: 'Just now',
      minutesAgo: '{{count}} minutes ago',
      hoursAgo: '{{count}} hours ago',
      daysAgo: '{{count}} days ago',
      weeksAgo: '{{count}} weeks ago',
      monthsAgo: '{{count}} months ago',
      yearsAgo: '{{count}} years ago',
    },
  },
  es: {
    disputes: {
      // List view
      title: 'Disputas',
      createDispute: 'Crear Disputa',
      filterByStatus: 'Filtrar por Estado',
      filterAll: 'Todas',
      filterOpen: 'Abiertas',
      filterInMediation: 'En Mediación',
      filterResolved: 'Resueltas',
      filterClosed: 'Cerradas',
      loading: 'Cargando disputas...',
      noDisputesFound: 'No se encontraron disputas',

      // Card view
      status: 'Estado',
      statusOpen: 'Abierta',
      statusInMediation: 'En Mediación',
      statusResolved: 'Resuelta',
      statusClosed: 'Cerrada',
      participants: 'Participantes',
      mediators: 'Mediadores',
      proposed: 'propuestos',
      accepted: 'aceptados',
      youAreParticipant: 'Eres participante',
      youAreMediator: 'Eres mediador',
      hasResolution: 'Resuelta',
      viewDetails: 'Ver Detalles',
      createdBy: 'Creado por',
      createdAt: 'Creado',

      // Detail view
      backToCommunity: 'Volver a la comunidad',
      backToDisputes: 'Volver a disputas',
      disputeInfo: 'Información de la Disputa',
      description: 'Descripción',
      accessDenied: 'Acceso Denegado',
      accessDeniedMessage: 'No tienes permiso para ver esta disputa. Solo los participantes, mediadores aceptados y administradores pueden ver los detalles.',

      // Participants section
      participantsSection: 'Participantes',
      initiator: 'Iniciador',
      participant: 'Participante',
      addParticipant: 'Añadir Participante',
      addParticipantPlaceholder: 'Selecciona un miembro...',

      // Mediators section
      mediatorsSection: 'Mediadores',
      proposedMediators: 'Mediadores Propuestos',
      acceptedMediators: 'Mediadores Aceptados',
      rejectedMediators: 'Mediadores Rechazados',
      proposeAsMediator: 'Proponer como Mediador',
      proposingAsMediator: 'Proponiendo...',
      acceptMediator: 'Aceptar',
      rejectMediator: 'Rechazar',
      acceptingMediator: 'Aceptando...',
      rejectingMediator: 'Rechazando...',
      noProposedMediators: 'No hay propuestas de mediadores',
      noAcceptedMediators: 'No hay mediadores aceptados',
      noRejectedMediators: 'No hay mediadores rechazados',
      mediatorProposedBy: 'Propuesto por',
      mediatorAcceptedBy: 'Aceptado por',
      mediatorRejectedBy: 'Rechazado por',

      // Resolution section
      resolutionSection: 'Resolución',
      resolutionType: 'Tipo de Resolución',
      resolutionTypeOpen: 'Abierta (Pública)',
      resolutionTypeClosed: 'Cerrada (Privada)',
      resolutionText: 'Resolución',
      createResolution: 'Crear Resolución',
      creatingResolution: 'Creando...',
      resolutionCreatedBy: 'Resuelto por',
      resolutionCreatedAt: 'Resuelto el',
      resolutionPlaceholder: 'Ingresa los detalles de la resolución...',
      resolutionTypeLabel: '¿Quién puede ver esta resolución?',
      resolutionTypeOpenDesc: 'Visible para toda la comunidad',
      resolutionTypeClosedDesc: 'Solo visible para participantes y mediadores',
      noResolution: 'Sin resolución aún',

      // Messages section
      messagesSection: 'Mensajes',
      messagePlaceholder: 'Ingresa tu mensaje...',
      sendMessage: 'Enviar Mensaje',
      sendingMessage: 'Enviando...',
      noMessages: 'No hay mensajes aún',
      visibleToParticipants: 'Visible para participantes',
      visibleToMediators: 'Visible para mediadores',
      visibilityLabel: 'Visibilidad del mensaje',

      // Create form
      createDisputeTitle: 'Crear Disputa',
      titleLabel: 'Título',
      titlePlaceholder: 'Breve descripción de la disputa',
      descriptionLabel: 'Descripción',
      descriptionPlaceholder: 'Descripción detallada de la situación...',
      additionalParticipantsLabel: 'Participantes Adicionales',
      additionalParticipantsPlaceholder: 'Selecciona miembros...',
      submit: 'Crear Disputa',
      submitting: 'Creando...',
      cancel: 'Cancelar',

      // Privacy
      privacyTypeLabel: 'Privacidad de la Disputa',
      privacyTypeOpen: 'Abierta',
      privacyTypeAnonymous: 'Anónima',
      privacyTypeOpenDesc: 'Las identidades de los participantes son visibles para todos',
      privacyTypeAnonymousDesc: 'Las identidades de los participantes solo son visibles para participantes, mediadores y administradores',
      changePrivacyType: 'Cambiar Tipo de Privacidad',
      privacyUpdated: 'Tipo de privacidad actualizado exitosamente',
      confirmPrivacyChange: '¿Está seguro de que desea cambiar el tipo de privacidad? Esto afectará quién puede ver las identidades de los participantes.',

      // Validation messages
      titleRequired: 'El título es requerido',
      descriptionRequired: 'La descripción es requerida',
      resolutionRequired: 'El texto de resolución es requerido',
      messageRequired: 'El mensaje es requerido',

      // Success messages
      disputeCreated: 'Disputa creada exitosamente',
      mediatorProposed: 'Te has propuesto como mediador',
      mediatorAccepted: 'Mediador aceptado',
      mediatorRejected: 'Mediador rechazado',
      resolutionCreated: 'Resolución creada exitosamente',
      messageSent: 'Mensaje enviado',

      // Error messages
      errorLoadingDisputes: 'Error al cargar disputas',
      errorLoadingDispute: 'Error al cargar detalles de la disputa',
      errorCreatingDispute: 'Error al crear disputa',
      errorProposingMediator: 'Error al proponer como mediador',
      errorRespondingToMediator: 'Error al responder a propuesta de mediador',
      errorCreatingResolution: 'Error al crear resolución',
      errorSendingMessage: 'Error al enviar mensaje',

      // Time formatting
      justNow: 'Justo ahora',
      minutesAgo: 'Hace {{count}} minutos',
      hoursAgo: 'Hace {{count}} horas',
      daysAgo: 'Hace {{count}} días',
      weeksAgo: 'Hace {{count}} semanas',
      monthsAgo: 'Hace {{count}} meses',
      yearsAgo: 'Hace {{count}} años',
    },
  },
  hi: {
    disputes: {
      // List view
      title: 'विवाद',
      createDispute: 'विवाद बनाएं',
      filterByStatus: 'स्थिति के अनुसार फ़िल्टर करें',
      filterAll: 'सभी',
      filterOpen: 'खुला',
      filterInMediation: 'मध्यस्थता में',
      filterResolved: 'हल हो गया',
      filterClosed: 'बंद',
      loading: 'विवाद लोड हो रहे हैं...',
      noDisputesFound: 'कोई विवाद नहीं मिला',

      // Card view
      status: 'स्थिति',
      statusOpen: 'खुला',
      statusInMediation: 'मध्यस्थता में',
      statusResolved: 'हल हो गया',
      statusClosed: 'बंद',
      participants: 'प्रतिभागी',
      mediators: 'मध्यस्थ',
      proposed: 'प्रस्तावित',
      accepted: 'स्वीकृत',
      youAreParticipant: 'आप प्रतिभागी हैं',
      youAreMediator: 'आप मध्यस्थ हैं',
      hasResolution: 'हल हो गया',
      viewDetails: 'विवरण देखें',
      createdBy: 'द्वारा बनाया गया',
      createdAt: 'बनाया गया',

      // Detail view
      backToCommunity: 'समुदाय पर वापस जाएं',
      backToDisputes: 'विवादों पर वापस जाएं',
      disputeInfo: 'विवाद की जानकारी',
      description: 'विवरण',
      accessDenied: 'पहुंच अस्वीकृत',
      accessDeniedMessage: 'आपको यह विवाद देखने की अनुमति नहीं है। केवल प्रतिभागी, स्वीकृत मध्यस्थ और प्रशासक विवरण देख सकते हैं।',

      // Participants section
      participantsSection: 'प्रतिभागी',
      initiator: 'शुरुआतकर्ता',
      participant: 'प्रतिभागी',
      addParticipant: 'प्रतिभागी जोड़ें',
      addParticipantPlaceholder: 'सदस्य चुनें...',

      // Mediators section
      mediatorsSection: 'मध्यस्थ',
      proposedMediators: 'प्रस्तावित मध्यस्थ',
      acceptedMediators: 'स्वीकृत मध्यस्थ',
      rejectedMediators: 'अस्वीकृत मध्यस्थ',
      proposeAsMediator: 'मध्यस्थ के रूप में प्रस्ताव करें',
      proposingAsMediator: 'प्रस्ताव कर रहे हैं...',
      acceptMediator: 'स्वीकार करें',
      rejectMediator: 'अस्वीकार करें',
      acceptingMediator: 'स्वीकार कर रहे हैं...',
      rejectingMediator: 'अस्वीकार कर रहे हैं...',
      noProposedMediators: 'कोई मध्यस्थ प्रस्ताव नहीं',
      noAcceptedMediators: 'कोई स्वीकृत मध्यस्थ नहीं',
      noRejectedMediators: 'कोई अस्वीकृत मध्यस्थ नहीं',
      mediatorProposedBy: 'द्वारा प्रस्तावित',
      mediatorAcceptedBy: 'द्वारा स्वीकृत',
      mediatorRejectedBy: 'द्वारा अस्वीकृत',

      // Resolution section
      resolutionSection: 'समाधान',
      resolutionType: 'समाधान प्रकार',
      resolutionTypeOpen: 'खुला (सार्वजनिक)',
      resolutionTypeClosed: 'बंद (निजी)',
      resolutionText: 'समाधान',
      createResolution: 'समाधान बनाएं',
      creatingResolution: 'बना रहे हैं...',
      resolutionCreatedBy: 'द्वारा हल किया गया',
      resolutionCreatedAt: 'हल किया गया',
      resolutionPlaceholder: 'समाधान विवरण दर्ज करें...',
      resolutionTypeLabel: 'यह समाधान कौन देख सकता है?',
      resolutionTypeOpenDesc: 'पूरे समुदाय के लिए दृश्यमान',
      resolutionTypeClosedDesc: 'केवल प्रतिभागियों और मध्यस्थों के लिए दृश्यमान',
      noResolution: 'अभी तक कोई समाधान नहीं',

      // Messages section
      messagesSection: 'संदेश',
      messagePlaceholder: 'अपना संदेश दर्ज करें...',
      sendMessage: 'संदेश भेजें',
      sendingMessage: 'भेज रहे हैं...',
      noMessages: 'अभी तक कोई संदेश नहीं',
      visibleToParticipants: 'प्रतिभागियों के लिए दृश्यमान',
      visibleToMediators: 'मध्यस्थों के लिए दृश्यमान',
      visibilityLabel: 'संदेश दृश्यता',

      // Create form
      createDisputeTitle: 'विवाद बनाएं',
      titleLabel: 'शीर्षक',
      titlePlaceholder: 'विवाद का संक्षिप्त विवरण',
      descriptionLabel: 'विवरण',
      descriptionPlaceholder: 'स्थिति का विस्तृत विवरण...',
      additionalParticipantsLabel: 'अतिरिक्त प्रतिभागी',
      additionalParticipantsPlaceholder: 'सदस्य चुनें...',
      submit: 'विवाद बनाएं',
      submitting: 'बना रहे हैं...',
      cancel: 'रद्द करें',

      // Privacy
      privacyTypeLabel: 'विवाद गोपनीयता',
      privacyTypeOpen: 'खुला',
      privacyTypeAnonymous: 'गुमनाम',
      privacyTypeOpenDesc: 'प्रतिभागी की पहचान सभी के लिए दृश्यमान है',
      privacyTypeAnonymousDesc: 'प्रतिभागी की पहचान केवल प्रतिभागियों, मध्यस्थों और प्रशासकों के लिए दृश्यमान है',
      changePrivacyType: 'गोपनीयता प्रकार बदलें',
      privacyUpdated: 'गोपनीयता प्रकार सफलतापूर्वक अपडेट किया गया',
      confirmPrivacyChange: 'क्या आप वाकई गोपनीयता प्रकार बदलना चाहते हैं? यह प्रभावित करेगा कि कौन प्रतिभागी की पहचान देख सकता है।',

      // Validation messages
      titleRequired: 'शीर्षक आवश्यक है',
      descriptionRequired: 'विवरण आवश्यक है',
      resolutionRequired: 'समाधान पाठ आवश्यक है',
      messageRequired: 'संदेश आवश्यक है',

      // Success messages
      disputeCreated: 'विवाद सफलतापूर्वक बनाया गया',
      mediatorProposed: 'आपने खुद को मध्यस्थ के रूप में प्रस्तावित किया है',
      mediatorAccepted: 'मध्यस्थ स्वीकृत',
      mediatorRejected: 'मध्यस्थ अस्वीकृत',
      resolutionCreated: 'समाधान सफलतापूर्वक बनाया गया',
      messageSent: 'संदेश भेजा गया',

      // Error messages
      errorLoadingDisputes: 'विवाद लोड करने में विफल',
      errorLoadingDispute: 'विवाद विवरण लोड करने में विफल',
      errorCreatingDispute: 'विवाद बनाने में विफल',
      errorProposingMediator: 'मध्यस्थ के रूप में प्रस्ताव करने में विफल',
      errorRespondingToMediator: 'मध्यस्थ प्रस्ताव का जवाब देने में विफल',
      errorCreatingResolution: 'समाधान बनाने में विफल',
      errorSendingMessage: 'संदेश भेजने में विफल',

      // Time formatting
      justNow: 'अभी-अभी',
      minutesAgo: '{{count}} मिनट पहले',
      hoursAgo: '{{count}} घंटे पहले',
      daysAgo: '{{count}} दिन पहले',
      weeksAgo: '{{count}} सप्ताह पहले',
      monthsAgo: '{{count}} महीने पहले',
      yearsAgo: '{{count}} साल पहले',
    },
  },
} as const;
