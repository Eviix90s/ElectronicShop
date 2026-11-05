"use client";

import { useActionState } from "react";
import { Check, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { sendContact, type ContactState } from "@/app/contacto/actions";

const initial: ContactState = { ok: false };

export function ContactForm() {
  const [state, action, pending] = useActionState(sendContact, initial);

  if (state.ok) {
    return (
      <div className="glass flex flex-col items-start gap-4 rounded-[20px] p-7" role="status">
        <span className="grid size-11 place-items-center rounded-full bg-pcb-soft text-pcb">
          <Check className="size-5" strokeWidth={2} aria-hidden="true" />
        </span>
        <p className="text-xl font-semibold">Mensaje enviado</p>
        <p className="text-muted">{state.message ?? "Te respondemos el mismo día hábil."}</p>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Nombre" htmlFor="nombre" error={state.errors?.nombre}>
          <Input id="nombre" name="nombre" autoComplete="name" required aria-invalid={Boolean(state.errors?.nombre)} />
        </Field>
        <Field label="Correo" htmlFor="correo" error={state.errors?.correo}>
          <Input id="correo" name="correo" type="email" autoComplete="email" required aria-invalid={Boolean(state.errors?.correo)} />
        </Field>
      </div>
      <Field label="Asunto" htmlFor="asunto" error={state.errors?.asunto}>
        <Input id="asunto" name="asunto" placeholder="Qué componente buscas o en qué te ayudamos" required aria-invalid={Boolean(state.errors?.asunto)} />
      </Field>
      <Field label="Mensaje" htmlFor="mensaje" error={state.errors?.mensaje}>
        <Textarea id="mensaje" name="mensaje" required aria-invalid={Boolean(state.errors?.mensaje)} />
      </Field>
      <div className="hidden" aria-hidden="true">
        <label htmlFor="empresa">Empresa</label>
        <input id="empresa" name="empresa" tabIndex={-1} autoComplete="off" />
      </div>
      {state.message && !state.ok ? (
        <p className="text-sm text-danger" role="alert">
          {state.message}
        </p>
      ) : null}
      <Button type="submit" disabled={pending} className="self-start">
        <Send className="size-4" strokeWidth={1.6} aria-hidden="true" />
        {pending ? "Enviando…" : "Enviar mensaje"}
      </Button>
    </form>
  );
}
