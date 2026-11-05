"use client";

/**
 * Visor 3D de producto (React Three Fiber). Port de la clase `Viewer` del prototipo:
 * pivote con amortiguación, arrastre para girar, rueda/pellizco para acercar,
 * giro automático tras 2.5 s de reposo, puntos de interés proyectados sobre el
 * lienzo que se desvanecen al quedar detrás del modelo, enfoque de hotspot y "Centrar".
 *
 * Los puntos de interés se dibujan como botones DOM en una capa sobre el canvas
 * (como el `.hots` del prototipo) y se posicionan en cada frame; así no dependen de
 * drei <Html> (que crea una raíz React por punto y avisa al desmontar en StrictMode).
 */
import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type Ref,
  type RefObject,
} from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Focus, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DEFAULT_ROTATION,
  HOTSPOTS,
  buildModel,
  fitDistance,
  modelBounds,
  monoFontFamily,
  type Hotspot,
  type ModelBounds,
  type ModelId,
} from "./models";
import { GroundShadow, StudioEnvironment, StudioLights } from "./studio";

/**
 * "modifier": la rueda solo acerca con Ctrl/Cmd o tras hacer clic dentro del visor
 * (hasta que el puntero sale); si no, la página sigue haciendo scroll.
 * "always": la rueda siempre acerca (modal a pantalla completa).
 */
export type WheelZoomMode = "always" | "modifier";

export interface ProductViewerHandle {
  /** Vuelve a la rotación y distancia iniciales */
  reset(): void;
  /** Gira hacia el punto de interés `index` y acerca ligeramente */
  focusHotspot(index: number): void;
  /** Multiplica la distancia objetivo (<1 acerca, >1 aleja) dentro de los límites */
  zoomBy(factor: number): void;
}

export interface ProductViewerProps {
  modelId: ModelId;
  /** Clases del contenedor raíz (columna: escenario + fila de ayuda) */
  className?: string;
  /** Clases del escenario (por defecto 16/10, mínimo 320 px, borde y fondo surface) */
  stageClassName?: string;
  /** Giro automático tras 2.5 s sin interacción (se desactiva con prefers-reduced-motion) */
  autoRotate?: boolean;
  showHotspots?: boolean;
  /** Fila de ayuda + botones Centrar / acercar / alejar bajo el lienzo */
  showHint?: boolean;
  /** Marcas de esquina decorativas del escenario */
  frameMarks?: boolean;
  /** Comportamiento de la rueda del ratón; por defecto "modifier" */
  wheelZoom?: WheelZoomMode;
  /** Rotación inicial [rx, ry]; por defecto la del prototipo para cada modelo */
  initialRotation?: [number, number];
  /** FOV vertical de la cámara (24–28). Inline 26, modal 28 */
  fov?: number;
  /** Multiplicador de la distancia de encuadre (prototipo: 1.0 portada, 1.05 modal) */
  distanceFactor?: number;
  /** Se llama cuando el modelo está construido y montado */
  onReady?: () => void;
  ref?: Ref<ProductViewerHandle>;
}

const clamp = THREE.MathUtils.clamp;
const TWO_PI = Math.PI * 2;

/** Estado mutable del pivote/cámara, fuera de React (se lee y escribe en cada frame) */
class Rig {
  rx = 0;
  ry = 0;
  dist = 6;
  rxT = 0;
  ryT = 0;
  distT = 6;
  rx0 = 0;
  ry0 = 0;
  dist0 = 6;
  minD = 3;
  maxD = 12;
  r = 1;
  idle = 0;
  dragging = false;
  pinch = 0;
  px = 0;
  py = 0;
  autoRotate = true;
  wheelZoom: WheelZoomMode = "modifier";
  /** El usuario ya hizo clic dentro del visor (habilita la rueda en modo "modifier") */
  engaged = false;
  ready = false;
  hotspots: Hotspot[] = [];
  spots: (HTMLElement | null)[] = [];

  setModel(b: ModelBounds, rot: [number, number], fov: number, distK: number) {
    const r = b.radius * 1.15;
    const d = fitDistance(r, fov);
    this.r = r;
    this.dist0 = d * distK;
    this.minD = d * 0.5;
    this.maxD = d * 2.2;
    this.rx0 = rot[0];
    this.ry0 = rot[1];
    this.rx = rot[0] - 0.35;
    this.ry = rot[1] - 0.7;
    this.rxT = rot[0];
    this.ryT = rot[1];
    this.dist = this.dist0 * 1.25;
    this.distT = this.dist0;
    this.idle = 0;
    this.dragging = false;
    this.pinch = 0;
    this.ready = true;
  }

