import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { SUPABASE_ANON_KEY, SUPABASE_URL, supabaseConfigured } from "./env";

/**
 * Cliente para Server Components, Server Actions y Route Handlers.
 * Lee cookies(), así que solo puede llamarse dentro de un límite de Suspense
 * o de una acción. Devuelve null si Supabase no está configurado.
 */
export async function createClient() {
  if (!supabaseConfigured) return null;
  // El cliente lee la hora para revisar la sesión (Date.now()); eso no se permite en
  // la precarga con Cache Components, así que todo lo que usa Supabase espera a la visita real.
  await connection();
  const cookieStore = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Llamado desde un Server Component: el proxy refresca la sesión.
        }
      },
    },
  });
}
