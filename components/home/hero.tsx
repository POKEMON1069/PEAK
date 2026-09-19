"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { ArrowDown } from "lucide-react";
import { usePrefersReducedMotion } from "@/lib/use-media-query";

const HEADLINE = "BUILD. EXPLORE. CREATE.";

/**
 * Each character drifts in from its own offset as the page scrolls away, so the
 * headline assembles out of the direction it is already moving in.
 */
function Char({
  char,
  index,
  centre,
  progress,
  reduceMotion,
}: {
  char: string;
  index: number;
  centre: number;
  progress: MotionValue<number>;
  reduceMotion: boolean;
}) {
  const distance = index - centre;
  const x = useTransform(progress, [0, 0.5], [distance * 26, 0]);
  const rotateX = useTransform(progress, [0, 0.5], [distance * 26, 0]);
  const opacity = useTransform(progress, [0, 0.35], [0.35, 1]);

  if (reduceMotion) return <span className="inline-block">{char}</span>;

  return (
    <motion.span style={{ x, rotateX, opacity }} className="inline-block">
      {char}
    </motion.span>
  );
}

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Words stay whole: characters animate individually, but never inside a word.
  const words = HEADLINE.split(" ");
  let running = 0;

  return (
    <section
      ref={ref}
      className="relative flex min-h-[100svh] flex-col items-center justify-center gap-8 overflow-hidden px-6 text-center"
    >
      <motion.span
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-full border border-border bg-surface px-4 py-1.5 text-xs uppercase tracking-[0.14em] text-muted"
      >
        Aayushman Chandra
      </motion.span>

      <h1
        aria-label={HEADLINE}
        className="max-w-4xl text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl"
        style={{ perspective: "700px" }}
      >
        {words.map((word) => {
          const chars = word.split("");
          const nodes = chars.map((char) => {
            const index = running++;
            return (
              <Char
                key={index}
                char={char}
                index={index}
                centre={Math.floor(HEADLINE.length / 2)}
                progress={scrollYProgress}
                reduceMotion={reduceMotion}
              />
            );
          });
          running += 1; // account for the space between words
          return (
            <span key={word} aria-hidden="true" className="mr-[0.22em] inline-block whitespace-nowrap last:mr-0">
              {nodes}
            </span>
          );
        })}
      </h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-lg text-base leading-relaxed text-muted sm:text-lg"
      >
        I like turning ideas into things people can actually use — software,
        interfaces, and the odd product that probably didn&apos;t need to exist.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-wrap items-center justify-center gap-3"
      >
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
      </motion.div>

      <motion.a
        href="#about"
        aria-label="Scroll to the About section"
        animate={reduceMotion ? undefined : { y: [0, 6, 0] }}
        transition={{ duration: 1.9, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-10 text-muted transition-colors hover:text-foreground"
      >
        <ArrowDown className="h-4 w-4" />
      </motion.a>
    </section>
  );
}
