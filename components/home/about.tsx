import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";

export function About() {
  return (
    <section id="about" className="mx-auto max-w-3xl scroll-mt-24 px-6 py-24 sm:py-28">
      <Reveal>
        <SectionHeading eyebrow="About" title="Mostly curious, occasionally organised." />
      </Reveal>

      <div className="mt-7 space-y-5 text-base leading-relaxed text-muted">
        <Reveal delay={0.05}>
          <p>
            I care about how software feels to use as much as how it&apos;s built — the
            two aren&apos;t really separate problems to me. Most of my time goes into
            web development and interfaces, and into figuring out how consumer
            technology (phones, devices, and the software gluing them together)
            actually gets designed.
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <p>
            Outside of a screen it&apos;s usually football or cricket. Longer term
            I&apos;m interested in building a small technology company of my own —
            something around software and devices. This site, and the three
            products running inside it, are part of practising that.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
