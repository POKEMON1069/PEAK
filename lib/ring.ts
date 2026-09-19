/**
 * Rotation geometry, shared by the SkibidiSpin wheel and the interests ring.
 *
 * This module deliberately imports nothing (it inlines its own `wrap`): it is
 * the mathematical core of two interactive features, so it stays runnable by
 * plain Node for the verification script in scripts/verify-wheel-math.ts -- no
 * aliases, no bundler, no test runner.
 *
 * Convention: angles are degrees clockwise from the top, which is where the
 * pointer sits. A division's *centre* is at `index * step`, so division 0 is
 * centred under the pointer when the wheel is unrotated, and every solve lands
 * on a centre rather than an edge.
 */

function wrap(value: number, range: number) {
  return ((value % range) + range) % range;
}

/** Degrees per division on a ring of `count` divisions. */
export function sliceAngle(count: number) {
  return 360 / Math.max(count, 1);
}

/**
 * Which division the pointer is over for a given clockwise rotation.
 *
 * Works for both conventions on this site: a wedge with width (the wheel) and a
 * point on a ring (the interests carousel) — the pointer is over whichever
 * division centre is nearest.
 */
export function indexUnderPointer(rotation: number, count: number) {
  const step = sliceAngle(count);
  return wrap(Math.round(-rotation / step), count);
}

/** The rotation that puts the centre of division `index` under the pointer. */
export function rotationForIndex(index: number, count: number) {
  const step = sliceAngle(count);
  return wrap(-index * step, 360);
}

/**
 * Solves a spin: from the wheel's current rotation, land the centre of division
 * `chosen` under the pointer after at least `turns` complete clockwise turns.
 *
 * Whatever this returns must satisfy `indexUnderPointer(target, count) ===
 * chosen` -- that equivalence is what the verification script checks, and it is
 * why the wheel announces its winner from the final angle rather than from the
 * number it planned.
 */
export function solveSpin({
  from,
  chosen,
  count,
  turns,
}: {
  from: number;
  chosen: number;
  count: number;
  turns: number;
}): { target: number; delta: number } {
  const alignment = rotationForIndex(chosen, count);
  const base = from + 360 * Math.round(turns);
  const target = base + wrap(alignment - base, 360);
  return { target, delta: target - from };
}

/**
 * Shortest signed rotation from `current` to `target`, so an animated ring
 * never takes the long way round. Both angles may be any real number.
 */
export function shortestDelta(current: number, target: number) {
  let delta = wrap(target - current, 360);
  if (delta > 180) delta -= 360;
  return delta;
}
