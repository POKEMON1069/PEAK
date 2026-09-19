import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <main className="relative flex min-h-[100svh] flex-col items-center justify-center gap-6 px-6 text-center">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(circle at center, black 20%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(circle at center, black 20%, transparent 70%)",
        }}
      />
      <span className="text-[6rem] font-light leading-none tracking-tight text-muted sm:text-[9rem]">
        404
      </span>
      <p className="max-w-xs text-base leading-relaxed text-muted">
        Looks like this page wandered somewhere else.
      </p>
      <Link
        href="/"
        className="group inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-90"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        Back to the ecosystem
      </Link>
    </main>
  );
}
