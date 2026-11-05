import { Plus } from "lucide-react";
import type { FaqItem } from "@/lib/data/types";
import { cn } from "@/lib/utils";

interface FaqListProps {
  items: FaqItem[];
  className?: string;
  /** Abre la primera pregunta por defecto */
  openFirst?: boolean;
}

/** Acordeón nativo (details/summary): accesible y sin JS. */
export function FaqList({ items, className, openFirst }: FaqListProps) {
  return (
    <div className={cn("border-t border-line [&>details:last-child]:border-b-0", className)}>
      {items.map((f, i) => (
        <details key={f.id} className="group border-b border-line" open={openFirst && i === 0}>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-left text-[17px] font-semibold marker:hidden [&::-webkit-details-marker]:hidden md:text-[18px]">
            {f.question}
            <span className="grid size-9 shrink-0 place-items-center rounded-full border border-line-strong bg-surface/70 text-muted transition-[transform,color,border-color] duration-200 group-open:rotate-45 group-open:border-copper group-open:text-copper">
              <Plus className="size-4" strokeWidth={1.6} aria-hidden="true" />
            </span>
          </summary>
          <p className="max-w-[65ch] pb-5 text-muted">{f.answer}</p>
        </details>
      ))}
    </div>
  );
}
