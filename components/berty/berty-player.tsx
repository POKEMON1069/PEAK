"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume1,
  Volume2,
  VolumeX,
} from "lucide-react";
import { usePlayer } from "@/components/berty/player-provider";
import { cn, formatTime } from "@/lib/utils";

type Surface = "light" | "dark" | "amoled";

/**
 * Berty is a deliberately self-contained surface, so it carries its own palette
 * rather than borrowing the site tokens: three explicit sets, no currentColor
 * guesswork, no mixing that could leave cream text on a cream button.
 */
const SURFACES: Record<
  Surface,
  {
    label: string;
    shell: string;
    primary: string;
    soft: string;
    softer: string;
    hairline: string;
    dim: string;
  }
> = {
  light: {
    label: "Light",
    shell: "bg-[#FAFDEE] text-[#1F3A4B] border-[#1F3A4B]/10",
    primary: "bg-[#1F3A4B] text-[#FAFDEE]",
    soft: "bg-[#1F3A4B]/[0.08]",
    softer: "hover:bg-[#1F3A4B]/[0.05]",
    hairline: "border-[#1F3A4B]/10",
    dim: "text-[#1F3A4B]/60",
  },
  dark: {
    label: "Dark",
    shell: "bg-[#132235] text-[#EDF3F7] border-white/10",
    primary: "bg-[#EDF3F7] text-[#132235]",
    soft: "bg-white/10",
    softer: "hover:bg-white/[0.06]",
    hairline: "border-white/10",
    dim: "text-[#EDF3F7]/60",
  },
  amoled: {
    label: "AMOLED",
    shell: "bg-black text-white border-white/15",
    primary: "bg-white text-black",
    soft: "bg-white/[0.12]",
    softer: "hover:bg-white/[0.07]",
    hairline: "border-white/15",
    dim: "text-white/60",
  },
};

const SURFACE_KEY = "berty:surface";

/**
 * Equaliser bar heights. Whole numbers from a pre-computed table rather than
 * `Math.sin` at render time: trigonometry is not bit-identical across engines,
 * and a difference of one ulp in an SVG attribute is a hydration mismatch.
 * The x positions are plain multiples, which IEEE-754 does specify exactly.
 */
const EQ_BARS = [40, 14, 26, 8, 34, 20, 12, 30, 44, 18, 24, 10, 32, 22, 36, 16] as const;

function Artwork({ color, playing }: { color: string; playing: boolean }) {
  return (
    <div
      className="relative mx-auto aspect-square w-full max-w-[232px] overflow-hidden rounded-panel"
      style={{ background: `linear-gradient(140deg, hsl(${color} / 0.95), hsl(${color} / 0.45))` }}
    >
      <svg viewBox="0 0 200 200" className="h-full w-full" aria-hidden="true">
        {[78, 62, 46, 30].map((radius) => (
          <circle key={radius} cx="100" cy="100" r={radius} fill="none" stroke="rgba(255,255,255,0.22)" />
        ))}
        <circle cx="100" cy="100" r="22" fill="rgba(255,255,255,0.92)" />
        <circle cx="100" cy="100" r="5" fill="rgba(0,0,0,0.55)" />
        {EQ_BARS.map((height, index) => (
          <rect
            key={index}
            x={26 + index * 9.5}
            y={184 - height}
            width="4"
            height={height}
            rx="2"
            fill="rgba(255,255,255,0.62)"
          />
        ))}
      </svg>
      <span
        aria-hidden="true"
        className={cn(
          "absolute right-4 top-4 h-2.5 w-2.5 rounded-full bg-white/90",
          playing && "animate-pulse",
        )}
      />
    </div>
  );
}

