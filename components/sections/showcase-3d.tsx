"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { LazyProductViewer } from "@/components/three/lazy";
import type { Product } from "@/lib/data/types";
import { cn } from "@/lib/utils";

interface Showcase3dProps {
  /** Productos con modelo 3D; el primero se muestra por defecto */
  products: Product[];
  eyebrow: string;
  title: ReactNode;
}

const ease = [0.2, 0.7, 0.2, 1] as const;
/** Tiempo que cada modelo permanece en el carrusel, en ms. */
const INTERVAL = 7000;
/** Duración del fundido entre modelos, en ms. */
const FADE = 220;
/** Tras tocar el visor en pantalla táctil, el carrusel espera este tiempo antes de seguir. */
const TOUCH_HOLD = 6000;

const toolButton =
  "grid size-10 shrink-0 cursor-pointer place-items-center rounded-full border border-line-strong bg-surface text-ink transition-colors hover:border-ink disabled:cursor-default disabled:opacity-40";

/**
 * Sección del visor 3D: solo el título grande (tipografía del hero) a la
 * izquierda; a la derecha, ancho, el visor que recorre solo todos los modelos
 * como un carrusel. Se detiene mientras el cursor está encima, fuera de
 * pantalla, con reduced-motion o si se pausa.
 */
export function Showcase3d({ products, eyebrow, title }: Showcase3dProps) {
  const reduce = useReducedMotion() ?? false;
  const cardRef = useRef<HTMLDivElement>(null);
  const inView = useInView(cardRef, { amount: 0.35 });

  /** Modelo elegido (chip y progreso) y modelo que se dibuja (tras el fundido). */
  const [index, setIndex] = useState(0);
  const [shown, setShown] = useState(0);
  const [fading, setFading] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [held, setHeld] = useState(false);
  const fadeTimer = useRef(0);
  const holdTimer = useRef(0);
  const chipsRef = useRef<HTMLDivElement>(null);

  const count = products.length;

  // El chip activo se mantiene a la vista en la fila desplazable, sin mover la página.
  useEffect(() => {
    const row = chipsRef.current;
    const chip = row?.children[index] as HTMLElement | undefined;
    if (!row || !chip) return;
    const left = chip.offsetLeft;
    const right = left + chip.offsetWidth;
    const behavior: ScrollBehavior = reduce ? "auto" : "smooth";
    if (left < row.scrollLeft + 12) row.scrollTo({ left: left - 12, behavior });
    else if (right > row.scrollLeft + row.clientWidth - 12) row.scrollTo({ left: right - row.clientWidth + 12, behavior });
  }, [index, reduce]);

  const autoplay = playing && !reduce && inView && !held && count > 1;

  const select = useCallback(
    (i: number) => {
      const next = ((i % count) + count) % count;
      if (next === index) return;
      setIndex(next);
      window.clearTimeout(fadeTimer.current);
      if (reduce) {
        setShown(next);
        return;
      }
      setFading(true);
      fadeTimer.current = window.setTimeout(() => {
        setShown(next);
        setFading(false);
      }, FADE);
    },
    [count, index, reduce],
  );

  // El intervalo se crea de nuevo en cada cambio de modelo, así una elección
  // manual reinicia la cuenta.
  useEffect(() => {
    if (!autoplay) return;
    const id = window.setInterval(() => {
      if (document.hidden) return;
      select(index + 1);
    }, INTERVAL);
    return () => window.clearInterval(id);
  }, [autoplay, index, select]);

  useEffect(
    () => () => {
      window.clearTimeout(fadeTimer.current);
      window.clearTimeout(holdTimer.current);
    },
    [],
  );

  const active = products[index];
  const current = products[shown];
  if (!active?.model3d || !current?.model3d) return null;

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-center lg:gap-x-14">
      {/* Título con la misma tipografía que el titular del hero. */}
      <Reveal>
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="mt-5 max-w-[12ch] text-[clamp(40px,5.2vw,72px)] font-semibold tracking-[-0.03em]">{title}</h2>
      </Reveal>

      <Reveal y={24}>
        <div
          ref={cardRef}
          className="rounded-[24px] border border-line bg-surface p-3 shadow-card md:p-4"
          onPointerEnter={() => {
            window.clearTimeout(holdTimer.current);
            setHeld(true);
          }}
          onPointerLeave={(e) => {
            if (e.pointerType === "touch") {
              holdTimer.current = window.setTimeout(() => setHeld(false), TOUCH_HOLD);
            } else {
              setHeld(false);
            }
          }}
        >
          <motion.div
            animate={{ opacity: fading ? 0 : 1, scale: fading ? 0.985 : 1 }}
            transition={{ duration: FADE / 1000, ease }}
          >
            <LazyProductViewer
              modelId={current.model3d}
              className="w-full"
              stageClassName="aspect-[4/3] min-h-80 border-0 bg-transparent lg:min-h-[540px]"
            />
          </motion.div>

          {/* Carrusel: progreso con contador, flechas, chips y pausa */}
          <div className="mt-4 border-t border-line pt-4">
            <div className="flex items-center gap-4">
              <div className="h-0.5 min-w-0 flex-1 overflow-hidden rounded-full bg-line" aria-hidden="true">
                <motion.span
                  key={`${index}-${autoplay}`}
                  className="block h-full origin-left bg-copper"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: autoplay ? 1 : 0 }}
                  transition={{ duration: autoplay ? INTERVAL / 1000 : 0.2, ease: "linear" }}
                />
              </div>
              <span className="mono-label shrink-0 tabular">
                {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
              </span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <button type="button" onClick={() => select(index - 1)} aria-label="Modelo anterior" className={toolButton}>
                <ChevronLeft size={16} aria-hidden="true" />
              </button>
              <div
                ref={chipsRef}
                className="relative flex min-w-0 flex-1 gap-1.5 overflow-x-auto px-2 py-0.5 [mask-image:linear-gradient(to_right,transparent,#000_12px,#000_calc(100%-12px),transparent)] [scrollbar-width:none]"
                role="group"
                aria-label="Elegir producto"
              >
                {products.map((p, i) => (
                  <button
                    key={p.slug}
                    type="button"
                    onClick={() => select(i)}
                    className={cn(
                      "h-9 shrink-0 cursor-pointer rounded-full border px-3.5 font-mono text-xs tracking-[0.04em] transition-colors",
                      i === index ? "border-ink bg-ink text-bg" : "border-line-strong bg-surface text-ink hover:border-ink",
                    )}
                    aria-pressed={i === index}
                  >
                    {p.name}
                  </button>
                ))}
              </div>
              <button type="button" onClick={() => select(index + 1)} aria-label="Modelo siguiente" className={toolButton}>
                <ChevronRight size={16} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setPlaying((p) => !p)}
                aria-pressed={!playing}
                aria-label={playing ? "Pausar el carrusel" : "Reanudar el carrusel"}
                className={toolButton}
                disabled={reduce}
              >
                {playing ? <Pause size={14} aria-hidden="true" /> : <Play size={14} aria-hidden="true" />}
              </button>
            </div>
            <p className="sr-only" aria-live="polite">
              Mostrando {active.name}
            </p>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
