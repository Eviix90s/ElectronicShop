"use client";

import { motion, useReducedMotion } from "motion/react";
import { DustText } from "@/components/motion/dust-text";
import { useTilt } from "@/components/motion/use-tilt";
import { Icon } from "@/components/ui/icon";
import { site } from "@/lib/data";
import type { ValueItem } from "@/lib/data/types";
import { cn } from "@/lib/utils";

/** Valores como tarjetas de vidrio en cuadrícula tipo bento: la primera ocupa dos columnas. */
export function ValuesGrid() {
  return (
    <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">
      {site.values.map((v, i) => (
        <ValueCard key={v.title} value={v} index={i} wide={i === 0} />
      ))}
    </ul>
  );
}

function ValueCard({ value, index, wide }: { value: ValueItem; index: number; wide: boolean }) {
  const reduce = useReducedMotion() ?? false;
  const tilt = useTilt({ max: 5, lift: 4 });
  return (
    <motion.li
      initial={reduce ? false : { opacity: 0, y: 32, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ type: "spring", stiffness: 160, damping: 22, delay: index * 0.08 }}
      className={cn("flex", wide && "md:col-span-2")}
    >
      <motion.div
        {...tilt}
        className="glass glass-lift group relative flex min-h-[240px] w-full flex-col justify-between gap-8 overflow-hidden rounded-[24px] p-7"
      >
        {/* Número grande al fondo, como marca de agua */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-3 right-6 font-mono text-[104px] leading-none font-medium text-ink/5 tabular"
        >
          0{index + 1}
        </span>
        <span className="grid size-14 place-items-center rounded-full bg-copper-soft text-copper transition-[scale,rotate] duration-300 group-hover:scale-110 group-hover:-rotate-6">
          <Icon name={value.icon} className="size-6" />
        </span>
        <div className="relative">
          <h3 className={cn("leading-tight font-semibold", wide ? "text-[clamp(26px,2.6vw,36px)]" : "text-[24px]")}>
            {value.title}
          </h3>
          <DustText text={value.text} className="mt-3 max-w-[48ch] text-[16px] leading-snug text-muted" />
        </div>
      </motion.div>
    </motion.li>
  );
}
