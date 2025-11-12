import { DefaultItemTemplate } from './types';

/**
 * Other Object Categories
 * Includes: Clothing, Tools, Furniture, Electronics, Books & Media,
 * Sports & Recreation, Household Items, Baby & Children, Personal Care
 */

export const OBJECTS_OTHER: DefaultItemTemplate[] = [
  // ============= CLOTHING =============
  // General Categories
  {
    kind: 'object',
    wealthValue: 10,
    category: 'Clothing',
    translations: {
      en: { name: 'Clothing (Adult)', description: 'General adult clothing' },
      es: { name: 'Ropa (Adulto)', description: 'Ropa general para adultos' },
      hi: { name: 'कपड़े (वयस्क)', description: 'सामान्य वयस्क कपड़े' },
    },
  },
  {
    kind: 'object',
    wealthValue: 8,
    category: 'Clothing',
    translations: {
      en: { name: 'Clothing (Children)', description: 'General children\'s clothing' },
      es: { name: 'Ropa (Niños)', description: 'Ropa general para niños' },
      hi: { name: 'कपड़े (बच्चे)', description: 'सामान्य बच्चों के कपड़े' },
    },
  },

  // Specific Clothing
  {
    kind: 'object',
    wealthValue: 8,
    category: 'Clothing',
    translations: {
      en: { name: 'T-Shirts', description: 'T-shirts' },
      es: { name: 'Camisetas', description: 'Camisetas' },
      hi: { name: 'टी-शर्ट', description: 'टी-शर्ट' },
    },
  },
  {
    kind: 'object',
    wealthValue: 10,
    category: 'Clothing',
    translations: {
      en: { name: 'Shirts (Dress)', description: 'Dress shirts' },
      es: { name: 'Camisas (Formales)', description: 'Camisas formales' },
      hi: { name: 'शर्ट (ड्रेस)', description: 'ड्रेस शर्ट' },
    },
  },
  {
    kind: 'object',
    wealthValue: 12,
    category: 'Clothing',
    translations: {
      en: { name: 'Pants (Jeans)', description: 'Jeans' },
      es: { name: 'Pantalones (Jeans)', description: 'Jeans' },
      hi: { name: 'पैंट (जींस)', description: 'जींस' },
    },
  },
  {
    kind: 'object',
    wealthValue: 10,
    category: 'Clothing',
    translations: {
      en: { name: 'Pants (Casual)', description: 'Casual pants' },
      es: { name: 'Pantalones (Casuales)', description: 'Pantalones casuales' },
      hi: { name: 'पैंट (कैज़ुअल)', description: 'कैज़ुअल पैंट' },
    },
  },
  {
    kind: 'object',
    wealthValue: 8,
    category: 'Clothing',
    translations: {
      en: { name: 'Shorts', description: 'Shorts' },
      es: { name: 'Shorts', description: 'Shorts' },
      hi: { name: 'शॉर्ट्स', description: 'शॉर्ट्स' },
    },
  },
  {
    kind: 'object',
    wealthValue: 10,
    category: 'Clothing',
    translations: {
      en: { name: 'Skirts', description: 'Skirts' },
      es: { name: 'Faldas', description: 'Faldas' },
      hi: { name: 'स्कर्ट', description: 'स्कर्ट' },
    },
  },
  {
    kind: 'object',
    wealthValue: 12,
    category: 'Clothing',
    translations: {
      en: { name: 'Dresses', description: 'Dresses' },
      es: { name: 'Vestidos', description: 'Vestidos' },
      hi: { name: 'पोशाक', description: 'पोशाक' },
    },
  },
  {
    kind: 'object',
    wealthValue: 12,
    category: 'Clothing',
    translations: {
      en: { name: 'Sweaters', description: 'Sweaters/pullovers' },
      es: { name: 'Suéteres', description: 'Suéteres' },
      hi: { name: 'स्वेटर', description: 'स्वेटर' },
    },
  },
  {
    kind: 'object',
    wealthValue: 10,
    category: 'Clothing',
    translations: {
      en: { name: 'Hoodies', description: 'Hooded sweatshirts' },
      es: { name: 'Sudaderas con Capucha', description: 'Sudaderas con capucha' },
      hi: { name: 'हूडीज़', description: 'हुड वाली स्वेटशर्ट' },
    },
  },
  {
    kind: 'object',
    wealthValue: 15,
    category: 'Clothing',
    translations: {
      en: { name: 'Jackets', description: 'Light jackets' },
      es: { name: 'Chaquetas', description: 'Chaquetas ligeras' },
      hi: { name: 'जैकेट', description: 'हल्के जैकेट' },
    },
  },
  {
    kind: 'object',
    wealthValue: 20,
    category: 'Clothing',
    translations: {
      en: { name: 'Winter Coats', description: 'Heavy winter coats' },
      es: { name: 'Abrigos de Invierno', description: 'Abrigos pesados de invierno' },
      hi: { name: 'शीतकालीन कोट', description: 'भारी सर्दियों के कोट' },
    },
  },
  {
    kind: 'object',
    wealthValue: 6,
    category: 'Clothing',
    translations: {
      en: { name: 'Socks', description: 'Socks' },
      es: { name: 'Calcetines', description: 'Calcetines' },
      hi: { name: 'मोज़े', description: 'मोज़े' },
    },
  },
  {
    kind: 'object',
    wealthValue: 6,
    category: 'Clothing',
    translations: {
      en: { name: 'Underwear', description: 'Underwear' },
      es: { name: 'Ropa Interior', description: 'Ropa interior' },
      hi: { name: 'अंडरवियर', description: 'अंडरवियर' },
    },
  },
  {
    kind: 'object',
    wealthValue: 12,
    category: 'Clothing',
    translations: {
      en: { name: 'Shoes (Casual)', description: 'Casual shoes/sneakers' },
      es: { name: 'Zapatos (Casuales)', description: 'Zapatos casuales/tenis' },
      hi: { name: 'जूते (कैज़ुअल)', description: 'कैज़ुअल जूते/स्नीकर्स' },
    },
  },
  {
    kind: 'object',
    wealthValue: 15,
    category: 'Clothing',
    translations: {
      en: { name: 'Shoes (Dress)', description: 'Dress shoes' },
      es: { name: 'Zapatos (Formales)', description: 'Zapatos formales' },
      hi: { name: 'जूते (ड्रेस)', description: 'ड्रेस जूते' },
    },
  },
  {
    kind: 'object',
    wealthValue: 15,
    category: 'Clothing',
    translations: {
      en: { name: 'Boots', description: 'Boots' },
      es: { name: 'Botas', description: 'Botas' },
      hi: { name: 'बूट', description: 'बूट' },
    },
  },
  {
    kind: 'object',
    wealthValue: 8,
    category: 'Clothing',
    translations: {
      en: { name: 'Sandals', description: 'Sandals' },
      es: { name: 'Sandalias', description: 'Sandalias' },
      hi: { name: 'चप्पल', description: 'चप्पल' },
    },
  },
  {
    kind: 'object',
    wealthValue: 8,
    category: 'Clothing',
    translations: {
      en: { name: 'Belts', description: 'Belts' },
      es: { name: 'Cinturones', description: 'Cinturones' },
      hi: { name: 'बेल्ट', description: 'बेल्ट' },
    },
  },
  {
    kind: 'object',
    wealthValue: 10,
    category: 'Clothing',
    translations: {
      en: { name: 'Hats/Caps', description: 'Hats and caps' },
      es: { name: 'Sombreros/Gorras', description: 'Sombreros y gorras' },
      hi: { name: 'टोपी', description: 'टोपी' },
    },
  },
  {
    kind: 'object',
    wealthValue: 8,
    category: 'Clothing',
    translations: {
      en: { name: 'Scarves', description: 'Scarves' },
      es: { name: 'Bufandas', description: 'Bufandas' },
      hi: { name: 'स्कार्फ', description: 'स्कार्फ' },
    },
  },
  {
    kind: 'object',
    wealthValue: 10,
    category: 'Clothing',
    translations: {
      en: { name: 'Gloves', description: 'Gloves' },
      es: { name: 'Guantes', description: 'Guantes' },
      hi: { name: 'दस्ताने', description: 'दस्ताने' },
    },
  },
  {
    kind: 'object',
    wealthValue: 10,
    category: 'Clothing',
    translations: {
      en: { name: 'Bags/Backpacks', description: 'Bags and backpacks' },
      es: { name: 'Bolsos/Mochilas', description: 'Bolsos y mochilas' },
      hi: { name: 'बैग/बैकपैक', description: 'बैग और बैकपैक' },
    },
  },

  // ============= TOOLS =============
  {
    kind: 'object',
    wealthValue: 15,
    category: 'Tools',
    translations: {
      en: { name: 'Hand Tools', description: 'General hand tools category' },
      es: { name: 'Herramientas Manuales', description: 'Categoría general de herramientas manuales' },
      hi: { name: 'हाथ के औज़ार', description: 'सामान्य हाथ के औज़ार श्रेणी' },
    },
  },
  {
    kind: 'object',
    wealthValue: 12,
    category: 'Tools',
    translations: {
      en: { name: 'Hammer', description: 'Hammer' },
      es: { name: 'Martillo', description: 'Martillo' },
      hi: { name: 'हथौड़ा', description: 'हथौड़ा' },
    },
  },
  {
    kind: 'object',
    wealthValue: 15,
    category: 'Tools',
    translations: {
      en: { name: 'Screwdriver Set', description: 'Set of screwdrivers' },
      es: { name: 'Juego de Destornilladores', description: 'Conjunto de destornilladores' },
      hi: { name: 'पेचकस सेट', description: 'पेचकस का सेट' },
    },
  },
  {
    kind: 'object',
    wealthValue: 18,
    category: 'Tools',
    translations: {
      en: { name: 'Wrench Set', description: 'Set of wrenches' },
      es: { name: 'Juego de Llaves', description: 'Conjunto de llaves' },
      hi: { name: 'रिंच सेट', description: 'रिंच का सेट' },
    },
  },
  {
    kind: 'object',
    wealthValue: 15,
    category: 'Tools',
    translations: {
      en: { name: 'Pliers', description: 'Pliers' },
      es: { name: 'Alicates', description: 'Alicates' },
      hi: { name: 'प्लास', description: 'प्लास' },
    },
  },
  {
    kind: 'object',
    wealthValue: 20,
    category: 'Tools',
    translations: {
      en: { name: 'Saw', description: 'Hand saw' },
      es: { name: 'Sierra', description: 'Sierra manual' },
      hi: { name: 'आरी', description: 'हाथ की आरी' },
    },
  },
  {
    kind: 'object',
    wealthValue: 50,
    category: 'Tools',
    translations: {
      en: { name: 'Power Drill', description: 'Electric power drill' },
      es: { name: 'Taladro Eléctrico', description: 'Taladro eléctrico' },
      hi: { name: 'पावर ड्रिल', description: 'इलेक्ट्रिक पावर ड्रिल' },
    },
  },
  {
    kind: 'object',
    wealthValue: 60,
    category: 'Tools',
    translations: {
      en: { name: 'Power Saw', description: 'Electric power saw' },
      es: { name: 'Sierra Eléctrica', description: 'Sierra eléctrica' },
      hi: { name: 'पावर आरी', description: 'इलेक्ट्रिक पावर आरी' },
    },
  },
  {
    kind: 'object',
    wealthValue: 55,
    category: 'Tools',
    translations: {
      en: { name: 'Sanders', description: 'Electric sander' },
      es: { name: 'Lijadora', description: 'Lijadora eléctrica' },
      hi: { name: 'सैंडर', description: 'इलेक्ट्रिक सैंडर' },
    },
  },
  {
    kind: 'object',
    wealthValue: 20,
    category: 'Tools',
    translations: {
      en: { name: 'Shovel', description: 'Shovel' },
      es: { name: 'Pala', description: 'Pala' },
      hi: { name: 'फावड़ा', description: 'फावड़ा' },
    },
  },
  {
    kind: 'object',
    wealthValue: 18,
    category: 'Tools',
    translations: {
      en: { name: 'Rake', description: 'Garden rake' },
      es: { name: 'Rastrillo', description: 'Rastrillo de jardín' },
      hi: { name: 'रेक', description: 'बगीचे की रेक' },
    },
  },
  {
    kind: 'object',
    wealthValue: 15,
    category: 'Tools',
    translations: {
      en: { name: 'Hoe', description: 'Garden hoe' },
      es: { name: 'Azada', description: 'Azada de jardín' },
      hi: { name: 'कुदाल', description: 'बगीचे की कुदाल' },
    },
  },
  {
    kind: 'object',
    wealthValue: 12,
    category: 'Tools',
    translations: {
      en: { name: 'Pruning Shears', description: 'Garden pruning shears' },
      es: { name: 'Tijeras de Podar', description: 'Tijeras de podar de jardín' },
      hi: { name: 'कैंची (बागवानी)', description: 'बागवानी कैंची' },
    },
  },
  {
    kind: 'object',
    wealthValue: 30,
    category: 'Tools',
    translations: {
      en: { name: 'Lawn Mower', description: 'Lawn mower' },
      es: { name: 'Cortadora de Césped', description: 'Cortadora de césped' },
      hi: { name: 'लॉन मोवर', description: 'लॉन मोवर' },
    },
  },
  {
    kind: 'object',
    wealthValue: 25,
    category: 'Tools',
    translations: {
      en: { name: 'Ladder', description: 'Ladder' },
      es: { name: 'Escalera', description: 'Escalera' },
      hi: { name: 'सीढ़ी', description: 'सीढ़ी' },
    },
  },
  {
    kind: 'object',
    wealthValue: 35,
    category: 'Tools',
    translations: {
      en: { name: 'Toolbox (Filled)', description: 'Complete toolbox with tools' },
      es: { name: 'Caja de Herramientas (Completa)', description: 'Caja de herramientas completa' },
      hi: { name: 'टूलबॉक्स (भरा)', description: 'औज़ारों के साथ पूर्ण टूलबॉक्स' },
    },
  },

  // ============= FURNITURE =============
  {
    kind: 'object',
    wealthValue: 50,
    category: 'Furniture',
    translations: {
      en: { name: 'Chair', description: 'Chair' },
      es: { name: 'Silla', description: 'Silla' },
      hi: { name: 'कुर्सी', description: 'कुर्सी' },
    },
  },
  {
    kind: 'object',
    wealthValue: 80,
    category: 'Furniture',
    translations: {
      en: { name: 'Table (Dining)', description: 'Dining table' },
      es: { name: 'Mesa (Comedor)', description: 'Mesa de comedor' },
      hi: { name: 'मेज़ (भोजन)', description: 'भोजन मेज़' },
    },
  },
  {
    kind: 'object',
    wealthValue: 60,
    category: 'Furniture',
    translations: {
      en: { name: 'Table (Coffee)', description: 'Coffee table' },
      es: { name: 'Mesa (Café)', description: 'Mesa de café' },
      hi: { name: 'मेज़ (कॉफ़ी)', description: 'कॉफ़ी मेज़' },
    },
  },
  {
    kind: 'object',
    wealthValue: 90,
    category: 'Furniture',
    translations: {
      en: { name: 'Desk', description: 'Desk' },
      es: { name: 'Escritorio', description: 'Escritorio' },
      hi: { name: 'डेस्क', description: 'डेस्क' },
    },
  },
  {
    kind: 'object',
    wealthValue: 120,
    category: 'Furniture',
    translations: {
      en: { name: 'Bed Frame', description: 'Bed frame (without mattress)' },
      es: { name: 'Estructura de Cama', description: 'Estructura de cama (sin colchón)' },
      hi: { name: 'पलंग फ्रेम', description: 'पलंग फ्रेम (गद्दे के बिना)' },
    },
  },
  {
    kind: 'object',
    wealthValue: 150,
    category: 'Furniture',
    translations: {
      en: { name: 'Mattress', description: 'Mattress' },
      es: { name: 'Colchón', description: 'Colchón' },
      hi: { name: 'गद्दा', description: 'गद्दा' },
    },
  },
  {
    kind: 'object',
    wealthValue: 100,
    category: 'Furniture',
    translations: {
      en: { name: 'Sofa/Couch', description: 'Sofa or couch' },
      es: { name: 'Sofá', description: 'Sofá' },
      hi: { name: 'सोफ़ा', description: 'सोफ़ा' },
    },
  },
  {
    kind: 'object',
    wealthValue: 70,
    category: 'Furniture',
    translations: {
      en: { name: 'Armchair', description: 'Armchair' },
      es: { name: 'Sillón', description: 'Sillón' },
      hi: { name: 'आरामकुर्सी', description: 'आरामकुर्सी' },
    },
  },
  {
    kind: 'object',
    wealthValue: 60,
    category: 'Furniture',
    translations: {
      en: { name: 'Bookshelf', description: 'Bookshelf' },
      es: { name: 'Estantería', description: 'Estantería' },
      hi: { name: 'किताबों की अलमारी', description: 'किताबों की अलमारी' },
    },
  },
  {
    kind: 'object',
    wealthValue: 90,
    category: 'Furniture',
    translations: {
      en: { name: 'Dresser', description: 'Dresser/chest of drawers' },
      es: { name: 'Cómoda', description: 'Cómoda' },
      hi: { name: 'दराज़', description: 'दराज़' },
    },
  },
  {
    kind: 'object',
    wealthValue: 110,
    category: 'Furniture',
    translations: {
      en: { name: 'Wardrobe', description: 'Wardrobe/closet' },
      es: { name: 'Armario', description: 'Armario' },
      hi: { name: 'अलमारी', description: 'अलमारी' },
    },
  },
  {
    kind: 'object',
    wealthValue: 80,
    category: 'Furniture',
    translations: {
      en: { name: 'Nightstand', description: 'Bedside table' },
      es: { name: 'Mesita de Noche', description: 'Mesita de noche' },
      hi: { name: 'नाइटस्टैंड', description: 'बेडसाइड टेबल' },
    },
  },

  // ============= ELECTRONICS & APPLIANCES =============
  {
    kind: 'object',
    wealthValue: 200,
    category: 'Electronics',
    translations: {
      en: { name: 'Laptop/Computer', description: 'Laptop or desktop computer' },
      es: { name: 'Portátil/Computadora', description: 'Portátil o computadora de escritorio' },
      hi: { name: 'लैपटॉप/कंप्यूटर', description: 'लैपटॉप या डेस्कटॉप कंप्यूटर' },
    },
  },
  {
    kind: 'object',
    wealthValue: 100,
    category: 'Electronics',
    translations: {
      en: { name: 'Smartphone', description: 'Smartphone' },
      es: { name: 'Teléfono Inteligente', description: 'Teléfono inteligente' },
      hi: { name: 'स्मार्टफ़ोन', description: 'स्मार्टफ़ोन' },
    },
  },
  {
    kind: 'object',
    wealthValue: 90,
    category: 'Electronics',
    translations: {
      en: { name: 'Tablet', description: 'Tablet' },
      es: { name: 'Tableta', description: 'Tableta' },
      hi: { name: 'टैबलेट', description: 'टैबलेट' },
    },
  },
  {
    kind: 'object',
    wealthValue: 150,
    category: 'Electronics',
    translations: {
      en: { name: 'Television', description: 'TV' },
      es: { name: 'Televisión', description: 'Televisión' },
      hi: { name: 'टेलीविजन', description: 'टीवी' },
    },
  },
  {
    kind: 'object',
    wealthValue: 40,
    category: 'Electronics',
    translations: {
      en: { name: 'Monitor', description: 'Computer monitor' },
      es: { name: 'Monitor', description: 'Monitor de computadora' },
      hi: { name: 'मॉनिटर', description: 'कंप्यूटर मॉनिटर' },
    },
  },
  {
    kind: 'object',
    wealthValue: 35,
    category: 'Electronics',
    translations: {
      en: { name: 'Printer', description: 'Computer printer' },
      es: { name: 'Impresora', description: 'Impresora de computadora' },
      hi: { name: 'प्रिंटर', description: 'कंप्यूटर प्रिंटर' },
    },
  },
  {
    kind: 'object',
    wealthValue: 30,
    category: 'Electronics',
    translations: {
      en: { name: 'Keyboard & Mouse', description: 'Computer keyboard and mouse' },
      es: { name: 'Teclado y Ratón', description: 'Teclado y ratón de computadora' },
      hi: { name: 'कीबोर्ड और माउस', description: 'कंप्यूटर कीबोर्ड और माउस' },
    },
  },
  {
    kind: 'object',
    wealthValue: 50,
    category: 'Electronics',
    translations: {
      en: { name: 'Headphones', description: 'Headphones or earbuds' },
      es: { name: 'Auriculares', description: 'Auriculares' },
      hi: { name: 'हेडफ़ोन', description: 'हेडफ़ोन या ईयरबड' },
    },
  },
  {
    kind: 'object',
    wealthValue: 40,
    category: 'Electronics',
    translations: {
      en: { name: 'Toaster', description: 'Toaster' },
      es: { name: 'Tostadora', description: 'Tostadora' },
      hi: { name: 'टोस्टर', description: 'टोस्टर' },
    },
  },
  {
    kind: 'object',
    wealthValue: 50,
    category: 'Electronics',
    translations: {
      en: { name: 'Blender', description: 'Blender' },
      es: { name: 'Licuadora', description: 'Licuadora' },
      hi: { name: 'ब्लेंडर', description: 'ब्लेंडर' },
    },
  },
  {
    kind: 'object',
    wealthValue: 45,
    category: 'Electronics',
    translations: {
      en: { name: 'Coffee Maker', description: 'Coffee maker' },
      es: { name: 'Cafetera', description: 'Cafetera' },
      hi: { name: 'कॉफ़ी मेकर', description: 'कॉफ़ी मेकर' },
    },
  },
  {
    kind: 'object',
    wealthValue: 60,
    category: 'Electronics',
    translations: {
      en: { name: 'Microwave', description: 'Microwave oven' },
      es: { name: 'Microondas', description: 'Horno microondas' },
      hi: { name: 'माइक्रोवेव', description: 'माइक्रोवेव ओवन' },
    },
  },
  {
    kind: 'object',
    wealthValue: 150,
    category: 'Electronics',
    translations: {
      en: { name: 'Refrigerator', description: 'Refrigerator' },
      es: { name: 'Refrigerador', description: 'Refrigerador' },
      hi: { name: 'रेफ़्रिजरेटर', description: 'रेफ़्रिजरेटर' },
    },
  },
  {
    kind: 'object',
    wealthValue: 120,
    category: 'Electronics',
    translations: {
      en: { name: 'Washing Machine', description: 'Washing machine' },
      es: { name: 'Lavadora', description: 'Lavadora' },
      hi: { name: 'वॉशिंग मशीन', description: 'वॉशिंग मशीन' },
    },
  },
  {
    kind: 'object',
    wealthValue: 100,
    category: 'Electronics',
    translations: {
      en: { name: 'Dryer', description: 'Clothes dryer' },
      es: { name: 'Secadora', description: 'Secadora de ropa' },
      hi: { name: 'ड्रायर', description: 'कपड़े सुखाने की मशीन' },
    },
  },
  {
    kind: 'object',
    wealthValue: 30,
    category: 'Electronics',
    translations: {
      en: { name: 'Lamp', description: 'Lamp' },
      es: { name: 'Lámpara', description: 'Lámpara' },
      hi: { name: 'लैंप', description: 'लैंप' },
    },
  },
  {
    kind: 'object',
    wealthValue: 80,
    category: 'Electronics',
    translations: {
      en: { name: 'Space Heater', description: 'Electric space heater' },
      es: { name: 'Calentador de Espacio', description: 'Calentador de espacio eléctrico' },
      hi: { name: 'स्पेस हीटर', description: 'इलेक्ट्रिक स्पेस हीटर' },
    },
  },
  {
    kind: 'object',
    wealthValue: 70,
    category: 'Electronics',
    translations: {
      en: { name: 'Fan', description: 'Electric fan' },
      es: { name: 'Ventilador', description: 'Ventilador eléctrico' },
      hi: { name: 'पंखा', description: 'इलेक्ट्रिक पंखा' },
    },
  },
  {
    kind: 'object',
    wealthValue: 50,
    category: 'Electronics',
    translations: {
      en: { name: 'Vacuum Cleaner', description: 'Vacuum cleaner' },
      es: { name: 'Aspiradora', description: 'Aspiradora' },
      hi: { name: 'वैक्यूम क्लीनर', description: 'वैक्यूम क्लीनर' },
    },
  },
  {
    kind: 'object',
    wealthValue: 40,
    category: 'Electronics',
    translations: {
      en: { name: 'Iron', description: 'Clothes iron' },
      es: { name: 'Plancha', description: 'Plancha de ropa' },
      hi: { name: 'इस्त्री', description: 'कपड़े की इस्त्री' },
    },
  },

  // ============= BOOKS & MEDIA =============
  {
    kind: 'object',
    wealthValue: 8,
    category: 'Books & Media',
    translations: {
      en: { name: 'Books', description: 'Books' },
      es: { name: 'Libros', description: 'Libros' },
      hi: { name: 'किताबें', description: 'किताबें' },
    },
  },
  {
    kind: 'object',
    wealthValue: 15,
    category: 'Books & Media',
    translations: {
      en: { name: 'Textbooks', description: 'Educational textbooks' },
      es: { name: 'Libros de Texto', description: 'Libros de texto educativos' },
      hi: { name: 'पाठ्यपुस्तकें', description: 'शैक्षिक पाठ्यपुस्तकें' },
    },
  },
  {
    kind: 'object',
    wealthValue: 15,
    category: 'Books & Media',
    translations: {
      en: { name: 'Educational Materials', description: 'Learning materials and workbooks' },
      es: { name: 'Materiales Educativos', description: 'Materiales de aprendizaje y cuadernos' },
      hi: { name: 'शैक्षिक सामग्री', description: 'सीखने की सामग्री और वर्कबुक' },
    },
  },
  {
    kind: 'object',
    wealthValue: 12,
    category: 'Books & Media',
    translations: {
      en: { name: 'Board Games', description: 'Board games' },
      es: { name: 'Juegos de Mesa', description: 'Juegos de mesa' },
      hi: { name: 'बोर्ड गेम', description: 'बोर्ड गेम' },
    },
  },
  {
    kind: 'object',
    wealthValue: 10,
    category: 'Books & Media',
    translations: {
      en: { name: 'Puzzles', description: 'Puzzles' },
      es: { name: 'Rompecabezas', description: 'Rompecabezas' },
      hi: { name: 'पहेलियाँ', description: 'पहेलियाँ' },
    },
  },

  // ============= SPORTS & RECREATION =============
  {
    kind: 'object',
    wealthValue: 100,
    category: 'Sports & Recreation',
    translations: {
      en: { name: 'Bicycle', description: 'Bicycle' },
      es: { name: 'Bicicleta', description: 'Bicicleta' },
      hi: { name: 'साइकिल', description: 'साइकिल' },
    },
  },
  {
    kind: 'object',
    wealthValue: 25,
    category: 'Sports & Recreation',
    translations: {
      en: { name: 'Sports Equipment', description: 'General sports equipment' },
      es: { name: 'Equipo Deportivo', description: 'Equipo deportivo general' },
      hi: { name: 'खेल उपकरण', description: 'सामान्य खेल उपकरण' },
    },
  },
  {
    kind: 'object',
    wealthValue: 15,
    category: 'Sports & Recreation',
    translations: {
      en: { name: 'Soccer Ball', description: 'Soccer ball/football' },
      es: { name: 'Balón de Fútbol', description: 'Balón de fútbol' },
      hi: { name: 'फुटबॉल', description: 'फुटबॉल' },
    },
  },
  {
    kind: 'object',
    wealthValue: 15,
    category: 'Sports & Recreation',
    translations: {
      en: { name: 'Basketball', description: 'Basketball' },
      es: { name: 'Baloncesto', description: 'Baloncesto' },
      hi: { name: 'बास्केटबॉल', description: 'बास्केटबॉल' },
    },
  },
  {
    kind: 'object',
    wealthValue: 20,
    category: 'Sports & Recreation',
    translations: {
      en: { name: 'Tennis Racket', description: 'Tennis racket' },
      es: { name: 'Raqueta de Tenis', description: 'Raqueta de tenis' },
      hi: { name: 'टेनिस रैकेट', description: 'टेनिस रैकेट' },
    },
  },
  {
    kind: 'object',
    wealthValue: 40,
    category: 'Sports & Recreation',
    translations: {
      en: { name: 'Camping Tent', description: 'Camping tent' },
      es: { name: 'Tienda de Campaña', description: 'Tienda de campaña' },
      hi: { name: 'कैंपिंग तंबू', description: 'कैंपिंग तंबू' },
    },
  },
  {
    kind: 'object',
    wealthValue: 35,
    category: 'Sports & Recreation',
    translations: {
      en: { name: 'Sleeping Bag', description: 'Sleeping bag' },
      es: { name: 'Saco de Dormir', description: 'Saco de dormir' },
      hi: { name: 'स्लीपिंग बैग', description: 'स्लीपिंग बैग' },
    },
  },
  {
    kind: 'object',
    wealthValue: 30,
    category: 'Sports & Recreation',
    translations: {
      en: { name: 'Backpack (Hiking)', description: 'Hiking backpack' },
      es: { name: 'Mochila (Senderismo)', description: 'Mochila de senderismo' },
      hi: { name: 'बैकपैक (हाइकिंग)', description: 'हाइकिंग बैकपैक' },
    },
  },
  {
    kind: 'object',
    wealthValue: 60,
    category: 'Sports & Recreation',
    translations: {
      en: { name: 'Guitar', description: 'Acoustic or electric guitar' },
      es: { name: 'Guitarra', description: 'Guitarra acústica o eléctrica' },
      hi: { name: 'गिटार', description: 'ध्वनिक या इलेक्ट्रिक गिटार' },
    },
  },
  {
    kind: 'object',
    wealthValue: 50,
    category: 'Sports & Recreation',
    translations: {
      en: { name: 'Keyboard (Musical)', description: 'Musical keyboard/piano' },
      es: { name: 'Teclado (Musical)', description: 'Teclado/piano musical' },
      hi: { name: 'कीबोर्ड (संगीत)', description: 'संगीत कीबोर्ड/पियानो' },
    },
  },
  {
    kind: 'object',
    wealthValue: 40,
    category: 'Sports & Recreation',
    translations: {
      en: { name: 'Drums', description: 'Drum set or percussion' },
      es: { name: 'Batería', description: 'Batería o percusión' },
      hi: { name: 'ड्रम', description: 'ड्रम सेट या तालवाद्य' },
    },
  },

  // ============= HOUSEHOLD ITEMS =============
  {
    kind: 'object',
    wealthValue: 25,
    category: 'Household Items',
    translations: {
      en: { name: 'Bedding Set', description: 'Bedding, sheets, pillows' },
      es: { name: 'Juego de Ropa de Cama', description: 'Ropa de cama, sábanas, almohadas' },
      hi: { name: 'बिस्तर सेट', description: 'बिस्तर, चादरें, तकिए' },
    },
  },
  {
    kind: 'object',
    wealthValue: 20,
    category: 'Household Items',
    translations: {
      en: { name: 'Towels', description: 'Bath towels' },
      es: { name: 'Toallas', description: 'Toallas de baño' },
      hi: { name: 'तौलिए', description: 'नहाने के तौलिए' },
    },
  },
  {
    kind: 'object',
    wealthValue: 15,
    category: 'Household Items',
    translations: {
      en: { name: 'Kitchenware Set', description: 'Pots, pans, utensils, dishes' },
      es: { name: 'Juego de Utensilios de Cocina', description: 'Ollas, sartenes, utensilios, platos' },
      hi: { name: 'रसोई के बर्तन सेट', description: 'बर्तन, कड़ाही, उपकरण, प्लेटें' },
    },
  },
  {
    kind: 'object',
    wealthValue: 12,
    category: 'Household Items',
    translations: {
      en: { name: 'Plates & Bowls', description: 'Dining plates and bowls' },
      es: { name: 'Platos y Cuencos', description: 'Platos y cuencos para comer' },
      hi: { name: 'प्लेटें और कटोरे', description: 'भोजन प्लेटें और कटोरे' },
    },
  },
  {
    kind: 'object',
    wealthValue: 10,
    category: 'Household Items',
    translations: {
      en: { name: 'Glasses & Cups', description: 'Drinking glasses and cups' },
      es: { name: 'Vasos y Tazas', description: 'Vasos y tazas para beber' },
      hi: { name: 'गिलास और कप', description: 'पीने के गिलास और कप' },
    },
  },
  {
    kind: 'object',
    wealthValue: 12,
    category: 'Household Items',
    translations: {
      en: { name: 'Cutlery Set', description: 'Forks, knives, spoons' },
      es: { name: 'Juego de Cubiertos', description: 'Tenedores, cuchillos, cucharas' },
      hi: { name: 'कटलरी सेट', description: 'कांटे, चाकू, चम्मच' },
    },
  },
  {
    kind: 'object',
    wealthValue: 20,
    category: 'Household Items',
    translations: {
      en: { name: 'Cleaning Supplies', description: 'Cleaning products and tools' },
      es: { name: 'Suministros de Limpieza', description: 'Productos y herramientas de limpieza' },
      hi: { name: 'सफ़ाई की आपूर्ति', description: 'सफ़ाई के उत्पाद और औज़ार' },
    },
  },
  {
    kind: 'object',
    wealthValue: 18,
    category: 'Household Items',
    translations: {
      en: { name: 'Storage Containers', description: 'Storage bins, boxes, organizers' },
      es: { name: 'Contenedores de Almacenamiento', description: 'Recipientes, cajas, organizadores' },
      hi: { name: 'भंडारण पात्र', description: 'भंडारण डिब्बे, बॉक्स, आयोजक' },
    },
  },
  {
    kind: 'object',
    wealthValue: 15,
    category: 'Household Items',
    translations: {
      en: { name: 'Trash Cans', description: 'Trash/garbage cans' },
      es: { name: 'Botes de Basura', description: 'Botes de basura' },
      hi: { name: 'कूड़ेदान', description: 'कूड़ेदान' },
    },
  },
  {
    kind: 'object',
    wealthValue: 22,
    category: 'Household Items',
    translations: {
      en: { name: 'Bathroom Essentials', description: 'Bath mat, shower curtain, accessories' },
      es: { name: 'Elementos Esenciales de Baño', description: 'Alfombra de baño, cortina de ducha, accesorios' },
      hi: { name: 'बाथरूम की आवश्यक वस्तुएँ', description: 'बाथ मैट, शावर पर्दा, सामान' },
    },
  },
  {
    kind: 'object',
    wealthValue: 25,
    category: 'Household Items',
    translations: {
      en: { name: 'Curtains/Blinds', description: 'Window curtains or blinds' },
      es: { name: 'Cortinas/Persianas', description: 'Cortinas o persianas de ventana' },
      hi: { name: 'पर्दे/ब्लाइंड्स', description: 'खिड़की के पर्दे या ब्लाइंड्स' },
    },
  },
  {
    kind: 'object',
    wealthValue: 20,
    category: 'Household Items',
    translations: {
      en: { name: 'Rugs/Carpets', description: 'Area rugs or carpets' },
      es: { name: 'Alfombras', description: 'Alfombras' },
      hi: { name: 'गलीचे/कालीन', description: 'क्षेत्र गलीचे या कालीन' },
    },
  },

  // ============= BABY & CHILDREN =============
  {
    kind: 'object',
    wealthValue: 35,
    category: 'Baby & Children',
    translations: {
      en: { name: 'Baby Clothing', description: 'Baby clothing bundle' },
      es: { name: 'Ropa de Bebé', description: 'Paquete de ropa de bebé' },
      hi: { name: 'शिशु कपड़े', description: 'शिशु कपड़ों का बंडल' },
    },
  },
  {
    kind: 'object',
    wealthValue: 60,
    category: 'Baby & Children',
    translations: {
      en: { name: 'Stroller', description: 'Baby stroller' },
      es: { name: 'Cochecito', description: 'Cochecito de bebé' },
      hi: { name: 'स्ट्रॉलर', description: 'शिशु स्ट्रॉलर' },
    },
  },
  {
    kind: 'object',
    wealthValue: 70,
    category: 'Baby & Children',
    translations: {
      en: { name: 'Car Seat', description: 'Baby car seat' },
      es: { name: 'Asiento de Coche', description: 'Asiento de coche para bebé' },
      hi: { name: 'कार सीट', description: 'शिशु कार सीट' },
    },
  },
  {
    kind: 'object',
    wealthValue: 50,
    category: 'Baby & Children',
    translations: {
      en: { name: 'High Chair', description: 'Baby high chair' },
      es: { name: 'Silla Alta', description: 'Silla alta para bebé' },
      hi: { name: 'हाई चेयर', description: 'शिशु हाई चेयर' },
    },
  },
  {
    kind: 'object',
    wealthValue: 40,
    category: 'Baby & Children',
    translations: {
      en: { name: 'Crib', description: 'Baby crib/cot' },
      es: { name: 'Cuna', description: 'Cuna de bebé' },
      hi: { name: 'पालना', description: 'शिशु पालना' },
    },
  },
  {
    kind: 'object',
    wealthValue: 15,
    category: 'Baby & Children',
    translations: {
      en: { name: 'Toys', description: 'Children\'s toys' },
      es: { name: 'Juguetes', description: 'Juguetes para niños' },
      hi: { name: 'खिलौने', description: 'बच्चों के खिलौने' },
    },
  },
  {
    kind: 'object',
    wealthValue: 30,
    category: 'Baby & Children',
    translations: {
      en: { name: 'Diapers', description: 'Disposable diapers' },
      es: { name: 'Pañales', description: 'Pañales desechables' },
      hi: { name: 'डायपर', description: 'डिस्पोजेबल डायपर' },
    },
  },
  {
    kind: 'object',
    wealthValue: 25,
    category: 'Baby & Children',
    translations: {
      en: { name: 'Baby Formula', description: 'Baby formula' },
      es: { name: 'Fórmula para Bebé', description: 'Fórmula para bebé' },
      hi: { name: 'शिशु फ़ॉर्मूला', description: 'शिशु फ़ॉर्मूला' },
    },
  },
  {
    kind: 'object',
    wealthValue: 20,
    category: 'Baby & Children',
    translations: {
      en: { name: 'Baby Care Products', description: 'Wipes, bottles, pacifiers, etc.' },
      es: { name: 'Productos de Cuidado del Bebé', description: 'Toallitas, biberones, chupetes, etc.' },
      hi: { name: 'शिशु देखभाल उत्पाद', description: 'वाइप्स, बोतलें, पैसिफायर, आदि' },
    },
  },

  // ============= PERSONAL CARE =============
  {
    kind: 'object',
    wealthValue: 10,
    category: 'Personal Care',
    translations: {
      en: { name: 'Toiletries Set', description: 'Soap, shampoo, toothpaste, etc.' },
      es: { name: 'Juego de Artículos de Tocador', description: 'Jabón, champú, pasta de dientes, etc.' },
      hi: { name: 'प्रसाधन सामग्री सेट', description: 'साबुन, शैम्पू, टूथपेस्ट, आदि' },
    },
  },
  {
    kind: 'object',
    wealthValue: 5,
    category: 'Personal Care',
    translations: {
      en: { name: 'Soap', description: 'Bar or liquid soap' },
      es: { name: 'Jabón', description: 'Jabón en barra o líquido' },
      hi: { name: 'साबुन', description: 'बार या तरल साबुन' },
    },
  },
  {
    kind: 'object',
    wealthValue: 6,
    category: 'Personal Care',
    translations: {
      en: { name: 'Shampoo', description: 'Hair shampoo' },
      es: { name: 'Champú', description: 'Champú para el cabello' },
      hi: { name: 'शैम्पू', description: 'बालों का शैम्पू' },
    },
  },
  {
    kind: 'object',
    wealthValue: 6,
    category: 'Personal Care',
    translations: {
      en: { name: 'Conditioner', description: 'Hair conditioner' },
      es: { name: 'Acondicionador', description: 'Acondicionador para el cabello' },
      hi: { name: 'कंडीशनर', description: 'बालों का कंडीशनर' },
    },
  },
  {
    kind: 'object',
    wealthValue: 4,
    category: 'Personal Care',
    translations: {
      en: { name: 'Toothpaste', description: 'Toothpaste' },
      es: { name: 'Pasta de Dientes', description: 'Pasta de dientes' },
      hi: { name: 'टूथपेस्ट', description: 'टूथपेस्ट' },
    },
  },
  {
    kind: 'object',
    wealthValue: 3,
    category: 'Personal Care',
    translations: {
      en: { name: 'Toothbrush', description: 'Toothbrush' },
      es: { name: 'Cepillo de Dientes', description: 'Cepillo de dientes' },
      hi: { name: 'टूथब्रश', description: 'टूथब्रश' },
    },
  },
  {
    kind: 'object',
    wealthValue: 7,
    category: 'Personal Care',
    translations: {
      en: { name: 'Deodorant', description: 'Deodorant' },
      es: { name: 'Desodorante', description: 'Desodorante' },
      hi: { name: 'डियोडरेंट', description: 'डियोडरेंट' },
    },
  },
  {
    kind: 'object',
    wealthValue: 8,
    category: 'Personal Care',
    translations: {
      en: { name: 'Lotion/Moisturizer', description: 'Skin lotion or moisturizer' },
      es: { name: 'Loción/Crema Hidratante', description: 'Loción o crema hidratante para la piel' },
      hi: { name: 'लोशन/मॉइस्चराइज़र', description: 'त्वचा लोशन या मॉइस्चराइज़र' },
    },
  },
  {
    kind: 'object',
    wealthValue: 8,
    category: 'Personal Care',
    translations: {
      en: { name: 'Sunscreen', description: 'Sunscreen/sunblock' },
      es: { name: 'Protector Solar', description: 'Protector solar' },
      hi: { name: 'सनस्क्रीन', description: 'सनस्क्रीन' },
    },
  },
  {
    kind: 'object',
    wealthValue: 5,
    category: 'Personal Care',
    translations: {
      en: { name: 'Razor', description: 'Razor for shaving' },
      es: { name: 'Navaja de Afeitar', description: 'Navaja para afeitar' },
      hi: { name: 'रेज़र', description: 'शेविंग के लिए रेज़र' },
    },
  },
  {
    kind: 'object',
    wealthValue: 6,
    category: 'Personal Care',
    translations: {
      en: { name: 'Shaving Cream', description: 'Shaving cream or gel' },
      es: { name: 'Crema de Afeitar', description: 'Crema o gel de afeitar' },
      hi: { name: 'शेविंग क्रीम', description: 'शेविंग क्रीम या जेल' },
    },
  },
  {
    kind: 'object',
    wealthValue: 7,
    category: 'Personal Care',
    translations: {
      en: { name: 'Feminine Hygiene Products', description: 'Pads, tampons, etc.' },
      es: { name: 'Productos de Higiene Femenina', description: 'Toallas, tampones, etc.' },
      hi: { name: 'स्त्री स्वच्छता उत्पाद', description: 'पैड, टैम्पोन, आदि' },
    },
  },
  {
    kind: 'object',
    wealthValue: 12,
    category: 'Personal Care',
    translations: {
      en: { name: 'First Aid Kit', description: 'Basic medical supplies' },
      es: { name: 'Botiquín de Primeros Auxilios', description: 'Suministros médicos básicos' },
      hi: { name: 'प्राथमिक चिकित्सा किट', description: 'बुनियादी चिकित्सा आपूर्ति' },
    },
  },
  {
    kind: 'object',
    wealthValue: 5,
    category: 'Personal Care',
    translations: {
      en: { name: 'Bandages', description: 'Adhesive bandages' },
      es: { name: 'Vendas', description: 'Vendas adhesivas' },
      hi: { name: 'पट्टियाँ', description: 'चिपकने वाली पट्टियाँ' },
    },
  },
  {
    kind: 'object',
    wealthValue: 6,
    category: 'Personal Care',
    translations: {
      en: { name: 'Pain Relievers', description: 'Over-the-counter pain medication' },
      es: { name: 'Analgésicos', description: 'Medicamento para el dolor sin receta' },
      hi: { name: 'दर्द निवारक', description: 'बिना पर्चे के दर्द की दवा' },
    },
  },
];
