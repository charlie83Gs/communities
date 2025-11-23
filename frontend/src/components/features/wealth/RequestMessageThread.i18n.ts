import type { Dict } from '@/i18n/makeTranslator';

export const requestMessageThreadDict = {
  en: {
    requestMessageThread: {
      title: 'Messages',
      noMessages: 'No messages yet',
      startConversation: 'Start a conversation about this request',
      placeholder: 'Type a message...',
      send: 'Send',
      sending: 'Sending...',
      today: 'Today',
      yesterday: 'Yesterday',
      messagingDisabled: 'Messaging is disabled for completed requests',
      errorSending: 'Failed to send message',
      you: 'You',
    },
  },
  es: {
    requestMessageThread: {
      title: 'Mensajes',
      noMessages: 'Aun no hay mensajes',
      startConversation: 'Inicia una conversacion sobre esta solicitud',
      placeholder: 'Escribe un mensaje...',
      send: 'Enviar',
      sending: 'Enviando...',
      today: 'Hoy',
      yesterday: 'Ayer',
      messagingDisabled: 'Los mensajes estan deshabilitados para solicitudes completadas',
      errorSending: 'Error al enviar mensaje',
      you: 'Tu',
    },
  },
  hi: {
    requestMessageThread: {
      title: 'संदेश',
      noMessages: 'अभी तक कोई संदेश नहीं',
      startConversation: 'इस अनुरोध के बारे में बातचीत शुरू करें',
      placeholder: 'एक संदेश लिखें...',
      send: 'भेजें',
      sending: 'भेज रहे हैं...',
      today: 'आज',
      yesterday: 'कल',
      messagingDisabled: 'पूर्ण अनुरोधों के लिए संदेश अक्षम है',
      errorSending: 'संदेश भेजने में विफल',
      you: 'आप',
    },
  },
} as const satisfies Dict;