  /** Ángulo equivalente más cercano a la rotación actual (evita vueltas completas) */
  nearest(target: number) {
    const k = Math.round((this.ry - target) / TWO_PI);
    return target + k * TWO_PI;
  }

  focusHotspot(i: number) {
    const h = this.hotspots[i];
    if (!h) return;
    this.rxT = h.rotation[0];
    this.ryT = this.nearest(h.rotation[1]);
    this.distT = this.dist0 * 0.82;
    this.idle = -6;
  }

  reset() {
    this.rxT = this.rx0;
    this.ryT = this.nearest(this.ry0);
    this.distT = this.dist0;
    this.idle = 0;
  }

  zoomBy(factor: number) {
    this.distT = clamp(this.distT * factor, this.minD, this.maxD);
    this.idle = 0;
  }
}

/* ---------- hooks ---------- */

/** Rig estable por instancia; se muta solo en efectos, manejadores y useFrame */
function useRig(): RefObject<Rig> {
  const ref = useRef<Rig | null>(null);
  if (ref.current === null) ref.current = new Rig();
  return ref as RefObject<Rig>;
}

const REDUCED = "(prefers-reduced-motion: reduce)";
function subscribeReduced(cb: () => void) {
  const mq = window.matchMedia(REDUCED);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
function useReducedMotion() {
  return useSyncExternalStore(
    subscribeReduced,
    () => window.matchMedia(REDUCED).matches,
    () => false,
  );
}

/** Espera a la fuente mono (máx. 1.5 s) antes de dibujar la serigrafía, como el prototipo */
function useFontsReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let alive = true;
    const done = () => {
      if (alive) setReady(true);
    };
    const fonts = document.fonts;
    if (!fonts) {
      done();
      return;
    }
    const timer = window.setTimeout(done, 1500);
    const family = monoFontFamily().split(",")[0];
    Promise.all([fonts.ready, fonts.load(`500 16px ${family}`).catch(() => [])]).then(done, done);
    return () => {
      alive = false;
      window.clearTimeout(timer);
    };
  }, []);
  return ready;
}

/* ---------- piezas dentro del Canvas ---------- */

interface RigDriverProps {
  rigRef: RefObject<Rig>;
  pivotRef: RefObject<THREE.Group | null>;
}

/** Entrada de puntero/rueda/pellizco sobre el lienzo y actualización por frame */
function RigDriver({ rigRef, pivotRef }: RigDriverProps) {
  const gl = useThree((s) => s.gl);
  const world = useMemo(() => new THREE.Vector3(), []);
  const view = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    const rig = rigRef.current;
    const el = gl.domElement;

    const down = (e: PointerEvent) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      rig.dragging = true;
      rig.px = e.clientX;
      rig.py = e.clientY;
      rig.idle = 0;
      try {
        el.setPointerCapture(e.pointerId);
      } catch {
        /* algunos navegadores lanzan si el puntero ya no está activo */
      }
    };
    const move = (e: PointerEvent) => {
      if (!rig.dragging) return;
      rig.ryT += (e.clientX - rig.px) * 0.008;
      rig.rxT = clamp(rig.rxT + (e.clientY - rig.py) * 0.008, -1.4, 1.4);
      rig.px = e.clientX;
      rig.py = e.clientY;
      rig.idle = 0;
    };
    const up = () => {
      rig.dragging = false;
    };
    const wheel = (e: WheelEvent) => {
      // En modo "modifier" la rueda hace scroll salvo con Ctrl/Cmd o tras un clic en el visor
      if (rig.wheelZoom === "modifier" && !rig.engaged && !e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      rig.distT = clamp(rig.distT * (1 + Math.sign(e.deltaY) * 0.08), rig.minD, rig.maxD);
      rig.idle = 0;
    };
    const span = (t: TouchList) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);
    const touchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        rig.pinch = span(e.touches);
        rig.dragging = false;
      }
    };
    const touchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && rig.pinch) {
        const d = span(e.touches);
        rig.distT = clamp(rig.distT * (rig.pinch / d), rig.minD, rig.maxD);
        rig.pinch = d;
        rig.idle = 0;
      }
    };
    const touchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) rig.pinch = 0;
    };

    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    el.addEventListener("wheel", wheel, { passive: false });
    el.addEventListener("touchstart", touchStart, { passive: true });
    el.addEventListener("touchmove", touchMove, { passive: true });
    el.addEventListener("touchend", touchEnd, { passive: true });
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      el.removeEventListener("wheel", wheel);
      el.removeEventListener("touchstart", touchStart);
      el.removeEventListener("touchmove", touchMove);
      el.removeEventListener("touchend", touchEnd);
    };
  }, [gl, rigRef]);

  useFrame(({ camera, size }, delta) => {
    const rig = rigRef.current;
    const pivot = pivotRef.current;
    if (!pivot || !rig.ready) return;
    const dt = Math.min(delta, 0.05);
    rig.idle += dt;
    if (!rig.dragging && rig.idle > 2.5 && rig.autoRotate) rig.ryT += dt * 0.22;
    rig.rx += (rig.rxT - rig.rx) * 0.1;
    rig.ry += (rig.ryT - rig.ry) * 0.1;
    rig.dist += (rig.distT - rig.dist) * 0.1;
    pivot.rotation.set(rig.rx, rig.ry, 0);
    camera.position.set(0, rig.dist * 0.3, rig.dist * 0.95);
    camera.lookAt(0, 0, 0);
    pivot.updateMatrixWorld();
    camera.updateMatrixWorld();

    // Proyección de los puntos de interés sobre el lienzo + desvanecido "detrás"
    const limit = -rig.dist - rig.r * 0.12;
    const w = size.width;
    const h = size.height;
    for (let i = 0; i < rig.hotspots.length; i++) {
      const el = rig.spots[i];
      if (!el) continue;
      const p = rig.hotspots[i].position;
      world.set(p[0], p[1], p[2]).applyMatrix4(pivot.matrixWorld);
      const vz = view.copy(world).applyMatrix4(camera.matrixWorldInverse).z;
      const behind = vz < limit;
      world.project(camera);
      el.style.left = `${(((world.x + 1) / 2) * w).toFixed(1)}px`;
      el.style.top = `${(((1 - world.y) / 2) * h).toFixed(1)}px`;
      if (el.hasAttribute("data-behind") !== behind) el.toggleAttribute("data-behind", behind);
    }
  });

  return null;
}

