/**
 * Proves the two claims the interactive pieces make:
 *
 *   1. SkibidiSpin — after a solved spin, the slice the pointer is over is the
 *      slice that was chosen. If this fails, the wheel is lying about its
 *      result, which is the one thing a wheel picker must never do.
 *   2. The interests ring — snapping to an item always lands on that item, and
 *      the snap never travels more than half a turn.
 *
 * Run with:  npm run verify:wheel
 */

import {
  indexUnderPointer,
  rotationForIndex,
  shortestDelta,
  sliceAngle,
  solveSpin,
} from "../lib/ring.ts";

const wrap = (value: number, range: number) => ((value % range) + range) % range;

let checks = 0;
const failures: string[] = [];

function expect(condition: boolean, description: string) {
  checks += 1;
  if (!condition) failures.push(description);
}

/* -------------------------------------------------------------------------- */
/* 1. Every count, every slice, every starting angle                          */
/* -------------------------------------------------------------------------- */

for (let count = 2; count <= 40; count += 1) {
  const step = sliceAngle(count);

  expect(
    Math.abs(step - 360 / count) < 1e-12,
    `sliceAngle(${count}) should be 360/${count}`,
  );

  // Exact landing on every slice from a range of starting rotations.
  const starts = [0, 1, 7.5, 90, 180, 359.9, 720, -123.4, 1440.5, -0.0001];
  for (const from of starts) {
    for (let chosen = 0; chosen < count; chosen += 1) {
      for (const turns of [6, 7, 9]) {
        const { target, delta } = solveSpin({ from, chosen, count, turns });

        expect(
          indexUnderPointer(target, count) === chosen,
          `count=${count} from=${from} chosen=${chosen} turns=${turns}: pointer shows ${indexUnderPointer(target, count)}`,
        );
        expect(delta > 0, `count=${count} from=${from} chosen=${chosen}: delta ${delta} must be forward`);
        expect(
          delta >= turns * 360,
          `count=${count} from=${from} chosen=${chosen}: delta ${delta} < ${turns} turns`,
        );
        expect(
          delta < (turns + 1) * 360 + 1e-9,
          `count=${count} from=${from} chosen=${chosen}: delta ${delta} overshoots`,
        );
        // The landing angle must be the centre of the wedge: a sub-pixel
        // difference must never be able to flip the winner.
        const local = wrap(-target, 360);
        const distanceFromCentre = Math.abs(local - chosen * step);
        expect(
          distanceFromCentre < 1e-9,
          `count=${count} chosen=${chosen}: landed ${distanceFromCentre.toFixed(6)}° from the wedge centre`,
        );
        // …and the pointer must be comfortably inside the wedge, not near an edge.
        expect(
          Math.abs(local - chosen * step) < step / 2 - 1e-9,
          `count=${count} chosen=${chosen}: pointer sits on a wedge boundary`,
        );
      }
    }
  }

  // rotationForIndex and indexUnderPointer must be exact inverses.
  for (let index = 0; index < count; index += 1) {
    expect(
      indexUnderPointer(rotationForIndex(index, count), count) === index,
      `count=${count}: rotationForIndex(${index}) does not round-trip`,
    );
  }

  // At rest the pointer must be centred on slice 0, never on a boundary.
  expect(indexUnderPointer(0, count) === 0, `count=${count}: rest position is not slice 0`);
  // One full turn is a no-op, in either direction.
  expect(indexUnderPointer(360, count) === 0, `count=${count}: 360° should return to slice 0`);
  expect(indexUnderPointer(-360, count) === 0, `count=${count}: -360° should return to slice 0`);
}

/* -------------------------------------------------------------------------- */
/* 2. Randomised spins, as a fuzz layer over the exhaustive cases              */
/* -------------------------------------------------------------------------- */

let random = 987654321;
const nextRandom = () => {
  // Deterministic PRNG so a failure can be reproduced.
  random = (random * 1103515245 + 12345) % 2147483648;
  return random / 2147483648;
};

for (let iteration = 0; iteration < 200_000; iteration += 1) {
  const count = 2 + Math.floor(nextRandom() * 39);
  const from = nextRandom() * 20_000 - 10_000;
  const chosen = Math.floor(nextRandom() * count);
  const turns = 6 + Math.floor(nextRandom() * 4);
  const { target } = solveSpin({ from, chosen, count, turns });
  expect(
    indexUnderPointer(target, count) === chosen,
    `fuzz: count=${count} from=${from} chosen=${chosen} turns=${turns}`,
  );
}

/* -------------------------------------------------------------------------- */
/* 3. Interests ring                                                          */
/* -------------------------------------------------------------------------- */

for (const count of [2, 3, 4, 5, 6, 7, 8, 12, 31]) {
  for (let index = 0; index < count; index += 1) {
    expect(
      indexUnderPointer(rotationForIndex(index, count), count) === index,
      `ring: count=${count} rotationForIndex(${index}) does not round-trip`,
    );
  }

  // Snapping from anywhere must land on the requested item and never unwind.
  for (let sample = 0; sample < 2000; sample += 1) {
    const current = nextRandom() * 4000 - 2000;
    const index = Math.floor(nextRandom() * count);
    const target = rotationForIndex(index, count);
    const delta = shortestDelta(current, target);
    const aligned = current + delta;
    expect(
      indexUnderPointer(aligned, count) === index,
      `ring: count=${count} current=${current} index=${index} landed on ${indexUnderPointer(aligned, count)}`,
    );
    expect(
      Math.abs(delta) <= 180 + 1e-9,
      `ring: count=${count} delta ${delta} is longer than half a turn`,
    );
    expect(
      Math.min(wrap(aligned - target, 360), wrap(target - aligned, 360)) < 1e-9,
      `ring: count=${count} did not land on an equivalent angle`,
    );
  }
}

/* -------------------------------------------------------------------------- */

if (failures.length) {
  console.error(`✗ ${failures.length} of ${checks} checks failed`);
  failures.slice(0, 12).forEach((failure) => console.error(`  · ${failure}`));
  if (failures.length > 12) console.error(`  · …and ${failures.length - 12} more`);
  process.exit(1);
}

console.log(`✓ ${checks.toLocaleString()} geometry checks passed`);
console.log("  · wheel solves land the chosen wedge under the pointer, every count 2–40");
console.log("  · spins always travel forward and stop on the wedge centre, never on an edge");
console.log("  · ring snaps land on the requested item without unwinding");
