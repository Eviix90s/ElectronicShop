/**
 * Punto de entrada de la capa de datos local.
 * Re-exporta los tipos y las colecciones, más helpers puros para consultarlas.
 */
import { categories } from "./categories";
import { products } from "./products";
import type { Category, CategorySlug, Product } from "./types";

export * from "./types";
export { categories } from "./categories";
export { products } from "./products";
export { faq } from "./faq";
export { services } from "./services";
export { team } from "./team";
export { testimonials } from "./testimonials";
export { site } from "./site";

const productsBySlug: ReadonlyMap<string, Product> = new Map(
  products.map((p) => [p.slug, p]),
);

const categoriesBySlug: ReadonlyMap<string, Category> = new Map(
  categories.map((c) => [c.slug, c]),
);

/** Quita acentos y pasa a minúsculas para comparar texto sin distinguir tildes. */
export function normalizeText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

export function getProductBySlug(slug: string): Product | undefined {
  return productsBySlug.get(slug);
}

export function getProductsByCategory(slug: CategorySlug): Product[] {
  return products.filter((p) => p.category === slug);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.featured === true);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categoriesBySlug.get(slug);
}

/**
 * Productos relacionados: primero los de `relatedSlugs`, y si no alcanzan,
 * se completa con otros productos de la misma categoría.
 */
export function getRelatedProducts(product: Product, n = 4): Product[] {
  const picked: Product[] = [];
  const seen = new Set<string>([product.slug]);

  for (const slug of product.relatedSlugs ?? []) {
    if (picked.length >= n) break;
    const related = productsBySlug.get(slug);
    if (related && !seen.has(related.slug)) {
      picked.push(related);
      seen.add(related.slug);
    }
  }

  for (const candidate of products) {
    if (picked.length >= n) break;
    if (candidate.category === product.category && !seen.has(candidate.slug)) {
      picked.push(candidate);
      seen.add(candidate.slug);
    }
  }

  return picked;
}

/**
 * Búsqueda sin distinguir mayúsculas ni acentos sobre nombre, etiquetas,
 * descripción corta y SKU. Todas las palabras de la consulta deben aparecer.
 * Con una consulta vacía devuelve el catálogo completo.
 */
export function searchProducts(query: string): Product[] {
  const terms = normalizeText(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [...products];

  return products.filter((p) => {
    const haystack = normalizeText(
      [p.name, p.sku, p.shortDescription, ...(p.tags ?? [])].join(" "),
    );
    return terms.every((term) => haystack.includes(term));
  });
}

export function countByCategory(): Record<CategorySlug, number> {
  const counts = Object.fromEntries(categories.map((c) => [c.slug, 0])) as Record<
    CategorySlug,
    number
  >;
  for (const p of products) {
    counts[p.category] += 1;
  }
  return counts;
}
