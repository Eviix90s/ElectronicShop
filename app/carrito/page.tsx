import type { Metadata } from "next";
import { CartView } from "@/components/cart/cart-view";

export const metadata: Metadata = { title: "Carrito" };

export default function CarritoPage() {
  return (
    <div className="wrap py-14 md:py-20">
      <p className="eyebrow">Carrito</p>
      {/* Misma tipografía, tamaño y posición que los títulos de la portada. */}
      <h1 className="mt-5 max-w-[14ch] text-[clamp(36px,5.2vw,72px)] font-semibold tracking-[-0.03em]">
        Tu lista de materiales
      </h1>
      <CartView />
    </div>
  );
}
