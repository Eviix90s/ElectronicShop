import Link from "next/link";
import { ArrowUpRight, LayoutGrid } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { Icon } from "@/components/ui/icon";
import { categories, countByCategory, products } from "@/lib/data";
import { cn, plural } from "@/lib/utils";

const card =
  "group flex min-h-[188px] flex-col justify-between gap-8 rounded-[22px] p-6 transition-colors md:p-7";

/** Siete categorías más "Ver todo", en tarjetas de vidrio separadas; la última va en negro como acento. */
export function CategoryTiles({ className }: { className?: string }) {
  const counts = countByCategory();
  return (
    <div className={cn("grid grid-cols-1 gap-4 xs:grid-cols-2 lg:grid-cols-4 lg:gap-5", className)}>
      {categories.map((c, i) => (
        <Reveal key={c.slug} index={i} className="flex">
          <Link href={`/tienda?categoria=${c.slug}`} className={`glass glass-lift w-full ${card}`}>
            <span className="flex items-start justify-between gap-3">
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-copper-soft text-copper transition-[scale,rotate] duration-300 group-hover:scale-110 group-hover:-rotate-6">
                <Icon name={c.icon} className="size-5" />
              </span>
              <ArrowUpRight
                className="size-5 shrink-0 text-muted transition-[color,transform] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-copper"
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </span>
            <span>
              <span className="block text-[20px] leading-tight font-semibold">{c.name}</span>
              <span className="mt-2 block font-mono text-[13px] text-muted">
                {plural(counts[c.slug] ?? 0, "producto", "productos")}
              </span>
            </span>
          </Link>
        </Reveal>
      ))}
      <Reveal index={categories.length} className="flex">
        <Link href="/tienda" className={`w-full bg-ink text-bg shadow-card hover:bg-black ${card}`}>
          <span className="flex items-start justify-between gap-3">
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-bg/10 text-bg">
              <LayoutGrid className="size-5" strokeWidth={1.6} aria-hidden="true" />
            </span>
            <ArrowUpRight
              className="size-5 shrink-0 text-bg/70 transition-[color,transform] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white"
              strokeWidth={1.5}
              aria-hidden="true"
            />
          </span>
          <span>
            <span className="block text-[20px] leading-tight font-semibold">Ver todo el catálogo</span>
            <span className="mt-2 block font-mono text-[13px] text-bg/70">
              {plural(products.length, "producto", "productos")}
            </span>
          </span>
        </Link>
      </Reveal>
    </div>
  );
}
