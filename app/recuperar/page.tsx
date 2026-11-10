import type { Metadata } from "next";
import { Suspense } from "react";
import { KeyRound } from "lucide-react";
import { DemoNotice, ResetRequestForm } from "@/components/forms/auth-forms";
import { FormSkeleton } from "@/components/forms/form-skeleton";
import { supabaseConfigured } from "@/lib/supabase/env";

export const metadata: Metadata = { title: "Recuperar contraseña", robots: { index: false } };

export default function RecuperarPage() {
  return (
    <div className="wrap py-14 md:py-20">
      <div className="mx-auto max-w-lg text-center">
        <h1 className="text-[clamp(36px,5.2vw,72px)] font-semibold tracking-[-0.03em]">Recupera tu acceso</h1>
        <p className="mx-auto mt-5 max-w-[40ch] text-[19px] text-muted">
          Te enviamos un enlace para crear una contraseña nueva.
        </p>
        <div className="glass mt-10 rounded-[28px] p-6 text-left md:p-8">
          <span className="mx-auto mb-6 grid size-14 place-items-center rounded-full bg-copper-soft text-copper">
            <KeyRound className="size-6" strokeWidth={1.6} aria-hidden="true" />
          </span>
          <DemoNotice configured={supabaseConfigured} />
          <Suspense fallback={<FormSkeleton rows={1} />}>
            <ResetRequestForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
