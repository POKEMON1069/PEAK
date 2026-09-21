/**
 * The mountain layers behind the hero, drawn rather than downloaded so nothing
 * is fetched from a CDN and both themes get artwork that matches their tokens.
 *
 * Every coordinate is a literal: the paths never pass through Math.sin/cos, so
 * server and client markup are identical (see check-render-determinism.mjs).
 */

type RidgeProps = { className?: string };

/** Far range: soft, low-contrast, lots of sky. */
export function RidgeFar({ className }: RidgeProps) {
  return (
    <svg
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <linearGradient id="ridge-far" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="hsl(var(--foreground))" stopOpacity="0.16" />
          <stop offset="1" stopColor="hsl(var(--foreground))" stopOpacity="0.32" />
        </linearGradient>
      </defs>
      <path
        fill="url(#ridge-far)"
        d="M0 620 L90 560 L170 590 L260 470 L340 520 L420 430 L500 500 L580 400 L660 460 L740 340 L820 420 L900 380 L980 450 L1060 360 L1140 430 L1220 390 L1300 470 L1380 410 L1460 480 L1540 440 L1600 480 L1600 900 L0 900 Z"
      />
    </svg>
  );
}

/** Middle range: sharper peaks and a lime glow catching the ridge line. */
export function RidgeMid({ className }: RidgeProps) {
  return (
    <svg
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <linearGradient id="ridge-mid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="hsl(var(--foreground))" stopOpacity="0.45" />
          <stop offset="1" stopColor="hsl(var(--foreground))" stopOpacity="0.7" />
        </linearGradient>
      </defs>
      <path
        fill="url(#ridge-mid)"
        d="M0 720 L110 640 L200 680 L300 560 L380 610 L470 520 L560 590 L650 470 L730 540 L820 500 L910 580 L1000 490 L1090 560 L1180 520 L1280 610 L1370 550 L1460 620 L1540 590 L1600 640 L1600 900 L0 900 Z"
      />
      <path
        fill="none"
        stroke="hsl(var(--accent))"
        strokeOpacity="0.65"
        strokeWidth="2"
        d="M0 720 L110 640 L200 680 L300 560 L380 610 L470 520 L560 590 L650 470 L730 540 L820 500 L910 580 L1000 490 L1090 560 L1180 520 L1280 610 L1370 550 L1460 620 L1540 590 L1600 640"
      />
    </svg>
  );
}

/**
 * Foreground: the ridge the title sits behind. It is the page background
 * colour so the hero dissolves into the content below it instead of ending on
 * a hard edge.
 */
export function RidgeNear({ className }: RidgeProps) {
  return (
    <svg
      viewBox="0 0 1600 900"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      className={className}
    >
      <defs>
        <linearGradient id="ridge-near" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="hsl(var(--background))" />
          <stop offset="1" stopColor="hsl(var(--background))" />
        </linearGradient>
      </defs>
      <path
        fill="none"
        stroke="hsl(var(--foreground))"
        strokeOpacity="0.35"
        strokeWidth="2"
        d="M0 840 L120 760 L220 800 L330 700 L430 750 L540 660 L640 730 L740 640 L840 710 L940 660 L1040 740 L1140 680 L1240 750 L1340 700 L1440 770 L1540 730 L1600 760"
      />
      <path
        fill="url(#ridge-near)"
        d="M0 840 L120 760 L220 800 L330 700 L430 750 L540 660 L640 730 L740 640 L840 710 L940 660 L1040 740 L1140 680 L1240 750 L1340 700 L1440 770 L1540 730 L1600 760 L1600 900 L0 900 Z"
      />
    </svg>
  );
}
