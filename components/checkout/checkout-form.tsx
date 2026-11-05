"use client";

import { useState, useTransition, type FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Banknote, CreditCard, MapPin, ShoppingBag, Store, Wallet } from "lucide-react";
import { createOrder, type CreateOrderResult, type OrderInputPayload } from "@/app/checkout/actions";
import { Button, ButtonLink } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { useCart } from "@/lib/cart/store";
import { resolveLines, totals, SHIPPING_EXPRESS } from "@/lib/cart/totals";
import type { DeliveryMethod, PaymentMethod } from "@/lib/data/types";
import { cn, formatPrice } from "@/lib/utils";

const deliveryOptions: { value: DeliveryMethod; title: string; text: string; icon: typeof Store }[] = [
  { value: "campus", title: "Recoger en campus", text: "Gratis. Listo en menos de 24 h en el punto de entrega.", icon: Store },
  { value: "envio", title: "Envío express", text: `${formatPrice(SHIPPING_EXPRESS)}, gratis desde ${formatPrice(1500)}. 1 a 2 días.`, icon: MapPin },
];

const paymentOptions: { value: PaymentMethod; title: string; text: string; icon: typeof CreditCard }[] = [
  { value: "tarjeta", title: "Tarjeta de crédito o débito", text: "Recibes un enlace seguro de pago por correo.", icon: CreditCard },
  { value: "paypal", title: "PayPal", text: "Recibes un enlace de pago por correo.", icon: Wallet },
  { value: "efectivo", title: "Efectivo al recoger", text: "Pagas en el punto de entrega del campus.", icon: Banknote },
];

/** Bloque del formulario: tarjeta de vidrio con etiqueta y título. */
function Block({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <fieldset className="glass rounded-[24px] p-6 md:p-7">
      <legend className="sr-only">{eyebrow}</legend>
      <p className="mono-label">{eyebrow}</p>
      <p className="mt-1.5 text-[22px] font-semibold">{title}</p>
      <div className="mt-6">{children}</div>
    </fieldset>
  );
}

/** Opción de entrega o pago: tarjeta de vidrio que se enmarca en tinta al elegirla. */
function Option({
  checked,
  onChange,
  name,
  value,
  icon: Icon,
  title,
  text,
}: {
  checked: boolean;
  onChange: () => void;
  name: string;
  value: string;
  icon: typeof Store;
  title: string;
  text: string;
}) {
  return (
    <label
      className={cn(
        "glass flex cursor-pointer gap-4 rounded-2xl p-4 transition-[outline-color] md:p-5",
        checked ? "outline-2 -outline-offset-1 outline-ink" : "outline-2 -outline-offset-1 outline-transparent",
      )}
    >
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} className="sr-only" />
      <span
        className={cn(
          "grid size-11 shrink-0 place-items-center rounded-full transition-colors",
          checked ? "bg-ink text-bg" : "bg-copper-soft text-copper",
        )}
      >
        <Icon className="size-5" strokeWidth={1.6} aria-hidden="true" />
      </span>
      <span className="min-w-0 pt-0.5">
        <span className="block font-semibold">{title}</span>
        <span className="mt-0.5 block text-sm text-muted">{text}</span>
      </span>
    </label>
  );
}

