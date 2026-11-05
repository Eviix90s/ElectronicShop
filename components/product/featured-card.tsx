"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Box, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StockDot } from "@/components/ui/tag";
import { useCart } from "@/lib/cart/store";
import { getCategoryBySlug } from "@/lib/data";
import type { Product } from "@/lib/data/types";
import { formatPrice } from "@/lib/utils";
import { WishlistButton } from "./wishlist-button";

interface FeaturedCardProps {
  product: Product;
  onView3d?: (product: Product) => void;
  priority?: boolean;
}

const glassButton =
  "glass inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full px-4 text-sm font-medium text-ink transition-colors hover:text-copper";

/**
 * Tarjeta de previsualización para Destacados: foto grande, categoría y SKU,
 * nombre, descripción corta, precio y stock, y los botones de añadir, guardar,
 * ver en 3D y abrir la ficha. La tarjeta en sí no navega: solo sus botones.
 */
export function FeaturedCard({ product, onView3d, priority }: FeaturedCardProps) {
  const category = getCategoryBySlug(product.category);
  const add = useCart((s) => s.add);
  const out = product.stock <= 0;
  const has3d = Boolean(product.model3d && onView3d);

  return (
    <article className="glass glass-lift group flex h-full min-w-0 flex-col rounded-[24px] p-4 md:p-5">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl">
        <Image
          src={product.image}
          alt={product.name}
          width={480}
          height={360}
          priority={priority}
          className="size-full object-contain p-[8%] transition-transform duration-300 ease-(--ease-out-soft) group-hover:-translate-y-1 group-hover:scale-[1.03]"
        />
        {/* Los botones van en envoltorios posicionados: .glass fija position: relative. */}
        <div className="absolute top-1 left-1">
          <WishlistButton slug={product.slug} name={product.name} />
        </div>
        {has3d ? (
          <div className="absolute top-1 right-1">
            <button
              type="button"
              onClick={() => onView3d?.(product)}
              aria-label={`Ver ${product.name} en 3D`}
              className="glass inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full px-3.5 font-mono text-[11px] tracking-[0.08em] text-ink uppercase transition-colors hover:text-copper"
            >
              <Box className="size-3.5" strokeWidth={1.6} aria-hidden="true" />
              Ver en 3D
            </button>
          </div>
        ) : null}
      </div>

      <div className="mt-4 flex flex-1 flex-col gap-2.5">
        <p className="mono-label flex flex-wrap items-center gap-x-2">
          <span>{category?.shortName ?? product.category}</span>
          <span aria-hidden="true">·</span>
          <span>SKU {product.sku}</span>
        </p>
        <h3 className="text-[20px] leading-tight font-semibold">{product.name}</h3>
        <p className="line-clamp-2 text-[15px] leading-snug text-muted">{product.shortDescription}</p>
        <div className="mt-auto flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 pt-2">
          <span className="font-mono text-[22px] tabular">{formatPrice(product.price)}</span>
          <StockDot stock={product.stock} />
        </div>
        <div className="mt-2 flex items-center gap-2">
          <Button className="h-11 min-w-0 flex-1" disabled={out} onClick={() => add(product.slug, 1)}>
            <ShoppingCart className="size-4" strokeWidth={1.6} aria-hidden="true" />
            {out ? "Agotado" : "Añadir"}
          </Button>
          <Link href={`/producto/${product.slug}`} className={glassButton}>
            Ver producto
            <ArrowUpRight className="size-4" strokeWidth={1.6} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
