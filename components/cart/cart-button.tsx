"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { selectCount, useCart } from "@/lib/cart/store";
import { cn } from "@/lib/utils";

export function CartButton({ className }: { className?: string }) {
  const count = useCart(selectCount);
  const hydrated = useCart((s) => s.hydrated);
  const shown = hydrated ? count : 0;
  return (
    <Link
      href="/carrito"
      className={cn(
        "inline-flex h-11 items-center gap-2 rounded-full border border-line-strong px-3.5 font-mono text-[13px] transition-colors hover:border-ink",
        className,
      )}
      aria-label={`Carrito, ${shown} artículos`}
    >
      <ShoppingCart className="size-4" strokeWidth={1.6} aria-hidden="true" />
      <span className="tabular whitespace-nowrap">
        <span className="max-sm:hidden">Carrito · </span>
        {shown}
      </span>
    </Link>
  );
}
