import { ArrowUpRight, Mail } from "lucide-react";
import { contact, contactNote } from "@/data/contact";
import { Reveal } from "@/components/ui/reveal";

export function Contact() {
  return (
    <section id="contact" className="scroll-mt-24 px-6 py-24 sm:py-28">
      <Reveal>
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 rounded-panel border border-border bg-surface-elevated px-6 py-14 text-center shadow-panel sm:px-10 sm:py-16">
          <span className="flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface text-muted">
            <Mail className="h-5 w-5" strokeWidth={1.75} />
          </span>

          <h2 className="max-w-xl text-3xl font-semibold tracking-tight text-balance sm:text-5xl">
            Have an idea? Let&apos;s build it.
          </h2>
          <p className="max-w-md text-base leading-relaxed text-muted">
            Reach out if something here resonates — a project, a collaboration, or
            a good conversation about products.
          </p>

          <a
            href={`mailto:${contact.email}`}
            className="group inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3.5 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            {contact.email}
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </a>

          {contact.links.length > 0 ? (
            <ul className="flex flex-wrap justify-center gap-2">
              {contact.links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="rounded-full border border-border px-4 py-2 text-sm text-muted transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}

          {contact.emailIsPlaceholder ? (
            <p className="max-w-xs text-xs leading-relaxed text-muted/80">{contactNote}</p>
          ) : null}
        </div>
      </Reveal>
    </section>
  );
}
