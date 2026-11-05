"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, Menu, X, Search, UserRound } from "lucide-react";
import { navLinks } from "./nav-links";
import { ChipMark } from "@/components/ui/logo";

/**
 * Menú móvil. Se renderiza en un portal sobre `document.body`: la cabecera
 * lleva desenfoque de fondo y eso la convertiría en el contenedor de cualquier
 * elemento `fixed` que viviera dentro, dejando el menú recortado a su franja.
 * El fondo de la página se difumina y el menú es una hoja de vidrio.
 */
export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion() ?? false;
  const close = () => setOpen(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const overlay = (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="menu"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-ink/25 backdrop-blur-xl"
          style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top, 0px))" }}
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Menú"
            initial={reduce ? false : { opacity: 0, y: -14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
            className="mx-3"
          >
            <div className="glass rounded-[28px] p-5">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2.5 text-lg font-semibold">
                  <ChipMark /> ElectronicShop
                </span>
                <button
                  type="button"
                  onClick={close}
                  className="grid size-11 cursor-pointer place-items-center rounded-full border border-line-strong bg-surface/80 transition-colors hover:border-ink"
                  aria-label="Cerrar menú"
                >
                  <X className="size-5" strokeWidth={1.6} aria-hidden="true" />
                </button>
              </div>
              <nav className="mt-4 flex flex-col" aria-label="Principal">
                {navLinks.map((l, i) => (
                  <motion.div
                    key={l.href}
                    initial={reduce ? false : { opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + i * 0.05, duration: 0.3 }}
                  >
                    <Link
                      href={l.href}
                      onClick={close}
                      className="flex items-center justify-between border-b border-line py-4 text-[26px] leading-tight font-semibold tracking-[-0.02em]"
                    >
                      {l.label}
                      <ArrowUpRight className="size-5 text-muted" strokeWidth={1.6} aria-hidden="true" />
                    </Link>
                  </motion.div>
                ))}
                <div className="mt-5 flex gap-3">
                  <Link
                    href="/tienda"
                    onClick={close}
                    className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-ink text-bg"
                  >
                    <Search className="size-4" strokeWidth={1.6} aria-hidden="true" /> Buscar
                  </Link>
                  <Link
                    href="/mi-cuenta"
                    onClick={close}
                    className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full border border-line-strong bg-surface/80"
                  >
                    <UserRound className="size-4" strokeWidth={1.6} aria-hidden="true" /> Mi cuenta
                  </Link>
                </div>
              </nav>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="grid size-11 cursor-pointer place-items-center rounded-full border border-line-strong transition-colors hover:border-ink"
        aria-label="Abrir menú"
        aria-expanded={open}
      >
        <Menu className="size-5" strokeWidth={1.6} aria-hidden="true" />
      </button>
      {/* El portal solo se crea en el cliente: `open` nunca es true en el servidor. */}
      {open ? createPortal(overlay, document.body) : null}
    </div>
  );
}
