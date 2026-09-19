"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { registerScrollDriver } from "@/lib/scroll-lock";

/**
 * Momentum scrolling for the whole document.
 *
 * Two rules keep this from being a liability:
 *   1. it never starts for visitors who asked for reduced motion, and
 *   2. it hands scrolling back to the browser the moment that preference
 *      changes, so no one is trapped with unusable scroll.
 */
export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    let lenis: Lenis | null = null;

    const start = () => {
      if (lenis) return;
      lenis = new Lenis({
        duration: 1.05,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        touchMultiplier: 1.6,
      });
      registerScrollDriver(lenis);
    };

    const stop = () => {
      lenis?.destroy();
      lenis = null;
      registerScrollDriver(null);
    };

    if (!media.matches) start();
    const onPreferenceChange = () => (media.matches ? stop() : start());
    media.addEventListener("change", onPreferenceChange);

    let frame = 0;
    const raf = (time: number) => {
      lenis?.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      media.removeEventListener("change", onPreferenceChange);
      stop();
    };
  }, []);

  // Landing on a new page should start at the top; hash links are left alone so
  // the browser can still jump to the section.
  useEffect(() => {
    if (window.location.hash) return;
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [pathname]);

  return null;
}
