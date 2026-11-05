"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";
import { Reveal } from "@/components/motion/reveal";

/**
 * Cifra aleatoria mientras el cliente decide si quiere un contador real. Se
 * sortea una vez por sesión y se guarda en sessionStorage para que no cambie
 * al navegar entre páginas.
 */
const SESSION_KEY = "electronicshop-visits";
const MIN = 8_400;
const MAX = 24_900;
const format = (n: number) => n.toLocaleString("es-MX");

function pickVisits(): number {
  try {
    const saved = Number(sessionStorage.getItem(SESSION_KEY));
    if (saved >= MIN && saved <= MAX) return saved;
  } catch {}
  const n = MIN + Math.floor(Math.random() * (MAX - MIN + 1));
  try {
    sessionStorage.setItem(SESSION_KEY, String(n));
  } catch {}
  return n;
}

/**
 * Contador grande y centrado: la cifra cuenta desde cero con una curva suave
 * al entrar en pantalla y, debajo, el texto en la tipografía de los títulos.
 */
export function VisitCounter() {
  const [visits, setVisits] = useState<number | null>(null);
  const figure = useRef<HTMLSpanElement>(null);
  const inView = useInView(figure, { once: true, margin: "0px 0px -15% 0px" });
  const reduce = useReducedMotion() ?? false;

  // La cifra se sortea en el cliente, tras montar, para no desajustar la hidratación.
  useEffect(() => {
    const id = window.requestAnimationFrame(() => setVisits(pickVisits()));
    return () => window.cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const el = figure.current;
    if (!el || visits === null || !inView) return;
    if (reduce) {
      el.textContent = format(visits);
      return;
    }
    el.textContent = "0";
    const controls = animate(0, visits, {
      duration: 2.4,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        el.textContent = format(Math.round(v));
      },
    });
    return () => controls.stop();
  }, [visits, inView, reduce]);

  return (
    <Reveal className="glass rounded-[28px] px-6 py-14 text-center md:px-12 md:py-20">
      <span
        ref={figure}
        className="block text-[clamp(72px,12vw,180px)] leading-none font-semibold tracking-[-0.04em] tabular"
        aria-busy={visits === null}
        aria-label={visits !== null ? `${format(visits)} visitas` : "Cargando visitas"}
      >
        {visits !== null ? format(visits) : "—"}
      </span>
      <h2 className="mx-auto mt-6 max-w-[20ch] text-[clamp(40px,5.2vw,72px)] font-semibold tracking-[-0.03em]">
        personas han visitado la tienda desde que abrimos.
      </h2>
    </Reveal>
  );
}
