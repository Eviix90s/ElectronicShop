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

const view = { once: true, margin: "0px 0px -12% 0px" } as const;

/**
 * Línea de tiempo vertical: una pista de cobre que se dibuja conforme se hace
 * scroll, del primer número al último, y cuatro pasos de vidrio que entran en
 * cascada, cada uno con su número.
 */
export function HowItWorks() {
  const reduce = useReducedMotion() ?? false;
  const list = useRef<HTMLOListElement>(null);
  /** Pista: dónde empieza (centro del primer número) y cuánto mide (hasta el centro del último). */
  const [rail, setRail] = useState({ top: 0, height: 0 });

  // Se mide al observar y en cada cambio de tamaño de la lista (fuentes, ancho,
  // pasos nuevos), así la pista siempre va de centro a centro de los números,
  // sea cual sea su tamaño en móvil o escritorio.
  useEffect(() => {
    const el = list.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const items = [...el.querySelectorAll<HTMLLIElement>(":scope > li")];
      const dot = items[0]?.querySelector<HTMLElement>(":scope > span");
      if (!items.length || !dot) return;
      const base = el.getBoundingClientRect().top;
      const center = dot.offsetTop + dot.offsetHeight / 2;
      const first = items[0].getBoundingClientRect().top - base;
      const last = items[items.length - 1].getBoundingClientRect().top - base;
      setRail({ top: first + center, height: last - first });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { scrollYProgress } = useScroll({ target: list, offset: ["start 85%", "end 90%"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 90, damping: 22, mass: 0.6 });
  const progress = useTransform(smooth, (v) => (reduce ? 1 : v));

  return (
    <ol ref={list} className="relative grid gap-5 pl-16 md:gap-8 md:pl-20">
      <div className="absolute left-6 w-px md:left-7" style={{ top: rail.top, height: rail.height }} aria-hidden="true">
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
          className="glass glass-lift rounded-[22px] p-5 md:p-7"
        >
          <motion.span
            initial={reduce ? false : { scale: 0.4, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={view}
            transition={{ type: "spring", stiffness: 300, damping: 18, delay: i * 0.12 + 0.15 }}
            className="absolute top-5 -left-16 grid size-12 place-items-center rounded-full border border-line-strong bg-bg font-mono text-[12px] tabular md:top-6 md:-left-20 md:size-14 md:text-[13px]"
          >
            {s.n}
          </motion.span>
          <h3 className="text-[21px] leading-tight font-semibold md:text-[24px]">{s.title}</h3>
          <p className="mt-2.5 max-w-[48ch] text-[16px] text-muted md:text-[17px]">{s.text}</p>
        </motion.li>
      ))}
    </ol>
  );
}
