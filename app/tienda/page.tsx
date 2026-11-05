import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchForm } from "@/components/layout/search-form";
import { FilterChips } from "@/components/product/filter-chips";
import { FeaturedGrid } from "@/components/product/featured-grid";
import { SortSelect, type SortValue } from "@/components/product/sort-select";
import { ButtonLink } from "@/components/ui/button";
import { categories, countByCategory, getCategoryBySlug, products, searchProducts } from "@/lib/data";
import type { CategorySlug, Product } from "@/lib/data/types";
import { plural } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Tienda",
  description:
    "Placas de desarrollo, sensores, componentes, módulos, kits y herramientas para prácticas de circuitos. Entrega en campus en menos de 24 horas.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(v: string | string[] | undefined) {
  return Array.isArray(v) ? v[0] : v;
}

function sortProducts(list: Product[], orden: SortValue) {
  const copy = [...list];
  switch (orden) {
    case "precio-asc":
      return copy.sort((a, b) => a.price - b.price);
    case "precio-desc":
      return copy.sort((a, b) => b.price - a.price);
    case "nombre":
      return copy.sort((a, b) => a.name.localeCompare(b.name, "es"));
    default:
      return copy;
  }
}

export default function TiendaPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <div className="wrap py-10 md:py-14">
      {/* Título con la misma tipografía y posición que los de la portada. */}
      <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
        <div>
          <p className="eyebrow">Tienda</p>
          <h1 className="mt-5 max-w-[12ch] text-[clamp(36px,5.2vw,72px)] font-semibold tracking-[-0.03em]">
            Catálogo completo
          </h1>
        </div>
        <Suspense fallback={null}>
          <SearchBox searchParams={searchParams} />
        </Suspense>
      </div>
      <Suspense fallback={<ResultsSkeleton />}>
        <Results searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function SearchBox({ searchParams }: { searchParams: SearchParams }) {
  const q = first((await searchParams).q) ?? "";
  return <SearchForm key={q} initialQuery={q} size="lg" className="mb-2 w-full md:w-[26rem]" />;
}

async function Results({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const q = first(sp.q)?.trim() ?? "";
  const categoriaRaw = first(sp.categoria);
  const categoria = categories.some((c) => c.slug === categoriaRaw) ? (categoriaRaw as CategorySlug) : undefined;
  const ordenRaw = first(sp.orden);
  const orden: SortValue = (["precio-asc", "precio-desc", "nombre"] as const).includes(ordenRaw as never)
    ? (ordenRaw as SortValue)
    : "relevancia";

  const base = q ? searchProducts(q) : products;
  const counts = base.reduce<Partial<Record<CategorySlug, number>>>((acc, p) => {
    acc[p.category] = (acc[p.category] ?? 0) + 1;
    return acc;
  }, {});
  const filtered = categoria ? base.filter((p) => p.category === categoria) : base;
  const list = sortProducts(filtered, orden);
  const category = categoria ? getCategoryBySlug(categoria) : undefined;

  return (
    <>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <FilterChips active={categoria} query={q || undefined} counts={q ? counts : countByCategory()} total={base.length} />
        <SortSelect value={orden} />
      </div>
      {category ? <p className="mt-6 max-w-[60ch] text-muted">{category.description}</p> : null}
      <p className="mono-label mt-6" aria-live="polite">
        {plural(list.length, "resultado", "resultados")}
        {q ? ` para "${q}"` : ""}
      </p>
      {list.length ? (
        <FeaturedGrid products={list} columns={4} className="mt-6" priorityCount={4} />
      ) : (
        <div className="glass mt-8 rounded-[20px] px-6 py-14 text-center">
          <p className="text-lg font-semibold">No encontramos nada con ese nombre.</p>
          <p className="mx-auto mt-2 max-w-[44ch] text-muted">
            Prueba con el código del componente (por ejemplo LM35 o HC-05) o escríbenos y lo conseguimos.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/tienda" variant="ghost" size="sm">
              Ver todo el catálogo
            </ButtonLink>
            <ButtonLink href="/contacto" size="sm">
              Pedir un componente
            </ButtonLink>
          </div>
        </div>
      )}
    </>
  );
}

function ResultsSkeleton() {
  return (
    <div className="mt-8">
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className="h-10 w-24 animate-pulse rounded-full bg-surface" />
        ))}
      </div>
      <div className="mt-10 grid grid-cols-1 gap-5 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="aspect-[4/5] animate-pulse rounded-[24px] border border-line bg-surface" />
        ))}
      </div>
    </div>
  );
}
