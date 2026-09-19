/**
 * Pre-computed wedge outlines for the SkibidiSpin wheel.
 *
 * Why literals instead of trigonometry at render time: `Math.sin` and `Math.cos`
 * are not required to be correctly rounded by the ECMAScript spec, and Node and
 * V8 disagree in the last bits. That difference reached the DOM as two distinct
 * numbers in an SVG attribute (`...89285` vs `...89283`), which React reports as
 * a hydration mismatch it refuses to patch up.
 *
 * So the trig happens here, once, offline. The wheel renders these strings, and
 * positions each wedge with `transform="rotate(k * 360 / n 180 180)"` — pure
 * arithmetic, which *is* exactly specified and therefore identical everywhere.
 *
 * Every entry from 2 to 40 slices is listed (MAX_ENTRIES is 40). Each path is
 * slice 0: a wedge centred on the top of the wheel, spanning `±(360 / n) / 2`
 * degrees, with a 180-unit radius around the centre point (180, 180).
 *
 * Regenerate with the same maths as `scripts/verify-wheel-math.ts` relies on:
 *   angle -> (cx + r * cos(a - 90°), cy + r * sin(a - 90°))
 */
export const WEDGE_PATHS: Record<number, string> = {
  2: "M180,180 L0,180 A180,180 0 0 1 360,180 Z",
  3: "M180,180 L24.115,90 A180,180 0 0 1 335.885,90 Z",
  4: "M180,180 L52.721,52.721 A180,180 0 0 1 307.279,52.721 Z",
  5: "M180,180 L74.199,34.377 A180,180 0 0 1 285.801,34.377 Z",
  6: "M180,180 L90,24.115 A180,180 0 0 1 270,24.115 Z",
  7: "M180,180 L101.901,17.826 A180,180 0 0 1 258.099,17.826 Z",
  8: "M180,180 L111.117,13.702 A180,180 0 0 1 248.883,13.702 Z",
  9: "M180,180 L118.436,10.855 A180,180 0 0 1 241.564,10.855 Z",
  10: "M180,180 L124.377,8.81 A180,180 0 0 1 235.623,8.81 Z",
  11: "M180,180 L129.288,7.291 A180,180 0 0 1 230.712,7.291 Z",
  12: "M180,180 L133.413,6.133 A180,180 0 0 1 226.587,6.133 Z",
  13: "M180,180 L136.923,5.23 A180,180 0 0 1 223.077,5.23 Z",
  14: "M180,180 L139.946,4.513 A180,180 0 0 1 220.054,4.513 Z",
  15: "M180,180 L142.576,3.933 A180,180 0 0 1 217.424,3.933 Z",
  16: "M180,180 L144.884,3.459 A180,180 0 0 1 215.116,3.459 Z",
  17: "M180,180 L146.925,3.065 A180,180 0 0 1 213.075,3.065 Z",
  18: "M180,180 L148.743,2.735 A180,180 0 0 1 211.257,2.735 Z",
  19: "M180,180 L150.373,2.455 A180,180 0 0 1 209.627,2.455 Z",
  20: "M180,180 L151.842,2.216 A180,180 0 0 1 208.158,2.216 Z",
  21: "M180,180 L153.172,2.01 A180,180 0 0 1 206.828,2.01 Z",
  22: "M180,180 L154.383,1.832 A180,180 0 0 1 205.617,1.832 Z",
  23: "M180,180 L155.49,1.677 A180,180 0 0 1 204.51,1.677 Z",
  24: "M180,180 L156.505,1.54 A180,180 0 0 1 203.495,1.54 Z",
  25: "M180,180 L157.44,1.419 A180,180 0 0 1 202.56,1.419 Z",
  26: "M180,180 L158.303,1.312 A180,180 0 0 1 201.697,1.312 Z",
  27: "M180,180 L159.103,1.217 A180,180 0 0 1 200.897,1.217 Z",
  28: "M180,180 L159.846,1.132 A180,180 0 0 1 200.154,1.132 Z",
  29: "M180,180 L160.539,1.055 A180,180 0 0 1 199.461,1.055 Z",
  30: "M180,180 L161.185,0.986 A180,180 0 0 1 198.815,0.986 Z",
  31: "M180,180 L161.79,0.924 A180,180 0 0 1 198.21,0.924 Z",
  32: "M180,180 L162.357,0.867 A180,180 0 0 1 197.643,0.867 Z",
  33: "M180,180 L162.89,0.815 A180,180 0 0 1 197.11,0.815 Z",
  34: "M180,180 L163.392,0.768 A180,180 0 0 1 196.608,0.768 Z",
  35: "M180,180 L163.865,0.725 A180,180 0 0 1 196.135,0.725 Z",
  36: "M180,180 L164.312,0.685 A180,180 0 0 1 195.688,0.685 Z",
  37: "M180,180 L164.735,0.648 A180,180 0 0 1 195.265,0.648 Z",
  38: "M180,180 L165.136,0.615 A180,180 0 0 1 194.864,0.615 Z",
  39: "M180,180 L165.516,0.584 A180,180 0 0 1 194.484,0.584 Z",
  40: "M180,180 L165.877,0.555 A180,180 0 0 1 194.123,0.555 Z",
};

/** Wedge outline for a wheel of `count` slices, clamped to the supported range. */
export function wedgePath(count: number) {
  const safe = Math.min(40, Math.max(2, Math.round(count)));
  return WEDGE_PATHS[safe];
}

/** Where a wedge label sits, measured from the centre before rotation. */
export const WEDGE_LABEL = { x: 180, y: 66.6 } as const;
