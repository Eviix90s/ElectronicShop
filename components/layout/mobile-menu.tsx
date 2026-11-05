"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X, Search, UserRound } from "lucide-react";
import { navLinks } from "./nav-links";
import { ChipMark } from "@/components/ui/logo";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
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

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="grid size-11 place-items-center rounded-full border border-line-strong transition-colors hover:border-ink"
        aria-label="Abrir menú"
        aria-expanded={open}
      >
        <Menu className="size-5" strokeWidth={1.6} aria-hidden="true" />
      </button>
      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-bg/70 backdrop-blur-2xl"
            style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
            role="dialog"
            aria-modal="true"
            aria-label="Menú"
          >
            <div className="wrap flex h-[72px] items-center justify-between">
              <span className="inline-flex items-center gap-2.5 text-lg font-semibold">
                <ChipMark /> ElectronicShop
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid size-11 place-items-center rounded-full border border-line-strong"
                aria-label="Cerrar menú"
              >
                <X className="size-5" strokeWidth={1.6} aria-hidden="true" />
              </button>
            </div>
            <nav className="wrap mt-6 flex flex-col" aria-label="Principal">
              {navLinks.map((l, i) => (
                <motion.div
                  key={l.href}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 + i * 0.05, duration: 0.3 }}
                >
                  <Link
                    href={l.href}
                    onClick={close}
                    className="flex items-center justify-between border-b border-line py-4 text-2xl font-semibold tracking-[-0.02em]"
                  >
                    {l.label}
                  </Link>
                </motion.div>
              ))}
              <div className="mt-6 flex gap-3">
                <Link
                  href="/tienda"
                  onClick={close}
                  className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full border border-line-strong"
                >
                  <Search className="size-4" strokeWidth={1.6} aria-hidden="true" /> Buscar
                </Link>
                <Link
                  href="/mi-cuenta"
                  onClick={close}
                  className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-full border border-line-strong"
                >
                  <UserRound className="size-4" strokeWidth={1.6} aria-hidden="true" /> Mi cuenta
                </Link>
              </div>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
