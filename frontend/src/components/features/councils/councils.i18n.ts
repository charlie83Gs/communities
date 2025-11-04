import type { Dict } from '@/i18n/makeTranslator';

export const councilsDict = {
  en: {
    councils: {
      // List view
      title: 'Community Councils',
      createCouncil: 'Create Council',
      sortByTrust: 'Sort by Trust',
      sortByDate: 'Sort by Date',
      orderDesc: 'Descending',
      orderAsc: 'Ascending',
      noCouncilsFound: 'No councils found',
      loading: 'Loading councils...',

      // Council card
      trustScore: 'Trust Score',
      members: 'Members',
      manager: 'manager',
      managers: 'managers',
      viewDetails: 'View Details',
      inventoryItems: 'items in inventory',
      inventoryItem: 'item in inventory',
      emptyInventory: 'No inventory',

      // Trust button
      trust: 'Trust',
      trusted: 'Trusted',
      trustCouncil: 'Trust this council',
      removeTrust: 'Remove trust',
      trustingCouncil: 'Trusting...',
      removingTrust: 'Removing trust...',
      trustSuccess: 'Trust awarded successfully',
      trustRemoved: 'Trust removed successfully',
      trustError: 'Failed to award trust',
      removeTrustError: 'Failed to remove trust',

      // Create council form
      createCouncilTitle: 'Create New Council',
      councilName: 'Council Name',
      councilNamePlaceholder: 'Enter council name',
      councilDescription: 'Description',
      councilDescriptionPlaceholder: 'Describe the council purpose and mission',
      submit: 'Create Council',
      cancel: 'Cancel',
      creating: 'Creating council...',
      successMessage: 'Council created successfully',
      errorMessage: 'Failed to create council',
      nameRequired: 'Council name is required',
      descriptionRequired: 'Description is required',

      // Council details
      councilDetails: 'Council Details',
      description: 'Description',
      noDescription: 'No description provided',
      createdBy: 'Created by',
      createdAt: 'Created on',
      managersSection: 'Managers',
      noManagers: 'No managers assigned',
      addManager: 'Add Manager',
      removeManager: 'Remove',
      managersDescription: 'Council managers can share wealth and create initiatives on behalf of the council',
      searchMembers: 'Search members',
      searchMembersPlaceholder: 'Type to search members...',
      noMembersFound: 'No members found',
      add: 'Add',
      adding: 'Adding...',
      addedOn: 'Added on',

      // Inventory
      inventory: 'Inventory',
      noInventory: 'Council inventory is empty',
      quantity: 'Quantity',
      category: 'Category',

      // Transactions
      transactions: 'Transaction History',
      noTransactions: 'No transactions recorded',
      transactionReceived: 'Received',
      transactionUsed: 'Used',
      transactionTransferred: 'Transferred',
      from: 'from',
      to: 'to',
      loadMore: 'Load More',

      // Permissions
      noPermissionCreate: 'You do not have permission to create councils',
      noPermissionManage: 'You do not have permission to manage this council',
      mustBeMember: 'You must be a community member to view councils',

      // Dialogs
      confirmDelete: 'Are you sure you want to delete this council?',
      delete: 'Delete Council',
      deleting: 'Deleting...',
      deleteSuccess: 'Council deleted successfully',
      deleteError: 'Failed to delete council',

      // Edit form
      editCouncil: 'Edit Council',
      editing: 'Saving changes...',
      editSuccess: 'Council updated successfully',
      editError: 'Failed to update council',
      save: 'Save Changes',

      // Initiatives
      initiativesTab: 'Initiatives',
      createInitiative: 'Create Initiative',
    },
  },
  es: {
    councils: {
      // List view
      title: 'Consejos de la Comunidad',
      createCouncil: 'Crear Consejo',
      sortByTrust: 'Ordenar por Confianza',
      sortByDate: 'Ordenar por Fecha',
      orderDesc: 'Descendente',
      orderAsc: 'Ascendente',
      noCouncilsFound: 'No se encontraron consejos',
      loading: 'Cargando consejos...',

      // Council card
      trustScore: 'Puntuación de Confianza',
      members: 'Miembros',
      manager: 'gestor',
      managers: 'gestores',
      viewDetails: 'Ver Detalles',
      inventoryItems: 'artículos en inventario',
      inventoryItem: 'artículo en inventario',
      emptyInventory: 'Sin inventario',

      // Trust button
      trust: 'Confiar',
      trusted: 'Confiado',
      trustCouncil: 'Confiar en este consejo',
      removeTrust: 'Quitar confianza',
      trustingCouncil: 'Confiando...',
      removingTrust: 'Quitando confianza...',
      trustSuccess: 'Confianza otorgada exitosamente',
      trustRemoved: 'Confianza eliminada exitosamente',
      trustError: 'Error al otorgar confianza',
      removeTrustError: 'Error al quitar confianza',

      // Create council form
      createCouncilTitle: 'Crear Nuevo Consejo',
      councilName: 'Nombre del Consejo',
      councilNamePlaceholder: 'Ingrese el nombre del consejo',
      councilDescription: 'Descripción',
      councilDescriptionPlaceholder: 'Describa el propósito y misión del consejo',
      submit: 'Crear Consejo',
      cancel: 'Cancelar',
      creating: 'Creando consejo...',
      successMessage: 'Consejo creado exitosamente',
      errorMessage: 'Error al crear el consejo',
      nameRequired: 'El nombre del consejo es obligatorio',
      descriptionRequired: 'La descripción es obligatoria',

      // Council details
      councilDetails: 'Detalles del Consejo',
      description: 'Descripción',
      noDescription: 'No se proporcionó descripción',
      createdBy: 'Creado por',
      createdAt: 'Creado el',
      managersSection: 'Gestores',
      noManagers: 'No hay gestores asignados',
      addManager: 'Agregar Gestor',
      removeManager: 'Eliminar',
      managersDescription: 'Los gestores del consejo pueden compartir riqueza y crear iniciativas en nombre del consejo',
      searchMembers: 'Buscar miembros',
      searchMembersPlaceholder: 'Escriba para buscar miembros...',
      noMembersFound: 'No se encontraron miembros',
      add: 'Agregar',
      adding: 'Agregando...',
      addedOn: 'Agregado el',

      // Inventory
      inventory: 'Inventario',
      noInventory: 'El inventario del consejo está vacío',
      quantity: 'Cantidad',
      category: 'Categoría',

      // Transactions
      transactions: 'Historial de Transacciones',
      noTransactions: 'No se registraron transacciones',
      transactionReceived: 'Recibido',
      transactionUsed: 'Usado',
      transactionTransferred: 'Transferido',
      from: 'de',
      to: 'a',
      loadMore: 'Cargar Más',

      // Permissions
      noPermissionCreate: 'No tienes permiso para crear consejos',
      noPermissionManage: 'No tienes permiso para gestionar este consejo',
      mustBeMember: 'Debes ser miembro de la comunidad para ver los consejos',

      // Dialogs
      confirmDelete: '¿Estás seguro de que quieres eliminar este consejo?',
      delete: 'Eliminar Consejo',
      deleting: 'Eliminando...',
      deleteSuccess: 'Consejo eliminado exitosamente',
      deleteError: 'Error al eliminar el consejo',

      // Edit form
      editCouncil: 'Editar Consejo',
      editing: 'Guardando cambios...',
      editSuccess: 'Consejo actualizado exitosamente',
      editError: 'Error al actualizar el consejo',
      save: 'Guardar Cambios',

      // Initiatives
      initiativesTab: 'Iniciativas',
      createInitiative: 'Crear Iniciativa',
    },
  },
  hi: {
    councils: {
      // List view
      title: 'समुदाय परिषदें',
      createCouncil: 'परिषद बनाएं',
      sortByTrust: 'विश्वास के अनुसार क्रमबद्ध करें',
      sortByDate: 'तिथि के अनुसार क्रमबद्ध करें',
      orderDesc: 'अवरोही',
      orderAsc: 'आरोही',
      noCouncilsFound: 'कोई परिषद नहीं मिली',
      loading: 'परिषद लोड हो रही हैं...',

      // Council card
      trustScore: 'विश्वास स्कोर',
      members: 'सदस्य',
      manager: 'प्रबंधक',
      managers: 'प्रबंधक',
      viewDetails: 'विवरण देखें',
      inventoryItems: 'इन्वेंटरी में आइटम',
      inventoryItem: 'इन्वेंटरी में आइटम',
      emptyInventory: 'कोई इन्वेंटरी नहीं',

      // Trust button
      trust: 'विश्वास करें',
      trusted: 'विश्वसनीय',
      trustCouncil: 'इस परिषद पर विश्वास करें',
      removeTrust: 'विश्वास हटाएं',
      trustingCouncil: 'विश्वास कर रहे हैं...',
      removingTrust: 'विश्वास हटा रहे हैं...',
      trustSuccess: 'विश्वास सफलतापूर्वक प्रदान किया गया',
      trustRemoved: 'विश्वास सफलतापूर्वक हटाया गया',
      trustError: 'विश्वास प्रदान करने में विफल',
      removeTrustError: 'विश्वास हटाने में विफल',

      // Create council form
      createCouncilTitle: 'नई परिषद बनाएं',
      councilName: 'परिषद का नाम',
      councilNamePlaceholder: 'परिषद का नाम दर्ज करें',
      councilDescription: 'विवरण',
      councilDescriptionPlaceholder: 'परिषद के उद्देश्य और मिशन का वर्णन करें',
      submit: 'परिषद बनाएं',
      cancel: 'रद्द करें',
      creating: 'परिषद बनाई जा रही है...',
      successMessage: 'परिषद सफलतापूर्वक बनाई गई',
      errorMessage: 'परिषद बनाने में विफल',
      nameRequired: 'परिषद का नाम आवश्यक है',
      descriptionRequired: 'विवरण आवश्यक है',

      // Council details
      councilDetails: 'परिषद विवरण',
      description: 'विवरण',
      noDescription: 'कोई विवरण प्रदान नहीं किया गया',
      createdBy: 'द्वारा बनाया गया',
      createdAt: 'बनाया गया',
      managersSection: 'प्रबंधक',
      noManagers: 'कोई प्रबंधक नियुक्त नहीं',
      addManager: 'प्रबंधक जोड़ें',
      removeManager: 'हटाएं',
      managersDescription: 'परिषद प्रबंधक परिषद की ओर से धन साझा कर सकते हैं और पहल बना सकते हैं',
      searchMembers: 'सदस्य खोजें',
      searchMembersPlaceholder: 'सदस्य खोजने के लिए टाइप करें...',
      noMembersFound: 'कोई सदस्य नहीं मिला',
      add: 'जोड़ें',
      adding: 'जोड़ा जा रहा है...',
      addedOn: 'जोड़ा गया',

      // Inventory
      inventory: 'इन्वेंटरी',
      noInventory: 'परिषद इन्वेंटरी खाली है',
      quantity: 'मात्रा',
      category: 'श्रेणी',

      // Transactions
      transactions: 'लेनदेन इतिहास',
      noTransactions: 'कोई लेनदेन दर्ज नहीं',
      transactionReceived: 'प्राप्त',
      transactionUsed: 'उपयोग किया गया',
      transactionTransferred: 'स्थानांतरित',
      from: 'से',
      to: 'को',
      loadMore: 'और लोड करें',

      // Permissions
      noPermissionCreate: 'आपके पास परिषद बनाने की अनुमति नहीं है',
      noPermissionManage: 'आपके पास इस परिषद को प्रबंधित करने की अनुमति नहीं है',
      mustBeMember: 'परिषदें देखने के लिए आपको समुदाय का सदस्य होना चाहिए',

      // Dialogs
      confirmDelete: 'क्या आप वाकई इस परिषद को हटाना चाहते हैं?',
      delete: 'परिषद हटाएं',
      deleting: 'हटाया जा रहा है...',
      deleteSuccess: 'परिषद सफलतापूर्वक हटाई गई',
      deleteError: 'परिषद हटाने में विफल',

      // Edit form
      editCouncil: 'परिषद संपादित करें',
      editing: 'परिवर्तन सहेजे जा रहे हैं...',
      editSuccess: 'परिषद सफलतापूर्वक अपडेट की गई',
      editError: 'परिषद अपडेट करने में विफल',
      save: 'परिवर्तन सहेजें',

      // Initiatives
      initiativesTab: 'पहल',
      createInitiative: 'पहल बनाएं',
    },
  },
} as const satisfies Dict;
