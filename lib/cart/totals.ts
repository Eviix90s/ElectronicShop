import { getProductBySlug } from "@/lib/data";
import type { CartLine, DeliveryMethod, Product } from "@/lib/data/types";

export const SHIPPING_EXPRESS = 99;

export interface CartItem {
  product: Product;
  qty: number;
  lineTotal: number;
}

/** Resuelve las líneas del carrito contra el catálogo (ignora slugs que ya no existen). */
export function resolveLines(lines: CartLine[]): CartItem[] {
  return lines.flatMap((l) => {
    const product = getProductBySlug(l.slug);
    if (!product) return [];
    const qty = Math.max(1, Math.min(99, Math.floor(l.qty)));
    return [{ product, qty, lineTotal: Math.round(product.price * qty * 100) / 100 }];
  });
}

export function shippingFor(delivery: DeliveryMethod, subtotal: number) {
  if (delivery === "campus") return 0;
  return subtotal >= 1500 ? 0 : SHIPPING_EXPRESS;
}

export function totals(items: CartItem[], delivery: DeliveryMethod) {
  const subtotal = Math.round(items.reduce((n, i) => n + i.lineTotal, 0) * 100) / 100;
  const shipping = shippingFor(delivery, subtotal);
  return { subtotal, shipping, total: Math.round((subtotal + shipping) * 100) / 100 };
}
