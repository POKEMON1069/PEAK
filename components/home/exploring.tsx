import { exploring } from "@/data/exploring";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";

/**
 * This replaced a testimonial wall. Nobody said these things about me, so the
 * space is used for what it can honestly hold: what I am actually reading and
 * thinking about.
 */
export function CurrentlyExploring() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-24">
      <Reveal>
        <SectionHeading eyebrow="Currently exploring" title="Open tabs, roughly" />
      </Reveal>

      <ul className="mt-9 space-y-4">
        {exploring.map((item, index) => (
          <Reveal key={item} delay={index * 0.04}>
            <li className="flex items-start gap-4 border-b border-border pb-4 text-sm leading-relaxed text-muted last:border-0">
              <span className="pt-0.5 text-xs tabular-nums text-foreground/40">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span>{item}</span>
            </li>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
