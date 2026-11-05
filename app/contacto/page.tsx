import type { Metadata } from "next";
import { Suspense } from "react";
import { Clock, Mail, MapPin, Phone, type LucideIcon } from "lucide-react";
import { ContactForm } from "@/components/forms/contact-form";
import { FormSkeleton } from "@/components/forms/form-skeleton";
import { Reveal } from "@/components/motion/reveal";
import { site } from "@/lib/data";

export const metadata: Metadata = {
  title: "Contacto",
  description: "Escríbenos para pedir un componente, resolver una duda técnica o coordinar una entrega en campus.",
};

/** Datos de contacto: icono, etiqueta y una o varias líneas. */
const details: { icon: LucideIcon; label: string; lines: string[]; mono?: boolean }[] = [
  { icon: MapPin, label: "Puntos de entrega", lines: site.addresses },
  { icon: Clock, label: "Horario", lines: [site.hours] },
  { icon: Phone, label: "Teléfono y WhatsApp", lines: [site.phone], mono: true },
  { icon: Mail, label: "Correo", lines: [site.email], mono: true },
];

export default function ContactoPage() {
  return (
    <>
      <section className="wrap py-14 md:py-20">
        <p className="eyebrow">Contacto</p>
        {/* Misma tipografía, tamaño y posición que los títulos de la portada. */}
        <h1 className="mt-5 max-w-[14ch] text-[clamp(36px,5.2vw,72px)] font-semibold tracking-[-0.03em]">
          Hablemos de tu práctica.
        </h1>
        <p className="mt-6 max-w-[52ch] text-[19px] text-muted">
          Pide un componente que no esté en el catálogo, pregunta por una entrega o cuéntanos qué te pidieron en el
          laboratorio.
        </p>
      </section>

      {/* Formulario y datos, cada uno en su tarjeta de vidrio. */}
      <section className="wrap grid gap-6 pb-18 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-8">
        <Reveal className="flex">
          <div className="glass w-full rounded-[24px] p-6 md:p-8">
            <p className="mono-label">Escríbenos</p>
            <h2 className="mt-2 text-[24px] font-semibold">Te respondemos el mismo día hábil.</h2>
            <div className="mt-7">
              <Suspense fallback={<FormSkeleton rows={4} />}>
                <ContactForm />
              </Suspense>
            </div>
          </div>
        </Reveal>
        <Reveal index={1} className="flex">
          <div className="glass w-full rounded-[24px] p-6 md:p-8">
            <p className="mono-label">Dónde y cuándo</p>
            <h2 className="mt-2 text-[24px] font-semibold">Entrega en campus y atención directa.</h2>
            <ul className="mt-7 flex flex-col divide-y divide-line">
              {details.map((d) => (
                <li key={d.label} className="flex gap-4 py-5 first:pt-0 last:pb-0">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-copper-soft text-copper">
                    <d.icon className="size-5" strokeWidth={1.6} aria-hidden="true" />
                  </span>
                  <div className="min-w-0 pt-1">
                    <p className="mono-label">{d.label}</p>
                    <ul className="mt-1.5 flex flex-col gap-1">
                      {d.lines.map((line) => (
                        <li key={line} className={d.mono ? "font-mono text-[15px] select-all" : "text-[16px]"}>
                          {line}
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </section>
    </>
  );
}
