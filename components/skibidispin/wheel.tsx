"use client";

import { motion, type MotionValue } from "framer-motion";
import { cn } from "@/lib/utils";
import type { Entry } from "./types";
import { usePrefersReducedMotion } from "@/lib/use-media-query";

const SIZE = 360;
const RADIUS = SIZE / 2;

function pointOnWheel(angle: number, distance = RADIUS) {
  const radians = ((angle - 90) * Math.PI) / 180;
  return {
    x: RADIUS + distance * Math.cos(radians),
    y: RADIUS + distance * Math.sin(radians),
  };
}

/**
 * The wheel itself: one <svg> whose rotation is driven by a motion value owned
 * by the hook, so the geometry you see and the winner that gets announced come
 * from the same number.
 *
 * Slice `i` is drawn from `i * step - step / 2` to `i * step + step / 2`, i.e.
 * centred on `i * step` — which is exactly what lib/ring.ts assumes when it
 * says division 0 sits under the pointer at rest.
 */
export function Wheel({
  entries,
  rotation,
  onSpin,
  disabled,
  winner,
}: {
  entries: Entry[];
  rotation: MotionValue<number>;
  onSpin: () => void;
  disabled: boolean;
  winner: Entry | null;
}) {
  const reduceMotion = usePrefersReducedMotion();
  const count = entries.length;
  const segment = 360 / Math.max(count, 1);
  const labelSize = count > 10 ? 9 : count > 7 ? 10.5 : 12;
  const single = count === 1;

  return (
    <div className="relative flex items-center justify-center">
      {/* Pointer: fixed to the frame, never rotates with the wheel. */}
      <div
        aria-hidden="true"
        className="absolute -top-1 z-20 h-5 w-5 rotate-180 bg-foreground"
        style={{ clipPath: "polygon(50% 100%, 0 0, 100% 0)" }}
      />

      <motion.svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        role="img"
        aria-label={`Wheel with ${count} ${count === 1 ? "entry" : "entries"}`}
        style={{ rotate: reduceMotion ? 0 : rotation, transformOrigin: "50% 50%" }}
        className="h-[280px] w-[280px] rounded-full border-[6px] border-surface-elevated shadow-lift sm:h-[360px] sm:w-[360px]"
      >
        {single ? (
          <circle cx={RADIUS} cy={RADIUS} r={RADIUS} fill={entries[0].color} />
        ) : (
          entries.map((entry, index) => {
            const centre = index * segment;
            const start = centre - segment / 2;
            const end = centre + segment / 2;
            const from = pointOnWheel(start);
            const to = pointOnWheel(end);
            const largeArc = segment > 180.5 ? 1 : 0;
            const label = pointOnWheel(centre, RADIUS * 0.63);
            const isWinner = winner?.id === entry.id;

            return (
              <g key={entry.id}>
                <path
                  d={`M${RADIUS},${RADIUS} L${from.x.toFixed(2)},${from.y.toFixed(2)} A${RADIUS},${RADIUS} 0 ${largeArc} 1 ${to.x.toFixed(2)},${to.y.toFixed(2)} Z`}
                  fill={entry.color}
                  stroke="hsl(var(--surface-elevated))"
                  strokeWidth={isWinner ? 4 : 1.5}
                  strokeOpacity={isWinner ? 1 : 0.85}
                />
                <text
                  x={label.x}
                  y={label.y}
                  fill="#FFFFFF"
                  fontSize={labelSize}
                  fontWeight={600}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${centre.toFixed(2)} ${label.x.toFixed(2)} ${label.y.toFixed(2)})`}
                  style={{ pointerEvents: "none" }}
                >
                  {entry.label.length > 16 ? `${entry.label.slice(0, 15)}…` : entry.label}
                </text>
              </g>
            );
          })
        )}

        <circle
          cx={RADIUS}
          cy={RADIUS}
          r={RADIUS - 2}
          fill="none"
          stroke="hsl(var(--foreground) / 0.25)"
          strokeWidth={1}
        />
      </motion.svg>

      <button
        type="button"
        onClick={onSpin}
        disabled={disabled}
        className={cn(
          "absolute z-10 flex h-[84px] w-[84px] items-center justify-center rounded-full border-4 border-surface-elevated bg-foreground text-xs font-semibold uppercase tracking-[0.12em] text-background shadow-panel transition-transform",
          "hover:scale-[1.03] active:scale-95 disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:scale-100",
        )}
      >
        Spin
      </button>
    </div>
  );
}
