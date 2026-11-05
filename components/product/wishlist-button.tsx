"use client";

import { Heart } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { selectSaved, useWishlist } from "@/lib/wishlist/store";
import { cn } from "@/lib/utils";

interface WishlistButtonProps {
  slug: string;
  /** Nombre del producto para la etiqueta accesible. */
  name: string;
  size?: "sm" | "md";
  className?: string;
}

/** Corazón de vidrio que guarda o quita el producto de la lista de deseos. */
export function WishlistButton({ slug, name, size = "md", className }: WishlistButtonProps) {
  const saved = useWishlist(selectSaved(slug));
  const toggle = useWishlist((s) => s.toggle);
  const reduce = useReducedMotion();

  return (
    <motion.button
      type="button"
      onClick={() => toggle(slug)}
      aria-pressed={saved}
      aria-label={saved ? `Quitar ${name} de la lista de deseos` : `Guardar ${name} en la lista de deseos`}
      whileTap={reduce ? undefined : { scale: 0.85 }}
      className={cn(
        "glass grid cursor-pointer place-items-center rounded-full transition-colors",
        size === "sm" ? "size-8" : "size-11",
        saved ? "text-copper" : "text-ink hover:text-copper",
        className,
      )}
    >
      <motion.span
        key={String(saved)}
        initial={reduce ? false : { scale: 0.6 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 18 }}
        className="grid place-items-center"
      >
        <Heart
          className={size === "sm" ? "size-3.5" : "size-[18px]"}
          strokeWidth={1.7}
          fill={saved ? "currentColor" : "none"}
          aria-hidden="true"
        />
      </motion.span>
    </motion.button>
  );
}
