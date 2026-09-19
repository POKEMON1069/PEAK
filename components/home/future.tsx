import { futureProjects } from "@/data/projects";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";

export function Future() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-24">
      <Reveal>
        <SectionHeading
          eyebrow="Future"
          title="Still growing"
          description="Ideas at various stages of not existing yet."
        />
      </Reveal>

      <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {futureProjects.map((item, index) => (
          <Reveal key={item.label} delay={index * 0.05}>
            <div className="h-full rounded-card border border-dashed border-border p-5">
              <p className="text-[11px] uppercase tracking-[0.14em] text-muted">{item.status}</p>
              <p className="mt-2 text-sm font-medium">{item.label}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
