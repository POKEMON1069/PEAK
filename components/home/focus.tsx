"use client";

import { useRef } from "react";
import { Hammer, PenTool, Cpu, Compass } from "lucide-react";
import { focusAreas, type FocusArea } from "@/data/focus";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { usePrefersReducedMotion } from "@/lib/use-media-query";

const icons: Record<FocusArea["id"], typeof Hammer> = {
  build: Hammer,
  design: PenTool,
  technology: Cpu,
  explore: Compass,
};

/**
 * Cursor-tracking glow, dialled way down: the highlight is set by the pointer's
 * position in the card and never becomes the thing you read.
 */
function GlowCard({ area, index }: { area: FocusArea; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const reduceMotion = usePrefersReducedMotion();
  const Icon = icons[area.id];

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (reduceMotion || event.pointerType !== "mouse") return;
    const node = ref.current;
    const glow = glowRef.current;
    if (!node || !glow) return;
    const rect = node.getBoundingClientRect();
    glow.style.setProperty("--glow-x", `${event.clientX - rect.left}px`);
    glow.style.setProperty("--glow-y", `${event.clientY - rect.top}px`);
    glow.style.opacity = "1";
  };

  return (
    <Reveal delay={index * 0.05}>
      <div
        ref={ref}
        onPointerMove={handlePointerMove}
        onPointerLeave={() => {
          if (glowRef.current) glowRef.current.style.opacity = "0";
        }}
        className="group relative h-full overflow-hidden rounded-card border border-border bg-surface-elevated p-6 transition-shadow duration-300 hover:shadow-panel"
      >
        <div
          ref={glowRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300"
          style={{
            background:
              "radial-gradient(220px circle at var(--glow-x, 50%) var(--glow-y, 50%), hsl(var(--accent) / 0.16), transparent 65%)",
          }}
        />
        <div className="relative z-10 flex h-full flex-col">
          <Icon className="mb-6 h-5 w-5 text-foreground/70" strokeWidth={1.75} />
          <h3 className="text-base font-semibold">{area.title}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-muted">{area.desc}</p>
        </div>
      </div>
    </Reveal>
  );
}

export function Focus() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-24 sm:py-28">
      <Reveal>
        <SectionHeading eyebrow="Focus" title="What I care about right now" />
      </Reveal>
      <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {focusAreas.map((area, index) => (
          <GlowCard key={area.id} area={area} index={index} />
        ))}
      </div>
    </section>
  );
}
