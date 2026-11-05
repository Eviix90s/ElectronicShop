"use client";

import { useMemo, useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import { cn } from "@/lib/utils";

interface DustTextProps {
  text: string;
  className?: string;
}

interface Grain {
  word: string;
  i: number;
  /** Desplazamiento inicial, en px, y giro en grados: de dónde "sopla" cada palabra. */
  dx: number;
  dy: number;
  rot: number;
  blur: number;
}

/** Aleatorio determinista (mulberry32): el polvo es el mismo en servidor y cliente. */
function seeded(seed: number) {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Texto que llega como polvo arrastrado por el viento: cada palabra entra
 * desplazada, girada y desenfocada, y se asienta en su sitio conforme el
 * párrafo sube por la pantalla; al volver atrás, se vuelve a dispersar.
 * Con reduced-motion se muestra quieto.
 */
export function DustText({ text, className }: DustTextProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const reduce = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 92%", "start 38%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 80, damping: 20, mass: 0.5 });

  const grains = useMemo<Grain[]>(() => {
    const rand = seeded(text.length * 7919 + 17);
    return text
      .split(/\s+/)
      .filter(Boolean)
      .map((word, i) => ({
        word,
        i,
        dx: 36 + rand() * 150,
        dy: (rand() - 0.5) * 70,
        rot: (rand() - 0.5) * 50,
        blur: 2 + rand() * 4,
      }));
  }, [text]);

  if (reduce) {
    return (
      <p ref={ref} className={className}>
        {text}
      </p>
    );
  }

  return (
    <p ref={ref} className={cn("[text-wrap:pretty]", className)} aria-label={text}>
      {grains.map((g) => (
        <Word key={g.i} grain={g} count={grains.length} progress={progress} />
      ))}
    </p>
  );
}

function Word({ grain, count, progress }: { grain: Grain; count: number; progress: MotionValue<number> }) {
  // Cada palabra se asienta en su propia ventana, en orden de lectura: la
  // ráfaga recorre el párrafo de principio a fin.
  const start = (grain.i / count) * 0.6;
  const end = start + 0.4;
  const x = useTransform(progress, [start, end], [grain.dx, 0]);
  const y = useTransform(progress, [start, end], [grain.dy, 0]);
  const rotate = useTransform(progress, [start, end], [grain.rot, 0]);
  const opacity = useTransform(progress, [start, end], [0, 1]);
  // Sin filtro una vez asentada: un blur(0px) sigue costando una capa de composición.
  const filter = useTransform(progress, (v) => {
    if (v >= end) return "none";
    const t = Math.max(0, Math.min(1, (v - start) / (end - start)));
    return `blur(${(grain.blur * (1 - t)).toFixed(2)}px)`;
  });
  return (
    <>
      <motion.span style={{ x, y, rotate, opacity, filter }} className="inline-block will-change-transform" aria-hidden="true">
        {grain.word}
      </motion.span>{" "}
    </>
  );
}
