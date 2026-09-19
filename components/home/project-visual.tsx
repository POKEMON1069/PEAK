import type { Project } from "@/data/projects";

/**
 * Project artwork, drawn rather than photographed: each preview is an SVG built
 * from the project's own accent hue, so there is no stock filler and nothing to
 * load from a CDN.
 *
 * All coordinates are literals. `Math.sin`/`Math.cos` are not required to be
 * correctly rounded by the ECMAScript spec and Node and the browser disagree in
 * the last bits, which reaches the DOM as two different numbers in one SVG
 * attribute — a hydration mismatch React will not patch up. Pure arithmetic is
 * exactly specified, so positions derived by adding and multiplying are safe;
 * trigonometry is not, so it lives here as pre-computed values instead.
 */

/** Twelve alternating wedges, radius 84, drawn around the origin. */
const SPIN_SLICES = [
  ["M0 0 L0 -84 A84 84 0 0 1 42 -72.746 Z", 0],
  ["M0 0 L42 -72.746 A84 84 0 0 1 72.746 -42 Z", 1],
  ["M0 0 L72.746 -42 A84 84 0 0 1 84 0 Z", 0],
  ["M0 0 L84 0 A84 84 0 0 1 72.746 42 Z", 1],
  ["M0 0 L72.746 42 A84 84 0 0 1 42 72.746 Z", 0],
  ["M0 0 L42 72.746 A84 84 0 0 1 0 84 Z", 1],
  ["M0 0 L0 84 A84 84 0 0 1 -42 72.746 Z", 0],
  ["M0 0 L-42 72.746 A84 84 0 0 1 -72.746 42 Z", 1],
  ["M0 0 L-72.746 42 A84 84 0 0 1 -84 0 Z", 0],
  ["M0 0 L-84 0 A84 84 0 0 1 -72.746 -42 Z", 1],
  ["M0 0 L-72.746 -42 A84 84 0 0 1 -42 -72.746 Z", 0],
  ["M0 0 L-42 -72.746 A84 84 0 0 1 -1e-14 -84 Z", 1],
] as const;

/** Equaliser bar heights, in whole units: stable between server and client. */
const BERTY_BARS = [46, 30, 12, 44, 26, 8, 40, 22, 14, 42, 28, 10, 36, 20] as const;
const BERTY_BAR_X = [-78, -66, -54, -42, -30, -18, -6, 6, 18, 30, 42, 54, 66, 78] as const;

export function ProjectVisual({ project }: { project: Project }) {
  const accent = `hsl(${project.accent})`;
  const soft = `hsl(${project.accent} / 0.35)`;
  const faint = `hsl(${project.accent} / 0.14)`;

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      style={{
        background: `linear-gradient(140deg, hsl(${project.accent} / 0.95), hsl(${project.accent} / 0.55))`,
      }}
    >
      <svg
        viewBox="0 0 200 260"
        preserveAspectRatio="xMidYMid slice"
        role="img"
        aria-label={`${project.title} artwork`}
        className="absolute inset-0 h-full w-full"
      >
        {project.slug === "skibidispin" ? (
          <>
            <g transform="translate(100 130)">
              <circle r="86" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1" />
              {SPIN_SLICES.map(([d, dark], index) => (
                <path
                  key={index}
                  d={d}
                  fill={dark === 1 ? "rgba(255,255,255,0.16)" : "rgba(255,255,255,0.05)"}
                />
              ))}
              <circle r="20" fill="rgba(255,255,255,0.9)" />
            </g>
            {/* Pointer, up at the rim so it reads as the same wheel. */}
            <path d="M100 34 l9 16 -18 0 z" fill="rgba(255,255,255,0.95)" />
          </>
        ) : null}

        {project.slug === "berty" ? (
          <g transform="translate(100 130)">
            {[82, 68, 54, 40, 26].map((radius) => (
              <circle key={radius} r={radius} fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1" />
            ))}
            <circle r="20" fill="rgba(255,255,255,0.85)" />
            <circle r="5" fill={accent} />
            {BERTY_BARS.map((height, index) => (
              <rect
                key={index}
                x={BERTY_BAR_X[index]}
                y={104 - height}
                width="5"
                height={height}
                rx="2.5"
                fill="rgba(255,255,255,0.55)"
              />
            ))}
          </g>
        ) : null}

        {project.slug === "totem" ? (
          <g transform="translate(20 40)">
            {[0, 62, 124].map((rowY, row) =>
              [0, 82].map((columnX, column) => (
                <rect
                  key={`${row}-${column}`}
                  x={columnX}
                  y={rowY}
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
