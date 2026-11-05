import type { Metadata } from "next";
import { Reveal } from "@/components/motion/reveal";
import { CtaBand } from "@/components/sections/cta-band";
import { FaqList } from "@/components/sections/faq-list";
import { faq } from "@/lib/data";
import type { FaqItem } from "@/lib/data/types";
import { plural } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Preguntas frecuentes",
  description: "Entrega, pagos, devoluciones, garantía y cuenta: todo lo que necesitas saber antes de comprar.",
};

const groups: { key: FaqItem["group"]; title: string }[] = [
  { key: "entrega", title: "Entrega" },
  { key: "pagos", title: "Pagos" },
  { key: "productos", title: "Productos" },
  { key: "garantia", title: "Garantía y devoluciones" },
  { key: "cuenta", title: "Cuenta" },
];

export default function FaqPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <section className="wrap py-14 md:py-20">
        <p className="eyebrow">Preguntas frecuentes</p>
        {/* Misma tipografía, tamaño y posición que los títulos de la portada. */}
        <h1 className="mt-5 max-w-[14ch] text-[clamp(40px,5.2vw,72px)] font-semibold tracking-[-0.03em]">
          Sin letra pequeña.
        </h1>
      </section>

      {/* Cada grupo: nombre y conteo a la izquierda, preguntas en una tarjeta de vidrio a la derecha. */}
      <section className="wrap flex flex-col gap-8 pb-18 lg:gap-10">
        {groups
          .map((g) => ({ ...g, items: faq.filter((f) => f.group === g.key) }))
          .filter((g) => g.items.length)
          .map((g, i) => (
            <Reveal key={g.key} index={i}>
              <div className="grid gap-5 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-10">
                <div className="lg:pt-6">
                  <h2 className="text-[28px] leading-tight font-semibold">{g.title}</h2>
                  <p className="mono-label mt-2">{plural(g.items.length, "pregunta", "preguntas")}</p>
                </div>
                <FaqList items={g.items} className="glass rounded-[24px] border-t-0 px-6 py-2 md:px-8 md:py-3" />
              </div>
            </Reveal>
          ))}
      </section>

      <section className="wrap pb-18">
        <CtaBand
          size="large"
          align="start"
          title="¿Tu duda no está aquí?"
          text="Responde un estudiante del equipo, el mismo día."
          primary={{ href: "/contacto", label: "Escríbenos" }}
        />
      </section>
    </>
  );
}
