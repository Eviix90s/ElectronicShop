import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { AddToCart } from "@/components/product/add-to-cart";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductGrid } from "@/components/product/product-grid";
import { Reveal } from "@/components/motion/reveal";
import { Icon } from "@/components/ui/icon";
import { SectionHead } from "@/components/ui/section-head";
import { StockDot, Tag } from "@/components/ui/tag";
import { getCategoryBySlug, getProductBySlug, getRelatedProducts, products, site } from "@/lib/data";
import { formatPrice } from "@/lib/utils";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const product = getProductBySlug((await params).slug);
  if (!product) return { title: "Producto no encontrado" };
  return {
    title: product.name,
    description: product.shortDescription,
    openGraph: { images: [{ url: product.image }] },
  };
}

export default function ProductPage({ params }: { params: Params }) {
  // params se resuelve dentro de Suspense para que la navegación sea instantánea.
  return (
    <Suspense fallback={<ProductSkeleton />}>
      <ProductContent params={params} />
    </Suspense>
  );
}

function ProductSkeleton() {
  return (
    <div className="wrap py-8 md:py-12" aria-hidden="true">
      <div className="h-3 w-48 animate-pulse rounded bg-line" />
      <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-14">
        <div className="aspect-square animate-pulse rounded-lg border border-line bg-surface" />
        <div className="flex flex-col gap-4">
          <div className="h-8 w-3/4 animate-pulse rounded bg-line" />
          <div className="h-5 w-1/3 animate-pulse rounded bg-line" />
          <div className="h-24 animate-pulse rounded bg-surface" />
        </div>
      </div>
    </div>
  );
}

async function ProductContent({ params }: { params: Params }) {
  const product = getProductBySlug((await params).slug);
  if (!product) notFound();
  const category = getCategoryBySlug(product.category);
  const related = getRelatedProducts(product, 4);
  const paragraphs = product.description.split(/\n\s*\n/);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku,
    image: product.image,
    description: product.shortDescription,
    brand: { "@type": "Brand", name: site.name },
    offers: {
      "@type": "Offer",
      priceCurrency: "MXN",
      price: product.price.toFixed(2),
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="wrap py-8 md:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <nav className="mono-label flex flex-wrap items-center gap-1.5" aria-label="Ruta">
        <Link href="/tienda" className="hover:text-ink">
          Tienda
        </Link>
        <ChevronRight className="size-3.5" strokeWidth={1.6} aria-hidden="true" />
        {category ? (
          <Link href={`/tienda?categoria=${category.slug}`} className="hover:text-ink">
            {category.name}
          </Link>
        ) : null}
        <ChevronRight className="size-3.5" strokeWidth={1.6} aria-hidden="true" />
        <span className="text-ink">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-14">
        <ProductGallery product={product} />

        <div className="flex min-w-0 flex-col">
          <div className="flex flex-wrap items-center gap-2">
            {category ? <Tag>{category.shortName}</Tag> : null}
            {product.model3d ? <Tag tone="copper">Modelo 3D</Tag> : null}
          </div>
          <h1 className="mt-4 text-[clamp(30px,3.8vw,44px)] font-semibold">{product.name}</h1>
          <p className="mono-label mt-2">SKU {product.sku}</p>
          <div className="mt-6 flex flex-wrap items-baseline gap-4">
            <span className="font-mono text-3xl tabular">{formatPrice(product.price)}</span>
            {product.compareAtPrice ? (
              <span className="font-mono text-muted line-through tabular">{formatPrice(product.compareAtPrice)}</span>
            ) : null}
            <StockDot stock={product.stock} className="text-sm" />
          </div>
          <p className="mt-5 max-w-[52ch] text-muted">{product.shortDescription}</p>
          <AddToCart slug={product.slug} stock={product.stock} variant="full" className="mt-7" />
          <ul className="mt-8 grid gap-3 border-t border-line pt-6 text-[15px]">
            {site.trust.map((t) => (
              <li key={t.label} className="flex items-center gap-3">
                <Icon name={t.icon} className="size-[18px] text-copper" />
                <span>
                  <span className="text-muted">{t.label}:</span> {t.value}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-16 grid gap-10 border-t border-line pt-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-14">
        <Reveal>
          <p className="eyebrow">Descripción</p>
          <div className="mt-4 flex max-w-[65ch] flex-col gap-4 text-[17px] text-muted">
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
        </Reveal>
        <Reveal>
          <p className="eyebrow">Especificaciones</p>
          <dl className="mt-4 border-t border-line">
            {product.specs.map((s) => (
              <div key={s.label} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-4 border-b border-line py-3">
                <dt className="mono-label pt-0.5">{s.label}</dt>
                <dd className="text-[15px]">{s.value}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </div>

      {related.length ? (
        <section className="mt-16 border-t border-line pt-12">
          <SectionHead eyebrow="Relacionados" title="Suele ir con este producto." />
          <ProductGrid products={related} />
        </section>
      ) : null}
    </div>
  );
}
