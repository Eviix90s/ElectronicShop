import type { Metadata } from "next";
import { Suspense } from "react";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Pago" };

export default function CheckoutPage() {
  return (
    <div className="wrap py-14 md:py-20">
      <p className="eyebrow">Pago</p>
      {/* Misma tipografía, tamaño y posición que los títulos de la portada. */}
      <h1 className="mt-5 max-w-[14ch] text-[clamp(36px,5.2vw,72px)] font-semibold tracking-[-0.03em]">
        Confirma tu pedido
      </h1>
      <p className="mt-6 max-w-[52ch] text-[19px] text-muted">
        Sin cuenta obligatoria. Si inicias sesión, el pedido queda guardado en tu historial.
      </p>
      <div className="mt-10 md:mt-12">
        <Suspense fallback={<CheckoutForm />}>
          <PrefilledForm />
        </Suspense>
      </div>
    </div>
  );
}

async function PrefilledForm() {
  const user = await getCurrentUser();
  return <CheckoutForm defaultEmail={user?.email} defaultName={user?.name} />;
}
