"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { tracks as trackList, type Track } from "@/data/berty-tracks";

export type RepeatMode = "off" | "all" | "one";

type PlayerState = {
  tracks: Track[];
  current: Track;
  index: number;
  isPlaying: boolean;
  /** Seconds elapsed in the current track. */
  progress: number;
  /** Seconds; 0 until metadata arrives. */
  duration: number;
  volume: number;
  muted: boolean;
  shuffle: boolean;
  repeat: RepeatMode;
  error: string | null;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  next: () => void;
  prev: () => void;
  seek: (seconds: number) => void;
  nudge: (delta: number) => void;
  setVolume: (value: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  select: (id: number) => void;
};

const PlayerContext = createContext<PlayerState | null>(null);

const VOLUME_KEY = "berty:volume";

/**
 * One <audio> element, owned here, shared by every control on the page.
 *
 * The element is created on mount (never during render), playback intent lives
 * in a ref so the `ended` handler cannot read a stale value, and the DOM
 * play/pause events are the source of truth for `isPlaying` -- which means the
 * OS media keys and the on-screen buttons never disagree.
 */
export function PlayerProvider({ children }: { children: React.ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const indexRef = useRef(0);
  const wantsPlaybackRef = useRef(false);
  const repeatRef = useRef<RepeatMode>("off");
  const shuffleRef = useRef(false);
  const advanceRef = useRef<(direction: 1 | -1) => void>(() => {});

  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState<RepeatMode>("off");
  const [error, setError] = useState<string | null>(null);

  indexRef.current = index;
  repeatRef.current = repeat;
  shuffleRef.current = shuffle;

  const randomIndex = useCallback(() => {
    if (trackList.length < 2) return 0;
    let candidate = indexRef.current;
    while (candidate === indexRef.current) {
      candidate = Math.floor(Math.random() * trackList.length);
    }
    return candidate;
  }, []);

  /** Advance according to the repeat and shuffle settings. */
  const advance = useCallback(
    (direction: 1 | -1) => {
      if (direction === -1) {
        setIndex((current) => (current - 1 + trackList.length) % trackList.length);
        return;
      }
      if (shuffle) {
        setIndex(randomIndex());
        return;
      }
      setIndex((current) => (current + 1) % trackList.length);
    },
    [randomIndex, shuffle],
  );

  // Create the element once, on the client.
  useEffect(() => {
    const audio = new Audio();
    audio.preload = "metadata";
    audioRef.current = audio;

    // Restore a saved volume level.
    try {
      const stored = Number(localStorage.getItem(VOLUME_KEY));
      if (Number.isFinite(stored) && stored > 0 && stored <= 1) {
        setVolumeState(stored);
      }
    } catch {
      /* ignore */
    }

    const onTime = () => setProgress(audio.currentTime);
    const onMeta = () => {
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
      setError(null);
    };
    const onEnded = () => {
      if (repeatRef.current === "one") {
        audio.currentTime = 0;
        void audio.play();
        return;
      }
      // The last track of an unshuffled, non-repeating queue just stops.
      if (indexRef.current === trackList.length - 1 && repeatRef.current === "off" && !shuffleRef.current) {
        wantsPlaybackRef.current = false;
        setIsPlaying(false);
        setProgress(audio.duration || 0);
        return;
      }
      advanceRef.current(1);
    };
    const onPlay = () => {
      wantsPlaybackRef.current = true;
      setIsPlaying(true);
    };
    const onPause = () => setIsPlaying(false);
    const onError = () => {
      wantsPlaybackRef.current = false;
      setIsPlaying(false);
      setError(
        "This track could not be loaded or decoded. If the audio files are missing from /public/audio the player has nothing to play.",
      );
    };

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("error", onError);

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("error", onError);
      audioRef.current = null;
    };
    // Every handler reads through refs, so the element is created exactly once.
  }, []);

  advanceRef.current = advance;

  // Smooth progress: timeupdate only fires about four times a second.
  useEffect(() => {
    if (!isPlaying) return;
    let frame = 0;
    let last = -1;
    const update = () => {
      const audio = audioRef.current;
      if (audio && Math.abs(audio.currentTime - last) > 0.06) {
        last = audio.currentTime;
        setProgress(audio.currentTime);
      }
      frame = requestAnimationFrame(update);
    };
    frame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frame);
  }, [isPlaying]);

  // Load the selected track; resume only if the visitor was already listening.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = trackList[index].src;
    setProgress(0);
    setDuration(0);
    setError(null);
    audio.load();
    if (wantsPlaybackRef.current) {
      void audio.play().catch(() => {
        setIsPlaying(false);
        setError("Playback was blocked by the browser. Press play to start.");
      });
    }
  }, [index]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = muted;
  }, [muted]);

  const play = useCallback(() => {
    wantsPlaybackRef.current = true;
    void audioRef.current?.play().catch(() => {
      setIsPlaying(false);
      setError("Playback was blocked by the browser. Press play to start.");
    });
  }, []);

  const pause = useCallback(() => {
    wantsPlaybackRef.current = false;
    audioRef.current?.pause();
  }, []);

  const toggle = useCallback(() => {
    if (audioRef.current?.paused === false) pause();
    else play();
  }, [pause, play]);

  const seek = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio || !Number.isFinite(seconds)) return;
    audio.currentTime = Math.max(0, seconds);
    setProgress(audio.currentTime);
  }, []);

  const nudge = useCallback(
    (delta: number) => {
      const audio = audioRef.current;
      if (!audio) return;
      seek(audio.currentTime + delta);
    },
    [seek],
  );

  const setVolume = useCallback((value: number) => {
    const clamped = Math.min(1, Math.max(0, value));
    setVolumeState(clamped);
    if (clamped > 0) setMuted(false);
    try {
      localStorage.setItem(VOLUME_KEY, String(clamped));
    } catch {
      /* ignore */
    }
  }, []);

  const select = useCallback((id: number) => {
    const nextIndex = trackList.findIndex((track) => track.id === id);
    if (nextIndex < 0) return;
    wantsPlaybackRef.current = true;
    setIndex((current) => (current === nextIndex ? current : nextIndex));
    const audio = audioRef.current;
    if (nextIndex === indexRef.current && audio) {
      audio.currentTime = 0;
      void audio.play().catch(() => setIsPlaying(false));
    }
  }, []);

  const cycleRepeat = useCallback(() => {
    setRepeat((current) => (current === "off" ? "all" : current === "all" ? "one" : "off"));
  }, []);

  const toggleShuffle = useCallback(() => setShuffle((current) => !current), []);
  const toggleMute = useCallback(() => setMuted((current) => !current), []);

  // Media Session: lock-screen and hardware media keys drive the same state.
  useEffect(() => {
    const session = "mediaSession" in navigator ? navigator.mediaSession : undefined;
    if (!session) return;
    const track = trackList[index];
    session.metadata = new MediaMetadata({
      title: track.title,
      artist: track.artist,
      album: "Berty demo library",
    });
  }, [index]);

  useEffect(() => {
    const session = "mediaSession" in navigator ? navigator.mediaSession : undefined;
    if (!session) return;
    session.setActionHandler("play", play);
    session.setActionHandler("pause", pause);
    session.setActionHandler("nexttrack", () => advance(1));
    session.setActionHandler("previoustrack", () => advance(-1));
    session.setActionHandler("seekbackward", () => nudge(-5));
    session.setActionHandler("seekforward", () => nudge(5));
    return () => {
      session.setActionHandler("play", null);
      session.setActionHandler("pause", null);
      session.setActionHandler("nexttrack", null);
      session.setActionHandler("previoustrack", null);
      session.setActionHandler("seekbackward", null);
      session.setActionHandler("seekforward", null);
    };
  }, [advance, nudge, pause, play]);

  const value = useMemo<PlayerState>(
    () => ({
      tracks: trackList,
      current: trackList[index],
      index,
      isPlaying,
      progress,
      duration,
      volume,
      muted,
      shuffle,
      repeat,
      error,
      play,
      pause,
      toggle,
      next: () => advance(1),
      prev: () => advance(-1),
      seek,
      nudge,
      setVolume,
      toggleMute,
      toggleShuffle,
      cycleRepeat,
      select,
    }),
    [
      advance,
      cycleRepeat,
      duration,
      error,
      index,
      isPlaying,
      muted,
      nudge,
      pause,
      play,
      progress,
      repeat,
      seek,
      select,
      setVolume,
      shuffle,
      toggle,
      toggleMute,
      toggleShuffle,
      volume,
    ],
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) throw new Error("usePlayer must be used inside a PlayerProvider");
  return context;
}
