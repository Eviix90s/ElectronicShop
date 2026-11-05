"use server";

import { z } from "zod";

const schema = z.object({
  nombre: z.string().trim().min(2, "Escribe tu nombre").max(80),
  correo: z.string().trim().email("Escribe un correo válido"),
  asunto: z.string().trim().min(3, "Cuéntanos de qué se trata").max(120),
  mensaje: z.string().trim().min(10, "Escribe al menos 10 caracteres").max(2000),
  // honeypot: los bots lo rellenan, las personas no lo ven
  empresa: z.string().max(0).optional(),
});

export interface ContactState {
  ok: boolean;
  errors?: Partial<Record<"nombre" | "correo" | "asunto" | "mensaje", string>>;
  message?: string;
}

export async function sendContact(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const errors: ContactState["errors"] = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as keyof NonNullable<ContactState["errors"]>;
      if (key && !errors[key]) errors[key] = issue.message;
    }
    return { ok: false, errors };
  }
  if (parsed.data.empresa) return { ok: true }; // bot: fingimos éxito

  const { nombre, correo, asunto, mensaje } = parsed.data;
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;

  if (apiKey && to) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "ElectronicShop <contacto@electronicshop.mx>",
        to: [to],
        reply_to: correo,
        subject: `[Contacto] ${asunto}`,
        text: `De: ${nombre} <${correo}>\n\n${mensaje}`,
      }),
    });
    if (!res.ok) {
      return { ok: false, message: "No pudimos enviar tu mensaje. Intenta de nuevo o escríbenos por correo." };
    }
  } else {
    console.info("[contacto] mensaje recibido (sin RESEND_API_KEY):", { nombre, correo, asunto });
  }
  return { ok: true, message: "Recibimos tu mensaje. Te respondemos el mismo día hábil." };
}
