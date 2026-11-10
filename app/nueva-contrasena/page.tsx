import type { Metadata } from "next";
import { Suspense } from "react";
import { KeyRound } from "lucide-react";
import { NewPasswordForm } from "@/components/forms/auth-forms";
import { FormSkeleton } from "@/components/forms/form-skeleton";

export const metadata: Metadata = { title: "Contraseña nueva", robots: { index: false } };

/** Llega aquí desde el enlace del correo de recuperación; el proxy exige sesión. */
export default function NuevaContrasenaPage() {
  return (
    <div className="wrap py-14 md:py-20">
      <div className="mx-auto max-w-lg text-center">
        <h1 className="text-[clamp(36px,5.2vw,72px)] font-semibold tracking-[-0.03em]">Contraseña nueva</h1>
        <p className="mx-auto mt-5 max-w-[40ch] text-[19px] text-muted">Elige una contraseña que no uses en otro sitio.</p>
        <div className="glass mt-10 rounded-[28px] p-6 text-left md:p-8">
          <span className="mx-auto mb-6 grid size-14 place-items-center rounded-full bg-copper-soft text-copper">
            <KeyRound className="size-6" strokeWidth={1.6} aria-hidden="true" />
          </span>
          <Suspense fallback={<FormSkeleton rows={2} />}>
            <NewPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
