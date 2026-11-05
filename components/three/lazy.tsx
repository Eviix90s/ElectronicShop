"use client";

/**
 * Carga diferida (solo cliente) del visor y del modal: three.js no entra en el
 * bundle inicial ni se evalúa en el servidor.
 */
import dynamic from "next/dynamic";

function ViewerSkeleton() {
  return <div className="aspect-[16/10] w-full animate-pulse rounded-md border border-line bg-surface" />;
}

export const LazyProductViewer = dynamic(() => import("./product-viewer").then((m) => m.ProductViewer), {
  ssr: false,
  loading: ViewerSkeleton,
});

export const LazyViewerModal = dynamic(() => import("./viewer-modal").then((m) => m.ViewerModal), {
  ssr: false,
  loading: () => null,
});
