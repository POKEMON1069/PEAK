import { Reveal } from "@/components/ui/reveal";

export function About() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-20 sm:py-28">
      <div className="grid gap-10 sm:grid-cols-[1fr_2fr] sm:gap-16">
        <Reveal>
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted">
            Software · Interfaces · Products
          </p>
        </Reveal>

        <div className="space-y-6 text-lg leading-relaxed text-foreground/85 sm:text-xl">
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
            <p className="text-muted">
              Outside of a screen it&apos;s usually football or cricket. Longer term
              I&apos;m interested in building a small technology company of my own —
              something around software and devices. This site, and the three
              products running inside it, are part of practising that.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
