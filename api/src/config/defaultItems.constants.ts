/**
 * Default Community Items Constants
 *
 * Comprehensive, internationalized default items for community creation.
 * Items are organized by category for clarity and include translations
 * for English (en), Spanish (es), and Hindi (hi).
 *
 * These items are automatically created when a new community is initialized,
 * providing a standardized starting point for wealth sharing.
 */

/**
 * Translation structure for an item
 */
export interface DefaultItemTranslation {
  name: string;
  description?: string;
}

/**
 * Default item template with internationalization
 */
export interface DefaultItemTemplate {
  kind: 'object' | 'service';
  wealthValue: number;
  category: string; // For documentation/organization
  translations: {
    en: DefaultItemTranslation;
    es: DefaultItemTranslation;
    hi: DefaultItemTranslation;
  };
}

/**
 * All default items organized by category
 */

// ==================== OBJECTS ====================

// --- Fresh Produce ---
const FRESH_PRODUCE: DefaultItemTemplate[] = [
  {
    kind: 'object',
    wealthValue: 5,
    category: 'Fresh Produce',
    translations: {
      en: {
        name: 'Fresh Vegetables (kg)',
        description: 'Fresh vegetables sold by weight',
      },
      es: {
        name: 'Verduras Frescas (kg)',
        description: 'Verduras frescas vendidas por peso',
      },
      hi: {
        name: 'ताज़ी सब्जियाँ (किलो)',
        description: 'वज़न के अनुसार ताज़ी सब्जियाँ',
      },
    },
  },
  {
    kind: 'object',
    wealthValue: 6,
    category: 'Fresh Produce',
    translations: {
      en: {
        name: 'Fresh Fruits (kg)',
        description: 'Fresh fruits sold by weight',
      },
      es: {
        name: 'Frutas Frescas (kg)',
        description: 'Frutas frescas vendidas por peso',
      },
      hi: {
        name: 'ताज़े फल (किलो)',
        description: 'वज़न के अनुसार ताज़े फल',
      },
    },
  },
  {
    kind: 'object',
    wealthValue: 8,
    category: 'Fresh Produce',
    translations: {
      en: {
        name: 'Herbs & Greens (bunch)',
        description: 'Fresh herbs, lettuce, spinach, etc.',
      },
      es: {
        name: 'Hierbas y Verduras (manojo)',
        description: 'Hierbas frescas, lechuga, espinacas, etc.',
      },
      hi: {
        name: 'जड़ी-बूटियाँ और साग (गुच्छा)',
        description: 'ताज़ी जड़ी-बूटियाँ, सलाद, पालक, आदि',
      },
    },
  },
];

// --- Packaged Food ---
const PACKAGED_FOOD: DefaultItemTemplate[] = [
  {
    kind: 'object',
    wealthValue: 3,
    category: 'Packaged Food',
    translations: {
      en: {
        name: 'Canned Food (unit)',
        description: 'Non-perishable canned food items',
      },
      es: {
        name: 'Alimentos Enlatados (unidad)',
        description: 'Alimentos enlatados no perecederos',
      },
      hi: {
        name: 'डिब्बाबंद खाद्य पदार्थ (इकाई)',
        description: 'खराब न होने वाले डिब्बाबंद खाद्य पदार्थ',
      },
    },
  },
  {
    kind: 'object',
    wealthValue: 2,
    category: 'Packaged Food',
    translations: {
      en: {
        name: 'Bread (loaf)',
        description: 'Fresh baked bread',
      },
      es: {
        name: 'Pan (pieza)',
        description: 'Pan fresco horneado',
      },
      hi: {
        name: 'ब्रेड (डबलरोटी)',
        description: 'ताज़ी बेकरी ब्रेड',
      },
    },
  },
  {
    kind: 'object',
    wealthValue: 4,
    category: 'Packaged Food',
    translations: {
      en: {
        name: 'Pasta/Rice (kg)',
        description: 'Dry pasta or rice',
      },
      es: {
        name: 'Pasta/Arroz (kg)',
        description: 'Pasta o arroz seco',
      },
      hi: {
        name: 'पास्ता/चावल (किलो)',
        description: 'सूखा पास्ता या चावल',
      },
    },
  },
  {
    kind: 'object',
    wealthValue: 5,
    category: 'Packaged Food',
    translations: {
      en: {
        name: 'Cooking Oil (liter)',
        description: 'Vegetable or olive oil',
      },
      es: {
        name: 'Aceite de Cocina (litro)',
        description: 'Aceite vegetal o de oliva',
      },
      hi: {
        name: 'खाना पकाने का तेल (लीटर)',
        description: 'वनस्पति या जैतून का तेल',
      },
    },
  },
  {
    kind: 'object',
    wealthValue: 6,
    category: 'Packaged Food',
    translations: {
      en: {
        name: 'Baked Goods (unit)',
        description: 'Cookies, cakes, pastries',
      },
      es: {
        name: 'Productos Horneados (unidad)',
        description: 'Galletas, pasteles, bollería',
      },
      hi: {
        name: 'बेक किए गए उत्पाद (इकाई)',
        description: 'कुकीज़, केक, पेस्ट्री',
      },
    },
  },
];

// --- Beverages ---
const BEVERAGES: DefaultItemTemplate[] = [
  {
    kind: 'object',
    wealthValue: 3,
    category: 'Beverages',
    translations: {
      en: {
        name: 'Coffee/Tea (package)',
        description: 'Ground coffee or tea bags',
      },
      es: {
        name: 'Café/Té (paquete)',
        description: 'Café molido o bolsitas de té',
      },
      hi: {
        name: 'कॉफ़ी/चाय (पैकेट)',
        description: 'पिसी कॉफ़ी या चाय की थैली',
      },
    },
  },
  {
    kind: 'object',
    wealthValue: 4,
    category: 'Beverages',
    translations: {
      en: {
        name: 'Juice/Soft Drink (liter)',
        description: 'Bottled beverages',
      },
      es: {
        name: 'Jugo/Refresco (litro)',
        description: 'Bebidas embotelladas',
      },
      hi: {
        name: 'जूस/शीतल पेय (लीटर)',
        description: 'बोतलबंद पेय पदार्थ',
      },
    },
  },
];

