"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { registerScrollDriver } from "@/lib/scroll-lock";

/**
 * Momentum scrolling for the whole document, driven from GSAP's ticker so the
 * parallax ScrollTriggers and Lenis always agree on where the page is.
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

    // GSAP's ticker reports seconds; Lenis wants milliseconds.
    const tick = (time: number) => lenis?.raf(time * 1000);

    const start = () => {
      if (lenis) return;
      lenis = new Lenis({
        duration: 1.05,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        touchMultiplier: 1.6,
      });
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      registerScrollDriver(lenis);
    };

    const stop = () => {
      gsap.ticker.remove(tick);
      lenis?.destroy();
      lenis = null;
      registerScrollDriver(null);
    };

    if (!media.matches) start();
    const onPreferenceChange = () => (media.matches ? stop() : start());
    media.addEventListener("change", onPreferenceChange);

    return () => {
      media.removeEventListener("change", onPreferenceChange);
      stop();
    };
  }, []);

  // Landing on a new page should start at the top; hash links are left alone so
  // the browser can still jump to the section.
  useEffect(() => {
    if (window.location.hash) return;
    window.scrollTo({ top: 0, behavior: "auto" });
    ScrollTrigger.refresh();
  }, [pathname]);

  return null;
}
