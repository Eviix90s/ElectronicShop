import type { Testimonial } from "./types";

/**
 * Testimonios tomados tal cual de la página Acerca de del sitio actual.
 * Nota: el primero menciona al propietario por su nombre en lugar de a la
 * marca; confirmar con el cliente si prefiere cambiarlo por "ElectronicShop".
 */
export const testimonials: Testimonial[] = [
  {
    quote:
      "Gracias a Emiliano Gallegos Rojas, mis proyectos electrónicos avanzaron con rapidez y precisión.",
    author: "Ana Pérez",
    program: "Ingeniería Electrónica",
  },
  {
    quote:
      "La entrega inmediata y la variedad de métodos de pago facilitaron mucho mi compra, garantizando un servicio profesional y confiable.",
    author: "Carlos Méndez",
    program: "Ingeniería en Sistemas",
  },
  {
    quote:
      "La calidad de los productos y el servicio al cliente superaron mis expectativas en cada compra realizada.",
    author: "Laura Gómez",
    program: "Ingeniería Mecatrónica",
  },
];
