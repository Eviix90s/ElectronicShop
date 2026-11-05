/**
 * Distintivo "Ver en 3D" para tarjetas de producto (port de `.badge3d`).
 * Presentacional: el padre lo posiciona (p. ej. `absolute top-3 right-3`) y, si
 * la tarjeta lleva la clase `group`, el hover/focus la pinta de cobre.
 */
import { Box } from "lucide-react";
import { cn } from "@/lib/utils";

export function ViewIn3DBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-[30px] items-center gap-1.5 rounded-full border border-line-strong bg-surface px-2.5 font-mono text-[11px] uppercase tracking-[0.08em] text-ink transition-[background-color,color,border-color] duration-200",
        "group-hover:border-copper group-hover:bg-copper group-hover:text-white group-focus-visible:border-copper group-focus-visible:bg-copper group-focus-visible:text-white",
        className,
      )}
    >
      <Box size={12} strokeWidth={1.6} aria-hidden="true" />
      Ver en 3D
    </span>
  );
}
