"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/env";

export interface AuthState {
  ok: boolean;
  message?: string;
  errors?: Partial<Record<"email" | "password" | "name" | "program", string>>;
}

const notConfigured: AuthState = {
  ok: false,
  message: "Las cuentas se activan cuando se conecte Supabase (variables NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY).",
};

function safeNext(value: FormDataEntryValue | null) {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/") && !next.startsWith("//") ? next : "/mi-cuenta";
}

const loginSchema = z.object({
  email: z.string().trim().email("Escribe un correo válido"),
  password: z.string().min(8, "La contraseña tiene al menos 8 caracteres"),
});

export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  if (!supabaseConfigured) return notConfigured;
  const parsed = loginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) {
    return { ok: false, errors: Object.fromEntries(parsed.error.issues.map((i) => [i.path[0], i.message])) };
  }
  const supabase = (await createClient())!;
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) return { ok: false, message: "Correo o contraseña incorrectos." };
  redirect(safeNext(formData.get("next")));
}

const registerSchema = z.object({
  name: z.string().trim().min(2, "Escribe tu nombre").max(80),
  email: z.string().trim().email("Escribe un correo válido"),
  password: z.string().min(8, "Usa al menos 8 caracteres"),
  program: z.string().trim().max(80).optional(),
});

export async function signUp(_prev: AuthState, formData: FormData): Promise<AuthState> {
  if (!supabaseConfigured) return notConfigured;
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    program: formData.get("program") || undefined,
  });
  if (!parsed.success) {
    return { ok: false, errors: Object.fromEntries(parsed.error.issues.map((i) => [i.path[0], i.message])) };
  }
  const supabase = (await createClient())!;
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: { data: { full_name: parsed.data.name, program: parsed.data.program ?? null } },
  });
  if (error) return { ok: false, message: error.message.includes("registered") ? "Ese correo ya tiene cuenta. Inicia sesión." : "No pudimos crear la cuenta. Intenta de nuevo." };
  if (data.session) redirect("/mi-cuenta");
  return { ok: true, message: "Te enviamos un correo para confirmar tu cuenta. Revisa tu bandeja y vuelve a iniciar sesión." };
}

export async function signOut() {
  const supabase = await createClient();
  if (supabase) await supabase.auth.signOut();
  redirect("/");
}
