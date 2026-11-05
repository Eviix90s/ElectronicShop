"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart/store";
import { cn } from "@/lib/utils";

interface AddToCartProps {
  slug: string;
  stock: number;
  /** Compacto para tarjetas; completo con selector de cantidad para la ficha */
  variant?: "compact" | "full";
  className?: string;
}

export function AddToCart({ slug, stock, variant = "compact", className }: AddToCartProps) {
  const add = useCart((s) => s.add);
  const [qty, setQty] = useState(1);
  const disabled = stock <= 0;

  if (variant === "compact") {
    return (
      <Button
        size="sm"
        className={className}
        disabled={disabled}
        onClick={() => add(slug, 1)}
        aria-label="Añadir al carrito"
      >
        Añadir
      </Button>
    );
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      <div className="inline-flex h-12 items-center rounded-full border border-line-strong">
        <button
          type="button"
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          className="grid size-12 place-items-center rounded-l-full text-muted transition-colors hover:text-ink disabled:opacity-40"
          aria-label="Menos"
          disabled={qty <= 1}
        >
          <Minus className="size-4" strokeWidth={1.6} aria-hidden="true" />
        </button>
        <span className="w-8 text-center font-mono text-sm tabular" aria-live="polite">
          {qty}
        </span>
        <button
          type="button"
          onClick={() => setQty((q) => Math.min(stock, 99, q + 1))}
          className="grid size-12 place-items-center rounded-r-full text-muted transition-colors hover:text-ink disabled:opacity-40"
          aria-label="Más"
          disabled={qty >= Math.min(stock, 99)}
        >
          <Plus className="size-4" strokeWidth={1.6} aria-hidden="true" />
        </button>
      </div>
      <Button disabled={disabled} onClick={() => add(slug, qty)} className="min-w-44">
        <ShoppingCart className="size-4" strokeWidth={1.6} aria-hidden="true" />
        {disabled ? "Agotado" : "Añadir al carrito"}
      </Button>
    </div>
  );
}