export function CheckoutForm({ defaultEmail, defaultName }: { defaultEmail?: string; defaultName?: string }) {
  const router = useRouter();
  const lines = useCart((s) => s.lines);
  const hydrated = useCart((s) => s.hydrated);
  const clear = useCart((s) => s.clear);
  const [delivery, setDelivery] = useState<DeliveryMethod>("campus");
  const [payment, setPayment] = useState<PaymentMethod>("efectivo");
  const [result, setResult] = useState<CreateOrderResult | null>(null);
  const [pending, startTransition] = useTransition();

  const items = resolveLines(lines);
  const t = totals(items, delivery);

  if (!hydrated) return <div className="h-72 animate-pulse rounded-[24px] border border-line bg-surface" />;
  if (!items.length) {
    return (
      <div className="glass rounded-[28px] px-6 py-16 text-center md:py-20">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-copper-soft text-copper">
          <ShoppingBag className="size-6" strokeWidth={1.6} aria-hidden="true" />
        </span>
        <p className="mt-6 text-[24px] font-semibold">No hay nada que pagar todavía.</p>
        <p className="mx-auto mt-2 max-w-[44ch] text-[17px] text-muted">Añade productos al carrito y vuelve aquí.</p>
        <ButtonLink href="/tienda" size="lg" className="mt-8">
          Ir a la tienda
        </ButtonLink>
      </div>
    );
  }

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload: OrderInputPayload = {
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      delivery,
      address: String(fd.get("address") ?? "") || undefined,
      payment,
      notes: String(fd.get("notes") ?? "") || undefined,
      lines: items.map((i) => ({ slug: i.product.slug, qty: i.qty })),
    };
    startTransition(async () => {
      const res = await createOrder(payload);
      setResult(res);
      if (res.ok && res.order) {
        try {
          sessionStorage.setItem(`electronicshop-order-${res.order.id}`, JSON.stringify({ order: res.order, persisted: res.persisted }));
        } catch {}
        clear();
        router.push(`/pedido/${encodeURIComponent(res.order.id)}`);
      }
    });
  }

  const errors = result?.errors ?? {};

  return (
    <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-8" noValidate>
      <div className="flex flex-col gap-6">
        <Block eyebrow="Tus datos" title="A quién le entregamos.">
          <div className="flex flex-col gap-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Nombre completo" htmlFor="name" error={errors.name}>
                <Input id="name" name="name" autoComplete="name" defaultValue={defaultName} required />
              </Field>
              <Field label="Teléfono" htmlFor="phone" error={errors.phone}>
                <Input id="phone" name="phone" type="tel" autoComplete="tel" placeholder="55 1234 5678" required />
              </Field>
            </div>
            <Field label="Correo" htmlFor="email" hint="Te enviamos la confirmación y el aviso de recogida." error={errors.email}>
              <Input id="email" name="email" type="email" autoComplete="email" defaultValue={defaultEmail} required />
            </Field>
          </div>
        </Block>

        <Block eyebrow="Entrega" title="Dónde lo recoges.">
          <div className="grid gap-3 sm:grid-cols-2">
            {deliveryOptions.map((o) => (
              <Option
                key={o.value}
                name="delivery"
                value={o.value}
                checked={delivery === o.value}
                onChange={() => setDelivery(o.value)}
                icon={o.icon}
                title={o.title}
                text={o.text}
              />
            ))}
          </div>
          {delivery === "envio" ? (
            <Field label="Dirección de envío" htmlFor="address" className="mt-5" error={errors.address}>
              <Textarea id="address" name="address" autoComplete="street-address" className="min-h-24" placeholder="Calle, número, colonia, código postal y ciudad" />
            </Field>
          ) : null}
        </Block>

        <Block eyebrow="Pago" title="Cómo prefieres pagar.">
          <div className="grid gap-3">
            {paymentOptions.map((o) => (
              <Option
                key={o.value}
                name="payment"
                value={o.value}
                checked={payment === o.value}
                onChange={() => setPayment(o.value)}
                icon={o.icon}
                title={o.title}
                text={o.text}
              />
            ))}
          </div>
          <Field label="Notas para el equipo (opcional)" htmlFor="notes" className="mt-6">
            <Textarea id="notes" name="notes" className="min-h-24" placeholder="Materia, profesor, hora a la que puedes recoger…" />
          </Field>
        </Block>
      </div>

      <aside className="glass h-fit rounded-[24px] p-6 md:p-7 lg:sticky lg:top-24">
        <p className="mono-label">Tu pedido</p>
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
            <dd className="font-mono tabular">{formatPrice(t.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">{delivery === "campus" ? "Entrega en campus" : "Envío express"}</dt>
            <dd className={cn("font-mono tabular", t.shipping === 0 && "text-pcb")}>{t.shipping === 0 ? "Gratis" : formatPrice(t.shipping)}</dd>
          </div>
          <div className="flex items-baseline justify-between border-t border-line pt-4 text-lg font-semibold">
            <dt>Total</dt>
            <dd className="font-mono text-[22px] tabular">{formatPrice(t.total)}</dd>
          </div>
        </dl>
        {result && !result.ok && result.message ? (
          <p className="mt-4 text-sm text-danger" role="alert">
            {result.message}
          </p>
        ) : null}
        <Button type="submit" size="lg" disabled={pending} className="mt-7 w-full">
          {pending ? "Registrando pedido…" : "Confirmar pedido"}
        </Button>
        <p className="mt-4 text-xs text-muted">
          Al confirmar aceptas nuestras condiciones: devolución en 7 días y garantía de 6 meses.
        </p>
      </aside>
    </form>
  );
}
