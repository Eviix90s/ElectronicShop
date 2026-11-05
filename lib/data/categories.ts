import type { Category } from "./types";

/**
 * Las 7 categorías del catálogo actual (slugs idénticos a la tienda WooCommerce).
 * `icon` es un nombre de icono de lucide-react en kebab-case.
 */
export const categories: Category[] = [
  {
    slug: "placas-de-desarrollo",
    name: "Placas de desarrollo",
    shortName: "Placas",
    description:
      "Arduino, ESP32 y otras placas programables para controlar sensores, motores y pantallas desde tu código.",
    icon: "cpu",
  },
  {
    slug: "componentes-electronicos",
    name: "Componentes electrónicos",
    shortName: "Componentes",
    description:
      "Resistores, capacitores, transistores, pantallas y protoboards: las piezas básicas de cualquier circuito de laboratorio.",
    icon: "circuit-board",
  },
  {
    slug: "accesorios-electronicos",
    name: "Accesorios electrónicos",
    shortName: "Accesorios",
    description:
      "Cables jumper y consumibles para conectar tus placas, módulos y componentes sin soldar.",
    icon: "cable",
  },
  {
    slug: "herramientas-electronicas",
    name: "Herramientas electrónicas",
    shortName: "Herramientas",
    description:
      "Multímetros, fuentes, osciloscopios y kits de soldadura para medir, alimentar y armar tus proyectos.",
    icon: "wrench",
  },
  {
    slug: "kits-de-aprendizaje",
    name: "Kits de aprendizaje",
    shortName: "Kits",
    description:
      "Surtidos completos de componentes y sensores para cubrir de una sola vez el material de varias prácticas.",
    icon: "package",
  },
  {
    slug: "modulos-electronicos",
    name: "Módulos electrónicos",
    shortName: "Módulos",
    description:
      "Relés, Bluetooth y otros módulos listos para conectar que añaden funciones a tu microcontrolador.",
    icon: "radio",
  },
  {
    slug: "sensores-electronicos",
    name: "Sensores electrónicos",
    shortName: "Sensores",
    description:
      "Sensores de temperatura, luz y movimiento para que tus proyectos reaccionen al entorno.",
    icon: "scan-eye",
  },
];
