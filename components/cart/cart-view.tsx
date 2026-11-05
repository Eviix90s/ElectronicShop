"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { useCart } from "@/lib/cart/store";
import { resolveLines, totals, SHIPPING_EXPRESS } from "@/lib/cart/totals";
import { formatPrice, plural } from "@/lib/utils";

const qtyButton =
  "grid size-10 cursor-pointer place-items-center text-muted transition-colors hover:text-ink disabled:cursor-default disabled:opacity-40";

/** Carrito: las líneas en una tarjeta de vidrio y el resumen fijo a la derecha. */
export function CartView() {
  const lines = useCart((s) => s.lines);
  const hydrated = useCart((s) => s.hydrated);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const items = resolveLines(lines);
  const t = totals(items, "campus");
  const count = items.reduce((n, i) => n + i.qty, 0);

  if (!hydrated) {
    return <div className="mt-10 h-56 animate-pulse rounded-[24px] border border-line bg-surface" aria-hidden="true" />;
  }

  if (!items.length) {
    return (
      <div className="glass mt-10 rounded-[28px] px-6 py-16 text-center md:py-20">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-copper-soft text-copper">
          <ShoppingBag className="size-6" strokeWidth={1.6} aria-hidden="true" />
        </span>
        <p className="mt-6 text-[24px] font-semibold">Tu carrito está vacío.</p>
        <p className="mx-auto mt-2 max-w-[44ch] text-[17px] text-muted">
          Añade lo que te pidieron en la práctica y recógelo mañana en campus.
        </p>
        <ButtonLink href="/tienda" size="lg" className="mt-8">
          Ir a la tienda
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,8fr)_minmax(0,4fr)] lg:gap-8">
      <div className="glass rounded-[24px] p-2 md:p-3">
        <div className="flex items-center justify-between px-4 pt-4 pb-2 md:px-5">
          <p className="mono-label">{plural(count, "artículo", "artículos")}</p>
          <p className="mono-label">Precio</p>
        </div>
        <ul className="divide-y divide-line">
          {items.map(({ product, qty, lineTotal }) => (
            <li
              key={product.slug}
              className="grid grid-cols-[80px_minmax(0,1fr)] gap-4 px-4 py-5 sm:grid-cols-[104px_minmax(0,1fr)_auto] md:px-5"
            >
              <Link
                href={`/producto/${product.slug}`}
                className="block aspect-square overflow-hidden rounded-2xl border border-line bg-surface/70"
              >
                <Image src={product.image} alt={product.name} width={104} height={104} className="size-full object-contain p-2" />
              </Link>
              <div className="flex min-w-0 flex-col gap-2">
                <Link href={`/producto/${product.slug}`} className="text-[18px] leading-tight font-semibold hover:underline">
                  {product.name}
                </Link>
                <p className="mono-label">
                  {product.sku} · {formatPrice(product.price)} c/u
                </p>
                <div className="mt-auto flex flex-wrap items-center gap-3 pt-1">
                  <div className="glass inline-flex h-10 items-center rounded-full">
                    <button
                      type="button"
                      onClick={() => setQty(product.slug, qty - 1)}
                      className={`${qtyButton} rounded-l-full`}
                      aria-label={`Menos ${product.name}`}
                    >
                      <Minus className="size-3.5" strokeWidth={1.6} aria-hidden="true" />
                    </button>
                    <span className="w-8 text-center font-mono text-sm tabular" aria-live="polite">
                      {qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQty(product.slug, qty + 1)}
                      disabled={qty >= Math.min(product.stock, 99)}
                      className={`${qtyButton} rounded-r-full`}
                      aria-label={`Más ${product.name}`}
                    >
                      <Plus className="size-3.5" strokeWidth={1.6} aria-hidden="true" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(product.slug)}
                    className="inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-full px-3 font-mono text-xs text-muted transition-colors hover:text-danger"
                    aria-label={`Quitar ${product.name}`}
                  >
                    <Trash2 className="size-3.5" strokeWidth={1.6} aria-hidden="true" />
                    Quitar
                  </button>
                </div>
              </div>
              <span className="col-start-2 font-mono text-[17px] tabular sm:col-start-3 sm:text-right">{formatPrice(lineTotal)}</span>
            </li>
          ))}
        </ul>
      </div>

      <aside className="glass h-fit rounded-[24px] p-6 md:p-7 lg:sticky lg:top-24">
        <p className="mono-label">Resumen</p>
        <dl className="mt-5 flex flex-col gap-3 text-[16px]">
          <div className="flex justify-between">
            <dt className="text-muted">{plural(count, "artículo", "artículos")}</dt>
            <dd className="font-mono tabular">{formatPrice(t.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Entrega en campus</dt>
            <dd className="font-mono text-pcb">Gratis</dd>
          </div>
          <div className="flex items-baseline justify-between border-t border-line pt-4 text-lg font-semibold">
            <dt>Total</dt>
            <dd className="font-mono text-[22px] tabular">{formatPrice(t.total)}</dd>
          </div>
        </dl>
        <p className="mt-4 text-xs text-muted">
          Envío express fuera del campus: {formatPrice(SHIPPING_EXPRESS)}, gratis a partir de {formatPrice(1500)}.
        </p>
        <ButtonLink href="/checkout" size="lg" className="mt-7 w-full">
          Ir al pago
        </ButtonLink>
        <ButtonLink href="/tienda" variant="glass" className="mt-2.5 w-full">
          Seguir comprando
        </ButtonLink>
      </aside>
    </div>
  );
}
