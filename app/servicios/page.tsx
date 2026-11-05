import type { Metadata } from "next";
import { Check } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { CategoryTiles } from "@/components/sections/category-tiles";
import { CtaBand } from "@/components/sections/cta-band";
import { TrustStrip } from "@/components/sections/trust-strip";
import { Icon } from "@/components/ui/icon";
import { services } from "@/lib/data";

export const metadata: Metadata = {
  title: "Servicios",
  description:
    "Entrega en campus en menos de 24 horas, pago con tarjeta, PayPal o efectivo, y soporte técnico de estudiantes para estudiantes.",
};

export default function ServiciosPage() {
  return (
    <>
      <section className="wrap py-14 md:py-20">
        <p className="eyebrow">Servicios</p>
        {/* Misma tipografía, tamaño y posición que los títulos de la portada. */}
        <h1 className="mt-5 max-w-[14ch] text-[clamp(36px,5.2vw,72px)] font-semibold tracking-[-0.03em]">
          Tres cosas que hacemos bien.
        </h1>
        <p className="mt-6 max-w-[52ch] text-[19px] text-muted">
          Una tienda hecha para el ritmo del laboratorio: material al instante, pago como te convenga y alguien que
          te explique el componente si hace falta.
        </p>
      </section>

      <TrustStrip />

      <section className="wrap py-18">
        <div className="grid gap-4 lg:grid-cols-3">
          {services.map((s, i) => (
            <Reveal key={s.slug} index={i} className="glass glass-lift rounded-[22px]">
              <article id={s.slug} className="flex h-full scroll-mt-24 flex-col gap-5 p-7 md:p-9">
                <span className="grid size-12 place-items-center rounded-full bg-copper-soft text-copper">
                  <Icon name={s.icon} className="size-5" />
                </span>
                <h2 className="text-[26px] font-semibold">{s.title}</h2>
                <p className="text-muted">{s.summary}</p>
                <ul className="mt-auto flex flex-col gap-2.5 border-t border-line pt-5 text-[15px]">
                  {s.details.map((d) => (
                    <li key={d} className="flex items-start gap-2.5">
                      <Check className="mt-1 size-4 shrink-0 text-pcb" strokeWidth={2} aria-hidden="true" />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="wrap pb-18" id="catalogo">
        <Reveal>
          <p className="eyebrow">Catálogo</p>
          <h2 className="mt-5 max-w-[14ch] text-[clamp(36px,5.2vw,72px)] font-semibold tracking-[-0.03em]">
            Siete categorías, diecinueve productos.
          </h2>
        </Reveal>
        <CategoryTiles className="mt-10 md:mt-12" />
      </section>

      <section className="wrap pb-18">
        <CtaBand
          size="large"
          align="start"
          title="¿No encuentras un componente?"
          text="Dinos qué te pidieron en la práctica y lo conseguimos. Respondemos el mismo día."
          primary={{ href: "/contacto", label: "Escríbenos" }}
          secondary={{ href: "/tienda", label: "Ver catálogo" }}
        />
      </section>
    </>
  );
}
