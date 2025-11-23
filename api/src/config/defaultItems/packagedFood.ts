import { DefaultItemTemplate } from './types';

/**
 * Packaged Food Items
 * Non-perishable and packaged food products
 */

export const PACKAGED_FOOD: DefaultItemTemplate[] = [
  // === GENERAL CATEGORIES ===
  {
    kind: 'object',
    wealthValue: 3,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Canned Food', description: 'General canned food items' },
      es: { name: 'Alimentos Enlatados', description: 'Alimentos enlatados generales' },
      hi: { name: 'डिब्बाबंद खाद्य', description: 'सामान्य डिब्बाबंद खाद्य पदार्थ' },
    },
  },
  {
    kind: 'object',
    wealthValue: 4,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Dry Goods', description: 'General dry packaged goods' },
      es: { name: 'Productos Secos', description: 'Productos secos envasados generales' },
      hi: { name: 'सूखा सामान', description: 'सामान्य सूखे पैक सामान' },
    },
  },

  // === GRAINS & CEREALS ===
  {
    kind: 'object',
    wealthValue: 3,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Rice (White)', description: 'White rice' },
      es: { name: 'Arroz Blanco', description: 'Arroz blanco' },
      hi: { name: 'चावल (सफेद)', description: 'सफेद चावल' },
    },
  },
  {
    kind: 'object',
    wealthValue: 4,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Rice (Brown)', description: 'Brown rice' },
      es: { name: 'Arroz Integral', description: 'Arroz integral' },
      hi: { name: 'चावल (भूरा)', description: 'भूरा चावल' },
    },
  },
  {
    kind: 'object',
    wealthValue: 5,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Rice (Basmati)', description: 'Basmati rice' },
      es: { name: 'Arroz Basmati', description: 'Arroz basmati' },
      hi: { name: 'चावल (बासमती)', description: 'बासमती चावल' },
    },
  },
  {
    kind: 'object',
    wealthValue: 4,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Quinoa', description: 'Dried quinoa' },
      es: { name: 'Quinoa', description: 'Quinoa seca' },
      hi: { name: 'क्विनोआ', description: 'सूखा क्विनोआ' },
    },
  },
  {
    kind: 'object',
    wealthValue: 3,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Oats', description: 'Rolled or steel-cut oats' },
      es: { name: 'Avena', description: 'Avena arrollada o cortada' },
      hi: { name: 'जई', description: 'रोल्ड या स्टील-कट जई' },
    },
  },
  {
    kind: 'object',
    wealthValue: 3,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Cereal', description: 'Breakfast cereal' },
      es: { name: 'Cereal', description: 'Cereal para desayuno' },
      hi: { name: 'अनाज', description: 'नाश्ते का अनाज' },
    },
  },
  {
    kind: 'object',
    wealthValue: 3,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Granola', description: 'Granola cereal' },
      es: { name: 'Granola', description: 'Cereal granola' },
      hi: { name: 'ग्रेनोला', description: 'ग्रेनोला अनाज' },
    },
  },

  // === PASTA & NOODLES ===
  {
    kind: 'object',
    wealthValue: 3,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Pasta (Spaghetti)', description: 'Spaghetti pasta' },
      es: { name: 'Pasta (Espagueti)', description: 'Pasta espagueti' },
      hi: { name: 'पास्ता (स्पेगेटी)', description: 'स्पेगेटी पास्ता' },
    },
  },
  {
    kind: 'object',
    wealthValue: 3,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Pasta (Penne)', description: 'Penne pasta' },
      es: { name: 'Pasta (Penne)', description: 'Pasta penne' },
      hi: { name: 'पास्ता (पेन)', description: 'पेन पास्ता' },
    },
  },
  {
    kind: 'object',
    wealthValue: 3,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Pasta (Macaroni)', description: 'Macaroni pasta' },
      es: { name: 'Pasta (Macarrones)', description: 'Pasta macarrones' },
      hi: { name: 'पास्ता (मैकरोनी)', description: 'मैकरोनी पास्ता' },
    },
  },
  {
    kind: 'object',
    wealthValue: 3,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Pasta (Other Shapes)', description: 'Various pasta shapes' },
      es: { name: 'Pasta (Otras Formas)', description: 'Varias formas de pasta' },
      hi: { name: 'पास्ता (अन्य आकार)', description: 'विभिन्न पास्ता आकार' },
    },
  },
  {
    kind: 'object',
    wealthValue: 4,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Instant Noodles', description: 'Instant ramen or noodles' },
      es: { name: 'Fideos Instantáneos', description: 'Ramen o fideos instantáneos' },
      hi: { name: 'इंस्टेंट नूडल्स', description: 'इंस्टेंट रेमन या नूडल्स' },
    },
  },
  {
    kind: 'object',
    wealthValue: 4,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Rice Noodles', description: 'Dried rice noodles' },
      es: { name: 'Fideos de Arroz', description: 'Fideos de arroz secos' },
      hi: { name: 'चावल के नूडल्स', description: 'सूखे चावल के नूडल्स' },
    },
  },

  // === LEGUMES (DRIED) ===
  {
    kind: 'object',
    wealthValue: 4,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Lentils (Red)', description: 'Dried red lentils' },
      es: { name: 'Lentejas (Rojas)', description: 'Lentejas rojas secas' },
      hi: { name: 'दाल (लाल)', description: 'सूखी लाल दाल' },
    },
  },
  {
    kind: 'object',
    wealthValue: 4,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Lentils (Green)', description: 'Dried green lentils' },
      es: { name: 'Lentejas (Verdes)', description: 'Lentejas verdes secas' },
      hi: { name: 'दाल (हरी)', description: 'सूखी हरी दाल' },
    },
  },
  {
    kind: 'object',
    wealthValue: 4,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Chickpeas', description: 'Dried chickpeas/garbanzo beans' },
      es: { name: 'Garbanzos', description: 'Garbanzos secos' },
      hi: { name: 'चना', description: 'सूखे चने' },
    },
  },
  {
    kind: 'object',
    wealthValue: 4,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Black Beans', description: 'Dried black beans' },
      es: { name: 'Frijoles Negros', description: 'Frijoles negros secos' },
      hi: { name: 'काली फलियाँ', description: 'सूखी काली फलियाँ' },
    },
  },
  {
    kind: 'object',
    wealthValue: 4,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Kidney Beans', description: 'Dried kidney beans' },
      es: { name: 'Frijoles Rojos', description: 'Frijoles rojos secos' },
      hi: { name: 'राजमा', description: 'सूखा राजमा' },
    },
  },
  {
    kind: 'object',
    wealthValue: 4,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Pinto Beans', description: 'Dried pinto beans' },
      es: { name: 'Frijoles Pintos', description: 'Frijoles pintos secos' },
      hi: { name: 'पिंटो फलियाँ', description: 'सूखी पिंटो फलियाँ' },
    },
  },
  {
    kind: 'object',
    wealthValue: 4,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Split Peas', description: 'Dried split peas' },
      es: { name: 'Guisantes Partidos', description: 'Guisantes partidos secos' },
      hi: { name: 'विभाजित मटर', description: 'सूखे विभाजित मटर' },
    },
  },

  // === CANNED VEGETABLES ===
  {
    kind: 'object',
    wealthValue: 3,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Canned Tomatoes', description: 'Canned whole or crushed tomatoes' },
      es: { name: 'Tomates Enlatados', description: 'Tomates enlatados enteros o triturados' },
      hi: { name: 'डिब्बाबंद टमाटर', description: 'डिब्बाबंद पूरे या कुचले टमाटर' },
    },
  },
  {
    kind: 'object',
    wealthValue: 3,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Canned Corn', description: 'Canned sweet corn' },
      es: { name: 'Maíz Enlatado', description: 'Maíz dulce enlatado' },
      hi: { name: 'डिब्बाबंद मक्का', description: 'डिब्बाबंद मीठी मक्का' },
    },
  },
  {
    kind: 'object',
    wealthValue: 3,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Canned Beans', description: 'Canned beans (various types)' },
      es: { name: 'Frijoles Enlatados', description: 'Frijoles enlatados (varios tipos)' },
      hi: { name: 'डिब्बाबंद फलियाँ', description: 'डिब्बाबंद फलियाँ (विभिन्न प्रकार)' },
    },
  },
  {
    kind: 'object',
    wealthValue: 3,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Canned Peas', description: 'Canned green peas' },
      es: { name: 'Guisantes Enlatados', description: 'Guisantes verdes enlatados' },
      hi: { name: 'डिब्बाबंद मटर', description: 'डिब्बाबंद हरी मटर' },
    },
  },
  {
    kind: 'object',
    wealthValue: 3,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Canned Carrots', description: 'Canned carrots' },
      es: { name: 'Zanahorias Enlatadas', description: 'Zanahorias enlatadas' },
      hi: { name: 'डिब्बाबंद गाजर', description: 'डिब्बाबंद गाजर' },
    },
  },
  {
    kind: 'object',
    wealthValue: 4,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Canned Mixed Vegetables', description: 'Canned mixed vegetable blend' },
      es: { name: 'Verduras Mixtas Enlatadas', description: 'Mezcla de verduras enlatadas' },
      hi: { name: 'डिब्बाबंद मिश्रित सब्जियाँ', description: 'डिब्बाबंद मिश्रित सब्जी मिश्रण' },
    },
  },

  // === CANNED FRUITS ===
  {
    kind: 'object',
    wealthValue: 3,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Canned Peaches', description: 'Canned peaches' },
      es: { name: 'Duraznos Enlatados', description: 'Duraznos enlatados' },
      hi: { name: 'डिब्बाबंद आड़ू', description: 'डिब्बाबंद आड़ू' },
    },
  },
  {
    kind: 'object',
    wealthValue: 3,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Canned Pineapple', description: 'Canned pineapple' },
      es: { name: 'Piña Enlatada', description: 'Piña enlatada' },
      hi: { name: 'डिब्बाबंद अनानास', description: 'डिब्बाबंद अनानास' },
    },
  },
  {
    kind: 'object',
    wealthValue: 3,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Canned Fruit Cocktail', description: 'Canned mixed fruit' },
      es: { name: 'Cóctel de Frutas Enlatado', description: 'Frutas mixtas enlatadas' },
      hi: { name: 'डिब्बाबंद फल कॉकटेल', description: 'डिब्बाबंद मिश्रित फल' },
    },
  },

  // === CANNED PROTEIN ===
  {
    kind: 'object',
    wealthValue: 4,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Canned Tuna', description: 'Canned tuna fish' },
      es: { name: 'Atún Enlatado', description: 'Atún enlatado' },
      hi: { name: 'डिब्बाबंद टूना', description: 'डिब्बाबंद टूना मछली' },
    },
  },
  {
    kind: 'object',
    wealthValue: 4,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Canned Salmon', description: 'Canned salmon' },
      es: { name: 'Salmón Enlatado', description: 'Salmón enlatado' },
      hi: { name: 'डिब्बाबंद सैल्मन', description: 'डिब्बाबंद सैल्मन' },
    },
  },
  {
    kind: 'object',
    wealthValue: 3,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Canned Sardines', description: 'Canned sardines' },
      es: { name: 'Sardinas Enlatadas', description: 'Sardinas enlatadas' },
      hi: { name: 'डिब्बाबंद सार्डिन', description: 'डिब्बाबंद सार्डिन' },
    },
  },
  {
    kind: 'object',
    wealthValue: 3,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Canned Chicken', description: 'Canned chicken meat' },
      es: { name: 'Pollo Enlatado', description: 'Carne de pollo enlatada' },
      hi: { name: 'डिब्बाबंद चिकन', description: 'डिब्बाबंद चिकन मांस' },
    },
  },

  // === SOUPS & BROTHS ===
  {
    kind: 'object',
    wealthValue: 3,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Canned Soup', description: 'Canned soup (various flavors)' },
      es: { name: 'Sopa Enlatada', description: 'Sopa enlatada (varios sabores)' },
      hi: { name: 'डिब्बाबंद सूप', description: 'डिब्बाबंद सूप (विभिन्न स्वाद)' },
    },
  },
  {
    kind: 'object',
    wealthValue: 4,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Broth (Chicken)', description: 'Chicken broth or stock' },
      es: { name: 'Caldo (Pollo)', description: 'Caldo o consomé de pollo' },
      hi: { name: 'शोरबा (चिकन)', description: 'चिकन शोरबा या स्टॉक' },
    },
  },
  {
    kind: 'object',
    wealthValue: 4,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Broth (Vegetable)', description: 'Vegetable broth or stock' },
      es: { name: 'Caldo (Verduras)', description: 'Caldo o consomé de verduras' },
      hi: { name: 'शोरबा (सब्जी)', description: 'सब्जी शोरबा या स्टॉक' },
    },
  },
  {
    kind: 'object',
    wealthValue: 4,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Broth (Beef)', description: 'Beef broth or stock' },
      es: { name: 'Caldo (Res)', description: 'Caldo o consomé de res' },
      hi: { name: 'शोरबा (बीफ)', description: 'बीफ शोरबा या स्टॉक' },
    },
  },

  // === SAUCES & CONDIMENTS ===
  {
    kind: 'object',
    wealthValue: 4,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Tomato Sauce', description: 'Tomato/pasta sauce' },
      es: { name: 'Salsa de Tomate', description: 'Salsa de tomate/pasta' },
      hi: { name: 'टमाटर की चटनी', description: 'टमाटर/पास्ता सॉस' },
    },
  },
  {
    kind: 'object',
    wealthValue: 3,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Tomato Paste', description: 'Concentrated tomato paste' },
      es: { name: 'Pasta de Tomate', description: 'Pasta de tomate concentrada' },
      hi: { name: 'टमाटर का पेस्ट', description: 'केंद्रित टमाटर पेस्ट' },
    },
  },
  {
    kind: 'object',
    wealthValue: 4,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Soy Sauce', description: 'Soy sauce' },
      es: { name: 'Salsa de Soya', description: 'Salsa de soya' },
      hi: { name: 'सोया सॉस', description: 'सोया सॉस' },
    },
  },
  {
    kind: 'object',
    wealthValue: 4,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Hot Sauce', description: 'Hot/chili sauce' },
      es: { name: 'Salsa Picante', description: 'Salsa picante' },
      hi: { name: 'गर्म सॉस', description: 'गर्म/मिर्च सॉस' },
    },
  },
  {
    kind: 'object',
    wealthValue: 3,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Ketchup', description: 'Tomato ketchup' },
      es: { name: 'Kétchup', description: 'Kétchup de tomate' },
      hi: { name: 'केचप', description: 'टमाटर केचप' },
    },
  },
  {
    kind: 'object',
    wealthValue: 3,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Mustard', description: 'Mustard condiment' },
      es: { name: 'Mostaza', description: 'Condimento de mostaza' },
      hi: { name: 'सरसों', description: 'सरसों का मसाला' },
    },
  },
  {
    kind: 'object',
    wealthValue: 4,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Mayonnaise', description: 'Mayonnaise' },
      es: { name: 'Mayonesa', description: 'Mayonesa' },
      hi: { name: 'मेयोनीज़', description: 'मेयोनीज़' },
    },
  },
  {
    kind: 'object',
    wealthValue: 5,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Salsa', description: 'Salsa dip/sauce' },
      es: { name: 'Salsa', description: 'Salsa para mojar' },
      hi: { name: 'साल्सा', description: 'साल्सा डिप/सॉस' },
    },
  },

  // === OILS & VINEGARS ===
  {
    kind: 'object',
    wealthValue: 5,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Olive Oil', description: 'Olive oil for cooking' },
      es: { name: 'Aceite de Oliva', description: 'Aceite de oliva para cocinar' },
      hi: { name: 'जैतून का तेल', description: 'खाना पकाने के लिए जैतून का तेल' },
    },
  },
  {
    kind: 'object',
    wealthValue: 4,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Vegetable Oil', description: 'General vegetable cooking oil' },
      es: { name: 'Aceite Vegetal', description: 'Aceite vegetal general para cocinar' },
      hi: { name: 'वनस्पति तेल', description: 'सामान्य वनस्पति खाना पकाने का तेल' },
    },
  },
  {
    kind: 'object',
    wealthValue: 6,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Coconut Oil', description: 'Coconut oil' },
      es: { name: 'Aceite de Coco', description: 'Aceite de coco' },
      hi: { name: 'नारियल का तेल', description: 'नारियल का तेल' },
    },
  },
  {
    kind: 'object',
    wealthValue: 5,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Sesame Oil', description: 'Sesame cooking oil' },
      es: { name: 'Aceite de Sésamo', description: 'Aceite de sésamo para cocinar' },
      hi: { name: 'तिल का तेल', description: 'तिल का खाना पकाने का तेल' },
    },
  },
  {
    kind: 'object',
    wealthValue: 4,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Vinegar (White)', description: 'White vinegar' },
      es: { name: 'Vinagre (Blanco)', description: 'Vinagre blanco' },
      hi: { name: 'सिरका (सफेद)', description: 'सफेद सिरका' },
    },
  },
  {
    kind: 'object',
    wealthValue: 5,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Vinegar (Balsamic)', description: 'Balsamic vinegar' },
      es: { name: 'Vinagre (Balsámico)', description: 'Vinagre balsámico' },
      hi: { name: 'सिरका (बाल्सेमिक)', description: 'बाल्सेमिक सिरका' },
    },
  },
  {
    kind: 'object',
    wealthValue: 4,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Vinegar (Apple Cider)', description: 'Apple cider vinegar' },
      es: { name: 'Vinagre (Sidra de Manzana)', description: 'Vinagre de sidra de manzana' },
      hi: { name: 'सिरका (सेब का सिडर)', description: 'सेब साइडर सिरका' },
    },
  },

  // === BAKING ITEMS ===
  {
    kind: 'object',
    wealthValue: 3,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Flour (All-Purpose)', description: 'All-purpose wheat flour' },
      es: { name: 'Harina (Todo Uso)', description: 'Harina de trigo todo uso' },
      hi: { name: 'आटा (सर्व-उद्देशीय)', description: 'सर्व-उद्देशीय गेहूं का आटा' },
    },
  },
  {
    kind: 'object',
    wealthValue: 4,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Flour (Whole Wheat)', description: 'Whole wheat flour' },
      es: { name: 'Harina (Integral)', description: 'Harina de trigo integral' },
      hi: { name: 'आटा (पूरा गेहूं)', description: 'पूरा गेहूं का आटा' },
    },
  },
  {
    kind: 'object',
    wealthValue: 3,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Sugar (White)', description: 'White granulated sugar' },
      es: { name: 'Azúcar (Blanca)', description: 'Azúcar blanca granulada' },
      hi: { name: 'चीनी (सफेद)', description: 'सफेद दानेदार चीनी' },
    },
  },
  {
    kind: 'object',
    wealthValue: 4,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Sugar (Brown)', description: 'Brown sugar' },
      es: { name: 'Azúcar (Morena)', description: 'Azúcar morena' },
      hi: { name: 'चीनी (भूरी)', description: 'भूरी चीनी' },
    },
  },
  {
    kind: 'object',
    wealthValue: 5,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Honey', description: 'Natural honey' },
      es: { name: 'Miel', description: 'Miel natural' },
      hi: { name: 'शहद', description: 'प्राकृतिक शहद' },
    },
  },
  {
    kind: 'object',
    wealthValue: 4,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Maple Syrup', description: 'Pure maple syrup' },
      es: { name: 'Jarabe de Arce', description: 'Jarabe de arce puro' },
      hi: { name: 'मेपल सिरप', description: 'शुद्ध मेपल सिरप' },
    },
  },
  {
    kind: 'object',
    wealthValue: 3,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Baking Powder', description: 'Baking powder leavening agent' },
      es: { name: 'Polvo de Hornear', description: 'Polvo de hornear leudante' },
      hi: { name: 'बेकिंग पाउडर', description: 'बेकिंग पाउडर खमीर' },
    },
  },
  {
    kind: 'object',
    wealthValue: 3,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Baking Soda', description: 'Baking soda' },
      es: { name: 'Bicarbonato de Sodio', description: 'Bicarbonato de sodio' },
      hi: { name: 'बेकिंग सोडा', description: 'बेकिंग सोडा' },
    },
  },
  {
    kind: 'object',
    wealthValue: 3,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Yeast', description: 'Baking yeast' },
      es: { name: 'Levadura', description: 'Levadura para hornear' },
      hi: { name: 'खमीर', description: 'बेकिंग खमीर' },
    },
  },

  // === BREAD & BAKED GOODS ===
  {
    kind: 'object',
    wealthValue: 2,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Bread (White)', description: 'White bread loaf' },
      es: { name: 'Pan (Blanco)', description: 'Pan blanco' },
      hi: { name: 'ब्रेड (सफेद)', description: 'सफेद ब्रेड' },
    },
  },
  {
    kind: 'object',
    wealthValue: 3,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Bread (Whole Wheat)', description: 'Whole wheat bread' },
      es: { name: 'Pan (Integral)', description: 'Pan integral' },
      hi: { name: 'ब्रेड (पूरा गेहूं)', description: 'पूरा गेहूं ब्रेड' },
    },
  },
  {
    kind: 'object',
    wealthValue: 3,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Bread (Multigrain)', description: 'Multigrain bread' },
      es: { name: 'Pan (Multicereales)', description: 'Pan multicereales' },
      hi: { name: 'ब्रेड (बहु-अनाज)', description: 'बहु-अनाज ब्रेड' },
    },
  },
  {
    kind: 'object',
    wealthValue: 3,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Bagels', description: 'Bagels' },
      es: { name: 'Bagels', description: 'Bagels' },
      hi: { name: 'बैगल', description: 'बैगल' },
    },
  },
  {
    kind: 'object',
    wealthValue: 3,
    category: 'Packaged Food',
    translations: {
      en: { name: 'English Muffins', description: 'English muffins' },
      es: { name: 'Panecillos Ingleses', description: 'Panecillos ingleses' },
      hi: { name: 'अंग्रेजी मफिन', description: 'अंग्रेजी मफिन' },
    },
  },
  {
    kind: 'object',
    wealthValue: 3,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Tortillas', description: 'Flour or corn tortillas' },
      es: { name: 'Tortillas', description: 'Tortillas de harina o maíz' },
      hi: { name: 'टॉर्टिला', description: 'आटे या मक्का के टॉर्टिला' },
    },
  },
  {
    kind: 'object',
    wealthValue: 4,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Crackers', description: 'Crackers/savory biscuits' },
      es: { name: 'Galletas Saladas', description: 'Galletas saladas' },
      hi: { name: 'क्रैकर्स', description: 'क्रैकर्स/नमकीन बिस्किट' },
    },
  },
  {
    kind: 'object',
    wealthValue: 5,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Cookies', description: 'Sweet cookies/biscuits' },
      es: { name: 'Galletas Dulces', description: 'Galletas dulces' },
      hi: { name: 'कुकीज़', description: 'मीठी कुकीज़/बिस्किट' },
    },
  },

  // === SNACKS ===
  {
    kind: 'object',
    wealthValue: 3,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Chips (Potato)', description: 'Potato chips/crisps' },
      es: { name: 'Papas Fritas', description: 'Papas fritas' },
      hi: { name: 'चिप्स (आलू)', description: 'आलू के चिप्स' },
    },
  },
  {
    kind: 'object',
    wealthValue: 3,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Chips (Tortilla)', description: 'Tortilla/corn chips' },
      es: { name: 'Totopos', description: 'Totopos/chips de maíz' },
      hi: { name: 'चिप्स (टॉर्टिला)', description: 'टॉर्टिला/मक्का चिप्स' },
    },
  },
  {
    kind: 'object',
    wealthValue: 3,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Popcorn', description: 'Popcorn kernels or pre-popped' },
      es: { name: 'Palomitas', description: 'Granos de palomitas o ya preparadas' },
      hi: { name: 'पॉपकॉर्न', description: 'पॉपकॉर्न दाने या पहले से तैयार' },
    },
  },
  {
    kind: 'object',
    wealthValue: 4,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Nuts (Mixed)', description: 'Mixed nuts' },
      es: { name: 'Frutos Secos (Mixtos)', description: 'Frutos secos mixtos' },
      hi: { name: 'मेवे (मिश्रित)', description: 'मिश्रित मेवे' },
    },
  },
  {
    kind: 'object',
    wealthValue: 5,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Almonds', description: 'Almonds' },
      es: { name: 'Almendras', description: 'Almendras' },
      hi: { name: 'बादाम', description: 'बादाम' },
    },
  },
  {
    kind: 'object',
    wealthValue: 5,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Cashews', description: 'Cashew nuts' },
      es: { name: 'Anacardos', description: 'Anacardos' },
      hi: { name: 'काजू', description: 'काजू' },
    },
  },
  {
    kind: 'object',
    wealthValue: 4,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Peanuts', description: 'Peanuts' },
      es: { name: 'Cacahuates', description: 'Cacahuates' },
      hi: { name: 'मूंगफली', description: 'मूंगफली' },
    },
  },
  {
    kind: 'object',
    wealthValue: 5,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Peanut Butter', description: 'Peanut butter spread' },
      es: { name: 'Mantequilla de Maní', description: 'Crema de cacahuate' },
      hi: { name: 'पीनट बटर', description: 'मूंगफली का मक्खन' },
    },
  },
  {
    kind: 'object',
    wealthValue: 6,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Almond Butter', description: 'Almond butter spread' },
      es: { name: 'Mantequilla de Almendra', description: 'Crema de almendra' },
      hi: { name: 'बादाम मक्खन', description: 'बादाम का मक्खन' },
    },
  },
  {
    kind: 'object',
    wealthValue: 4,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Dried Fruit', description: 'Dried/dehydrated fruit' },
      es: { name: 'Fruta Seca', description: 'Fruta seca/deshidratada' },
      hi: { name: 'सूखे मेवे', description: 'सूखे/निर्जलित फल' },
    },
  },
  {
    kind: 'object',
    wealthValue: 4,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Raisins', description: 'Dried raisins' },
      es: { name: 'Pasas', description: 'Pasas secas' },
      hi: { name: 'किशमिश', description: 'सूखी किशमिश' },
    },
  },
  {
    kind: 'object',
    wealthValue: 5,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Dates', description: 'Dried dates' },
      es: { name: 'Dátiles', description: 'Dátiles secos' },
      hi: { name: 'खजूर', description: 'सूखे खजूर' },
    },
  },

  // === SPICES & SEASONINGS ===
  {
    kind: 'object',
    wealthValue: 3,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Salt', description: 'Table salt or sea salt' },
      es: { name: 'Sal', description: 'Sal de mesa o sal marina' },
      hi: { name: 'नमक', description: 'टेबल नमक या समुद्री नमक' },
    },
  },
  {
    kind: 'object',
    wealthValue: 3,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Black Pepper', description: 'Ground black pepper' },
      es: { name: 'Pimienta Negra', description: 'Pimienta negra molida' },
      hi: { name: 'काली मिर्च', description: 'पिसी काली मिर्च' },
    },
  },
  {
    kind: 'object',
    wealthValue: 4,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Spices (Mixed)', description: 'Various cooking spices' },
      es: { name: 'Especias (Mixtas)', description: 'Varias especias para cocinar' },
      hi: { name: 'मसाले (मिश्रित)', description: 'विभिन्न खाना पकाने के मसाले' },
    },
  },
  {
    kind: 'object',
    wealthValue: 4,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Cumin', description: 'Cumin spice' },
      es: { name: 'Comino', description: 'Especia de comino' },
      hi: { name: 'जीरा', description: 'जीरा मसाला' },
    },
  },
  {
    kind: 'object',
    wealthValue: 4,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Cinnamon', description: 'Cinnamon spice' },
      es: { name: 'Canela', description: 'Especia de canela' },
      hi: { name: 'दालचीनी', description: 'दालचीनी मसाला' },
    },
  },
  {
    kind: 'object',
    wealthValue: 5,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Turmeric', description: 'Turmeric powder' },
      es: { name: 'Cúrcuma', description: 'Cúrcuma en polvo' },
      hi: { name: 'हल्दी', description: 'हल्दी पाउडर' },
    },
  },
  {
    kind: 'object',
    wealthValue: 4,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Paprika', description: 'Paprika powder' },
      es: { name: 'Pimentón', description: 'Pimentón en polvo' },
      hi: { name: 'पैपरिका', description: 'पैपरिका पाउडर' },
    },
  },
  {
    kind: 'object',
    wealthValue: 5,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Curry Powder', description: 'Curry powder blend' },
      es: { name: 'Curry en Polvo', description: 'Mezcla de curry en polvo' },
      hi: { name: 'करी पाउडर', description: 'करी पाउडर मिश्रण' },
    },
  },
  {
    kind: 'object',
    wealthValue: 4,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Chili Powder', description: 'Ground chili powder' },
      es: { name: 'Chile en Polvo', description: 'Chile molido en polvo' },
      hi: { name: 'मिर्च पाउडर', description: 'पिसी मिर्च पाउडर' },
    },
  },
  {
    kind: 'object',
    wealthValue: 4,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Garlic Powder', description: 'Dried garlic powder' },
      es: { name: 'Ajo en Polvo', description: 'Ajo seco en polvo' },
      hi: { name: 'लहसुन पाउडर', description: 'सूखा लहसुन पाउडर' },
    },
  },
  {
    kind: 'object',
    wealthValue: 4,
    category: 'Packaged Food',
    translations: {
      en: { name: 'Onion Powder', description: 'Dried onion powder' },
      es: { name: 'Cebolla en Polvo', description: 'Cebolla seca en polvo' },
      hi: { name: 'प्याज पाउडर', description: 'सूखा प्याज पाउडर' },
    },
  },
];
