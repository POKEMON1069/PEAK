"use client";

import { AnimatePresence, motion, } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useWheel } from "@/components/skibidispin/use-wheel";
import { Wheel } from "@/components/skibidispin/wheel";
import { EntryManager } from "@/components/skibidispin/entry-manager";
import { ProductIntro } from "@/components/layout/product-intro";
import { DEFAULT_ENTRIES } from "@/components/skibidispin/types";
import { usePrefersReducedMotion } from "@/lib/use-media-query";

export default function SkibidiSpinPage() {
  const {
    entries,
    rotation,
    spinning,
    winner,
    history,
    canSpin,
    removeAfterSpin,
    setRemoveAfterSpin,
    addEntry,
    addMany,
    removeEntry,
    shuffle,
    reset,
    clearHistory,
    spin,
    soundOn,
    toggleSound,
  } = useWheel(DEFAULT_ENTRIES);

  const reduceMotion = usePrefersReducedMotion();

  return (
    <main className="min-h-[100svh] px-6 pb-24 pt-28">
      <ProductIntro
        eyebrow="SkibidiSpin"
        title="A wheel that actually spins."
        description="Nothing here is a rendering of a wheel. Entries are yours, the deceleration is real, and the winner is read back off the wheel's final resting angle."
      />

      <div className="mx-auto mt-14 flex max-w-4xl flex-col items-center gap-12 lg:flex-row lg:items-start lg:justify-center lg:gap-14">
        <div className="flex flex-col items-center gap-7">
          <Wheel entries={entries} rotation={rotation} onSpin={spin} disabled={!canSpin} winner={winner} />

          <div className="flex min-h-[74px] w-full max-w-xs flex-col items-center gap-2">
            <div aria-live="polite" aria-atomic="true" className="w-full">
              <AnimatePresence mode="wait">
                {winner ? (
                  <motion.div
                    key={`${winner.id}-${history.length}`}
                    initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 10, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="flex items-center justify-center gap-2.5 rounded-full border border-border bg-surface-elevated px-5 py-3 text-sm shadow-panel"
                  >
                    <Sparkles className="h-4 w-4 text-muted" />
                    <span className="text-muted">Winner</span>
                    <span className="font-semibold" style={{ color: winner.color }}>
                      {winner.label}
                    </span>
                  </motion.div>
                ) : (
                  <motion.p
                    key="idle"
                    initial={false}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center text-sm text-muted"
                  >
                    {entries.length < 2
                      ? "Add at least two entries to spin."
                      : spinning
                        ? "Spinning…"
                        : "Ready when you are."}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {history.length > 0 ? (
              <button
                type="button"
                onClick={clearHistory}
                className="text-xs text-muted transition-colors hover:text-foreground"
              >
                Clear history
              </button>
            ) : null}
          </div>
        </div>

        <EntryManager
          entries={entries}
          onAdd={addEntry}
          onAddMany={addMany}
          onRemove={removeEntry}
          onShuffle={shuffle}
          onReset={reset}
          removeAfterSpin={removeAfterSpin}
          setRemoveAfterSpin={setRemoveAfterSpin}
          soundOn={soundOn}
          toggleSound={toggleSound}
        />
      </div>

      <section className="mx-auto mt-16 max-w-2xl">
        <h2 className="mb-3 text-xs uppercase tracking-[0.14em] text-muted">Recent results</h2>
        {history.length === 0 ? (
          <p className="text-sm text-muted">Results appear here after the first spin.</p>
        ) : (
          <ol className="flex flex-wrap gap-2">
            {history.map((item, index) => (
              <li
                key={`${item.id}-${index}`}
                className="flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs"
              >
                <span
                  aria-hidden="true"
                  className="h-2 w-2 rounded-full"
                  style={{ background: item.color }}
                />
                {item.label}
                <span className="text-muted tabular-nums">
                  #{history.length - index}
                </span>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="mx-auto mt-16 max-w-2xl rounded-panel border border-border bg-surface p-6">
        <h2 className="text-sm font-semibold">How the result is decided</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          A wedge is drawn at random, then the wheel solves for the rotation that
          places the centre of that wedge under the pointer — always spinning
          forward, never fewer than six turns. When the animation finishes the
          winner is calculated again from the resting angle, so the label under
          the pointer is the label that gets announced. The animation is Framer
          Motion, the ticks are Web Audio oscillators, and nothing is a video.
        </p>
      </section>
    </main>
  );
}
