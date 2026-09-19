"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useTransform } from "framer-motion";
import { Check, Loader2, Plus, X } from "lucide-react";
import { clamp, cn } from "@/lib/utils";
import { lockScroll, unlockScroll } from "@/lib/scroll-lock";

/* -------------------------------------------------------------------------- */
/* Button                                                                      */
/* -------------------------------------------------------------------------- */

type ButtonVariant = "solid" | "outline" | "ghost" | "accent";

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  solid: "bg-foreground text-background hover:opacity-90",
  outline: "border border-border hover:bg-surface",
  ghost: "hover:bg-surface",
  accent: "bg-accent text-accent-foreground hover:brightness-95",
};

export function TotemButton({
  variant = "solid",
  loading = false,
  children = "Button",
}: {
  variant?: ButtonVariant;
  loading?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={loading}
      className={cn(
        "inline-flex items-center gap-2 rounded-control px-4 py-2 text-sm font-medium transition-[color,background-color,opacity] disabled:opacity-60",
        BUTTON_VARIANTS[variant],
      )}
    >
      {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
      {children}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* Switch                                                                      */
/* -------------------------------------------------------------------------- */

export function TotemSwitch({
  defaultChecked = false,
  label = "Wi-Fi only",
}: {
  defaultChecked?: boolean;
  label?: string;
}) {
  const [on, setOn] = useState(defaultChecked);
  return (
    <label className="flex items-center gap-3 text-sm">
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={label}
        onClick={() => setOn((value) => !value)}
        className={cn(
          "h-6 w-11 shrink-0 rounded-full p-0.5 transition-colors",
          on ? "bg-foreground" : "bg-border",
        )}
      >
        <span
          className={cn(
            "block h-5 w-5 rounded-full bg-surface-elevated shadow-sm transition-transform",
            on ? "translate-x-5" : "translate-x-0",
          )}
        />
      </button>
      <span className="text-muted">{on ? label : "Off"}</span>
    </label>
  );
}

/* -------------------------------------------------------------------------- */
/* Segmented control (radio semantics + arrow keys)                            */
/* -------------------------------------------------------------------------- */

export function TotemSegmented({
  options = ["Day", "Week", "Month"],
}: {
  options?: string[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const move = (delta: number) => {
    const next = (activeIndex + delta + options.length) % options.length;
    setActiveIndex(next);
    refs.current[next]?.focus();
  };

  return (
    <div
      role="radiogroup"
      aria-label="Range"
      onKeyDown={(event) => {
        if (event.key === "ArrowRight") {
          event.preventDefault();
          move(1);
        }
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          move(-1);
        }
      }}
      className="inline-flex rounded-control border border-border bg-surface p-1"
    >
      {options.map((option, index) => (
        <button
          key={option}
          ref={(node) => {
            refs.current[index] = node;
          }}
          type="button"
          role="radio"
          aria-checked={index === activeIndex}
          tabIndex={index === activeIndex ? 0 : -1}
          onClick={() => setActiveIndex(index)}
          className={cn(
            "rounded-[8px] px-3 py-1.5 text-xs font-medium transition-colors",
            index === activeIndex
              ? "bg-surface-elevated text-foreground shadow-sm"
              : "text-muted hover:text-foreground",
          )}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Tabs                                                                        */
/* -------------------------------------------------------------------------- */

export function TotemTabs({ tabs = ["Overview", "Details", "Activity"] }: { tabs?: string[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const baseId = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const move = (delta: number) => {
    const next = (activeIndex + delta + tabs.length) % tabs.length;
    setActiveIndex(next);
    refs.current[next]?.focus();
  };

  return (
    <div className="w-full">
      <div
        role="tablist"
        aria-label="Component tabs"
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") {
            event.preventDefault();
            move(1);
          }
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            move(-1);
          }
        }}
        className="flex gap-5 border-b border-border"
      >
        {tabs.map((tab, index) => (
          <button
            key={tab}
            ref={(node) => {
              refs.current[index] = node;
            }}
            type="button"
            role="tab"
            id={`${baseId}-tab-${index}`}
            aria-selected={index === activeIndex}
            aria-controls={`${baseId}-panel-${index}`}
            tabIndex={index === activeIndex ? 0 : -1}
            onClick={() => setActiveIndex(index)}
            className={cn(
              "relative pb-2 text-sm transition-colors",
              index === activeIndex ? "text-foreground" : "text-muted hover:text-foreground",
            )}
          >
            {tab}
            {index === activeIndex ? (
              <motion.span
                layoutId={`${baseId}-underline`}
                className="absolute -bottom-px left-0 h-0.5 w-full rounded-full bg-foreground"
              />
            ) : null}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id={`${baseId}-panel-${activeIndex}`}
        aria-labelledby={`${baseId}-tab-${activeIndex}`}
        className="pt-4 text-sm text-muted"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={activeIndex}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
          >
            {tabs[activeIndex]} panel — panels swap without losing focus position.
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Accordion                                                                   */
/* -------------------------------------------------------------------------- */

export function TotemAccordion({
  question = "What is Totem?",
  answer = "A small, curated set of interface pieces I keep reusing.",
}: {
  question?: string;
  answer?: string;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();

  return (
    <div className="w-full rounded-control border border-border">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={`${id}-panel`}
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left text-sm font-medium"
      >
        {question}
        <Plus
          className={cn("h-4 w-4 shrink-0 text-muted transition-transform", open && "rotate-45")}
        />
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            id={`${id}-panel`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="px-4 pb-4 text-sm text-muted">{answer}</p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Slider                                                                      */
/* -------------------------------------------------------------------------- */

export function TotemSlider({ min = 0, max = 100, initial = 40 }: { min?: number; max?: number; initial?: number }) {
  const [value, setValue] = useState(initial);
  return (
    <div className="flex w-full items-center gap-3">
      <input
        type="range"
        className="range w-full"
        min={min}
        max={max}
        value={value}
        aria-label="Value"
        onChange={(event) => setValue(Number(event.target.value))}
      />
      <span className="w-10 text-right text-xs tabular-nums text-muted">{value}</span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Tooltip                                                                     */
/* -------------------------------------------------------------------------- */

export function TotemTooltip({ text = "Autosaves every 30 seconds" }: { text?: string }) {
  const [shown, setShown] = useState(false);
  const id = useId();

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-describedby={shown ? id : undefined}
        onMouseEnter={() => setShown(true)}
        onMouseLeave={() => setShown(false)}
        onFocus={() => setShown(true)}
        onBlur={() => setShown(false)}
        onKeyDown={(event) => {
          if (event.key === "Escape") setShown(false);
        }}
        className="rounded-control border border-border px-4 py-2 text-sm transition-colors hover:bg-surface"
      >
        Hover or focus me
      </button>
      <AnimatePresence>
        {shown ? (
          <motion.span
            id={id}
            role="tooltip"
            initial={{ opacity: 0, y: 4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.96 }}
            transition={{ duration: 0.14 }}
            className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2.5 py-1 text-xs text-background"
          >
            {text}
          </motion.span>
        ) : null}
      </AnimatePresence>
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Toast queue                                                                 */
/* -------------------------------------------------------------------------- */

type Toast = { id: number; message: string };

export function TotemToast({ message = "Changes saved" }: { message?: string }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<number[]>([]);
  const counter = useRef(0);

  const push = useCallback(() => {
    counter.current += 1;
    const id = counter.current;
    setToasts((current) => [...current.slice(-2), { id, message }]);
    const timer = window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 2600);
    timers.current.push(timer);
  }, [message]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((timer) => window.clearTimeout(timer));
  }, []);

  return (
    <div className="relative flex w-full flex-col items-center gap-3">
      <button
        type="button"
        onClick={push}
        className="rounded-control border border-border px-4 py-2 text-sm transition-colors hover:bg-surface"
      >
        Show toast
      </button>
      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none absolute bottom-full left-1/2 z-30 flex w-full max-w-[240px] -translate-x-1/2 flex-col gap-2"
      >
        <AnimatePresence initial={false}>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-2.5 rounded-control border border-border bg-surface-elevated px-3 py-2.5 text-sm shadow-panel"
            >
              <Check className="h-4 w-4 shrink-0 text-success" />
              <span className="truncate">{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Skeleton                                                                    */
/* -------------------------------------------------------------------------- */

export function TotemSkeleton() {
  return (
    <div className="flex w-full max-w-[260px] items-center gap-3" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading content</span>
      <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-border" />
      <div className="flex w-full flex-col gap-2">
        <div className="h-3 w-3/4 animate-pulse rounded bg-border" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-border" />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Dialog (focus trap, Escape, scroll lock)                                    */
/* -------------------------------------------------------------------------- */

export function TotemDialog() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const trigger = triggerRef.current;
    if (!panel) return;

    const focusable = panel.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    focusable[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }
      if (event.key !== "Tab") return;
      const items = Array.from(focusable);
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    lockScroll();
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      unlockScroll();
      trigger?.focus();
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-control border border-border px-4 py-2 text-sm transition-colors hover:bg-surface"
      >
        Open dialog
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm"
            onClick={(event) => {
              if (event.target === event.currentTarget) setOpen(false);
            }}
          >
            <motion.div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              initial={{ opacity: 0, y: 14, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.98 }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-sm rounded-panel border border-border bg-surface-elevated p-6 shadow-lift"
            >
              <div className="flex items-start justify-between gap-4">
                <h3 id={titleId} className="text-base font-semibold">
                  Delete this project?
                </h3>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close dialog"
                  className="text-muted transition-colors hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                Focus moves into the dialog, Tab cycles inside it, Escape closes
                it, and body scroll is locked while it is open.
              </p>
              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-control border border-border px-4 py-2 text-sm transition-colors hover:bg-surface"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-control bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Carousel (drag + creative per-slide transform)                              */
/* -------------------------------------------------------------------------- */

const SLIDES = [
  { title: "Depth", body: "Slides rotate as they leave the centre.", hue: "265 62% 58%" },
  { title: "Inertia", body: "Released early, it still lands on a slide.", hue: "198 68% 48%" },
  { title: "Snap", body: "Springs settle on the nearest card.", hue: "22 84% 54%" },
  { title: "Boundaries", body: "Rubber-bands at the first and last.", hue: "158 62% 42%" },
];

function Slide({
  index,
  step,
  x,
  slide,
}: {
  index: number;
  step: number;
  x: ReturnType<typeof useMotionValue<number>>;
  slide: (typeof SLIDES)[number];
}) {
  // distance from centre, normalised to roughly -1..1
  const progress = useTransform(x, (value) => clamp((index * step + value) / -step, -1.4, 1.4));
  const translateX = useTransform(x, (value) => index * step + value);
  const rotate = useTransform(progress, [-1, 0, 1], [16, 0, -16]);
  const scale = useTransform(progress, [-1, 0, 1], [0.84, 1, 0.84]);
  const opacity = useTransform(progress, [-1.2, 0, 1.2], [0.35, 1, 0.35]);

  return (
    <motion.div
      style={{ x: translateX, rotate, scale, opacity }}
      className="absolute inset-0 flex flex-col justify-between rounded-card border border-border p-5"
    >
      <div
        className="h-24 w-full rounded-control"
        style={{ background: `linear-gradient(135deg, hsl(${slide.hue} / 0.95), hsl(${slide.hue} / 0.5))` }}
      />
      <div>
        <p className="text-sm font-semibold">{slide.title}</p>
        <p className="mt-1 text-xs leading-relaxed text-muted">{slide.body}</p>
      </div>
    </motion.div>
  );
}

export function TotemCarousel() {
  const [index, setIndex] = useState(0);
  const x = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const step = width ? width * 0.72 : 240;

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const update = () => setWidth(node.getBoundingClientRect().width);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const settle = useCallback(
    (targetIndex: number, velocity = 0) => {
      const clamped = clamp(targetIndex, 0, SLIDES.length - 1);
      setIndex(clamped);
      animate(x, -clamped * step, {
        type: "spring",
        stiffness: 140,
        damping: 20,
        velocity,
      });
    },
    [step, x],
  );

  // Re-align the strip when the geometry changes (resize, remount). This
  // deliberately does not depend on `index`: doing so would snap x to the final
  // value and cancel the spring that is already animating towards it.
  const indexRef = useRef(index);
  indexRef.current = index;
  useEffect(() => {
    if (width) x.set(-indexRef.current * step);
  }, [step, width, x]);

  return (
    <div className="w-full">
      <div ref={containerRef} className="relative h-[168px] overflow-hidden [perspective:900px]">
        <motion.div
          drag="x"
          dragConstraints={{ left: -(SLIDES.length - 1) * step, right: 0 }}
          dragElastic={0.14}
          style={{ x }}
          onDragEnd={(_event, info) => {
            // Project where the fling would land, then snap to the nearest slide.
            const projected = x.get() + info.velocity.x * 0.12;
            settle(Math.round(-projected / step), info.velocity.x);
          }}
          className="absolute inset-0 cursor-grab active:cursor-grabbing"
        >
          {SLIDES.map((slide, slideIndex) => (
            <Slide key={slide.title} index={slideIndex} step={step} x={x} slide={slide} />
          ))}
        </motion.div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="flex gap-1.5">
          {SLIDES.map((slide, dotIndex) => (
            <button
              key={slide.title}
              type="button"
              onClick={() => settle(dotIndex)}
              aria-label={`Go to ${slide.title}`}
              aria-current={dotIndex === index}
              className={cn(
                "h-1.5 rounded-full transition-all",
                dotIndex === index ? "w-5 bg-foreground" : "w-1.5 bg-border",
              )}
            />
          ))}
        </div>
        <span className="text-xs text-muted">
          Drag · {index + 1}/{SLIDES.length}
        </span>
      </div>
    </div>
  );
}
