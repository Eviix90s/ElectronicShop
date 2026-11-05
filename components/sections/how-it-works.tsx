"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";

const steps = [
  {
    n: "01",
    title: "Pides en línea",
    text: "Eliges el componente, ves su modelo 3D y pagas con tarjeta, PayPal o en efectivo al recoger.",
  },
  {
    n: "02",
    title: "Recoges en campus",
    text: "En menos de 24 horas, en el punto de entrega del plantel. Envío express si lo necesitas fuera.",
  },
  {
    n: "03",
    title: "Soporte si algo falla",
    text: "Garantía de seis meses y asesoría de estudiantes que conocen las materias y los profesores.",
  },
  {
    n: "04",
    title: "Sin esperas ni mínimos",
    text: "Pides, recoges en campus y, si algo falla, te respaldamos. Sin esperas de paquetería ni mínimos de compra.",
  },
];

/** Centro del círculo numerado respecto al borde superior de cada paso, en px (top-6 + size-14 / 2). */
const DOT_CENTER = 52;
const view = { once: true, margin: "0px 0px -12% 0px" } as const;

/**
 * Línea de tiempo vertical: una pista de cobre que se dibuja conforme se hace
 * scroll, del primer número al último, y cuatro pasos de vidrio que entran en
 * cascada, cada uno con su número.
 */
export function HowItWorks() {
  const reduce = useReducedMotion() ?? false;
  const list = useRef<HTMLOListElement>(null);
  /** Borde superior de cada paso respecto a la lista, en px. */
  const [tops, setTops] = useState<number[]>([]);

  // Se mide al observar y en cada cambio de tamaño de la lista (fuentes, ancho,
  // pasos nuevos), así la pista siempre termina en el centro del último número.
  useEffect(() => {
    const el = list.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const base = el.getBoundingClientRect().top;
      setTops([...el.querySelectorAll<HTMLLIElement>(":scope > li")].map((li) => li.getBoundingClientRect().top - base));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { scrollYProgress } = useScroll({ target: list, offset: ["start 85%", "end 90%"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 90, damping: 22, mass: 0.6 });
  const progress = useTransform(smooth, (v) => (reduce ? 1 : v));

  const railHeight = tops.length ? tops[tops.length - 1] : 0;

  return (
    <ol ref={list} className="relative grid gap-6 pl-20 md:gap-8">
      <div className="absolute left-7 w-px" style={{ top: DOT_CENTER, height: railHeight }} aria-hidden="true">
        <div className="absolute inset-y-0 left-0 border-l border-dashed border-line-strong" />
        <motion.div style={{ scaleY: progress }} className="absolute inset-y-0 -left-px w-0.5 origin-top bg-copper" />
      </div>
      {steps.map((s, i) => (
        <motion.li
          key={s.n}
          initial={reduce ? false : { opacity: 0, x: 28 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={view}
          transition={{ type: "spring", stiffness: 160, damping: 22, delay: i * 0.12 }}
          className="glass glass-lift rounded-[22px] p-6 md:p-7"
        >
          <motion.span
            initial={reduce ? false : { scale: 0.4, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={view}
            transition={{ type: "spring", stiffness: 300, damping: 18, delay: i * 0.12 + 0.15 }}
            className="absolute top-6 -left-20 grid size-14 place-items-center rounded-full border border-line-strong bg-bg font-mono text-[13px] tabular"
          >
            {s.n}
          </motion.span>
          <h3 className="text-[24px] font-semibold">{s.title}</h3>
          <p className="mt-2.5 max-w-[48ch] text-[17px] text-muted">{s.text}</p>
        </motion.li>
      ))}
    </ol>
  );
}
