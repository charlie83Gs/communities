export const itemsDict = {
  en: {
    items: {
      createForm: {
        title: 'Create New Item',
        labels: {
          name: 'Name',
          description: 'Description',
          kind: 'Kind',
          wealthValue: 'Wealth Value',
          translations: 'Translations',
        },
        placeholders: {
          name: 'e.g., Carrots, Car Repair Service',
          description: 'Optional description',
        },
        kindOptions: {
          object: 'Object',
          service: 'Service',
        },
        languageTabs: {
          en: 'English',
          es: 'Spanish',
          hi: 'Hindi',
        },
        buttons: {
          create: 'Create Item',
          creating: 'Creating...',
          cancel: 'Cancel',
        },
        hints: {
          wealthValue: 'Numeric value for community wealth statistics (0.01 - 10,000, max 2 decimal places)',
          atLeastOne: 'At least one language must be filled (preferably your current language)',
          filledLanguages: 'languages filled',
        },
        errors: {
          nameRequired: 'Name is required',
          nameTooLong: 'Name must be 200 characters or less',
          wealthValueRequired: 'Wealth value is required',
          wealthValueInvalid: 'Please enter a valid number (max 2 decimal places)',
          wealthValuePositive: 'Wealth value must be greater than 0',
          wealthValueMax: 'Wealth value cannot exceed 10,000',
          atLeastOneLanguage: 'At least one language must be provided',
        },
      },
      editForm: {
        title: 'Edit Item',
        defaultItemWarning: 'This is a default item and cannot be edited.',
        buttons: {
          save: 'Save Changes',
          saving: 'Saving...',
          cancel: 'Cancel',
          close: 'Close',
        },
        errors: {
          cannotEditDefault: 'Cannot edit default items',
        },
      },
      card: {
        badges: {
          kind: 'kind',
          default: 'Default',
        },
        kindLabels: {
          object: 'object',
          service: 'service',
        },
        value: 'Value',
        wealthShares: 'wealth shares',
        actions: {
          edit: 'Edit item',
          delete: 'Delete item',
        },
        deleteTooltips: {
          cannotDeleteDefault: 'Cannot delete default item',
          cannotDeleteWithShares: 'Cannot delete item with active wealth shares',
          canDelete: 'Delete this item',
        },
        fallbackLanguage: 'Not available in your language (showing {{language}})',
      },
      list: {
        search: 'Search items...',
        filters: {
          allTypes: 'All Types',
          objects: 'Objects',
          services: 'Services',
        },
        sort: {
          byName: 'Sort by Name',
          byUsage: 'Sort by Usage',
          byDate: 'Sort by Date',
        },
        loading: 'Loading items...',
        noItems: 'No items found',
        noMatch: 'No items match your filters',
      },
    },
  },
  es: {
    items: {
      createForm: {
        title: 'Crear Nuevo Artículo',
        labels: {
          name: 'Nombre',
          description: 'Descripción',
          kind: 'Tipo',
          wealthValue: 'Valor de Riqueza',
          translations: 'Traducciones',
        },
        placeholders: {
          name: 'ej., Zanahorias, Servicio de Reparación de Autos',
          description: 'Descripción opcional',
        },
        kindOptions: {
          object: 'Objeto',
          service: 'Servicio',
        },
        languageTabs: {
          en: 'Inglés',
          es: 'Español',
          hi: 'Hindi',
        },
        buttons: {
          create: 'Crear Artículo',
          creating: 'Creando...',
          cancel: 'Cancelar',
        },
        hints: {
          wealthValue: 'Valor numérico para estadísticas de riqueza comunitaria (0.01 - 10,000, máx 2 decimales)',
          atLeastOne: 'Al menos un idioma debe estar completo (preferiblemente tu idioma actual)',
          filledLanguages: 'idiomas completados',
        },
        errors: {
          nameRequired: 'El nombre es obligatorio',
          nameTooLong: 'El nombre debe tener 200 caracteres o menos',
          wealthValueRequired: 'El valor de riqueza es obligatorio',
          wealthValueInvalid: 'Por favor ingresa un número válido (máx 2 decimales)',
          wealthValuePositive: 'El valor de riqueza debe ser mayor a 0',
          wealthValueMax: 'El valor de riqueza no puede exceder 10,000',
          atLeastOneLanguage: 'Debe proporcionar al menos un idioma',
        },
      },
      editForm: {
        title: 'Editar Artículo',
        defaultItemWarning: 'Este es un artículo predeterminado y no se puede editar.',
        buttons: {
          save: 'Guardar Cambios',
          saving: 'Guardando...',
          cancel: 'Cancelar',
          close: 'Cerrar',
        },
        errors: {
          cannotEditDefault: 'No se pueden editar artículos predeterminados',
        },
      },
      card: {
        badges: {
          kind: 'tipo',
          default: 'Predeterminado',
        },
        kindLabels: {
          object: 'objeto',
          service: 'servicio',
        },
        value: 'Valor',
        wealthShares: 'acciones de riqueza',
        actions: {
          edit: 'Editar artículo',
          delete: 'Eliminar artículo',
        },
        deleteTooltips: {
          cannotDeleteDefault: 'No se puede eliminar artículo predeterminado',
          cannotDeleteWithShares: 'No se puede eliminar artículo con acciones de riqueza activas',
          canDelete: 'Eliminar este artículo',
        },
        fallbackLanguage: 'No disponible en tu idioma (mostrando {{language}})',
      },
      list: {
        search: 'Buscar artículos...',
        filters: {
          allTypes: 'Todos los Tipos',
          objects: 'Objetos',
          services: 'Servicios',
        },
        sort: {
          byName: 'Ordenar por Nombre',
          byUsage: 'Ordenar por Uso',
          byDate: 'Ordenar por Fecha',
        },
        loading: 'Cargando artículos...',
        noItems: 'No se encontraron artículos',
        noMatch: 'Ningún artículo coincide con tus filtros',
      },
    },
  },
  hi: {
    items: {
      createForm: {
        title: 'नई वस्तु बनाएं',
        labels: {
          name: 'नाम',
          description: 'विवरण',
          kind: 'प्रकार',
          wealthValue: 'संपत्ति मूल्य',
          translations: 'अनुवाद',
        },
        placeholders: {
          name: 'उदा., गाजर, कार मरम्मत सेवा',
          description: 'वैकल्पिक विवरण',
        },
        kindOptions: {
          object: 'वस्तु',
          service: 'सेवा',
        },
        languageTabs: {
          en: 'अंग्रेज़ी',
          es: 'स्पेनिश',
          hi: 'हिंदी',
        },
        buttons: {
          create: 'वस्तु बनाएं',
          creating: 'बनाया जा रहा है...',
          cancel: 'रद्द करें',
        },
        hints: {
          wealthValue: 'सामुदायिक संपत्ति सांख्यिकी के लिए संख्यात्मक मूल्य (0.01 - 10,000, अधिकतम 2 दशमलव)',
          atLeastOne: 'कम से कम एक भाषा भरी होनी चाहिए (अधिमानतः आपकी वर्तमान भाषा)',
          filledLanguages: 'भाषाएँ भरी गई',
        },
        errors: {
          nameRequired: 'नाम आवश्यक है',
          nameTooLong: 'नाम 200 वर्णों या उससे कम होना चाहिए',
          wealthValueRequired: 'संपत्ति मूल्य आवश्यक है',
          wealthValueInvalid: 'कृपया एक वैध संख्या दर्ज करें (अधिकतम 2 दशमलव)',
          wealthValuePositive: 'संपत्ति मूल्य 0 से अधिक होना चाहिए',
          wealthValueMax: 'संपत्ति मूल्य 10,000 से अधिक नहीं हो सकता',
          atLeastOneLanguage: 'कम से कम एक भाषा प्रदान की जानी चाहिए',
        },
      },
      editForm: {
        title: 'वस्तु संपादित करें',
        defaultItemWarning: 'यह एक डिफ़ॉल्ट वस्तु है और संपादित नहीं की जा सकती।',
        buttons: {
          save: 'परिवर्तन सहेजें',
          saving: 'सहेजा जा रहा है...',
          cancel: 'रद्द करें',
          close: 'बंद करें',
        },
        errors: {
          cannotEditDefault: 'डिफ़ॉल्ट वस्तुओं को संपादित नहीं किया जा सकता',
        },
      },
      card: {
        badges: {
          kind: 'प्रकार',
          default: 'डिफ़ॉल्ट',
        },
        kindLabels: {
          object: 'वस्तु',
          service: 'सेवा',
        },
        value: 'मूल्य',
        wealthShares: 'संपत्ति शेयर',
        actions: {
          edit: 'वस्तु संपादित करें',
          delete: 'वस्तु हटाएं',
        },
        deleteTooltips: {
          cannotDeleteDefault: 'डिफ़ॉल्ट वस्तु को हटाया नहीं जा सकता',
          cannotDeleteWithShares: 'सक्रिय संपत्ति शेयरों वाली वस्तु को हटाया नहीं जा सकता',
          canDelete: 'इस वस्तु को हटाएं',
        },
        fallbackLanguage: 'आपकी भाषा में उपलब्ध नहीं ({{language}} दिखा रहा है)',
      },
      list: {
        search: 'वस्तुएं खोजें...',
        filters: {
          allTypes: 'सभी प्रकार',
          objects: 'वस्तुएं',
          services: 'सेवाएं',
        },
        sort: {
          byName: 'नाम से क्रमबद्ध करें',
          byUsage: 'उपयोग से क्रमबद्ध करें',
          byDate: 'तारीख से क्रमबद्ध करें',
        },
        loading: 'वस्तुएं लोड हो रही हैं...',
        noItems: 'कोई वस्तु नहीं मिली',
        noMatch: 'आपके फिल्टर से कोई वस्तु मेल नहीं खाती',
      },
    },
  },
} as const;

export type ItemsDict = typeof itemsDict['en']['items'];
