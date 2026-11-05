"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const LAUNCH_YEAR = 2026;

/**
 * El año actual se calcula en el navegador después de hidratar; en el
 * prerender se usa el año de lanzamiento (un valor estable).
 */
export function Year() {
  const year = useSyncExternalStore(
    subscribe,
    () => new Date().getFullYear(),
    () => LAUNCH_YEAR,
  );
  return <>{year}</>;
}
