import type { Dict } from '@/i18n/makeTranslator';

export const itemsIndexDict = {
  en: {
    itemsIndex: {
      title: 'Items Management',
      subtitle: 'Manage shareable items for wealth, pools, and needs',
      backToResources: 'Back to Resources',
      loading: 'Loading...',
      error: 'Failed to load items',
      permissionDenied: 'Permission Denied',
      permissionDeniedDescription: 'You do not have permission to manage items. This requires a higher trust level in the community.',
      checkingPermissions: 'Checking permissions...',
    },
  },
  es: {
    itemsIndex: {
      title: 'Gestion de Articulos',
      subtitle: 'Administrar articulos compartibles para riqueza, grupos y necesidades',
      backToResources: 'Volver a Recursos',
      loading: 'Cargando...',
      error: 'Error al cargar articulos',
      permissionDenied: 'Permiso Denegado',
      permissionDeniedDescription: 'No tiene permiso para administrar articulos. Esto requiere un nivel de confianza mas alto en la comunidad.',
      checkingPermissions: 'Verificando permisos...',
    },
  },
  hi: {
    itemsIndex: {
      title: 'वस्तुओं का प्रबंधन',
      subtitle: 'संपत्ति, पूल और आवश्यकताओं के लिए साझा करने योग्य वस्तुओं का प्रबंधन करें',
      backToResources: 'संसाधनों पर वापस जाएं',
      loading: 'लोड हो रहा है...',
      error: 'वस्तुएं लोड करने में विफल',
      permissionDenied: 'अनुमति अस्वीकृत',
      permissionDeniedDescription: 'आपको वस्तुओं का प्रबंधन करने की अनुमति नहीं है। इसके लिए समुदाय में उच्च विश्वास स्तर की आवश्यकता है।',
      checkingPermissions: 'अनुमतियां जांच रहे हैं...',
    },
  },
} as const satisfies Dict;
