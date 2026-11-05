import type { ServiceItem } from "./types";

/**
 * Los tres servicios que la página Servicios actual repite en dos bloques,
 * fusionados en uno solo con los datos concretos del sitio.
 */
export const services: ServiceItem[] = [
  {
    slug: "entrega-en-campus",
    title: "Entrega en campus",
    summary:
      "Recibe tus componentes en menos de 24 horas sin salir de la universidad, para que ninguna práctica se detenga por falta de material.",
    details: [
      "Entrega en un punto dentro del campus en menos de 24 horas desde que confirmas el pedido.",
      "Envío express a domicilio para compras fuera del campus.",
      "Inventario local constante: lo que ves en el catálogo está disponible, sin tiempos de importación.",
      "Te avisamos el lugar y la hora de entrega por correo.",
    ],
    icon: "truck",
  },
  {
    slug: "metodos-de-pago",
    title: "Métodos de pago",
    summary:
      "Paga como te resulte más cómodo: tarjeta, PayPal, transferencia o efectivo.",
    details: [
      "Tarjeta de crédito o débito y PayPal, con procesamiento seguro en línea.",
      "Transferencia bancaria desde la app de tu banco.",
      "Efectivo al recibir en campus o en tiendas de conveniencia.",
      "Compra como invitado o crea una cuenta para guardar tus datos y ver tu historial.",
    ],
    icon: "credit-card",
  },
  {
    slug: "soporte-tecnico",
    title: "Soporte técnico",
    summary:
      "Asesoría de estudiantes para estudiantes: te ayudamos a elegir el componente correcto y a hacerlo funcionar.",
    details: [
      "Orientación para seleccionar el material que pide cada práctica o proyecto.",
      "Dudas de conexión y uso resueltas por estudiantes de ingeniería que conocen las materias.",
      "Garantía mínima de 6 meses en todo el catálogo.",
      "Devoluciones dentro de los 7 días posteriores a la compra si el producto no es compatible con tu práctica.",
    ],
    icon: "wrench",
  },
];
