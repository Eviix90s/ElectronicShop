"use client";

/**
 * Visor 3D a pantalla completa (port del `.viewer` del prototipo): cabecera con
 * categoría y nombre, lienzo que ocupa el centro, pie con pistas, precio y acciones.
 * Escape y clic en el fondo cierran; bloquea el scroll del body; mueve el foco al
 * botón de cerrar al abrir y lo devuelve al cerrar.
 */
import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CategorySlug, Product } from "@/lib/data/types";
import { ProductViewer, type ProductViewerHandle } from "./product-viewer";

export type ViewerModalProduct = Pick<Product, "name" | "category" | "price" | "model3d" | "slug">;

export interface ViewerModalProps {
  open: boolean;
  product: ViewerModalProduct | null;
  onClose: () => void;
  /** Si no se pasa, el botón "Añadir al carrito" no se muestra */
  onAddToCart?: () => void;
  /** Texto de la categoría; por defecto se deriva del slug */
  categoryLabel?: string;
}

const CATEGORY_LABEL: Record<CategorySlug, string> = {
  "placas-de-desarrollo": "Placas de desarrollo",
  "componentes-electronicos": "Componentes electrónicos",
  "accesorios-electronicos": "Accesorios electrónicos",
  "herramientas-electronicas": "Herramientas electrónicas",
  "kits-de-aprendizaje": "Kits de aprendizaje",
  "modulos-electronicos": "Módulos electrónicos",
  "sensores-electronicos": "Sensores electrónicos",
};

const mxn = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const pill =
  "inline-flex h-10 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-full border px-4 text-sm font-medium transition-[background-color,color,border-color,box-shadow] duration-200";
const pillGhost = "border-line-strong bg-transparent text-ink hover:border-ink hover:bg-surface";
const pillInk = "border-ink bg-ink text-bg hover:shadow-[0_8px_20px_-10px_rgb(0_0_0/0.5)]";

export function ViewerModal({ open, product, onClose, onAddToCart, categoryLabel }: ViewerModalProps) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const viewerRef = useRef<ProductViewerHandle | null>(null);

  const active = open && !!product?.model3d;

  // Bloqueo de scroll y gestión del foco mientras está abierto
  useEffect(() => {
    if (!active) return;
    const previous = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      previous?.focus?.();
    };
  }, [active]);

  // Escape cierra (efecto aparte para que un onClose nuevo no reinicie el foco)
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [active, onClose]);

  if (!active || !product?.model3d) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex flex-col bg-bg/75 pt-[env(safe-area-inset-top,0px)] pr-[max(1rem,env(safe-area-inset-right,0px))] pb-[env(safe-area-inset-bottom,0px)] pl-[max(1rem,env(safe-area-inset-left,0px))] backdrop-blur-2xl"
    >
      <style>{`@keyframes es-viewer-rise{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}`}</style>

      <header className="flex h-[68px] flex-none items-center justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="mono-label">{categoryLabel ?? CATEGORY_LABEL[product.category]}</span>
          <b id={titleId} className="truncate text-lg font-semibold">
            {product.name}
          </b>
        </div>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Cerrar visor"
          className="grid size-11 flex-none cursor-pointer place-items-center rounded-full border border-line-strong bg-surface text-ink transition-colors duration-200 hover:border-ink"
        >
          <X size={16} strokeWidth={1.6} aria-hidden="true" />
        </button>
      </header>

      <ProductViewer
        key={product.slug}
        ref={viewerRef}
        modelId={product.model3d}
        fov={28}
        wheelZoom="always" touchAction="none"
        showHint={false}
        frameMarks={false}
        className={cn(
          "min-h-0 flex-1",
          "[animation:es-viewer-rise_.5s_cubic-bezier(.2,.7,.2,1)_both] motion-reduce:[animation:none]",
        )}
        stageClassName="aspect-auto min-h-0 flex-1 rounded-none border-0 bg-transparent"
      />

      <footer className="flex flex-none flex-wrap items-center justify-between gap-4 pt-3.5 pb-[18px]">
        <div className="flex flex-wrap gap-[18px]">
          <span className="mono-label">Arrastra para girar</span>
          <span className="mono-label">Rueda o pellizco para acercar</span>
          <span className="mono-label tabular text-ink">{mxn.format(product.price)}</span>
        </div>
        <div className="flex gap-2.5">
          <button type="button" onClick={() => viewerRef.current?.reset()} className={cn(pill, pillGhost)}>
            Centrar
          </button>
          {onAddToCart && (
            <button type="button" onClick={onAddToCart} className={cn(pill, pillInk)}>
              Añadir al carrito
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
