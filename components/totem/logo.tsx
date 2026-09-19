/**
 * Totem's mark, drawn as SVG: a rounded tile with three tapered strokes reading
 * as a stack of segments. No raster asset, scales cleanly, and the ink colour
 * follows the surrounding text so it works in both themes.
 */
export function TotemLogo({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label="Totem">
      <defs>
        <linearGradient id="totem-tile" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F59A3C" />
          <stop offset="100%" stopColor="#E2661A" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="18" fill="url(#totem-tile)" />
      <rect
        x="1"
        y="1"
        width="62"
        height="62"
        rx="17"
        fill="none"
        stroke="rgba(0,0,0,0.18)"
        strokeWidth="1.5"
      />
      <g stroke="#241206" strokeWidth="5" strokeLinecap="round" fill="none">
        <path d="M16 24c7 5 7 13 0 18" />
        <path d="M30 18c8 8 8 22 0 30" />
        <path d="M46 23c6 6 6 15 0 21" />
      </g>
    </svg>
  );
}
