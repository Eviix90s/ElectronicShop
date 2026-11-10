"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Info, KeyRound, LogIn, MailCheck, UserPlus } from "lucide-react";
import { requestPasswordReset, signIn, signUp, updatePassword, type AuthState } from "@/app/auth/actions";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";

const initial: AuthState = { ok: false };

export function DemoNotice({ configured }: { configured: boolean }) {
  if (configured) return null;
  return (
    <p className="mb-6 flex gap-3 rounded-xl border border-copper-soft bg-copper-soft/50 px-4 py-3 text-sm text-copper">
      <Info className="mt-0.5 size-4 shrink-0" strokeWidth={1.6} aria-hidden="true" />
      Modo demostración: las cuentas se activan al conectar Supabase. El formulario ya está listo.
    </p>
  );
}

function Message({ state }: { state: AuthState }) {
  if (!state.message) return null;
  return (
    <p className={state.ok ? "text-sm text-pcb" : "text-sm text-danger"} role={state.ok ? "status" : "alert"}>
      {state.message}
    </p>
  );
}

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(signIn, initial);
  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <input type="hidden" name="next" value={next ?? "/mi-cuenta"} />
      <Field label="Correo" htmlFor="email" error={state.errors?.email}>
        <Input id="email" name="email" type="email" autoComplete="email" required aria-invalid={Boolean(state.errors?.email)} />
      </Field>
      <Field label="Contraseña" htmlFor="password" error={state.errors?.password}>
        <Input id="password" name="password" type="password" autoComplete="current-password" required aria-invalid={Boolean(state.errors?.password)} />
      </Field>
      <Link href="/recuperar" className="-mt-2 self-end text-sm text-muted underline underline-offset-4 hover:text-ink">
        ¿Olvidaste tu contraseña?
      </Link>
      <Message state={state} />
      <Button type="submit" size="lg" disabled={pending} className="w-full">
        <LogIn className="size-[18px]" strokeWidth={1.7} aria-hidden="true" />
        {pending ? "Entrando…" : "Iniciar sesión"}
      </Button>
      <p className="text-center text-sm text-muted">
        ¿Primera vez?{" "}
        <Link href="/registro" className="text-ink underline underline-offset-4">
          Crea tu cuenta
        </Link>
      </p>
    </form>
  );
}

const programs = [
  "Ingeniería Electrónica",
  "Ingeniería en Sistemas",
  "Ingeniería Mecatrónica",
  "Ingeniería Eléctrica",
  "Ingeniería en Computación",
  "Otra carrera",
];

export function RegisterForm() {
  const [state, action, pending] = useActionState(signUp, initial);
  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <Field label="Nombre completo" htmlFor="name" error={state.errors?.name}>
        <Input id="name" name="name" autoComplete="name" required aria-invalid={Boolean(state.errors?.name)} />
      </Field>
      <Field label="Correo institucional" htmlFor="email" hint="Con tu correo de la universidad accedes a precios de estudiante." error={state.errors?.email}>
        <Input id="email" name="email" type="email" autoComplete="email" placeholder="nombre@alumnos.edu.mx" required aria-invalid={Boolean(state.errors?.email)} />
      </Field>
      <Field label="Contraseña" htmlFor="password" hint="Mínimo 8 caracteres." error={state.errors?.password}>
        <Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required aria-invalid={Boolean(state.errors?.password)} />
      </Field>
      <Field label="Carrera" htmlFor="program" error={state.errors?.program}>
        <Select id="program" name="program" defaultValue="">
          <option value="">Elige una opción</option>
          {programs.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </Select>
      </Field>
      <Message state={state} />
      <Button type="submit" size="lg" disabled={pending} className="w-full">
        <UserPlus className="size-[18px]" strokeWidth={1.7} aria-hidden="true" />
        {pending ? "Creando cuenta…" : "Crear cuenta"}
      </Button>
      <p className="text-center text-sm text-muted">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="text-ink underline underline-offset-4">
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}

export function ResetRequestForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, initial);
  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <Field label="Correo de tu cuenta" htmlFor="email" error={state.errors?.email}>
        <Input id="email" name="email" type="email" autoComplete="email" required aria-invalid={Boolean(state.errors?.email)} />
      </Field>
      <Message state={state} />
      <Button type="submit" size="lg" disabled={pending} className="w-full">
        <MailCheck className="size-[18px]" strokeWidth={1.7} aria-hidden="true" />
        {pending ? "Enviando…" : "Enviar enlace"}
      </Button>
      <p className="text-center text-sm text-muted">
        ¿La recordaste?{" "}
        <Link href="/login" className="text-ink underline underline-offset-4">
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}

export function NewPasswordForm() {
  const [state, action, pending] = useActionState(updatePassword, initial);
  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <Field label="Contraseña nueva" htmlFor="password" hint="Mínimo 8 caracteres." error={state.errors?.password}>
        <Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required aria-invalid={Boolean(state.errors?.password)} />
      </Field>
      <Field label="Repite la contraseña" htmlFor="confirm" error={state.errors?.confirm}>
        <Input id="confirm" name="confirm" type="password" autoComplete="new-password" minLength={8} required aria-invalid={Boolean(state.errors?.confirm)} />
      </Field>
      <Message state={state} />
      <Button type="submit" size="lg" disabled={pending} className="w-full">
        <KeyRound className="size-[18px]" strokeWidth={1.7} aria-hidden="true" />
        {pending ? "Guardando…" : "Guardar contraseña"}
      </Button>
    </form>
  );
}