// --- Clothing ---
const CLOTHING: DefaultItemTemplate[] = [
  {
    kind: 'object',
    wealthValue: 10,
    category: 'Clothing',
    translations: {
      en: {
        name: 'Clothing Item (adult)',
        description: 'Shirts, pants, jackets, etc. for adults',
      },
      es: {
        name: 'Prenda de Vestir (adulto)',
        description: 'Camisas, pantalones, chaquetas, etc. para adultos',
      },
      hi: {
        name: 'कपड़े की वस्तु (वयस्क)',
        description: 'वयस्कों के लिए शर्ट, पैंट, जैकेट आदि',
      },
    },
  },
  {
    kind: 'object',
    wealthValue: 8,
    category: 'Clothing',
    translations: {
      en: {
        name: 'Clothing Item (children)',
        description: 'Clothing for children',
      },
      es: {
        name: 'Prenda de Vestir (niños)',
        description: 'Ropa para niños',
      },
      hi: {
        name: 'कपड़े की वस्तु (बच्चे)',
        description: 'बच्चों के लिए कपड़े',
      },
    },
  },
  {
    kind: 'object',
    wealthValue: 12,
    category: 'Clothing',
    translations: {
      en: {
        name: 'Shoes/Footwear (pair)',
        description: 'Shoes, boots, sandals, etc.',
      },
      es: {
        name: 'Zapatos/Calzado (par)',
        description: 'Zapatos, botas, sandalias, etc.',
      },
      hi: {
        name: 'जूते/पदत्राण (जोड़ा)',
        description: 'जूते, बूट, चप्पल, आदि',
      },
    },
  },
  {
    kind: 'object',
    wealthValue: 5,
    category: 'Clothing',
    translations: {
      en: {
        name: 'Accessories (item)',
        description: 'Belts, hats, scarves, bags, etc.',
      },
      es: {
        name: 'Accesorios (artículo)',
        description: 'Cinturones, sombreros, bufandas, bolsos, etc.',
      },
      hi: {
        name: 'सामान (वस्तु)',
        description: 'बेल्ट, टोपी, स्कार्फ, बैग आदि',
      },
    },
  },
  {
    kind: 'object',
    wealthValue: 15,
    category: 'Clothing',
    translations: {
      en: {
        name: 'Winter Coat/Jacket',
        description: 'Heavy winter outerwear',
      },
      es: {
        name: 'Abrigo/Chaqueta de Invierno',
        description: 'Ropa de abrigo pesada de invierno',
      },
      hi: {
        name: 'शीतकालीन कोट/जैकेट',
        description: 'भारी सर्दियों के कपड़े',
      },
    },
  },
];

// --- Tools ---
const TOOLS: DefaultItemTemplate[] = [
  {
    kind: 'object',
    wealthValue: 15,
    category: 'Tools',
    translations: {
      en: {
        name: 'Hand Tool',
        description: 'Manual hand tools (hammer, screwdriver, wrench, etc.)',
      },
      es: {
        name: 'Herramienta Manual',
        description: 'Herramientas manuales (martillo, destornillador, llave, etc.)',
      },
      hi: {
        name: 'हाथ का औज़ार',
        description: 'मैन्युअल हाथ के औज़ार (हथौड़ा, पेचकस, रिंच, आदि)',
      },
    },
  },
  {
    kind: 'object',
    wealthValue: 50,
    category: 'Tools',
    translations: {
      en: {
        name: 'Power Tool',
        description: 'Electric or battery-powered tools',
      },
      es: {
        name: 'Herramienta Eléctrica',
        description: 'Herramientas eléctricas o de batería',
      },
      hi: {
        name: 'बिजली का औज़ार',
        description: 'बिजली या बैटरी से चलने वाले औज़ार',
      },
    },
  },
  {
    kind: 'object',
    wealthValue: 20,
    category: 'Tools',
    translations: {
      en: {
        name: 'Garden Tool',
        description: 'Gardening and yard work tools',
      },
      es: {
        name: 'Herramienta de Jardín',
        description: 'Herramientas de jardinería y trabajo de patio',
      },
      hi: {
        name: 'बागवानी का औज़ार',
        description: 'बागवानी और यार्ड के काम के औज़ार',
      },
    },
  },
  {
    kind: 'object',
    wealthValue: 35,
    category: 'Tools',
    translations: {
      en: {
        name: 'Toolbox/Tool Set',
        description: 'Complete set of tools with storage',
      },
      es: {
        name: 'Caja/Juego de Herramientas',
        description: 'Conjunto completo de herramientas con almacenamiento',
      },
      hi: {
        name: 'औज़ार बॉक्स/औज़ार सेट',
        description: 'भंडारण के साथ औज़ारों का पूर्ण सेट',
      },
    },
  },
];

