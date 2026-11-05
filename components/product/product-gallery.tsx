"use client";

import { useState } from "react";
import Image from "next/image";
import { Box } from "lucide-react";
import { LazyViewerModal } from "@/components/three/lazy";
import type { Product } from "@/lib/data/types";
import { useCart } from "@/lib/cart/store";

export function ProductGallery({ product }: { product: Product }) {
  const [open, setOpen] = useState(false);
  const add = useCart((s) => s.add);

  return (
    <div className="glass relative aspect-square w-full overflow-hidden rounded-[24px]">
      <Image
        src={product.image}
        alt={product.name}
        width={720}
        height={720}
        priority
        sizes="(min-width: 1024px) 560px, 100vw"
        className="size-full object-contain p-[8%]"
      />
      {product.model3d ? (
        <>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="absolute right-4 bottom-4 inline-flex h-11 cursor-pointer items-center gap-2 rounded-full border border-ink bg-ink px-4 font-mono text-xs tracking-[0.08em] text-bg uppercase transition-colors hover:bg-copper hover:border-copper"
          >
            <Box className="size-4" strokeWidth={1.6} aria-hidden="true" />
            Ver en 3D
          </button>
          <LazyViewerModal
            open={open}
            product={product}
            onClose={() => setOpen(false)}
            onAddToCart={() => add(product.slug, 1)}
          />
        </>
      ) : null}
    </div>
  );
}
