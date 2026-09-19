/**
 * Guards against the class of hydration bug that is nearly impossible to see
 * locally: values that differ between the server and the browser by one unit in
 * the last place.
 *
 * Background. The ECMAScript spec requires `+ - * /`, `Math.min/max/abs/round`
 * and friends to be correctly rounded, so Node and every browser produce
 * bit-identical results. `Math.sin`, `cos`, `tan`, `exp`, `log`, `pow` and
 * `hypot` are explicitly implementation-defined, and Node and V8 disagree in
 * the last bits (measured: `Math.sin(2π * 4 / 12)` differed by 1 ulp). When
 * such a number reaches an SVG attribute, React sees two different strings and
 * reports a hydration mismatch it refuses to patch up.
 *
 * Two checks:
 *   1. no transcendental maths in rendered modules unless explicitly allowlisted
 *      with a reason (client-only callbacks that never reach serialized markup);
 *   2. no un-rounded floats in SVG geometry attributes of the prerendered HTML.
 *
 * Run with:  npm run check:determinism   (or `npm run verify`)
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const SRC_DIRS = ["app", "components"];

/** Files allowed to call transcendental maths, with why. */
const TRANSCENDENTAL_ALLOWLIST = new Map([
  [
    "components/layout/smooth-scroll.tsx",
    "Math.pow runs inside Lenis's easing callback in the browser only",
  ],
]);

const TRANSCENDENTAL = /Math\.(sin|cos|tan|asin|acos|atan|atan2|exp|log|log2|log10|pow|hypot|cbrt|sinh|cosh|tanh)\s*\(/g;
const GEOMETRY_ATTR = /\b(d|cx|cy|r|x|y|x1|y1|x2|y2|width|height|points|transform|stroke-width|offset)="([^"]*)"/g;
const LONG_FLOAT = /-?\d+\.\d{11,}/;
const HTML_DIRS = [".next/server/app"];

const failures = [];
const notes = [];

/** Strips comments so documentation about `Math.sin` is not flagged. */
function stripComments(source) {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|[^:])\/\/[^\n]*/g, "$1");
}

function walk(dir, matcher, out = []) {
  let entries = [];
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = join(dir, entry);
    const stats = statSync(full);
    if (stats.isDirectory()) {
      // `.next` is a real directory we need to look inside for the HTML pass.
      if (entry === "node_modules" || (entry.startsWith(".") && entry !== ".next")) continue;
      walk(full, matcher, out);
    } else if (matcher.test(entry)) {
      out.push(full);
    }
  }
  return out;
}

/* ── 1. the interests ring's unit-vector table must match the data ────────── */

const interestsSource = readFileSync(join(ROOT, "data/interests.ts"), "utf8");
const interestCount = [...interestsSource.matchAll(/\bid:\s*\d+/g)].length;
const ringSource = readFileSync(join(ROOT, "components/home/interests.tsx"), "utf8");
const unitBlock = ringSource.match(/const UNIT = \[([\s\S]*?)\] as const;/);
const unitCount = unitBlock ? [...unitBlock[1].matchAll(/\{\s*x:/g)].length : 0;

if (!unitCount) {
  failures.push(
    "components/home/interests.tsx: could not find the UNIT table — it must exist so ring positions avoid trigonometry.",
  );
} else if (unitCount !== interestCount) {
  failures.push(
    `components/home/interests.tsx: UNIT has ${unitCount} vectors but data/interests.ts has ${interestCount} interests. Regenerate with x = sin(i * 2π / n), y = -cos(i * 2π / n).`,
  );
} else {
  notes.push(`interests ring: ${unitCount} unit vectors match ${interestCount} interests in the data`);
}

/* ── 2. transcendental maths in rendered modules ─────────────────────────── */

const sources = SRC_DIRS.flatMap((dir) => walk(join(ROOT, dir), /\.(tsx|ts|jsx|js)$/));

for (const file of sources) {
  const rel = relative(ROOT, file).split("\\").join("/");
  const code = stripComments(readFileSync(file, "utf8"));
  const hits = code.match(TRANSCENDENTAL);
  if (!hits) continue;

  if (!TRANSCENDENTAL_ALLOWLIST.has(rel)) {
    failures.push(
      `${rel}: ${[...new Set(hits)].join(", ")} — transcendental maths is not bit-identical across engines. Pre-compute the value, or add the file to TRANSCENDENTAL_ALLOWLIST with a reason showing it never reaches serialized markup.`,
    );
  } else {
    notes.push(`${rel}: ${hits.length} allowed (${TRANSCENDENTAL_ALLOWLIST.get(rel)})`);
  }
}

/* ── 3. un-rounded floats in prerendered SVG geometry ────────────────────── */

let htmlChecked = 0;
for (const dir of HTML_DIRS) {
  const files = walk(join(ROOT, dir), /\.html$/);
  for (const file of files) {
    const rel = relative(ROOT, file).split("\\").join("/");
    const html = readFileSync(file, "utf8");
    htmlChecked += 1;

    for (const match of html.matchAll(GEOMETRY_ATTR)) {
      const [, attribute, value] = match;
      const long = value.match(LONG_FLOAT);
      if (long) {
        failures.push(
          `${rel}: geometry attribute ${attribute}="${value.slice(0, 60)}" contains an un-rounded float (${long[0]}). Round it or pre-compute it.`,
        );
      }
    }

    // Informational: long floats outside geometry. These are almost always the
    // result of + - * / (which is exactly specified and therefore safe), but
    // they are worth seeing when a layout change introduces new ones.
    const styleFloats = new Set(
      [...html.matchAll(/style="([^"]*)"/g)]
        .flatMap((match) => [...match[1].matchAll(/-?\d+\.\d{11,}/g)].map((hit) => hit[0])),
    );
    if (styleFloats.size) {
      notes.push(
        `${rel}: ${styleFloats.size} high-precision float(s) in inline styles (safe if produced by + - * /): ${[...styleFloats].slice(0, 4).join(", ")}`,
      );
    }
  }
}

/* ── report ──────────────────────────────────────────────────────────────── */

for (const note of notes) console.log(`  · ${note}`);

if (failures.length) {
  console.error(`\n✗ render determinism: ${failures.length} problem(s)`);
  failures.forEach((failure) => console.error(`  · ${failure}`));
  process.exit(1);
}

console.log(
  `✓ render determinism: ${sources.length} modules scanned, ${htmlChecked} prerendered page(s) checked, no engine-dependent geometry`,
);
