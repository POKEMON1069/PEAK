"use client";

import { useMemo, useSyncExternalStore } from "react";

/**
 * Hydration-safe media queries.
 *
 * `useSyncExternalStore` is the intended tool for this: the server (and the
 * first client render, while hydrating) sees `getServerSnapshot`, so the markup
 * always matches, and the real value lands immediately afterwards.
 *
 * This matters most for reduced motion. Framer Motion's own `useReducedMotion`
 * reads the media query during the first render, which makes the server and the
 * client disagree for anyone who has the preference switched on.
 */
export function useMediaQuery(query: string) {
  const store = useMemo(() => {
    const list = () => window.matchMedia(query);
    return {
      subscribe: (onChange: () => void) => {
        const media = list();
        media.addEventListener("change", onChange);
        return () => media.removeEventListener("change", onChange);
      },
      getSnapshot: () => list().matches,
    };
  }, [query]);

  return useSyncExternalStore(store.subscribe, store.getSnapshot, () => false);
}

export function usePrefersReducedMotion() {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}