// --- Furniture ---
const FURNITURE: DefaultItemTemplate[] = [
  {
    kind: 'object',
    wealthValue: 50,
    category: 'Furniture',
    translations: {
      en: {
        name: 'Chair',
        description: 'Dining chair, desk chair, or armchair',
      },
      es: {
        name: 'Silla',
        description: 'Silla de comedor, silla de escritorio o sillón',
      },
      hi: {
        name: 'कुर्सी',
        description: 'भोजन कुर्सी, डेस्क कुर्सी या आराम कुर्सी',
      },
    },
  },
  {
    kind: 'object',
    wealthValue: 80,
    category: 'Furniture',
    translations: {
      en: {
        name: 'Table',
        description: 'Dining table, coffee table, or desk',
      },
      es: {
        name: 'Mesa',
        description: 'Mesa de comedor, mesa de café o escritorio',
      },
      hi: {
        name: 'मेज़',
        description: 'भोजन मेज़, कॉफ़ी मेज़ या डेस्क',
      },
    },
  },
  {
    kind: 'object',
    wealthValue: 120,
    category: 'Furniture',
    translations: {
      en: {
        name: 'Bed Frame',
        description: 'Bed frame (mattress separate)',
      },
      es: {
        name: 'Estructura de Cama',
        description: 'Estructura de cama (colchón separado)',
      },
      hi: {
        name: 'पलंग की फ्रेम',
        description: 'बिस्तर की फ्रेम (गद्दा अलग)',
      },
    },
  },
  {
    kind: 'object',
    wealthValue: 150,
    category: 'Furniture',
    translations: {
      en: {
        name: 'Mattress',
        description: 'Sleeping mattress',
      },
      es: {
        name: 'Colchón',
        description: 'Colchón para dormir',
      },
      hi: {
        name: 'गद्दा',
        description: 'सोने का गद्दा',
      },
    },
  },
  {
    kind: 'object',
    wealthValue: 100,
    category: 'Furniture',
    translations: {
      en: {
        name: 'Sofa/Couch',
        description: 'Living room seating',
      },
      es: {
        name: 'Sofá',
        description: 'Asiento de sala de estar',
      },
      hi: {
        name: 'सोफ़ा',
        description: 'लिविंग रूम बैठक',
      },
    },
  },
  {
    kind: 'object',
    wealthValue: 60,
    category: 'Furniture',
    translations: {
      en: {
        name: 'Bookshelf/Storage Unit',
        description: 'Shelving for storage and organization',
      },
      es: {
        name: 'Estantería/Unidad de Almacenamiento',
        description: 'Estanterías para almacenamiento y organización',
      },
      hi: {
        name: 'किताबों की अलमारी/भंडारण इकाई',
        description: 'भंडारण और व्यवस्था के लिए शेल्फ़',
      },
    },
  },
  {
    kind: 'object',
    wealthValue: 90,
    category: 'Furniture',
    translations: {
      en: {
        name: 'Dresser/Cabinet',
        description: 'Clothing storage dresser or cabinet',
      },
      es: {
        name: 'Cómoda/Gabinete',
        description: 'Cómoda o gabinete para almacenar ropa',
      },
      hi: {
        name: 'दराज़/अलमारी',
        description: 'कपड़े संग्रहण दराज़ या अलमारी',
      },
    },
  },
];

// --- Electronics & Appliances ---
const ELECTRONICS: DefaultItemTemplate[] = [
  {
    kind: 'object',
    wealthValue: 40,
    category: 'Electronics',
    translations: {
      en: {
        name: 'Small Kitchen Appliance',
        description: 'Toaster, blender, coffee maker, etc.',
      },
      es: {
        name: 'Pequeño Electrodoméstico de Cocina',
        description: 'Tostadora, licuadora, cafetera, etc.',
      },
      hi: {
        name: 'छोटा रसोई उपकरण',
        description: 'टोस्टर, ब्लेंडर, कॉफ़ी मेकर, आदि',
      },
    },
  },
  {
    kind: 'object',
    wealthValue: 200,
    category: 'Electronics',
    translations: {
      en: {
        name: 'Laptop/Computer',
        description: 'Personal computer or laptop',
      },
      es: {
        name: 'Portátil/Computadora',
        description: 'Computadora personal o portátil',
      },
      hi: {
        name: 'लैपटॉप/कंप्यूटर',
        description: 'व्यक्तिगत कंप्यूटर या लैपटॉप',
      },
    },
  },
  {
    kind: 'object',
    wealthValue: 100,
    category: 'Electronics',
    translations: {
      en: {
        name: 'Smartphone/Tablet',
        description: 'Mobile device',
      },
      es: {
        name: 'Teléfono Inteligente/Tableta',
        description: 'Dispositivo móvil',
      },
      hi: {
        name: 'स्मार्टफ़ोन/टैबलेट',
        description: 'मोबाइल डिवाइस',
      },
    },
  },
  {
    kind: 'object',
    wealthValue: 30,
    category: 'Electronics',
    translations: {
      en: {
        name: 'Lamp/Lighting',
        description: 'Lamps, light fixtures, bulbs',
      },
      es: {
        name: 'Lámpara/Iluminación',
        description: 'Lámparas, accesorios de luz, bombillas',
      },
      hi: {
        name: 'दीपक/प्रकाश',
        description: 'दीपक, प्रकाश फिक्स्चर, बल्ब',
      },
    },
  },
  {
    kind: 'object',
    wealthValue: 80,
    category: 'Electronics',
    translations: {
      en: {
        name: 'Heater/Fan',
        description: 'Space heater or electric fan',
      },
      es: {
        name: 'Calentador/Ventilador',
        description: 'Calentador de espacio o ventilador eléctrico',
      },
      hi: {
        name: 'हीटर/पंखा',
        description: 'स्पेस हीटर या इलेक्ट्रिक पंखा',
      },
    },
  },
];

