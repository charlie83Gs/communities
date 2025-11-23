import { DefaultItemTemplate } from './types';

/**
 * Fresh Produce Items
 * Includes both specific vegetables/fruits and general categories
 */

export const FRESH_PRODUCE: DefaultItemTemplate[] = [
  // === GENERAL CATEGORY ===
  {
    kind: 'object',
    wealthValue: 5,
    category: 'Fresh Produce',
    translations: {
      en: { name: 'Vegetables', description: 'General vegetables category' },
      es: { name: 'Verduras', description: 'Categoría general de verduras' },
      hi: { name: 'सब्जियाँ', description: 'सामान्य सब्जियों की श्रेणी' },
    },
  },
  {
    kind: 'object',
    wealthValue: 6,
    category: 'Fresh Produce',
    translations: {
      en: { name: 'Fruits', description: 'General fruits category' },
      es: { name: 'Frutas', description: 'Categoría general de frutas' },
      hi: { name: 'फल', description: 'सामान्य फलों की श्रेणी' },
    },
  },

  // === ROOT VEGETABLES ===
  {
    kind: 'object',
    wealthValue: 4,
    category: 'Fresh Produce',
    translations: {
      en: { name: 'Potatoes', description: 'Fresh potatoes' },
      es: { name: 'Papas', description: 'Papas frescas' },
      hi: { name: 'आलू', description: 'ताज़े आलू' },
    },
  },
  {
    kind: 'object',
    wealthValue: 5,
    category: 'Fresh Produce',
    translations: {
      en: { name: 'Carrots', description: 'Fresh carrots' },
      es: { name: 'Zanahorias', description: 'Zanahorias frescas' },
      hi: { name: 'गाजर', description: 'ताज़ी गाजर' },
    },
  },
  {
    kind: 'object',
    wealthValue: 5,
    category: 'Fresh Produce',
    translations: {
      en: { name: 'Onions', description: 'Fresh onions' },
      es: { name: 'Cebollas', description: 'Cebollas frescas' },
      hi: { name: 'प्याज', description: 'ताज़े प्याज' },
    },
  },
  {
    kind: 'object',
    wealthValue: 6,
    category: 'Fresh Produce',
    translations: {
      en: { name: 'Garlic', description: 'Fresh garlic' },
      es: { name: 'Ajo', description: 'Ajo fresco' },
      hi: { name: 'लहसुन', description: 'ताज़ा लहसुन' },
    },
  },
  {
    kind: 'object',
    wealthValue: 5,
    category: 'Fresh Produce',
    translations: {
      en: { name: 'Beets', description: 'Fresh beets' },
      es: { name: 'Remolachas', description: 'Remolachas frescas' },
      hi: { name: 'चुकंदर', description: 'ताज़े चुकंदर' },
    },
  },
  {
    kind: 'object',
    wealthValue: 6,
    category: 'Fresh Produce',
    translations: {
      en: { name: 'Radishes', description: 'Fresh radishes' },
      es: { name: 'Rábanos', description: 'Rábanos frescos' },
      hi: { name: 'मूली', description: 'ताज़ी मूली' },
    },
  },
  {
    kind: 'object',
    wealthValue: 5,
    category: 'Fresh Produce',
    translations: {
      en: { name: 'Sweet Potatoes', description: 'Fresh sweet potatoes' },
      es: { name: 'Batatas', description: 'Batatas frescas' },
      hi: { name: 'शकरकंद', description: 'ताज़े शकरकंद' },
    },
  },
  {
    kind: 'object',
    wealthValue: 6,
    category: 'Fresh Produce',
    translations: {
      en: { name: 'Turnips', description: 'Fresh turnips' },
      es: { name: 'Nabos', description: 'Nabos frescos' },
      hi: { name: 'शलजम', description: 'ताज़े शलजम' },
    },
  },
  {
    kind: 'object',
    wealthValue: 7,
    category: 'Fresh Produce',
    translations: {
      en: { name: 'Ginger', description: 'Fresh ginger root' },
      es: { name: 'Jengibre', description: 'Raíz de jengibre fresca' },
      hi: { name: 'अदरक', description: 'ताज़ी अदरक' },
    },
  },

  // === FRUITING VEGETABLES ===
  {
    kind: 'object',
    wealthValue: 5,
    category: 'Fresh Produce',
    translations: {
      en: { name: 'Tomatoes', description: 'Fresh tomatoes' },
      es: { name: 'Tomates', description: 'Tomates frescos' },
      hi: { name: 'टमाटर', description: 'ताज़े टमाटर' },
    },
  },
  {
    kind: 'object',
    wealthValue: 6,
    category: 'Fresh Produce',
    translations: {
      en: { name: 'Bell Peppers', description: 'Fresh bell peppers (any color)' },
      es: { name: 'Pimientos', description: 'Pimientos frescos (cualquier color)' },
      hi: { name: 'शिमला मिर्च', description: 'ताज़ी शिमला मिर्च (कोई भी रंग)' },
    },
  },
  {
    kind: 'object',
    wealthValue: 6,
    category: 'Fresh Produce',
    translations: {
      en: { name: 'Cucumbers', description: 'Fresh cucumbers' },
      es: { name: 'Pepinos', description: 'Pepinos frescos' },
      hi: { name: 'खीरा', description: 'ताज़े खीरे' },
    },
  },
  {
    kind: 'object',
    wealthValue: 5,
    category: 'Fresh Produce',
    translations: {
      en: { name: 'Zucchini', description: 'Fresh zucchini' },
      es: { name: 'Calabacín', description: 'Calabacín fresco' },
      hi: { name: 'तोरी', description: 'ताज़ी तोरी' },
    },
  },
  {
    kind: 'object',
    wealthValue: 5,
    category: 'Fresh Produce',
    translations: {
      en: { name: 'Eggplant', description: 'Fresh eggplant' },
      es: { name: 'Berenjena', description: 'Berenjena fresca' },
      hi: { name: 'बैंगन', description: 'ताज़े बैंगन' },
    },
  },
  {
    kind: 'object',
    wealthValue: 7,
    category: 'Fresh Produce',
    translations: {
      en: { name: 'Hot Peppers', description: 'Fresh chili/hot peppers' },
      es: { name: 'Chiles Picantes', description: 'Chiles picantes frescos' },
      hi: { name: 'हरी मिर्च', description: 'ताज़ी हरी मिर्च' },
    },
  },
  {
    kind: 'object',
    wealthValue: 5,
    category: 'Fresh Produce',
    translations: {
      en: { name: 'Squash', description: 'Fresh squash (summer or winter)' },
      es: { name: 'Calabaza', description: 'Calabaza fresca (verano o invierno)' },
      hi: { name: 'कद्दू', description: 'ताज़ा कद्दू (गर्मी या सर्दी)' },
    },
  },
  {
    kind: 'object',
    wealthValue: 4,
    category: 'Fresh Produce',
    translations: {
      en: { name: 'Pumpkin', description: 'Fresh pumpkin' },
      es: { name: 'Calabaza Grande', description: 'Calabaza grande fresca' },
      hi: { name: 'कद्दू (बड़ा)', description: 'ताज़ा बड़ा कद्दू' },
    },
  },

  // === LEAFY GREENS ===
  {
    kind: 'object',
    wealthValue: 7,
    category: 'Fresh Produce',
    translations: {
      en: { name: 'Lettuce', description: 'Fresh lettuce (any variety)' },
      es: { name: 'Lechuga', description: 'Lechuga fresca (cualquier variedad)' },
      hi: { name: 'सलाद पत्ता', description: 'ताज़ा सलाद पत्ता (कोई भी किस्म)' },
    },
  },
  {
    kind: 'object',
    wealthValue: 8,
    category: 'Fresh Produce',
    translations: {
      en: { name: 'Spinach', description: 'Fresh spinach' },
      es: { name: 'Espinacas', description: 'Espinacas frescas' },
      hi: { name: 'पालक', description: 'ताज़ा पालक' },
    },
  },
  {
    kind: 'object',
    wealthValue: 8,
    category: 'Fresh Produce',
    translations: {
      en: { name: 'Kale', description: 'Fresh kale' },
      es: { name: 'Col Rizada', description: 'Col rizada fresca' },
      hi: { name: 'केल', description: 'ताज़ा केल' },
    },
  },
  {
    kind: 'object',
    wealthValue: 7,
    category: 'Fresh Produce',
    translations: {
      en: { name: 'Cabbage', description: 'Fresh cabbage' },
      es: { name: 'Repollo', description: 'Repollo fresco' },
      hi: { name: 'पत्ता गोभी', description: 'ताज़ी पत्ता गोभी' },
    },
  },
  {
    kind: 'object',
    wealthValue: 8,
    category: 'Fresh Produce',
    translations: {
      en: { name: 'Chard', description: 'Fresh chard/Swiss chard' },
      es: { name: 'Acelga', description: 'Acelga fresca' },
      hi: { name: 'चुकंदर साग', description: 'ताज़ा चुकंदर साग' },
    },
  },
  {
    kind: 'object',
    wealthValue: 9,
    category: 'Fresh Produce',
    translations: {
      en: { name: 'Arugula', description: 'Fresh arugula/rocket' },
      es: { name: 'Rúcula', description: 'Rúcula fresca' },
      hi: { name: 'रॉकेट साग', description: 'ताज़ा रॉकेट साग' },
    },
  },
  {
    kind: 'object',
    wealthValue: 8,
    category: 'Fresh Produce',
    translations: {
      en: { name: 'Collard Greens', description: 'Fresh collard greens' },
      es: { name: 'Berza', description: 'Berza fresca' },
      hi: { name: 'कोलार्ड साग', description: 'ताज़ा कोलार्ड साग' },
    },
  },

  // === CRUCIFEROUS VEGETABLES ===
  {
    kind: 'object',
    wealthValue: 6,
    category: 'Fresh Produce',
    translations: {
      en: { name: 'Broccoli', description: 'Fresh broccoli' },
      es: { name: 'Brócoli', description: 'Brócoli fresco' },
      hi: { name: 'ब्रोकोली', description: 'ताज़ी ब्रोकोली' },
    },
  },
  {
    kind: 'object',
    wealthValue: 6,
    category: 'Fresh Produce',
    translations: {
      en: { name: 'Cauliflower', description: 'Fresh cauliflower' },
      es: { name: 'Coliflor', description: 'Coliflor fresca' },
      hi: { name: 'फूलगोभी', description: 'ताज़ी फूलगोभी' },
    },
  },
  {
    kind: 'object',
    wealthValue: 7,
    category: 'Fresh Produce',
    translations: {
      en: { name: 'Brussels Sprouts', description: 'Fresh Brussels sprouts' },
      es: { name: 'Coles de Bruselas', description: 'Coles de Bruselas frescas' },
      hi: { name: 'ब्रसेल्स स्प्राउट्स', description: 'ताज़े ब्रसेल्स स्प्राउट्स' },
    },
  },

  // === LEGUMES (FRESH) ===
  {
    kind: 'object',
    wealthValue: 6,
    category: 'Fresh Produce',
    translations: {
      en: { name: 'Green Beans', description: 'Fresh green beans' },
      es: { name: 'Judías Verdes', description: 'Judías verdes frescas' },
      hi: { name: 'हरी फलियाँ', description: 'ताज़ी हरी फलियाँ' },
    },
  },
  {
    kind: 'object',
    wealthValue: 7,
    category: 'Fresh Produce',
    translations: {
      en: { name: 'Peas', description: 'Fresh peas (in pod or shelled)' },
      es: { name: 'Guisantes', description: 'Guisantes frescos (en vaina o desgranados)' },
      hi: { name: 'मटर', description: 'ताज़ी मटर (फली में या छिली हुई)' },
    },
  },

  // === HERBS ===
  {
    kind: 'object',
    wealthValue: 9,
    category: 'Fresh Produce',
    translations: {
      en: { name: 'Herbs (Mixed)', description: 'Fresh herbs, various types' },
      es: { name: 'Hierbas (Mixtas)', description: 'Hierbas frescas, varios tipos' },
      hi: { name: 'जड़ी-बूटियाँ (मिश्रित)', description: 'ताज़ी जड़ी-बूटियाँ, विभिन्न प्रकार' },
    },
  },
  {
    kind: 'object',
    wealthValue: 10,
    category: 'Fresh Produce',
    translations: {
      en: { name: 'Basil', description: 'Fresh basil' },
      es: { name: 'Albahaca', description: 'Albahaca fresca' },
      hi: { name: 'तुलसी', description: 'ताज़ी तुलसी' },
    },
  },
  {
    kind: 'object',
    wealthValue: 10,
    category: 'Fresh Produce',
    translations: {
      en: { name: 'Cilantro', description: 'Fresh cilantro/coriander' },
      es: { name: 'Cilantro', description: 'Cilantro fresco' },
      hi: { name: 'धनिया', description: 'ताज़ा धनिया' },
    },
  },
  {
    kind: 'object',
    wealthValue: 10,
    category: 'Fresh Produce',
    translations: {
      en: { name: 'Parsley', description: 'Fresh parsley' },
      es: { name: 'Perejil', description: 'Perejil fresco' },
      hi: { name: 'अजमोद', description: 'ताज़ा अजमोद' },
    },
  },
  {
    kind: 'object',
    wealthValue: 12,
    category: 'Fresh Produce',
    translations: {
      en: { name: 'Mint', description: 'Fresh mint' },
      es: { name: 'Menta', description: 'Menta fresca' },
      hi: { name: 'पुदीना', description: 'ताज़ा पुदीना' },
    },
  },
  {
    kind: 'object',
    wealthValue: 11,
    category: 'Fresh Produce',
    translations: {
      en: { name: 'Rosemary', description: 'Fresh rosemary' },
      es: { name: 'Romero', description: 'Romero fresco' },
      hi: { name: 'रोजमेरी', description: 'ताज़ी रोजमेरी' },
    },
  },
  {
    kind: 'object',
    wealthValue: 11,
    category: 'Fresh Produce',
    translations: {
      en: { name: 'Thyme', description: 'Fresh thyme' },
      es: { name: 'Tomillo', description: 'Tomillo fresco' },
      hi: { name: 'अजवायन', description: 'ताज़ी अजवायन' },
    },
  },
  {
    kind: 'object',
    wealthValue: 11,
    category: 'Fresh Produce',
    translations: {
      en: { name: 'Oregano', description: 'Fresh oregano' },
      es: { name: 'Orégano', description: 'Orégano fresco' },
      hi: { name: 'ओरेगानो', description: 'ताज़ा ओरेगानो' },
    },
  },
  {
    kind: 'object',
    wealthValue: 12,
    category: 'Fresh Produce',
    translations: {
      en: { name: 'Dill', description: 'Fresh dill' },
      es: { name: 'Eneldo', description: 'Eneldo fresco' },
      hi: { name: 'सोया', description: 'ताज़ा सोया' },
    },
  },

  // === CITRUS FRUITS ===
  {
    kind: 'object',
    wealthValue: 6,
    category: 'Fresh Produce',
    translations: {
      en: { name: 'Lemons', description: 'Fresh lemons' },
      es: { name: 'Limones', description: 'Limones frescos' },
      hi: { name: 'नींबू', description: 'ताज़े नींबू' },
    },
  },
  {
    kind: 'object',
    wealthValue: 6,
    category: 'Fresh Produce',
    translations: {
      en: { name: 'Limes', description: 'Fresh limes' },
      es: { name: 'Limas', description: 'Limas frescas' },
      hi: { name: 'हरा नींबू', description: 'ताज़े हरे नींबू' },
    },
  },
  {
    kind: 'object',
    wealthValue: 5,
    category: 'Fresh Produce',
    translations: {
      en: { name: 'Oranges', description: 'Fresh oranges' },
      es: { name: 'Naranjas', description: 'Naranjas frescas' },
      hi: { name: 'संतरे', description: 'ताज़े संतरे' },
    },
  },
  {
    kind: 'object',
    wealthValue: 7,
    category: 'Fresh Produce',
    translations: {
      en: { name: 'Grapefruits', description: 'Fresh grapefruits' },
      es: { name: 'Toronjas', description: 'Toronjas frescas' },
      hi: { name: 'चकोतरा', description: 'ताज़े चकोतरे' },
    },
  },
  {
    kind: 'object',
    wealthValue: 7,
    category: 'Fresh Produce',
    translations: {
      en: { name: 'Tangerines', description: 'Fresh tangerines/mandarins' },
      es: { name: 'Mandarinas', description: 'Mandarinas frescas' },
      hi: { name: 'किन्नू', description: 'ताज़े किन्नू' },
    },
  },

  // === TROPICAL FRUITS ===
  {
    kind: 'object',
    wealthValue: 6,
    category: 'Fresh Produce',
    translations: {
      en: { name: 'Bananas', description: 'Fresh bananas' },
      es: { name: 'Plátanos', description: 'Plátanos frescos' },
      hi: { name: 'केला', description: 'ताज़े केले' },
    },
  },
  {
    kind: 'object',
    wealthValue: 8,
    category: 'Fresh Produce',
    translations: {
      en: { name: 'Pineapple', description: 'Fresh pineapple' },
      es: { name: 'Piña', description: 'Piña fresca' },
      hi: { name: 'अनानास', description: 'ताज़ा अनानास' },
    },
  },
  {
    kind: 'object',
    wealthValue: 8,
    category: 'Fresh Produce',
    translations: {
      en: { name: 'Mangoes', description: 'Fresh mangoes' },
      es: { name: 'Mangos', description: 'Mangos frescos' },
      hi: { name: 'आम', description: 'ताज़े आम' },
    },
  },
  {
    kind: 'object',
    wealthValue: 10,
    category: 'Fresh Produce',
    translations: {
      en: { name: 'Papayas', description: 'Fresh papayas' },
      es: { name: 'Papayas', description: 'Papayas frescas' },
      hi: { name: 'पपीता', description: 'ताज़े पपीते' },
    },
  },
  {
    kind: 'object',
    wealthValue: 9,
    category: 'Fresh Produce',
    translations: {
      en: { name: 'Avocados', description: 'Fresh avocados' },
      es: { name: 'Aguacates', description: 'Aguacates frescos' },
      hi: { name: 'एवोकैडो', description: 'ताज़े एवोकैडो' },
    },
  },
  {
    kind: 'object',
    wealthValue: 11,
    category: 'Fresh Produce',
    translations: {
      en: { name: 'Coconuts', description: 'Fresh coconuts' },
      es: { name: 'Cocos', description: 'Cocos frescos' },
      hi: { name: 'नारियल', description: 'ताज़े नारियल' },
    },
  },
  {
    kind: 'object',
    wealthValue: 9,
    category: 'Fresh Produce',
    translations: {
      en: { name: 'Guavas', description: 'Fresh guavas' },
      es: { name: 'Guayabas', description: 'Guayabas frescas' },
      hi: { name: 'अमरूद', description: 'ताज़े अमरूद' },
    },
  },

  // === STONE FRUITS ===
  {
    kind: 'object',
    wealthValue: 7,
    category: 'Fresh Produce',
    translations: {
      en: { name: 'Peaches', description: 'Fresh peaches' },
      es: { name: 'Duraznos', description: 'Duraznos frescos' },
      hi: { name: 'आड़ू', description: 'ताज़े आड़ू' },
    },
  },
  {
    kind: 'object',
    wealthValue: 7,
    category: 'Fresh Produce',
    translations: {
      en: { name: 'Plums', description: 'Fresh plums' },
      es: { name: 'Ciruelas', description: 'Ciruelas frescas' },
      hi: { name: 'बेर', description: 'ताज़े बेर' },
    },
  },
  {
    kind: 'object',
    wealthValue: 8,
    category: 'Fresh Produce',
    translations: {
      en: { name: 'Cherries', description: 'Fresh cherries' },
      es: { name: 'Cerezas', description: 'Cerezas frescas' },
      hi: { name: 'चेरी', description: 'ताज़ी चेरी' },
    },
  },
  {
    kind: 'object',
    wealthValue: 7,
    category: 'Fresh Produce',
    translations: {
      en: { name: 'Apricots', description: 'Fresh apricots' },
      es: { name: 'Albaricoques', description: 'Albaricoques frescos' },
      hi: { name: 'खुबानी', description: 'ताज़ी खुबानी' },
    },
  },
  {
    kind: 'object',
    wealthValue: 8,
    category: 'Fresh Produce',
    translations: {
      en: { name: 'Nectarines', description: 'Fresh nectarines' },
      es: { name: 'Nectarinas', description: 'Nectarinas frescas' },
      hi: { name: 'नेक्टराइन', description: 'ताज़े नेक्टराइन' },
    },
  },

  // === BERRIES ===
  {
    kind: 'object',
    wealthValue: 10,
    category: 'Fresh Produce',
    translations: {
      en: { name: 'Strawberries', description: 'Fresh strawberries' },
      es: { name: 'Fresas', description: 'Fresas frescas' },
      hi: { name: 'स्ट्रॉबेरी', description: 'ताज़ी स्ट्रॉबेरी' },
    },
  },
  {
    kind: 'object',
    wealthValue: 12,
    category: 'Fresh Produce',
    translations: {
      en: { name: 'Blueberries', description: 'Fresh blueberries' },
      es: { name: 'Arándanos', description: 'Arándanos frescos' },
      hi: { name: 'ब्लूबेरी', description: 'ताज़ी ब्लूबेरी' },
    },
  },
  {
    kind: 'object',
    wealthValue: 11,
    category: 'Fresh Produce',
    translations: {
      en: { name: 'Raspberries', description: 'Fresh raspberries' },
      es: { name: 'Frambuesas', description: 'Frambuesas frescas' },
      hi: { name: 'रास्पबेरी', description: 'ताज़ी रास्पबेरी' },
    },
  },
  {
    kind: 'object',
    wealthValue: 11,
    category: 'Fresh Produce',
    translations: {
      en: { name: 'Blackberries', description: 'Fresh blackberries' },
      es: { name: 'Moras', description: 'Moras frescas' },
      hi: { name: 'ब्लैकबेरी', description: 'ताज़ी ब्लैकबेरी' },
    },
  },

  // === POME FRUITS ===
  {
    kind: 'object',
    wealthValue: 6,
    category: 'Fresh Produce',
    translations: {
      en: { name: 'Apples', description: 'Fresh apples' },
      es: { name: 'Manzanas', description: 'Manzanas frescas' },
      hi: { name: 'सेब', description: 'ताज़े सेब' },
    },
  },
  {
    kind: 'object',
    wealthValue: 7,
    category: 'Fresh Produce',
    translations: {
      en: { name: 'Pears', description: 'Fresh pears' },
      es: { name: 'Peras', description: 'Peras frescas' },
      hi: { name: 'नाशपाती', description: 'ताज़ी नाशपाती' },
    },
  },

  // === MELONS ===
  {
    kind: 'object',
    wealthValue: 5,
    category: 'Fresh Produce',
    translations: {
      en: { name: 'Watermelon', description: 'Fresh watermelon' },
      es: { name: 'Sandía', description: 'Sandía fresca' },
      hi: { name: 'तरबूज', description: 'ताज़ा तरबूज' },
    },
  },
  {
    kind: 'object',
    wealthValue: 6,
    category: 'Fresh Produce',
    translations: {
      en: { name: 'Cantaloupe', description: 'Fresh cantaloupe/rockmelon' },
      es: { name: 'Melón Cantalupo', description: 'Melón cantalupo fresco' },
      hi: { name: 'खरबूजा', description: 'ताज़ा खरबूजा' },
    },
  },
  {
    kind: 'object',
    wealthValue: 7,
    category: 'Fresh Produce',
    translations: {
      en: { name: 'Honeydew', description: 'Fresh honeydew melon' },
      es: { name: 'Melón Verde', description: 'Melón verde fresco' },
      hi: { name: 'हनीड्यू', description: 'ताज़ा हनीड्यू' },
    },
  },

  // === GRAPES & OTHER ===
  {
    kind: 'object',
    wealthValue: 8,
    category: 'Fresh Produce',
    translations: {
      en: { name: 'Grapes', description: 'Fresh grapes (any variety)' },
      es: { name: 'Uvas', description: 'Uvas frescas (cualquier variedad)' },
      hi: { name: 'अंगूर', description: 'ताज़े अंगूर (कोई भी किस्म)' },
    },
  },
  {
    kind: 'object',
    wealthValue: 9,
    category: 'Fresh Produce',
    translations: {
      en: { name: 'Kiwi', description: 'Fresh kiwi fruit' },
      es: { name: 'Kiwi', description: 'Kiwi fresco' },
      hi: { name: 'कीवी', description: 'ताज़ी कीवी' },
    },
  },
  {
    kind: 'object',
    wealthValue: 10,
    category: 'Fresh Produce',
    translations: {
      en: { name: 'Pomegranates', description: 'Fresh pomegranates' },
      es: { name: 'Granadas', description: 'Granadas frescas' },
      hi: { name: 'अनार', description: 'ताज़े अनार' },
    },
  },
  {
    kind: 'object',
    wealthValue: 9,
    category: 'Fresh Produce',
    translations: {
      en: { name: 'Figs', description: 'Fresh figs' },
      es: { name: 'Higos', description: 'Higos frescos' },
      hi: { name: 'अंजीर', description: 'ताज़े अंजीर' },
    },
  },
  {
    kind: 'object',
    wealthValue: 10,
    category: 'Fresh Produce',
    translations: {
      en: { name: 'Dragon Fruit', description: 'Fresh dragon fruit' },
      es: { name: 'Fruta del Dragón', description: 'Fruta del dragón fresca' },
      hi: { name: 'ड्रैगन फ्रूट', description: 'ताज़ा ड्रैगन फ्रूट' },
    },
  },

  // === MUSHROOMS ===
  {
    kind: 'object',
    wealthValue: 8,
    category: 'Fresh Produce',
    translations: {
      en: { name: 'Mushrooms', description: 'Fresh mushrooms (any variety)' },
      es: { name: 'Hongos', description: 'Hongos frescos (cualquier variedad)' },
      hi: { name: 'मशरूम', description: 'ताज़े मशरूम (कोई भी किस्म)' },
    },
  },
];
