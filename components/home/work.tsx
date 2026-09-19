"use client";

import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { projects, type Project } from "@/data/projects";
import { ProjectVisual } from "@/components/home/project-visual";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { usePrefersReducedMotion } from "@/lib/use-media-query";

/**
 * Sticky storytelling: each product pins itself as the next one slides over it,
 * which reads as a stack of physical cards rather than three more sections.
 */
function StickyProjectCard({ project, index }: { project: Project; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const scale = useTransform(scrollYProgress, [0.6, 1], [1, 0.94]);
  const opacity = useTransform(scrollYProgress, [0.75, 1], [1, 0.55]);
  const blur = useTransform(scrollYProgress, [0.75, 1], ["blur(0px)", "blur(3px)"]);

  return (
    <motion.div
      ref={ref}
      style={
        reduceMotion
          ? undefined
          : { top: `${8 + index * 2}vh`, scale, opacity, filter: blur }
      }
      className="sticky mx-auto flex min-h-[560px] w-full max-w-4xl flex-col overflow-hidden rounded-panel border border-border bg-surface-elevated shadow-panel sm:h-[78vh] sm:min-h-0 sm:flex-row"
    >
      <div className="relative h-52 w-full shrink-0 sm:h-full sm:w-[42%]">
        <ProjectVisual project={project} />
      </div>

      <div className="flex w-full flex-col justify-between p-7 sm:w-[58%] sm:p-10">
        <div>
          <div className="mb-4 flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.14em] text-muted">
            <span className="tabular-nums">{project.index}</span>
            <span className="h-1 w-1 rounded-full bg-border" />
            <span>{project.category}</span>
            {project.status === "live" ? (
              <span className="rounded-full bg-success/10 px-2.5 py-0.5 text-[10px] font-medium normal-case tracking-normal text-success">
                Running on this site
              </span>
            ) : null}
          </div>

          <h3 className="text-2xl font-semibold tracking-tight sm:text-3xl">{project.title}</h3>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">{project.description}</p>

          <ul className="mt-5 space-y-1.5">
            {project.highlights.map((highlight) => (
              <li key={highlight} className="flex items-start gap-2.5 text-sm text-muted">
                <span
                  aria-hidden="true"
                  className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ background: `hsl(${project.accent})` }}
                />
                <span>{highlight}</span>
              </li>
            ))}
          </ul>

          <div className="mt-5 flex flex-wrap gap-2">
            {project.tech.map((item) => (
              <span
                key={item}
                className="rounded-full border border-border px-3 py-1 text-xs text-muted"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        <Link
          href={project.route}
          className="group mt-8 inline-flex w-fit items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-85"
        >
          Open {project.title}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </motion.div>
  );
}

export function Work() {
  return (
    <section id="work" className="scroll-mt-24 px-6 py-16">
      <Reveal>
        <SectionHeading
          align="center"
          eyebrow="Work"
          title="Not links. Products, built in."
          description="Three things I made, each running for real inside this site rather than behind a screenshot."
          className="mx-auto mb-16"
        />
      </Reveal>

      <div className="flex flex-col gap-10 pb-[12vh]">
        {projects.map((project, index) => (
          <StickyProjectCard key={project.slug} project={project} index={index} />
        ))}
      </div>
    </section>
  );
}
