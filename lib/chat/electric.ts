import { categories, faq, normalizeText, products, searchProducts, site } from "@/lib/data";
import type { Product } from "@/lib/data/types";

/**
 * Electric: asistente sencillo por reglas. Responde con los datos reales del
 * sitio (catálogo, horario, entrega, pagos, garantía, contacto y preguntas
 * frecuentes) sin ningún servicio externo.
 */

export const BOT_NAME = "Electric";

export const QUICK_REPLIES = ["Ver productos", "Horarios", "Quiénes son", "Entrega en campus", "Formas de pago", "Contacto"];

export interface ChatLink {
  href: string;
  label: string;
}

export interface ChatProduct {
  slug: string;
  name: string;
  price: number;
  stock: number;
  image: string;
}

export interface ChatReply {
  text: string;
  links?: ChatLink[];
  products?: ChatProduct[];
  suggestions?: string[];
}

const pick = (p: Product): ChatProduct => ({ slug: p.slug, name: p.name, price: p.price, stock: p.stock, image: p.image });
const has = (q: string, words: string[]) => words.some((w) => q.includes(w));

/** Palabras que no identifican un producto y estorban en la búsqueda. */
const STOP = new Set([
  "hola", "tienen", "tiene", "hay", "busco", "quiero", "necesito", "venden", "vende", "ver", "un", "una", "unos", "unas",
  "el", "la", "los", "las", "de", "del", "para", "por", "que", "cual", "cuales", "me", "puedes", "dame", "precio",
  "cuanto", "cuesta", "vale", "sobre", "info", "informacion", "y", "o", "a", "en", "es", "al", "producto", "productos",
  "catalogo", "tienda", "componente", "componentes", "algun", "alguna", "con", "sin", "si", "no", "muestrame", "quisiera",
]);

export function welcome(): ChatReply {
  return {
    text: `Hola, soy ${BOT_NAME}, el asistente de ${site.name}. Puedo ayudarte a encontrar un componente, contarte cómo funciona la entrega en campus o resolver dudas de pagos y garantía. ¿Qué buscas hoy?`,
    suggestions: QUICK_REPLIES,
  };
}

function productSearch(q: string): ChatProduct[] {
  const terms = q.split(/\s+/).filter((t) => t.length > 1 && !STOP.has(t));
  if (!terms.length) return [];
  const exact = searchProducts(terms.join(" "));
  if (exact.length) return exact.slice(0, 4).map(pick);
  const loose = products.filter((p) => {
    const hay = normalizeText([p.name, p.sku, ...(p.tags ?? [])].join(" "));
    return terms.some((t) => t.length > 2 && hay.includes(t));
  });
  return loose.slice(0, 4).map(pick);
}

function faqMatch(q: string): ChatReply | null {
  const words = [...new Set(q.split(/\s+/).filter((w) => w.length > 3 && !STOP.has(w)))];
  if (!words.length) return null;
  let best: (typeof faq)[number] | null = null;
  let bestScore = 0;
  for (const f of faq) {
    const hay = normalizeText(`${f.question} ${f.answer}`);
    const score = words.reduce((n, w) => n + (hay.includes(w) ? 1 : 0), 0);
    if (score > bestScore) {
      best = f;
      bestScore = score;
    }
  }
  if (!best || bestScore < 2) return null;
  return { text: best.answer, links: [{ href: "/preguntas-frecuentes", label: "Todas las preguntas" }] };
}

