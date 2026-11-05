import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "ok" | "copper" | "danger";

const tones: Record<Tone, string> = {
  neutral: "border-line-strong text-ink",
  ok: "border-transparent bg-pcb-soft text-pcb",
  copper: "border-transparent bg-copper-soft text-copper",
  danger: "border-transparent bg-danger-soft text-danger",
};

interface TagProps extends ComponentProps<"span"> {
  tone?: Tone;
}

export function Tag({ tone = "neutral", className, ...props }: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex h-[30px] items-center gap-1.5 rounded-full border px-2.5 font-mono text-[11px] uppercase tracking-[0.08em]",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}

export function StockDot({ stock, className }: { stock: number; className?: string }) {
  const out = stock <= 0;
  const low = stock > 0 && stock <= 5;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 font-mono text-xs",
        out ? "text-danger" : low ? "text-copper" : "text-pcb",
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", out ? "bg-danger" : low ? "bg-copper" : "bg-pcb")} />
      {out ? "Agotado" : low ? `Quedan ${stock}` : `${stock} en stock`}
    </span>
  );
}
