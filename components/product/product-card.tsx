"use client";

import Image from "next/image";
import Link from "next/link";
import { Box } from "lucide-react";
import type { Product } from "@/lib/data/types";
import { getCategoryBySlug } from "@/lib/data";
import { formatPrice } from "@/lib/utils";
import { StockDot } from "@/components/ui/tag";
import { AddToCart } from "./add-to-cart";
import { WishlistButton } from "./wishlist-button";

interface ProductCardProps {
  product: Product;
  onView3d?: (product: Product) => void;
  priority?: boolean;
}

/**
 * Tarjeta compacta de la tienda. La foto y el nombre llevan siempre a la ficha;
 * "Ver en 3D" es un botón aparte, así la tarjeta se puede abrir sin que el
 * visor se interponga.
 */
export function ProductCard({ product, onView3d, priority }: ProductCardProps) {
  const category = getCategoryBySlug(product.category);
  const has3d = Boolean(product.model3d && onView3d);

  return (
    <article className="group flex min-w-0 flex-col gap-3.5">
      <div className="glass glass-lift relative aspect-square w-full overflow-hidden rounded-[20px]">
        <Link href={`/producto/${product.slug}`} className="block size-full" aria-label={product.name}>
          <Image
            src={product.image}
            alt={product.name}
            width={360}
            height={360}
            priority={priority}
            className="size-full object-contain p-[10%] transition-transform duration-300 ease-(--ease-out-soft) group-hover:-translate-y-1 group-hover:scale-[1.03]"
          />
        </Link>
        {/* Los botones van en envoltorios posicionados: .glass fija position: relative. */}
        <div className="absolute top-3 left-3">
          <WishlistButton slug={product.slug} name={product.name} size="sm" />
        </div>
        {has3d ? (
          <div className="absolute top-3 right-3">
            <button
              type="button"
              onClick={() => onView3d?.(product)}
              aria-label={`Ver ${product.name} en 3D`}
              className="glass inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full px-3 font-mono text-[11px] tracking-[0.08em] text-ink uppercase transition-colors hover:text-copper"
            >
              <Box className="size-3" strokeWidth={1.6} aria-hidden="true" />
              Ver en 3D
            </button>
          </div>
        ) : null}
      </div>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link href={`/producto/${product.slug}`} className="block text-[17px] leading-tight font-semibold hover:underline">
            {product.name}
          </Link>
          <p className="mono-label mt-1 truncate">{category?.shortName ?? product.category}</p>
        </div>
        <span className="font-mono text-[15px] whitespace-nowrap tabular">{formatPrice(product.price)}</span>
      </div>
      <div className="flex items-center justify-between gap-2.5">
        <StockDot stock={product.stock} />
        <AddToCart slug={product.slug} stock={product.stock} />
      </div>
    </article>
  );
}
