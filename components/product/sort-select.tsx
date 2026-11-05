"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";

export const sortOptions = [
  { value: "relevancia", label: "Relevancia" },
  { value: "precio-asc", label: "Precio: menor a mayor" },
  { value: "precio-desc", label: "Precio: mayor a menor" },
  { value: "nombre", label: "Nombre A–Z" },
] as const;

export type SortValue = (typeof sortOptions)[number]["value"];

export function SortSelect({ value }: { value: SortValue }) {
  const router = useRouter();
  const params = useSearchParams();
  return (
    <label className="relative inline-flex items-center">
      <span className="sr-only">Ordenar por</span>
      <select
        id="orden"
        value={value}
        onChange={(e) => {
          const next = new URLSearchParams(params.toString());
          if (e.target.value === "relevancia") next.delete("orden");
          else next.set("orden", e.target.value);
          router.push(`/tienda${next.toString() ? `?${next}` : ""}`, { scroll: false });
        }}
        className="glass h-10 cursor-pointer appearance-none rounded-full pr-9 pl-4 font-mono text-xs tracking-[0.04em] text-ink focus:border-ink focus:outline-none"
      >
        {sortOptions.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 size-4 text-muted" strokeWidth={1.6} aria-hidden="true" />
    </label>
  );
}
