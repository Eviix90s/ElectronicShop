import type { TeamMember } from "./types";

/**
 * Equipo tomado de la página Acerca de del sitio actual.
 *
 * PENDIENTE: el cliente debe entregar las fotos reales de cada integrante
 * (las del sitio actual son imágenes de relleno). Mientras tanto no se define
 * `image` y la interfaz muestra un avatar con iniciales. Los enlaces a redes
 * del sitio actual tampoco apuntan a perfiles reales, por lo que se omiten.
 */
export const team: TeamMember[] = [
  {
    name: "Emiliano",
    role: "Ingeniero electrónico · Especialista en circuitos universitarios",
    bio: "Cuenta con amplia experiencia en componentes electrónicos y soporte técnico para estudiantes. Es quien revisa que cada pieza del catálogo sirva para lo que piden en el laboratorio.",
  },
  {
    name: "Najla",
    role: "Coordinadora de logística · Responsable de entregas rápidas",
    bio: "Destaca por optimizar los procesos de entrega y garantizar la satisfacción en cada compra. Organiza los puntos de entrega en campus para que el pedido llegue en menos de 24 horas.",
  },
  {
    name: "Brenda",
    role: "Asesora técnica · Consultora en productos electrónicos",
    bio: "Ofrece asesoría experta para seleccionar los mejores materiales para las prácticas académicas y resuelve las dudas de conexión y uso antes y después de la compra.",
  },
];
