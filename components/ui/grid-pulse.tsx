"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * GridPulse — malla fina que toma color donde pasa el puntero y lo suelta un
 * momento después, con algunas celdas que se encienden solas. Adaptación del
 * componente de referencia al sistema visual de ElectronicShop (tema claro).
 *
 * Dos formas de montarlo:
 * - `attach="section"`: fondo absoluto de un contenedor posicionado.
 * - `attach="viewport"`: fondo fijo de toda la página (se monta en el layout).
 *
 * Es decoración: oculta para lectores de pantalla, transparente al puntero,
 * un solo canvas que duerme cuando no hay nada encendido, en pausa fuera de
 * pantalla y quieta si el usuario pide menos movimiento.
 */

export type GridPulseProps = Omit<React.ComponentPropsWithoutRef<"div">, "children"> & {
  /** Tamaño de celda en px. Lo comparten las líneas finas y las celdas encendidas. */
  cell?: number;
  /** Hasta qué distancia del puntero, en celdas, una celda puede encenderse. */
  reach?: number;
  /** Celdas que se encienden solas en cada latido, para que la malla nunca esté muerta. */
  ambient?: number;
  /** Tope de celdas encendidas a la vez: un barrido rápido no enciende todo el campo. */
  maxLit?: number;
  /** Selector de los elementos cuyas líneas de texto la luz respeta. */
  avoid?: string;
  /** Fondo de una sección (absoluto) o de toda la página (fijo). */
  attach?: "section" | "viewport";
  /** Matiz de la fila superior y cuánto gira hasta la fila inferior. */
  hueTop?: number;
  hueSpan?: number;
  /** Saturación de las celdas, en %. */
  saturation?: number;
};

/**
 * Cada celda toma una de estas luminosidades, así un barrido se lee como un
 * campo de tintas y no como un color plano. Escalera para fondo claro.
 */
const TINTS = [88, 80, 72, 64, 56];
/** Qué tan tenue queda una celda justo detrás de una línea de texto. */
const FAINT = 0.13;
/** Cuántas celdas tarda en recuperar toda su fuerza. */
const FADE = 2.2;
/** Margen alrededor de cada línea de texto, en px. */
const PAD = 5;
const FADE_IN = 160;
const FADE_OUT = 750;

/**
 * Elementos con texto que la luz respeta. Son los que aparecen directamente
 * sobre el fondo de la página; los botones y tarjetas ya tienen fondo propio.
 */
const TEXT_SELECTOR =
  "[data-grid-avoid], h1, h2, h3, h4, h5, p, li, dt, dd, summary, label, legend, figcaption, blockquote, th, td, time, address, small, span:not(:has(*))";

type Cell = {
  col: number;
  row: number;
  colour: string;
  /** Cuánto de su color se le permite, de 0 a 1. */
  dim: number;
  born: number;
  /** Cuándo empieza a apagarse. */
  until: number;
};

type Box = { left: number; top: number; right: number; bottom: number };

const easeOut = (t: number) => 1 - (1 - t) ** 2;
const easeIn = (t: number) => t * t;

