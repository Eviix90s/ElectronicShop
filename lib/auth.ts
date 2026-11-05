import "server-only";
import { createClient } from "@/lib/supabase/server";

export interface CurrentUser {
  id: string;
  email: string;
  name: string;
}

/**
 * Lee la sesión actual. Debe usarse dentro de un límite de Suspense
 * (lee cookies). Devuelve null si no hay sesión o si Supabase no está configurado.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createClient();
  if (!supabase) return null;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const name =
    (user.user_metadata?.full_name as string | undefined) ??
    user.email?.split("@")[0] ??
    "Estudiante";
  return { id: user.id, email: user.email ?? "", name };
}
