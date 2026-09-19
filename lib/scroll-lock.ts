import type Lenis from "lenis";

/**
 * Scroll locking that works whether or not smooth scrolling is running.
 *
 * Lenis drives the window itself, so `overflow: hidden` on <body> is not enough
 * to make a dialog modal while it is active. The instance registers itself here
 * so overlays can pause it and hand scrolling back on close.
 */
let instance: Lenis | null = null;

export function registerScrollDriver(driver: Lenis | null) {
  instance = driver;
}

export function lockScroll() {
  instance?.stop();
  document.body.style.overflow = "hidden";
}

export function unlockScroll() {
  document.body.style.overflow = "";
  instance?.start();
}
