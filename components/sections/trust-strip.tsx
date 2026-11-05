"use client";

import { useEffect, useRef } from "react";
import { animate, motion, useInView, useReducedMotion } from "motion/react";
import { useTilt } from "@/components/motion/use-tilt";
import { Icon } from "@/components/ui/icon";
import { site } from "@/lib/data";
import type { TrustItem } from "@/lib/data/types";

const ease = [0.2, 0.7, 0.2, 1] as const;
/** Escalón entre tarjetas, en segundos. */
const STEP = 0.09;

/**
 * Franja de confianza: cuatro tarjetas grandes que entran en cascada al hacer
 * scroll. Cada una sube con resorte, su icono entra girando, la pista de cobre
 * del borde superior se dibuja y la cifra cuenta desde cero. Al pasar el
 * cursor, la tarjeta se inclina hacia él y se eleva.
 */
export function TrustStrip() {
  return (
    <section className="wrap py-6 md:py-8" aria-label="Por qué comprar aquí">
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
        {site.trust.map((t, i) => (
          <TrustCard key={t.label} item={t} index={i} />
        ))}
      </ul>
    </section>
  );
}

function TrustCard({ item, index }: { item: TrustItem; index: number }) {
  const reduce = useReducedMotion() ?? false;
  const tilt = useTilt({ max: 7, lift: 6 });
  const delay = index * STEP;
  const view = { once: true, margin: "0px 0px -12% 0px" } as const;

  return (
    <motion.li
      initial={reduce ? false : { opacity: 0, y: 40, scale: 0.94 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={view}
      transition={{ type: "spring", stiffness: 170, damping: 22, mass: 0.9, delay }}
      className="flex"
    >
      <motion.div
        {...tilt}
        className="glass glass-lift group relative flex min-h-[200px] w-full flex-col gap-6 rounded-[22px] p-6 md:min-h-[224px] md:p-7"
      >
        {/* Pista de cobre que se dibuja de izquierda a derecha */}
        <motion.span
          aria-hidden="true"
          className="absolute inset-x-6 top-0 h-0.5 origin-left bg-copper md:inset-x-7"
          initial={reduce ? false : { scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={view}
          transition={{ duration: 0.9, ease, delay: delay + 0.25 }}
        />
        <div className="flex items-center gap-3.5">
          <motion.span
            className="grid size-12 shrink-0 place-items-center rounded-full bg-copper-soft text-copper transition-[scale,rotate] duration-300 group-hover:scale-110 group-hover:-rotate-6"
            initial={reduce ? false : { scale: 0.4, rotate: -40, opacity: 0 }}
            whileInView={{ scale: 1, rotate: 0, opacity: 1 }}
            viewport={view}
            transition={{ type: "spring", stiffness: 260, damping: 16, delay: delay + 0.18 }}
          >
            <Icon name={item.icon} className="size-5" />
          </motion.span>
          <span className="mono-label">{item.label}</span>
        </div>
        <div className="mt-auto">
          <p className="flex items-baseline gap-2 text-[clamp(38px,3.4vw,48px)] leading-none font-semibold tracking-[-0.03em] tabular">
            <CountUp n={item.stat.n} delay={delay + 0.3} reduce={reduce} />{" "}
            <span className="text-[17px] font-medium tracking-normal text-muted">{item.stat.unit}</span>
          </p>
          <p className="mt-3 max-w-[30ch] text-[15px] leading-snug text-muted">{item.detail}</p>
        </div>
      </motion.div>
    </motion.li>
  );
}

/**
 * Cifra que cuenta desde cero al entrar en pantalla. El HTML del servidor ya
 * trae el valor final: sin JavaScript o con reduced-motion se ve tal cual.
 */
function CountUp({ n, delay, reduce }: { n: number; delay: number; reduce: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -12% 0px" });

  useEffect(() => {
    const el = ref.current;
    if (!el || !inView || reduce) return;
    el.textContent = "0";
    const controls = animate(0, n, {
      duration: 1.1,
      ease,
      delay,
      onUpdate: (v) => {
        el.textContent = String(Math.round(v));
      },
    });
    return () => controls.stop();
  }, [inView, n, delay, reduce]);

  return <span ref={ref}>{n}</span>;
}
