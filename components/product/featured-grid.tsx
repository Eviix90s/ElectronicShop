"use client";

import { useState } from "react";
import type { Product } from "@/lib/data/types";
import { Reveal } from "@/components/motion/reveal";
import { LazyViewerModal } from "@/components/three/lazy";
import { useCart } from "@/lib/cart/store";
import { cn } from "@/lib/utils";
import { FeaturedCard } from "./featured-card";

interface FeaturedGridProps {
  products: Product[];
  className?: string;
  /** Tres columnas (Destacados) o cuatro en pantallas anchas (Tienda). */
  columns?: 3 | 4;
  /** Las primeras N imágenes se cargan con prioridad */
  priorityCount?: number;
}

/** Cuadrícula de tarjetas grandes de previsualización, con un único visor 3D modal compartido. */
export function FeaturedGrid({ products, className, columns = 3, priorityCount = 0 }: FeaturedGridProps) {
  const [viewing, setViewing] = useState<Product | null>(null);
  const add = useCart((s) => s.add);

  return (
    <>
      <div
        className={cn(
          "grid grid-cols-1 gap-5 xs:grid-cols-2 lg:grid-cols-3 lg:gap-6",
          columns === 4 && "xl:grid-cols-4",
          className,
        )}
      >
        {products.map((p, i) => (
          <Reveal key={p.slug} index={i % columns} className="flex">
            <FeaturedCard product={p} onView3d={setViewing} priority={i < priorityCount} />
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