// --- Books & Media ---
const BOOKS_MEDIA: DefaultItemTemplate[] = [
  {
    kind: 'object',
    wealthValue: 8,
    category: 'Books & Media',
    translations: {
      en: {
        name: 'Book',
        description: 'Books, textbooks, or reading materials',
      },
      es: {
        name: 'Libro',
        description: 'Libros, libros de texto o materiales de lectura',
      },
      hi: {
        name: 'किताब',
        description: 'किताबें, पाठ्यपुस्तकें या पठन सामग्री',
      },
    },
  },
  {
    kind: 'object',
    wealthValue: 15,
    category: 'Books & Media',
    translations: {
      en: {
        name: 'Educational Materials',
        description: 'Workbooks, learning materials, supplies',
      },
      es: {
        name: 'Materiales Educativos',
        description: 'Cuadernos de ejercicios, materiales de aprendizaje, suministros',
      },
      hi: {
        name: 'शैक्षिक सामग्री',
        description: 'वर्कबुक, सीखने की सामग्री, आपूर्ति',
      },
    },
  },
  {
    kind: 'object',
    wealthValue: 12,
    category: 'Books & Media',
    translations: {
      en: {
        name: 'Board Game/Puzzle',
        description: 'Games and puzzles for entertainment',
      },
      es: {
        name: 'Juego de Mesa/Rompecabezas',
        description: 'Juegos y rompecabezas para entretenimiento',
      },
      hi: {
        name: 'बोर्ड गेम/पहेली',
        description: 'मनोरंजन के लिए खेल और पहेली',
      },
    },
  },
];

// --- Sports & Recreation ---
const SPORTS_RECREATION: DefaultItemTemplate[] = [
  {
    kind: 'object',
    wealthValue: 100,
    category: 'Sports & Recreation',
    translations: {
      en: {
        name: 'Bicycle',
        description: 'Bicycle for transportation or recreation',
      },
      es: {
        name: 'Bicicleta',
        description: 'Bicicleta para transporte o recreación',
      },
      hi: {
        name: 'साइकिल',
        description: 'परिवहन या मनोरंजन के लिए साइकिल',
      },
    },
  },
  {
    kind: 'object',
    wealthValue: 25,
    category: 'Sports & Recreation',
    translations: {
      en: {
        name: 'Sports Equipment',
        description: 'Ball, bat, racket, or other sports gear',
      },
      es: {
        name: 'Equipo Deportivo',
        description: 'Pelota, bate, raqueta u otro equipo deportivo',
      },
      hi: {
        name: 'खेल उपकरण',
        description: 'गेंद, बल्ला, रैकेट या अन्य खेल उपकरण',
      },
    },
  },
  {
    kind: 'object',
    wealthValue: 40,
    category: 'Sports & Recreation',
    translations: {
      en: {
        name: 'Camping Gear',
        description: 'Tent, sleeping bag, backpack, etc.',
      },
      es: {
        name: 'Equipo de Camping',
        description: 'Tienda de campaña, saco de dormir, mochila, etc.',
      },
      hi: {
        name: 'कैंपिंग उपकरण',
        description: 'तंबू, स्लीपिंग बैग, बैकपैक, आदि',
      },
    },
  },
  {
    kind: 'object',
    wealthValue: 20,
    category: 'Sports & Recreation',
    translations: {
      en: {
        name: 'Musical Instrument',
        description: 'Guitar, keyboard, percussion, etc.',
      },
      es: {
        name: 'Instrumento Musical',
        description: 'Guitarra, teclado, percusión, etc.',
      },
      hi: {
        name: 'संगीत वाद्ययंत्र',
        description: 'गिटार, कीबोर्ड, तालवाद्य, आदि',
      },
    },
  },
];

// --- Household Items ---
const HOUSEHOLD_ITEMS: DefaultItemTemplate[] = [
  {
    kind: 'object',
    wealthValue: 25,
    category: 'Household Items',
    translations: {
      en: {
        name: 'Bedding/Linens Set',
        description: 'Bedding, sheets, pillows, or towels',
      },
      es: {
        name: 'Juego de Ropa de Cama',
        description: 'Ropa de cama, sábanas, almohadas o toallas',
      },
      hi: {
        name: 'बिस्तर/चादर सेट',
        description: 'बिस्तर, चादरें, तकिए या तौलिए',
      },
    },
  },
  {
    kind: 'object',
    wealthValue: 15,
    category: 'Household Items',
    translations: {
      en: {
        name: 'Kitchenware Set',
        description: 'Pots, pans, utensils, dishes',
      },
      es: {
        name: 'Juego de Utensilios de Cocina',
        description: 'Ollas, sartenes, utensilios, platos',
      },
      hi: {
        name: 'रसोई के बर्तन सेट',
        description: 'बर्तन, कड़ाही, उपकरण, प्लेटें',
      },
    },
  },
  {
    kind: 'object',
    wealthValue: 20,
    category: 'Household Items',
    translations: {
      en: {
        name: 'Cleaning Supplies',
        description: 'Cleaning products and tools',
      },
      es: {
        name: 'Suministros de Limpieza',
        description: 'Productos y herramientas de limpieza',
      },
      hi: {
        name: 'सफ़ाई की आपूर्ति',
        description: 'सफ़ाई के उत्पाद और औज़ार',
      },
    },
  },
  {
    kind: 'object',
    wealthValue: 18,
    category: 'Household Items',
    translations: {
      en: {
        name: 'Storage Containers',
        description: 'Bins, boxes, organizers',
      },
      es: {
        name: 'Contenedores de Almacenamiento',
        description: 'Recipientes, cajas, organizadores',
      },
      hi: {
        name: 'भंडारण पात्र',
        description: 'डिब्बे, बॉक्स, आयोजक',
      },
    },
  },
  {
    kind: 'object',
    wealthValue: 22,
    category: 'Household Items',
    translations: {
      en: {
        name: 'Bathroom Essentials',
        description: 'Towels, bath mat, shower curtain, etc.',
      },
      es: {
        name: 'Elementos Esenciales de Baño',
        description: 'Toallas, alfombra de baño, cortina de ducha, etc.',
      },
      hi: {
        name: 'बाथरूम की आवश्यक वस्तुएँ',
        description: 'तौलिए, बाथ मैट, शावर पर्दा, आदि',
      },
    },
  },
];

