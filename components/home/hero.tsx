"use client";

import { useEffect, useRef } from "react";
import { ArrowDown } from "lucide-react";
import { gsap } from "@/lib/gsap";
import { RidgeFar, RidgeMid, RidgeNear } from "@/components/home/parallax-ridges";

/**
 * Layered parallax header. Four layers, each pinned to the scroll position at
 * a different rate (far ridge fastest, foreground barely moving), so the hero
 * reads as depth rather than a flat image scrolling away.
 *
 * Structure and timing follow the Osmo parallax resource; the artwork is the
 * site's own SVG ridges so it follows the theme tokens.
 */
const LAYERS = [
  { layer: "1", yPercent: 70 },
  { layer: "2", yPercent: 55 },
  { layer: "3", yPercent: 40 },
  { layer: "4", yPercent: 10 },
] as const;

export function Hero() {
  const parallaxRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const root = parallaxRef.current;
    if (!root) return;

    const context = gsap.context(() => {
      const trigger = root.querySelector("[data-parallax-layers]");
      if (!trigger) return;

      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
      if (reduceMotion.matches) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger,
          start: "0% 0%",
          end: "100% 0%",
          scrub: 0,
        },
      });

      LAYERS.forEach((entry, index) => {
        tl.to(
          trigger.querySelectorAll(`[data-parallax-layer="${entry.layer}"]`),
          { yPercent: entry.yPercent, ease: "none" },
          index === 0 ? undefined : "<",
        );
      });

      // Intro: title and copy rise once the layers are in place.
      gsap.from("[data-hero-intro]", {
        y: 24,
        opacity: 0,
        duration: 0.9,
        stagger: 0.08,
        ease: "power3.out",
        delay: 0.1,
      });
    }, root);

    return () => context.revert();
  }, []);

  return (
    <section ref={parallaxRef} className="parallax" aria-label="Introduction">
      <div className="parallax__header">
        <div className="parallax__visuals">
          <div className="parallax__sky" />
          <div data-parallax-layers className="parallax__layers">
            <div data-parallax-layer="1" className="parallax__layer">
              <RidgeFar className="parallax__layer-img" />
            </div>
            <div data-parallax-layer="2" className="parallax__layer">
              <RidgeMid className="parallax__layer-img" />
            </div>
            <div data-parallax-layer="3" className="parallax__layer-title">
              <span data-hero-intro className="parallax__eyebrow">
                Aayushman Chandra
              </span>
              <h1 data-hero-intro className="parallax__title">
                Build.
                <br />
                Explore.
                <br />
                Create.
              </h1>
            </div>
            <div data-parallax-layer="4" className="parallax__layer parallax__layer--near">
              <RidgeNear className="parallax__layer-img" />
            </div>
          </div>
          <div className="parallax__fade" />
        </div>
      </div>

      <div className="parallax__content">
        <p data-hero-intro className="max-w-xl text-lg leading-relaxed text-muted sm:text-xl">
          I like turning ideas into things people can actually use — software,
          interfaces, and the odd product that probably didn&apos;t need to exist.
        </p>
        <div data-hero-intro className="mt-8 flex flex-wrap items-center gap-3">
          <a
            href="#work"
            className="rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-85"
          >
            See what I&apos;ve built
          </a>
          <a
            href="#about"
            className="rounded-full border border-border px-6 py-3 text-sm font-medium transition-colors hover:bg-surface"
          >
            About me
          </a>
        </div>
        <a
          href="#about"
          aria-label="Scroll to the About section"
          className="parallax__scroll-hint text-muted transition-colors hover:text-foreground"
        >
          <ArrowDown className="h-4 w-4" />
        </a>
      </div>
    </section>
  );
}
