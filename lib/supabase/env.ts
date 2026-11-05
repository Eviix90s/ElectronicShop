export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/**
 * Mientras el cliente no cree su proyecto de Supabase, la app corre en modo
 * demostración: catálogo desde lib/data, carrito en el navegador y pedidos sin
 * persistir. Las pantallas de cuenta muestran un aviso en lugar de fallar.
 */
export const supabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
