"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/env";
import { siteUrl } from "@/lib/site-url";
import { safePath } from "@/lib/utils";

export interface AuthState {
  ok: boolean;
  message?: string;
  errors?: Partial<Record<"email" | "password" | "name" | "program" | "confirm", string>>;
}

const notConfigured: AuthState = {
  ok: false,
  message: "Las cuentas se activan cuando se conecte Supabase (variables NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY).",
};

function fieldErrors(issues: z.ZodIssue[]): AuthState {
  return { ok: false, errors: Object.fromEntries(issues.map((i) => [i.path[0], i.message])) };
}

const loginSchema = z.object({
  email: z.string().trim().email("Escribe un correo válido"),
  password: z.string().min(8, "La contraseña tiene al menos 8 caracteres").max(72),
});

export async function signIn(_prev: AuthState, formData: FormData): Promise<AuthState> {
  if (!supabaseConfigured) return notConfigured;
  const parsed = loginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return fieldErrors(parsed.error.issues);
  const supabase = (await createClient())!;
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    return {
      ok: false,
      message:
        error.code === "email_not_confirmed"
          ? "Confirma tu correo antes de entrar. Revisa tu bandeja."
          : "Correo o contraseña incorrectos.",
    };
  }
  redirect(safePath(formData.get("next")));
}

const registerSchema = z.object({
  name: z.string().trim().min(2, "Escribe tu nombre").max(80),
  email: z.string().trim().email("Escribe un correo válido").max(254),
  password: z.string().min(8, "Usa al menos 8 caracteres").max(72, "Usa máximo 72 caracteres"),
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
  if (!parsed.success) return fieldErrors(parsed.error.issues);
  const supabase = (await createClient())!;
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.name, program: parsed.data.program ?? null },
      // El enlace del correo vuelve a /auth/confirm, que abre la sesión.
      emailRedirectTo: `${siteUrl}/auth/confirm?next=/mi-cuenta`,
    },
  });
  if (error) {
    return {
      ok: false,
      message:
        error.code === "weak_password"
          ? "Esa contraseña es muy débil. Usa letras y números."
          : error.code === "user_already_exists"
            ? "Ese correo ya tiene cuenta. Inicia sesión o recupera tu contraseña."
            : "No pudimos crear la cuenta. Intenta de nuevo.",
    };
  }
  // Sin confirmación por correo, Supabase devuelve la sesión y la cuenta entra directo.
  if (data.session) redirect("/mi-cuenta");
  // Mismo mensaje si el correo ya existía: no revela qué correos tienen cuenta.
  return { ok: true, message: "Te enviamos un correo para confirmar tu cuenta. Revisa tu bandeja y vuelve a iniciar sesión." };
}

const resetSchema = z.object({ email: z.string().trim().email("Escribe un correo válido").max(254) });

export async function requestPasswordReset(_prev: AuthState, formData: FormData): Promise<AuthState> {
  if (!supabaseConfigured) return notConfigured;
  const parsed = resetSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return fieldErrors(parsed.error.issues);
  const supabase = (await createClient())!;
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${siteUrl}/auth/confirm?next=/nueva-contrasena`,
  });
  // Misma respuesta exista o no la cuenta: no revela qué correos están registrados.
  return { ok: true, message: "Si ese correo tiene cuenta, te enviamos un enlace para crear una contraseña nueva." };
}

const newPasswordSchema = z
  .object({
    password: z.string().min(8, "Usa al menos 8 caracteres").max(72, "Usa máximo 72 caracteres"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { path: ["confirm"], message: "Las contraseñas no coinciden" });

export async function updatePassword(_prev: AuthState, formData: FormData): Promise<AuthState> {
  if (!supabaseConfigured) return notConfigured;
  const parsed = newPasswordSchema.safeParse({ password: formData.get("password"), confirm: formData.get("confirm") });
  if (!parsed.success) return fieldErrors(parsed.error.issues);
  const supabase = (await createClient())!;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "El enlace venció. Pide uno nuevo desde «¿Olvidaste tu contraseña?»." };
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    return {
      ok: false,
      message:
        error.code === "same_password"
          ? "Usa una contraseña distinta a la anterior."
          : error.code === "weak_password"
            ? "Esa contraseña es muy débil. Usa letras y números."
            : "No pudimos cambiar la contraseña. Intenta de nuevo.",
    };
  }
  redirect("/mi-cuenta");
}

export async function signOut() {
  const supabase = await createClient();
  if (supabase) await supabase.auth.signOut();
  redirect("/");
}
