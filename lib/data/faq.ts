import type { FaqItem } from "./types";

/**
 * Preguntas frecuentes. Fusiona y deduplica las FAQ que el sitio actual repite
 * en Inicio, Precios y Preguntas frecuentes, conservando los datos concretos:
 * entrega en campus en menos de 24 h, envío express fuera del campus, pago con
 * tarjeta, PayPal, transferencia y efectivo, devoluciones en 7 días, garantía
 * mínima de 6 meses y soporte técnico por estudiantes.
 */
export const faq: FaqItem[] = [
  {
    id: "que-productos",
    group: "productos",
    question: "¿Qué tipos de productos ofrecen?",
    answer:
      "Componentes electrónicos, placas de desarrollo como Arduino y ESP32, sensores, módulos, herramientas de medición y kits de aprendizaje, seleccionados para las prácticas de circuitos y electrónica de la universidad. Todo el catálogo se mantiene en inventario local para que lo tengas el mismo día.",
  },
  {
    id: "calidad",
    group: "productos",
    question: "¿Cómo garantizan la calidad de los productos?",
    answer:
      "Trabajamos con proveedores certificados y revisamos cada lote antes de ponerlo a la venta. No vendemos componentes de desecho: si tu circuito no funciona, puedes estar seguro de que fue por el código o el diagrama, no por el material.",
  },
  {
    id: "soporte-tecnico",
    group: "productos",
    question: "¿Ofrecen soporte técnico para los productos adquiridos?",
    answer:
      "Sí. El equipo está formado por estudiantes de ingeniería que conocen las materias y los laboratorios. Te ayudamos a elegir el componente correcto para tu práctica y a resolver dudas sobre su conexión y uso.",
  },
  {
    id: "beneficios-estudiantes",
    group: "productos",
    question: "¿Existe algún beneficio especial para estudiantes?",
    answer:
      "Toda la tienda está pensada para estudiantes: precios ajustados a la economía estudiantil, entrega dentro del campus y promociones en los materiales que se piden cada semestre.",
  },
  {
    id: "opciones-entrega",
    group: "entrega",
    question: "¿Cuáles son las opciones de entrega?",
    answer:
      "Puedes recoger tu pedido en un punto de entrega dentro del campus o pedir envío express a domicilio si estás fuera de él. Eliges la opción al finalizar la compra.",
  },
  {
    id: "tiempo-entrega",
    group: "entrega",
    question: "¿Cuánto tarda la entrega en campus?",
    answer:
      "Los pedidos con entrega en campus se procesan y entregan en menos de 24 horas. Si haces el pedido en línea por la mañana, normalmente lo tienes el mismo día.",
  },
  {
    id: "metodos-pago",
    group: "pagos",
    question: "¿Qué métodos de pago aceptan?",
    answer:
      "Tarjeta de crédito o débito, PayPal, transferencia bancaria y pago en efectivo, ya sea al recibir en campus o en tiendas de conveniencia.",
  },
  {
    id: "devoluciones",
    group: "garantia",
    question: "¿Puedo devolver un producto si no es compatible con mi práctica?",
    answer:
      "Sí. Aceptamos devoluciones dentro de los 7 días posteriores a la compra, siempre que el producto esté completo y en buen estado. Te lo cambiamos por el correcto o te reembolsamos el importe.",
  },
  {
    id: "garantia",
    group: "garantia",
    question: "¿Qué garantía tienen los productos?",
    answer:
      "Todos los productos del catálogo cuentan con una garantía mínima de 6 meses contra defectos de fabricación.",
  },
  {
    id: "cuenta-necesaria",
    group: "cuenta",
    question: "¿Necesito una cuenta para comprar?",
    answer:
      "No, puedes comprar como invitado con tu nombre, correo y teléfono. Si creas una cuenta, guardas tus datos de entrega y puedes consultar el historial de tus pedidos.",
  },
];
