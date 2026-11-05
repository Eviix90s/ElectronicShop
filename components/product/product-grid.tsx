"use client";

import { useState } from "react";
import type { Product } from "@/lib/data/types";
import { Reveal } from "@/components/motion/reveal";
import { LazyViewerModal } from "@/components/three/lazy";
import { useCart } from "@/lib/cart/store";
import { cn } from "@/lib/utils";
import { ProductCard } from "./product-card";

interface ProductGridProps {
  products: Product[];
  className?: string;
  columns?: 3 | 4;
  /** Las primeras N imágenes se cargan con prioridad */
  priorityCount?: number;
}

/** Grid de tarjetas con un único visor 3D modal compartido. */
export function ProductGrid({ products, className, columns = 4, priorityCount = 0 }: ProductGridProps) {
  const [viewing, setViewing] = useState<Product | null>(null);
  const add = useCart((s) => s.add);

  return (
    <>
      <div
        className={cn(
          "grid grid-cols-1 gap-5 xs:grid-cols-2",
          columns === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3",
          className,
        )}
      >
        {products.map((p, i) => (
          <Reveal key={p.slug} index={i % columns}>
            <ProductCard product={p} onView3d={setViewing} priority={i < priorityCount} />
          </Reveal>
        ))}
      </div>
      <LazyViewerModal
        open={viewing !== null}
        product={viewing}
        onClose={() => setViewing(null)}
        onAddToCart={() => {
          if (viewing) add(viewing.slug, 1);
        }}
      />
    </>
  );
}
