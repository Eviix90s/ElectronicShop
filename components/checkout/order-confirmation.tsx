"use client";

import { useMemo, useSyncExternalStore } from "react";
import Image from "next/image";
import { Check, Clock, CreditCard, MapPin } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { resolveLines } from "@/lib/cart/totals";
import type { Order } from "@/lib/data/types";
import { site } from "@/lib/data";
import { formatPrice } from "@/lib/utils";

const paymentLabel: Record<Order["payment"], string> = {
  tarjeta: "Tarjeta (enlace de pago por correo)",
  paypal: "PayPal (enlace de pago por correo)",
  efectivo: "Efectivo al recoger",
};

const subscribe = () => () => {};

/** Confirmación del pedido: detalle en una tarjeta de vidrio y resumen al lado. */
export function OrderConfirmation({ id }: { id: string }) {
  // En el servidor no hay sessionStorage (undefined → esqueleto); en el cliente se lee una vez hidratado.
  const raw = useSyncExternalStore(
    subscribe,
    () => {
      try {
        return sessionStorage.getItem(`electronicshop-order-${id}`);
      } catch {
        return null;
      }
    },
    () => undefined,
  );
  const state = useMemo<{ order: Order; persisted?: boolean } | null | undefined>(() => {
    if (raw === undefined) return undefined;
    if (raw === null) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }, [raw]);

  if (state === undefined) return <div className="mt-10 h-56 animate-pulse rounded-[24px] border border-line bg-surface" />;

  const order = state?.order;
  const items = order ? resolveLines(order.lines) : [];

  return (
    <div className="mt-10 grid gap-6 md:mt-12 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-8">
      <div className="glass rounded-[24px] p-6 md:p-8">
        <div className="flex items-center gap-4">
          <span className="grid size-14 shrink-0 place-items-center rounded-full bg-pcb-soft text-pcb">
            <Check className="size-7" strokeWidth={2} aria-hidden="true" />
          </span>
          <div>
            <p className="text-[24px] leading-tight font-semibold">Pedido registrado</p>
            <p className="mt-1 font-mono text-sm text-muted">Número {id}</p>
          </div>
        </div>

        {order ? (
          <>
            <ul className="mt-8 flex flex-col divide-y divide-line border-t border-line">
              <li className="flex items-start gap-4 py-5">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-copper-soft text-copper">
                  {order.delivery === "campus" ? (
                    <MapPin className="size-5" strokeWidth={1.6} aria-hidden="true" />
                  ) : (
                    <Clock className="size-5" strokeWidth={1.6} aria-hidden="true" />
                  )}
                </span>
                <span className="pt-1">
                  {order.delivery === "campus" ? (
                    <>
                      <strong>Recoge en campus</strong> en menos de 24 horas. Te avisamos a {order.email} cuando esté listo.
                      <span className="mt-1.5 block text-sm text-muted">
                        {site.addresses[0]} · {site.hours}
                      </span>
                    </>
                  ) : (
                    <>
                      <strong>Envío express</strong> a {order.address}. Llega en 1 a 2 días hábiles.
                    </>
                  )}
                </span>
              </li>
              <li className="flex items-start gap-4 py-5">
                <span className="grid size-11 shrink-0 place-items-center rounded-full bg-copper-soft text-copper">
                  <CreditCard className="size-5" strokeWidth={1.6} aria-hidden="true" />
                </span>
                <span className="pt-1">
                  <strong>Pago:</strong> {paymentLabel[order.payment]}
                  {order.payment !== "efectivo" ? (
                    <span className="mt-1.5 block text-sm text-muted">
                      El pago en línea se activa al conectar Mercado Pago; mientras tanto te enviamos el enlace manualmente.
                    </span>
                  ) : null}
                </span>
              </li>
            </ul>
            {!state?.persisted ? (
              <p className="mt-6 rounded-xl border border-copper-soft bg-copper-soft/50 px-4 py-3 text-sm text-copper">
                Modo demostración: el pedido no se guardó en una base de datos porque Supabase aún no está conectado.
              </p>
            ) : null}
          </>
        ) : (
          <p className="mt-6 text-muted">
            No tenemos el detalle de este pedido en este navegador. Si tienes cuenta, lo encontrarás en Mi cuenta.
          </p>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonLink href="/tienda" size="lg">
            Seguir comprando
          </ButtonLink>
          <ButtonLink href="/mi-cuenta" variant="glass" size="lg">
            Ver mis pedidos
          </ButtonLink>
        </div>
      </div>

      {order ? (
        <aside className="glass h-fit rounded-[24px] p-6 md:p-7">
          <p className="mono-label">Resumen</p>
          <ul className="mt-5 flex flex-col gap-3.5 border-b border-line pb-5">
            {items.map((i) => (
              <li key={i.product.slug} className="flex items-center gap-3 text-[15px]">
                <Image
                  src={i.product.image}
                  alt=""
                  width={48}
                  height={48}
                  className="size-12 rounded-xl border border-line bg-surface/70 object-contain p-1.5"
                />
                <span className="min-w-0 flex-1 truncate">
                  {i.product.name} <span className="font-mono text-muted">× {i.qty}</span>
                </span>
                <span className="font-mono tabular">{formatPrice(i.lineTotal)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-5 flex flex-col gap-3 text-[16px]">
            <div className="flex justify-between">
              <dt className="text-muted">Subtotal</dt>
              <dd className="font-mono tabular">{formatPrice(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Entrega</dt>
              <dd className="font-mono tabular">{order.shipping === 0 ? "Gratis" : formatPrice(order.shipping)}</dd>
            </div>
            <div className="flex items-baseline justify-between border-t border-line pt-4 text-lg font-semibold">
              <dt>Total</dt>
              <dd className="font-mono text-[22px] tabular">{formatPrice(order.total)}</dd>
            </div>
          </dl>
        </aside>
      ) : null}
    </div>
  );
}
