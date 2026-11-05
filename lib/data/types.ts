/**
 * Contratos de datos de ElectronicShop.
 * Los mismos tipos se usan con el seed local (lib/data/*.ts) y con Supabase (supabase/migrations).
 */

export type CategorySlug =
  | "placas-de-desarrollo"
  | "componentes-electronicos"
  | "accesorios-electronicos"
  | "herramientas-electronicas"
  | "kits-de-aprendizaje"
  | "modulos-electronicos"
  | "sensores-electronicos";

export interface Category {
  slug: CategorySlug;
  /** Nombre completo, p. ej. "Placas de desarrollo" */
  name: string;
  /** Nombre corto para chips y tiles, p. ej. "Placas" */
  shortName: string;
  description: string;
  /** Nombre de icono de lucide-react en kebab-case, p. ej. "cpu" */
  icon: string;
}

/** Modelos 3D procedurales disponibles en components/three/models.ts */
export type ModelId = "board" | "resistor" | "capacitor" | "pir";

export interface ProductSpec {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  slug: string;
  sku: string;
  name: string;
  category: CategorySlug;
  /** Precio en MXN con dos decimales */
  price: number;
  compareAtPrice?: number;
  stock: number;
  /** Una o dos frases para tarjetas y meta description */
  shortDescription: string;
  /** Párrafos separados por "\n\n" */
  description: string;
  specs: ProductSpec[];
  /** Ruta pública, p. ej. "/img/products/arduino.webp" */
  image: string;
  /** Si existe, la tarjeta muestra "Ver en 3D" y la ficha abre el visor */
  model3d?: ModelId;
  featured?: boolean;
  tags?: string[];
  /** Slugs de productos relacionados */
  relatedSlugs?: string[];
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  group: "productos" | "pagos" | "entrega" | "garantia" | "cuenta";
}

export interface ServiceItem {
  slug: string;
  title: string;
  summary: string;
  details: string[];
  /** Nombre de icono de lucide-react en kebab-case */
  icon: string;
}

export interface TeamMember {
  name: string;
  role: string;
  bio: string;
  /** Ruta pública opcional; si falta se muestra un avatar con iniciales */
  image?: string;
  linkedin?: string;
}

export interface Testimonial {
  quote: string;
  author: string;
  program: string;
}

export interface ValueItem {
  title: string;
  text: string;
  /** Nombre de icono de lucide-react en kebab-case */
  icon: string;
}

/** Promesa de confianza: cifra grande para la franja de inicio y texto corto para fichas y listas. */
export interface TrustItem {
  label: string;
  /** Frase corta, p. ej. "En campus en menos de 24 h" (ficha de producto). */
  value: string;
  icon: string;
  /** Cifra que se anima al entrar en pantalla y su unidad. */
  stat: { n: number; unit: string };
  /** Una línea de apoyo bajo la cifra. */
  detail: string;
}

export interface SiteInfo {
  name: string;
  tagline: string;
  description: string;
  url: string;
  email: string;
  phone: string;
  addresses: string[];
  hours: string;
  social: { instagram?: string; facebook?: string; x?: string };
  trust: TrustItem[];
  mission: string;
  vision: string;
  values: ValueItem[];
}

export interface CartLine {
  slug: string;
  qty: number;
}

export type PaymentMethod = "tarjeta" | "paypal" | "efectivo";
export type DeliveryMethod = "campus" | "envio";

export interface OrderInput {
  name: string;
  email: string;
  phone: string;
  delivery: DeliveryMethod;
  address?: string;
  payment: PaymentMethod;
  notes?: string;
  lines: CartLine[];
}

export interface Order extends OrderInput {
  id: string;
  createdAt: string;
  subtotal: number;
  shipping: number;
  total: number;
  status: "pendiente" | "pagado" | "listo" | "entregado" | "cancelado";
}
