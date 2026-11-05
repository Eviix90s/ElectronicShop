"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartLine } from "@/lib/data/types";

interface CartState {
  lines: CartLine[];
  hydrated: boolean;
  lastAdded: string | null;
  add: (slug: string, qty?: number) => void;
  remove: (slug: string) => void;
  setQty: (slug: string, qty: number) => void;
  clear: () => void;
  dismissToast: () => void;
  setHydrated: () => void;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      hydrated: false,
      lastAdded: null,
      add: (slug, qty = 1) =>
        set((s) => {
          const existing = s.lines.find((l) => l.slug === slug);
          const lines = existing
            ? s.lines.map((l) => (l.slug === slug ? { ...l, qty: Math.min(99, l.qty + qty) } : l))
            : [...s.lines, { slug, qty }];
          return { lines, lastAdded: slug };
        }),
      remove: (slug) => set((s) => ({ lines: s.lines.filter((l) => l.slug !== slug) })),
      setQty: (slug, qty) =>
        set((s) => ({
          lines:
            qty <= 0
              ? s.lines.filter((l) => l.slug !== slug)
              : s.lines.map((l) => (l.slug === slug ? { ...l, qty: Math.min(99, qty) } : l)),
        })),
      clear: () => set({ lines: [], lastAdded: null }),
      dismissToast: () => set({ lastAdded: null }),
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "electronicshop-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ lines: s.lines }),
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    },
  ),
);

export const selectCount = (s: CartState) => s.lines.reduce((n, l) => n + l.qty, 0);
