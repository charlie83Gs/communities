import { DefaultItemTemplate } from './types';

/**
 * Beverage Items
 * All types of drinks
 */

export const BEVERAGES: DefaultItemTemplate[] = [
  // === GENERAL CATEGORY ===
  {
    kind: 'object',
    wealthValue: 3,
    category: 'Beverages',
    translations: {
      en: { name: 'Beverages', description: 'General beverages category' },
      es: { name: 'Bebidas', description: 'Categoría general de bebidas' },
      hi: { name: 'पेय पदार्थ', description: 'सामान्य पेय श्रेणी' },
    },
  },

  // === HOT BEVERAGES ===
  {
    kind: 'object',
    wealthValue: 4,
    category: 'Beverages',
    translations: {
      en: { name: 'Coffee (Ground)', description: 'Ground coffee beans' },
      es: { name: 'Café (Molido)', description: 'Granos de café molidos' },
      hi: { name: 'कॉफ़ी (पिसी)', description: 'पिसी कॉफ़ी' },
    },
  },
  {
    kind: 'object',
    wealthValue: 5,
    category: 'Beverages',
    translations: {
      en: { name: 'Coffee (Whole Bean)', description: 'Whole coffee beans' },
      es: { name: 'Café (Grano Entero)', description: 'Granos de café enteros' },
      hi: { name: 'कॉफ़ी (पूरी फली)', description: 'पूरी कॉफ़ी की फली' },
    },
  },
  {
    kind: 'object',
    wealthValue: 3,
    category: 'Beverages',
    translations: {
      en: { name: 'Coffee (Instant)', description: 'Instant coffee' },
      es: { name: 'Café (Instantáneo)', description: 'Café instantáneo' },
      hi: { name: 'कॉफ़ी (इंस्टेंट)', description: 'इंस्टेंट कॉफ़ी' },
    },
  },
  {
    kind: 'object',
    wealthValue: 3,
    category: 'Beverages',
    translations: {
      en: { name: 'Tea (Black)', description: 'Black tea bags or loose leaf' },
      es: { name: 'Té (Negro)', description: 'Bolsitas o té negro suelto' },
      hi: { name: 'चाय (काली)', description: 'काली चाय बैग या खुली पत्ती' },
    },
  },
  {
    kind: 'object',
    wealthValue: 4,
    category: 'Beverages',
    translations: {
      en: { name: 'Tea (Green)', description: 'Green tea bags or loose leaf' },
      es: { name: 'Té (Verde)', description: 'Bolsitas o té verde suelto' },
      hi: { name: 'चाय (हरी)', description: 'हरी चाय बैग या खुली पत्ती' },
    },
  },
  {
    kind: 'object',
    wealthValue: 4,
    category: 'Beverages',
    translations: {
      en: { name: 'Tea (Herbal)', description: 'Herbal tea blends' },
      es: { name: 'Té (Herbal)', description: 'Mezclas de té herbal' },
      hi: { name: 'चाय (हर्बल)', description: 'हर्बल चाय मिश्रण' },
    },
  },
  {
    kind: 'object',
    wealthValue: 5,
    category: 'Beverages',
    translations: {
      en: { name: 'Tea (Chai)', description: 'Chai tea/masala chai' },
      es: { name: 'Té (Chai)', description: 'Té chai/masala chai' },
      hi: { name: 'चाय (चाय मसाला)', description: 'चाय/मसाला चाय' },
    },
  },
  {
    kind: 'object',
    wealthValue: 4,
    category: 'Beverages',
    translations: {
      en: { name: 'Tea (Oolong)', description: 'Oolong tea' },
      es: { name: 'Té (Oolong)', description: 'Té oolong' },
      hi: { name: 'चाय (ऊलोंग)', description: 'ऊलोंग चाय' },
    },
  },
  {
    kind: 'object',
    wealthValue: 5,
    category: 'Beverages',
    translations: {
      en: { name: 'Tea (Matcha)', description: 'Matcha green tea powder' },
      es: { name: 'Té (Matcha)', description: 'Té verde matcha en polvo' },
      hi: { name: 'चाय (माचा)', description: 'माचा हरी चाय पाउडर' },
    },
  },
  {
    kind: 'object',
    wealthValue: 3,
    category: 'Beverages',
    translations: {
      en: { name: 'Hot Chocolate Mix', description: 'Hot chocolate/cocoa mix' },
      es: { name: 'Mezcla de Chocolate Caliente', description: 'Mezcla de chocolate/cacao caliente' },
      hi: { name: 'हॉट चॉकलेट मिक्स', description: 'हॉट चॉकलेट/कोको मिक्स' },
    },
  },

  // === JUICES ===
  {
    kind: 'object',
    wealthValue: 4,
    category: 'Beverages',
    translations: {
      en: { name: 'Orange Juice', description: 'Orange juice' },
      es: { name: 'Jugo de Naranja', description: 'Jugo de naranja' },
      hi: { name: 'संतरे का रस', description: 'संतरे का रस' },
    },
  },
  {
    kind: 'object',
    wealthValue: 4,
    category: 'Beverages',
    translations: {
      en: { name: 'Apple Juice', description: 'Apple juice' },
      es: { name: 'Jugo de Manzana', description: 'Jugo de manzana' },
      hi: { name: 'सेब का रस', description: 'सेब का रस' },
    },
  },
  {
    kind: 'object',
    wealthValue: 5,
    category: 'Beverages',
    translations: {
      en: { name: 'Cranberry Juice', description: 'Cranberry juice' },
      es: { name: 'Jugo de Arándano', description: 'Jugo de arándano' },
      hi: { name: 'क्रैनबेरी का रस', description: 'क्रैनबेरी का रस' },
    },
  },
  {
    kind: 'object',
    wealthValue: 5,
    category: 'Beverages',
    translations: {
      en: { name: 'Grape Juice', description: 'Grape juice' },
      es: { name: 'Jugo de Uva', description: 'Jugo de uva' },
      hi: { name: 'अंगूर का रस', description: 'अंगूर का रस' },
    },
  },
  {
    kind: 'object',
    wealthValue: 5,
    category: 'Beverages',
    translations: {
      en: { name: 'Pineapple Juice', description: 'Pineapple juice' },
      es: { name: 'Jugo de Piña', description: 'Jugo de piña' },
      hi: { name: 'अनानास का रस', description: 'अनानास का रस' },
    },
  },
  {
    kind: 'object',
    wealthValue: 5,
    category: 'Beverages',
    translations: {
      en: { name: 'Tomato Juice', description: 'Tomato juice' },
      es: { name: 'Jugo de Tomate', description: 'Jugo de tomate' },
      hi: { name: 'टमाटर का रस', description: 'टमाटर का रस' },
    },
  },
  {
    kind: 'object',
    wealthValue: 5,
    category: 'Beverages',
    translations: {
      en: { name: 'Mixed Fruit Juice', description: 'Mixed fruit juice blend' },
      es: { name: 'Jugo de Frutas Mixtas', description: 'Mezcla de jugos de frutas' },
      hi: { name: 'मिश्रित फल का रस', description: 'मिश्रित फल के रस का मिश्रण' },
    },
  },

  // === SOFT DRINKS ===
  {
    kind: 'object',
    wealthValue: 3,
    category: 'Beverages',
    translations: {
      en: { name: 'Cola', description: 'Cola soft drink' },
      es: { name: 'Cola', description: 'Refresco de cola' },
      hi: { name: 'कोला', description: 'कोला शीतल पेय' },
    },
  },
  {
    kind: 'object',
    wealthValue: 3,
    category: 'Beverages',
    translations: {
      en: { name: 'Lemon-Lime Soda', description: 'Lemon-lime soda/sprite' },
      es: { name: 'Refresco de Limón-Lima', description: 'Refresco de limón-lima/sprite' },
      hi: { name: 'नींबू-लाइम सोडा', description: 'नींबू-लाइम सोडा/स्प्राइट' },
    },
  },
  {
    kind: 'object',
    wealthValue: 3,
    category: 'Beverages',
    translations: {
      en: { name: 'Ginger Ale', description: 'Ginger ale soft drink' },
      es: { name: 'Ginger Ale', description: 'Refresco de jengibre' },
      hi: { name: 'जिंजर एले', description: 'जिंजर एले शीतल पेय' },
    },
  },
  {
    kind: 'object',
    wealthValue: 3,
    category: 'Beverages',
    translations: {
      en: { name: 'Root Beer', description: 'Root beer soft drink' },
      es: { name: 'Root Beer', description: 'Refresco de raíz' },
      hi: { name: 'रूट बीयर', description: 'रूट बीयर शीतल पेय' },
    },
  },
  {
    kind: 'object',
    wealthValue: 3,
    category: 'Beverages',
    translations: {
      en: { name: 'Soda Water', description: 'Carbonated water/club soda' },
      es: { name: 'Agua con Gas', description: 'Agua carbonatada/club soda' },
      hi: { name: 'सोडा वॉटर', description: 'कार्बोनेटेड पानी/क्लब सोडा' },
    },
  },
  {
    kind: 'object',
    wealthValue: 4,
    category: 'Beverages',
    translations: {
      en: { name: 'Sparkling Water', description: 'Flavored or unflavored sparkling water' },
      es: { name: 'Agua con Gas', description: 'Agua con gas con o sin sabor' },
      hi: { name: 'स्पार्कलिंग वॉटर', description: 'स्वाद युक्त या बिना स्वाद का स्पार्कलिंग पानी' },
    },
  },

  // === MILK & ALTERNATIVES ===
  {
    kind: 'object',
    wealthValue: 4,
    category: 'Beverages',
    translations: {
      en: { name: 'Milk (Dairy)', description: 'Cow\'s milk' },
      es: { name: 'Leche (Láctea)', description: 'Leche de vaca' },
      hi: { name: 'दूध (डेयरी)', description: 'गाय का दूध' },
    },
  },
  {
    kind: 'object',
    wealthValue: 5,
    category: 'Beverages',
    translations: {
      en: { name: 'Almond Milk', description: 'Almond milk alternative' },
      es: { name: 'Leche de Almendra', description: 'Alternativa de leche de almendra' },
      hi: { name: 'बादाम का दूध', description: 'बादाम दूध विकल्प' },
    },
  },
  {
    kind: 'object',
    wealthValue: 5,
    category: 'Beverages',
    translations: {
      en: { name: 'Soy Milk', description: 'Soy milk alternative' },
      es: { name: 'Leche de Soya', description: 'Alternativa de leche de soya' },
      hi: { name: 'सोया दूध', description: 'सोया दूध विकल्प' },
    },
  },
  {
    kind: 'object',
    wealthValue: 5,
    category: 'Beverages',
    translations: {
      en: { name: 'Oat Milk', description: 'Oat milk alternative' },
      es: { name: 'Leche de Avena', description: 'Alternativa de leche de avena' },
      hi: { name: 'जई का दूध', description: 'जई दूध विकल्प' },
    },
  },
  {
    kind: 'object',
    wealthValue: 6,
    category: 'Beverages',
    translations: {
      en: { name: 'Coconut Milk', description: 'Coconut milk beverage' },
      es: { name: 'Leche de Coco', description: 'Bebida de leche de coco' },
      hi: { name: 'नारियल का दूध', description: 'नारियल दूध पेय' },
    },
  },
  {
    kind: 'object',
    wealthValue: 5,
    category: 'Beverages',
    translations: {
      en: { name: 'Rice Milk', description: 'Rice milk alternative' },
      es: { name: 'Leche de Arroz', description: 'Alternativa de leche de arroz' },
      hi: { name: 'चावल का दूध', description: 'चावल दूध विकल्प' },
    },
  },
  {
    kind: 'object',
    wealthValue: 4,
    category: 'Beverages',
    translations: {
      en: { name: 'Chocolate Milk', description: 'Chocolate-flavored milk' },
      es: { name: 'Leche con Chocolate', description: 'Leche con sabor a chocolate' },
      hi: { name: 'चॉकलेट दूध', description: 'चॉकलेट स्वाद वाला दूध' },
    },
  },

  // === SPORTS & ENERGY DRINKS ===
  {
    kind: 'object',
    wealthValue: 4,
    category: 'Beverages',
    translations: {
      en: { name: 'Sports Drink', description: 'Electrolyte sports drink' },
      es: { name: 'Bebida Deportiva', description: 'Bebida deportiva con electrolitos' },
      hi: { name: 'स्पोर्ट्स ड्रिंक', description: 'इलेक्ट्रोलाइट स्पोर्ट्स ड्रिंक' },
    },
  },
  {
    kind: 'object',
    wealthValue: 4,
    category: 'Beverages',
    translations: {
      en: { name: 'Energy Drink', description: 'Caffeinated energy drink' },
      es: { name: 'Bebida Energética', description: 'Bebida energética con cafeína' },
      hi: { name: 'एनर्जी ड्रिंक', description: 'कैफीन युक्त एनर्जी ड्रिंक' },
    },
  },
  {
    kind: 'object',
    wealthValue: 5,
    category: 'Beverages',
    translations: {
      en: { name: 'Protein Shake', description: 'Protein shake or powder' },
      es: { name: 'Batido de Proteína', description: 'Batido o polvo de proteína' },
      hi: { name: 'प्रोटीन शेक', description: 'प्रोटीन शेक या पाउडर' },
    },
  },

  // === WATER ===
  {
    kind: 'object',
    wealthValue: 2,
    category: 'Beverages',
    translations: {
      en: { name: 'Bottled Water', description: 'Bottled drinking water' },
      es: { name: 'Agua Embotellada', description: 'Agua potable embotellada' },
      hi: { name: 'बोतलबंद पानी', description: 'बोतलबंद पीने का पानी' },
    },
  },
  {
    kind: 'object',
    wealthValue: 3,
    category: 'Beverages',
    translations: {
      en: { name: 'Coconut Water', description: 'Natural coconut water' },
      es: { name: 'Agua de Coco', description: 'Agua de coco natural' },
      hi: { name: 'नारियल पानी', description: 'प्राकृतिक नारियल पानी' },
    },
  },

  // === OTHER BEVERAGES ===
  {
    kind: 'object',
    wealthValue: 4,
    category: 'Beverages',
    translations: {
      en: { name: 'Lemonade', description: 'Lemonade drink' },
      es: { name: 'Limonada', description: 'Bebida de limonada' },
      hi: { name: 'नींबू पानी', description: 'नींबू पानी पेय' },
    },
  },
  {
    kind: 'object',
    wealthValue: 4,
    category: 'Beverages',
    translations: {
      en: { name: 'Iced Tea', description: 'Bottled iced tea' },
      es: { name: 'Té Helado', description: 'Té helado embotellado' },
      hi: { name: 'आइस्ड टी', description: 'बोतलबंद आइस्ड टी' },
    },
  },
  {
    kind: 'object',
    wealthValue: 5,
    category: 'Beverages',
    translations: {
      en: { name: 'Kombucha', description: 'Fermented tea beverage' },
      es: { name: 'Kombucha', description: 'Bebida de té fermentado' },
      hi: { name: 'कोम्बुचा', description: 'किण्वित चाय पेय' },
    },
  },
];