/* ---------- capa DOM de puntos de interés ---------- */

interface HotspotMarkerProps {
  hotspot: Hotspot;
  index: number;
  active: boolean;
  onSelect: (index: number) => void;
  register: (index: number, el: HTMLElement | null) => void;
}

/** Punto cobre + etiqueta mono; nace oculto hasta que el primer frame lo posiciona */
function HotspotMarker({ hotspot, index, active, onSelect, register }: HotspotMarkerProps) {
  return (
    <button
      ref={(el) => register(index, el)}
      type="button"
      aria-label={hotspot.label}
      aria-pressed={active}
      data-behind=""
      onClick={() => onSelect(index)}
      className="group pointer-events-auto absolute flex -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center gap-2 p-1.5 transition-opacity duration-250 data-behind:pointer-events-none data-behind:opacity-0"
    >
      <span
        aria-hidden="true"
        className={cn(
          "block size-3.5 flex-none rounded-full bg-copper shadow-[0_0_0_4px_var(--color-surface),0_0_0_5px_var(--color-copper-soft)] transition-transform duration-200 group-hover:scale-125",
          active && "scale-125",
        )}
      />
      <span
        className={cn(
          "whitespace-nowrap rounded-full border border-line bg-surface px-2.5 py-[5px] font-mono text-xs tracking-[0.02em] text-ink shadow-tile",
          active ? "block" : "hidden md:block",
        )}
      >
        {hotspot.label}
      </span>
    </button>
  );
}

const CORNERS = [
  "top-2.5 left-2.5 border-t border-l",
  "top-2.5 right-2.5 border-t border-r",
  "bottom-2.5 left-2.5 border-b border-l",
  "bottom-2.5 right-2.5 border-b border-r",
];

const toolButton =
  "inline-flex cursor-pointer items-center justify-center rounded-full border border-line-strong bg-surface text-ink transition-colors duration-200 hover:border-ink";

/* ---------- componente público ---------- */

