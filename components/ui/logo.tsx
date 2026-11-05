import Link from "next/link";
import { cn } from "@/lib/utils";

export function ChipMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      className={cn("size-[22px]", className)}
      aria-hidden="true"
    >
      <rect x="6" y="6" width="12" height="12" rx="1.5" />
      <path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4" />
      <rect x="10" y="10" width="4" height="4" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn("inline-flex items-center gap-2.5 text-lg font-semibold tracking-[-0.01em]", className)}
      aria-label="ElectronicShop, inicio"
    >
      <ChipMark />
      ElectronicShop
    </Link>
  );
}
