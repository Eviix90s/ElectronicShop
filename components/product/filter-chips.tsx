import Link from "next/link";
import { categories } from "@/lib/data";
import type { CategorySlug } from "@/lib/data/types";
import { cn } from "@/lib/utils";

interface FilterChipsProps {
  active?: CategorySlug;
  query?: string;
  counts: Partial<Record<CategorySlug, number>>;
  total: number;
}

function href(categoria: string | undefined, query: string | undefined) {
  const p = new URLSearchParams();
  if (categoria) p.set("categoria", categoria);
  if (query) p.set("q", query);
  const s = p.toString();
  return `/tienda${s ? `?${s}` : ""}`;
}

export function FilterChips({ active, query, counts, total }: FilterChipsProps) {
  const chip = (label: string, n: number, target: string | undefined, isActive: boolean) => (
    <Link
      key={label}
      href={href(target, query)}
      scroll={false}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "inline-flex h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-sm transition-colors",
        isActive ? "border-ink bg-ink text-bg" : "glass text-ink hover:text-copper",
      )}
    >
      {label}
      <span className={cn("font-mono text-[11px] tabular", isActive ? "text-bg/70" : "text-muted")}>{n}</span>
    </Link>
  );
  return (
    <nav className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]" aria-label="Categorías">
      {chip("Todo", total, undefined, !active)}
      {categories.map((c) => chip(c.shortName, counts[c.slug] ?? 0, c.slug, active === c.slug))}
    </nav>
  );
}