/** Normaliza y quita signos de puntuación, para que "¿tienen esp32?" encuentre "esp32". */
function clean(input: string): string {
  return normalizeText(input)
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function reply(input: string): ChatReply {
  const q = clean(input);
  if (!q) return { text: "Escríbeme qué componente buscas o elige una opción.", suggestions: QUICK_REPLIES };

  if (q.length < 25 && has(q, ["hola", "buenas", "hey", "que tal", "buenos dias", "saludos"])) return welcome();
  if (q.length < 22 && has(q, ["gracias", "perfecto", "genial", "excelente", "ok"])) {
    return { text: "Con gusto. Si necesitas algo más, aquí estoy.", suggestions: QUICK_REPLIES };
  }
  if (has(q, ["horario", "horas de atencion", "a que hora", "abren", "cierran", "atienden"])) {
    return {
      text: `Atendemos ${site.hours}. Los pedidos en línea entran a cualquier hora y se preparan en el siguiente horario de atención.`,
      links: [{ href: "/contacto", label: "Ver contacto" }],
    };
  }
  if (has(q, ["quien", "quienes", "nosotros", "equipo", "que es electronicshop", "que son", "sobre ustedes", "ustedes"])) {
    return {
      text: "Somos estudiantes de ingeniería que venden componentes electrónicos a otros estudiantes: placas, sensores, módulos, herramientas y kits para las prácticas de circuitos, con entrega en campus en menos de 24 horas.",
      links: [
        { href: "/nosotros", label: "Conoce al equipo" },
        { href: "/servicios", label: "Nuestros servicios" },
      ],
    };
  }
  if (has(q, ["entrega", "envio", "envios", "recoger", "recojo", "campus", "tarda", "llega", "paqueteria"])) {
    return {
      text: `Recoges en campus en menos de 24 horas, gratis, en ${site.addresses[0]}. Si lo necesitas fuera, envío express por $99, gratis a partir de $1,500, en 1 a 2 días.`,
      links: [{ href: "/servicios", label: "Entrega en campus" }],
    };
  }
  if (has(q, ["pago", "pagar", "pagos", "tarjeta", "paypal", "efectivo", "transferencia", "mercado pago"])) {
    return {
      text: "Puedes pagar con tarjeta de crédito o débito, PayPal o en efectivo al recoger. Sin mínimos de compra.",
      links: [{ href: "/servicios", label: "Métodos de pago" }],
    };
  }
  if (has(q, ["garantia", "devolucion", "devolver", "cambio", "falla", "fallo", "reembolso", "defectuoso"])) {
    return {
      text: "Todo el catálogo tiene garantía de 6 meses y puedes devolver un producto en los primeros 7 días sin dar explicaciones.",
      links: [{ href: "/preguntas-frecuentes", label: "Garantía y devoluciones" }],
    };
  }
  if (has(q, ["contacto", "telefono", "whatsapp", "correo", "email", "direccion", "donde estan", "ubicacion", "oficina"])) {
    return {
      text: `Escríbenos a ${site.email} o por WhatsApp al ${site.phone}. Puntos de entrega: ${site.addresses.join(" y ")}.`,
      links: [{ href: "/contacto", label: "Ir a contacto" }],
    };
  }
  if (has(q, ["pedido", "carrito", "comprar", "como compro", "cuenta", "iniciar sesion", "registr"])) {
    return {
      text: "Añade lo que necesites al carrito, confirma tu pedido con nombre, teléfono y correo, y elige recoger en campus o envío. No necesitas cuenta; si creas una, el pedido queda en tu historial.",
      links: [
        { href: "/tienda", label: "Ir a la tienda" },
        { href: "/carrito", label: "Ver carrito" },
        { href: "/registro", label: "Crear cuenta" },
      ],
    };
  }

  const found = productSearch(q);
  if (found.length) {
    return {
      text: found.length === 1 ? "Esto es lo que tengo:" : `Encontré ${found.length} productos que encajan:`,
      products: found,
      links: [{ href: "/tienda", label: "Ver todo el catálogo" }],
    };
  }
  if (has(q, ["producto", "catalogo", "tienda", "venden", "componente", "que tienen", "inventario", "placas", "sensores"])) {
    return {
      text: `Tenemos ${products.length} productos en ${categories.length} categorías. Elige una:`,
      links: [...categories.map((c) => ({ href: `/tienda?categoria=${c.slug}`, label: c.shortName })), { href: "/tienda", label: "Ver todo" }],
    };
  }
  const fromFaq = faqMatch(q);
  if (fromFaq) return fromFaq;

  return {
    text: "No estoy seguro de haber entendido. Prueba con el nombre o código del componente (por ejemplo ESP32 o LM35), o elige una opción.",
    suggestions: QUICK_REPLIES,
    links: [{ href: "/contacto", label: "Hablar con el equipo" }],
  };
}
