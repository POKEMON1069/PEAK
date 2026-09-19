import Link from "next/link";
import { projectRoutes } from "@/data/nav";
import { contact } from "@/data/contact";

export function Footer() {
  return (
    <footer className="border-t border-border px-6 pb-28 pt-16 sm:pb-16">
      <div className="mx-auto max-w-5xl">
        <h2
          aria-label="Aayushman"
          className="select-none text-[17vw] font-bold leading-[0.85] tracking-tighter text-foreground/90 sm:text-8xl"
        >
          AAYUSHMAN
        </h2>

        <div className="mt-8 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <p className="max-w-sm text-sm leading-relaxed text-muted">
            Building ideas at the intersection of technology, design and products.
          </p>

          <nav aria-label="Products and contact" className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
            {projectRoutes.map((route) => (
              <Link key={route.href} href={route.href} className="transition-colors hover:text-foreground">
                {route.label}
              </Link>
            ))}
            <a href="#contact" className="transition-colors hover:text-foreground">
              Contact
            </a>
            <a
              href={`mailto:${contact.email}`}
              className="transition-colors hover:text-foreground"
            >
              Email
            </a>
          </nav>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Aayushman Chandra.</p>
          <p>
            Built with Next.js, Tailwind and Framer Motion. Demo audio is generated
            in-repo — see{" "}
            <code className="rounded bg-surface px-1.5 py-0.5 text-[11px]">
              scripts/generate-demo-audio.py
            </code>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}
