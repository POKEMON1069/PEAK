"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { stack, type StackItem } from "@/data/stack";
import {
  FigmaIcon,
  FramerIcon,
  NextIcon,
  NodeIcon,
  ReactIcon,
  TailwindIcon,
  TypeScriptIcon,
} from "@/components/icons/brand-icons";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { usePrefersReducedMotion } from "@/lib/use-media-query";

const icons: Record<StackItem["icon"], (props: { className?: string }) => React.ReactElement> = {
  react: ReactIcon,
  typescript: TypeScriptIcon,
  nextdotjs: NextIcon,
  tailwindcss: TailwindIcon,
  figma: FigmaIcon,
  nodedotjs: NodeIcon,
  framer: FramerIcon,
};

/**
 * Cards further from the middle of the list start lower and dimmer, then
 * settle as the section scrolls through — the stack assembles itself.
 */
function StackCard({
  item,
  index,
  centre,
  progress,
  reduceMotion,
}: {
  item: StackItem;
  index: number;
  centre: number;
  progress: MotionValue<number>;
  reduceMotion: boolean;
}) {
  const Icon = icons[item.icon];
  const distance = Math.abs(index - centre);
  const y = useTransform(progress, [0.1, 0.5], [distance * 22, 0]);
  const opacity = useTransform(progress, [0.1, 0.45], [0.25, 1]);

  return (
    <motion.div
      style={reduceMotion ? undefined : { y, opacity }}
      className="group flex w-[124px] flex-col items-center gap-3 rounded-card border border-border bg-surface-elevated p-4 text-center transition-colors hover:border-foreground/20 sm:w-[136px]"
    >
      <span className="text-foreground/80 transition-colors group-hover:text-foreground">
        <Icon className="h-7 w-7" />
      </span>
      <span className="text-xs font-medium">{item.name}</span>
      <span className="text-[11px] leading-snug text-muted">{item.usage}</span>
    </motion.div>
  );
}

export function StackReveal() {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const centre = Math.floor(stack.length / 2);

  return (
    <section ref={ref} className="px-6 py-24 sm:py-28">
      <Reveal>
        <SectionHeading
          align="center"
          eyebrow="Stack"
          title="What I use to build"
          description="Every one of these is load-bearing somewhere on this site."
          className="mx-auto"
        />
      </Reveal>

      <div className="mx-auto mt-14 flex max-w-3xl flex-wrap items-start justify-center gap-4">
        {stack.map((item, index) => (
          <StackCard
            key={item.name}
            item={item}
            index={index}
            centre={centre}
            progress={scrollYProgress}
            reduceMotion={reduceMotion}
          />
        ))}
      </div>
    </section>
  );
}
