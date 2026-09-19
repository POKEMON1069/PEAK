"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { animate, useMotionValue } from "framer-motion";
import { DEFAULT_ENTRIES, MAX_ENTRIES, colorFor, type Entry } from "./types";
import { useWheelSound } from "./use-wheel-sound";
import { indexUnderPointer, sliceAngle, solveSpin } from "@/lib/ring";

const STORAGE_KEY = "skibidispin:entries:v1";
const SPIN_MS = 4400;
const MIN_TURNS = 6;
const MAX_TURNS = 9;

/**
 * Wheel state and physics.
 *
 * The important bit is that the result is read back off the wheel's final
 * rotation instead of being decided on the side. `indexUnderPointer` is the
 * single source of truth for "which wedge is at the top", and the spin solves
 * for the rotation that puts the chosen wedge there — so the announcement can
 * never disagree with what you see.
 */
export function useWheel(initialLabels: string[] = DEFAULT_ENTRIES) {
  const [entries, setEntries] = useState<Entry[]>(() =>
    initialLabels.map((label, index) => ({
      id: `seed-${index + 1}`,
      label,
      color: colorFor(index),
    })),
  );
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<Entry | null>(null);
  const [history, setHistory] = useState<Entry[]>([]);
  const [removeAfterSpin, setRemoveAfterSpin] = useState(false);
  const [restored, setRestored] = useState(false);

  const rotation = useMotionValue(0);
  const animationRef = useRef<ReturnType<typeof animate> | null>(null);
  const boundaryRef = useRef<number | null>(null);
  const lastTickRef = useRef(0);
  const entriesRef = useRef(entries);
  const removeRef = useRef(removeAfterSpin);

  const { soundOn, toggleSound, soundReady, tick, win } = useWheelSound();

  entriesRef.current = entries;
  removeRef.current = removeAfterSpin;

  const segment = sliceAngle(entries.length);

  const heading = useCallback(indexUnderPointer, []);

  // Restore a saved list, then keep it up to date.
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          const clean = parsed
            .filter((item): item is Entry => Boolean(item) && typeof (item as Entry).label === "string")
            .slice(0, MAX_ENTRIES)
            .map((item, index) => ({
              id: `seed-${index + 1}`,
              label: String(item.label).slice(0, 60),
              color: colorFor(index),
            }));
          if (clean.length >= 2) setEntries(clean);
        }
      }
    } catch {
      /* a corrupt list is not worth failing over */
    }
    setRestored(true);
  }, []);

  useEffect(() => {
    if (!restored) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(entries.map(({ label }) => ({ label }))),
      );
    } catch {
      /* ignore */
    }
  }, [entries, restored]);

  const addEntry = useCallback(
    (label: string) => {
      const trimmed = label.trim().slice(0, 60);
      if (!trimmed) return false;
      let added = false;
      setEntries((prev) => {
        if (prev.length >= MAX_ENTRIES) return prev;
        added = true;
        return [
          ...prev,
          { id: `entry-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`, label: trimmed, color: colorFor(prev.length) },
        ];
      });
      return added;
    },
    [],
  );

  /** Paste-friendly: splits on newlines and commas, ignores blanks. */
  const addMany = useCallback((raw: string) => {
    const labels = raw
      .split(/[\n,]+/)
      .map((part) => part.trim().slice(0, 60))
      .filter(Boolean);
    if (!labels.length) return 0;
    let count = 0;
    setEntries((prev) => {
      const room = MAX_ENTRIES - prev.length;
      const accepted = labels.slice(0, Math.max(0, room));
      count = accepted.length;
      if (!accepted.length) return prev;
      return [
        ...prev,
        ...accepted.map((label, offset) => ({
          id: `entry-${Date.now().toString(36)}-${prev.length + offset}-${Math.random().toString(36).slice(2, 7)}`,
          label,
          color: colorFor(prev.length + offset),
        })),
      ];
    });
    return count;
  }, []);

  const removeEntry = useCallback((id: string) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
  }, []);

  const shuffle = useCallback(() => {
    setEntries((prev) => {
      const copy = [...prev];
      for (let i = copy.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy.map((entry, index) => ({ ...entry, color: colorFor(index) }));
    });
  }, []);

  const reset = useCallback(() => {
    animationRef.current?.stop();
    boundaryRef.current = null;
    setSpinning(false);
    setEntries(
      DEFAULT_ENTRIES.map((label, index) => ({ id: `seed-${index + 1}`, label, color: colorFor(index) })),
    );
    rotation.set(0);
    setWinner(null);
    setHistory([]);
  }, [rotation]);

  const clearHistory = useCallback(() => setHistory([]), []);

  const spin = useCallback(() => {
    const current = entriesRef.current;
    if (spinning || current.length < 2) return;

    animationRef.current?.stop();
    setSpinning(true);
    setWinner(null);

    const count = current.length;
    const chosen = Math.floor(Math.random() * count);

    // Solve for the rotation that lands the centre of wedge `chosen` at the
    // pointer, always spinning forward and never fewer than MIN_TURNS turns.
    const from = rotation.get();
    const turns = MIN_TURNS + Math.floor(Math.random() * (MAX_TURNS - MIN_TURNS + 1));
    const { target } = solveSpin({ from, chosen, count, turns });

    boundaryRef.current = heading(from, count);
    lastTickRef.current = 0;
    const travel = target - from;

    animationRef.current = animate(rotation, target, {
      duration: SPIN_MS / 1000,
      // Heavier than ease-out cubic: the wheel hangs at the end like it should.
      ease: [0.08, 0.74, 0.12, 1],
      onUpdate: (value) => {
        const boundary = heading(value, count);
        if (boundaryRef.current === boundary) return;
        boundaryRef.current = boundary;
        // At full speed several boundaries pass per frame; one click is enough.
        const now = performance.now();
        if (now - lastTickRef.current < 28) return;
        lastTickRef.current = now;
        const progress = Math.min(1, Math.max(0, (value - from) / travel));
        tick(0.15 + (1 - progress) * 0.85);
      },
      onComplete: () => {
        // Read the winner off the geometry rather than trusting the plan.
        const settled = heading(rotation.get(), count);
        const result = current[settled];
        setWinner(result);
        setHistory((prev) => [result, ...prev].slice(0, 12));
        setSpinning(false);
        win();
        if (removeRef.current) {
          setEntries((prev) => prev.filter((entry) => entry.id !== result.id));
        }
      },
    });
  }, [heading, rotation, spinning, tick, win]);

  useEffect(() => {
    return () => animationRef.current?.stop();
  }, []);

  const canSpin = entries.length >= 2 && !spinning;

  return useMemo(
    () => ({
      entries,
      rotation,
      segment,
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
      soundReady,
    }),
    [
      entries,
      rotation,
      segment,
      spinning,
      winner,
      history,
      canSpin,
      removeAfterSpin,
      addEntry,
      addMany,
      removeEntry,
      shuffle,
      reset,
      clearHistory,
      spin,
      soundOn,
      toggleSound,
      soundReady,
    ],
  );
}
