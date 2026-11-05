import type { Metadata } from "next";
import { Suspense } from "react";
import { User } from "lucide-react";
import { DemoNotice, RegisterForm } from "@/components/forms/auth-forms";
import { FormSkeleton } from "@/components/forms/form-skeleton";
import { supabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = { title: "Crear cuenta" };

export default function RegistroPage() {
  return (
    <div className="wrap py-14 md:py-20">
      <div className="mx-auto max-w-lg text-center">
        {/* Misma tipografía y tamaño que los títulos de la portada, centrado. */}
        <h1 className="text-[clamp(36px,5.2vw,72px)] font-semibold tracking-[-0.03em]">Crea tu cuenta</h1>
        <p className="mx-auto mt-5 max-w-[40ch] text-[19px] text-muted">
          Pedidos guardados, avisos de recogida y precios para estudiantes.
        </p>
        <div className="glass mt-10 rounded-[28px] p-6 text-left md:p-8">
          <span className="mx-auto mb-6 grid size-14 place-items-center rounded-full bg-copper-soft text-copper">
            <User className="size-6" strokeWidth={1.6} aria-hidden="true" />
          </span>
          <DemoNotice configured={supabaseConfigured} />
          <Suspense fallback={<FormSkeleton rows={4} />}>
            <RegisterForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
