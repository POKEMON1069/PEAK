/**
 * Berty's demo library.
 *
 * These three files are synthesised by `scripts/generate-demo-audio.py` and
 * committed under /public/audio — they are not releases by anyone, and they are
 * labelled as demo material everywhere they surface in the UI. The generator is
 * in the repo so the loops can be regenerated or replaced with real audio:
 * point `src` at any file in /public and update the metadata.
 */

export type Track = {
  id: number;
  title: string;
  artist: string;
  /** Hue for the artwork gradient. */
  color: string;
  src: string;
  /** Shown in the player UI. */
  kind: "generated demo loop";
};

export const tracks: Track[] = [
  {
    id: 1,
    title: "Morning Static",
    artist: "Demo Session",
    color: "265 62% 56%",
    src: "/audio/morning-static.wav",
    kind: "generated demo loop",
  },
  {
    id: 2,
    title: "Low Light",
    artist: "Demo Session",
    color: "198 68% 46%",
    src: "/audio/low-light.wav",
    kind: "generated demo loop",
  },
  {
    id: 3,
    title: "Slow Traffic",
    artist: "Demo Session",
    color: "22 82% 52%",
    src: "/audio/slow-traffic.wav",
    kind: "generated demo loop",
  },
];
