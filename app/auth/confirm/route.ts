import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { safePath } from "@/lib/utils";

/**
 * Destino de los enlaces de los correos de Supabase (confirmar cuenta y
 * recuperar contraseña). Acepta los dos formatos: token_hash (sirve aunque el
 * correo se abra en otro dispositivo) y code (PKCE, mismo navegador).
 * Al validar, abre la sesión y manda a `next`, siempre una ruta interna.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = safePath(searchParams.get("next"), type === "recovery" ? "/nueva-contrasena" : "/mi-cuenta");
  const code = searchParams.get("code");

  const supabase = await createClient();
  if (supabase && (tokenHash || code)) {
    const { error } =
      tokenHash && type
        ? await supabase.auth.verifyOtp({ type, token_hash: tokenHash })
        : await supabase.auth.exchangeCodeForSession(code ?? "");
    if (!error) return NextResponse.redirect(new URL(next, origin));
  }
  return NextResponse.redirect(new URL("/login?error=enlace", origin));
}
