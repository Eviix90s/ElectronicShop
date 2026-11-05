"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

/**
 * Lista de deseos: slugs de producto guardados en el navegador, igual que el
 * carrito. Se hidrata desde localStorage tras montar, por eso `hydrated`.
 */
interface WishlistState {
  slugs: string[];
  hydrated: boolean;
  toggle: (slug: string) => void;
  remove: (slug: string) => void;
  clear: () => void;
  setHydrated: () => void;
}

export const useWishlist = create<WishlistState>()(
  persist(
    (set) => ({
      slugs: [],
      hydrated: false,
      toggle: (slug) =>
        set((s) => ({
          slugs: s.slugs.includes(slug) ? s.slugs.filter((x) => x !== slug) : [...s.slugs, slug],
        })),
      remove: (slug) => set((s) => ({ slugs: s.slugs.filter((x) => x !== slug) })),
      clear: () => set({ slugs: [] }),
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: "electronicshop-wishlist",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ slugs: s.slugs }),
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    },
  ),
);

/** Selector: si el producto está guardado (false hasta hidratar, igual que en el servidor). */
export const selectSaved = (slug: string) => (s: WishlistState) => s.hydrated && s.slugs.includes(slug);

export const selectWishlistCount = (s: WishlistState) => (s.hydrated ? s.slugs.length : 0);
