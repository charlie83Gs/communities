import { DefaultItemTemplate } from './types';

/**
 * Service Items
 * All service offerings (skills, time, labor)
 */

export const SERVICES: DefaultItemTemplate[] = [
  // ============= HOME REPAIR & MAINTENANCE =============
  {
    kind: 'service',
    wealthValue: 20,
    category: 'Home Repair & Maintenance',
    translations: {
      en: { name: 'Home Repair', description: 'General home repair and maintenance services' },
      es: { name: 'Reparación del Hogar', description: 'Servicios de reparación y mantenimiento del hogar' },
      hi: { name: 'घर की मरम्मत', description: 'सामान्य घर की मरम्मत और रखरखाव सेवाएँ' },
    },
  },
  {
    kind: 'service',
    wealthValue: 25,
    category: 'Home Repair & Maintenance',
    translations: {
      en: { name: 'Plumbing', description: 'Plumbing repairs and installations' },
      es: { name: 'Fontanería', description: 'Reparaciones e instalaciones de fontanería' },
      hi: { name: 'प्लंबिंग', description: 'प्लंबिंग मरम्मत और स्थापना' },
    },
  },
  {
    kind: 'service',
    wealthValue: 25,
    category: 'Home Repair & Maintenance',
    translations: {
      en: { name: 'Electrical Work', description: 'Electrical repairs and installations' },
      es: { name: 'Trabajo Eléctrico', description: 'Reparaciones e instalaciones eléctricas' },
      hi: { name: 'विद्युत कार्य', description: 'विद्युत मरम्मत और स्थापना' },
    },
  },
  {
    kind: 'service',
    wealthValue: 22,
    category: 'Home Repair & Maintenance',
    translations: {
      en: { name: 'Carpentry', description: 'Wood working and carpentry services' },
      es: { name: 'Carpintería', description: 'Servicios de carpintería y trabajo en madera' },
      hi: { name: 'बढ़ईगीरी', description: 'लकड़ी का काम और बढ़ईगीरी सेवाएँ' },
    },
  },
  {
    kind: 'service',
    wealthValue: 20,
    category: 'Home Repair & Maintenance',
    translations: {
      en: { name: 'Painting', description: 'Interior and exterior painting' },
      es: { name: 'Pintura', description: 'Pintura interior y exterior' },
      hi: { name: 'पेंटिंग', description: 'आंतरिक और बाहरी पेंटिंग' },
    },
  },
  {
    kind: 'service',
    wealthValue: 18,
    category: 'Home Repair & Maintenance',
    translations: {
      en: { name: 'Roofing', description: 'Roof repair and maintenance' },
      es: { name: 'Techado', description: 'Reparación y mantenimiento de techos' },
      hi: { name: 'छत का काम', description: 'छत की मरम्मत और रखरखाव' },
    },
  },
  {
    kind: 'service',
    wealthValue: 18,
    category: 'Home Repair & Maintenance',
    translations: {
      en: { name: 'Drywall/Plastering', description: 'Drywall installation and repair' },
      es: { name: 'Pladur/Enyesado', description: 'Instalación y reparación de pladur' },
      hi: { name: 'ड्राईवॉल/प्लास्टरिंग', description: 'ड्राईवॉल स्थापना और मरम्मत' },
    },
  },
  {
    kind: 'service',
    wealthValue: 20,
    category: 'Home Repair & Maintenance',
    translations: {
      en: { name: 'HVAC Repair', description: 'Heating and cooling system repair' },
      es: { name: 'Reparación de Climatización', description: 'Reparación de sistemas de calefacción y refrigeración' },
      hi: { name: 'एचवीएसी मरम्मत', description: 'हीटिंग और कूलिंग सिस्टम मरम्मत' },
    },
  },
  {
    kind: 'service',
    wealthValue: 15,
    category: 'Home Repair & Maintenance',
    translations: {
      en: { name: 'Gardening/Landscaping', description: 'Gardening, landscaping, and yard work' },
      es: { name: 'Jardinería/Paisajismo', description: 'Jardinería, paisajismo y trabajo de patio' },
      hi: { name: 'बागवानी/भूनिर्माण', description: 'बागवानी, भूनिर्माण और यार्ड का काम' },
    },
  },
  {
    kind: 'service',
    wealthValue: 15,
    category: 'Home Repair & Maintenance',
    translations: {
      en: { name: 'Lawn Care', description: 'Lawn mowing and maintenance' },
      es: { name: 'Cuidado del Césped', description: 'Corte y mantenimiento del césped' },
      hi: { name: 'लॉन देखभाल', description: 'लॉन कटाई और रखरखाव' },
    },
  },
  {
    kind: 'service',
    wealthValue: 20,
    category: 'Home Repair & Maintenance',
    translations: {
      en: { name: 'Tree Trimming', description: 'Tree trimming and removal' },
      es: { name: 'Poda de Árboles', description: 'Poda y remoción de árboles' },
      hi: { name: 'पेड़ की कटाई', description: 'पेड़ की कटाई और हटाना' },
    },
  },
  {
    kind: 'service',
    wealthValue: 18,
    category: 'Home Repair & Maintenance',
    translations: {
      en: { name: 'Appliance Repair', description: 'Home appliance repair' },
      es: { name: 'Reparación de Electrodomésticos', description: 'Reparación de electrodomésticos' },
      hi: { name: 'उपकरण मरम्मत', description: 'घरेलू उपकरण मरम्मत' },
    },
  },

  // ============= CARE SERVICES =============
  {
    kind: 'service',
    wealthValue: 18,
    category: 'Care Services',
    translations: {
      en: { name: 'Childcare', description: 'Babysitting and child supervision' },
      es: { name: 'Cuidado de Niños', description: 'Cuidado de niños y supervisión' },
      hi: { name: 'बाल देखभाल', description: 'शिशु देखभाल और पर्यवेक्षण' },
    },
  },
  {
    kind: 'service',
    wealthValue: 20,
    category: 'Care Services',
    translations: {
      en: { name: 'Eldercare', description: 'Elder care and companionship' },
      es: { name: 'Cuidado de Ancianos', description: 'Cuidado de ancianos y compañía' },
      hi: { name: 'बुजुर्ग देखभाल', description: 'बुजुर्ग देखभाल और साहचर्य' },
    },
  },
  {
    kind: 'service',
    wealthValue: 12,
    category: 'Care Services',
    translations: {
      en: { name: 'Pet Care', description: 'Pet sitting, walking, and care' },
      es: { name: 'Cuidado de Mascotas', description: 'Cuidado de mascotas, paseos y atención' },
      hi: { name: 'पालतू जानवर की देखभाल', description: 'पालतू जानवर की देखभाल, सैर और देखभाल' },
    },
  },
  {
    kind: 'service',
    wealthValue: 15,
    category: 'Care Services',
    translations: {
      en: { name: 'Pet Grooming', description: 'Pet grooming and bathing' },
      es: { name: 'Peluquería de Mascotas', description: 'Peluquería y baño de mascotas' },
      hi: { name: 'पालतू जानवर की सजावट', description: 'पालतू जानवर की सजावट और स्नान' },
    },
  },
  {
    kind: 'service',
    wealthValue: 18,
    category: 'Care Services',
    translations: {
      en: { name: 'Special Needs Care', description: 'Care for people with special needs' },
      es: { name: 'Cuidado de Necesidades Especiales', description: 'Cuidado para personas con necesidades especiales' },
      hi: { name: 'विशेष आवश्यकता देखभाल', description: 'विशेष आवश्यकताओं वाले लोगों की देखभाल' },
    },
  },

  // ============= EDUCATIONAL SERVICES =============
  {
    kind: 'service',
    wealthValue: 25,
    category: 'Educational',
    translations: {
      en: { name: 'Tutoring (General)', description: 'General educational tutoring and teaching' },
      es: { name: 'Tutoría (General)', description: 'Tutoría y enseñanza educativa general' },
      hi: { name: 'ट्यूशन (सामान्य)', description: 'सामान्य शैक्षिक ट्यूशन और शिक्षण' },
    },
  },
  {
    kind: 'service',
    wealthValue: 28,
    category: 'Educational',
    translations: {
      en: { name: 'Math Tutoring', description: 'Mathematics tutoring' },
      es: { name: 'Tutoría de Matemáticas', description: 'Tutoría de matemáticas' },
      hi: { name: 'गणित ट्यूशन', description: 'गणित ट्यूशन' },
    },
  },
  {
    kind: 'service',
    wealthValue: 28,
    category: 'Educational',
    translations: {
      en: { name: 'Science Tutoring', description: 'Science subject tutoring' },
      es: { name: 'Tutoría de Ciencias', description: 'Tutoría de ciencias' },
      hi: { name: 'विज्ञान ट्यूशन', description: 'विज्ञान विषय ट्यूशन' },
    },
  },
  {
    kind: 'service',
    wealthValue: 30,
    category: 'Educational',
    translations: {
      en: { name: 'Language Instruction', description: 'Language learning and practice' },
      es: { name: 'Instrucción de Idiomas', description: 'Aprendizaje y práctica de idiomas' },
      hi: { name: 'भाषा शिक्षण', description: 'भाषा सीखना और अभ्यास' },
    },
  },
  {
    kind: 'service',
    wealthValue: 28,
    category: 'Educational',
    translations: {
      en: { name: 'Music Lessons', description: 'Musical instrument or vocal instruction' },
      es: { name: 'Clases de Música', description: 'Instrucción de instrumento musical o vocal' },
      hi: { name: 'संगीत पाठ', description: 'संगीत वाद्ययंत्र या गायन शिक्षण' },
    },
  },
  {
    kind: 'service',
    wealthValue: 35,
    category: 'Educational',
    translations: {
      en: { name: 'Workshop/Class', description: 'Skill-building workshops and classes' },
      es: { name: 'Taller/Clase', description: 'Talleres y clases de desarrollo de habilidades' },
      hi: { name: 'कार्यशाला/कक्षा', description: 'कौशल निर्माण कार्यशालाएँ और कक्षाएँ' },
    },
  },
  {
    kind: 'service',
    wealthValue: 30,
    category: 'Educational',
    translations: {
      en: { name: 'Test Prep', description: 'Standardized test preparation' },
      es: { name: 'Preparación de Exámenes', description: 'Preparación de exámenes estandarizados' },
      hi: { name: 'परीक्षा तैयारी', description: 'मानकीकृत परीक्षा तैयारी' },
    },
  },

  // ============= TRANSPORTATION =============
  {
    kind: 'service',
    wealthValue: 8,
    category: 'Transportation',
    translations: {
      en: { name: 'Transportation/Ride', description: 'Transportation and ride sharing' },
      es: { name: 'Transporte/Viaje', description: 'Transporte y uso compartido de viajes' },
      hi: { name: 'परिवहन/सवारी', description: 'परिवहन और सवारी साझा करना' },
    },
  },
  {
    kind: 'service',
    wealthValue: 18,
    category: 'Transportation',
    translations: {
      en: { name: 'Moving Help', description: 'Moving and heavy lifting assistance' },
      es: { name: 'Ayuda con Mudanza', description: 'Asistencia con mudanzas y levantamiento pesado' },
      hi: { name: 'सामान ले जाने में मदद', description: 'स्थानांतरण और भारी सामान उठाने में सहायता' },
    },
  },
  {
    kind: 'service',
    wealthValue: 15,
    category: 'Transportation',
    translations: {
      en: { name: 'Delivery Service', description: 'Package and item delivery' },
      es: { name: 'Servicio de Entrega', description: 'Entrega de paquetes y artículos' },
      hi: { name: 'डिलीवरी सेवा', description: 'पैकेज और वस्तु वितरण' },
    },
  },
  {
    kind: 'service',
    wealthValue: 12,
    category: 'Transportation',
    translations: {
      en: { name: 'Airport Transportation', description: 'Airport pickup and drop-off' },
      es: { name: 'Transporte al Aeropuerto', description: 'Recogida y entrega en el aeropuerto' },
      hi: { name: 'हवाई अड्डा परिवहन', description: 'हवाई अड्डा पिकअप और ड्रॉप-ऑफ' },
    },
  },

  // ============= PROFESSIONAL SERVICES =============
  {
    kind: 'service',
    wealthValue: 30,
    category: 'Professional Services',
    translations: {
      en: { name: 'Tech Support', description: 'Computer and technology assistance' },
      es: { name: 'Soporte Técnico', description: 'Asistencia informática y tecnológica' },
      hi: { name: 'तकनीकी सहायता', description: 'कंप्यूटर और प्रौद्योगिकी सहायता' },
    },
  },
  {
    kind: 'service',
    wealthValue: 35,
    category: 'Professional Services',
    translations: {
      en: { name: 'Computer Repair', description: 'Computer hardware and software repair' },
      es: { name: 'Reparación de Computadoras', description: 'Reparación de hardware y software de computadoras' },
      hi: { name: 'कंप्यूटर मरम्मत', description: 'कंप्यूटर हार्डवेयर और सॉफ्टवेयर मरम्मत' },
    },
  },
  {
    kind: 'service',
    wealthValue: 32,
    category: 'Professional Services',
    translations: {
      en: { name: 'Web Development', description: 'Website design and development' },
      es: { name: 'Desarrollo Web', description: 'Diseño y desarrollo de sitios web' },
      hi: { name: 'वेब विकास', description: 'वेबसाइट डिज़ाइन और विकास' },
    },
  },
  {
    kind: 'service',
    wealthValue: 40,
    category: 'Professional Services',
    translations: {
      en: { name: 'Legal Advice', description: 'Legal consultation and advice' },
      es: { name: 'Asesoramiento Legal', description: 'Consultoría y asesoramiento legal' },
      hi: { name: 'कानूनी सलाह', description: 'कानूनी परामर्श और सलाह' },
    },
  },
  {
    kind: 'service',
    wealthValue: 35,
    category: 'Professional Services',
    translations: {
      en: { name: 'Accounting/Bookkeeping', description: 'Financial and accounting services' },
      es: { name: 'Contabilidad/Teneduría', description: 'Servicios financieros y de contabilidad' },
      hi: { name: 'लेखा/बहीखाता', description: 'वित्तीय और लेखा सेवाएँ' },
    },
  },
  {
    kind: 'service',
    wealthValue: 38,
    category: 'Professional Services',
    translations: {
      en: { name: 'Tax Preparation', description: 'Income tax preparation services' },
      es: { name: 'Preparación de Impuestos', description: 'Servicios de preparación de impuestos' },
      hi: { name: 'कर तैयारी', description: 'आयकर तैयारी सेवाएँ' },
    },
  },
  {
    kind: 'service',
    wealthValue: 45,
    category: 'Professional Services',
    translations: {
      en: { name: 'Business Consulting', description: 'Business strategy and consulting' },
      es: { name: 'Consultoría Empresarial', description: 'Estrategia empresarial y consultoría' },
      hi: { name: 'व्यवसाय परामर्श', description: 'व्यावसायिक रणनीति और परामर्श' },
    },
  },
  {
    kind: 'service',
    wealthValue: 35,
    category: 'Professional Services',
    translations: {
      en: { name: 'Marketing/Advertising', description: 'Marketing and advertising services' },
      es: { name: 'Marketing/Publicidad', description: 'Servicios de marketing y publicidad' },
      hi: { name: 'मार्केटिंग/विज्ञापन', description: 'मार्केटिंग और विज्ञापन सेवाएँ' },
    },
  },
  {
    kind: 'service',
    wealthValue: 32,
    category: 'Professional Services',
    translations: {
      en: { name: 'Real Estate Advice', description: 'Real estate consultation' },
      es: { name: 'Asesoramiento Inmobiliario', description: 'Consultoría inmobiliaria' },
      hi: { name: 'रियल एस्टेट सलाह', description: 'रियल एस्टेट परामर्श' },
    },
  },

  // ============= CREATIVE SERVICES =============
  {
    kind: 'service',
    wealthValue: 30,
    category: 'Creative Services',
    translations: {
      en: { name: 'Graphic Design', description: 'Design and visual creation services' },
      es: { name: 'Diseño Gráfico', description: 'Servicios de diseño y creación visual' },
      hi: { name: 'ग्राफ़िक डिज़ाइन', description: 'डिज़ाइन और दृश्य निर्माण सेवाएँ' },
    },
  },
  {
    kind: 'service',
    wealthValue: 32,
    category: 'Creative Services',
    translations: {
      en: { name: 'Logo Design', description: 'Logo and brand identity design' },
      es: { name: 'Diseño de Logo', description: 'Diseño de logo e identidad de marca' },
      hi: { name: 'लोगो डिज़ाइन', description: 'लोगो और ब्रांड पहचान डिज़ाइन' },
    },
  },
  {
    kind: 'service',
    wealthValue: 40,
    category: 'Creative Services',
    translations: {
      en: { name: 'Photography', description: 'Photography and photo editing' },
      es: { name: 'Fotografía', description: 'Fotografía y edición de fotos' },
      hi: { name: 'फ़ोटोग्राफ़ी', description: 'फ़ोटोग्राफ़ी और फ़ोटो संपादन' },
    },
  },
  {
    kind: 'service',
    wealthValue: 45,
    category: 'Creative Services',
    translations: {
      en: { name: 'Event Photography', description: 'Event and wedding photography' },
      es: { name: 'Fotografía de Eventos', description: 'Fotografía de eventos y bodas' },
      hi: { name: 'इवेंट फ़ोटोग्राफ़ी', description: 'इवेंट और शादी की फ़ोटोग्राफ़ी' },
    },
  },
  {
    kind: 'service',
    wealthValue: 35,
    category: 'Creative Services',
    translations: {
      en: { name: 'Video Production', description: 'Video recording and editing' },
      es: { name: 'Producción de Video', description: 'Grabación y edición de video' },
      hi: { name: 'वीडियो निर्माण', description: 'वीडियो रिकॉर्डिंग और संपादन' },
    },
  },
  {
    kind: 'service',
    wealthValue: 25,
    category: 'Creative Services',
    translations: {
      en: { name: 'Writing/Editing', description: 'Content writing and editing services' },
      es: { name: 'Redacción/Edición', description: 'Servicios de redacción y edición de contenido' },
      hi: { name: 'लेखन/संपादन', description: 'सामग्री लेखन और संपादन सेवाएँ' },
    },
  },
  {
    kind: 'service',
    wealthValue: 28,
    category: 'Creative Services',
    translations: {
      en: { name: 'Copywriting', description: 'Marketing and advertising copywriting' },
      es: { name: 'Redacción Publicitaria', description: 'Redacción publicitaria y de marketing' },
      hi: { name: 'कॉपीराइटिंग', description: 'मार्केटिंग और विज्ञापन कॉपीराइटिंग' },
    },
  },
  {
    kind: 'service',
    wealthValue: 30,
    category: 'Creative Services',
    translations: {
      en: { name: 'Translation', description: 'Document translation services' },
      es: { name: 'Traducción', description: 'Servicios de traducción de documentos' },
      hi: { name: 'अनुवाद', description: 'दस्तावेज़ अनुवाद सेवाएँ' },
    },
  },
  {
    kind: 'service',
    wealthValue: 30,
    category: 'Creative Services',
    translations: {
      en: { name: 'Art/Craft Instruction', description: 'Arts, crafts, and creative skills teaching' },
      es: { name: 'Instrucción de Arte/Artesanía', description: 'Enseñanza de arte, artesanía y habilidades creativas' },
      hi: { name: 'कला/शिल्प शिक्षण', description: 'कला, शिल्प और रचनात्मक कौशल शिक्षण' },
    },
  },
  {
    kind: 'service',
    wealthValue: 35,
    category: 'Creative Services',
    translations: {
      en: { name: 'Interior Design', description: 'Interior design consultation' },
      es: { name: 'Diseño de Interiores', description: 'Consultoría de diseño de interiores' },
      hi: { name: 'इंटीरियर डिज़ाइन', description: 'इंटीरियर डिज़ाइन परामर्श' },
    },
  },

  // ============= FOOD SERVICES =============
  {
    kind: 'service',
    wealthValue: 10,
    category: 'Food Services',
    translations: {
      en: { name: 'Cooking/Meal Prep', description: 'Meal preparation and cooking services' },
      es: { name: 'Cocina/Preparación de Comidas', description: 'Servicios de preparación y cocina de comidas' },
      hi: { name: 'खाना पकाना/भोजन तैयारी', description: 'भोजन तैयारी और पाक सेवाएँ' },
    },
  },
  {
    kind: 'service',
    wealthValue: 25,
    category: 'Food Services',
    translations: {
      en: { name: 'Catering', description: 'Event catering and food service' },
      es: { name: 'Catering', description: 'Catering y servicio de comida para eventos' },
      hi: { name: 'कैटरिंग', description: 'कार्यक्रम कैटरिंग और भोजन सेवा' },
    },
  },
  {
    kind: 'service',
    wealthValue: 15,
    category: 'Food Services',
    translations: {
      en: { name: 'Baking', description: 'Baking bread, cakes, or pastries' },
      es: { name: 'Panadería', description: 'Hornear pan, pasteles o bollería' },
      hi: { name: 'बेकिंग', description: 'ब्रेड, केक या पेस्ट्री बनाना' },
    },
  },
  {
    kind: 'service',
    wealthValue: 20,
    category: 'Food Services',
    translations: {
      en: { name: 'Cake Decorating', description: 'Custom cake decorating' },
      es: { name: 'Decoración de Pasteles', description: 'Decoración personalizada de pasteles' },
      hi: { name: 'केक सजावट', description: 'कस्टम केक सजावट' },
    },
  },
  {
    kind: 'service',
    wealthValue: 18,
    category: 'Food Services',
    translations: {
      en: { name: 'Personal Chef', description: 'Personal chef services' },
      es: { name: 'Chef Personal', description: 'Servicios de chef personal' },
      hi: { name: 'व्यक्तिगत रसोइया', description: 'व्यक्तिगत रसोइया सेवाएँ' },
    },
  },

  // ============= HEALTH & WELLNESS =============
  {
    kind: 'service',
    wealthValue: 30,
    category: 'Health & Wellness',
    translations: {
      en: { name: 'Massage Therapy', description: 'Therapeutic massage services' },
      es: { name: 'Terapia de Masajes', description: 'Servicios de masaje terapéutico' },
      hi: { name: 'मालिश चिकित्सा', description: 'चिकित्सीय मालिश सेवाएँ' },
    },
  },
  {
    kind: 'service',
    wealthValue: 25,
    category: 'Health & Wellness',
    translations: {
      en: { name: 'Fitness Training', description: 'Personal training and fitness instruction' },
      es: { name: 'Entrenamiento Físico', description: 'Entrenamiento personal e instrucción de fitness' },
      hi: { name: 'फ़िटनेस प्रशिक्षण', description: 'व्यक्तिगत प्रशिक्षण और फ़िटनेस निर्देश' },
    },
  },
  {
    kind: 'service',
    wealthValue: 20,
    category: 'Health & Wellness',
    translations: {
      en: { name: 'Yoga Class', description: 'Yoga instruction' },
      es: { name: 'Clase de Yoga', description: 'Instrucción de yoga' },
      hi: { name: 'योग कक्षा', description: 'योग शिक्षण' },
    },
  },
  {
    kind: 'service',
    wealthValue: 20,
    category: 'Health & Wellness',
    translations: {
      en: { name: 'Meditation Class', description: 'Meditation instruction' },
      es: { name: 'Clase de Meditación', description: 'Instrucción de meditación' },
      hi: { name: 'ध्यान कक्षा', description: 'ध्यान शिक्षण' },
    },
  },
  {
    kind: 'service',
    wealthValue: 28,
    category: 'Health & Wellness',
    translations: {
      en: { name: 'Nutritional Counseling', description: 'Diet and nutrition advice' },
      es: { name: 'Asesoramiento Nutricional', description: 'Asesoramiento de dieta y nutrición' },
      hi: { name: 'पोषण परामर्श', description: 'आहार और पोषण सलाह' },
    },
  },
  {
    kind: 'service',
    wealthValue: 25,
    category: 'Health & Wellness',
    translations: {
      en: { name: 'Life Coaching', description: 'Personal life coaching' },
      es: { name: 'Coaching de Vida', description: 'Coaching de vida personal' },
      hi: { name: 'जीवन कोचिंग', description: 'व्यक्तिगत जीवन कोचिंग' },
    },
  },
  {
    kind: 'service',
    wealthValue: 35,
    category: 'Health & Wellness',
    translations: {
      en: { name: 'Mental Health Counseling', description: 'Mental health support and counseling' },
      es: { name: 'Asesoramiento de Salud Mental', description: 'Apoyo y asesoramiento de salud mental' },
      hi: { name: 'मानसिक स्वास्थ्य परामर्श', description: 'मानसिक स्वास्थ्य सहायता और परामर्श' },
    },
  },
  {
    kind: 'service',
    wealthValue: 30,
    category: 'Health & Wellness',
    translations: {
      en: { name: 'Physical Therapy', description: 'Physical therapy services' },
      es: { name: 'Fisioterapia', description: 'Servicios de fisioterapia' },
      hi: { name: 'भौतिक चिकित्सा', description: 'भौतिक चिकित्सा सेवाएँ' },
    },
  },

  // ============= CLEANING & ORGANIZING =============
  {
    kind: 'service',
    wealthValue: 20,
    category: 'Cleaning & Organizing',
    translations: {
      en: { name: 'House Cleaning', description: 'House and office cleaning' },
      es: { name: 'Limpieza de Casa', description: 'Limpieza de casa y oficina' },
      hi: { name: 'घर की सफ़ाई', description: 'घर और कार्यालय की सफ़ाई' },
    },
  },
  {
    kind: 'service',
    wealthValue: 25,
    category: 'Cleaning & Organizing',
    translations: {
      en: { name: 'Deep Cleaning', description: 'Deep cleaning services' },
      es: { name: 'Limpieza Profunda', description: 'Servicios de limpieza profunda' },
      hi: { name: 'गहरी सफ़ाई', description: 'गहरी सफ़ाई सेवाएँ' },
    },
  },
  {
    kind: 'service',
    wealthValue: 22,
    category: 'Cleaning & Organizing',
    translations: {
      en: { name: 'Organization Service', description: 'Home and office organization' },
      es: { name: 'Servicio de Organización', description: 'Organización de casa y oficina' },
      hi: { name: 'व्यवस्था सेवा', description: 'घर और कार्यालय की व्यवस्था' },
    },
  },
  {
    kind: 'service',
    wealthValue: 25,
    category: 'Cleaning & Organizing',
    translations: {
      en: { name: 'Laundry Service', description: 'Washing, drying, and folding laundry' },
      es: { name: 'Servicio de Lavandería', description: 'Lavado, secado y doblado de ropa' },
      hi: { name: 'कपड़े धोने की सेवा', description: 'कपड़े धोना, सुखाना और तह करना' },
    },
  },
  {
    kind: 'service',
    wealthValue: 20,
    category: 'Cleaning & Organizing',
    translations: {
      en: { name: 'Ironing/Pressing', description: 'Clothes ironing and pressing' },
      es: { name: 'Planchado', description: 'Planchado de ropa' },
      hi: { name: 'इस्त्री', description: 'कपड़े इस्त्री करना' },
    },
  },
  {
    kind: 'service',
    wealthValue: 30,
    category: 'Cleaning & Organizing',
    translations: {
      en: { name: 'Window Cleaning', description: 'Professional window cleaning' },
      es: { name: 'Limpieza de Ventanas', description: 'Limpieza profesional de ventanas' },
      hi: { name: 'खिड़की की सफ़ाई', description: 'पेशेवर खिड़की सफ़ाई' },
    },
  },
  {
    kind: 'service',
    wealthValue: 28,
    category: 'Cleaning & Organizing',
    translations: {
      en: { name: 'Carpet Cleaning', description: 'Professional carpet cleaning' },
      es: { name: 'Limpieza de Alfombras', description: 'Limpieza profesional de alfombras' },
      hi: { name: 'कालीन की सफ़ाई', description: 'पेशेवर कालीन सफ़ाई' },
    },
  },

  // ============= EVENT SERVICES =============
  {
    kind: 'service',
    wealthValue: 35,
    category: 'Event Services',
    translations: {
      en: { name: 'Event Planning', description: 'Event planning and coordination' },
      es: { name: 'Planificación de Eventos', description: 'Planificación y coordinación de eventos' },
      hi: { name: 'इवेंट योजना', description: 'इवेंट योजना और समन्वय' },
    },
  },
  {
    kind: 'service',
    wealthValue: 30,
    category: 'Event Services',
    translations: {
      en: { name: 'DJ Services', description: 'DJ and music services for events' },
      es: { name: 'Servicios de DJ', description: 'Servicios de DJ y música para eventos' },
      hi: { name: 'डीजे सेवाएँ', description: 'इवेंट के लिए डीजे और संगीत सेवाएँ' },
    },
  },
  {
    kind: 'service',
    wealthValue: 30,
    category: 'Event Services',
    translations: {
      en: { name: 'MC/Host Services', description: 'Master of ceremonies/event hosting' },
      es: { name: 'Servicios de MC/Anfitrión', description: 'Maestro de ceremonias/anfitrión de eventos' },
      hi: { name: 'एमसी/होस्ट सेवाएँ', description: 'समारोह के मास्टर/इवेंट होस्टिंग' },
    },
  },
  {
    kind: 'service',
    wealthValue: 25,
    category: 'Event Services',
    translations: {
      en: { name: 'Event Setup/Breakdown', description: 'Event setup and teardown' },
      es: { name: 'Montaje/Desmontaje de Eventos', description: 'Montaje y desmontaje de eventos' },
      hi: { name: 'इवेंट सेटअप/ब्रेकडाउन', description: 'इवेंट सेटअप और तोड़ना' },
    },
  },
];
