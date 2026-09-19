"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const STORAGE_KEY = "skibidispin:sound";

/**
 * The wheel's clicks are synthesised with Web Audio rather than loaded as
 * files: no assets, no network, and the pitch can follow how fast the wheel is
 * still turning.
 */
export function useWheelSound() {
  const contextRef = useRef<AudioContext | null>(null);
  const [enabled, setEnabled] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "off") setEnabled(false);
    } catch {
      /* storage can be unavailable; default stands */
    }
    setReady(true);
  }, []);

  const toggle = useCallback(() => {
    setEnabled((current) => {
      const next = !current;
      try {
        localStorage.setItem(STORAGE_KEY, next ? "on" : "off");
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const getContext = useCallback(() => {
    if (typeof window === "undefined") return null;
    if (!contextRef.current) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      contextRef.current = new Ctor();
    }
    if (contextRef.current.state === "suspended") void contextRef.current.resume();
    return contextRef.current;
  }, []);

  /** One click as a wedge boundary passes the pointer. */
  const tick = useCallback(
    (intensity = 1) => {
      if (!enabled) return;
      const context = getContext();
      if (!context) return;
      const now = context.currentTime;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "triangle";
      oscillator.frequency.setValueAtTime(560 + intensity * 420, now);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.05 * (0.35 + intensity * 0.65), now + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.055);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(now);
      oscillator.stop(now + 0.08);
    },
    [enabled, getContext],
  );

  /** Two-note chime when the wheel stops. */
  const win = useCallback(() => {
    if (!enabled) return;
    const context = getContext();
    if (!context) return;
    const start = context.currentTime;
    [660, 990].forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const at = start + index * 0.11;
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, at);
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.exponentialRampToValueAtTime(0.075, at + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.5);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(at);
      oscillator.stop(at + 0.55);
    });
  }, [enabled, getContext]);

  useEffect(() => {
    return () => {
      void contextRef.current?.close();
      contextRef.current = null;
    };
  }, []);

  return { soundOn: enabled, toggleSound: toggle, soundReady: ready, tick, win };
}
