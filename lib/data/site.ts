import type { SiteInfo } from "./types";

/**
 * Datos generales del sitio.
 *
 * PENDIENTE DE CONFIRMAR CON EL CLIENTE: las direcciones, el teléfono y el
 * correo son los que muestra el sitio actual y parecen datos de relleno
 * (teléfono 1234 5678, correo con dominio personal). La URL es un marcador de
 * posición hasta que se defina el dominio nuevo, y las redes sociales apuntan
 * a "#" hasta recibir los perfiles reales.
 */
export const site: SiteInfo = {
  name: "ElectronicShop",
  tagline: "Lo que tu práctica necesita, hoy mismo.",
  description:
    "Tienda en línea de componentes electrónicos, placas de desarrollo, sensores y herramientas para estudiantes de ingeniería, con entrega en campus en menos de 24 horas y precios pensados para la economía estudiantil.",
  url: "https://electronicshop.mx",
  email: "contacto@emilianogallegosrojas.mx",
  phone: "+52 55 1234 5678",
  addresses: ["Avenida Universidad 210, Oficina 5B", "Paseo de la Ciencia 98, Edificio C"],
  hours: "Lunes a viernes, 9:00–18:00",
  social: {
    instagram: "#",
    facebook: "#",
    x: "#",
  },
  trust: [
    {
      label: "Entrega",
      value: "En campus en menos de 24 h",
      icon: "truck",
      stat: { n: 24, unit: "h" },
      detail: "Pides en línea y lo recoges en el punto de entrega del plantel en menos de un día.",
    },
    {
      label: "Garantía",
      value: "6 meses en todo el catálogo",
      icon: "shield-check",
      stat: { n: 6, unit: "meses" },
      detail: "Cubre todo el catálogo. Si un componente falla, lo revisamos y lo reemplazamos.",
    },
    {
      label: "Devoluciones",
      value: "7 días sin preguntas",
      icon: "rotate-ccw",
      stat: { n: 7, unit: "días" },
      detail: "Si no era lo que necesitabas, lo cambias o lo devuelves sin dar explicaciones.",
    },
    {
      label: "Pago",
      value: "Tarjeta, PayPal o efectivo",
      icon: "credit-card",
      stat: { n: 3, unit: "formas de pago" },
      detail: "Tarjeta, PayPal o efectivo al recoger. Sin mínimos de compra.",
    },
  ],
  mission:
    "Suministrar soluciones tecnológicas inmediatas a la comunidad estudiantil de nuestro plantel a través de una plataforma e-commerce accesible y eficiente, especializada en la distribución de componentes electrónicos, herramientas de hardware y consumibles para la materia de circuitos y diseño de sistemas. Nos comprometemos a mitigar el impacto de las contingencias técnicas en los laboratorios —como la pérdida o daño de materiales críticos en horas de evaluación—, optimizando el tiempo de desarrollo de los alumnos mediante un inventario local constante, precios competitivos orientados a la economía estudiantil y un canal de distribución ágil dentro de las instalaciones del campus.",
  vision:
    "Consolidarse como la plataforma e-commerce y el ecosistema de distribución logística de referencia dentro de nuestra institución educativa, expandiendo nuestro catálogo de componentes para cubrir las necesidades de todas las ramas de la ingeniería y sistemas. Aspiramos a mediano plazo a integrar herramientas de asistencia basadas en tecnologías digitales y flujos automatizados de facturación y entrega, transformando la adquisición de material didáctico en una experiencia inmediata. Con esto, buscamos impulsar activamente el rendimiento académico, reducir la deserción en prácticas de laboratorio y fomentar una cultura de innovación e investigación aplicada entre los futuros profesionales tecnológicos del plantel.",
  values: [
    {
      title: "Respuesta inmediata",
      text: "Entendemos la urgencia de una entrega. Si algo hace corto circuito, nuestro objetivo es que tengas el reemplazo en tus manos lo más rápido posible.",
      icon: "zap",
    },
    {
      title: "De estudiantes para estudiantes",
      text: "Hablamos el mismo idioma. Conocemos las materias, los profesores y exactamente qué materiales te van a pedir en el laboratorio.",
      icon: "graduation-cap",
    },
    {
      title: "Accesibilidad y comercio justo",
      text: "Sabemos cómo es la cartera del estudiante. Mantenemos precios justos para que armar tu proyecto no signifique quedarte sin dinero para la semana.",
      icon: "wallet",
    },
    {
      title: "Cultura de innovación",
      text: "Promovemos el aprendizaje práctico. Más que vender cables y chips, queremos facilitar las herramientas para que los futuros ingenieros construyan sus ideas.",
      icon: "lightbulb",
    },
    {
      title: "Calidad a prueba de fallos",
      text: "No vendemos componentes de desecho. Te entregamos piezas confiables para que, si tu circuito no funciona, estés seguro de que fue por el código o el diagrama, no por el material.",
      icon: "badge-check",
    },
  ],
};