export function GridPulse({
  cell = 24,
  reach = 2.6,
  ambient = 2,
  maxLit = 180,
  avoid = TEXT_SELECTOR,
  attach = "section",
  hueTop = 60,
  hueSpan = 270,
  saturation = 94,
  className,
  style,
  ...props
}: GridPulseProps) {
  const box = React.useRef<HTMLDivElement>(null);
  const canvas = React.useRef<HTMLCanvasElement>(null);
  const fixed = attach === "viewport";

  React.useEffect(() => {
    const el = box.current;
    const paper = canvas.current;
    const ctx = paper?.getContext("2d");
    if (!el || !paper || !ctx) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cols = 1;
    let rows = 1;
    let width = 0;
    let height = 0;
    let clear: Box[] = [];
    const cells = new Map<string, Cell>();
    const scope: ParentNode = fixed ? document : (el.parentElement ?? document);

    // Protege las líneas de texto, no las cajas que las contienen: un párrafo
    // con ancho fijo conserva ese ancho en su última línea corta y dejaría una
    // banda apagada donde no hay nada que leer. En modo página las cajas se
    // guardan en coordenadas de documento, así siguen valiendo tras el scroll.
    const measureText = () => {
      const bounds = el.getBoundingClientRect();
      const dx = fixed ? window.scrollX : -bounds.left;
      const dy = fixed ? window.scrollY : -bounds.top;
      const next: Box[] = [];
      for (const node of scope.querySelectorAll(avoid)) {
        const range = document.createRange();
        range.selectNodeContents(node);
        const lines = [...range.getClientRects()].filter((r) => r.width > 0 && r.height > 0);
        const boxes = lines.length > 0 ? lines : [node.getBoundingClientRect()];
        for (const r of boxes) {
          if (r.width === 0 || r.height === 0) continue;
          next.push({
            left: r.left + dx - PAD,
            top: r.top + dy - PAD,
            right: r.right + dx + PAD,
            bottom: r.bottom + dy + PAD,
          });
        }
      }
      clear = next;
    };

    const measure = () => {
      width = el.clientWidth;
      height = el.clientHeight;
      cols = Math.max(1, Math.ceil(width / cell));
      rows = Math.max(1, Math.ceil(height / cell));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      paper.width = Math.round(width * dpr);
      paper.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      measureText();
      wake();
    };

    /**
     * Cuánto puede brillar una celda según su distancia a la línea de texto
     * más cercana. Detrás de las palabras queda tenue, no apagada: un hueco en
     * la malla se lee como un fallo; una bajada de brillo, como profundidad.
     */
    const brightness = (col: number, row: number) => {
      const x = col * cell + cell / 2 + (fixed ? window.scrollX : 0);
      const y = row * cell + cell / 2 + (fixed ? window.scrollY : 0);
      const limit = FADE * cell;
      let nearest = Number.POSITIVE_INFINITY;
      for (const r of clear) {
        if (r.top - y > limit || y - r.bottom > limit || r.left - x > limit || x - r.right > limit) continue;
        const ddx = Math.max(r.left - x, 0, x - r.right);
        const ddy = Math.max(r.top - y, 0, y - r.bottom);
        nearest = Math.min(nearest, Math.hypot(ddx, ddy));
        if (nearest === 0) break;
      }
      if (nearest === Number.POSITIVE_INFINITY) return 1;
      return FAINT + (1 - FAINT) * Math.min(1, nearest / limit);
    };

    // El espectro recorre el campo de arriba abajo como una carta de color
    // impresa: un barrido revela una banda coherente, no confeti.
    const ink = (row: number) => {
      const t = rows > 1 ? Math.min(1, row / (rows - 1)) : 0;
      const hue = (((hueTop - t * hueSpan) % 360) + 360) % 360;
      const tint = TINTS[Math.floor(Math.random() * TINTS.length)];
      return `hsl(${Math.round(hue)} ${saturation}% ${tint}%)`;
    };

    // Un solo bucle dibuja todas las celdas y solo corre mientras hay algo encendido.
    let frame = 0;
    const draw = (now: number) => {
      frame = 0;
      ctx.clearRect(0, 0, width, height);
      for (const [key, c] of cells) {
        let alpha: number;
        if (now < c.until) {
          alpha = easeOut(Math.min(1, (now - c.born) / FADE_IN));
        } else {
          const t = (now - c.until) / FADE_OUT;
          if (t >= 1) {
            cells.delete(key);
            continue;
          }
          alpha = 1 - easeIn(t);
        }
        ctx.globalAlpha = alpha * c.dim;
        ctx.fillStyle = c.colour;
        // Un px hacia dentro, para que la línea siga viéndose entre celdas.
        ctx.fillRect(c.col * cell + 1, c.row * cell + 1, cell - 1, cell - 1);
      }
      ctx.globalAlpha = 1;
      if (cells.size > 0) frame = requestAnimationFrame(draw);
    };
    const wake = () => {
      if (!frame) frame = requestAnimationFrame(draw);
    };

    /** Enciende una celda, salvo que esté fuera de la malla o ya encendida. */
    const light = (col: number, row: number, hold: number) => {
      if (col < 0 || row < 0 || col >= cols || row >= rows) return;
      if (cells.size >= maxLit) return;
      const key = `${col},${row}`;
      const now = performance.now();
      const lit = cells.get(key);
      if (lit && now < lit.until) return;
      // Una celda alcanzada mientras se apaga retoma desde donde iba, en vez
      // de parpadear.
      let born = now;
      if (lit) {
        const faded = 1 - easeIn(Math.min(1, (now - lit.until) / FADE_OUT));
        born = now - (1 - Math.sqrt(1 - faded)) * FADE_IN;
      }
      cells.set(key, {
        col,
        row,
        colour: lit?.colour ?? ink(row),
        dim: brightness(col, row),
        born,
        until: now + hold,
      });
      wake();
    };

    // El puntero pinta. Las celdas lejanas se encienden menos seguido, así el
    // borde de la estela se deshace en vez de moverse como un bloque.
    let pending = 0;
    let at: { x: number; y: number } | null = null;
    const paint = () => {
      pending = 0;
      if (!at) return;
      const cx = Math.floor(at.x / cell);
      const cy = Math.floor(at.y / cell);
      const span = Math.ceil(reach);
      for (let dy = -span; dy <= span; dy++) {
        for (let dx = -span; dx <= span; dx++) {
          const away = Math.hypot(dx, dy);
          if (away > reach) continue;
          if (Math.random() > 1 - away / (reach + 0.6)) continue;
          light(cx + dx, cy + dy, 260 + Math.random() * 900);
        }
      }
    };
    // Se escucha en window porque la malla va debajo del contenido y nunca
    // recibe el puntero.
    const onMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const bounds = el.getBoundingClientRect();
      at = { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
      if (!pending) pending = requestAnimationFrame(paint);
    };

    // Algunas celdas se encienden solas: la malla está viva al llegar y en
    // pantallas sin puntero. En pausa mientras no se ve.
    let visible = true;
    let beat = 0;
    const drift = () => {
      beat = window.setTimeout(drift, 1400 + Math.random() * 1800);
      if (!visible || document.hidden) return;
      for (let i = 0; i < ambient; i++) {
        light(Math.floor(Math.random() * cols), Math.floor(Math.random() * rows), 900 + Math.random() * 1600);
      }
    };
    beat = window.setTimeout(drift, 500);

    const sight = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? true;
    });
    sight.observe(el);
    const resize = new ResizeObserver(measure);
    resize.observe(el);

    // Texto añadido, quitado o reescrito mueve las líneas que hay que respetar.
    let recheck = 0;
    const scheduleText = () => {
      if (!recheck) {
        recheck = requestAnimationFrame(() => {
          recheck = 0;
          measureText();
        });
      }
    };
    const copy = new MutationObserver(scheduleText);
    copy.observe(fixed ? document.body : (el.parentElement ?? document.body), {
      childList: true,
      subtree: true,
      characterData: true,
    });

    // En modo página, las animaciones de entrada y el contenido diferido
    // recolocan el texto: se vuelve a medir cuando el scroll se detiene.
    let settle = 0;
    const onScroll = () => {
      window.clearTimeout(settle);
      settle = window.setTimeout(measureText, 180);
    };
    if (fixed) window.addEventListener("scroll", onScroll, { passive: true });

    measure();
    // Las líneas de texto se mueven cuando llegan las fuentes web.
    document.fonts?.ready.then(measureText).catch(() => {});
    window.addEventListener("pointermove", onMove, { passive: true });

    return () => {
      sight.disconnect();
      resize.disconnect();
      copy.disconnect();
      cancelAnimationFrame(recheck);
      cancelAnimationFrame(frame);
      cancelAnimationFrame(pending);
      clearTimeout(beat);
      window.clearTimeout(settle);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onMove);
    };
  }, [cell, reach, ambient, maxLit, avoid, fixed, hueTop, hueSpan, saturation]);

  return (
    <div
      ref={box}
      aria-hidden="true"
      data-slot="grid-pulse"
      className={cn("pointer-events-none overflow-hidden", fixed ? "fixed inset-0 -z-10" : "absolute inset-0", className)}
      style={
        {
          // Las líneas finas, tenues por sí solas para que las celdas
          // encendidas conserven toda su tinta. Se cambia con --grid-pulse-line.
          "--grid-pulse-line": "color-mix(in oklab, var(--color-ink) 7%, transparent)",
          "--grid-pulse-cell": `${cell}px`,
          backgroundImage:
            "linear-gradient(to right, var(--grid-pulse-line) 1px, transparent 1px), linear-gradient(to bottom, var(--grid-pulse-line) 1px, transparent 1px)",
          backgroundSize: "var(--grid-pulse-cell) var(--grid-pulse-cell)",
          ...style,
        } as React.CSSProperties
      }
      {...props}
    >
      <canvas ref={canvas} className="absolute inset-0 size-full" />
    </div>
  );
}
