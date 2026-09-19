import type { Project } from "@/data/projects";

/**
 * Project artwork is drawn, not photographed: each preview is an SVG built from
 * the project's own accent hue, so there is no stock filler and nothing to load
 * from a CDN. The drawings echo what the product actually is.
 */
export function ProjectVisual({ project }: { project: Project }) {
  const accent = `hsl(${project.accent})`;
  const soft = `hsl(${project.accent} / 0.35)`;
  const faint = `hsl(${project.accent} / 0.14)`;

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{ background: `linear-gradient(140deg, hsl(${project.accent} / 0.95), hsl(${project.accent} / 0.55))` }}
    >
      <svg
        viewBox="0 0 200 260"
        preserveAspectRatio="xMidYMid slice"
        role="img"
        aria-label={`${project.title} artwork`}
        className="absolute inset-0 h-full w-full"
      >
        {project.slug === "skibidispin" ? (
          <g transform="translate(100 130)">
            <circle r="86" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1" />
            {Array.from({ length: 12 }).map((_, index) => {
              const start = (index / 12) * 2 * Math.PI;
              const end = ((index + 1) / 12) * 2 * Math.PI;
              return (
                <path
                  key={index}
                  d={`M0 0 L${Math.cos(start) * 84} ${Math.sin(start) * 84} A84 84 0 0 1 ${Math.cos(end) * 84} ${Math.sin(end) * 84} Z`}
                  fill={index % 2 === 0 ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.05)"}
                />
              );
            })}
            <circle r="20" fill="rgba(255,255,255,0.9)" />
            <path d="M0 -96 l9 16 -18 0 z" fill="rgba(255,255,255,0.95)" />
          </g>
        ) : null}

        {project.slug === "berty" ? (
          <g transform="translate(100 130)">
            {[82, 68, 54, 40, 26].map((radius) => (
              <circle key={radius} r={radius} fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1" />
            ))}
            <circle r="20" fill="rgba(255,255,255,0.85)" />
            <circle r="5" fill={accent} />
            {Array.from({ length: 14 }).map((_, index) => {
              const height = 8 + Math.abs(Math.sin(index * 1.1)) * 40;
              return (
                <rect
                  key={index}
                  x={-78 + index * 12}
                  y={104 - height}
                  width="5"
                  height={height}
                  rx="2.5"
                  fill="rgba(255,255,255,0.55)"
                />
              );
            })}
          </g>
        ) : null}

        {project.slug === "totem" ? (
          <g transform="translate(20 40)">
            {Array.from({ length: 3 }).map((_, row) =>
              Array.from({ length: 2 }).map((__, column) => (
                <rect
                  key={`${row}-${column}`}
                  x={column * 82}
                  y={row * 62}
                  width="70"
                  height="50"
                  rx="14"
                  fill={row === 1 && column === 0 ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.18)"}
                  stroke="rgba(255,255,255,0.3)"
                />
              )),
            )}
            <rect x="102" y="124" width="46" height="8" rx="4" fill={accent} />
          </g>
        ) : null}
      </svg>

      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{ background: `linear-gradient(180deg, ${faint}, transparent 45%)` }}
      />
      <span className="absolute bottom-5 left-6 text-xs font-medium uppercase tracking-[0.16em] text-white/80">
        {project.index} · {project.category}
      </span>
      <span
        aria-hidden="true"
        className="absolute right-5 top-5 h-8 w-8 rounded-full border"
        style={{ borderColor: soft }}
      />
    </div>
  );
}
