"use server";

import { z } from "zod";
import { resolveLines, totals } from "@/lib/cart/totals";
import type { Order } from "@/lib/data/types";
import { createClient } from "@/lib/supabase/server";
import { shortId } from "@/lib/utils";

const schema = z
  .object({
    name: z.string().trim().min(2, "Escribe tu nombre completo").max(80),
    email: z.string().trim().email("Escribe un correo válido"),
    phone: z.string().trim().min(8, "Escribe un teléfono válido").max(20),
    delivery: z.enum(["campus", "envio"]),
    address: z.string().trim().max(200).optional(),
    payment: z.enum(["tarjeta", "paypal", "efectivo"]),
    notes: z.string().trim().max(500).optional(),
    lines: z.array(z.object({ slug: z.string(), qty: z.number().int().min(1).max(99) })).min(1, "Tu carrito está vacío"),
  })
  .refine((d) => d.delivery === "campus" || (d.address && d.address.length >= 8), {
    path: ["address"],
    message: "Escribe la dirección de envío",
  });

export type OrderInputPayload = z.input<typeof schema>;

export interface CreateOrderResult {
  ok: boolean;
  order?: Order;
  persisted?: boolean;
  errors?: Partial<Record<keyof OrderInputPayload, string>>;
  message?: string;
}

export async function createOrder(payload: OrderInputPayload): Promise<CreateOrderResult> {
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    const errors: CreateOrderResult["errors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof OrderInputPayload;
      if (key && !errors[key]) errors[key] = issue.message;
    }
    return { ok: false, errors };
  }

  const data = parsed.data;
  // Los precios siempre se recalculan en el servidor a partir del catálogo.
  const items = resolveLines(data.lines);
  if (!items.length) return { ok: false, message: "Tu carrito está vacío." };
  const short = items.find((i) => i.qty > i.product.stock);
  if (short) return { ok: false, message: `Solo quedan ${short.product.stock} unidades de ${short.product.name}.` };

  const t = totals(items, data.delivery);
  const order: Order = {
    id: `ES-${shortId()}`,
    createdAt: new Date().toISOString(),
    status: "pendiente",
    ...data,
    lines: items.map((i) => ({ slug: i.product.slug, qty: i.qty })),
    ...t,
  };

  const supabase = await createClient();
  if (!supabase) {
    return { ok: true, order, persisted: false };
  }

  // create_order() (supabase/migrations/0001_init.sql) valida stock, recalcula
  // totales con precios del catálogo e inserta pedido y renglones de forma atómica.
  const { data: orderId, error } = await supabase.rpc("create_order", {
    p_order: {
      name: data.name,
      email: data.email,
      phone: data.phone,
      delivery: data.delivery,
      address: data.address ?? null,
      payment: data.payment,
      notes: data.notes ?? null,
    },
    p_items: items.map((i) => ({ slug: i.product.slug, qty: i.qty })),
  });

  if (error || !orderId) {
    console.error("[checkout] no se pudo guardar el pedido", error);
    const msg = error?.message ?? "";
    return {
      ok: false,
      message: msg.startsWith("Sin existencias")
        ? msg
        : "No pudimos registrar tu pedido. Intenta de nuevo en un momento.",
    };
  }

  return { ok: true, persisted: true, order: { ...order, id: String(orderId) } };
}
