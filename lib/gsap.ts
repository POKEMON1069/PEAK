"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * One place that registers ScrollTrigger. Importing `gsap` from here instead
 * of the package guarantees the plugin is registered before any timeline that
 * needs it is built, no matter which component mounts first.
 */
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export { gsap, ScrollTrigger };
