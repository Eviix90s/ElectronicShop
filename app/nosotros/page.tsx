import type { Metadata } from "next";
import Image from "next/image";
import { Quote } from "lucide-react";
import { DustText } from "@/components/motion/dust-text";
import { Reveal } from "@/components/motion/reveal";
import { CtaBand } from "@/components/sections/cta-band";
import { ValuesGrid } from "@/components/sections/values-grid";
import { site, team, testimonials } from "@/lib/data";
import { initials } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Nosotros",
  description:
    "Una tienda de componentes electrónicos creada por estudiantes de ingeniería para resolver las urgencias del laboratorio.",
};

/** Título de sección: misma tipografía que los de la portada. */
const sectionTitle = "mt-5 max-w-[14ch] text-[clamp(36px,5.2vw,72px)] font-semibold tracking-[-0.03em]";

export default function NosotrosPage() {
  return (
    <>
      <section className="wrap py-14 md:py-20">
        <p className="eyebrow">Nosotros</p>
        <h1 className={sectionTitle}>De estudiantes para estudiantes.</h1>
        <DustText
          text="Hablamos el mismo idioma: conocemos las materias, los profesores y exactamente qué materiales te van a pedir en el laboratorio."
          className="mt-6 max-w-[56ch] text-[19px] text-muted"
        />
      </section>

      {/* Misión y visión llegan como polvo que se asienta con el scroll. */}
      <section className="wrap grid gap-12 py-18 md:grid-cols-2 md:gap-14">
        <div>
          <p className="eyebrow">Misión</p>
          <DustText text={site.mission} className="mt-5 text-[19px] leading-relaxed text-ink/90" />
        </div>
        <div>
          <p className="eyebrow">Visión</p>
          <DustText text={site.vision} className="mt-5 text-[19px] leading-relaxed text-ink/90" />
        </div>
      </section>

      <section className="wrap py-18">
        <Reveal>
          <p className="eyebrow">Valores</p>
          <h2 className={sectionTitle}>Lo que nos guía cuando algo hace corto circuito.</h2>
        </Reveal>
        <div className="mt-10 md:mt-12">
          <ValuesGrid />
        </div>
      </section>

      <section className="wrap pb-18">
        <Reveal>
          <p className="eyebrow">Equipo</p>
          <h2 className={sectionTitle}>Quién está detrás del mostrador.</h2>
        </Reveal>
        <div className="mt-10 grid gap-5 md:mt-12 md:grid-cols-3">
          {team.map((m, i) => (
            <Reveal key={m.name} index={i}>
              <article className="glass glass-lift flex h-full flex-col gap-4 rounded-[22px] p-6">
                {m.image ? (
                  <Image src={m.image} alt={m.name} width={96} height={96} className="size-24 rounded-full object-cover" />
                ) : (
                  <span className="grid size-24 place-items-center rounded-full bg-copper-soft font-mono text-xl text-copper">
                    {initials(m.name)}
                  </span>
                )}
                <div>
                  <h3 className="text-xl font-semibold">{m.name}</h3>
                  <p className="mono-label mt-1">{m.role}</p>
                </div>
                <DustText text={m.bio} className="text-[15px] text-muted" />
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="wrap pb-18">
        <Reveal>
          <p className="eyebrow">Testimonios</p>
          <h2 className={sectionTitle}>Lo que dicen después de la práctica.</h2>
        </Reveal>
        <div className="mt-10 grid gap-5 md:mt-12 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal key={t.author} index={i} className="flex">
              <blockquote className="glass glass-lift flex h-full w-full flex-col gap-6 rounded-[22px] p-7">
                <span className="grid size-11 place-items-center rounded-full bg-copper-soft text-copper">
                  <Quote className="size-5" strokeWidth={1.5} aria-hidden="true" />
                </span>
                <DustText text={t.quote} className="text-[18px] leading-snug" />
                <footer className="mt-auto border-t border-line pt-5">
                  <p className="font-semibold">{t.author}</p>
                  <p className="mono-label mt-1">{t.program}</p>
                </footer>
              </blockquote>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="wrap pb-18">
        <CtaBand
          size="large"
          align="start"
          dustText
          title="Si estudias ingeniería, esta tienda es tuya."
          text="Crea tu cuenta con tu correo institucional y arma tu lista de materiales para la próxima práctica."
          primary={{ href: "/registro", label: "Crear cuenta" }}
          secondary={{ href: "/contacto", label: "Hablar con el equipo" }}
        />
      </section>
    </>
  );
}
