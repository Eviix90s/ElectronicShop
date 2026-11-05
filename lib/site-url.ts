/**
 * URL pública del sitio, para metadatos, sitemap y robots.
 * Orden: la variable explícita NEXT_PUBLIC_SITE_URL; si no existe, la URL de
 * producción que Vercel inyecta en cada build (se actualiza sola al añadir un
 * dominio propio); si tampoco, la URL del despliegue; y en local, localhost.
 */
function fromEnv(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return explicit;
  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (production) return `https://${production}`;
  const deployment = process.env.VERCEL_URL?.trim();
  if (deployment) return `https://${deployment}`;
  return "http://localhost:3000";
}

export const siteUrl = fromEnv().replace(/\/+$/, "");
