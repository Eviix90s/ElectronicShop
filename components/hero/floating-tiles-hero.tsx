"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { motion, useMotionValue, useReducedMotion, useSpring, type MotionValue } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * Hero de la portada: tiles con fotos de componentes que flotan y se apartan
 * del cursor con física de resorte. Adaptación del componente de referencia
 * (FloatingIconsHero) al sistema visual de ElectronicShop.
 */

export interface HeroTile {
  src: string;
  alt: string;
  /** Posición en % del contenedor */
  left: number;
  top: number;
  /** Tamaño en px (escritorio) */
  size: number;
  /** Solo se muestra en pantallas grandes */
  lg?: boolean;
}

export const defaultTiles: HeroTile[] = [
  { src: "/img/products/arduino.webp", alt: "", left: 5, top: 12, size: 100 },
  { src: "/img/products/jumper.webp", alt: "", left: 17, top: 60, size: 92, lg: true },
  { src: "/img/products/esp32.webp", alt: "", left: 27, top: 6, size: 84, lg: true },
  { src: "/img/products/capacitor.webp", alt: "", left: 3, top: 44, size: 80 },
  { src: "/img/products/multimetro.webp", alt: "", left: 8, top: 80, size: 88 },
  { src: "/img/products/protoboard.webp", alt: "", left: 31, top: 84, size: 90, lg: true },
  { src: "/img/products/resistor.webp", alt: "", left: 42, top: 3, size: 76, lg: true },
  { src: "/img/products/lcd.webp", alt: "", left: 57, top: 7, size: 84, lg: true },
  { src: "/img/products/pir.webp", alt: "", left: 71, top: 12, size: 92 },
  { src: "/img/products/hc05.webp", alt: "", left: 84, top: 26, size: 84, lg: true },
  { src: "/img/products/osciloscopio.webp", alt: "", left: 88, top: 50, size: 96 },
  { src: "/img/products/rele.webp", alt: "", left: 80, top: 76, size: 88 },
  { src: "/img/products/ldr.webp", alt: "", left: 63, top: 86, size: 84, lg: true },
  { src: "/img/products/transistor.webp", alt: "", left: 92, top: 6, size: 72 },
  { src: "/img/products/lm35.webp", alt: "", left: 48, top: 90, size: 72, lg: true },
];

const RADIUS = 170;
const FORCE = 58;

interface TileHandle {
  el: HTMLDivElement | null;
  x: MotionValue<number>;
  y: MotionValue<number>;
}

function Tile({
  tile,
  index,
  register,
  reduce,
}: {
  tile: HeroTile;
  index: number;
  register: (i: number, h: TileHandle) => void;
  reduce: boolean;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 300, damping: 20 });
  const sy = useSpring(y, { stiffness: 300, damping: 20 });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    register(index, { el: ref.current, x, y });
  }, [index, register, x, y]);

  const period = 5 + ((index * 37) % 50) / 10;
  const amp = 5 + ((index * 13) % 6);
  const rot = (index % 2 ? 1 : -1) * (2 + ((index * 7) % 4));

  return (
    <motion.div
      ref={ref}
      style={{ x: sx, y: sy, left: `${tile.left}%`, top: `${tile.top}%`, ["--s" as string]: `${tile.size}px` }}
      initial={reduce ? false : { opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.07, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={cn("absolute size-(--s) max-md:size-16", tile.lg && "max-md:hidden")}
    >
      <motion.div
        className="glass grid size-full place-items-center rounded-[22px] p-2.5 max-md:rounded-2xl max-md:p-1.5"
        animate={reduce ? undefined : { y: [0, -amp, 0, amp, 0], x: [0, amp * 0.8, 0, -amp * 0.8, 0], rotate: [0, rot, 0, -rot, 0] }}
        transition={{ duration: period, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
      >
        <Image src={tile.src} alt={tile.alt} width={160} height={160} className="size-full object-contain" priority={index < 4} />
      </motion.div>
    </motion.div>
  );
}

interface FloatingTilesHeroProps {
  tiles?: HeroTile[];
  children: React.ReactNode;
  className?: string;
}

export function FloatingTilesHero({ tiles = defaultTiles, children, className }: FloatingTilesHeroProps) {
  const reduce = useReducedMotion() ?? false;
  const handles = useRef<TileHandle[]>([]);
  const register = (i: number, h: TileHandle) => {
    handles.current[i] = h;
  };

  function onMove(e: React.PointerEvent<HTMLElement>) {
    if (reduce) return;
    const mx = e.clientX;
    const my = e.clientY;
    for (const h of handles.current) {
      if (!h?.el) continue;
      const r = h.el.getBoundingClientRect();
      const cx = r.left + r.width / 2 - h.x.get();
      const cy = r.top + r.height / 2 - h.y.get();
      const dx = mx - cx;
      const dy = my - cy;
      const d = Math.hypot(dx, dy);
      if (d < RADIUS && d > 0) {
        const f = (1 - d / RADIUS) * FORCE;
        h.x.set((-dx / d) * f);
        h.y.set((-dy / d) * f);
      } else {
        h.x.set(0);
        h.y.set(0);
      }
    }
  }

  function onLeave() {
    for (const h of handles.current) {
      h?.x.set(0);
      h?.y.set(0);
    }
  }

  return (
    <section
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={cn(
        "relative grid min-h-[min(84vh,780px)] place-items-center overflow-hidden py-24 pb-18 max-md:min-h-0 max-md:py-16",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {tiles.map((t, i) => (
          <Tile key={t.src} tile={t} index={i} register={register} reduce={reduce} />
        ))}
      </div>
      <div className="wrap relative z-[2] max-w-[52rem] text-center">{children}</div>
    </section>
  );
}
