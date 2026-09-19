"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue, useTransform, type MotionValue } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { interests } from "@/data/interests";
import { SectionHeading } from "@/components/ui/section-heading";
import { Reveal } from "@/components/ui/reveal";
import { useElementSize } from "@/lib/use-element-size";
import { clamp, cn } from "@/lib/utils";
import { indexUnderPointer, rotationForIndex, shortestDelta, sliceAngle } from "@/lib/ring";
import { usePrefersReducedMotion } from "@/lib/use-media-query";

const ANGLE_STEP = sliceAngle(interests.length);
const DRAG_SENSITIVITY = 0.45; // degrees per pixel

/**
 * One entry on the ring. Position and counter-rotation are both derived from
 * the shared `rotation` motion value, so the whole ring moves on the compositor
 * and the labels stay upright at every angle.
 */
function OrbitItem({
  label,
  index,
  radius,
  rotation,
  active,
  onSelect,
}: {
  label: string;
  index: number;
  radius: number;
  rotation: MotionValue<number>;
  active: boolean;
  onSelect: () => void;
}) {
  const angle = (value: number) => ((index * ANGLE_STEP + value - 90) * Math.PI) / 180;

  const x = useTransform(rotation, (value) => Math.cos(angle(value)) * radius);
  const y = useTransform(rotation, (value) => Math.sin(angle(value)) * radius);
  // Follows the ring live, so the entry nearest the pointer grows as you drag.
  const scale = useTransform(rotation, (value) =>
    indexUnderPointer(value, interests.length) === index ? 1 : 0.86,
  );

  return (
    <motion.button
      type="button"
      style={{ x, y, scale }}
      onClick={onSelect}
      aria-label={`${label}${active ? " (selected)" : ""}`}
      className={cn(
        "absolute flex h-16 w-16 items-center justify-center rounded-full border p-1.5 text-center text-[10px] font-medium leading-tight transition-colors sm:h-[74px] sm:w-[74px] sm:text-[11px]",
        active
          ? "border-foreground/25 bg-foreground text-background"
          : "border-border bg-surface-elevated text-muted hover:border-foreground/30 hover:text-foreground",
      )}
    >
      {label}
    </motion.button>
  );
}

export function Interests() {
  const reduceMotion = usePrefersReducedMotion();
  const { ref: boxRef, width } = useElementSize<HTMLDivElement>();
  const [active, setActive] = useState(0);
  const rotation = useMotionValue(0);
  const dragStartRotation = useRef(0);
  const dragStartPointer = useRef(0);
  const dragOffset = useRef(0);

  // The ring is sized from the real box, so items clear the card at any width.
  const radius = clamp(width / 2 - 52, 108, 158);
  // Height follows the radius so the lowest entry never sits under the controls.
  const ringHeight = Math.max(288, radius * 2 + 104);

  const rotateTo = useCallback(
    (index: number) => {
      const count = interests.length;
      const current = rotation.get();
      // Carry the ring forward from where it already is rather than unwinding,
      // and take the short way round.
      const aligned = current + shortestDelta(current, rotationForIndex(index, count));
      if (reduceMotion) {
        rotation.set(aligned);
      } else {
        animate(rotation, aligned, {
          type: "spring",
          stiffness: 110,
          damping: 20,
          restDelta: 0.4,
        });
      }
      setActive(indexUnderPointer(aligned, count));
    },
    [reduceMotion, rotation],
  );

  // If the ring is resized the geometry is unchanged, so re-derive which entry
  // the pointer is sitting on rather than trusting the stored index.
  useEffect(() => {
    if (!width) return;
    setActive(indexUnderPointer(rotation.get(), interests.length));
  }, [rotation, width]);

  const pointerX = (event: MouseEvent | TouchEvent | PointerEvent) =>
    "clientX" in event ? event.clientX : event.touches[0]?.clientX ?? 0;

  const handleDragEnd = (_event: unknown, info: { velocity: { x: number } }) => {
    // Project the fling, then snap to whichever entry ends up under the pointer.
    const projected = dragStartRotation.current + (dragOffset.current + info.velocity.x * 0.12) * DRAG_SENSITIVITY;
    rotateTo(Math.round(-projected / ANGLE_STEP));
  };

  const step = (direction: 1 | -1) => rotateTo(active + direction);

  return (
    <section className="px-6 py-24 sm:py-28">
      <Reveal>
        <SectionHeading
          align="center"
          eyebrow="Interests"
          title="What I keep coming back to"
          description="Drag the ring, or use the arrow keys."
          className="mx-auto"
        />
      </Reveal>

      <div
        ref={boxRef}
        tabIndex={0}
        role="group"
        aria-label="Interests ring — use the left and right arrow keys to move"
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") {
            event.preventDefault();
            step(1);
          }
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            step(-1);
          }
        }}
        style={{ height: ringHeight }}
        className="relative mx-auto mt-12 flex w-full max-w-3xl items-center justify-center rounded-panel outline-offset-8"
      >
        <motion.div
          drag="x"
          dragElastic={0}
          dragMomentum={false}
          dragConstraints={{ left: 0, right: 0 }}
          onDragStart={(event) => {
            dragStartRotation.current = rotation.get();
            dragStartPointer.current = pointerX(event);
            dragOffset.current = 0;
          }}
          onDrag={(event) => {
            // Measured from the pointer, not from the element: the drag is
            // constrained to zero movement so nothing scrolls sideways.
            const offset = pointerX(event) - dragStartPointer.current;
            dragOffset.current = offset;
            rotation.set(dragStartRotation.current + offset * DRAG_SENSITIVITY);
          }}
          onDragEnd={handleDragEnd}
          className="relative flex h-full w-full cursor-grab items-center justify-center active:cursor-grabbing"
        >
          {interests.map((item, index) => (
            <OrbitItem
              key={item.id}
              label={item.label}
              index={index}
              radius={radius}
              rotation={rotation}
              active={index === active}
              onSelect={() => (index === active ? undefined : rotateTo(index))}
            />
          ))}

          <div
            aria-live="polite"
            className="relative z-10 flex min-h-36 w-40 flex-col items-center justify-center gap-2 rounded-panel border border-border bg-surface-elevated p-4 text-center shadow-panel sm:min-h-44 sm:w-48 sm:p-5"
          >
            <motion.div
              key={interests[active].id}
              initial={reduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="text-base font-semibold sm:text-lg">{interests[active].label}</p>
              <p className="mt-2 text-xs leading-relaxed text-muted sm:text-[13px]">
                {interests[active].detail}
              </p>
            </motion.div>
          </div>
        </motion.div>

        <div className="mt-4 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => step(-1)}
            aria-label="Previous interest"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-muted transition-colors hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-xs tabular-nums text-muted">
            {active + 1} / {interests.length}
          </span>
          <button
            type="button"
            onClick={() => step(1)}
            aria-label="Next interest"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-muted transition-colors hover:text-foreground"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