// --- Baby & Children Items ---
const BABY_CHILDREN: DefaultItemTemplate[] = [
  {
    kind: 'object',
    wealthValue: 35,
    category: 'Baby & Children',
    translations: {
      en: {
        name: 'Baby Clothing (bundle)',
        description: 'Set of baby clothes',
      },
      es: {
        name: 'Ropa de Bebé (paquete)',
        description: 'Conjunto de ropa de bebé',
      },
      hi: {
        name: 'शिशु कपड़े (बंडल)',
        description: 'शिशु कपड़ों का सेट',
      },
    },
  },
  {
    kind: 'object',
    wealthValue: 50,
    category: 'Baby & Children',
    translations: {
      en: {
        name: 'Baby Gear',
        description: 'Stroller, car seat, high chair, etc.',
      },
      es: {
        name: 'Equipo para Bebé',
        description: 'Cochecito, asiento de coche, silla alta, etc.',
      },
      hi: {
        name: 'शिशु उपकरण',
        description: 'स्ट्रॉलर, कार सीट, हाई चेयर, आदि',
      },
    },
  },
  {
    kind: 'object',
    wealthValue: 15,
    category: 'Baby & Children',
    translations: {
      en: {
        name: 'Toys',
        description: "Children's toys and games",
      },
      es: {
        name: 'Juguetes',
        description: 'Juguetes y juegos infantiles',
      },
      hi: {
        name: 'खिलौने',
        description: 'बच्चों के खिलौने और खेल',
      },
    },
  },
  {
    kind: 'object',
    wealthValue: 30,
    category: 'Baby & Children',
    translations: {
      en: {
        name: 'Diapers/Baby Supplies',
        description: 'Diapers, wipes, formula, etc.',
      },
      es: {
        name: 'Pañales/Suministros para Bebé',
        description: 'Pañales, toallitas, fórmula, etc.',
      },
      hi: {
        name: 'डायपर/शिशु आपूर्ति',
        description: 'डायपर, वाइप्स, फ़ॉर्मूला, आदि',
      },
    },
  },
];

// --- Personal Care ---
const PERSONAL_CARE: DefaultItemTemplate[] = [
  {
    kind: 'object',
    wealthValue: 10,
    category: 'Personal Care',
    translations: {
      en: {
        name: 'Toiletries Set',
        description: 'Soap, shampoo, toothpaste, etc.',
      },
      es: {
        name: 'Juego de Artículos de Tocador',
        description: 'Jabón, champú, pasta de dientes, etc.',
      },
      hi: {
        name: 'प्रसाधन सामग्री सेट',
        description: 'साबुन, शैम्पू, टूथपेस्ट, आदि',
      },
    },
  },
  {
    kind: 'object',
    wealthValue: 12,
    category: 'Personal Care',
    translations: {
      en: {
        name: 'First Aid Kit',
        description: 'Basic medical supplies',
      },
      es: {
        name: 'Botiquín de Primeros Auxilios',
        description: 'Suministros médicos básicos',
      },
      hi: {
        name: 'प्राथमिक चिकित्सा किट',
        description: 'बुनियादी चिकित्सा आपूर्ति',
      },
    },
  },
];

// ==================== SERVICES ====================

// --- Home Repair & Maintenance ---
const HOME_REPAIR: DefaultItemTemplate[] = [
  {
    kind: 'service',
    wealthValue: 20,
    category: 'Home Repair & Maintenance',
    translations: {
      en: {
        name: 'Home Repair (hour)',
        description: 'Home repair and maintenance services',
      },
      es: {
        name: 'Reparación del Hogar (hora)',
        description: 'Servicios de reparación y mantenimiento del hogar',
      },
      hi: {
        name: 'घर की मरम्मत (घंटा)',
        description: 'घर की मरम्मत और रखरखाव सेवाएँ',
      },
    },
  },
  {
    kind: 'service',
    wealthValue: 25,
    category: 'Home Repair & Maintenance',
    translations: {
      en: {
        name: 'Plumbing (hour)',
        description: 'Plumbing repairs and installations',
      },
      es: {
        name: 'Fontanería (hora)',
        description: 'Reparaciones e instalaciones de fontanería',
      },
      hi: {
        name: 'प्लंबिंग (घंटा)',
        description: 'प्लंबिंग मरम्मत और स्थापना',
      },
    },
  },
  {
    kind: 'service',
    wealthValue: 25,
    category: 'Home Repair & Maintenance',
    translations: {
      en: {
        name: 'Electrical Work (hour)',
        description: 'Electrical repairs and installations',
      },
      es: {
        name: 'Trabajo Eléctrico (hora)',
        description: 'Reparaciones e instalaciones eléctricas',
      },
      hi: {
        name: 'विद्युत कार्य (घंटा)',
        description: 'विद्युत मरम्मत और स्थापना',
      },
    },
  },
  {
    kind: 'service',
    wealthValue: 22,
    category: 'Home Repair & Maintenance',
    translations: {
      en: {
        name: 'Carpentry (hour)',
        description: 'Wood working and carpentry services',
      },
      es: {
        name: 'Carpintería (hora)',
        description: 'Servicios de carpintería y trabajo en madera',
      },
      hi: {
        name: 'बढ़ईगीरी (घंटा)',
        description: 'लकड़ी का काम और बढ़ईगीरी सेवाएँ',
      },
    },
  },
  {
    kind: 'service',
    wealthValue: 20,
    category: 'Home Repair & Maintenance',
    translations: {
      en: {
        name: 'Painting (hour)',
        description: 'Interior and exterior painting',
      },
      es: {
        name: 'Pintura (hora)',
        description: 'Pintura interior y exterior',
      },
      hi: {
        name: 'पेंटिंग (घंटा)',
        description: 'आंतरिक और बाहरी पेंटिंग',
      },
    },
  },
  {
    kind: 'service',
    wealthValue: 15,
    category: 'Home Repair & Maintenance',
    translations: {
      en: {
        name: 'Gardening Help (hour)',
        description: 'Gardening, landscaping, and yard work',
      },
      es: {
        name: 'Ayuda de Jardinería (hora)',
        description: 'Jardinería, paisajismo y trabajo de patio',
      },
      hi: {
        name: 'बागवानी सहायता (घंटा)',
        description: 'बागवानी, भूनिर्माण और यार्ड का काम',
      },
    },
  },
];

