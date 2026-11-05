import type { Metadata } from "next";
import { Suspense } from "react";
import { LogIn } from "lucide-react";
import { DemoNotice, LoginForm } from "@/components/forms/auth-forms";
import { FormSkeleton } from "@/components/forms/form-skeleton";
import { supabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = { title: "Iniciar sesión" };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default function LoginPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <div className="wrap py-14 md:py-20">
      <div className="mx-auto max-w-lg text-center">
        {/* Misma tipografía y tamaño que los títulos de la portada, centrado. */}
        <h1 className="text-[clamp(36px,5.2vw,72px)] font-semibold tracking-[-0.03em]">Inicia sesión</h1>
        <p className="mx-auto mt-5 max-w-[40ch] text-[19px] text-muted">
          Guarda tus pedidos y recibe el aviso cuando tu material esté listo.
        </p>
        <div className="glass mt-10 rounded-[28px] p-6 text-left md:p-8">
          <span className="mx-auto mb-6 grid size-14 place-items-center rounded-full bg-copper-soft text-copper">
            <LogIn className="size-6" strokeWidth={1.6} aria-hidden="true" />
          </span>
          <DemoNotice configured={supabaseConfigured} />
          {/* El formulario usa una Server Action: debe ir dentro de Suspense con Cache Components. */}
          <Suspense fallback={<FormSkeleton rows={2} />}>
            <LoginWithNext searchParams={searchParams} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

async function LoginWithNext({ searchParams }: { searchParams: SearchParams }) {
  const next = (await searchParams).next;
  return <LoginForm next={typeof next === "string" ? next : undefined} />;
}
