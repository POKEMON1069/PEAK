import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Shared header for the three embedded products: the same eyebrow/title rhythm
 * and the same way back to the ecosystem, so the routes feel like one place.
 */
export function ProductIntro({
  eyebrow,
  title,
  description,
  badge,
  children,
  className,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  /** Rendered above everything: a product mark, usually. */
  badge?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mx-auto flex max-w-2xl flex-col items-center gap-4 text-center", className)}>
      {badge}
      <Link
        href="/#work"
        className="group inline-flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-muted transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
        Back to the ecosystem
      </Link>

      <span className="text-xs uppercase tracking-[0.14em] text-muted">{eyebrow}</span>
      <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{title}</h1>
      {description ? (
        <p className="max-w-md text-sm leading-relaxed text-muted">{description}</p>
      ) : null}
      {children}
    </div>
  );
}