// --- Care Services ---
const CARE_SERVICES: DefaultItemTemplate[] = [
  {
    kind: 'service',
    wealthValue: 18,
    category: 'Care Services',
    translations: {
      en: {
        name: 'Childcare (hour)',
        description: 'Babysitting and child supervision',
      },
      es: {
        name: 'Cuidado de Niños (hora)',
        description: 'Cuidado de niños y supervisión',
      },
      hi: {
        name: 'बाल देखभाल (घंटा)',
        description: 'शिशु देखभाल और पर्यवेक्षण',
      },
    },
  },
  {
    kind: 'service',
    wealthValue: 20,
    category: 'Care Services',
    translations: {
      en: {
        name: 'Eldercare (hour)',
        description: 'Elder care and companionship',
      },
      es: {
        name: 'Cuidado de Ancianos (hora)',
        description: 'Cuidado de ancianos y compañía',
      },
      hi: {
        name: 'बुजुर्ग देखभाल (घंटा)',
        description: 'बुजुर्ग देखभाल और साहचर्य',
      },
    },
  },
  {
    kind: 'service',
    wealthValue: 12,
    category: 'Care Services',
    translations: {
      en: {
        name: 'Pet Care (day)',
        description: 'Pet sitting, walking, and care',
      },
      es: {
        name: 'Cuidado de Mascotas (día)',
        description: 'Cuidado de mascotas, paseos y atención',
      },
      hi: {
        name: 'पालतू जानवर की देखभाल (दिन)',
        description: 'पालतू जानवर की देखभाल, सैर और देखभाल',
      },
    },
  },
];

// --- Educational Services ---
const EDUCATIONAL: DefaultItemTemplate[] = [
  {
    kind: 'service',
    wealthValue: 25,
    category: 'Educational',
    translations: {
      en: {
        name: 'Tutoring (hour)',
        description: 'Educational tutoring and teaching',
      },
      es: {
        name: 'Tutoría (hora)',
        description: 'Tutoría y enseñanza educativa',
      },
      hi: {
        name: 'ट्यूशन (घंटा)',
        description: 'शैक्षिक ट्यूशन और शिक्षण',
      },
    },
  },
  {
    kind: 'service',
    wealthValue: 30,
    category: 'Educational',
    translations: {
      en: {
        name: 'Language Instruction (hour)',
        description: 'Language learning and practice',
      },
      es: {
        name: 'Instrucción de Idiomas (hora)',
        description: 'Aprendizaje y práctica de idiomas',
      },
      hi: {
        name: 'भाषा शिक्षण (घंटा)',
        description: 'भाषा सीखना और अभ्यास',
      },
    },
  },
  {
    kind: 'service',
    wealthValue: 35,
    category: 'Educational',
    translations: {
      en: {
        name: 'Workshop/Class (session)',
        description: 'Skill-building workshops and classes',
      },
      es: {
        name: 'Taller/Clase (sesión)',
        description: 'Talleres y clases de desarrollo de habilidades',
      },
      hi: {
        name: 'कार्यशाला/कक्षा (सत्र)',
        description: 'कौशल निर्माण कार्यशालाएँ और कक्षाएँ',
      },
    },
  },
  {
    kind: 'service',
    wealthValue: 28,
    category: 'Educational',
    translations: {
      en: {
        name: 'Music Lessons (hour)',
        description: 'Musical instrument or vocal instruction',
      },
      es: {
        name: 'Clases de Música (hora)',
        description: 'Instrucción de instrumento musical o vocal',
      },
      hi: {
        name: 'संगीत पाठ (घंटा)',
        description: 'संगीत वाद्ययंत्र या गायन शिक्षण',
      },
    },
  },
];

// --- Transportation ---
const TRANSPORTATION: DefaultItemTemplate[] = [
  {
    kind: 'service',
    wealthValue: 8,
    category: 'Transportation',
    translations: {
      en: {
        name: 'Transportation/Ride (trip)',
        description: 'Transportation and ride sharing',
      },
      es: {
        name: 'Transporte/Viaje (viaje)',
        description: 'Transporte y uso compartido de viajes',
      },
      hi: {
        name: 'परिवहन/सवारी (यात्रा)',
        description: 'परिवहन और सवारी साझा करना',
      },
    },
  },
  {
    kind: 'service',
    wealthValue: 18,
    category: 'Transportation',
    translations: {
      en: {
        name: 'Moving Help (hour)',
        description: 'Moving and heavy lifting assistance',
      },
      es: {
        name: 'Ayuda con Mudanza (hora)',
        description: 'Asistencia con mudanzas y levantamiento pesado',
      },
      hi: {
        name: 'सामान ले जाने में मदद (घंटा)',
        description: 'स्थानांतरण और भारी सामान उठाने में सहायता',
      },
    },
  },
  {
    kind: 'service',
    wealthValue: 15,
    category: 'Transportation',
    translations: {
      en: {
        name: 'Delivery Service (trip)',
        description: 'Package and item delivery',
      },
      es: {
        name: 'Servicio de Entrega (viaje)',
        description: 'Entrega de paquetes y artículos',
      },
      hi: {
        name: 'डिलीवरी सेवा (यात्रा)',
        description: 'पैकेज और वस्तु वितरण',
      },
    },
  },
];