export function BertyPlayer() {
  const {
    tracks,
    current,
    isPlaying,
    progress,
    duration,
    volume,
    muted,
    shuffle,
    repeat,
    error,
    toggle,
    next,
    prev,
    seek,
    setVolume,
    toggleMute,
    toggleShuffle,
    cycleRepeat,
    select,
  } = usePlayer();

  const [surface, setSurface] = useState<Surface>("light");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(SURFACE_KEY) as Surface | null;
      if (stored && stored in SURFACES) setSurface(stored);
    } catch {
      /* storage can be blocked */
    }
  }, []);

  const changeSurface = (next: Surface) => {
    setSurface(next);
    try {
      localStorage.setItem(SURFACE_KEY, next);
    } catch {
      /* ignore */
    }
  };

  // Transport shortcuts, skipped while the visitor is typing in a field.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)
      ) {
        return;
      }
      switch (event.code) {
        case "Space":
          event.preventDefault();
          toggle();
          break;
        case "ArrowRight":
          seek(Math.min(duration || 0, progress + 5));
          break;
        case "ArrowLeft":
          seek(Math.max(0, progress - 5));
          break;
        case "ArrowUp":
          event.preventDefault();
          setVolume(Math.min(1, volume + 0.05));
          break;
        case "ArrowDown":
          event.preventDefault();
          setVolume(Math.max(0, volume - 0.05));
          break;
        case "KeyM":
          toggleMute();
          break;
        case "KeyN":
          next();
          break;
        case "KeyP":
          prev();
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [duration, next, prev, progress, seek, setVolume, toggle, toggleMute, volume]);

  const theme = SURFACES[surface];
  const VolumeIcon = useMemo(() => {
    if (muted || volume === 0) return VolumeX;
    if (volume < 0.5) return Volume1;
    return Volume2;
  }, [muted, volume]);

  return (
    <div className="mx-auto w-full max-w-md">
      <div
        className={cn(
          "rounded-panel border p-6 shadow-lift transition-colors sm:p-8",
          theme.shell,
        )}
      >
        <div
          role="group"
          aria-label="Player surface"
          className="mb-6 flex items-center justify-center gap-2"
        >
          {(Object.keys(SURFACES) as Surface[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => changeSurface(key)}
              aria-pressed={surface === key}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
                surface === key ? theme.primary : cn(theme.soft, theme.softer, theme.dim),
              )}
            >
              {SURFACES[key].label}
            </button>
          ))}
        </div>

        <Artwork color={current.color} playing={isPlaying} />

        <div className="mt-6 text-center">
          <p className="text-lg font-semibold tracking-tight">{current.title}</p>
          <p className={cn("mt-1 text-sm", theme.dim)}>
            {current.artist} · {current.kind}
          </p>
        </div>

        <div className="mt-6">
          <input
            type="range"
            className="range w-full"
            min={0}
            max={duration || 0}
            step={0.05}
            value={Math.min(progress, duration || 0)}
            onChange={(event) => seek(Number(event.target.value))}
            aria-label="Seek"
            aria-valuetext={`${formatTime(progress)} of ${formatTime(duration)}`}
          />
          <div className={cn("mt-2 flex justify-between text-xs tabular-nums", theme.dim)}>
            <span>{formatTime(progress)}</span>
            <span>{duration ? formatTime(duration) : "--:--"}</span>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-5 sm:gap-6">
          <button
            type="button"
            onClick={toggleShuffle}
            aria-pressed={shuffle}
            aria-label="Shuffle"
            title="Shuffle"
            className={cn("transition-opacity", shuffle ? "opacity-100" : cn("opacity-50", theme.softer, "hover:opacity-90"))}
          >
            <Shuffle className="h-[18px] w-[18px]" />
          </button>

          <button
            type="button"
            onClick={prev}
            aria-label="Previous track"
            className="opacity-80 transition-opacity hover:opacity-100"
          >
            <SkipBack className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={toggle}
            aria-label={isPlaying ? "Pause" : "Play"}
            className={cn(
              "flex h-14 w-14 items-center justify-center rounded-full shadow-md transition-transform active:scale-95",
              theme.primary,
            )}
          >
            {isPlaying ? (
              <Pause className="h-5 w-5" fill="currentColor" />
            ) : (
              <Play className="ml-0.5 h-5 w-5" fill="currentColor" />
            )}
          </button>

          <button
            type="button"
            onClick={next}
            aria-label="Next track"
            className="opacity-80 transition-opacity hover:opacity-100"
          >
            <SkipForward className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={cycleRepeat}
            aria-label={`Repeat: ${repeat}`}
            title={`Repeat: ${repeat}`}
            className={cn("transition-opacity", repeat === "off" ? "opacity-50 hover:opacity-90" : "opacity-100")}
          >
            {repeat === "one" ? (
              <Repeat1 className="h-[18px] w-[18px]" />
            ) : (
              <Repeat className="h-[18px] w-[18px]" />
            )}
          </button>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button type="button" onClick={toggleMute} aria-label={muted ? "Unmute" : "Mute"}>
            <VolumeIcon className={cn("h-4 w-4", theme.dim)} />
          </button>
          <input
            type="range"
            className="range w-full"
            min={0}
            max={1}
            step={0.01}
            value={muted ? 0 : volume}
            onChange={(event) => setVolume(Number(event.target.value))}
            aria-label="Volume"
          />
          <span className={cn("w-9 text-right text-xs tabular-nums", theme.dim)}>
            {Math.round((muted ? 0 : volume) * 100)}%
          </span>
        </div>

        {error ? (
          <p
            role="alert"
            className={cn("mt-5 rounded-control border px-3 py-2 text-xs leading-relaxed", theme.hairline, theme.soft)}
          >
            {error}
          </p>
        ) : null}

        <ul className={cn("mt-7 flex flex-col gap-1 border-t pt-5", theme.hairline)}>
          <li className={cn("px-3 pb-1 text-[11px] uppercase tracking-[0.14em]", theme.dim)}>
            Queue · demo library
          </li>
          {tracks.map((track, trackIndex) => {
            const active = track.id === current.id;
            return (
              <li key={track.id}>
                <button
                  type="button"
                  onClick={() => select(track.id)}
                  aria-current={active ? "true" : undefined}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-control px-3 py-2 text-left text-sm transition-colors",
                    active ? theme.soft : theme.softer,
                  )}
                >
                  <span className={cn("w-4 text-xs tabular-nums", theme.dim)}>{trackIndex + 1}</span>
                  <span className="min-w-0 flex-1">
                    <span className={cn("block truncate", active && "font-medium")}>{track.title}</span>
                    <span className={cn("block truncate text-xs", theme.dim)}>{track.artist}</span>
                  </span>
                  {active && isPlaying ? (
                    <span className={cn("text-[11px] uppercase tracking-wide", theme.dim)}>Playing</span>
                  ) : (
                    <span
                      aria-hidden="true"
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ background: `hsl(${track.color})` }}
                    />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <p className="mx-auto mt-4 max-w-md px-2 text-center text-xs leading-relaxed text-muted">
        <kbd className="rounded bg-surface px-1">Space</kbd> play/pause ·{" "}
        <kbd className="rounded bg-surface px-1">←</kbd>
        <kbd className="rounded bg-surface px-1">→</kbd> ±5s ·{" "}
        <kbd className="rounded bg-surface px-1">M</kbd> mute ·{" "}
        <kbd className="rounded bg-surface px-1">N</kbd>
        <kbd className="rounded bg-surface px-1">P</kbd> track. All three files are
        synthesised loops shipped with this site.
      </p>
    </div>
  );
}
