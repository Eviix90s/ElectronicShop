import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "ghost" | "copper" | "subtle" | "glass";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full border font-medium whitespace-nowrap transition-[background-color,color,border-color,box-shadow] duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 select-none";

const variants: Record<Variant, string> = {
  primary: "bg-ink text-bg border-ink hover:shadow-[0_8px_20px_-10px_rgb(0_0_0/0.5)]",
  ghost: "bg-transparent text-ink border-line-strong hover:border-ink hover:bg-surface/70",
  copper: "bg-copper text-white border-copper hover:bg-[#8a4419]",
  subtle: "bg-surface text-ink border-line hover:border-line-strong",
  /** Vidrio líquido (ver .glass en globals.css): fondo visible sobre cualquier superficie. */
  glass: "glass text-ink hover:text-copper",
};

const sizes: Record<Size, string> = {
  sm: "h-10 px-4 text-sm",
  md: "h-12 px-5 text-[15px]",
  lg: "h-13 px-7 text-base",
};

export function buttonClasses(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

interface ButtonProps extends ComponentProps<"button"> {
  variant?: Variant;
  size?: Size;
}

export function Button({ variant = "primary", size = "md", className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonClasses(variant, size, className)} {...props} />;
}

interface ButtonLinkProps extends Omit<ComponentProps<typeof Link>, "className"> {
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
}

export function ButtonLink({ variant = "primary", size = "md", className, ...props }: ButtonLinkProps) {
  return <Link className={buttonClasses(variant, size, className)} {...props} />;
}
