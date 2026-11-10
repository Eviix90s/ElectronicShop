import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const mxn = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** "$599.99" en formato mexicano */
export function formatPrice(amount: number) {
  return mxn.format(amount);
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

/** Quita acentos y pasa a minúsculas para búsquedas */
export function normalize(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

export function plural(n: number, singular: string, pluralForm: string) {
  return `${n} ${n === 1 ? singular : pluralForm}`;
}

/**
 * Ruta interna para redirigir (evita la redirección abierta). Se resuelve con el
 * mismo parser de URL que usa el navegador, que borra tabuladores y saltos de
 * línea: "/\t/evil.com" termina en evil.com aunque empiece con "/".
 */
export function safePath(value: unknown, fallback = "/mi-cuenta") {
  if (typeof value !== "string" || !value.startsWith("/")) return fallback;
  const url = new URL(value, "http://interno");
  return url.host === "interno" ? url.pathname + url.search + url.hash : fallback;
}

// Barra invertida + "u003c": "<" escapado para que un texto nunca cierre el <script>.
const ESCAPED_LT = String.fromCharCode(92) + "u003c";

/** JSON para incrustar en <script type="application/ld+json"> sin riesgo de XSS. */
export function jsonForScript(data: unknown) {
  return JSON.stringify(data).replaceAll("<", ESCAPED_LT);
}

export function shortId() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}
