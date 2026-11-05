import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionHeadProps {
  eyebrow: string;
  title: ReactNode;
  text?: ReactNode;
  action?: ReactNode;
  as?: "h1" | "h2";
  className?: string;
}

export function SectionHead({ eyebrow, title, text, action, as: Heading = "h2", className }: SectionHeadProps) {
  return (
    <div className={cn("mb-9 flex flex-wrap items-end justify-between gap-6", className)}>
      <div className="min-w-0">
        <p className="eyebrow">{eyebrow}</p>
        <Heading className="mt-3 text-[clamp(30px,3.6vw,42px)] font-semibold">{title}</Heading>
      </div>
      {text ? <p className="max-w-[46ch] text-muted">{text}</p> : null}
      {action}
    </div>
  );
}
