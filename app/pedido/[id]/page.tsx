import type { Metadata } from "next";
import { Suspense } from "react";
import { OrderConfirmation } from "@/components/checkout/order-confirmation";

export const metadata: Metadata = { title: "Pedido registrado", robots: { index: false } };

type Params = Promise<{ id: string }>;

export default function PedidoPage({ params }: { params: Params }) {
  return (
    <div className="wrap py-14 md:py-20">
      <p className="eyebrow">Confirmación</p>
      {/* Misma tipografía, tamaño y posición que los títulos de la portada. */}
      <h1 className="mt-5 max-w-[14ch] text-[clamp(40px,5.2vw,72px)] font-semibold tracking-[-0.03em]">
        Listo, ya lo tenemos.
      </h1>
      {/* params se lee dentro de Suspense: con Cache Components el resto de la página se prerenderiza. */}
      <Suspense fallback={<div className="mt-8 h-48 animate-pulse rounded-md border border-line bg-surface" />}>
        <Confirmation params={params} />
      </Suspense>
    </div>
  );
}

async function Confirmation({ params }: { params: Params }) {
  const { id } = await params;
  return <OrderConfirmation id={decodeURIComponent(id)} />;
}
