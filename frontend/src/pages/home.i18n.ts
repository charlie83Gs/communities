/**
 * Home page i18n dictionary kept close to the page.
 * Usage inside the page:
 *  const [t, { add }] = useI18n();
 *  onMount(() => add(homeDict));
 *  t('home.title')
 */
export const homeDict = {
  en: {
    home: {
      title: 'Welcome to Communities',
      subtitle:
        'Build stronger communities through shared resources, trust networks, and collaborative governance.',
      ctaLogin: 'Get Started - Login',
      ctaRegister: 'Join the Community',
      philosophyTitle: 'Our Core Principles',
      philosophySubtitle:
        'Built on principles that foster genuine community bonds, transparent governance, and trust-based collaboration.',
      philosophy: {
        noMoney: {
          title: 'Gift Economy',
          desc: 'Resources shared as gifts, not exchanges. Build a culture of mutual aid and generosity.',
        },
        communityFirst: {
          title: 'Transparent Governance',
          desc: 'All actions are auditable. Council activities, resource movements, and trust relationships are visible to the community.',
        },
        trust: {
          title: 'Trust Networks',
          desc: 'Reputation earned through community confidence. Trust unlocks access to resources and governance roles.',
        },
        collab: {
          title: 'Resource Stewardship',
          desc: 'Councils manage shared resources with accountability. Usage reports and evidence ensure transparency.',
        },
      },
      featuresTitle: 'Powerful Community Management Tools',
      featuresSubtitle:
        'A complete system for trust-based resource management, collaborative governance, and community planning.',
      features: {
        wealth: {
          title: 'Community Wealth Management',
          desc: 'Wealth products and services with trust-gated access. Direct transfers to councils or instant pool contributions for collective initiatives.',
        },
        trust: {
          title: 'Trust Network & Reputation',
          desc: 'Build trust scores through community confidence. Unlock access to resources, create governance proposals, and participate in decision-making.',
        },
        councils: {
          title: 'Councils & Collaborative Governance',
          desc: 'Specialized councils manage resources transparently. Create initiatives, vote on proposals, and guide community action through democratic processes.',
        },
        planning: {
          title: 'Resource Planning & Needs',
          desc: 'Aggregate community needs for strategic planning. Create pools for collective projects and coordinate resource allocation efficiently.',
        },
      },
      capabilitiesTitle: 'Key System Capabilities',
      capabilities: {
        trustBased: {
          title: 'Trust-Based Permissions',
          desc: 'Flexible permission system combining trust scores, roles, and council membership. Protect valuable resources with trust requirements.',
        },
        tracking: {
          title: 'Transparent Resource Tracking',
          desc: 'Auditable transaction history for all resource movements. Track wealth fulfillments, dispute resolutions, and contribution metrics.',
        },
        accountability: {
          title: 'Council Accountability',
          desc: 'Councils provide usage reports with photo evidence. Community members can review how resources are utilized and hold councils accountable.',
        },
        analytics: {
          title: 'Community Health Analytics',
          desc: 'Comprehensive dashboard showing member activity, wealth generation, trust networks, council performance, and community vitality metrics.',
        },
      },
      footer: {
        title: 'Ready to Build Trust-Based Communities?',
        subtitle: 'Create your account today and experience collaborative resource management.',
        signup: 'Sign Up Free',
        already: 'Already a Member? Login',
      },
    },
  },
  es: {
    home: {
      title: 'Bienvenido a Comunidades',
      subtitle:
        'Construye comunidades más fuertes a través de recursos compartidos, redes de confianza y gobernanza colaborativa.',
      ctaLogin: 'Comienza - Iniciar sesión',
      ctaRegister: 'Únete a la comunidad',
      philosophyTitle: 'Nuestros Principios Fundamentales',
      philosophySubtitle:
        'Basada en principios que fomentan lazos genuinos, gobernanza transparente y colaboración de confianza.',
      philosophy: {
        noMoney: {
          title: 'Economía del Regalo',
          desc: 'Recursos compartidos como regalos, no intercambios. Construye una cultura de ayuda mutua y generosidad.',
        },
        communityFirst: {
          title: 'Gobernanza Transparente',
          desc: 'Todas las acciones son auditables. Actividades de consejos, movimientos de recursos y relaciones de confianza son visibles para la comunidad.',
        },
        trust: {
          title: 'Redes de Confianza',
          desc: 'Reputación ganada mediante confianza comunitaria. La confianza desbloquea acceso a recursos y roles de gobernanza.',
        },
        collab: {
          title: 'Administración de Recursos',
          desc: 'Los consejos gestionan recursos compartidos con responsabilidad. Informes de uso y evidencia aseguran transparencia.',
        },
      },
      featuresTitle: 'Herramientas Poderosas de Gestión Comunitaria',
      featuresSubtitle:
        'Un sistema completo para gestión de recursos basada en confianza, gobernanza colaborativa y planificación comunitaria.',
      features: {
        wealth: {
          title: 'Gestión de Riqueza Comunitaria',
          desc: 'Comparte productos y servicios con acceso controlado por confianza. Transferencias directas a consejos o contribuciones instantáneas a fondos para iniciativas colectivas.',
        },
        trust: {
          title: 'Red de Confianza y Reputación',
          desc: 'Construye puntuaciones de confianza mediante confianza comunitaria. Desbloquea acceso a recursos, crea propuestas de gobernanza y participa en toma de decisiones.',
        },
        councils: {
          title: 'Consejos y Gobernanza Colaborativa',
          desc: 'Consejos especializados gestionan recursos de forma transparente. Crea iniciativas, vota propuestas y guía la acción comunitaria mediante procesos democráticos.',
        },
        planning: {
          title: 'Planificación de Recursos y Necesidades',
          desc: 'Agrega necesidades comunitarias para planificación estratégica. Crea fondos para proyectos colectivos y coordina asignación de recursos eficientemente.',
        },
      },
      capabilitiesTitle: 'Capacidades Clave del Sistema',
      capabilities: {
        trustBased: {
          title: 'Permisos Basados en Confianza',
          desc: 'Sistema flexible de permisos que combina puntuaciones de confianza, roles y membresía de consejos. Protege recursos valiosos con requisitos de confianza.',
        },
        tracking: {
          title: 'Seguimiento Transparente de Recursos',
          desc: 'Historial auditable de transacciones para todos los movimientos de recursos. Rastrea cumplimientos de riqueza, resoluciones de disputas y métricas de contribución.',
        },
        accountability: {
          title: 'Responsabilidad de Consejos',
          desc: 'Los consejos proporcionan informes de uso con evidencia fotográfica. Los miembros de la comunidad pueden revisar cómo se utilizan los recursos y responsabilizar a los consejos.',
        },
        analytics: {
          title: 'Análisis de Salud Comunitaria',
          desc: 'Panel completo mostrando actividad de miembros, generación de riqueza, redes de confianza, rendimiento de consejos y métricas de vitalidad comunitaria.',
        },
      },
      footer: {
        title: '¿Listo para construir comunidades basadas en confianza?',
        subtitle: 'Crea tu cuenta hoy y experimenta la gestión colaborativa de recursos.',
        signup: 'Regístrate Gratis',
        already: '¿Ya eres miembro? Inicia sesión',
      },
    },
  },
  hi: {
    home: {
      title: 'समुदाय में आपका स्वागत है',
      subtitle:
        'साझा संसाधनों, भरोसे के नेटवर्क और सहयोगी शासन के माध्यम से मजबूत समुदाय बनाएं।',
      ctaLogin: 'शुरू करें - लॉगिन',
      ctaRegister: 'समुदाय से जुड़ें',
      philosophyTitle: 'हमारे मूल सिद्धांत',
      philosophySubtitle:
        'ऐसे सिद्धांतों पर निर्मित जो वास्तविक सामुदायिक बंधन, पारदर्शी शासन और भरोसेमंद सहयोग को बढ़ावा देते हैं।',
      philosophy: {
        noMoney: {
          title: 'उपहार अर्थव्यवस्था',
          desc: 'संसाधन उपहार के रूप में साझा करें, विनिमय नहीं। पारस्परिक सहायता और उदारता की संस्कृति बनाएं।',
        },
        communityFirst: {
          title: 'पारदर्शी शासन',
          desc: 'सभी कार्य ऑडिट योग्य हैं। परिषद गतिविधियां, संसाधन आंदोलन और भरोसे के संबंध समुदाय के लिए दृश्यमान हैं।',
        },
        trust: {
          title: 'भरोसे के नेटवर्क',
          desc: 'सामुदायिक विश्वास से अर्जित प्रतिष्ठा। भरोसा संसाधनों और शासन भूमिकाओं तक पहुंच खोलता है।',
        },
        collab: {
          title: 'संसाधन प्रबंधन',
          desc: 'परिषदें जवाबदेही के साथ साझा संसाधनों का प्रबंधन करती हैं। उपयोग रिपोर्ट और साक्ष्य पारदर्शिता सुनिश्चित करते हैं।',
        },
      },
      featuresTitle: 'शक्तिशाली सामुदायिक प्रबंधन उपकरण',
      featuresSubtitle:
        'भरोसा-आधारित संसाधन प्रबंधन, सहयोगी शासन और सामुदायिक योजना के लिए एक पूर्ण प्रणाली।',
      features: {
        wealth: {
          title: 'सामुदायिक संपत्ति प्रबंधन',
          desc: 'भरोसा-नियंत्रित पहुंच के साथ उत्पाद और सेवाएं साझा करें। परिषदों को सीधे स्थानांतरण या सामूहिक पहलों के लिए तत्काल पूल योगदान।',
        },
        trust: {
          title: 'भरोसे का नेटवर्क और प्रतिष्ठा',
          desc: 'सामुदायिक विश्वास के माध्यम से भरोसा स्कोर बनाएं। संसाधनों तक पहुंच प्राप्त करें, शासन प्रस्ताव बनाएं और निर्णय लेने में भाग लें।',
        },
        councils: {
          title: 'परिषद और सहयोगी शासन',
          desc: 'विशेष परिषदें पारदर्शी रूप से संसाधनों का प्रबंधन करती हैं। पहल बनाएं, प्रस्तावों पर मतदान करें और लोकतांत्रिक प्रक्रियाओं के माध्यम से सामुदायिक कार्रवाई का मार्गदर्शन करें।',
        },
        planning: {
          title: 'संसाधन योजना और आवश्यकताएं',
          desc: 'रणनीतिक योजना के लिए सामुदायिक आवश्यकताओं को एकत्रित करें। सामूहिक परियोजनाओं के लिए पूल बनाएं और कुशलता से संसाधन आवंटन समन्वयित करें।',
        },
      },
      capabilitiesTitle: 'प्रमुख प्रणाली क्षमताएं',
      capabilities: {
        trustBased: {
          title: 'भरोसा-आधारित अनुमतियां',
          desc: 'लचीली अनुमति प्रणाली जो भरोसा स्कोर, भूमिकाओं और परिषद सदस्यता को जोड़ती है। भरोसा आवश्यकताओं के साथ मूल्यवान संसाधनों की रक्षा करें।',
        },
        tracking: {
          title: 'पारदर्शी संसाधन ट्रैकिंग',
          desc: 'सभी संसाधन आंदोलनों के लिए ऑडिट योग्य लेन-देन इतिहास। संपत्ति पूर्ति, विवाद समाधान और योगदान मेट्रिक्स को ट्रैक करें।',
        },
        accountability: {
          title: 'परिषद जवाबदेही',
          desc: 'परिषदें फोटो साक्ष्य के साथ उपयोग रिपोर्ट प्रदान करती हैं। समुदाय के सदस्य समीक्षा कर सकते हैं कि संसाधनों का उपयोग कैसे किया जाता है और परिषदों को जवाबदेह ठहरा सकते हैं।',
        },
        analytics: {
          title: 'सामुदायिक स्वास्थ्य विश्लेषण',
          desc: 'सदस्य गतिविधि, संपत्ति उत्पादन, भरोसे के नेटवर्क, परिषद प्रदर्शन और सामुदायिक जीवंतता मेट्रिक्स दिखाने वाला व्यापक डैशबोर्ड।',
        },
      },
      footer: {
        title: 'भरोसा-आधारित समुदाय बनाने के लिए तैयार?',
        subtitle: 'आज ही अपना खाता बनाएं और सहयोगी संसाधन प्रबंधन का अनुभव करें।',
        signup: 'फ्री साइन अप',
        already: 'पहले से सदस्य हैं? लॉगिन',
      },
    },
  },
} as const;

export type HomeDict = typeof homeDict['en']['home'];
