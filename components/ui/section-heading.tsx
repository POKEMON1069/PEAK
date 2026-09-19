import { cn } from "@/lib/utils";

/** The eyebrow + title pattern every home section shares. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      <span className="text-xs font-medium uppercase tracking-[0.14em] text-muted">
        {eyebrow}
      </span>
      <h2 className="max-w-2xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
        {title}
      </h2>
      {description ? (
        <p className="max-w-xl text-base leading-relaxed text-muted">{description}</p>
      ) : null}
    </div>
  );
}