export function ProductViewer({
  modelId,
  className,
  stageClassName,
  autoRotate = true,
  showHotspots = true,
  showHint = true,
  frameMarks = true,
  wheelZoom = "modifier",
  initialRotation,
  fov = 26,
  distanceFactor = 1.05,
  onReady,
  ref,
}: ProductViewerProps) {
  const rigRef = useRig();
  const pivotRef = useRef<THREE.Group | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const onReadyRef = useRef(onReady);
  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  const fontsReady = useFontsReady();
  const reduced = useReducedMotion();
  const [visible, setVisible] = useState(true);
  const [activeFor, setActiveFor] = useState<[ModelId, number | null]>([modelId, null]);
  const active = activeFor[0] === modelId ? activeFor[1] : null;

  const model = useMemo(() => (fontsReady ? buildModel(modelId) : null), [modelId, fontsReady]);
  const bounds = useMemo(() => (model ? modelBounds(model) : null), [model]);
  const hotspots = useMemo<Hotspot[]>(() => (model ? HOTSPOTS[modelId] : []), [model, modelId]);
  const [rx0, ry0] = initialRotation ?? DEFAULT_ROTATION[modelId];

  // Encuadre y rotación inicial al (re)construir el modelo
  useLayoutEffect(() => {
    if (!bounds) return;
    const rig = rigRef.current;
    rig.setModel(bounds, [rx0, ry0], fov, distanceFactor);
    rig.hotspots = hotspots;
  }, [rigRef, bounds, hotspots, rx0, ry0, fov, distanceFactor]);

  useEffect(() => {
    rigRef.current.autoRotate = autoRotate && !reduced;
  }, [rigRef, autoRotate, reduced]);

  useEffect(() => {
    rigRef.current.wheelZoom = wheelZoom;
    if (wheelZoom === "always") rigRef.current.engaged = false;
  }, [rigRef, wheelZoom]);

  useEffect(() => {
    if (model) onReadyRef.current?.();
  }, [model]);

  // Pausa el bucle de render cuando el visor no está en pantalla
  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver((entries) => setVisible(entries.some((e) => e.isIntersecting)));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const reset = useCallback(() => {
    rigRef.current.reset();
    setActiveFor([modelId, null]);
  }, [rigRef, modelId]);

  const focusHotspot = useCallback(
    (i: number) => {
      const rig = rigRef.current;
      if (!rig.hotspots[i]) return;
      rig.focusHotspot(i);
      setActiveFor([modelId, i]);
    },
    [rigRef, modelId],
  );

  const zoomBy = useCallback(
    (factor: number) => {
      rigRef.current.zoomBy(factor);
    },
    [rigRef],
  );

  const register = useCallback(
    (i: number, el: HTMLElement | null) => {
      rigRef.current.spots[i] = el;
    },
    [rigRef],
  );

  useImperativeHandle(ref, () => ({ reset, focusHotspot, zoomBy }), [reset, focusHotspot, zoomBy]);

  const hintText =
    wheelZoom === "modifier"
      ? "Arrastra para girar · Ctrl + rueda para acercar"
      : "Arrastra para girar · Rueda o pellizco para acercar";

  return (
    <div ref={rootRef} className={cn("flex w-full flex-col", className)}>
      <div
        role="group"
        aria-label="Visor 3D interactivo del producto"
        onPointerDownCapture={() => {
          rigRef.current.engaged = true;
        }}
        onPointerLeave={() => {
          rigRef.current.engaged = false;
        }}
        className={cn(
          "relative aspect-[16/10] min-h-80 w-full overflow-hidden rounded-md border border-line bg-surface",
          stageClassName,
        )}
      >
        <Canvas
          shadows
          dpr={[1, 2]}
          frameloop={visible ? "always" : "never"}
          camera={{ fov, near: 0.1, far: 100, position: [0, 1.8, 5.7] }}
          gl={{
            antialias: true,
            alpha: true,
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1,
            outputColorSpace: THREE.SRGBColorSpace,
          }}
          style={{ position: "absolute", inset: 0 }}
          className="touch-none cursor-grab active:cursor-grabbing"
        >
          <StudioEnvironment />
          <StudioLights />
          <RigDriver rigRef={rigRef} pivotRef={pivotRef} />
          <group ref={pivotRef}>{model && <primitive object={model} dispose={null} />}</group>
          {bounds && <GroundShadow bottomY={bounds.bottom} footprint={[bounds.size.x, bounds.size.z]} />}
        </Canvas>

        {model && showHotspots && (
          <div className="pointer-events-none absolute inset-0">
            {hotspots.map((h, i) => (
              <HotspotMarker
                key={`${modelId}-${i}`}
                hotspot={h}
                index={i}
                active={active === i}
                onSelect={focusHotspot}
                register={register}
              />
            ))}
          </div>
        )}

        {frameMarks &&
          CORNERS.map((c) => (
            <span key={c} aria-hidden="true" className={cn("pointer-events-none absolute size-3.5 border-line-strong", c)} />
          ))}
      </div>

      {showHint && (
        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="min-w-0 font-mono text-xs tracking-[0.04em] text-muted">{hintText}</p>
          <div className="flex flex-none items-center gap-1.5">
            <button type="button" onClick={() => zoomBy(1.25)} aria-label="Alejar" className={cn(toolButton, "size-9")}>
              <Minus size={14} aria-hidden="true" />
            </button>
            <button type="button" onClick={() => zoomBy(0.8)} aria-label="Acercar" className={cn(toolButton, "size-9")}>
              <Plus size={14} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={reset}
              className={cn(toolButton, "h-9 gap-1.5 px-3 font-mono text-xs tracking-[0.04em]")}
            >
              <Focus size={14} aria-hidden="true" />
              Centrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
