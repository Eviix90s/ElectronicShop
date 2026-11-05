"use client";

import { useMotionValue, useReducedMotion, useSpring } from "motion/react";
import type { PointerEvent } from "react";

interface TiltOptions {
  /** Inclinación máxima, en grados. */
  max?: number;
  /** Elevación mientras el cursor está encima, en px. */
  lift?: number;
}

const spring = { stiffness: 220, damping: 20, mass: 0.6 };

/**
 * Inclina una tarjeta hacia el cursor y la eleva un poco, con resorte.
 * Se aplica a un `motion.div` propio, separado del elemento que anima la
 * entrada en cascada, para que los dos transforms no compitan por `y`.
 * No hace nada con reduced-motion ni en pantallas táctiles.
 */
export function useTilt({ max = 6, lift = 6 }: TiltOptions = {}) {
  const reduce = useReducedMotion();
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const ty = useMotionValue(0);
  const rotateX = useSpring(rx, spring);
  const rotateY = useSpring(ry, spring);
  const y = useSpring(ty, spring);

  function onPointerMove(e: PointerEvent<HTMLElement>) {
    if (reduce || e.pointerType !== "mouse") return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    ry.set(px * max * 2);
    rx.set(-py * max * 2);
    ty.set(-lift);
    // El bloom del vidrio (ver .glass en globals.css) sigue al cursor.
    el.style.setProperty("--mx", `${Math.round((px + 0.5) * 100)}%`);
    el.style.setProperty("--my", `${Math.round((py + 0.5) * 100)}%`);
  }

  function onPointerLeave(e: PointerEvent<HTMLElement>) {
    rx.set(0);
    ry.set(0);
    ty.set(0);
    e.currentTarget.style.removeProperty("--mx");
    e.currentTarget.style.removeProperty("--my");
  }

  return {
    style: { rotateX, rotateY, y, transformPerspective: 900 },
    onPointerMove,
    onPointerLeave,
  };
}