// --- Professional Services ---
const PROFESSIONAL: DefaultItemTemplate[] = [
  {
    kind: 'service',
    wealthValue: 30,
    category: 'Professional Services',
    translations: {
      en: {
        name: 'Tech Support (hour)',
        description: 'Computer and technology assistance',
      },
      es: {
        name: 'Soporte Técnico (hora)',
        description: 'Asistencia informática y tecnológica',
      },
      hi: {
        name: 'तकनीकी सहायता (घंटा)',
        description: 'कंप्यूटर और प्रौद्योगिकी सहायता',
      },
    },
  },
  {
    kind: 'service',
    wealthValue: 40,
    category: 'Professional Services',
    translations: {
      en: {
        name: 'Legal Advice (hour)',
        description: 'Legal consultation and advice',
      },
      es: {
        name: 'Asesoramiento Legal (hora)',
        description: 'Consultoría y asesoramiento legal',
      },
      hi: {
        name: 'कानूनी सलाह (घंटा)',
        description: 'कानूनी परामर्श और सलाह',
      },
    },
  },
  {
    kind: 'service',
    wealthValue: 35,
    category: 'Professional Services',
    translations: {
      en: {
        name: 'Accounting/Bookkeeping (hour)',
        description: 'Financial and accounting services',
      },
      es: {
        name: 'Contabilidad/Teneduría (hora)',
        description: 'Servicios financieros y de contabilidad',
      },
      hi: {
        name: 'लेखा/बहीखाता (घंटा)',
        description: 'वित्तीय और लेखा सेवाएँ',
      },
    },
  },
  {
    kind: 'service',
    wealthValue: 45,
    category: 'Professional Services',
    translations: {
      en: {
        name: 'Business Consulting (hour)',
        description: 'Business strategy and consulting',
      },
      es: {
        name: 'Consultoría Empresarial (hora)',
        description: 'Estrategia empresarial y consultoría',
      },
      hi: {
        name: 'व्यवसाय परामर्श (घंटा)',
        description: 'व्यावसायिक रणनीति और परामर्श',
      },
    },
  },
];

// --- Creative Services ---
const CREATIVE: DefaultItemTemplate[] = [
  {
    kind: 'service',
    wealthValue: 30,
    category: 'Creative Services',
    translations: {
      en: {
        name: 'Graphic Design (hour)',
        description: 'Design and visual creation services',
      },
      es: {
        name: 'Diseño Gráfico (hora)',
        description: 'Servicios de diseño y creación visual',
      },
      hi: {
        name: 'ग्राफ़िक डिज़ाइन (घंटा)',
        description: 'डिज़ाइन और दृश्य निर्माण सेवाएँ',
      },
    },
  },
  {
    kind: 'service',
    wealthValue: 40,
    category: 'Creative Services',
    translations: {
      en: {
        name: 'Photography (session)',
        description: 'Photography and photo editing',
      },
      es: {
        name: 'Fotografía (sesión)',
        description: 'Fotografía y edición de fotos',
      },
      hi: {
        name: 'फ़ोटोग्राफ़ी (सत्र)',
        description: 'फ़ोटोग्राफ़ी और फ़ोटो संपादन',
      },
    },
  },
  {
    kind: 'service',
    wealthValue: 35,
    category: 'Creative Services',
    translations: {
      en: {
        name: 'Video Production (hour)',
        description: 'Video recording and editing',
      },
      es: {
        name: 'Producción de Video (hora)',
        description: 'Grabación y edición de video',
      },
      hi: {
        name: 'वीडियो निर्माण (घंटा)',
        description: 'वीडियो रिकॉर्डिंग और संपादन',
      },
    },
  },
  {
    kind: 'service',
    wealthValue: 25,
    category: 'Creative Services',
    translations: {
      en: {
        name: 'Writing/Editing (hour)',
        description: 'Content writing and editing services',
      },
      es: {
        name: 'Redacción/Edición (hora)',
        description: 'Servicios de redacción y edición de contenido',
      },
      hi: {
        name: 'लेखन/संपादन (घंटा)',
        description: 'सामग्री लेखन और संपादन सेवाएँ',
      },
    },
  },
  {
    kind: 'service',
    wealthValue: 30,
    category: 'Creative Services',
    translations: {
      en: {
        name: 'Art/Craft Instruction (hour)',
        description: 'Arts, crafts, and creative skills teaching',
      },
      es: {
        name: 'Instrucción de Arte/Artesanía (hora)',
        description: 'Enseñanza de arte, artesanía y habilidades creativas',
      },
      hi: {
        name: 'कला/शिल्प शिक्षण (घंटा)',
        description: 'कला, शिल्प और रचनात्मक कौशल शिक्षण',
      },
    },
  },
];

// --- Food Services ---
const FOOD_SERVICES: DefaultItemTemplate[] = [
  {
    kind: 'service',
    wealthValue: 10,
    category: 'Food Services',
    translations: {
      en: {
        name: 'Cooking/Meal Prep (meal)',
        description: 'Meal preparation and cooking services',
      },
      es: {
        name: 'Cocina/Preparación de Comidas (comida)',
        description: 'Servicios de preparación y cocina de comidas',
      },
      hi: {
        name: 'खाना पकाना/भोजन तैयारी (भोजन)',
        description: 'भोजन तैयारी और पाक सेवाएँ',
      },
    },
  },
  {
    kind: 'service',
    wealthValue: 25,
    category: 'Food Services',
    translations: {
      en: {
        name: 'Catering (event)',
        description: 'Event catering and food service',
      },
      es: {
        name: 'Catering (evento)',
        description: 'Catering y servicio de comida para eventos',
      },
      hi: {
        name: 'कैटरिंग (कार्यक्रम)',
        description: 'कार्यक्रम कैटरिंग और भोजन सेवा',
      },
    },
  },
  {
    kind: 'service',
    wealthValue: 15,
    category: 'Food Services',
    translations: {
      en: {
        name: 'Baking (batch)',
        description: 'Baking bread, cakes, or pastries',
      },
      es: {
        name: 'Panadería (lote)',
        description: 'Hornear pan, pasteles o bollería',
      },
      hi: {
        name: 'बेकिंग (बैच)',
        description: 'ब्रेड, केक या पेस्ट्री बनाना',
      },
    },
  },
];

