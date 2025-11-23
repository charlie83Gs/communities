export const checkoutPageDict = {
  en: {
    checkoutPage: {
      // Header
      from: 'From',
      pool: 'Pool',
      share: 'Share',

      // Form
      selectUnits: 'How much do you need?',
      unitsLabel: '{{unit}}',
      unitsPlaceholder: 'Enter amount',
      maxAllowed: 'Max per checkout',
      available: 'Available',
      unlimited: 'Unlimited',
      completeCheckout: 'Complete Checkout',
      processing: 'Processing...',

      // Auth prompts
      loginToCheckout: 'Login to Checkout',
      loginPrompt: 'You must be logged in to complete checkout',
      notMember: 'Not a member of {{community}}?',
      joinCommunity: 'Join Community',
      joinPrompt: 'You must be a member to checkout',

      // Trust requirements
      insufficientTrust: 'Insufficient Trust',
      trustRequired: 'You need {{required}} trust to use checkout links',
      currentTrust: 'Your current trust',
      earnTrust: 'How to earn trust',

      // Success
      successTitle: 'Success!',
      successMessage: 'You received {{units}} {{unit}} of {{item}}',
      trustAwarded: '+{{trust}} trust awarded',
      thankYou: 'Thank you for sharing!',
      done: 'Done',
      goToCommunity: 'Go to Community',

      // Errors
      linkInactive: 'Link No Longer Active',
      linkExpired: 'This checkout link has expired or been revoked',
      shareCompleted: 'This share has been completed',
      shareDepletedTitle: 'All Gone!',
      shareDepleted: 'This share has been fully claimed',
      poolEmpty: 'Pool Temporarily Empty',
      poolEmptyMessage: 'This pool is currently out of stock. Check back later.',
      invalidUnits: 'Invalid Amount',
      exceedsMax: 'Amount exceeds maximum allowed ({{max}} {{unit}})',
      exceedsAvailable: 'Only {{available}} {{unit}} remaining',
      mustBePositive: 'Amount must be greater than 0',
      checkoutFailed: 'Checkout Failed',
      tryAgain: 'Please try again',
      rateLimit: 'Rate Limit Exceeded',
      rateLimitMessage: 'You\'ve made too many checkouts recently. Please wait {{time}} before trying again.',
      cooldown: 'Cooldown Active',
      cooldownMessage: 'Please wait {{time}} before using this link again.',

      // Loading
      loading: 'Loading checkout...',
      loadingFailed: 'Failed to load checkout link',
      notFound: 'Checkout link not found',

      // Info
      scanToCheckout: 'Scan to Checkout',
      mobileFriendly: 'Mobile-optimized for easy scanning',

      // Navigation
      backToCommunity: 'Back to {{community}}',

      // Units fallback
      unitsGeneric: 'units',
    },
  },
  es: {
    checkoutPage: {
      from: 'De',
      pool: 'Pool',
      share: 'Recurso',

      selectUnits: '¿Cuánto necesitas?',
      unitsLabel: '{{unit}}',
      unitsPlaceholder: 'Ingresa cantidad',
      maxAllowed: 'Máximo por checkout',
      available: 'Disponible',
      unlimited: 'Ilimitado',
      completeCheckout: 'Completar Checkout',
      processing: 'Procesando...',

      loginToCheckout: 'Iniciar Sesión para Checkout',
      loginPrompt: 'Debes iniciar sesión para completar el checkout',
      notMember: '¿No eres miembro de {{community}}?',
      joinCommunity: 'Unirse a la Comunidad',
      joinPrompt: 'Debes ser miembro para hacer checkout',

      insufficientTrust: 'Confianza Insuficiente',
      trustRequired: 'Necesitas {{required}} de confianza para usar enlaces de checkout',
      currentTrust: 'Tu confianza actual',
      earnTrust: 'Cómo ganar confianza',

      successTitle: '¡Éxito!',
      successMessage: 'Recibiste {{units}} {{unit}} de {{item}}',
      trustAwarded: '+{{trust}} confianza otorgada',
      thankYou: '¡Gracias por compartir!',
      done: 'Hecho',
      goToCommunity: 'Ir a la Comunidad',

      linkInactive: 'Enlace Ya No Activo',
      linkExpired: 'Este enlace de checkout ha expirado o sido revocado',
      shareCompleted: 'Este recurso ha sido completado',
      shareDepletedTitle: '¡Todo Terminado!',
      shareDepleted: 'Este recurso ha sido completamente reclamado',
      poolEmpty: 'Pool Temporalmente Vacío',
      poolEmptyMessage: 'Este pool está actualmente sin existencias. Vuelve más tarde.',
      invalidUnits: 'Cantidad Inválida',
      exceedsMax: 'La cantidad excede el máximo permitido ({{max}} {{unit}})',
      exceedsAvailable: 'Solo quedan {{available}} {{unit}}',
      mustBePositive: 'La cantidad debe ser mayor que 0',
      checkoutFailed: 'Checkout Fallido',
      tryAgain: 'Por favor intenta de nuevo',
      rateLimit: 'Límite de Tasa Excedido',
      rateLimitMessage: 'Has hecho demasiados checkouts recientemente. Por favor espera {{time}} antes de intentar de nuevo.',
      cooldown: 'Enfriamiento Activo',
      cooldownMessage: 'Por favor espera {{time}} antes de usar este enlace de nuevo.',

      loading: 'Cargando checkout...',
      loadingFailed: 'Error al cargar enlace de checkout',
      notFound: 'Enlace de checkout no encontrado',

      scanToCheckout: 'Escanear para Checkout',
      mobileFriendly: 'Optimizado para móvil para escaneo fácil',

      backToCommunity: 'Volver a {{community}}',
      unitsGeneric: 'unidades',
    },
  },
  hi: {
    checkoutPage: {
      from: 'से',
      pool: 'पूल',
      share: 'संसाधन',

      selectUnits: 'आपको कितना चाहिए?',
      unitsLabel: '{{unit}}',
      unitsPlaceholder: 'मात्रा दर्ज करें',
      maxAllowed: 'प्रति चेकआउट अधिकतम',
      available: 'उपलब्ध',
      unlimited: 'असीमित',
      completeCheckout: 'चेकआउट पूर्ण करें',
      processing: 'प्रसंस्करण...',

      loginToCheckout: 'चेकआउट के लिए लॉगिन करें',
      loginPrompt: 'चेकआउट पूर्ण करने के लिए आपको लॉग इन होना चाहिए',
      notMember: '{{community}} के सदस्य नहीं हैं?',
      joinCommunity: 'समुदाय में शामिल हों',
      joinPrompt: 'चेकआउट के लिए आपको सदस्य होना चाहिए',

      insufficientTrust: 'अपर्याप्त विश्वास',
      trustRequired: 'चेकआउट लिंक उपयोग करने के लिए आपको {{required}} विश्वास चाहिए',
      currentTrust: 'आपका वर्तमान विश्वास',
      earnTrust: 'विश्वास कैसे अर्जित करें',

      successTitle: 'सफलता!',
      successMessage: 'आपको {{item}} की {{units}} {{unit}} मिली',
      trustAwarded: '+{{trust}} विश्वास प्रदान किया गया',
      thankYou: 'साझा करने के लिए धन्यवाद!',
      done: 'पूर्ण',
      goToCommunity: 'समुदाय पर जाएं',

      linkInactive: 'लिंक अब सक्रिय नहीं',
      linkExpired: 'यह चेकआउट लिंक समाप्त हो गया है या निरस्त कर दिया गया है',
      shareCompleted: 'यह संसाधन पूर्ण हो गया है',
      shareDepletedTitle: 'सब खत्म!',
      shareDepleted: 'यह संसाधन पूरी तरह से दावा किया गया है',
      poolEmpty: 'पूल अस्थायी रूप से खाली',
      poolEmptyMessage: 'यह पूल वर्तमान में स्टॉक से बाहर है। बाद में वापस आएं।',
      invalidUnits: 'अमान्य मात्रा',
      exceedsMax: 'मात्रा अधिकतम अनुमत से अधिक है ({{max}} {{unit}})',
      exceedsAvailable: 'केवल {{available}} {{unit}} शेष',
      mustBePositive: 'मात्रा 0 से अधिक होनी चाहिए',
      checkoutFailed: 'चेकआउट विफल',
      tryAgain: 'कृपया फिर से प्रयास करें',
      rateLimit: 'दर सीमा पार',
      rateLimitMessage: 'आपने हाल ही में बहुत सारे चेकआउट किए हैं। कृपया फिर से प्रयास करने से पहले {{time}} प्रतीक्षा करें।',
      cooldown: 'कूलडाउन सक्रिय',
      cooldownMessage: 'कृपया इस लिंक का फिर से उपयोग करने से पहले {{time}} प्रतीक्षा करें।',

      loading: 'चेकआउट लोड हो रहा है...',
      loadingFailed: 'चेकआउट लिंक लोड करने में विफल',
      notFound: 'चेकआउट लिंक नहीं मिला',

      scanToCheckout: 'चेकआउट के लिए स्कैन करें',
      mobileFriendly: 'आसान स्कैनिंग के लिए मोबाइल-अनुकूलित',

      backToCommunity: '{{community}} पर वापस जाएं',
      unitsGeneric: 'इकाइयां',
    },
  },
} as const;
