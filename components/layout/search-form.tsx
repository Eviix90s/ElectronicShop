"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchFormProps {
  initialQuery?: string;
  className?: string;
  size?: "sm" | "lg";
  autoFocus?: boolean;
}

/** Busca en /tienda?q=... Mantiene el filtro de categoría si ya se está en la tienda. */
export function SearchForm({ initialQuery = "", className, size = "sm", autoFocus }: SearchFormProps) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuery);

  function submit(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(window.location.pathname === "/tienda" ? window.location.search : "");
    if (q.trim()) params.set("q", q.trim());
    else params.delete("q");
    router.push(`/tienda${params.toString() ? `?${params}` : ""}`);
  }

  return (
    <form onSubmit={submit} role="search" className={cn("relative", className)}>
      <label htmlFor="buscar" className="sr-only">
        Buscar productos
      </label>
      <Search
        className={cn("pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted", size === "lg" ? "left-4 size-5" : "left-3 size-4")}
        strokeWidth={1.6}
        aria-hidden="true"
      />
      <input
        id="buscar"
        name="q"
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="ESP32, resistor 1k, protoboard…"
        autoFocus={autoFocus}
        className={cn(
          "glass w-full rounded-full text-ink placeholder:text-muted/70 focus:border-ink focus:outline-none",
          size === "lg" ? "h-13 pr-11 pl-11 text-base" : "h-11 pr-9 pl-9 text-sm",
        )}
      />
      {q ? (
        <button
          type="button"
          onClick={() => setQ("")}
          className="absolute top-1/2 right-2 grid size-7 -translate-y-1/2 place-items-center rounded-full text-muted hover:text-ink"
          aria-label="Borrar búsqueda"
        >
          <X className="size-4" strokeWidth={1.6} aria-hidden="true" />
        </button>
      ) : null}
    </form>
  );
}