// --- Health & Wellness ---
const HEALTH_WELLNESS: DefaultItemTemplate[] = [
  {
    kind: 'service',
    wealthValue: 30,
    category: 'Health & Wellness',
    translations: {
      en: {
        name: 'Massage Therapy (hour)',
        description: 'Therapeutic massage services',
      },
      es: {
        name: 'Terapia de Masajes (hora)',
        description: 'Servicios de masaje terapéutico',
      },
      hi: {
        name: 'मालिश चिकित्सा (घंटा)',
        description: 'चिकित्सीय मालिश सेवाएँ',
      },
    },
  },
  {
    kind: 'service',
    wealthValue: 25,
    category: 'Health & Wellness',
    translations: {
      en: {
        name: 'Fitness Training (session)',
        description: 'Personal training and fitness instruction',
      },
      es: {
        name: 'Entrenamiento Físico (sesión)',
        description: 'Entrenamiento personal e instrucción de fitness',
      },
      hi: {
        name: 'फ़िटनेस प्रशिक्षण (सत्र)',
        description: 'व्यक्तिगत प्रशिक्षण और फ़िटनेस निर्देश',
      },
    },
  },
  {
    kind: 'service',
    wealthValue: 20,
    category: 'Health & Wellness',
    translations: {
      en: {
        name: 'Yoga/Meditation Class (session)',
        description: 'Yoga and meditation instruction',
      },
      es: {
        name: 'Clase de Yoga/Meditación (sesión)',
        description: 'Instrucción de yoga y meditación',
      },
      hi: {
        name: 'योग/ध्यान कक्षा (सत्र)',
        description: 'योग और ध्यान शिक्षण',
      },
    },
  },
];

// --- Cleaning & Organizing ---
const CLEANING_ORGANIZING: DefaultItemTemplate[] = [
  {
    kind: 'service',
    wealthValue: 20,
    category: 'Cleaning & Organizing',
    translations: {
      en: {
        name: 'Cleaning Service (hour)',
        description: 'House and office cleaning',
      },
      es: {
        name: 'Servicio de Limpieza (hora)',
        description: 'Limpieza de casa y oficina',
      },
      hi: {
        name: 'सफ़ाई सेवा (घंटा)',
        description: 'घर और कार्यालय की सफ़ाई',
      },
    },
  },
  {
    kind: 'service',
    wealthValue: 22,
    category: 'Cleaning & Organizing',
    translations: {
      en: {
        name: 'Organization Service (hour)',
        description: 'Home and office organization',
      },
      es: {
        name: 'Servicio de Organización (hora)',
        description: 'Organización de casa y oficina',
      },
      hi: {
        name: 'व्यवस्था सेवा (घंटा)',
        description: 'घर और कार्यालय की व्यवस्था',
      },
    },
  },
  {
    kind: 'service',
    wealthValue: 25,
    category: 'Cleaning & Organizing',
    translations: {
      en: {
        name: 'Laundry Service (load)',
        description: 'Washing, drying, and folding laundry',
      },
      es: {
        name: 'Servicio de Lavandería (carga)',
        description: 'Lavado, secado y doblado de ropa',
      },
      hi: {
        name: 'कपड़े धोने की सेवा (लोड)',
        description: 'कपड़े धोना, सुखाना और तह करना',
      },
    },
  },
];

/**
 * Combine all default items into a single array
 */
export const DEFAULT_ITEMS: DefaultItemTemplate[] = [
  // Objects
  ...FRESH_PRODUCE,
  ...PACKAGED_FOOD,
  ...BEVERAGES,
  ...CLOTHING,
  ...TOOLS,
  ...FURNITURE,
  ...ELECTRONICS,
  ...BOOKS_MEDIA,
  ...SPORTS_RECREATION,
  ...HOUSEHOLD_ITEMS,
  ...BABY_CHILDREN,
  ...PERSONAL_CARE,

  // Services
  ...HOME_REPAIR,
  ...CARE_SERVICES,
  ...EDUCATIONAL,
  ...TRANSPORTATION,
  ...PROFESSIONAL,
  ...CREATIVE,
  ...FOOD_SERVICES,
  ...HEALTH_WELLNESS,
  ...CLEANING_ORGANIZING,
];

/**
 * Default language for item creation
 * Can be extended to support per-community language preferences
 */
export const DEFAULT_ITEM_LANGUAGE = 'en' as const;

/**
 * Supported languages
 */
export const SUPPORTED_LANGUAGES = ['en', 'es', 'hi'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

/**
 * Helper function to get item data in a specific language
 */
export function getItemTranslation(
  item: DefaultItemTemplate,
  language: SupportedLanguage = DEFAULT_ITEM_LANGUAGE
): DefaultItemTranslation {
  return item.translations[language];
}

/**
 * Statistics about default items
 */
export const DEFAULT_ITEMS_STATS = {
  total: DEFAULT_ITEMS.length,
  objects: DEFAULT_ITEMS.filter((i) => i.kind === 'object').length,
  services: DEFAULT_ITEMS.filter((i) => i.kind === 'service').length,
  categories: [...new Set(DEFAULT_ITEMS.map((i) => i.category))].length,
  languages: SUPPORTED_LANGUAGES.length,
};
