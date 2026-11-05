"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Check } from "lucide-react";
import { useCart } from "@/lib/cart/store";
import { getProductBySlug } from "@/lib/data";

/** Aviso breve al añadir al carrito. Se cierra solo a los 3,5 s. */
export function CartToast() {
  const lastAdded = useCart((s) => s.lastAdded);
  const dismiss = useCart((s) => s.dismissToast);
  const product = lastAdded ? getProductBySlug(lastAdded) : undefined;

  useEffect(() => {
    if (!lastAdded) return;
    const t = setTimeout(dismiss, 3500);
    return () => clearTimeout(t);
  }, [lastAdded, dismiss]);

  return (
    <AnimatePresence>
      {product ? (
        <motion.div
          key={product.slug}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.25 }}
          role="status"
          className="fixed inset-x-4 bottom-4 z-40 flex justify-center"
          style={{ bottom: "max(1rem, env(safe-area-inset-bottom, 0px))" }}
        >
          {/* El vidrio va en un hijo: .glass fija position: relative y el contenedor debe seguir fixed. */}
          <div className="glass flex w-full max-w-md items-center gap-3 rounded-full py-2 pr-2 pl-4">
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-pcb-soft text-pcb">
              <Check className="size-4" strokeWidth={2} aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1 truncate text-sm">
              <strong className="font-medium">{product.name}</strong> añadido al carrito
            </span>
            <Link
              href="/carrito"
              onClick={dismiss}
              className="shrink-0 rounded-full bg-ink px-3.5 py-1.5 text-sm font-medium text-bg"
            >
              Ver carrito
            </Link>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
