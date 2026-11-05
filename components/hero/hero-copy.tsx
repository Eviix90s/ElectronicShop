"use client";

import { motion, useReducedMotion } from "motion/react";
import { ButtonLink } from "@/components/ui/button";

const ease = [0.2, 0.7, 0.2, 1] as const;

export function HeroCopy() {
  const reduce = useReducedMotion();
  const item = (i: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 14 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, ease, delay: i * 0.08 },
        };
  return (
    <>
      <motion.h1 className="grid-guard text-[clamp(42px,7vw,88px)] font-semibold tracking-[-0.03em]" {...item(0)}>
        Lo que tu práctica necesita, hoy mismo.
      </motion.h1>
      <motion.p className="grid-guard mx-auto mt-6 max-w-[52ch] text-[19px] text-muted" {...item(2)}>
        Placas, sensores, componentes y herramientas para circuitos y diseño de sistemas. Pides en línea y lo
        recoges en campus en menos de 24 horas.
      </motion.p>
      <motion.div className="mt-8 flex flex-wrap justify-center gap-3" {...item(3)}>
        <ButtonLink href="/tienda">Ver catálogo</ButtonLink>
        <ButtonLink href="#visor-3d" variant="ghost">
          Explorar en 3D
        </ButtonLink>
      </motion.div>
    </>
  );
}
