"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { RidgeFar, RidgeMid, RidgeNear } from "@/components/home/parallax-ridges";
import { cn } from "@/lib/utils";

/**
 * A chapter divider built from the same parallax layers as the hero, so the
 * page reads as one continuous landscape: ridges scroll through at different
 * rates with the chapter title floating between them.
 *
 * Because the band scrolls through the viewport (it is not pinned at the top
 * like the hero), the timeline runs from "top bottom" to "bottom top" and the
 * layers start displaced upwards so they settle rather than only leaving.
 */
const LAYERS = [
  { layer: "1", from: -30, to: 30 },
  { layer: "2", from: -22, to: 22 },
  { layer: "3", from: -14, to: 14 },
  { layer: "4", from: -4, to: 4 },
] as const;

export function ParallaxBand({
  eyebrow,
  title,
  id,
  className,
}: {
  eyebrow: string;
  title: string;
  id?: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    const context = gsap.context(() => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: "top bottom",
          end: "bottom top",
          scrub: 0,
        },
      });

      LAYERS.forEach((entry, index) => {
        tl.fromTo(
          root.querySelectorAll(`[data-parallax-layer="${entry.layer}"]`),
          { yPercent: entry.from },
          { yPercent: entry.to, ease: "none" },
          index === 0 ? undefined : "<",
        );
      });
    }, root);

    return () => context.revert();
  }, []);

  return (
    <div
      ref={ref}
      id={id}
      aria-label={`${eyebrow}: ${title}`}
      className={cn("parallax-band scroll-mt-24", className)}
    >
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
            <span className="parallax__eyebrow">{eyebrow}</span>
            <h2 className="parallax__title parallax__title--band text-balance">{title}</h2>
          </div>
          <div data-parallax-layer="4" className="parallax__layer">
            <RidgeNear className="parallax__layer-img" />
          </div>
        </div>
        <div className="parallax-band__top-fade" />
        <div className="parallax__fade" />
      </div>
    </div>
  );
}
